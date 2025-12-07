import { useDB } from '../../utils/db';
import { defineEventHandler, readBody, setCookie } from 'h3';
import { verifyPassword } from '../../utils/hash';
import { createToken } from '../../utils/token';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { models } = await useDB();
    const { Users } = models;
  
    const user = await Users.findOne({ where: { username: body.username } });
  
    if (user && await verifyPassword(body.password, user.password)) {
      const userToReturn = { email: user.email, username: user.username, id: user.id };
      const token = createToken(userToReturn);

      setCookie(event, 'token', token, {
        httpOnly: false,
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      });
  
      return {
          statusCode: 200,
          message: 'Login successful',
          user: userToReturn,
          token,
      };
    }
    else {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        message: 'Invalid username or password',
      });
    }
  } catch (error) {
    return {
      statusCode: error?.statusCode || 500,
      statusMessage: error?.statusMessage || 'Internal Server Error',
      message: error?.message || 'An error occurred during login',
    };
  }
});