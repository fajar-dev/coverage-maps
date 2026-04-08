<template>
  <div class="h-screen w-screen overflow-hidden">
    <div class="relative w-full h-full">
      <div
        v-if="mapLoaded"
        ref="mapContainer"
        :key="mapReloadKey"
        class="absolute inset-0 w-full h-full"
        :class="{ 'cursor-crosshair': isRelocateMode || isMeasureMode }"
      />

      <RelocateNotification v-if="!isStreetViewActive" :is-active="isRelocateMode" />

      <LocationSearchBox
        v-if="!isStreetViewActive"
        v-model:search-query="searchQuery"
        :is-visible="isRelocateMode"
        :suggestions="searchSuggestions"
        :show-suggestions="showSuggestions"
        @search="onSearchInput"
        @clear="clearSearch"
        @select="selectSuggestion"
        @select-coordinate="selectCoordinate"
        @close="isRelocateMode = false; clearSearch()"
      />

      <ControlPanel
        v-if="!isStreetViewActive"
        :is-open="isControlOpen"
        :active-tab="activeTab"
        :radius="pendingRadius"
        :limit="pendingLimit"
        :loading="loading"
        @toggle="isControlOpen = !isControlOpen"
        @update:active-tab="activeTab = $event"
        @update:radius="pendingRadius = $event"
        @update:limit="pendingLimit = $event"
        @reload="hardResetMap"
      />

      <MapControls
        v-if="!isStreetViewActive"
        :is-relocate-mode="isRelocateMode"
        :is-measure-mode="isMeasureMode"
        :is-satellite="isSatellite"
        :total-distance="totalDistance"
        :is-clustering-enabled="isClusteringEnabled"
        @return-to-location="returnToOriginalLocation"
        @toggle-measure="toggleMeasureMode"
        @toggle-relocate="toggleRelocateMode"
        @toggle-satellite="toggleSatellite"
        @toggle-clustering="isClusteringEnabled = !isClusteringEnabled; renderMarkers()"
        @export="handleExportCoverage"
        @coverage-created="hardResetMap(false)"
      >
        <template #slideover>
          <CoverageListSlideover
            :items="filteredCoverageData"
            :filtered-count="filteredCoverageData.length"
            :total-count="coverageData.length"
            :legend-items="legendItems"
            @item-click="focusOnMarkerByItem"
          />
        </template>
      </MapControls>

      <MapLegend
        v-if="!isStreetViewActive"
        :is-visible="showLegend"
        :legend-items="legendItems"
        :visible-types="visibleTypes"
        @close="showLegend = false"
        @update:visible-types="visibleTypes = $event"
      />

      <LoadingOverlay :is-loading="loading || filterLoading" />
    </div>
  </div>
</template>

<script setup>
import { coverageService } from "~/services/coverageService";
import { authService } from "~/services/authService";
import { MarkerClusterer, SuperClusterAlgorithm } from "@googlemaps/markerclusterer";

const colorMode = useColorMode();
const mapContainer = ref(null);
const map = shallowRef(null);
const centerMarker = shallowRef(null);
const markers = shallowRef([]);
const markerCluster = shallowRef(null);
const activeInfoWindow = shallowRef(null);
const activeCircle = shallowRef(null);
const loading = ref(false);
const filterLoading = ref(false);
const isControlOpen = ref(true);
const isRelocateMode = ref(false);
const isMeasureMode = ref(false);
const measurePoints = ref([]);
const measureMarkers = shallowRef([]);
const measurePolyline = shallowRef(null);
const totalDistance = ref("0m");
const isSatellite = ref(false);
const isStreetViewActive = ref(false);
const isClusteringEnabled = ref(true);

const activeTab = ref("radius");

const route = useRoute();
const router = useRouter();

const defaultLat = 3.576378;
const defaultLng = 98.682272;

const initialLat = route.query.lat ? parseFloat(route.query.lat) : defaultLat;
const initialLng = route.query.lng ? parseFloat(route.query.lng) : defaultLng;

const latitude = ref(!isNaN(initialLat) ? initialLat : defaultLat);
const longitude = ref(!isNaN(initialLng) ? initialLng : defaultLng);
const originalLatitude = ref(!isNaN(initialLat) ? initialLat : defaultLat);
const originalLongitude = ref(!isNaN(initialLng) ? initialLng : defaultLng);

