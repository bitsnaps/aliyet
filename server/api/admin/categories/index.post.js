export default defineEventHandler(async (event) => {
    const { models } = await useDB();
  const { Categories } = models;
  const body = await readBody(event);

  if (!body.name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request: Category name is required.',
    });
  }

  try {
    const newCategory = await Categories.create({
      name: body.name,
      description: body.description
    });
    return {
      statusCode: 201,
      statusMessage: 'Category created successfully.',
      data: newCategory,
    };
  } catch (error) {
    console.error('Error creating category:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error: Could not create category.',
    });
  }
});