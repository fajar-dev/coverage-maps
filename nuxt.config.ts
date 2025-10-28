// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui'],

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
      googleMapsApiKey: process.env.NUXT_GOOGLE_MAPS_API_KEY,
      apiUrl: process.env.NUXT_PUBLIC_API_BASE
    }
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
