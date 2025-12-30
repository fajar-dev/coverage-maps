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
        @return-to-location="returnToOriginalLocation"
        @toggle-measure="toggleMeasureMode"
        @toggle-relocate="toggleRelocateMode"
        @toggle-satellite="toggleSatellite"
        @export="handleExportCoverage"
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

const config = useRuntimeConfig();
const colorMode = useColorMode();
const mapContainer = ref(null);
const map = ref(null);
const centerMarker = ref(null);
const markers = ref([]);
const activeInfoWindow = ref(null);
const activeCircle = ref(null);
const loading = ref(false);
const filterLoading = ref(false);
const isControlOpen = ref(true);
const isRelocateMode = ref(false);
const isMeasureMode = ref(false);
const measurePoints = ref([]);
const measureMarkers = ref([]);
const measurePolyline = ref(null);
const totalDistance = ref("0m");
const isSatellite = ref(false);
const isStreetViewActive = ref(false);

const activeTab = ref("radius");

const latitude = ref(3.576378);
const longitude = ref(98.682272);
const originalLatitude = ref(3.576378);
const originalLongitude = ref(98.682272);

const activeRadius = ref(200);
const activeLimit = ref(10);

const pendingRadius = ref(200);
const pendingLimit = ref(10);

const coverageData = ref([]);
const showLegend = ref(true);
const searchQuery = ref("");
const searchSuggestions = ref([]);
const showSuggestions = ref(false);
const autocompleteService = ref(null);
const placesService = ref(null);

const mapLoaded = ref(false);
const mapReloadKey = ref(0);
const hasLocationBeenSet = ref(false);

const visibleTypes = ref({});
const legendItems = ref([]);

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
  if (markers.value && markers.value.length > 0) {
    markers.value.forEach((marker) => {
      if (marker) {
        google.maps.event.clearInstanceListeners(marker);
        marker.setVisible(false);
        marker.setMap(null);
      }
    });
  }

  markers.value = [];

  if (activeInfoWindow.value) {
    activeInfoWindow.value.close();
    activeInfoWindow.value.setMap(null);
    activeInfoWindow.value = null;
  }
}

watch(
  visibleTypes,
  async () => {
    if (coverageData.value.length === 0 || !map.value) return;
    filterLoading.value = true;
    clearAllMarkers();
    await new Promise((resolve) => setTimeout(resolve, 300));
    renderMarkers();
    await new Promise((resolve) => setTimeout(resolve, 200));
    filterLoading.value = false;
  },
  { deep: true }
);

function renderMarkers() {
  if (!map.value) return;
  clearAllMarkers();
  clearMeasurement();

  if (!Array.isArray(coverageData.value) || coverageData.value.length === 0) return;

  coverageData.value.forEach((item) => {
    if (!visibleTypes.value[item.type]) return;

    const [lat, lng] = item.coordinate.split(",").map(Number);
    const markerColor = getMarkerColor(item.type);

    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: map.value,
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
          ${item.name ?? "No Name"}
        </div>
        <div style="font-size:14px;color:#6B7280;margin-bottom:8px;">
          ${item.address || "No Address"}
        </div>
        ${item.customerId ? `<div style="margin-top:4px;font-size:13px;color:#000 !important;"><strong>ID:</strong> ${item.customerId}</div>` : ""}
        ${item.serviceId ? `<div style="margin-top:4px;font-size:13px;color:#000 !important;"><strong>Service:</strong> ${item.serviceId}</div>` : ""}
        ${item.homepassId ? `<div style="margin-top:4px;font-size:13px;color:#000 !important;"><strong>Homepass:</strong> ${item.homepassId}</div>` : ""}
        ${item.splitterId ? `<div style="margin-top:4px;font-size:13px;color:#000 !important;"><strong>Splitter:</strong> ${item.splitterId}</div>` : ""}
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

    markers.value.push(marker);
  });

  setTimeout(() => {
    adjustZoomToContent();
  }, 100);
}

watch(activeTab, (newTab, oldTab) => {
  if (oldTab !== undefined && map.value && mapLoaded.value) {
    hardResetMap(false);
  }
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

  activeRadius.value = pendingRadius.value;
  activeLimit.value = pendingLimit.value;

  mapLoaded.value = false;
  mapReloadKey.value++;

  await nextTick();
  mapLoaded.value = true;
  await nextTick();

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
  waitForGoogle();
}

async function updateMapLocation() {
  hasLocationBeenSet.value = true;

  mapLoaded.value = false;
  mapReloadKey.value++;
  await nextTick();
  mapLoaded.value = true;
  await nextTick();
  waitForGoogle();
}

function returnToOriginalLocation() {
  latitude.value = originalLatitude.value;
  longitude.value = originalLongitude.value;
  updateMapLocation();
}

function waitForGoogle() {
  if (window.google?.maps?.places) initMap();
  else setTimeout(waitForGoogle, 200);
}

function initMap() {
  const center = { lat: latitude.value, lng: longitude.value };

  if (!mapContainer.value) return;

  const dynamicZoom = calculateZoomLevel();

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

  map.value.setCenter(center);
  setCenterMarker();
  fetchCoverage();

  const streetView = map.value.getStreetView();
  if (streetView) {
    streetView.addListener('visible_changed', () => {
      isStreetViewActive.value = streetView.getVisible();
    });
  }

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
    await updateMapLocation();
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
  measureMarkers.value.push(marker);

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

async function fetchCoverage() {
  if (loading.value) return;
  loading.value = true;

  try {
    if (activeCircle.value) {
      activeCircle.value.setMap(null);
      activeCircle.value = null;
    }

    clearAllMarkers();
    coverageData.value = [];

    const data = await coverageService.getCoverage({
      longitude: longitude.value,
      latitude: latitude.value,
      mode: activeTab.value,
      value: activeTab.value === "radius" ? activeRadius.value : activeLimit.value,
    });

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

    renderMarkers();
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