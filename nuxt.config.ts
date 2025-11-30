// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: true, // Enable Server Side Rendering (Full Stack)

  nitro: {
    preset: 'node-server', // Builds a standalone Node server
  },
  modules: ['@nuxt/ui', 'nuxt-lucide-icons', '@nuxt/fonts'],
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
  ui: {
    primary: 'deep-teal',
    gray: 'charcoal',
    
    // Global UI Component customization
    button: {
      rounded: 'rounded-md',
      font: 'font-sans font-medium',
      default: {
        loadingIcon: 'i-lucide-loader-2'
      }
    },
    input: {
      rounded: 'rounded-md',
      color: {
        white: {
          outline: 'bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white ring-1 ring-inset ring-charcoal-300 dark:ring-charcoal-700 focus:ring-2 focus:ring-deep-teal-500 dark:focus:ring-deep-teal-400'
        },
        gray: {
          outline: 'bg-light-gray-200 dark:bg-charcoal-800 text-charcoal-900 dark:text-white ring-1 ring-inset ring-charcoal-300 dark:ring-charcoal-700 focus:ring-2 focus:ring-deep-teal-500'
        }
      }
    },
    card: {
      rounded: 'rounded-lg',
      background: 'bg-white dark:bg-charcoal-900',
      ring: 'ring-1 ring-light-gray-300 dark:ring-charcoal-800',
      shadow: 'shadow-sm'
    },
    table: {
      th: {
        base: 'text-left rtl:text-right',
        padding: 'px-4 py-3.5',
        color: 'text-charcoal-900 dark:text-white',
        font: 'font-semibold',
        size: 'text-sm'
      },
      td: {
        base: 'whitespace-nowrap',
        padding: 'px-4 py-4',
        color: 'text-charcoal-600 dark:text-charcoal-300',
        font: 'font-medium',
        size: 'text-sm'
      }
    }
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
    // Keys within public are also exposed client-side
    // public: {
    //   apiBase: '/api',
    // },
    db: {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      name: process.env.DB_NAME || 'aliyaat_db',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      // 'mysql' or 'sqlite'
      dialect: process.env.DB_DIALECT || 'sqlite', 
      // Only for sqlite
      storage: process.env.DB_STORAGE || './server/database.sqlite' 
    }    
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