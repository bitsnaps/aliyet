import { useDB } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const { models } = await useDB();
  const { Specifications } = models;
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID is required' });
  }

  try {
    const spec = await Specifications.findByPk(id);
    if (!spec) {
      throw createError({ statusCode: 404, statusMessage: 'Specification not found' });
    }

    await spec.update(body);

    return {
      success: true,
      data: spec,
      statusMessage: 'Specification updated successfully',
    };
  } catch (error) {
    console.error('Error updating specification:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal Server Error',
    });
  }
});