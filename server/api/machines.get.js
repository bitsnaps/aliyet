
export default defineEventHandler(async (event) => {
  /*
  const { Machines, Categories, Specifications } = useModels()

  try {
    const machines = await Machines.findAll({
      where: { available: true },
      include: [
        { 
          model: Categories,
          attributes: ['name']
        },
        {
          model: Specifications,
          attributes: ['parameter', 'value', 'unit'],
          order: [['sort_order', 'ASC']]
        }
      ],
      order: [['code', 'ASC']]
    })

    return {
      success: true,
      data: machines
    }
  } catch (error) {
    console.error('Database fetch error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }*/
    return {
      success: true,
      data: []
    } 
})