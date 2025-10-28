<template>
  <USlideover
    title="Daftar Lokasi Coverage"
    :description="`Total ${filteredCount} lokasi ditampilkan dari ${totalCount}`"
  >
    <UButton
      color="primary"
      variant="subtle"
      size="md"
      class="bg-white shadow"
      icon="i-lucide-list"
    >
      Lihat Hasil
    </UButton>

    <template #body>
      <div class="h-full overflow-y-auto">
        <div
          v-if="filteredCount === 0 && totalCount > 0"
          class="flex flex-col items-center justify-center py-16 px-6 h-full"
        >
          <div class="p-4 bg-gray-100 rounded-full mb-4">
            <UIcon
              name="i-lucide-filter-x"
              class="w-12 h-12 text-gray-400"
            />
          </div>
          <h4 class="text-lg font-semibold text-gray-700 mb-2">
            Semua Filter Dinonaktifkan
          </h4>
          <p class="text-sm text-gray-500 text-center max-w-sm">
            Aktifkan minimal satu filter di legenda untuk melihat data coverage
          </p>
        </div>

        <div
          v-else-if="totalCount === 0"
          class="flex flex-col items-center justify-center py-16 px-6 h-full"
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
            v-for="(item) in items"
            :key="item.id"
            class="px-4 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
            @click="$emit('itemClick', item)"
          >
            <div class="flex items-start gap-4">
              <div
                class="w-3 h-3 rounded-full border-2 border-white shadow-sm mt-1 flex-shrink-0"
                :style="{ backgroundColor: getMarkerColor(item.type) }"
              />
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
  </USlideover>
</template>

<script setup>
defineProps({
  items: {
    type: Array,
    default: () => []
  },
  filteredCount: {
    type: Number,
    default: 0
  },
  totalCount: {
    type: Number,
    default: 0
  }
})

defineEmits(['itemClick'])

const getMarkerColor = (type) => {
  const colorMap = {
    Fiberstar: '#f37336',
    CGS: '#742774',
    SIP: '#cf2e2e'
  }
  return colorMap[type] || '#3b82f6'
}
</script>
