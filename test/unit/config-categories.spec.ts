import { describe, test, expect, vi, beforeEach } from 'vitest'

// Simplified mock for all models
const mockModels = {
  ConfigCategories: {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
  }
};

// Global mocks
vi.stubGlobal('useDB', () => ({
  models: mockModels
}));

vi.stubGlobal('defineEventHandler', (handler) => handler);
vi.stubGlobal('getRouterParam', (event, name) => event.context.params[name]);
vi.stubGlobal('readBody', async (event) => event.body);
vi.stubGlobal('createError', (err) => {
  const error = new Error(err.statusMessage);
  error.statusCode = err.statusCode;
  return error;
});

describe('Configuration Groups (ConfigCategories) API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test GET all categories
  test('GET /api/admin/config-categories', async () => {
    const getHandler = (await import('../../server/api/admin/config-categories/index.get.js')).default;
    mockModels.ConfigCategories.findAll.mockResolvedValue([
      { id: 1, name: 'Group 1' }
    ]);
    
    const result = await getHandler({});
    
    expect(mockModels.ConfigCategories.findAll).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.data.length).toBe(1);
  });

  // Test POST to create a category
  test('POST /api/admin/config-categories', async () => {
    const createHandler = (await import('../../server/api/admin/config-categories/index.post.js')).default;
    const payload = { name: 'New Group' };
    
    mockModels.ConfigCategories.create.mockResolvedValue({ id: 1, ...payload });

    const result = await createHandler({ body: payload });

    expect(mockModels.ConfigCategories.create).toHaveBeenCalledWith(expect.objectContaining({
      name: 'New Group'
    }));
    expect(result.success).toBe(true);
    expect(result.data.name).toBe('New Group');
  });

  // Test GET a single category
  test('GET /api/admin/config-categories/[id]', async () => {
    const getSingleHandler = (await import('../../server/api/admin/config-categories/[id].get.js')).default;
    mockModels.ConfigCategories.findByPk.mockResolvedValue({ id: 1, name: 'Single Group' });

    const result = await getSingleHandler({ context: { params: { id: '1' } } });

    expect(mockModels.ConfigCategories.findByPk).toHaveBeenCalledWith('1');
    expect(result.success).toBe(true);
    expect(result.data.name).toBe('Single Group');
  });

  // Test PUT to update a category
  test('PUT /api/admin/config-categories/[id]', async () => {
    const updateHandler = (await import('../../server/api/admin/config-categories/[id].put.js')).default;
    const existingItem = { id: 1, update: vi.fn().mockResolvedValue(true) };
    mockModels.ConfigCategories.findByPk.mockResolvedValue(existingItem);

    const result = await updateHandler({ 
      context: { params: { id: '1' } }, 
      body: { name: 'Updated Group' } 
    });

    expect(mockModels.ConfigCategories.findByPk).toHaveBeenCalledWith('1');
    expect(existingItem.update).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated Group' }));
    expect(result.success).toBe(true);
  });

  // Test DELETE a category
  test('DELETE /api/admin/config-categories/[id]', async () => {
    const deleteHandler = (await import('../../server/api/admin/config-categories/[id].delete.js')).default;
    const existingItem = { id: 1, destroy: vi.fn().mockResolvedValue(true) };
    mockModels.ConfigCategories.findByPk.mockResolvedValue(existingItem);

    const result = await deleteHandler({ context: { params: { id: '1' } } });

    expect(mockModels.ConfigCategories.findByPk).toHaveBeenCalledWith('1');
    expect(existingItem.destroy).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });
});
