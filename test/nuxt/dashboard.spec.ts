import { describe, it, expect, beforeAll } from 'vitest';
import { useDB } from '../../server/utils/db';
import dashboardHandler from '../../server/api/admin/dashboard.get.js';

// Mock the event object for GET requests
const mockGetEvent = () => {
  return {
    node: {
      req: {},
    },
    context: {},
  };
};

describe('Dashboard API', () => {
  let models;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const { sequelize, models: m } = await useDB();
    models = m;
    await sequelize.sync({ force: true });
  });

  it('should return correct stats and recent quotes', async () => {
    const { Machines, ClientConfigSets, Users, Categories } = models;

    const category = await Categories.create({ name: 'Test Category' });

    const machine1 = await Machines.create({ 
      code: 'M1', 
      name: 'Machine 1', 
      category_id: category.id,
      base_price: 1000 
    });
    
    await Machines.create({ 
      code: 'M2', 
      name: 'Machine 2', 
      category_id: category.id,
      base_price: 2000 
    });

    const customer = await Users.create({ 
      username: 'customer1', 
      email: 'customer1@test.com', 
      password: 'hash', 
      role: 'CUSTOMER' 
    });

    // Create quote with explicit foreign keys
    await ClientConfigSets.create({ 
      name: 'Quote 1', 
      user_id: customer.id, 
      machine_id: machine1.id 
    });

    const event = mockGetEvent() as any;
    const response = await dashboardHandler(event);

    expect(response.success).toBe(true);
    expect(response.stats.machines).toBe(2);
    expect(response.stats.quotes).toBe(1);
    expect(response.stats.customers).toBe(1);
    expect(response.recentQuotes.length).toBe(1);
    expect(response.recentQuotes[0].client).toBe('customer1');
    expect(response.recentQuotes[0].machine).toBe('Machine 1');
  });

  it('should handle empty database gracefully', async () => {
    const { sequelize } = await useDB();
    await sequelize.sync({ force: true });

    const event = mockGetEvent() as any;
    const response = await dashboardHandler(event);

    expect(response.success).toBe(true);
    expect(response.stats.machines).toBe(0);
    expect(response.stats.quotes).toBe(0);
    expect(response.stats.customers).toBe(0);
    expect(response.recentQuotes.length).toBe(0);
  });
});