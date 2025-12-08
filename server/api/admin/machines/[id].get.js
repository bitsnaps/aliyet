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
    const machine = await Machines.findByPk(machineId, {
      include: [
        {
          model: Specifications,
          attributes: ['parameter', 'value', 'unit'],
          order: [['sort_order', 'ASC']],
        },
      ],
    })

    if (!machine) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Machine not found',
      })
    }

    // Map to the structure expected by the frontend form state
    const machineData = {
      name: machine.name,
      code: machine.code,
      categoryId: machine.category_id,
      configCategoryId: machine.config_category_id,
      basePrice: machine.base_price,
      available: machine.available,
      description: machine.description,
      url: machine.url,
      specs: machine.Specifications.map(s => ({
        parameter: s.parameter,
        value: s.value,
        unit: s.unit
      }))
    };

    return {
      success: true,
      data: machineData,
    }
  } catch (error) {
    console.error(`Error fetching machine ${machineId}:`, error)
     if (error.statusCode === 404) {
      throw error;
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }
})