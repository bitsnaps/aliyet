export default defineEventHandler(async (event) => {
  const { models } = await useDB();
  const { Configurations } = models;

  try {
    const configs = await Configurations.findAll({
      order: [['name', 'ASC']]
    });

    return {
      success: true,
      data: configs.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        type: c.type,
      }))
    }
  } catch (error) {
    console.error('Database fetch error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});