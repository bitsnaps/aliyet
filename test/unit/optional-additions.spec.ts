import { describe, test, expect, vi, beforeEach } from 'vitest'

// Simplified mock for all models
const mockModels = {
  OptionalAdditions: {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
  },
  ConfigCategories: {
    findByPk: vi.fn(),
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

describe('Optional Additions API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test GET all optional additions
  test('GET /api/admin/optional-additions', async () => {
    const getHandler = (await import('../../server/api/admin/optional-additions/index.get.js')).default;
    mockModels.OptionalAdditions.findAll.mockResolvedValue([
      { id: 1, name: 'Option 1', price: 100, ConfigCategories: [] }
    ]);
    
    const result = await getHandler({});
    
    expect(mockModels.OptionalAdditions.findAll).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.data.length).toBe(1);
  });

  // Test POST to create an optional addition
  test('POST /api/admin/optional-additions', async () => {
    const createHandler = (await import('../../server/api/admin/optional-additions/index.post.js')).default;
    const payload = { name: 'New Option', price: '150.50', configCategoryId: 1 };
    
    const mockCreatedItem = { 
      id: 1, 
      name: 'New Option', 
      price: 150.5, 
      addConfigCategory: vi.fn().mockResolvedValue(true) 
    };
    mockModels.OptionalAdditions.create.mockResolvedValue(mockCreatedItem);

    const result = await createHandler({ body: payload });

    expect(mockModels.OptionalAdditions.create).toHaveBeenCalled();
    expect(mockCreatedItem.addConfigCategory).toHaveBeenCalledWith(1);
    expect(result.success).toBe(true);
    expect(result.data.id).toBe(1);
  });

  // Test GET a single optional addition
  test('GET /api/admin/optional-additions/[id]', async () => {
    const getSingleHandler = (await import('../../server/api/admin/optional-additions/[id].get.js')).default;
    const mockItem = { 
      id: 1, 
      name: 'Single Option', 
      ConfigCategories: [{ id: 10, name: 'Category 10' }],
      get: vi.fn().mockReturnValue({
        id: 1,
        name: 'Single Option',
        ConfigCategories: [{ id: 10, name: 'Category 10' }]
      })
    };
    mockModels.OptionalAdditions.findByPk.mockResolvedValue(mockItem);

    const result = await getSingleHandler({ context: { params: { id: '1' } } });

    expect(mockModels.OptionalAdditions.findByPk).toHaveBeenCalledWith('1', expect.any(Object));
    expect(result.success).toBe(true);
    expect(result.data.name).toBe('Single Option');
    expect(result.data.configCategoryId).toBe(10);
  });

  // Test PUT to update an optional addition
  test('PUT /api/admin/optional-additions/[id]', async () => {
    const updateHandler = (await import('../../server/api/admin/optional-additions/[id].put.js')).default;
    const existingItem = { 
      id: 1, 
      update: vi.fn().mockResolvedValue(true),
      setConfigCategories: vi.fn().mockResolvedValue(true)
    };
    mockModels.OptionalAdditions.findByPk.mockResolvedValue(existingItem);

    const result = await updateHandler({ 
      context: { params: { id: '1' } }, 
      body: { name: 'Updated Name', price: '200,00', configCategoryId: 2 } 
    });

    expect(mockModels.OptionalAdditions.findByPk).toHaveBeenCalledWith('1');
    expect(existingItem.update).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Updated Name',
      price: 200
    }));
    expect(existingItem.setConfigCategories).toHaveBeenCalledWith([2]);
    expect(result.success).toBe(true);
  });

  // Test DELETE an optional addition
  test('DELETE /api/admin/optional-additions/[id]', async () => {
    const deleteHandler = (await import('../../server/api/admin/optional-additions/[id].delete.js')).default;
    const existingItem = { id: 1, destroy: vi.fn().mockResolvedValue(true) };
    mockModels.OptionalAdditions.findByPk.mockResolvedValue(existingItem);

    const result = await deleteHandler({ context: { params: { id: '1' } } });

    expect(mockModels.OptionalAdditions.findByPk).toHaveBeenCalledWith('1');
    expect(existingItem.destroy).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });
});
