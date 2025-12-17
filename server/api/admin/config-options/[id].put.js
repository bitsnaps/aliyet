import { useDB } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const optionId = getRouterParam(event, 'id');
  const { models } = await useDB();
  const { ConfigOptions } = models;

  if (!optionId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Option ID is required',
    });
  }

  const optionPayload = {
    name: body.name,
    price: body.price,
    sort_order: body.sort_order
  };

  try {
    const option = await ConfigOptions.findByPk(optionId);

    if (!option) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Option not found',
      });
    }

    await option.update(optionPayload);

    return {
      success: true,
    };
  } catch (error) {
    console.error(`Error updating option ${optionId}:`, error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});