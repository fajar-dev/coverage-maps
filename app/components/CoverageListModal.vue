<template>
  <div class="absolute bottom-6 right-15 z-10 flex flex-col gap-2 items-end">
    <UModal>
      <UButton
        color="primary"
        variant="subtle"
        size="md"
        class="bg-white"
        icon="i-lucide-list"
      >
        Lihat Hasil
      </UButton>

      <template #header>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-primary/10 rounded-lg flex">
            <UIcon
              name="i-lucide-map-pin"
              class="w-7 h-7 text-primary"
            />
          </div>
          <div class="text-left">
            <h3 class="text-lg font-semibold">
              Daftar Lokasi Coverage
            </h3>
            <p class="text-sm text-gray-500">
              Total {{ coverageData.length }} lokasi ditemukan
            </p>
          </div>
        </div>
      </template>

      <template #body>
        <div class="overflow-y-auto max-h-[calc(70vh-120px)]">
          <div
            v-if="coverageData.length === 0"
            class="flex flex-col items-center justify-center py-16 px-6"
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
              v-for="(item, index) in coverageData"
              :key="index"
              class="px-2 py-2 hover:bg-gray-50 transition-colors cursor-pointer"
              @click="$emit('focus-marker', index)"
            >
              <div class="flex items-start gap-4">
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
    </UModal>
  </div>
</template>

<script setup>
defineProps({ coverageData: Array })
</script>
