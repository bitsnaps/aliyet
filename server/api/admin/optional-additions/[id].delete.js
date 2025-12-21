export default defineEventHandler(async (event) => {
  const { id } = event.context.params;
  const { models } = await useDB();
  const { OptionalAdditions } = models;

  try {
    const item = await OptionalAdditions.findByPk(id);

    if (!item) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Optional Addition not found.',
      });
    }

    await item.destroy();
    return { success: true };
  } catch (err) {
    const message = err.message || 'Error deleting optional addition.';
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: message,
    });
  }
});