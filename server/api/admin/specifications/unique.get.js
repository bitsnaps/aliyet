import { useDB } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const { models } = await useDB();
  const { Specifications } = models;

  try {
    // This endpoint might be redundant now as index.get.js returns unique specs (conceptually)
    // But for backward compatibility or strict unique check:
    const uniqueSpecs = await Specifications.findAll({
      attributes: ['id', 'parameter', 'unit'],
      order: [['parameter', 'ASC']]
    });

    return {
      success: true,
      data: uniqueSpecs
    };
  } catch (error) {
    console.error('Error fetching unique specifications:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});
