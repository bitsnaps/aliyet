// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: true, // Enable Server Side Rendering (Full Stack)

  nitro: {
    preset: 'node-server', // Builds a standalone Node server
  },
  modules: [
    '@nuxt/ui'
  ],
  // You can configure fully typed, per-environment overrides here:
  // $production: {
  //   routeRules: {
  //     '/**': { isr: true },
  //   }
  // },
  // $development: {
  //   //
  // },
  // $env: {
  //   staging: {
  //     //
  //   },
  // },
  // runtimeConfig: {
    // Keys within public are also exposed client-side
    // public: {
    //   apiBase: '/api',
    // },    
  // },
  css: ['~/assets/main.css'],
  app: {
    baseURL: '/', // Keep this as root
    // buildAssetsDir: '/_nuxt/', // Standard assets directory    
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
