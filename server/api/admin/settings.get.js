export default defineEventHandler(async (event) => {
  // Mock data for settings
  const settings = {
    general: {
      siteName: 'Aliyaat',
      contactEmail: 'contact@aliyaat.com',
      supportPhone: '+213 554 982 123'
    },
    seo: {
      metaTitle: 'Aliyaat - Industrial Machine Maintenance',
      metaDescription: 'Leading provider of industrial machine maintenance and procurement services.'
    },
    notifications: {
      emailNotifications: true,
      newQuoteAlerts: true
    }
  }

  return settings
})