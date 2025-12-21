export default defineEventHandler(async (event) => {
  const { models } = await useDB();
  const { OptionalReplacements, Configurations } = models;
  try {
    const items = await OptionalReplacements.findAll({
      include: [
        {
          model: Configurations,
          through: { attributes: [] }
        }
      ],
      order: [['name', 'ASC']],
    });
    return { success: true, data: items };
  } catch (err) {
    console.error('Error fetching optional replacements:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error fetching optional replacements.',
    });
  }
});