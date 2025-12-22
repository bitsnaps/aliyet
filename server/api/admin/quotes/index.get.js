export default defineEventHandler(async (event) => {
  const { models } = await useDB();
  const { ClientConfigSets, Users, Machines } = models;

  try {
    const quotes = await ClientConfigSets.findAll({
      include: [
        { 
          model: Users,
          attributes: ['id', 'name', 'email']
        },
        {
          model: Machines,
          attributes: ['id', 'name', 'code']
        }
      ],
      order: [['created_at', 'DESC']]
    })

    return {
      success: true,
      data: quotes.map(q => ({
        id: q.id,
        name: q.name,
        notes: q.notes,
        createdAt: q.createdAt || q.dataValues?.created_at,
        user: q.User ? { id: q.User.id, name: q.User.name, email: q.User.email } : null,
        machine: q.Machine ? { id: q.Machine.id, name: q.Machine.name, code: q.Machine.code } : null
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