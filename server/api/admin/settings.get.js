import { useDB } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const { models } = await useDB();
  const { Settings } = models;

  // Fetch all settings
  const allSettings = await Settings.findAll();

  // Default settings structure
  const defaults = {
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
  };

  // Merge database settings into defaults
  const settings = { ...defaults };
  
  allSettings.forEach(setting => {
    if (setting.group && setting.data) {
      settings[setting.group] = {
        ...settings[setting.group], // Keep defaults if keys are missing in DB
        ...setting.data
      };
    }
  });

  return settings;
})