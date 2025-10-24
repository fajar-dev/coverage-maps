//pages/index.vue
<template>
  <div class="h-screen w-screen overflow-hidden">
    <div class="relative w-full h-full">
      <!-- Map Container -->
      <div
        ref="mapContainer"
        class="absolute inset-0 w-full h-full"
        :class="{ 'cursor-crosshair': isRelocateMode }"
      />

      <!-- Relocate Mode Indicator -->
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
                <div class="font-semibold">
                  Mode Pilih Lokasi Aktif
                </div>
                <div class="text-sm opacity-80">
                  Klik pada peta untuk memilih lokasi baru
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </Transition>

      <!-- Floating Control Panel -->
      <div class="absolute top-2 left-2 z-10">
        <UCard class="w-72 backdrop-blur-xl bg-white/95 shadow-xl">
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
                    Fiberstar home pass coverage
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
              class="space-y-4"
            >
              <!-- Radius Slider -->
              <div class="space-y-2">
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
                    {{ radius }} m
                  </UBadge>
                </div>

                <div
                  class="relative pb-6"
                  @mousedown="isRadiusDragging = true"
                  @mouseup="isRadiusDragging = false"
                  @mouseleave="isRadiusDragging = false"
                >
                  <USlider
                    v-model="radius"
                    :min="1"
                    :max="1000"
                    :step="1"
                  />
                  <Transition name="fade">
                    <div
                      v-if="isRadiusDragging"
                      class="absolute -top-10 transform -translate-x-1/2 bg-primary text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-lg pointer-events-none"
                      :style="{ left: `${(radius - 1) / 999 * 100}%` }"
                    >
                      {{ radius }}m
                      <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-primary" />
                    </div>
                  </Transition>
                  <div class="absolute top-6 left-0 right-0 flex justify-between text-[10px] text-gray-500 px-1">
                    <span>1m</span><span>250m</span><span>500m</span><span>750m</span><span>1km</span>
                  </div>
                </div>
                <p class="text-[11px] text-gray-500">
                  Jarak maksimal dari lokasi saya untuk mencari lokasi coverage
                </p>
              </div>

              <div class="border-t border-gray-200" />

              <!-- Limit Slider -->
              <div class="space-y-2">
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
                    {{ limit }}
                  </UBadge>
                </div>

                <div
                  class="relative pb-6"
                  @mousedown="isLimitDragging = true"
                  @mouseup="isLimitDragging = false"
                  @mouseleave="isLimitDragging = false"
                >
                  <USlider
                    v-model="limit"
                    :min="1"
                    :max="100"
                    :step="1"
                  />
                  <Transition name="fade">
                    <div
                      v-if="isLimitDragging"
                      class="absolute -top-10 transform -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-semibold shadow-lg pointer-events-none"
                      :style="{ left: `${(limit - 1) / 99 * 100}%` }"
                    >
                      {{ limit }}
                      <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-green-600" />
                    </div>
                  </Transition>
                  <div class="absolute top-6 left-0 right-0 flex justify-between text-[10px] text-gray-500 px-1">
                    <span>1</span><span>25</span><span>50</span><span>75</span><span>100</span>
                  </div>
                </div>

                <p class="text-[11px] text-gray-500">
                  Jumlah maksimal titik coverage yang akan ditampilkan
                </p>
              </div>

              <div class="border-t border-gray-200" />

              <UButton
                color="primary"
                size="sm"
                block
                icon="i-lucide-refresh-cw"
                :loading="loading"
                class="font-semibold"
                @click="fetchCoverage"
              >
                Muat Ulang
              </UButton>
            </div>
          </Transition>
        </UCard>
      </div>

      <!-- Relocate Button -->
      <div class="absolute bottom-6 right-15 z-10 flex flex-col gap-2 items-end">
        <div class="flex flex-col gap-2 w-32">
          <UButton
            :color="isRelocateMode ? 'warning' : 'primary'"
            variant="solid"
            size="md"
            :icon="isRelocateMode ? 'i-lucide-x' : 'i-lucide-crosshair'"
            @click="toggleRelocateMode"
          >
            {{ isRelocateMode ? 'Batal' : 'Pilih Lokasi' }}
          </UButton>
          <UModal>
            <UButton
              color="primary"
              variant="subtle"
              size="md"
              class="bg-white"
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
                <!-- Empty State -->
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

                <!-- Data Table -->
                <div
                  v-else
                  class="divide-y divide-gray-200"
                >
                  <div
                    v-for="(item, index) in coverageData"
                    :key="index"
                    class="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
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

      <!-- Legend Card -->
      <div class="absolute bottom-2 left-2 z-10">
        <UCard class="backdrop-blur-xl bg-white/95 shadow-xl">
          <div class="flex items-center gap-2 mb-3">
            <UIcon
              name="i-lucide-info"
              class="w-4 h-4 text-primary"
            />
            <span class="text-xs font-semibold">Legenda</span>
          </div>
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-blue-500" />
              <span class="text-[11px]">Lokasi Saya</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-red-500" />
              <span class="text-[11px]">Lokasi Coverage</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full border-2 border-blue-500 bg-blue-500/20" />
              <span class="text-[11px]">Radius</span>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Loading Overlay -->
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
const mapContainer = ref(null)
const map = ref(null)
const centerMarker = ref(null)
const markers = ref([])
const activeInfoWindow = ref(null)
const activeCircle = ref(null)
const loading = ref(false)
const isControlOpen = ref(true)
const isRelocateMode = ref(false)
const isRadiusDragging = ref(false)
const isLimitDragging = ref(false)
const latitude = ref(3.576378)
const longitude = ref(98.682272)
const radius = ref(500)
const limit = ref(10)
const coverageData = ref([])
let mapClickListener = null