watch([latitude, longitude], ([newLat, newLng]) => {
  router.replace({
    query: {
      ...route.query,
      lat: newLat.toFixed(6),
      lng: newLng.toFixed(6),
    },
  });
});

const activeRadius = ref(200);
const activeLimit = ref(10);

const pendingRadius = ref(200);
const pendingLimit = ref(10);

const coverageData = ref([]);
const showLegend = ref(true);
const searchQuery = ref("");
const searchSuggestions = ref([]);
const showSuggestions = ref(false);
const autocompleteService = shallowRef(null);
const placesService = shallowRef(null);

const mapLoaded = ref(false);
const mapReloadKey = ref(0);
const hasLocationBeenSet = ref(!!(route.query.lat && route.query.lng));

const visibleTypes = ref({});
const legendItems = ref([]);
const lastFetchedBounds = ref("");

const lightMapStyles = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

const currentMapStyles = computed(() => {
  return colorMode.value === "dark" ? darkMapStyles : lightMapStyles;
});

watch(
  () => colorMode.value,
  (newMode) => {
    if (map.value && !isSatellite.value) {
      map.value.setOptions({
        styles: newMode === "dark" ? darkMapStyles : lightMapStyles,
      });
    }
  }
);

watch(isStreetViewActive, (isActive) => {
  if (isActive) {
    if (isRelocateMode.value) {
      isRelocateMode.value = false;
      clearSearch();
    }
    if (isMeasureMode.value) {
      isMeasureMode.value = false;
      clearMeasurement();
    }
    if (activeInfoWindow.value) {
      activeInfoWindow.value.close();
    }
  }
});

function toggleSatellite() {
  isSatellite.value = !isSatellite.value;
  
  if (map.value) {
    if (isSatellite.value) {
      map.value.setMapTypeId('satellite');
      map.value.setOptions({ styles: [] });
    } else {
      map.value.setMapTypeId('roadmap');
      map.value.setOptions({ styles: currentMapStyles.value });
    }
  }
}

function calculateZoomLevel() {
  if (activeTab.value === "radius") {
    const radius = activeRadius.value;
    if (radius <= 400) return 18;
    if (radius <= 800) return 17;
    if (radius <= 1500) return 16;
    if (radius <= 2000) return 15;
    return 10;
  } else {
    if (markers.value.length === 0) return 17;

    const center = { lat: latitude.value, lng: longitude.value };
    let maxDistance = 0;

    markers.value.forEach((marker) => {
      const distance = google.maps.geometry.spherical.computeDistanceBetween(
        new google.maps.LatLng(center.lat, center.lng),
        marker.getPosition()
      );
      maxDistance = Math.max(maxDistance, distance);
    });

    if (maxDistance <= 200) return 19;
    if (maxDistance <= 400) return 18;
    if (maxDistance <= 800) return 17;
    if (maxDistance <= 1000) return 16;
    return 12;
  }
}

function adjustZoomToContent() {
  if (!map.value) return;

  const center = { lat: latitude.value, lng: longitude.value };
  const zoomLevel = calculateZoomLevel();

  map.value.setCenter(center);
  map.value.setZoom(zoomLevel);
}

function generateColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash % 360);
  const saturation = 60 + (Math.abs(hash) % 20);
  const lightness = 40 + (Math.abs(hash >> 8) % 20);

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

watch(
  coverageData,
  (newData) => {
    if (newData.length > 0) {
      const uniqueTypes = [...new Set(newData.map((item) => item.type))];

      legendItems.value = uniqueTypes.map((type) => ({
        type,
        label: type,
        color: generateColor(type),
        count: newData.filter((item) => item.type === type).length,
      }));

      const newVisibleTypes = {};
      uniqueTypes.forEach((type) => {
        newVisibleTypes[type] =
          visibleTypes.value[type] !== undefined
            ? visibleTypes.value[type]
            : true;
      });
      visibleTypes.value = newVisibleTypes;
    }
  },
  { immediate: true, deep: true }
);

const filteredCoverageData = computed(() => {
  return coverageData.value.filter((item) => visibleTypes.value[item.type]);
});

