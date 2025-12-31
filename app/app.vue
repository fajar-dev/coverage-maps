<template>
  <NuxtPage />
  <UNotifications />
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
  ],
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: `favicon.ico` }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'Nusanet Fiber Coverage'

useSeoMeta({
  title,
  ogTitle: title
})
</script>
