<template>
  <div
    v-if="isVisible"
    class="absolute bottom-2 left-2 z-10 w-35"
  >
    <div class="relative p-3 rounded-xl backdrop-blur-xl bg-white/95 dark:bg-gray-900 shadow-xl">
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
        <!-- Radius Indicator -->
        <div class="flex items-center gap-2 mb-2.5">
          <div class="w-3" />
          <div class="w-2.5 h-2.5 rounded-full border-2 border-primary-500 bg-primary-500/20 shrink-0" />
          <span class="text-[11px] leading-none">Radius</span>
        </div>

        <!-- My Location -->
        <div class="flex items-center gap-2 mb-1.5">
          <div class="w-3" />
          <div class="w-2.5 h-2.5 rounded-full bg-primary-500 shrink-0" />
          <span class="text-[11px] leading-none">Lokasi Saya</span>
        </div>

        <!-- Dynamic Legend Items -->
        <div
          v-for="item in legendItems"
          :key="item.type"
          class="flex items-center gap-2"
        >
          <UCheckbox
            :model-value="visibleTypes[item.type]"
            size="xs"
            class="shrink-0"
            @update:model-value="toggleType(item.type, $event)"
          />
          <div
            class="w-2.5 h-2.5 rounded-full shrink-0"
            :style="{ backgroundColor: item.color }"
          />
          <span class="text-[11px] leading-none">
            {{ item.label }}
            <strong v-if="item.count !== undefined">({{ item.count }})</strong>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isVisible: {
    type: Boolean,
    default: true
  },
  legendItems: {
    type: Array,
    default: () => []
  },
  visibleTypes: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'update:visibleTypes'])

function toggleType(type, value) {
  emit('update:visibleTypes', {
    ...props.visibleTypes,
    [type]: value
  })
}
</script>
