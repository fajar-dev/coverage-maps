// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui', '@vite-pwa/nuxt', 'nuxt-vue3-google-signin'],

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
  },

  pwa: {
    manifest: {
      name: "alas - Coverage Map",
      short_name: "alas",
      description: "Nusanet Fiber Coverage Map",
      icons: [
        {
          src: "icons/icon_64x64.png",
          sizes: "64x64",
          type: "image/png",
        },
        {
          src: "icons/icon_144x144.png",
          sizes: "144x144",
          type: "image/png",
        },
        {
          src: "icons/icon_192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "icons/icon_384x384.png",
          sizes: "384x384",
          type: "image/png",
        },
        {
          src: "icons/icon_512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
    workbox: {
      navigateFallback: "/",
      globPatterns: ["**/*.{js,css,html,png,svg,ico}"],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/alas\.nusa\.id\/api\/.*$/i,
          handler: "CacheFirst",
          options: {
            cacheName: "api-cache",
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
  },
})
