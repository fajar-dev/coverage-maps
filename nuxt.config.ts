// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', 'nuxt-vue3-google-signin'],

  devtools: {
    enabled: true
  },

  app: {
    baseURL: process.env.NUXT_PUBLIC_SITE_PATH || '/'
  },

  css: ['~/assets/css/main.css'],
  colorMode: {
    preference: 'light'
  },

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_BASE || 'https://alas.nusa.id/api',
      googleMapsApiKey: process.env.NUXT_GOOGLE_MAPS_API_KEY,
    }
  },

  googleSignIn: {
    clientId: process.env.NUXT_GOOGLE_CLIENT_ID,
  },

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
