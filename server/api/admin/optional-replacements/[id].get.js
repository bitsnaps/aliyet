export default defineEventHandler(async (event) => {
  const { models } = await useDB();
  const { OptionalReplacements, Configurations } = models;
  const { id } = event.context.params;

  try {
    const item = await OptionalReplacements.findByPk(id, {
      include: [
        {
          model: Configurations,
          through: { attributes: [] }
        }
      ]
    });
    
    if (!item) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Optional Replacement not found.',
      });
    }

    const data = item.toJSON();
    data.configurationId = item.Configurations?.[0]?.id || null;

    return { success: true, data };
  } catch (err) {
    const message = err.message || 'Error fetching optional replacement.';
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: message,
    });
  }
});