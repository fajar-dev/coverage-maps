<template>
  <NuxtPage />
</template>

<script setup>
const config = useRuntimeConfig()

useHead({
  script: [
    {
      src: `https://maps.googleapis.com/maps/api/js?key=${config.public.googleMapsApiKey}&libraries=geometry`,
      async: true,
      defer: true
    }
  ]
})
</script>
