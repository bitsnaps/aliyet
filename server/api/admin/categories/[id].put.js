export default defineEventHandler(async (event) => {
    const { models } = await useDB();
  const { Categories } = models;
  const categoryId = event.context.params.id;
  const { name, description, machine_type, metadata } = await readBody(event);

  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request: Category name is required.',
    });
  }

  try {
    const category = await Categories.findByPk(categoryId);
    if (!category) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Not Found: Category not found.',
      });
    }

    await category.update({ name, description, machine_type, metadata });

    return {
      statusCode: 200,
      statusMessage: 'Category updated successfully.',
      data: category,
    };
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.statusCode) throw error;
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error: Could not update category.',
    });
  }
});