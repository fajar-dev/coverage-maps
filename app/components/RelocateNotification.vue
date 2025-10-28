<template>
  <Transition name="fade">
    <div
      v-if="isActive"
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
</template>

<script setup>
defineProps({
  isActive: {
    type: Boolean,
    default: false
  }
})
</script>
