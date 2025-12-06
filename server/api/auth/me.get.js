import { verifyToken } from '../../utils/token';
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
  const authHeader = event.node.req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Missing or invalid authorization header',
    });
  }

  const token = authHeader.split(' ')[1];
  const user = verifyToken(token);

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Invalid token',
    });
  }

  return { user };
});