let searchTimeout = null;
let mapClickListener = null;

function getMarkerColor(type) {
  const legend = legendItems.value.find((item) => item.type === type);
  return legend ? legend.color : "#9CA3AF";
}

function clearAllMarkers() {
  // Clear the clusterer globally to be absolutely sure
  if (window.markerCluster) {
    try {
      window.markerCluster.clearMarkers();
      if (typeof window.markerCluster.setMap === 'function') {
        window.markerCluster.setMap(null);
      }
    } catch (e) {}
    window.markerCluster = null;
    markerCluster.value = null;
  }

  if (markers.value && markers.value.length > 0) {
    for (const marker of markers.value) {
      if (marker) {
        google.maps.event.clearInstanceListeners(marker);
        marker.setMap(null);
      }
    }
  }

  markers.value = [];

  if (activeInfoWindow.value) {
    try {
      activeInfoWindow.value.close();
    } catch (e) {}
    activeInfoWindow.value = null;
  }
}

  watch(
    visibleTypes,
    () => {
      if (coverageData.value.length === 0 || !map.value) return;
      renderMarkers(false);
    },
    { deep: true }
  );

const isRendering = ref(false);

function renderMarkers(shouldAdjustZoom = false) {
  if (!map.value || isRendering.value) return;
  isRendering.value = true;
  
  try {
    clearAllMarkers();

  if (!Array.isArray(coverageData.value) || coverageData.value.length === 0) return;

  const markersArray = [];

  coverageData.value.forEach((item) => {
    if (!visibleTypes.value[item.type]) return;

    const [lat, lng] = item.coordinate.split(",").map(Number);
    const markerColor = getMarkerColor(item.type);

    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: null,
      title: item.residentName || item.name,
      visible: true,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: markerColor,
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 2,
      },
      optimized: false,
    });

    const infoContent = `
      <div style="padding:12px;font-family:system-ui; max-width:260px; min-width:200px;">
        <div style="font-size:16px;font-weight:600;margin-bottom:6px;color:#000 !important;">
          ${item.name ?? ''}
        </div>
        <div style="font-size:14px;color:#6B7280;margin-bottom:8px;">
          ${item.address || "No Address"}
        </div>
        ${item.customerId ? `<div style="margin-top:4px;font-size:13px;color:#000 !important;"><strong>Customer ID:</strong> ${item.customerId}</div>` : ""}
        ${item.serviceId ? `<div style="margin-top:4px;font-size:13px;color:#000 !important;"><strong>Service ID:</strong> ${item.serviceId}</div>` : ""}
        ${item.homepassId ? `<div style="margin-top:4px;font-size:13px;color:#000 !important;"><strong>Homepass ID:</strong> ${item.homepassId}</div>` : ""}
        ${item.splitterId ? `<div style="margin-top:4px;font-size:13px;color:#000 !important;"><strong>Splitter ID:</strong> ${item.splitterId}</div>` : ""}
        <div style="margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb;">
          <span style="font-size:13px;color:${markerColor};font-weight:600;">${item.type}</span>
          <span style="float:right;font-size:13px;color:#00c951;font-weight:600;">${item.distance.toFixed(0)}m</span>
        </div>
      </div>
    `;

    const infoWindow = new google.maps.InfoWindow({
      content: infoContent,
    });

    marker.addListener("click", () => {
      if (activeInfoWindow.value) {
        activeInfoWindow.value.close();
      }
      infoWindow.open(map.value, marker);
      activeInfoWindow.value = infoWindow;
    });

    markersArray.push(marker);
  });
  
  markers.value = markersArray;

  if (isClusteringEnabled.value && markers.value.length > 0) {
    markerCluster.value = new MarkerClusterer({
      map: map.value,
      markers: markers.value,
      algorithm: new SuperClusterAlgorithm({
        radius: 50,
        maxZoom: 18,
      }),
    });
    window.markerCluster = markerCluster.value;
  } else if (!isClusteringEnabled.value) {
    markers.value.forEach((m) => m.setMap(map.value));
  }

  setTimeout(() => {
    if (shouldAdjustZoom) adjustZoomToContent();
  }, 100);
  
  } finally {
    isRendering.value = false;
  }
}

