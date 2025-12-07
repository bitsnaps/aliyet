export default defineEventHandler(async (event) => {
  // Mock data for settings
  const settings = {
    general: {
      siteName: 'Aliyet',
      contactEmail: 'contact@aliyaat.com',
      supportPhone: '+213 555 123 456'
    },
    seo: {
      metaTitle: 'Aliyet - Industrial Machine Maintenance',
      metaDescription: 'Leading provider of industrial machine maintenance and procurement services.'
    },
    notifications: {
      emailNotifications: true,
      newQuoteAlerts: true
    }
  }

  return settings
})