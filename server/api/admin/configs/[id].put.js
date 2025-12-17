import { useDB } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const configId = getRouterParam(event, 'id');
  const { models } = await useDB();
  const { Configurations } = models;

  if (!configId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Config ID is required',
    });
  }

  const configPayload = {
    name: body.name,
    description: body.description,
  };

  try {
    const config = await Configurations.findByPk(configId);

    if (!config) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Config not found',
      });
    }

    await config.update(configPayload);

    return {
      success: true,
    };
  } catch (error) {
    console.error(`Error updating config ${configId}:`, error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw createError({
        statusCode: 409, // Conflict
        statusMessage: 'A configuration with this name already exists.',
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});