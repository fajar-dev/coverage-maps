import { ref, shallowRef } from 'vue';
import { MarkerClusterer, SuperClusterAlgorithm } from "@googlemaps/markerclusterer";

export function useMapMarkers(mapRef: any, isClusteringEnabled: any, legendItems: any) {
  const markers = shallowRef<any[]>([]);
  const markerCluster = shallowRef<any>(null);
  const activeInfoWindow = shallowRef<any>(null);
  const isRendering = ref(false);

  function getMarkerColor(type: string) {
    const legend = legendItems.value.find((item: any) => item.type === type);
    return legend ? legend.color : "#9CA3AF";
  }

  function clearAllMarkers() {
    // Clear the clusterer globally to be absolutely sure
    const mCluster = (window as any).markerCluster || markerCluster.value;
    if (mCluster) {
      try {
        mCluster.clearMarkers();
        if (typeof mCluster.setMap === 'function') {
          mCluster.setMap(null);
        }
      } catch (e) {}
      (window as any).markerCluster = null;
      markerCluster.value = null;
    }

    if (markers.value && markers.value.length > 0) {
      const google = (window as any).google;
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

  function renderMarkers(coverageData: any[], visibleTypes: any, shouldAdjustZoom: boolean, adjustZoomCallback: () => void) {
    if (!mapRef.value || isRendering.value) return;
    isRendering.value = true;
    
    try {
      clearAllMarkers();

      if (!Array.isArray(coverageData) || coverageData.length === 0) return;

      const markersArray: any[] = [];
      const google = (window as any).google;

      coverageData.forEach((item) => {
        if (!visibleTypes[item.type]) return;

        const coords = item.coordinate.split(",");
        const lat = Number(coords[0]);
        const lng = Number(coords[1]);
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
          optimized: true,
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
          infoWindow.open(mapRef.value, marker);
          activeInfoWindow.value = infoWindow;
        });

        markersArray.push(marker);
      });
      
      markers.value = markersArray;

      if (isClusteringEnabled.value && markers.value.length > 0) {
        markerCluster.value = new MarkerClusterer({
          map: mapRef.value,
          markers: markers.value,
          algorithm: new SuperClusterAlgorithm({
            radius: 50,
            maxZoom: 18,
          }),
        });
        (window as any).markerCluster = markerCluster.value;
      } else if (!isClusteringEnabled.value) {
        markers.value.forEach((m) => m.setMap(mapRef.value));
      }

      setTimeout(() => {
        if (shouldAdjustZoom) adjustZoomCallback();
      }, 100);
    
    } finally {
      isRendering.value = false;
    }
  }

  function destroy() {
    clearAllMarkers();
  }

  return {
    markers,
    activeInfoWindow,
    clearAllMarkers,
    renderMarkers,
    destroy
  };
}
