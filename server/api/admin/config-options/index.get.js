import { useDB } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const { configId } = getQuery(event);
  const { models } = await useDB();
  const { ConfigOptions } = models;

  if (!configId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Configuration ID is required',
    });
  }

  try {
    const options = await ConfigOptions.findAll({
      where: { config_id: configId },
      order: [['sort_order', 'ASC']],
    });

    return {
      success: true,
      data: options.map(o => ({
        id: o.id,
        name: o.name,
        price: o.price,
        sort_order: o.sort_order,
        config_id: o.config_id,
      })),
    };
  } catch (error) {
    console.error('Database fetch error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});