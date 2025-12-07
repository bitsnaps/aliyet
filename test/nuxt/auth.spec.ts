import { describe, it, expect, beforeAll, vi } from 'vitest';
import { useDB } from '../../server/utils/db';
import { useModels } from '../../server/utils/models.js';
import loginHandler from '../../server/api/auth/login.post.js';
import meHandler from '../../server/api/auth/me.get.js';
import logoutHandler from '../../server/api/auth/logout.post.js';
import { H3Event } from 'h3';

// Mock the event object for POST requests
const mockPostEvent = (body) => {
  return {
    node: {
      req: {},
    },
    context: {},
    readBody: async () => body,
  } as unknown as H3Event;
};

// Mock the event object for GET requests with headers
const mockGetEvent = (headers) => {
  return {
    node: {
      req: { headers },
    },
    context: {},
  } as unknown as H3Event;
};

// Mock h3's readBody since we are providing it in the mock event
vi.mock('h3', async () => {
  const actual = await vi.importActual('h3');
  return {
    ...actual,
    readBody: vi.fn().mockImplementation(event => event.readBody()),
    setCookie: vi.fn(),
    deleteCookie: vi.fn(),
  };
});

describe('Authentication API', () => {
  beforeAll(async () => {
    process.env.ADMIN_EMAIL = 'admin@aliyaat.com';
    process.env.ADMIN_PASSWORD = 'password';
    process.env.JWT_SECRET = 'test-secret';
    
    const { sequelize } = await useDB();
    await sequelize.sync({ force: true });
    const { seedDatabase } = await import('../../server/utils/db.js');
    await seedDatabase();
  });

  describe('POST /api/auth/login', () => {
    it('should allow a user to log in with correct credentials and receive a token', async () => {
      const event = mockPostEvent({ username: 'admin@aliyaat.com', password: 'password' });
      const response = await loginHandler(event);

      expect(response.message).toBe('Login successful');
      expect(response.user?.username).toBe('admin@aliyaat.com');
      expect(response.token).toEqual(expect.any(String));
    });

    it('should reject login with incorrect password', async () => {
      const event = mockPostEvent({ username: 'admin@aliyaat.com', password: 'wrongpassword' });
      const response = await loginHandler(event);
      expect(response.statusCode).toBe(401);
      expect(response.message).toBe('Invalid username or password');
    });

    it('should reject login for a non-existent user', async () => {
      const event = mockPostEvent({ username: 'nouser@aliyaat.com', password: 'password' });
      const response = await loginHandler(event);
      expect(response.statusCode).toBe(401);
      expect(response.message).toBe('Invalid username or password');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return the user data for a valid token', async () => {
      // First, log in to get a token
      const loginEvent = mockPostEvent({ username: 'admin@aliyaat.com', password: 'password' });
      const loginResponse = await loginHandler(loginEvent);
      const token = loginResponse.token;

      // Now, test the /api/auth/me endpoint
      const meEvent = mockGetEvent({ authorization: `Bearer ${token}` });
      const meResponse = await meHandler(meEvent);

      expect(meResponse.user.username).toBe('admin@aliyaat.com');
    });

    it('should throw an error for an invalid token', async () => {
      const meEvent = mockGetEvent({ authorization: 'Bearer invalidtoken' });
      await expect(meHandler(meEvent)).rejects.toThrowError('Invalid token');
    });

    it('should throw an error if no token is provided', async () => {
      const meEvent = mockGetEvent({});
      await expect(meHandler(meEvent)).rejects.toThrowError('Missing or invalid authorization header');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return a success message', async () => {
      const event = mockPostEvent({});
      const response = await logoutHandler(event);
      expect(response.body.message).toBe('Logout successful');
    });
  });
});