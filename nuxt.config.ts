// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  // ssr: false, // for Client-side Only Rendering
  // modules: [
  // ],
  // You can configure fully typed, per-environment overrides here:
  $production: {
    routeRules: {
      '/**': { isr: true },
    }
  },
  $development: {
    //
  },
  $env: {
    staging: {
      //
    },
  },
  runtimeConfig: {
    // The private keys which are only available server-side
    apiSecret: 'OPENAI_API_KEY',
    // Keys within public are also exposed client-side
    public: {
      apiBase: '/api',
    },    
  },
  css: ['~/assets/main.css'],
  app: {
    head: {
      title: 'Ailyaat',
      htmlAttrs: {
        lang: 'en',
      },      
      link:  [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },        
      ],
    }
  },
})