watch(activeTab, (newTab, oldTab) => {
  if (oldTab !== undefined && map.value && mapLoaded.value) {
    hardResetMap(false);
  }
});

watch(() => authService.user.value, () => {
  fetchCoverage();
});

onMounted(() => {
  hardResetMap(true);
});

onBeforeUnmount(() => {
  if (mapClickListener) google.maps.event.removeListener(mapClickListener);
  if (searchTimeout) clearTimeout(searchTimeout);
  clearMeasurement();
  
  if (activeInfoWindow.value) {
    activeInfoWindow.value.close();
    activeInfoWindow.value = null;
  }
});

async function hardResetMap(isInitialLoad = false) {
  if (loading.value) return;
  
  // Reload button or initial load should trigger zoom adjustment
  const shouldAdjustZoom = true;

  mapLoaded.value = true;
  await nextTick();

  activeRadius.value = pendingRadius.value;
  activeLimit.value = pendingLimit.value;

  lastFetchedBounds.value = "";
  clearAllMarkers();

  if (isInitialLoad && !hasLocationBeenSet.value && navigator.geolocation) {
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 5000,
        });
      });
      latitude.value = pos.coords.latitude;
      longitude.value = pos.coords.longitude;
      originalLatitude.value = pos.coords.latitude;
      originalLongitude.value = pos.coords.longitude;
      hasLocationBeenSet.value = true;
    } catch {
      hasLocationBeenSet.value = true;
    }
  }
  waitForGoogle(shouldAdjustZoom);
  fetchCoverage(true);
}

async function updateMapLocation() {
  hasLocationBeenSet.value = true;
  lastFetchedBounds.value = "";
  clearAllMarkers();
  waitForGoogle(true);
  fetchCoverage(true);
}

function returnToOriginalLocation() {
  latitude.value = originalLatitude.value;
  longitude.value = originalLongitude.value;
  updateMapLocation();
}

function waitForGoogle(shouldAdjustZoom = false) {
  if (window.google?.maps?.places) initMap(shouldAdjustZoom);
  else setTimeout(() => waitForGoogle(shouldAdjustZoom), 200);
}

function initMap(shouldAdjustZoom = false) {
  const center = { lat: latitude.value, lng: longitude.value };

  if (!mapContainer.value) return;

  const dynamicZoom = calculateZoomLevel();

  if (map.value && mapContainer.value.contains(map.value.getDiv())) {
    map.value.setCenter(center);
    map.value.setZoom(dynamicZoom);
    map.value.setMapTypeId(isSatellite.value ? 'satellite' : 'roadmap');
    map.value.setOptions({ styles: isSatellite.value ? [] : currentMapStyles.value });
  } else {
    // If map doesn't exist or container was re-created, initialize it
    map.value = new google.maps.Map(mapContainer.value, {
      center,
      zoom: dynamicZoom,
      mapTypeId: isSatellite.value ? 'satellite' : 'roadmap',
      zoomControl: true,
      fullscreenControl: true,
      mapTypeControl: false,
      streetViewControl: true,
      styles: isSatellite.value ? [] : currentMapStyles.value,
    });
    
    if (window.google?.maps?.places) {
      autocompleteService.value = new google.maps.places.AutocompleteService();
      placesService.value = new google.maps.places.PlacesService(map.value);
    }

    map.value.addListener('idle', () => {
      if (searchTimeout) clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        fetchCoverage(false, true);
      }, 300);
    });

    const streetView = map.value.getStreetView();
    if (streetView) {
      streetView.addListener('visible_changed', () => {
        isStreetViewActive.value = streetView.getVisible();
      });
    }
  }

  map.value.setCenter(center);
  setCenterMarker();

  if (mapClickListener) google.maps.event.removeListener(mapClickListener);
  mapClickListener = map.value.addListener("click", (e) => {
    if (isRelocateMode.value) {
      latitude.value = e.latLng.lat();
      longitude.value = e.latLng.lng();
      map.value.setCenter(e.latLng);
      updateMapLocation();
      isRelocateMode.value = false;
    } else if (isMeasureMode.value) {
      addMeasurePoint(e.latLng);
    } else if (activeInfoWindow.value) {
      activeInfoWindow.value.close();
    }
  });
}

