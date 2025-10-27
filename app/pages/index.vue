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

      <Transition name="fade">
        <div
          v-if="isRelocateMode"
          class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10"
        >
          <UCard
            class="backdrop-blur-xl bg-white/40 text-gray-800 shadow-2xl border border-white/30 transition-all duration-300"
          >
            <div class="flex items-center gap-3 px-4 py-2">
              <UIcon
                name="i-lucide-map-pin"
                class="w-6 h-6 text-primary animate-bounce"
              />
              <div>
                <div class="font-semibold text-sm">
                  Mode Ubah Lokasi Aktif
                </div>
                <div class="opacity-80 text-xs">
                  Klik pada peta atau cari lokasi di form pencarian
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </Transition>
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-4"
      >
        <div
          v-if="isRelocateMode"
          class="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-md px-4"
        >
          <UCard class="backdrop-blur-xl bg-white/95 shadow-2xl">
            <div class="space-y-3">
              <div class="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <UIcon
                  name="i-lucide-search"
                  class="w-4 h-4 text-primary"
                />
                <span>Cari Lokasi</span>
              </div>

              <div class="relative">
                <UInput
                  ref="searchInput"
                  v-model="searchQuery"
                  icon="i-lucide-search"
                  size="md"
                  variant="outline"
                  placeholder="Ketik nama tempat atau alamat..."
                  class="w-full"
                  @input="onSearchInput"
                />
                <UIcon
                  v-if="searchQuery"
                  name="i-lucide-x"
                  class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 cursor-pointer hover:text-gray-600"
                  @click="clearSearch"
                />
              </div>
            </div>
          </UCard>

          <Transition
            enter-active-class="transition-all duration-200"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition-all duration-150"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="showSuggestions && searchSuggestions.length > 0"
              class="absolute mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto z-50 w-100"
            >
              <button
                v-for="(suggestion, idx) in searchSuggestions"
                :key="idx"
                class="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                @click="selectSuggestion(suggestion)"
              >
                <div class="flex items-start gap-3">
                  <UIcon
                    name="i-lucide-map-pin"
                    class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"
                  />
                  <div class="flex-1 min-w-0">
                    <div class="text-xs font-medium text-gray-900 truncate">
                      {{ suggestion.structured_formatting?.main_text || suggestion.description }}
                    </div>
                    <div class="text-xs text-gray-500 truncate">
                      {{ suggestion.structured_formatting?.secondary_text || '' }}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </Transition>
        </div>
      </Transition>

      <div class="absolute top-2 left-2 z-10">
        <UCard class="w-80 backdrop-blur-xl bg-white/95 shadow-xl">
          <template #header>
            <button
              class="w-full flex items-center justify-between gap-2 hover:opacity-80 transition-opacity"
              @click="isControlOpen = !isControlOpen"
            >
              <div class="flex items-center gap-2">
                <img
                  src="https://www.nusa.net.id/kb/favicon.png"
                  alt="Logo"
                  class="w-7 h-7"
                >
                <div class="text-left">
                  <h2 class="text-sm font-semibold">
                    Coverage Map
                  </h2>
                  <p class="text-[10px] text-gray-500">
                    Nusanet Fiber Coverage
                  </p>
                </div>
              </div>
              <UIcon
                :name="isControlOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                class="w-4 h-4 text-gray-400 transition-transform"
              />
            </button>
          </template>

          <Transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <div
              v-show="isControlOpen"
              class="space-y-5"
            >
              <UTabs
                :items="tabs"
                size="xs"
              >
                <template #data>
                  <div class="space-y-2 mt-5">
                    <div class="flex items-center justify-between">
                      <label class="text-sm font-semibold flex items-center gap-2">
                        <UIcon
                          name="i-lucide-layers"
                          class="w-4 h-4 text-green-600"
                        />
                        Maksimal Data
                      </label>
                      <UBadge
                        color="primary"
                        variant="soft"
                        size="sm"
                      >
                        {{ pendingLimit }}
                      </UBadge>
                    </div>

                    <div class="relative pb-6">
                      <USlider
                        v-model="pendingLimit"
                        :min="1"
                        :max="100"
                        :step="1"
                      />
                      <div class="absolute top-6 left-0 right-0 flex justify-between text-[10px] text-gray-500 px-1">
                        <span>1</span><span>25</span><span>50</span><span>75</span><span>100</span>
                      </div>
                    </div>

                    <p class="text-[11px] text-gray-500">
                      Jumlah maksimal titik coverage yang akan ditampilkan
                    </p>
                  </div>
                </template>

                <template #radius>
                  <div class="space-y-2 mt-5">
                    <div class="flex items-center justify-between">
                      <label class="text-sm font-semibold flex items-center gap-2">
                        <UIcon
                          name="i-lucide-circle-dot"
                          class="w-4 h-4 text-primary"
                        />
                        Radius Pencarian
                      </label>
                      <UBadge
                        color="primary"
                        variant="soft"
                        size="sm"
                      >
                        {{ pendingRadius }} m
                      </UBadge>
                    </div>

                    <div class="relative pb-6">
                      <USlider
                        v-model="pendingRadius"
                        :min="1"
                        :max="1000"
                        :step="1"
                      />
                      <div class="absolute top-6 left-0 right-0 flex justify-between text-[10px] text-gray-500 px-1">
                        <span>1m</span><span>250m</span><span>500m</span><span>750m</span><span>1km</span>
                      </div>
                    </div>
                    <p class="text-[11px] text-gray-500">
                      Jarak maksimal dari lokasi saya untuk mencari lokasi coverage
                    </p>
                  </div>
                </template>
              </UTabs>
              <div class="border-t border-gray-200" />

              <UButton
                color="primary"
                size="sm"
                block
                icon="i-lucide-refresh-cw"
                :loading="loading"
                class="font-semibold"
                @click="hardResetMap"
              >
                Muat Ulang
              </UButton>
            </div>
          </Transition>
        </UCard>
      </div>

      <div class="absolute bottom-50 right-3 z-10 flex flex-col gap-3 items-end">
        <UButton
          icon="i-lucide-map-pinned"
          size="xl"
          class="w-12 h-12 flex items-center justify-center bg-white text-gray-600 shadow-md rounded-full hover:bg-gray-100 hover:text-gray-800 transition"
          variant="solid"
          @click="returnToOriginalLocation"
        />

        <div class="flex items-center gap-2">
          <Transition name="fade">
            <div
              v-if="isMeasureMode"
              class="bg-green-500 text-white text-xs font-medium py-1 px-2 rounded-md shadow-md whitespace-nowrap"
            >
              {{ totalDistance }}
            </div>
          </Transition>

          <UButton
            icon="i-lucide-ruler"
            size="xl"
            class="w-12 h-12 flex items-center justify-center shadow-md rounded-full transition"
            :class="isMeasureMode
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-800'"
            variant="solid"
            @click="toggleMeasureMode"
          />
        </div>
      </div>

      <div class="absolute bottom-6 right-15 z-10 flex flex-col gap-2 items-end">
        <div class="flex flex-col gap-2 w-32">
          <UButton
            :color="isRelocateMode ? 'warning' : 'primary'"
            variant="solid"
            size="md"
            :icon="isRelocateMode ? 'i-lucide-x' : 'i-lucide-crosshair'"
            class="shadow"
            @click="toggleRelocateMode"
          >
            {{ isRelocateMode ? 'Batal' : 'Ubah Lokasi' }}
          </UButton>
          <UModal>
            <UButton
              color="primary"
              variant="subtle"
              size="md"
              class="bg-white shadow"
              icon="i-lucide-list"
            >
              Lihat Hasil
            </UButton>

            <template #header>
              <div class="flex items-center gap-3">
                <div class="p-2 bg-primary/10 rounded-lg flex">
                  <UIcon
                    name="i-lucide-map-pin"
                    class="w-7 h-7 text-primary"
                  />
                </div>
                <div class="text-left">
                  <h3 class="text-lg font-semibold">
                    Daftar Lokasi Coverage
                  </h3>
                  <p class="text-sm text-gray-500">
                    Total {{ coverageData.length }} lokasi ditemukan
                  </p>
                </div>
              </div>
            </template>

            <template #body>
              <div class="overflow-y-auto max-h-[calc(70vh-120px)]">
                <div
                  v-if="coverageData.length === 0"
                  class="flex flex-col items-center justify-center py-16 px-6"
                >
                  <div class="p-4 bg-gray-100 rounded-full mb-4">
                    <UIcon
                      name="i-lucide-map-pin-off"
                      class="w-12 h-12 text-gray-400"
                    />
                  </div>
                  <h4 class="text-lg font-semibold text-gray-700 mb-2">
                    Belum Ada Data
                  </h4>
                  <p class="text-sm text-gray-500 text-center max-w-sm">
                    Silakan muat data coverage terlebih dahulu dengan mengklik tombol "Muat Ulang"
                  </p>
                </div>

                <div
                  v-else
                  class="divide-y divide-gray-200"
                >
                  <div
                    v-for="(item, index) in coverageData"
                    :key="index"
                    class="px-2 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
                    @click="focusOnMarker(index)"
                  >
                    <div class="flex items-start gap-4">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h4 class="text-base font-semibold text-gray-900 mb-1">
                              {{ item.residentName }}
                            </h4>
                            <div class="flex items-center gap-2 text-sm text-gray-600">
                              <UIcon
                                name="i-lucide-map-pin"
                                class="w-4 h-4"
                              />
                              <span>{{ item.streetName }} No. {{ item.no }}</span>
                            </div>
                          </div>
                          <UBadge
                            color="primary"
                            variant="soft"
                            size="sm"
                          >
                            {{ item.distance.toFixed(0) }}m
                          </UBadge>
                        </div>

                        <div class="grid grid-cols-2 mt-3">
                          <div class="flex flex-col text-xs">
                            <div class="flex items-center gap-1 mb-1">
                              <UIcon
                                name="i-lucide-home"
                                class="w-3 h-3 text-gray-400"
                              />
                              <span class="text-gray-600">Home Pass ID:</span>
                            </div>
                            <span class="font-semibold text-gray-900">{{ item.id }}</span>
                          </div>
                          <div class="flex flex-col text-xs">
                            <div class="flex items-center gap-1 mb-1">
                              <UIcon
                                name="i-lucide-navigation"
                                class="w-3 h-3 text-gray-400"
                              />
                              <span class="text-gray-600">Koordinat:</span>
                            </div>
                            <span class="text-gray-700">{{ item.homepassedCoordinate }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </UModal>
        </div>
      </div>

      <div
        v-if="showLegend"
        class="absolute bottom-2 left-2 z-10"
      >
        <div class="relative p-4 rounded-xl backdrop-blur-xl bg-white/95 shadow-xl">
          <button
            class="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700"
            @click="showLegend = false"
          >
            <UIcon
              name="i-lucide-x"
              class="w-4 h-4"
            />
          </button>
          <div class="flex items-center gap-2 mb-2">
            <UIcon
              name="i-lucide-info"
              class="w-4 h-4 text-primary"
            />
            <span class="text-xs font-semibold">Legenda</span>
          </div>
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span class="text-[11px]">Lokasi Saya</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full bg-primary-500" />
              <span class="text-[11px]">Lokasi Coverage</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full border-2 border-blue-500 bg-blue-500/20" />
              <span class="text-[11px]">Radius</span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="loading"
        class="absolute inset-0 bg-black/20 backdrop-blur-sm z-20 flex items-center justify-center"
      >
        <div class="flex items-center gap-3 px-3 py-1">
          <UIcon
            name="i-lucide-loader-2"
            class="w-5 h-5 animate-spin text-primary"
          />
          <span class="text-sm font-medium text-gray-700">Memuat data coverage...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { getCoverage } from '~/services/coverageService'

const config = useRuntimeConfig()
const mapContainer = ref(null)
const map = ref(null)
const centerMarker = ref(null)
const markers = ref([])
const activeInfoWindow = ref(null)
const activeCircle = ref(null)
const loading = ref(false)
const isControlOpen = ref(true)
const isRelocateMode = ref(false)
const isMeasureMode = ref(false)
const measurePoints = ref([])
const measureMarkers = ref([])
const measurePolyline = ref(null)
const totalDistance = ref('0m')

const tabs = [
  { label: 'Maksimal Data', icon: 'i-lucide-layers', slot: 'data' },
  { label: 'Radius Pencarian', icon: 'i-lucide-circle-dot', slot: 'radius' }
]

const latitude = ref(3.576378)
const longitude = ref(98.682272)
const originalLatitude = ref(3.576378)
const originalLongitude = ref(98.682272)

const activeRadius = ref(500)
const activeLimit = ref(10)

const pendingRadius = ref(500)
const pendingLimit = ref(10)

const coverageData = ref([])
const showLegend = ref(true)
const searchQuery = ref('')
const searchSuggestions = ref([])
const showSuggestions = ref(false)
const autocompleteService = ref(null)
const placesService = ref(null)

const mapLoaded = ref(false)
const mapReloadKey = ref(0)
const hasLocationBeenSet = ref(false)

let searchTimeout = null
let mapClickListener = null

onMounted(() => hardResetMap(true))
onBeforeUnmount(() => {
  if (mapClickListener) google.maps.event.removeListener(mapClickListener)
  if (searchTimeout) clearTimeout(searchTimeout)
  clearMeasurement()
})

async function hardResetMap(isInitialLoad = false) {
  if (loading.value) return

  activeRadius.value = pendingRadius.value
  activeLimit.value = pendingLimit.value

  mapLoaded.value = false
  mapReloadKey.value++

  await nextTick()
  mapLoaded.value = true
  await nextTick()

  if (isInitialLoad && !hasLocationBeenSet.value && navigator.geolocation) {
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      })
      latitude.value = pos.coords.latitude
      longitude.value = pos.coords.longitude
      originalLatitude.value = pos.coords.latitude
      originalLongitude.value = pos.coords.longitude
      hasLocationBeenSet.value = true
    } catch {
      hasLocationBeenSet.value = true
    }
  }
  waitForGoogle()
}

