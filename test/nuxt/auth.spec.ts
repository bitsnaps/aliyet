import { describe, it, expect, beforeAll, vi } from 'vitest';
import { useDB } from '../../server/utils/db.js';
import { useModels } from '../../server/utils/models.js';
import loginHandler from '../../server/api/auth/login.post.js';
import { readBody, H3Event } from 'h3';


// Mock the event object
const mockEvent = (body) => {
  return {
    node: {
      req: {},
    },
    context: {},
    readBody: async () => body,
  } as unknown as H3Event;
};

// Mock readBody
vi.mock('h3', async () => {
  const actual = await vi.importActual('h3');
  return {
    ...actual,
    readBody: async (event) => event.readBody(),
  };
});

describe('Authentication API', () => {
  beforeAll(async () => {
    // Ensure the database and tables are set up
    const sequelize = useDB();
    await sequelize.sync({ force: true }); // Use force: true to reset the DB for tests
    const { seedDatabase } = await import('../../server/utils/db.js');
    await seedDatabase();
  });

  it('should allow an admin to log in with correct credentials', async () => {
    const event = mockEvent({ username: 'admin', password: 'password' });
    const response = await loginHandler(event);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
    expect(response.body.user.username).toBe('admin');
  });

  it('should reject login with incorrect password', async () => {
    const event = mockEvent({ username: 'admin', password: 'wrongpassword' });

    await expect(loginHandler(event)).rejects.toThrowError();
  });

  it('should reject login for a non-existent user', async () => {
    const event = mockEvent({ username: 'nouser', password: 'password' });
    
    await expect(loginHandler(event)).rejects.toThrowError();
  });
});