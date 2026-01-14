import { useDB } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const { models } = await useDB();
  const { Specifications, Machines } = models;

  try {
    const specs = await Specifications.findAll({
      order: [['parameter', 'ASC']],
    });

    return {
      success: true,
      data: specs,
    };
  } catch (error) {
    console.error('Error fetching specifications:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});