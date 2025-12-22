import { describe, test, expect, vi, beforeEach } from 'vitest'

// Simplified mock for all models
const mockModels = {
  OptionalReplacements: {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
  },
  Configurations: {
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

describe('Optional Replacements API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test GET all optional replacements
  test('GET /api/admin/optional-replacements', async () => {
    const getHandler = (await import('../../server/api/admin/optional-replacements/index.get.js')).default;
    mockModels.OptionalReplacements.findAll.mockResolvedValue([
      { id: 1, name: 'Replacement 1', price: 50, Configurations: [] }
    ]);
    
    const result = await getHandler({});
    
    expect(mockModels.OptionalReplacements.findAll).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.data.length).toBe(1);
  });

  // Test POST to create an optional replacement
  test('POST /api/admin/optional-replacements', async () => {
    const createHandler = (await import('../../server/api/admin/optional-replacements/index.post.js')).default;
    const payload = { name: 'New Replacement', price: '75.00', configurationId: 10 };
    
    const mockCreatedItem = { 
      id: 1, 
      name: 'New Replacement', 
      price: 75, 
      addConfiguration: vi.fn().mockResolvedValue(true) 
    };
    mockModels.OptionalReplacements.create.mockResolvedValue(mockCreatedItem);
    mockModels.Configurations.findByPk.mockResolvedValue({ id: 10, name: 'Config 10' });

    const result = await createHandler({ body: payload });

    expect(mockModels.OptionalReplacements.create).toHaveBeenCalled();
    expect(mockModels.Configurations.findByPk).toHaveBeenCalledWith(10);
    expect(mockCreatedItem.addConfiguration).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  // Test GET a single optional replacement
  test('GET /api/admin/optional-replacements/[id]', async () => {
    const getSingleHandler = (await import('../../server/api/admin/optional-replacements/[id].get.js')).default;
    const mockItem = { 
      id: 1, 
      name: 'Single Replacement', 
      Configurations: [{ id: 10, name: 'Config 10' }],
      toJSON: vi.fn().mockReturnValue({
        id: 1,
        name: 'Single Replacement',
        Configurations: [{ id: 10, name: 'Config 10' }]
      })
    };
    mockModels.OptionalReplacements.findByPk.mockResolvedValue(mockItem);

    const result = await getSingleHandler({ context: { params: { id: '1' } } });

    expect(mockModels.OptionalReplacements.findByPk).toHaveBeenCalledWith('1', expect.any(Object));
    expect(result.success).toBe(true);
    expect(result.data.name).toBe('Single Replacement');
    expect(result.data.configurationId).toBe(10);
  });

  // Test PUT to update an optional replacement
  test('PUT /api/admin/optional-replacements/[id]', async () => {
    const updateHandler = (await import('../../server/api/admin/optional-replacements/[id].put.js')).default;
    const existingItem = { 
      id: 1, 
      update: vi.fn().mockResolvedValue(true),
      setConfigurations: vi.fn().mockResolvedValue(true)
    };
    mockModels.OptionalReplacements.findByPk.mockResolvedValue(existingItem);
    mockModels.Configurations.findByPk.mockResolvedValue({ id: 11, name: 'Config 11' });

    const result = await updateHandler({ 
      context: { params: { id: '1' } }, 
      body: { name: 'Updated Replacement', price: '120,50', configurationId: 11 } 
    });

    expect(mockModels.OptionalReplacements.findByPk).toHaveBeenCalledWith('1');
    expect(existingItem.update).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Updated Replacement',
      price: 120.5
    }));
    expect(existingItem.setConfigurations).toHaveBeenCalledWith([expect.objectContaining({ id: 11 })]);
    expect(result.success).toBe(true);
  });

  // Test DELETE an optional replacement
  test('DELETE /api/admin/optional-replacements/[id]', async () => {
    const deleteHandler = (await import('../../server/api/admin/optional-replacements/[id].delete.js')).default;
    const existingItem = { id: 1, destroy: vi.fn().mockResolvedValue(true) };
    mockModels.OptionalReplacements.findByPk.mockResolvedValue(existingItem);

    const result = await deleteHandler({ context: { params: { id: '1' } } });

    expect(mockModels.OptionalReplacements.findByPk).toHaveBeenCalledWith('1');
    expect(existingItem.destroy).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });
});
