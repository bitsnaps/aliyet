// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: true, // Enable Server Side Rendering (Full Stack)

  nitro: {
    preset: 'node-server', // Builds a standalone Node server
  },
  modules: ['@nuxt/ui', 'nuxt-lucide-icons', '@nuxt/fonts', '@nuxtjs/i18n'],
  i18n: {
   defaultLocale: 'en',
    locales: [
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json', dir: 'ltr' },
      { code: 'fr', language: 'fr-FR', name: 'Français', file: 'fr.json', dir: 'ltr' },
      { code: 'ar', language: 'ar-DZ', name: 'العربية', file: 'ar.json', dir: 'rtl' }
    ]    
  },  
  fonts: {
    families: [
      { name: 'Plus Jakarta Sans', provider: 'google' },
      { name: 'Cairo', provider: 'google' },
    ],
    defaults: {
      weights: [400, 500, 600, 700],
      styles: ['normal', 'italic'],
    },
    // preload: true,
  },
  routeRules: {
    '/admin/**': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/fr/admin/**': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/ar/admin/**': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
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
      link:  [
        { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' },        
      ],
    }
  },
})