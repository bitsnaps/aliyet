export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // IMPORTANT: Replace this with actual database user validation
  if (body.email === 'admin@example.com' && body.password === 'password') {
    // In a real application, you would create a session or JWT here.
    // For this example, we'll simulate a successful login and return a user object.
    const user = { name: 'Admin User', email: body.email, id: 1 }
    return {
      status: 200,
      body: {
        message: 'Login successful',
        user
      }
    }
  }
  else {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
      message: 'Invalid email or password'
    })
  }
})