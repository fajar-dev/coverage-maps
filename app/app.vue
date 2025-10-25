<template>
  <NuxtPage />
</template>

<script setup>
const config = useRuntimeConfig()

useHead({
  script: [
    {
      src: `https://maps.googleapis.com/maps/api/js?key=${config.public.googleMapsApiKey}&libraries=places&loading=async`,
      async: true,
      defer: true
    }
  ]
})
</script>
