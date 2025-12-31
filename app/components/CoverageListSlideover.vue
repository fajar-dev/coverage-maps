<template>
  <USlideover
    title="Daftar Lokasi Coverage"
    :description="`Total ${filteredCount} lokasi ditampilkan dari ${totalCount}`"
    :overlay="false"
  >
    <UButton
      color="primary"
      variant="subtle"
      size="md"
      class="bg-white shadow dark:bg-gray-800 dark:text-gray-100"
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
          <div class="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
            <UIcon
              name="i-lucide-filter-x"
              class="w-12 h-12 text-gray-400 dark:text-gray-300"
            />
          </div>
          <h4 class="text-lg font-semibold text-gray-700 dark:text-gray-100 mb-2">
            Semua Filter Dinonaktifkan
          </h4>
          <p class="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
            Aktifkan minimal satu filter di legenda untuk melihat data coverage
          </p>
        </div>

        <div
          v-else-if="totalCount === 0"
          class="flex flex-col items-center justify-center py-16 px-6 h-full"
        >
          <div class="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
            <UIcon
              name="i-lucide-map-pin-off"
              class="w-12 h-12 text-gray-400 dark:text-gray-300"
            />
          </div>
          <h4 class="text-lg font-semibold text-gray-700 dark:text-gray-100 mb-2">
            Belum Ada Data
          </h4>
          <p class="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm">
            Silakan muat data coverage terlebih dahulu dengan mengklik tombol "Muat Ulang"
          </p>
        </div>

        <div
          v-else
          class="divide-y divide-gray-200 dark:divide-gray-700"
        >
          <div
            v-for="(item) in items"
            :key="item.id"
            class="px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            @click="$emit('itemClick', item)"
          >
            <div class="flex items-start gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2 mb-2">
                  <div class="flex-1 min-w-0">
                    <h4 class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {{ item.name }}
                    </h4>
                    <div
                      v-if="item.address"
                      class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <div class="shrink-0 h-4 flex items-start pt-0.5">
                        <UIcon
                          name="i-lucide-map-pin"
                          class="size-4 text-gray-500 dark:text-gray-400"
                        />
                      </div>

                      <span class="leading-5">
                        {{ item.address }}
                      </span>
                    </div>
                  </div>
                  <div class="flex flex-col gap-1 items-end shrink-0">
                    <UBadge
                      size="sm"
                      :style="{
                        backgroundColor: getMarkerColor(item.type),
                        color: '#ffffff'
                      }"
                    >
                      {{ item.type }}
                    </UBadge>
                    <UBadge
                      color="primary"
                      variant="soft"
                      size="sm"
                    >
                      {{ item.distance.toFixed(0) }}m
                    </UBadge>
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-1 mt-3">
                  <!-- CUSTOMER ID -->
                  <div
                    v-if="item.customerId"
                    class="flex flex-col text-xs"
                  >
                    <div class="flex items-center gap-1 mb-1">
                      <UIcon
                        name="i-lucide-hash"
                        class="w-3 h-3 text-gray-400 dark:text-gray-500"
                      />
                      <span class="text-gray-600 dark:text-gray-400">Customer ID:</span>
                    </div>

                    <span class="font-semibold text-gray-900 dark:text-gray-100">
                      {{ item.customerId }}
                    </span>
                  </div>

                  <!-- SERVICE ID -->
                  <div
                    v-if="item.serviceId"
                    class="flex flex-col text-xs"
                  >
                    <div class="flex items-center gap-1 mb-1">
                      <UIcon
                        name="i-lucide-hash"
                        class="w-3 h-3 text-gray-400 dark:text-gray-500"
                      />
                      <span class="text-gray-600 dark:text-gray-400">Service ID:</span>
                    </div>

                    <span class="font-semibold text-gray-900 dark:text-gray-100">
                      {{ item.serviceId }}
                    </span>
                  </div>

                  <!-- HOMEPASS ID -->
                  <div
                    v-if="item.homepassId"
                    class="flex flex-col text-xs"
                  >
                    <div class="flex items-center gap-1 mb-1">
                      <UIcon
                        name="i-lucide-hash"
                        class="w-3 h-3 text-gray-400 dark:text-gray-500"
                      />
                      <span class="text-gray-600 dark:text-gray-400">HomePass ID:</span>
                    </div>

                    <span class="font-semibold text-gray-900 dark:text-gray-100">
                      {{ item.homepassId }}
                    </span>
                  </div>

                  <!-- SPLITTER ID -->
                  <div
                    v-if="item.splitterId"
                    class="flex flex-col text-xs"
                  >
                    <div class="flex items-center gap-1 mb-1">
                      <UIcon
                        name="i-lucide-hash"
                        class="w-3 h-3 text-gray-400 dark:text-gray-500"
                      />
                      <span class="text-gray-600 dark:text-gray-400">Splitter ID:</span>
                    </div>

                    <span class="font-semibold text-gray-900 dark:text-gray-100">
                      {{ item.splitterId }}
                    </span>
                  </div>

                  <!-- BAGIAN KOORDINAT (Selalu tampil) -->
                  <div class="flex flex-col text-xs">
                    <div class="flex items-center gap-1 mb-1">
                      <UIcon
                        name="i-lucide-navigation"
                        class="w-3 h-3 text-gray-400 dark:text-gray-500"
                      />
                      <span class="text-gray-600 dark:text-gray-400">Koordinat:</span>
                    </div>

                    <span class="text-gray-700 dark:text-gray-300 truncate">
                      {{ item.coordinate }}
                    </span>
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
const props = defineProps({
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
  },
  legendItems: {
    type: Array,
    default: () => []
  }
})

defineEmits(['itemClick'])

function generateColor(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  const hue = Math.abs(hash % 360)
  const saturation = 60 + (Math.abs(hash) % 20)
  const lightness = 40 + (Math.abs(hash >> 8) % 20)

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

const getMarkerColor = (type) => {
  if (props.legendItems && props.legendItems.length > 0) {
    const legend = props.legendItems.find(item => item.type === type)
    if (legend) {
      return legend.color
    }
  }

  return generateColor(type)
}
</script>
