export default defineEventHandler(async (event) => {
  // Mock data for categories
  const categories = [
    { id: 1, name: 'Turning Center', machineCount: 12, lastUpdated: '2023-10-25' },
    { id: 2, name: 'Machining Center', machineCount: 8, lastUpdated: '2023-10-20' },
    { id: 3, name: 'EDM Machine', machineCount: 5, lastUpdated: '2023-10-15' },
    { id: 4, name: 'Press', machineCount: 3, lastUpdated: '2023-10-10' },
  ]

  return categories
})