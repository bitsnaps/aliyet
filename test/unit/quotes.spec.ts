import { describe, test, expect, vi, beforeEach } from 'vitest'

// Simplified mock for all models
const mockModels = {
  ClientConfigSets: {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
  },
  Users: {},
  Machines: {},
  Configurations: {},
  OptionalAdditions: {},
  OptionalReplacements: {},
};

// Simplified mock for DB transaction
const mockTransaction = {
  commit: vi.fn(),
  rollback: vi.fn(),
};

// Global mocks
vi.stubGlobal('useModels', () => mockModels);
vi.stubGlobal('useDB', () => ({
  sequelize: {
    transaction: () => mockTransaction,
  },
  models: mockModels
}));

vi.stubGlobal('defineEventHandler', (handler) => handler);
vi.stubGlobal('getRouterParam', (event, name) => event.context.params[name]);
vi.stubGlobal('readBody', async (event) => event.body);
vi.stubGlobal('createError', (err) => new Error(err.statusMessage));


describe('Quotes API Endpoints (Simplified)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test GET all quotes
  test('GET /api/admin/quotes', async () => {
    const getQuotesHandler = (await import('../../server/api/admin/quotes/index.get.js')).default;
    mockModels.ClientConfigSets.findAll.mockResolvedValue([
      { 
        id: 1, 
        name: 'Test Quote', 
        User: { name: 'Client 1' }, 
        Machine: { name: 'Machine 1' },
        createdAt: new Date(),
        // Mock dataValues for fallback check
        dataValues: { created_at: new Date() }
      }
    ]);
    
    const result = await getQuotesHandler({});
    
    expect(mockModels.ClientConfigSets.findAll).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.data.length).toBe(1);
    expect(result.data[0].name).toBe('Test Quote');
  });

  // Test POST to create a quote
  test('POST /api/admin/quotes', async () => {
    const createQuoteHandler = (await import('../../server/api/admin/quotes/index.post.js')).default;
    const payload = { name: 'New Quote', user_id: 1, machine_id: 2, notes: 'Test notes' };
    
    // Mock the create and association methods
    const mockQuote = { 
      id: 1, 
      ...payload,
      setConfigurations: vi.fn(),
      setOptionalAdditions: vi.fn(),
      setOptionalReplacements: vi.fn()
    };
    mockModels.ClientConfigSets.create.mockResolvedValue(mockQuote);

    const result = await createQuoteHandler({ body: payload });

    expect(mockModels.ClientConfigSets.create).toHaveBeenCalledWith(expect.objectContaining({
      name: 'New Quote',
      user_id: 1,
      machine_id: 2
    }));
    expect(result.success).toBe(true);
  });

  // Test GET a single quote
  test('GET /api/admin/quotes/[id]', async () => {
    const getQuoteHandler = (await import('../../server/api/admin/quotes/[id].get.js')).default;
    const mockQuote = { 
      id: 1, 
      name: 'Single Quote', 
      Machine: { base_price: 1000 },
      Configurations: [{ price: 100 }],
      OptionalAdditions: [{ price: 50 }],
      OptionalReplacements: [],
      createdAt: new Date(),
      dataValues: { created_at: new Date() },
      toJSON: vi.fn().mockReturnValue({})
    };
    mockModels.ClientConfigSets.findByPk.mockResolvedValue(mockQuote);

    const result = await getQuoteHandler({ context: { params: { id: '1' } } });

    expect(mockModels.ClientConfigSets.findByPk).toHaveBeenCalledWith('1', expect.any(Object));
    expect(result.success).toBe(true);
    expect(result.data.name).toBe('Single Quote');
    // 1000 + 100 + 50 = 1150
    expect(result.data.totalPrice).toBe(1150);
  });

  // Test PUT to update a quote
  test('PUT /api/admin/quotes/[id]', async () => {
    const updateQuoteHandler = (await import('../../server/api/admin/quotes/[id].put.js')).default;
    const existingQuote = { 
      id: 1, 
      update: vi.fn().mockResolvedValue(true),
      setConfigurations: vi.fn(),
      setOptionalAdditions: vi.fn(),
      setOptionalReplacements: vi.fn()
    };
    mockModels.ClientConfigSets.findByPk.mockResolvedValue(existingQuote);

    const result = await updateQuoteHandler({ context: { params: { id: '1' } }, body: { name: 'Updated Quote' } });

    expect(mockModels.ClientConfigSets.findByPk).toHaveBeenCalledWith('1');
    expect(existingQuote.update).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated Quote' }));
    expect(result.success).toBe(true);
  });

  // Test DELETE a quote
  test('DELETE /api/admin/quotes/[id]', async () => {
    const deleteQuoteHandler = (await import('../../server/api/admin/quotes/[id].delete.js')).default;
    const existingQuote = { id: 1, destroy: vi.fn().mockResolvedValue(true) };
    mockModels.ClientConfigSets.findByPk.mockResolvedValue(existingQuote);

    const result = await deleteQuoteHandler({ context: { params: { id: '1' } } });

    expect(mockModels.ClientConfigSets.findByPk).toHaveBeenCalledWith('1');
    expect(existingQuote.destroy).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });
});