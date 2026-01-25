import { defineEventHandler } from 'h3';
import { getSettings } from '../utils/settings';

export default defineEventHandler(async (event) => {
  const settings = await getSettings();
  
  // Return only public settings
  return {
    general: settings.general,
    seo: settings.seo
  };
});
