import { describe, test, expect, vi, beforeEach } from 'vitest'
import path from 'path'

// Mock dependencies
const mockModels = {
  Machines: {
    findByPk: vi.fn(),
  },
};

const mockMachine = {
  id: 1,
  metadata: {},
  update: vi.fn(),
};

// Global mocks
vi.stubGlobal('useDB', () => ({
  models: mockModels
}));

vi.stubGlobal('defineEventHandler', (handler) => handler);
vi.stubGlobal('getRouterParam', (event, name) => '1');
vi.stubGlobal('createError', (err) => new Error(err.statusMessage));
vi.stubGlobal('useUploadDir', (sub) => path.join('/tmp/uploads', sub || ''));

// Mock fs
vi.mock('fs', () => ({
  promises: {
    mkdir: vi.fn(),
    writeFile: vi.fn(),
    unlink: vi.fn(),
  }
}));

// Mock h3
vi.mock('h3', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    readMultipartFormData: vi.fn(),
  }
});

// Import mock to set return value
import { readMultipartFormData } from 'h3';

describe('Image Upload API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('POST /api/admin/machines/[id]/image - Success', async () => {
    const handler = (await import('../../server/api/admin/machines/[id]/image.post.js')).default;

    // Setup mocks
    const mockFile = {
      name: 'image',
      type: 'image/png',
      data: Buffer.from('fake-image'),
    };
    readMultipartFormData.mockResolvedValue([mockFile]);
    
    mockModels.Machines.findByPk.mockResolvedValue(mockMachine);
    mockMachine.update.mockResolvedValue(true);

    const result = await handler({});

    expect(result.success).toBe(true);
    // expect(result.data.imageUrl).toContain('/images/machines/1-main.png');
    // Expect timestamp in filename
    expect(result.data.imageUrl).toMatch(/\/images\/machines\/1-main-\d+\.png/);
    expect(mockMachine.update).toHaveBeenCalled();
  });

  test('POST /api/admin/machines/[id]/image - Replaces existing image', async () => {
    const handler = (await import('../../server/api/admin/machines/[id]/image.post.js')).default;

    // Setup mocks
    const mockFile = {
      name: 'image',
      type: 'image/jpeg',
      data: Buffer.from('fake-image-2'),
    };
    readMultipartFormData.mockResolvedValue([mockFile]);
    
    // Existing machine has an image
    const existingMachine = {
        ...mockMachine,
        metadata: { imageUrl: '/images/machines/1-main-123456789.png' },
        update: vi.fn(),
    }
    mockModels.Machines.findByPk.mockResolvedValue(existingMachine);
    existingMachine.update.mockResolvedValue(true);

    const result = await handler({});

    expect(result.success).toBe(true);
    expect(result.data.imageUrl).toMatch(/\/images\/machines\/1-main-\d+\.jpg/);
    
    // Check if unlink was called with the old file path
    const { promises: fs } = await import('fs');
    expect(fs.unlink).toHaveBeenCalledWith(expect.stringContaining('1-main-123456789.png'));
  });
});
