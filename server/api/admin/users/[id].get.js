export default defineEventHandler(async (event) => {
  const { models } = await useDB();
  const { Users } = models;
  const userId = getRouterParam(event, 'id');

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required',
    });
  }

  try {
    const user = await Users.findByPk(userId, {
      attributes: { exclude: ['password'] } // Exclude password from the response
    });

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      });
    }

    return {
      success: true,
      data: user,
    };
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    if (error.statusCode) throw error;

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});