onMounted(() => waitForGoogle())
onBeforeUnmount(() => {
  if (mapClickListener) google.maps.event.removeListener(mapClickListener)
})

function waitForGoogle() {
  if (window.google?.maps) initMap()
  else setTimeout(waitForGoogle, 200)
}

function initMap() {
  const center = { lat: latitude.value, lng: longitude.value }
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

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        latitude.value = pos.coords.latitude
        longitude.value = pos.coords.longitude
        map.value.setCenter({ lat: latitude.value, lng: longitude.value })
        setCenterMarker()
        fetchCoverage()
      },
      () => {
        setCenterMarker()
        fetchCoverage()
      }
    )
  } else {
    setCenterMarker()
    fetchCoverage()
  }

  mapClickListener = map.value.addListener('click', (e) => {
    if (isRelocateMode.value) {
      latitude.value = e.latLng.lat()
      longitude.value = e.latLng.lng()
      map.value.setCenter(e.latLng)
      setCenterMarker()
      fetchCoverage()
      isRelocateMode.value = false
    } else if (activeInfoWindow.value) {
      activeInfoWindow.value.close()
    }
  })
}

function toggleRelocateMode() {
  isRelocateMode.value = !isRelocateMode.value
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
      fillColor: '#3B82F6',
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
    if (activeInfoWindow.value) activeInfoWindow.value.close()
    if (activeCircle.value) activeCircle.value.setMap(null)
    markers.value.forEach(m => m.setMap(null))
    markers.value = []

    const url = `http://127.0.0.1:3333/coverage?longitude=${longitude.value}&latitude=${latitude.value}&radius=${radius.value}&limit=${limit.value}`
    const res = await fetch(url)
    const json = await res.json()
    if (!json.success || !json.data) return

    // Simpan data untuk modal
    coverageData.value = json.data

    const center = { lat: latitude.value, lng: longitude.value }
    activeCircle.value = new google.maps.Circle({
      strokeColor: '#3B82F6',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#3B82F6',
      fillOpacity: 0.15,
      map: map.value,
      center,
      radius: radius.value,
      clickable: false
    })

    json.data.forEach((item, index) => {
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
          fillColor: '#EF4444',
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
  } catch (e) {
    console.error('Gagal memuat data coverage:', e)
  } finally {
    loading.value = false
  }
}

function focusOnMarker(index) {
  if (markers.value[index]) {
    const marker = markers.value[index]
    map.value.setCenter(marker.getPosition())
    map.value.setZoom(18)
    google.maps.event.trigger(marker, 'click')
  }
}
</script>
