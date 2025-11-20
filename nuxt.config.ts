// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: true, // Enable Server Side Rendering (Full Stack)

  nitro: {
    preset: 'node-server', // Builds a standalone Node server
    output: {
      publicDir: '../public_html'   // ← THIS IS THE MAGIC LINE
    }    
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
  routeRules: {
    '/api/**': { cors: true, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS' } }
  },
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