async function updateMapLocation() {
  hasLocationBeenSet.value = true

  mapLoaded.value = false
  mapReloadKey.value++
  await nextTick()
  mapLoaded.value = true
  await nextTick()
  waitForGoogle()
}

function returnToOriginalLocation() {
  latitude.value = originalLatitude.value
  longitude.value = originalLongitude.value
  updateMapLocation()
}

function waitForGoogle() {
  if (window.google?.maps?.places) initMap()
  else setTimeout(waitForGoogle, 200)
}

function initMap() {
  const center = { lat: latitude.value, lng: longitude.value }

  if (!mapContainer.value) return

  map.value = new google.maps.Map(mapContainer.value, {
    center,
    zoom: 16,
    mapTypeId: 'roadmap',
    zoomControl: true,
    fullscreenControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    styles: [
      { featureType: 'poi', stylers: [{ visibility: 'off' }] },
      { featureType: 'transit', stylers: [{ visibility: 'off' }] }
    ]
  })

  if (window.google?.maps?.places) {
    autocompleteService.value = new google.maps.places.AutocompleteService()
    placesService.value = new google.maps.places.PlacesService(map.value)
  }

  map.value.setCenter(center)
  setCenterMarker()
  fetchCoverage()

  if (mapClickListener) google.maps.event.removeListener(mapClickListener)
  mapClickListener = map.value.addListener('click', (e) => {
    if (isRelocateMode.value) {
      latitude.value = e.latLng.lat()
      longitude.value = e.latLng.lng()
      map.value.setCenter(e.latLng)

      updateMapLocation()

      isRelocateMode.value = false
    } else if (isMeasureMode.value) {
      addMeasurePoint(e.latLng)
    } else if (activeInfoWindow.value) {
      activeInfoWindow.value.close()
    }
  })
}

