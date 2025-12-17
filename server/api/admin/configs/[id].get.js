export default defineEventHandler(async (event) => {
  const { models } = await useDB();
  const { Configurations } = models;
  const configId = getRouterParam(event, 'id');

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

    const configData = {
      id: config.id,
      name: config.name,
      description: config.description,
    };

    return {
      success: true,
      data: configData,
    };
  } catch (error) {
    console.error(`Error fetching config ${configId}:`, error);
    if (error.statusCode === 404) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});