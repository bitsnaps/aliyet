export default defineEventHandler(async (event) => {
  const { models } = await useDB();
  const { Machines, Categories } = models;

  try {
    const machines = await Machines.findAll({
      include: [
        { 
          model: Categories,
          attributes: ['name']
        }
      ],
      order: [['code', 'ASC']]
    })

    return {
      success: true,
      data: machines.map(m => ({
        id: m.id,
        code: m.code,
        name: m.name,
        category: m.Category ? m.Category.name : 'N/A',
        price: m.base_price,
        available: m.available
      }))
    }
  } catch (error) {
    console.error('Database fetch error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }
})