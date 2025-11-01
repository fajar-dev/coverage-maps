<template>
  <div
    v-if="isLoading"
    class="absolute inset-0 bg-black/20 backdrop-blur-sm z-20 flex items-center justify-center"
  >
    <div class="flex items-center gap-3">
      <UIcon
        name="i-lucide-loader-2"
        class="w-5 h-5 animate-spin text-primary"
      />
      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">
        Memuat Peta...
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isLoading: {
    type: Boolean,
    default: false
  }
})
</script>
