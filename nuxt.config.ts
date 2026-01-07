// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: true, // Enable Server Side Rendering (Full Stack)

  nitro: {
    preset: 'node-server', // Builds a standalone Node server
    externals: {
      external: ['xlsx'] // This tells Nitro builder not to bundle xlsx into the output files
    }
  },
  modules: ['@nuxt/ui', 'nuxt-lucide-icons', '@nuxt/fonts', '@nuxtjs/i18n'],
  i18n: {
   defaultLocale: 'en',
    locales: [
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
      { code: 'fr', language: 'fr-FR', name: 'Français', file: 'fr.json' },
      { code: 'ar', language: 'ar-DZ', name: 'العربية', file: 'ar.json' }
    ]    
  },  
  fonts: {
    families: [
      { name: 'Plus Jakarta Sans', provider: 'google' },
    ],
    defaults: {
      weights: [400, 500, 600, 700],
      styles: ['normal', 'italic'],
    },
    // preload: true,
  },
  routeRules: {
    '/admin/*': { ssr: false },
  },
  ui: {
    colorMode: true
  },
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
  runtimeConfig: {
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    smtpFrom: process.env.SMTP_FROM,
    contactEmail: process.env.CONTACT_EMAIL,
  },
  css: ['~/assets/main.css'],
  app: {
    baseURL: '/', // Keep this as root
    buildAssetsDir: '/_nuxt/', // Standard assets directory    
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