import { useDB } from '../../../utils/db';
import { hashPassword } from '../../../utils/hash';

export default defineEventHandler(async (event) => {
  const userId = getRouterParam(event, 'id');
  const body = await readBody(event);
  const { models } = await useDB();
  const { Users } = models;

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required',
    });
  }

  const { username, email, password, name, role, active } = body;

  try {
    const user = await Users.findByPk(userId);

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      });
    }

    const updateData = {
      username,
      email,
      name,
      role,
      active,
    };

    // If a new password is provided, hash it. Otherwise, keep the old one.
    if (password) {
      updateData.password = await hashPassword(password);
    }

    await user.update(updateData);

    const userResponse = user.toJSON();
    delete userResponse.password;

    return {
      success: true,
      data: userResponse,
    };
  } catch (error) {
    console.error(`Error updating user ${userId}:`, error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw createError({
        statusCode: 409,
        statusMessage: 'A user with this username or email already exists.',
      });
    }
    if (error.statusCode) throw error;
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});