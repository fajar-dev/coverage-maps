<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 -translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-4"
  >
    <div
      v-if="isVisible"
      class="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-md px-4"
    >
      <UCard
        class="backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 shadow-2xl border border-gray-100 dark:border-gray-800"
      >
        <div class="space-y-3">
          <!-- Judul -->
          <div class="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
            <UIcon
              name="i-lucide-search"
              class="w-4 h-4 text-primary"
            />
            <span>Cari Lokasi</span>
          </div>

          <!-- Input Pencarian -->
          <div class="relative">
            <UInput
              ref="searchInput"
              :model-value="searchQuery"
              icon="i-lucide-search"
              size="md"
              variant="outline"
              placeholder="Ketik nama tempat atau alamat..."
              class="w-full dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 dark:border-gray-700"
              @update:model-value="$emit('update:searchQuery', $event)"
              @input="$emit('search')"
            />
            <UIcon
              v-if="searchQuery"
              name="i-lucide-x"
              class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300"
              @click="$emit('clear')"
            />
          </div>
        </div>
      </UCard>

      <!-- Dropdown Saran -->
      <Transition
        enter-active-class="transition-all duration-200"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition-all duration-150"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="showSuggestions && suggestions.length > 0"
          class="absolute mt-1 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto z-50 w-100"
        >
          <button
            v-for="(suggestion, idx) in suggestions"
            :key="idx"
            class="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
            @click="$emit('select', suggestion)"
          >
            <div class="flex items-start gap-3">
              <UIcon
                name="i-lucide-map-pin"
                class="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0"
              />
              <div class="flex-1 min-w-0">
                <div class="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                  {{ suggestion.structured_formatting?.main_text || suggestion.description }}
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {{ suggestion.structured_formatting?.secondary_text || '' }}
                </div>
              </div>
            </div>
          </button>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  searchQuery: {
    type: String,
    default: ''
  },
  suggestions: {
    type: Array,
    default: () => []
  },
  showSuggestions: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:searchQuery', 'search', 'clear', 'select'])

const searchInput = ref(null)
</script>
