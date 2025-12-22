export default defineEventHandler(async (event) => {
  const { models } = await useDB();
  const { ClientConfigSets } = models;
  const id = event.context.params.id;

  try {
    const quote = await ClientConfigSets.findByPk(id);

    if (!quote) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Quote not found',
      })
    }

    await quote.destroy();

    return {
      success: true,
      message: 'Quote deleted successfully'
    }
  } catch (error) {
    console.error('Database delete error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
    })
  }
})