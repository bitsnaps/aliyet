import { useDB } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { models } = await useDB();
  const { Configurations } = models;

  const configPayload = {
    name: body.name,
    description: body.description,
    type: body.type || 'select',
  };

  try {
    const newConfig = await Configurations.create(configPayload);

    return {
      success: true,
      data: {
        id: newConfig.id,
      },
    };
  } catch (error) {
    console.error('Config creation error:', error);

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