export default defineEventHandler(async (event) => {
  const { id } = event.context.params;
  const { models } = await useDB();
  const { ConfigCategories } = models;

  try {
    const item = await ConfigCategories.findByPk(id);

    if (!item) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Configuration Group not found.',
      });
    }

    return { success: true, data: item };
  } catch (err) {
    const message = err.message || 'Error fetching configuration group.';
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: message,
    });
  }
});
