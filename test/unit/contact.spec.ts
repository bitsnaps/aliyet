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
  vi.stubGlobal('createError', (err) => {
    const error: any = new Error(err.statusMessage || err.message)
    error.statusCode = err.statusCode
    error.data = err.data
    return error
  })
  vi.stubGlobal('getRequestIP', () => '127.0.0.1')
  vi.stubGlobal('useRuntimeConfig', () => ({}))
})

describe('Contact API', () => {
  test('uses Ethereal in dev/test and returns success', async () => {
    vi.mock('nodemailer', () => {
      const sendMail = vi.fn(async () => ({ messageId: 'test-msg-id' }))
      const transporter = { sendMail }
      return {
        default: {
          createTestAccount: vi.fn(async () => ({
            smtp: { host: 'ethereal.host', port: 587, secure: false },
            user: 'ethereal-user',
            pass: 'ethereal-pass',
          })),
          createTransport: vi.fn(() => transporter),
          getTestMessageUrl: vi.fn(() => 'http://ethereal.test/preview')
        }
      }
    })
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
    vi.mock('nodemailer', () => {
      const sendMail = vi.fn(async () => ({ messageId: 'test-msg-id' }))
      const transporter = { sendMail }
      return {
        default: {
          createTestAccount: vi.fn(async () => ({
            smtp: { host: 'ethereal.host', port: 587, secure: false },
            user: 'ethereal-user',
            pass: 'ethereal-pass',
          })),
          createTransport: vi.fn(() => transporter),
          getTestMessageUrl: vi.fn(() => 'http://ethereal.test/preview')
        }
      }
    })
    const handler = (await import('../../server/api/contact.post.js')).default
    await handler({ body: validBody })
    await handler({ body: validBody })
    await handler({ body: validBody })
    await expect(handler({ body: validBody })).rejects.toThrowError('Too Many Requests')
  })
})
