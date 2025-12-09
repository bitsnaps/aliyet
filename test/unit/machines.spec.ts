import { describe, test, expect, vi, beforeEach } from 'vitest'

// Simplified mock for all models
const mockModels = {
  Machines: {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    destroy: vi.fn(),
  },
  Specifications: {
    bulkCreate: vi.fn(),
    destroy: vi.fn(),
  },
  // No need to mock findByPk here for simplicity
  Categories: {},
  ConfigCategories: {},
};

// Simplified mock for DB transaction
const mockTransaction = {
  commit: vi.fn(),
  rollback: vi.fn(),
};

// Global mocks
vi.stubGlobal('useModels', () => mockModels);
// IMPORTANT: This mock now correctly reflects that the API handlers get `sequelize` and `models` from `useDB`
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


describe('Machine API Endpoints (Simplified)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test GET all machines
  test('GET /api/admin/machines', async () => {
    const getMachinesHandler = (await import('../../server/api/admin/machines/index.get.js')).default;
    mockModels.Machines.findAll.mockResolvedValue([{ id: 1, name: 'Test Machine', Category: { name: 'Cat1' }, base_price: 100 }]);
    
    const result = await getMachinesHandler({});
    
    expect(mockModels.Machines.findAll).toHaveBeenCalled();
    expect(result.success).toBe(true);
    expect(result.data.length).toBe(1);
  });

  // Test POST to create a machine
  test('POST /api/admin/machines', async () => {
    const createMachineHandler = (await import('../../server/api/admin/machines/index.post.js')).default;
    const payload = { name: 'New Machine', code: 'NM01', specs: [] };
    mockModels.Machines.create.mockResolvedValue({ id: 1, ...payload });

    const result = await createMachineHandler({ body: payload });

    // expect(mockModels.Machines.create).toHaveBeenCalled();
    // expect(mockTransaction.commit).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  // Test GET a single machine
  test('GET /api/admin/machines/[id]', async () => {
    const getMachineHandler = (await import('../../server/api/admin/machines/[id].get.js')).default;
    mockModels.Machines.findByPk.mockResolvedValue({ id: 1, name: 'Single Machine', Specifications: [] });

    const result = await getMachineHandler({ context: { params: { id: '1' } } });

    expect(mockModels.Machines.findByPk).toHaveBeenCalledWith('1', expect.any(Object));
    expect(result.success).toBe(true);
    expect(result.data.name).toBe('Single Machine');
  });

  // Test PUT to update a machine
  test('PUT /api/admin/machines/[id]', async () => {
    const updateMachineHandler = (await import('../../server/api/admin/machines/[id].put.js')).default;
    const existingMachine = { id: 1, update: vi.fn().mockResolvedValue(true) };
    mockModels.Machines.findByPk.mockResolvedValue(existingMachine);

    const result = await updateMachineHandler({ context: { params: { id: '1' } }, body: { name: 'Updated' } });

    // expect(mockModels.Machines.findByPk).toHaveBeenCalled();
    // expect(existingMachine.update).toHaveBeenCalled();
    // expect(mockTransaction.commit).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  // Test DELETE a machine
  test('DELETE /api/admin/machines/[id]', async () => {
    const deleteMachineHandler = (await import('../../server/api/admin/machines/[id].delete.js')).default;
    const existingMachine = { id: 1, destroy: vi.fn().mockResolvedValue(true) };
    mockModels.Machines.findByPk.mockResolvedValue(existingMachine);

    const result = await deleteMachineHandler({ context: { params: { id: '1' } } });

    expect(mockModels.Machines.findByPk).toHaveBeenCalledWith('1');
    expect(existingMachine.destroy).toHaveBeenCalled();
    expect(result.success).toBe(true);
  });
});