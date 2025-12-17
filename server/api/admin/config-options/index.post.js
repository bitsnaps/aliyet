import { useDB } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { models } = await useDB();
  const { ConfigOptions } = models;

  if (!body.config_id || !body.name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Config ID and Name are required',
    });
  }

  const optionPayload = {
    config_id: body.config_id,
    name: body.name,
    price: body.price || 0,
    sort_order: body.sort_order || 0,
  };

  try {
    const newOption = await ConfigOptions.create(optionPayload);

    return {
      success: true,
      data: {
        id: newOption.id,
      },
    };
  } catch (error) {
    console.error('Config option creation error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});