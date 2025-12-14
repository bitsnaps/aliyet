import { describe, test, expect, vi, beforeEach } from 'vitest'

const validBody = {
  name: 'John Doe',
  email: 'john@example.com',
  tel: '12345678',
  subject: 'Maintenance',
  company: 'ACME',
  jobTitle: 'Engineer',
  message: 'Hello, this is a valid message with enough length.'
}

beforeEach(() => {
  vi.resetModules()
  vi.stubGlobal('defineEventHandler', (handler) => handler)
  vi.stubGlobal('readBody', async (event) => event.body)
  vi.stubGlobal('createError', (err) => new Error(err.statusMessage))
  vi.stubGlobal('getRequestIP', () => '127.0.0.1')
})

describe('Contact API', () => {
  test('returns success in dev when SMTP config is missing', async () => {
    delete process.env.SMTP_HOST
    const handler = (await import('../../server/api/contact.post.js')).default
    const res = await handler({ body: validBody })
    expect(res.success).toBe(true)
  })

  test('throws validation error for invalid email', async () => {
    const handler = (await import('../../server/api/contact.post.js')).default
    await expect(handler({ body: { ...validBody, email: 'invalid' } })).rejects.toThrowError('Validation Error')
  })

  test('rate limiting blocks after 3 requests', async () => {
    const handler = (await import('../../server/api/contact.post.js')).default
    await handler({ body: validBody })
    await handler({ body: validBody })
    await handler({ body: validBody })
    await expect(handler({ body: validBody })).rejects.toThrowError('Too Many Requests')
  })
})