function toggleRelocateMode() {
  isRelocateMode.value = !isRelocateMode.value;
  if (isRelocateMode.value) {
    clearSearch();
    if (isMeasureMode.value) {
      isMeasureMode.value = false;
      clearMeasurement();
    }
  }
}

async function toggleMeasureMode() {
  isMeasureMode.value = !isMeasureMode.value;
  if (isMeasureMode.value) {
    if (isRelocateMode.value) {
      isRelocateMode.value = false;
      clearSearch();
    }
    clearMeasurement();
  } else {
    clearMeasurement();
  }
}

function addMeasurePoint(latLng) {
  if (!isMeasureMode.value) return;

  measurePoints.value.push(latLng);

  const marker = new google.maps.Marker({
    position: latLng,
    map: map.value,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 7,
      fillColor: "#000000",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 1,
    },
    zIndex: 1000,
  });
  const newMarkerArray = [...measureMarkers.value, marker];
  measureMarkers.value = newMarkerArray;

  if (measurePolyline.value) {
    measurePolyline.value.setPath(measurePoints.value);
  } else {
    measurePolyline.value = new google.maps.Polyline({
      path: measurePoints.value,
      geodesic: true,
      strokeColor: "#99a1af",
      strokeOpacity: 1,
      strokeWeight: 1,
      map: map.value,
      icons: [
        {
          icon: {
            path: "M 0,-1 0,1",
            strokeOpacity: 1,
            scale: 3,
          },
          offset: "0",
          repeat: "20px",
        },
      ],
    });
  }

  calculateDistance();
}

function calculateDistance() {
  if (measurePoints.value.length < 2) {
    totalDistance.value = "0m";
    return;
  }

  let distance = 0;
  for (let i = 0; i < measurePoints.value.length - 1; i++) {
    distance += google.maps.geometry.spherical.computeDistanceBetween(
      measurePoints.value[i],
      measurePoints.value[i + 1]
    );
  }

  if (distance >= 1000) {
    totalDistance.value = (distance / 1000).toFixed(2) + "km";
  } else {
    totalDistance.value = Math.round(distance) + "m";
  }
}

function clearMeasurement() {
  if (measurePolyline.value) {
    measurePolyline.value.setMap(null);
    measurePolyline.value = null;
  }

  measurePoints.value = [];

  if (measureMarkers.value && measureMarkers.value.length > 0) {
    measureMarkers.value.forEach((marker) => {
      if (marker && marker.setMap) {
        marker.setMap(null);
      }
    });
  }
  measureMarkers.value = [];

  totalDistance.value = "0m";
}

function onSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout);

  if (!searchQuery.value || searchQuery.value.length < 3) {
    searchSuggestions.value = [];
    showSuggestions.value = false;
    return;
  }

  searchTimeout = setTimeout(searchPlaces, 300);
}

function searchPlaces() {
  if (!autocompleteService.value || !searchQuery.value || !map.value) return;

  const request = {
    input: searchQuery.value,
    componentRestrictions: { country: "id" },
    location: map.value.getCenter(),
    radius: 50000,
  };

  autocompleteService.value.getPlacePredictions(request, (predictions, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
      searchSuggestions.value = predictions;
      showSuggestions.value = true;
    } else {
      searchSuggestions.value = [];
      showSuggestions.value = false;
    }
  });
}

function selectSuggestion(suggestion) {
  showSuggestions.value = false;
  searchQuery.value = suggestion.description;

  if (!placesService.value) return;

  const request = {
    placeId: suggestion.place_id,
    fields: ["geometry"],
  };

  placesService.value.getDetails(request, (place, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && place.geometry) {
      const location = place.geometry.location;
      latitude.value = location.lat();
      longitude.value = location.lng();
      updateMapLocation();
      isRelocateMode.value = false;
    }
  });
}

function selectCoordinate(coords) {
  if (!coords || typeof coords.lat !== "number" || typeof coords.lng !== "number") return;

  latitude.value = coords.lat;
  longitude.value = coords.lng;
  updateMapLocation();
  clearSearch();
  isRelocateMode.value = false;
}

