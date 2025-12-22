export default defineEventHandler(async (event) => {
  const { models } = await useDB();
  const { ClientConfigSets } = models;
  const body = await readBody(event);

  try {
    const quote = await ClientConfigSets.create({
      name: body.name,
      notes: body.notes,
      user_id: body.user_id,
      machine_id: body.machine_id
    });

    if (body.configurationIds) {
      await quote.setConfigurations(body.configurationIds);
    }
    if (body.optionalAdditionIds) {
      await quote.setOptionalAdditions(body.optionalAdditionIds);
    }
    if (body.optionalReplacementIds) {
      await quote.setOptionalReplacements(body.optionalReplacementIds);
    }

    return {
      success: true,
      message: 'Quote created successfully',
      data: quote
    }
  } catch (error) {
    console.error('Database create error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
    })
  }
})