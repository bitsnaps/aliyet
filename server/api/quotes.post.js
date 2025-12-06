export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // In a real application, you would save this to a database
  // and send an email notification.
  console.log('New Quote Submission:', body)

  // For now, just return a success response
  return {
    status: 'success',
    message: 'Quote submitted successfully!',
    data: body
  }
})