function toggleRelocateMode() {
  isRelocateMode.value = !isRelocateMode.value
  if (isRelocateMode.value) {
    clearSearch()
    if (isMeasureMode.value) {
      isMeasureMode.value = false
      clearMeasurement()
    }
  }
}

async function toggleMeasureMode() {
  isMeasureMode.value = !isMeasureMode.value
  if (isMeasureMode.value) {
    if (isRelocateMode.value) {
      isRelocateMode.value = false
      clearSearch()
    }
    clearMeasurement()
  } else {
    clearMeasurement()
    await updateMapLocation()
  }
}

function addMeasurePoint(latLng) {
  if (!isMeasureMode.value) return

  measurePoints.value.push(latLng)

  const marker = new google.maps.Marker({
    position: latLng,
    map: map.value,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: '#000000',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2
    },
    zIndex: 1000
  })
  measureMarkers.value.push(marker)

  if (measurePolyline.value) {
    measurePolyline.value.setPath(measurePoints.value)
  } else {
    measurePolyline.value = new google.maps.Polyline({
      path: measurePoints.value,
      geodesic: true,
      strokeColor: '#FF6B35',
      strokeOpacity: 1,
      strokeWeight: 3,
      map: map.value,
      icons: [{
        icon: {
          path: 'M 0,-1 0,1',
          strokeOpacity: 1,
          scale: 3
        },
        offset: '0',
        repeat: '20px'
      }]
    })
  }

  calculateDistance()
}

