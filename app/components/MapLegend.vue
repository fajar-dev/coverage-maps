<template>
  <div
    v-if="isVisible"
    class="absolute bottom-2 left-2 z-10 w-35"
  >
    <div class="relative p-3 rounded-xl backdrop-blur-xl bg-white/95 shadow-xl">
      <button
        class="absolute top-2 right-2 w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700"
        @click="$emit('close')"
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
        <div class="flex items-center gap-2 mb-2.5">
          <div class="w-3" />
          <div class="w-2.5 h-2.5 rounded-full border-2 border-primary-500 bg-primary-500/20 shrink-0" />
          <span class="text-[11px] leading-none">Radius</span>
        </div>

        <div class="flex items-center gap-2 mb-1.5">
          <div class="w-3" />
          <div class="w-2.5 h-2.5 rounded-full bg-primary-500 shrink-0" />
          <span class="text-[11px] leading-none">Lokasi Saya</span>
        </div>

        <div class="flex items-center gap-2">
          <UCheckbox
            :model-value="visibleTypes.Fiberstar"
            size="xs"
            class="shrink-0"
            @update:model-value="$emit('update:visibleTypes', { ...visibleTypes, Fiberstar: $event })"
          />
          <div class="w-2.5 h-2.5 rounded-full bg-[#f37336] shrink-0" />
          <span class="text-[11px] leading-none">Fiberstar</span>
        </div>

        <div class="flex items-center gap-2">
          <UCheckbox
            :model-value="visibleTypes.CGS"
            size="xs"
            class="shrink-0"
            @update:model-value="$emit('update:visibleTypes', { ...visibleTypes, CGS: $event })"
          />
          <div class="w-2.5 h-2.5 rounded-full bg-[#742774] shrink-0" />
          <span class="text-[11px] leading-none">CGS</span>
        </div>

        <div class="flex items-center gap-2">
          <UCheckbox
            :model-value="visibleTypes.SIP"
            size="xs"
            class="shrink-0"
            @update:model-value="$emit('update:visibleTypes', { ...visibleTypes, SIP: $event })"
          />
          <div class="w-2.5 h-2.5 rounded-full bg-[#cf2e2e] shrink-0" />
          <span class="text-[11px] leading-none">SIP</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isVisible: {
    type: Boolean,
    default: true
  },
  visibleTypes: {
    type: Object,
    default: () => ({
      Fiberstar: true,
      CGS: true,
      SIP: true
    })
  }
})

defineEmits(['close', 'update:visibleTypes'])
</script>
