import { useDB } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const optionId = getRouterParam(event, 'id');
  const { models } = await useDB();
  const { ConfigOptions } = models;

  if (!optionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Option ID is required',
    });
  }

  try {
    const option = await ConfigOptions.findByPk(optionId);

    if (!option) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Option not found',
      });
    }

    await option.destroy();

    return {
      success: true,
    };
  } catch (error) {
    console.error(`Error deleting option ${optionId}:`, error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});