function calculateDistance() {
  if (measurePoints.value.length < 2) {
    totalDistance.value = '0m'
    return
  }

  let distance = 0
  for (let i = 0; i < measurePoints.value.length - 1; i++) {
    distance += google.maps.geometry.spherical.computeDistanceBetween(
      measurePoints.value[i],
      measurePoints.value[i + 1]
    )
  }

  if (distance >= 1000) {
    totalDistance.value = (distance / 1000).toFixed(2) + 'km'
  } else {
    totalDistance.value = Math.round(distance) + 'm'
  }
}

function clearMeasurement() {
  if (measurePolyline.value) {
    measurePolyline.value.setMap(null)
    measurePolyline.value = null
  }

  measurePoints.value = []

  if (measureMarkers.value && measureMarkers.value.length > 0) {
    measureMarkers.value.forEach((marker) => {
      if (marker && marker.setMap) {
        marker.setMap(null)
      }
    })
  }
  measureMarkers.value = []

  totalDistance.value = '0m'
}

function onSearchInput() {
  if (searchTimeout) clearTimeout(searchTimeout)

  if (!searchQuery.value || searchQuery.value.length < 3) {
    searchSuggestions.value = []
    showSuggestions.value = false
    return
  }

  searchTimeout = setTimeout(searchPlaces, 300)
}

