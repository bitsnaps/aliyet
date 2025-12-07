export default defineEventHandler(async (event) => {
  // Mock data for users
  const users = [
    { id: 1, name: 'Admin User', email: 'admin@aliyaat.com', role: 'Admin', status: 'Active', lastLogin: '2023-10-26 10:30' },
    { id: 2, name: 'John Doe', email: 'john@example.com', role: 'Editor', status: 'Active', lastLogin: '2023-10-25 14:15' },
    { id: 3, name: 'Jane Smith', email: 'jane@example.com', role: 'Viewer', status: 'Inactive', lastLogin: '2023-09-15 09:00' },
  ]

  return users
})