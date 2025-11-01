<template>
  <div>
    <div class="absolute top-15 right-2.5 z-10">
      <UColorModeButton class="w-10 h-10 flex items-center justify-center bg-white text-gray-600 shadow-md rounded-none hover:bg-gray-100 hover:text-gray-800 transition" />
    </div>

    <div class="absolute bottom-50 right-3 z-10 flex flex-col gap-3 items-end">
      <UButton
        icon="i-lucide-map-pinned"
        size="lg"
        class="w-12 h-12 flex items-center justify-center bg-white text-gray-600 shadow-md rounded-full hover:bg-gray-100 hover:text-gray-800 transition"
        variant="solid"
        @click="$emit('returnToLocation')"
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
          @click="$emit('toggleMeasure')"
        />
      </div>
    </div>

    <!-- Relocate Mode & View Results Buttons -->
    <div class="absolute bottom-6 right-15 z-10 flex flex-col gap-2 items-end">
      <div class="flex flex-col gap-2 w-32">
        <UButton
          :color="isRelocateMode ? 'warning' : 'primary'"
          variant="solid"
          size="md"
          :icon="isRelocateMode ? 'i-lucide-x' : 'i-lucide-crosshair'"
          class="shadow"
          @click="$emit('toggleRelocate')"
        >
          {{ isRelocateMode ? 'Batal' : 'Ubah Lokasi' }}
        </UButton>
        <slot name="slideover" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isRelocateMode: {
    type: Boolean,
    default: false
  },
  isMeasureMode: {
    type: Boolean,
    default: false
  },
  totalDistance: {
    type: String,
    default: '0m'
  }
})

defineEmits(['returnToLocation', 'toggleMeasure', 'toggleRelocate'])
</script>
