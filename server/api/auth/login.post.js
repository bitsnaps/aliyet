import { useModels } from '../../utils/models';
import { defineEventHandler, readBody } from 'h3';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { Users } = useModels();

  const user = await Users.findOne({ where: { username: body.username } });

  // IMPORTANT: In a real application, you should hash the password
  if (user && body.password === user.password) {
    // In a real application, you would create a session or JWT here.
    // For this example, we'll simulate a successful login and return a user object.
    const userToReturn = { name: user.name, username: user.username, id: user.id };
    return {
      status: 200,
      body: {
        message: 'Login successful',
        user: userToReturn,
      },
    };
  }
  else {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Invalid username or password',
    });
  }
});