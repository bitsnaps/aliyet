import { defineEventHandler, deleteCookie } from 'h3';

export default defineEventHandler(async (event) => {
  deleteCookie(event, 'auth-token');

  return {
    status: 200,
    body: {
      message: 'Logout successful',
    },
  };
});