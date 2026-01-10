import { useDB } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const { models } = await useDB();
  const { Specifications } = models;
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID is required' });
  }

  try {
    const spec = await Specifications.findByPk(id);
    if (!spec) {
      throw createError({ statusCode: 404, statusMessage: 'Specification not found' });
    }

    await spec.destroy();

    return {
      success: true,
      statusMessage: 'Specification deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting specification:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal Server Error',
    });
  }
});