/**
 * `request()` is the single fetch wrapper every `api.*` call funnels through
 * (#869): backend error text must reach the UI for 4xx validation problems, but
 * never for 5xx, where the body is written for operators.
 */
import { ApiError, request } from './shared'

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('request() error mapping', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('shows the backend message for a 4xx validation error', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      jsonResponse(400, { error: 'Email is not valid', code: 'VALIDATION', field: 'email' })
    )

    await expect(request('/auth/register', { method: 'POST', body: {} })).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Email is not valid',
      status: 400,
      code: 'VALIDATION',
      field: 'email',
    })
  })

  it('hides a 5xx body behind a generic message and keeps it in detail', async () => {
    const internal = 'panic: sql: no rows in result set (query 41)'
    jest.spyOn(global, 'fetch').mockResolvedValue(jsonResponse(500, { error: internal }))

    await expect(request('/payments')).rejects.toMatchObject({
      message: 'Something went wrong on our side. Please try again.',
      status: 500,
      detail: expect.stringContaining('sql: no rows'),
    })
  })

  it('never leaks a 5xx body that is not JSON', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response('<html>Internal Server Error</html>', { status: 502 })
    )

    const error = await request('/payments').catch((e) => e as ApiError)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.message).toBe('Something went wrong on our side. Please try again.')
    expect(error.message).not.toContain('Internal Server Error')
  })
})
