export default defineEventHandler(async (event) => {
  const { id } = event.context.params;
  const { models } = await useDB();
  const { OptionalReplacements } = models;

  try {
    const item = await OptionalReplacements.findByPk(id);

    if (!item) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Optional Replacement not found.',
      });
    }

    await item.destroy();
    return { success: true };
  } catch (err) {
    const message = err.message || 'Error deleting optional replacement.';
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: message,
    });
  }
});