function searchPlaces() {
  if (!autocompleteService.value || !searchQuery.value || !map.value) return

  const request = {
    input: searchQuery.value,
    componentRestrictions: { country: 'id' },
    location: map.value.getCenter(),
    radius: 50000
  }

  autocompleteService.value.getPlacePredictions(request, (predictions, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
      searchSuggestions.value = predictions
      showSuggestions.value = true
    } else {
      searchSuggestions.value = []
      showSuggestions.value = false
    }
  })
}

function selectSuggestion(suggestion) {
  showSuggestions.value = false
  searchQuery.value = suggestion.description

  if (!placesService.value) return

  const request = {
    placeId: suggestion.place_id,
    fields: ['geometry']
  }

  placesService.value.getDetails(request, (place, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && place.geometry) {
      const location = place.geometry.location
      latitude.value = location.lat()
      longitude.value = location.lng()

      updateMapLocation()

      isRelocateMode.value = false
    }
  })
}

function clearSearch() {
  searchQuery.value = ''
  searchSuggestions.value = []
  showSuggestions.value = false
}

function setCenterMarker() {
  const pos = { lat: latitude.value, lng: longitude.value }
  if (centerMarker.value) centerMarker.value.setMap(null)
  centerMarker.value = new google.maps.Marker({
    position: pos,
    map: map.value,
    title: 'Lokasi Saya',
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 12,
      fillColor: '#00c951',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 3
    }
  })
}

async function fetchCoverage() {
  if (loading.value) return
  loading.value = true
  try {
    if (activeCircle.value) activeCircle.value.setMap(null)
    markers.value.forEach(m => m.setMap(null))
    activeInfoWindow.value = null
    activeCircle.value = null
    markers.value = []
    coverageData.value = []

    const response = await getCoverage(config.public.apiUrl, {
      longitude: longitude.value,
      latitude: latitude.value,
      radius: activeRadius.value,
      limit: activeLimit.value
    })

    if (!response?.success || !response.data) {
      return
    }

    coverageData.value = response.data

    const center = { lat: latitude.value, lng: longitude.value }
    activeCircle.value = new google.maps.Circle({
      strokeColor: '#00c951',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#75EDAE',
      fillOpacity: 0.15,
      map: map.value,
      center,
      radius: activeRadius.value,
      clickable: false
    })

    response.data.forEach((item) => {
      const [lat, lng] = item.homepassedCoordinate.split(',').map(Number)
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: map.value,
        title: item.residentName,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 12,
          fillColor: '#f37336',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2
        }
      })

      const info = new google.maps.InfoWindow({
        content: `
          <div style="padding:10px;font-family:system-ui">
          <div style="font-size:15px;font-weight:600;margin-bottom:4px">${item.residentName}</div>
          <div style="font-size:13px;color:#6B7280">${item.streetName} No. ${item.no}</div>
          <div style="margin-top:6px;font-size:12px;color:#374151">
          ID: <strong>${item.id}</strong> |
          Jarak: <strong style="color:#00c951">${item.distance.toFixed(0)}m</strong>
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
  } catch {
    coverageData.value = []
  } finally {
    loading.value = false
  }
}

function focusOnMarker(index) {
  const marker = markers.value[index]
  if (marker && map.value) {
    map.value.setCenter(marker.getPosition())
    map.value.setZoom(18)
    google.maps.event.trigger(marker, 'click')
  }
}
</script>