function clearSearch() {
  searchQuery.value = "";
  searchSuggestions.value = [];
  showSuggestions.value = false;
}

function setCenterMarker() {
  const pos = { lat: latitude.value, lng: longitude.value };
  if (centerMarker.value) centerMarker.value.setMap(null);
  
  centerMarker.value = new google.maps.Marker({
    position: pos,
    map: map.value,
    title: "Lokasi Saya",
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 9,
      fillColor: "#00c951",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
    },
    optimized: false,
    zIndex: 1000,
  });
}

async function fetchCoverage(shouldAdjustZoom = false, isIdleUpdate = false) {
  if (loading.value) return;

  // Do not refetch during pan/zoom in Limit mode
  if (isIdleUpdate && activeTab.value === 'limit') return;

  try {
    let boundsParams = {};
    if (map.value && activeTab.value !== 'limit') {
      const bounds = map.value.getBounds();
      if (bounds) {
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        
        // Check if bounds have changed enough to warrant a new fetch
        const boundsKey = `${ne.lat().toFixed(6)},${ne.lng().toFixed(6)},${sw.lat().toFixed(6)},${sw.lng().toFixed(6)}`;
        if (boundsKey === lastFetchedBounds.value) return;
        lastFetchedBounds.value = boundsKey;

        boundsParams = {
          ne_lat: ne.lat(),
          ne_lng: ne.lng(),
          sw_lat: sw.lat(),
          sw_lng: sw.lng(),
        };
      }
    }
    
    loading.value = true;

    const data = await coverageService.getCoverage({
      longitude: longitude.value,
      latitude: latitude.value,
      mode: activeTab.value,
      value: activeTab.value === "radius" ? activeRadius.value : activeLimit.value,
      ...boundsParams,
    });

    clearAllMarkers();
    coverageData.value = [];

    if (Array.isArray(data)) {
      coverageData.value = data;
    } else if (data && Array.isArray(data.data)) {
      coverageData.value = data.data;
    } else if (data && Array.isArray(data.results)) {
      coverageData.value = data.results;
    } else {
      coverageData.value = [];
    }

    if (activeTab.value === "radius") {
      const center = { lat: latitude.value, lng: longitude.value };
      
      // Update existing circle instead of creating a new one to prevent map events
      if (activeCircle.value) {
        activeCircle.value.setCenter(center);
        activeCircle.value.setRadius(activeRadius.value);
        if (!activeCircle.value.getMap()) activeCircle.value.setMap(map.value);
      } else {
        activeCircle.value = new google.maps.Circle({
          strokeColor: "#00c951",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#75EDAE",
          fillOpacity: 0.15,
          map: map.value,
          center,
          radius: activeRadius.value,
          clickable: false,
        });
      }
    } else if (activeCircle.value) {
      activeCircle.value.setMap(null);
    }

    renderMarkers(shouldAdjustZoom);
  } catch (err) {
    coverageData.value = [];
  } finally {
    loading.value = false;
  }
}

async function handleExportCoverage() {
  try {
    const visibleTypesArray = legendItems.value
      .filter((item) => visibleTypes.value[item.type])
      .map((item) => item.type);

    await coverageService.exportCoverage({
      longitude: longitude.value,
      latitude: latitude.value,
      mode: activeTab.value,
      value: activeTab.value === "radius" ? activeRadius.value : activeLimit.value,
      types: visibleTypesArray,
    });
  } catch (error) {
    alert("Export gagal! Silakan coba lagi.");
  }
}

function focusOnMarker(index) {
  const marker = markers.value[index];
  if (marker && map.value) {
    map.value.setCenter(marker.getPosition());
    map.value.setZoom(18);
    google.maps.event.trigger(marker, "click");
  }
}

function focusOnMarkerByItem(item) {
  const index = coverageData.value.findIndex((data) => data.id === item.id);
  if (index !== -1) {
    const matchingMarkerIndex = markers.value.findIndex((marker, idx) => {
      const markerItem = coverageData.value.filter(
        (d) => visibleTypes.value[d.type]
      )[idx];
      return markerItem && markerItem.id === item.id;
    });

    if (matchingMarkerIndex !== -1) {
      focusOnMarker(matchingMarkerIndex);
    }
  }
}
</script>