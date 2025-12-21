export default defineEventHandler(async (event) => {
  const { models } = await useDB();
  const { OptionalAdditions, ConfigCategories } = models;
  try {
    const items = await OptionalAdditions.findAll({
      include: [
        {
          model: ConfigCategories,
          through: { attributes: [] }
        }
      ],
      order: [['name', 'ASC']],
    });
    return { success: true, data: items };
  } catch (err) {
    console.error('Error fetching optional additions:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching optional additions.',
    });
  }
});