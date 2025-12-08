export default defineEventHandler(async (event) => {
  const { models } = await useDB();
  const { Machines, Specifications } = models;
  const machineId = getRouterParam(event, 'id')

  if (!machineId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Machine ID is required',
    })
  }

  try {
    const machine = await Machines.findByPk(machineId)

    if (!machine) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Machine not found',
      })
    }

    // Associated specifications are deleted automatically due to foreign key constraints with ON DELETE CASCADE
    // If not, you would do it manually:
    // await Specifications.destroy({ where: { machine_id: machineId } });

    await machine.destroy()

    return {
      success: true,
      message: 'Machine deleted successfully',
    }
  } catch (error) {
    console.error(`Error deleting machine ${machineId}:`, error)
    if (error.statusCode === 404) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }
})