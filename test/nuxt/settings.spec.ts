import { describe, it, expect, beforeAll } from 'vitest';
import { useDB } from '../../server/utils/db';
import settingsHandler from '../../server/api/settings.get';
import adminSettingsHandler from '../../server/api/admin/settings.get';

// Mock the event object
const mockEvent = () => ({
    node: { req: {} },
    context: {}
});

describe('Settings API', () => {
  let models;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    const { sequelize, models: m } = await useDB();
    models = m;
    await sequelize.sync({ force: true });
  });

  it('GET /api/settings returns public settings with defaults', async () => {
    const event = mockEvent();
    const response = await settingsHandler(event);

    expect(response).toHaveProperty('general');
    // Check default value
    expect(response.general.supportPhone).toBeDefined();
    expect(response.general.address).toBeDefined();
    expect(response.general.maps).toBeDefined();
    
    expect(response).toHaveProperty('seo');
    expect(response).not.toHaveProperty('notifications');
  });

  it('GET /api/admin/settings returns all settings', async () => {
    const event = mockEvent();
    const response = await adminSettingsHandler(event);

    expect(response).toHaveProperty('general');
    expect(response).toHaveProperty('seo');
    expect(response).toHaveProperty('notifications');
    expect(response.general.address).toBeDefined();
  });
  
  it('Should retrieve updated settings from DB', async () => {
    const { Settings } = models;
    // Update settings in DB
    await Settings.create({
        group: 'general',
        data: {
            supportPhone: '+1234567890',
            siteName: 'Updated Site',
            address: 'New Address',
            maps: 'http://newmaps.com'
        }
    });
    
    const event = mockEvent();
    const response = await settingsHandler(event);
    
    expect(response.general.supportPhone).toBe('+1234567890');
    expect(response.general.siteName).toBe('Updated Site');
    expect(response.general.address).toBe('New Address');
    expect(response.general.maps).toBe('http://newmaps.com');
    // Check if other fields persist from defaults (contactEmail)
    expect(response.general.contactEmail).toBe('contact@aliyaat.com');
  });
});
