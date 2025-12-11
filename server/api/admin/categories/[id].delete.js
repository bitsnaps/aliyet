export default defineEventHandler(async (event) => {
    const { models } = await useDB();
  const { Categories } = models;
  const categoryId = event.context.params.id;

  try {
    const category = await Categories.findByPk(categoryId);
    if (!category) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found: Category not found.',
      });
    }

    await category.destroy();

    return {
      statusCode: 200,
      statusMessage: 'Category deleted successfully.',
    };
  } catch (error) {
    console.error('Error deleting category:', error);
    if (error.statusCode) throw error;
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error: Could not delete category.',
    });
  }
});