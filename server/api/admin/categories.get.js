export default defineEventHandler(async (event) => {
  const { models } = await useDB();
  const { Categories } = models;

  try {
    const categories = await Categories.findAll({
      order: [['id', 'ASC']]
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