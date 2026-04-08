import { ref, shallowRef } from 'vue';

export function useMapMeasure(mapRef: any) {
  const isMeasureMode = ref(false);
  const measurePoints = ref<any[]>([]);
  const measureMarkers = shallowRef<any[]>([]);
  const measurePolyline = shallowRef<any>(null);
  const totalDistance = ref("0m");

  function calculateDistance() {
    if (measurePoints.value.length < 2) {
      totalDistance.value = "0m";
      return;
    }

    if (!(window as any).google) return;

    let distance = 0;
    for (let i = 0; i < measurePoints.value.length - 1; i++) {
      distance += (window as any).google.maps.geometry.spherical.computeDistanceBetween(
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

  function addMeasurePoint(latLng: any) {
    if (!isMeasureMode.value) return;
    if (!(window as any).google) return;

    measurePoints.value.push(latLng);

    const marker = new (window as any).google.maps.Marker({
      position: latLng,
      map: mapRef.value,
      icon: {
        path: (window as any).google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: "#000000",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 1,
      },
      zIndex: 1000,
    });
    
    measureMarkers.value = [...measureMarkers.value, marker];

    if (measurePolyline.value) {
      measurePolyline.value.setPath(measurePoints.value);
    } else {
      measurePolyline.value = new (window as any).google.maps.Polyline({
        path: measurePoints.value,
        geodesic: true,
        strokeColor: "#99a1af",
        strokeOpacity: 1,
        strokeWeight: 1,
        map: mapRef.value,
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

  function clearMeasurement() {
    if (measurePolyline.value) {
      measurePolyline.value.setMap(null);
      measurePolyline.value = null;
    }

    measurePoints.value = [];

    if (measureMarkers.value && measureMarkers.value.length > 0) {
      measureMarkers.value.forEach((marker: any) => {
        if (marker && marker.setMap) {
          marker.setMap(null);
        }
      });
    }
    measureMarkers.value = [];
    totalDistance.value = "0m";
  }

  return {
    isMeasureMode,
    measurePoints,
    measureMarkers,
    measurePolyline,
    totalDistance,
    addMeasurePoint,
    clearMeasurement,
  };
}
