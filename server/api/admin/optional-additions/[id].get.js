export default defineEventHandler(async (event) => {
  const { models } = await useDB();
  const { OptionalAdditions, ConfigCategories } = models;
  const { id } = event.context.params;

  try {
    const item = await OptionalAdditions.findByPk(id, {
      include: [
        {
          model: ConfigCategories,
          through: { attributes: [] },
        },
      ],
    });

    if (!item) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Optional Addition not found.',
      });
    }

    // Map the first ConfigCategory to configCategoryId for the frontend
    const plainItem = item.get({ plain: true });
    plainItem.configCategoryId = plainItem.ConfigCategories?.[0]?.id || null;

    return { success: true, data: plainItem };
  } catch (err) {
    const message = err.message || 'Error fetching optional addition.';
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: message,
    });
  }
});