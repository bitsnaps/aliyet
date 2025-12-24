import { useDB } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const { models } = await useDB();
  const { Specifications } = models;

  try {
    const uniqueSpecs = await Specifications.findAll({
      attributes: [
        'parameter',
        'unit'
      ],
      group: ['parameter', 'unit'],
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
