<template>
  <div class="absolute top-2 left-2 z-10">
    <UCard class="w-70 backdrop-blur-xl bg-white/95 shadow-xl">
      <template #header>
        <button
          class="w-full flex items-center justify-between gap-2 hover:opacity-80 transition-opacity"
          @click="isOpen = !isOpen"
        >
          <div class="flex items-center gap-2">
            <img
              src="https://www.nusa.net.id/kb/favicon.png"
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
          class="space-y-3"
        >
          <!-- Radius -->
          <div class="space-y-2">
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
                {{ radius }} m
              </UBadge>
            </div>

            <div class="relative pb-6">
              <USlider
                v-model="radiusModel"
                :min="1"
                :max="1000"
                :step="1"
              />
              <div
                class="absolute top-6 left-0 right-0 flex justify-between text-[10px] text-gray-500 px-1"
              >
                <span>1m</span><span>250m</span><span>500m</span><span>750m</span><span>1km</span>
              </div>
            </div>
            <p class="text-[11px] text-gray-500">
              Jarak maksimal dari lokasi saya untuk mencari lokasi coverage
            </p>
          </div>

          <div class="border-t border-gray-200" />

          <!-- Limit -->
          <div class="space-y-2">
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
                v-model="limitModel"
                :min="1"
                :max="100"
                :step="1"
              />
              <div
                class="absolute top-6 left-0 right-0 flex justify-between text-[10px] text-gray-500 px-1"
              >
                <span>1</span><span>25</span><span>50</span><span>75</span><span>100</span>
              </div>
            </div>
            <p class="text-[11px] text-gray-500">
              Jumlah maksimal titik coverage yang akan ditampilkan
            </p>
          </div>

          <div class="border-t border-gray-200" />

          <!-- Reload -->
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
const props = defineProps({
  radius: Number,
  limit: Number,
  loading: Boolean
})

const emits = defineEmits(['update:radius', 'update:limit', 'reload'])
const isOpen = ref(true)

// ✅ buat computed getter/setter agar v-model bisa tetap dipakai
const radiusModel = computed({
  get: () => props.radius,
  set: val => emits('update:radius', val)
})

const limitModel = computed({
  get: () => props.limit,
  set: val => emits('update:limit', val)
})
</script>
