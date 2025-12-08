export default defineEventHandler(async (event) => {
  const { models } = await useDB();
  const { ConfigCategories } = models;

  try {
    const categories = await ConfigCategories.findAll({
      order: [['name', 'ASC']]
    })

    return {
      success: true,
      data: categories
    }
  } catch (error) {
    console.error('Database fetch error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }
})