export default defineEventHandler(async (event) => {
  const { models } = await useDB();
  const { ClientConfigSets, Users, Machines, Configurations, OptionalAdditions, OptionalReplacements } = models;
  const id = event.context.params.id;

  try {
    const quote = await ClientConfigSets.findByPk(id, {
      include: [
        { model: Users, attributes: ['id', 'name', 'email'] },
        { model: Machines, attributes: ['id', 'name', 'code', 'base_price'] },
        { model: Configurations, through: { attributes: [] } }, // Standard configs
        { model: OptionalAdditions, through: { attributes: [] } },
        { model: OptionalReplacements, through: { attributes: [] } }
      ]
    })

    if (!quote) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Quote not found',
      })
    }

    // Calculate total price
    let totalPrice = Number(quote.Machine?.base_price || 0);
    
    // Add config prices
    if (quote.Configurations) {
        quote.Configurations.forEach(c => totalPrice += Number(c.price || 0));
    }
    // Add addition prices
    if (quote.OptionalAdditions) {
        quote.OptionalAdditions.forEach(a => totalPrice += Number(a.price || 0));
    }
     // Add replacement prices (assuming they are additive or differential, usually replacement price is the cost of the upgrade)
    if (quote.OptionalReplacements) {
        quote.OptionalReplacements.forEach(r => totalPrice += Number(r.price || 0));
    }

    return {
      success: true,
      data: {
        id: quote.id,
        name: quote.name,
        notes: quote.notes,
        createdAt: quote.createdAt || quote.dataValues?.created_at,
        updatedAt: quote.updatedAt || quote.dataValues?.updated_at,
        user_id: quote.user_id,
        machine_id: quote.machine_id,
        User: quote.User,
        Machine: quote.Machine,
        Configurations: quote.Configurations,
        OptionalAdditions: quote.OptionalAdditions,
        OptionalReplacements: quote.OptionalReplacements,
        totalPrice: totalPrice
      }
    }
  } catch (error) {
    console.error('Database fetch error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
    })
  }
})