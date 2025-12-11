import { useDB } from '../../../utils/db';
import { hashPassword } from '../../../utils/hash';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { models } = await useDB();
  const { Users } = models;

  const { username, email, password, name, role, active } = body;

  if (!username || !password || !name || !email) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: username, password, name, and email are required.',
    });
  }

  try {
    const hashedPassword = await hashPassword(password);

    const newUser = await Users.create({
      username,
      email,
      password: hashedPassword,
      name,
      role,
      active,
    });

    // Exclude password from the returned data
    const userResponse = newUser.toJSON();
    delete userResponse.password;

    return {
      success: true,
      data: userResponse,
    };
  } catch (error) {
    console.error('User creation error:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw createError({
        statusCode: 409, // Conflict
        statusMessage: 'A user with this username or email already exists.',
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});