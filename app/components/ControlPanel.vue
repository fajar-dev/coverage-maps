<template>
  <div class="absolute top-2 left-2 z-10">
    <UCard class="w-80 backdrop-blur-xl bg-white/95 shadow-xl dark:bg-gray-900">
      <template #header>
        <button
          class="w-full flex items-center justify-between gap-2 hover:opacity-80 transition-opacity"
          @click="$emit('toggle')"
        >
          <div class="flex items-center gap-2">
            <img
              src="/nusanet.png"
              alt="Logo"
              class="w-7 h-7"
            >

            <div class="text-left">
              <h2 class="text-sm font-semibold">
                Coverage Map
              </h2>
              <p class="text-[10px] text-gray-500">
                Nusanet Fiber Coverage
              </p>
            </div>
          </div>
          <UIcon
            :name="isOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
            class="w-4 h-4 text-gray-400 transition-transform"
          />
        </button>
      </template>

      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-show="isOpen"
          class="space-y-2"
        >
          <UTabs
            :model-value="activeTab"
            :items="tabs"
            size="xs"
            @update:model-value="$emit('update:activeTab', $event)"
          >
            <template #radius>
              <div class="space-y-2 mt-2">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-semibold flex items-center gap-2">
                    <UIcon
                      name="i-lucide-circle-dot"
                      class="w-4 h-4 text-primary"
                    />
                    Radius Pencarian
                  </label>
                  <UBadge
                    color="primary"
                    variant="soft"
                    size="sm"
                  >
                    {{ radius >= 1000 ? (radius / 1000).toFixed(1) + ' km' : radius + ' m' }}
                  </UBadge>
                </div>

                <div class="relative pb-6">
                  <USlider
                    :model-value="radius"
                    :min="1"
                    :max="2000"
                    :step="10"
                    @update:model-value="$emit('update:radius', $event)"
                  />
                  <div class="absolute top-6 left-0 right-0 flex justify-between text-[10px] text-gray-500 px-1">
                    <span>1m</span>
                    <span>500m</span>
                    <span>1km</span>
                    <span>1.5km</span>
                    <span>2km</span>
                  </div>
                </div>
                <p class="text-[11px] text-gray-500">
                  Jarak maksimal dari lokasi saya untuk mencari lokasi coverage
                </p>
              </div>
            </template>
            <template #limit>
              <div class="space-y-2 mt-2">
                <div class="flex items-center justify-between">
                  <label class="text-sm font-semibold flex items-center gap-2">
                    <UIcon
                      name="i-lucide-layers"
                      class="w-4 h-4 text-green-600"
                    />
                    Maksimal Data
                  </label>
                  <UBadge
                    color="primary"
                    variant="soft"
                    size="sm"
                  >
                    {{ limit }}
                  </UBadge>
                </div>

                <div class="relative pb-6">
                  <USlider
                    :model-value="limit"
                    :min="1"
                    :max="1000"
                    :step="1"
                    @update:model-value="$emit('update:limit', $event)"
                  />
                  <div class="absolute top-6 left-0 right-0 flex justify-between text-[10px] text-gray-500 px-1">
                    <span>1</span><span>250</span><span>500</span><span>750</span><span>1000</span>
                  </div>
                </div>

                <p class="text-[11px] text-gray-500">
                  Jumlah maksimal titik coverage yang akan ditampilkan
                </p>
              </div>
            </template>
          </UTabs>

          <div class="border-t border-gray-200 dark:border-gray-700" />

          <UButton
            color="primary"
            size="sm"
            block
            icon="i-lucide-refresh-cw"
            :loading="loading"
            class="font-semibold"
            @click="$emit('reload')"
          >
            Muat Ulang
          </UButton>
        </div>
      </Transition>
    </UCard>
  </div>
</template>

<script setup>
defineProps({
  isOpen: {
    type: Boolean,
    default: true
  },
  activeTab: {
    type: String,
    default: 'radius'
  },
  radius: {
    type: Number,
    default: 1000
  },
  limit: {
    type: Number,
    default: 100
  },
  loading: {
    type: Boolean,
    default: false
  }
})

defineEmits(['toggle', 'update:activeTab', 'update:radius', 'update:limit', 'reload'])

const tabs = [
  { label: 'Radius Pencarian', icon: 'i-lucide-circle-dot', value: 'radius', slot: 'radius' },
  { label: 'Maksimal Data', icon: 'i-lucide-layers', value: 'limit', slot: 'limit' }
]
</script>
