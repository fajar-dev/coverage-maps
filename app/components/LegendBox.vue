<template>
  <div class="absolute bottom-2 left-2 z-10">
    <div class="relative p-4 rounded-xl backdrop-blur-xl bg-white/95 shadow-xl">
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
</template>
