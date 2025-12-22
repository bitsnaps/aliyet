export default defineEventHandler(async (event) => {
  const { models } = await useDB();
  const { ClientConfigSets } = models;
  const id = event.context.params.id;
  const body = await readBody(event);

  try {
    const quote = await ClientConfigSets.findByPk(id);

    if (!quote) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Quote not found',
      })
    }

    // Update basic fields
    await quote.update({
      name: body.name,
      notes: body.notes,
      user_id: body.user_id,
      machine_id: body.machine_id
    });

    // Update associations if provided in body
    // This is a simplified approach. A full implementation would handle arrays of IDs.
    // TODO: Extend this implementation to handle arrays of IDs.
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
      message: 'Quote updated successfully',
      data: quote
    }
  } catch (error) {
    console.error('Database update error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
    })
  }
})