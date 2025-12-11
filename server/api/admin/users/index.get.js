export default defineEventHandler(async (event) => {
  const { models } = await useDB();
  const { Users } = models;

  try {
    const users = await Users.findAll({
      order: [['id', 'ASC']],
      attributes: { exclude: ['password'] } // Exclude password from the response
    });

    return {
      success: true,
      data: users
    };
  } catch (error) {
    console.error('Database fetch error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});