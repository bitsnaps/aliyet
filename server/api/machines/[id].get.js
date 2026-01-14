export default defineEventHandler(async (event) => {
  const { models } = await useDB();
  const { Machines, Categories, Specifications } = models;

  const machineId = getRouterParam(event, 'id')

  if (!machineId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Machine ID is required',
    })
  }

  try {
    const machine = await Machines.findOne({
      where: { id: machineId, available: true },
      include: [
        {
          model: Categories,
          attributes: ['id', 'name', 'description', 'metadata'],
        },
        {
          model: Specifications,
          attributes: ['parameter', 'unit'],
          through: {
            attributes: ['value', 'sort_order']
          }
        },
      ],
      order: [[Specifications, models.MachineSpecifications, 'sort_order', 'ASC']],
    })

    if (!machine) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Machine not found',
      })
    }

    const machineData = machine.toJSON();
    if (machineData.Specifications) {
      machineData.Specifications = machineData.Specifications.map(s => ({
        ...s,
        value: s.MachineSpecifications?.value
      }));
    }

    return {
      success: true,
      data: machineData,
    }
  } catch (error) {
    if (error?.statusCode === 404) {
      throw error
    }

    console.error(`Database fetch error (machine ${machineId}):`, error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }
})
