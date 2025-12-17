import { useDB } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const configId = getRouterParam(event, 'id');
  const { models } = await useDB();
  const { Configurations } = models;

  if (!configId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Config ID is required',
    });
  }

  try {
    const config = await Configurations.findByPk(configId);

    if (!config) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Config not found',
      });
    }

    await config.destroy();

    return {
      success: true,
    };
  } catch (error) {
    console.error(`Error deleting config ${configId}:`, error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});