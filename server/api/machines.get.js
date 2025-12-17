
export default defineEventHandler(async (event) => {
  const { models } = await useDB();
  const { Machines, Categories, Specifications } = models;

  try {
    const machines = await Machines.findAll({
      where: { available: true },
      include: [
        { 
          model: Categories,
          attributes: ['id', 'name', 'description', 'metadata']
        },
        {
          model: Specifications,
          attributes: ['parameter', 'value', 'unit', 'sort_order'],
        }
      ],
      order: [['code', 'ASC'], [Specifications, 'sort_order', 'ASC']]
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
  }
})
