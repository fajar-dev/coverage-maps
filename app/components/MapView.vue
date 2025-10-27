<template>
  <div
    ref="mapContainer"
    class="absolute inset-0 w-full h-full"
  />
</template>

<script setup>
import { getCoverage } from '~/services/coverageService'

const props = defineProps({
  latitude: Number,
  longitude: Number,
  radius: Number,
  limit: Number,
  isRelocateMode: Boolean
})

const emits = defineEmits(['update:coverageData'])
const config = useRuntimeConfig()
const mapContainer = ref(null)
const map = ref(null)
const centerMarker = ref(null)
const markers = ref([])
const activeInfoWindow = ref(null)
const activeCircle = ref(null)

onMounted(() => waitForGoogle())

function waitForGoogle() {
  if (window.google?.maps) initMap()
  else setTimeout(waitForGoogle, 200)
}

function initMap() {
  map.value = new google.maps.Map(mapContainer.value, {
    center: { lat: props.latitude, lng: props.longitude },
    zoom: 16,
    mapTypeId: 'roadmap',
    mapTypeControl: false,
    streetViewControl: false,
    styles: [
      { featureType: 'poi', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', stylers: [{ visibility: 'off' }] }
    ]
  })
  setCenterMarker()
  fetchCoverage()
}

function setCenterMarker() {
  if (centerMarker.value) centerMarker.value.setMap(null)
  centerMarker.value = new google.maps.Marker({
    position: { lat: props.latitude, lng: props.longitude },
    map: map.value,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 12,
      fillColor: '#3B82F6',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 3
    }
  })
}

async function fetchCoverage() {
  const response = await getCoverage(config.public.apiUrl, {
    longitude: props.longitude,
    latitude: props.latitude,
    radius: props.radius,
    limit: props.limit
  })

  markers.value.forEach(m => m.setMap(null))
  markers.value = []
  if (activeCircle.value) activeCircle.value.setMap(null)

  if (!response?.success) {
    emits('update:coverageData', [])
    return
  }

  const data = response.data
  emits('update:coverageData', data)

  activeCircle.value = new google.maps.Circle({
    strokeColor: '#3B82F6',
    strokeWeight: 2,
    fillColor: '#3B82F6',
    fillOpacity: 0.15,
    map: map.value,
    center: { lat: props.latitude, lng: props.longitude },
    radius: props.radius
  })

  data.forEach((item, index) => {
    const [lat, lng] = item.homepassedCoordinate.split(',').map(Number)
    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: map.value,
      label: {
        text: (index + 1).toString(),
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold'
      },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#00c951',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 2
      }
    })

    const info = new google.maps.InfoWindow({
      content: `
        <div style="padding:10px;font-family:system-ui">
          <div style="font-size:15px;font-weight:600;margin-bottom:4px">#${index + 1} - ${item.residentName}</div>
          <div style="font-size:13px;color:#6B7280">${item.streetName} No. ${item.no}</div>
          <div style="margin-top:6px;font-size:12px;color:#374151">
            ID: <strong>${item.id}</strong> |
            Jarak: <strong style="color:#00c951">${item.distance.toFixed(0)}m</strong>
          </div>
        </div>
      `
    })
    marker.addListener('click', () => {
      if (activeInfoWindow.value) activeInfoWindow.value.close()
      info.open(map.value, marker)
      activeInfoWindow.value = info
    })
    markers.value.push(marker)
  })
}

function setCenter(lat, lng) {
  map.value.setCenter({ lat, lng })
  setCenterMarker()
}

function focusOnMarker(index) {
  const marker = markers.value[index]
  if (marker) {
    map.value.setCenter(marker.getPosition())
    map.value.setZoom(18)
    google.maps.event.trigger(marker, 'click')
  }
}

defineExpose({ fetchCoverage, setCenter, focusOnMarker })
</script>
