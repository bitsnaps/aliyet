import { useDB } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  try {
    const { models } = await useDB();
    return Object.keys(models);
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch models: ${error.message}`
    });
  }
});
