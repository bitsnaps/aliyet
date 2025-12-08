export default defineAppConfig({
  ui: {
    colors: {
      primary: 'deep-teal',
      neutral: 'charcoal'
    },
    button: {
      slots: {
        base: 'rounded-md font-sans font-medium'
      },
      defaultVariants: {
        loadingIcon: 'i-lucide-loader-2'
      }
    },
    input: {
      slots: {
        root: 'rounded-md'
      },
      variants: {
        color: {
          white: {
            root: 'bg-white dark:bg-charcoal-900 text-charcoal-900 dark:text-white ring-1 ring-inset ring-charcoal-300 dark:ring-charcoal-700 focus:ring-2 focus:ring-deep-teal-500 dark:focus:ring-deep-teal-400'
          },
          gray: {
            root: 'bg-light-gray-200 dark:bg-charcoal-800 text-charcoal-900 dark:text-white ring-1 ring-inset ring-charcoal-300 dark:ring-charcoal-700 focus:ring-2 focus:ring-deep-teal-500'
          }
        }
      }
    },
    card: {
      slots: {
        root: 'rounded-lg bg-white dark:bg-charcoal-900 ring-1 ring-light-gray-300 dark:ring-charcoal-800 shadow-sm'
      }
    },
    table: {
      slots: {
        th: 'text-left rtl:text-right px-4 py-3.5 text-charcoal-900 dark:text-white font-semibold text-sm',
        td: 'whitespace-nowrap px-4 py-4 text-charcoal-600 dark:text-charcoal-300 font-medium text-sm'
      }
    }
  }
})
