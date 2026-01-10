import { useDB } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const { models } = await useDB();
  const { Specifications, Machines } = models;

  try {
    const specs = await Specifications.findAll({
      include: [
        {
          model: Machines,
          attributes: ['name', 'code', 'id'],
        },
      ],
      order: [['created_at', 'DESC']],
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