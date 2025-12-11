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
    const user = await Users.findByPk(userId);

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      });
    }

    await user.destroy();

    return {
      success: true,
      message: 'User deleted successfully',
    };
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error);
    if (error.statusCode) throw error;

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});