<template>
  <div>
    <div class="absolute top-15 right-2.5 z-10 flex flex-col gap-2">
      <UColorModeButton class="w-10 h-10 flex items-center justify-center bg-white text-gray-600 shadow-md rounded-none hover:bg-gray-100 hover:text-gray-800 transition"/>
      <UButton
        :icon="isSatellite ? 'i-lucide-map' : 'i-lucide-globe'"
        size="lg"
        class="w-10 h-10 flex items-center justify-center bg-white text-gray-600 shadow-md rounded-none hover:bg-gray-100 hover:text-gray-800 transition"
        variant="solid"
        @click="$emit('toggleSatellite')"
      />
    </div>

    <div class="absolute top-2.5 right-15 z-10 flex flex-col gap-2">
      <UButton
        size="lg"
        variant="solid"
        class="flex items-center justify-center bg-white text-gray-600 shadow-md rounded-full hover:bg-gray-100 hover:text-gray-800 transition"
        :loading="googleLoading"
        @click="handleGoogleLogin"
      >
        <template v-if="!googleLoading" #leading>
          <Icon name="logos:google-icon" class="w-5 h-5" />
        </template>
        {{ googleLoading ? 'Signing in...' : 'Sign In with Google' }}
      </UButton>
    </div>

    <div class="absolute bottom-70 right-3 z-10 flex flex-col gap-3 items-end">
      <UButton
        icon="i-lucide-download"
        size="lg"
        class="w-12 h-12 flex items-center justify-center bg-white text-gray-600 shadow-md rounded-full hover:bg-gray-100 hover:text-gray-800 transition"
        variant="solid"
        @click="$emit('export')"
      />

      <UButton
        icon="i-lucide-map-pinned"
        size="lg"
        class="w-12 h-12 flex items-center justify-center bg-white text-gray-600 shadow-md rounded-full hover:bg-gray-100 hover:text-gray-800 transition"
        variant="solid"
        @click="$emit('returnToLocation')"
      />

      <div class="flex items-center gap-2">
        <Transition name="fade">
          <div
            v-if="isMeasureMode"
            class="bg-green-500 text-white text-xs font-medium py-1 px-2 rounded-md shadow-md whitespace-nowrap"
          >
            {{ totalDistance }}
          </div>
        </Transition>

        <UButton
          icon="i-lucide-ruler"
          size="xl"
          class="w-12 h-12 flex items-center justify-center shadow-md rounded-full transition"
          :class="isMeasureMode
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-800'"
          variant="solid"
          @click="$emit('toggleMeasure')"
        />
      </div>
    </div>

    <div class="absolute bottom-6 right-15 z-10 flex flex-col gap-2 items-end">
      <div class="flex flex-col gap-2 w-32">
        <UButton
          :color="isRelocateMode ? 'warning' : 'primary'"
          variant="solid"
          size="md"
          :icon="isRelocateMode ? 'i-lucide-x' : 'i-lucide-crosshair'"
          class="shadow"
          @click="$emit('toggleRelocate')"
        >
          {{ isRelocateMode ? 'Batal' : 'Ubah Lokasi' }}
        </UButton>
        <slot name="slideover" />
      </div>
    </div>
  </div>
</template>

<script setup>
const toast = useToast()
const googleLoading = ref(false)

const handleOnSuccess = async (response) => {
  try {
    const result = await $fetch("/api/auth/google", {
      method: "POST",
      body: { code: response.code },
    });
    toast.add({ title: 'Login Successful', color: 'green' })
  } catch (error) {
    toast.add({ title: 'Authentication failed', color: 'red' })
  } finally {
    googleLoading.value = false
  }
};

const handleOnError = (errorResponse) => {
  googleLoading.value = false
  toast.add({ title: 'Google Sign-In Error', color: 'red' })
};

const { isReady, login } = useCodeClient({
  onSuccess: handleOnSuccess,
  onError: handleOnError,
});

const handleGoogleLogin = () => {
  if (!isReady.value) return
  googleLoading.value = true
  login()
}

defineProps({
  isRelocateMode: { type: Boolean, default: false },
  isMeasureMode: { type: Boolean, default: false },
  isSatellite: { type: Boolean, default: false },
  totalDistance: { type: String, default: '0m' }
})

defineEmits(['returnToLocation', 'toggleMeasure', 'toggleRelocate', 'toggleSatellite', 'export'])
</script>