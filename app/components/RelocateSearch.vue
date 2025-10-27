<template>
  <div
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
            v-model="query"
            icon="i-lucide-search"
            size="md"
            variant="outline"
            placeholder="Ketik nama tempat atau alamat..."
            class="w-full"
            @input="onSearchInput"
          />
          <UIcon
            v-if="query"
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
        v-if="showSuggestions && suggestions.length"
        class="absolute mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-60 overflow-y-auto z-50 w-100"
      >
        <button
          v-for="(s, idx) in suggestions"
          :key="idx"
          class="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
          @click="selectSuggestion(s)"
        >
          <div class="flex items-start gap-3">
            <UIcon
              name="i-lucide-map-pin"
              class="w-4 h-4 text-gray-400 mt-0.5"
            />
            <div class="flex-1 min-w-0">
              <div class="text-xs font-medium text-gray-900 truncate">
                {{ s.structured_formatting?.main_text || s.description }}
              </div>
              <div class="text-xs text-gray-500 truncate">
                {{ s.structured_formatting?.secondary_text || '' }}
              </div>
            </div>
          </div>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
const emits = defineEmits(['update-location', 'update:isRelocateMode'])
const query = ref('')
const suggestions = ref([])
const showSuggestions = ref(false)
let timeout = null
let autocompleteService = null
let placesService = null

onMounted(() => {
  if (window.google?.maps?.places) {
    autocompleteService = new google.maps.places.AutocompleteService()
    placesService = new google.maps.places.PlacesService(document.createElement('div'))
  }
})

function onSearchInput() {
  if (timeout) clearTimeout(timeout)
  if (!query.value || query.value.length < 3) {
    showSuggestions.value = false
    suggestions.value = []
    return
  }
  timeout = setTimeout(searchPlaces, 300)
}

function searchPlaces() {
  autocompleteService?.getPlacePredictions(
    {
      input: query.value,
      componentRestrictions: { country: 'id' }
    },
    (preds, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && preds) {
        suggestions.value = preds
        showSuggestions.value = true
      }
    }
  )
}

function selectSuggestion(s) {
  showSuggestions.value = false
  query.value = s.description
  if (!placesService) return
  placesService.getDetails({ placeId: s.place_id, fields: ['geometry'] }, (place, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK && place.geometry) {
      emits('update-location', {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      })
      emits('update:isRelocateMode', false)
    }
  })
}

function clearSearch() {
  query.value = ''
  suggestions.value = []
  showSuggestions.value = false
}
</script>
