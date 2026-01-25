import { defineEventHandler } from 'h3';
import { getSettings } from '../../utils/settings';

export default defineEventHandler(async (event) => {
  return await getSettings();
})
