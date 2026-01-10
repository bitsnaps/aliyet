import { useDB } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const { models } = await useDB();
  const { Specifications } = models;
  const body = await readBody(event);

  try {
    const spec = await Specifications.create(body);
    return {
      success: true,
      data: spec,
      statusMessage: 'Specification created successfully',
    };
  } catch (error) {
    console.error('Error creating specification:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || 'Internal Server Error',
    });
  }
});