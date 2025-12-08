import { useDB } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const machineId = getRouterParam(event, 'id');
  const { sequelize, models } = await useDB();
  const { Machines, Specifications } = models;

  if (!machineId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Machine ID is required',
    })
  }

  const { specs, ...machineData } = body

  // Map frontend state to backend model columns
  const machinePayload = {
    name: machineData.name,
    code: machineData.code,
    category_id: machineData.categoryId,
    config_category_id: machineData.configCategoryId,
    base_price: machineData.basePrice,
    available: machineData.available,
    description: machineData.description,
    url: machineData.url,
  }

  const transaction = await sequelize.transaction()

  try {
    const machine = await Machines.findByPk(machineId, { transaction })

    if (!machine) {
      await transaction.rollback()
      throw createError({
        statusCode: 404,
        statusMessage: 'Machine not found',
      })
    }

    // Update machine details
    await machine.update(machinePayload, { transaction })

    // Delete existing specs
    await Specifications.destroy({ where: { machine_id: machineId }, transaction })

    // Create new specs
    if (specs && specs.length > 0) {
      const specsPayload = specs
        .filter(s => s.parameter && s.value) // Ensure spec is not empty
        .map((spec, index) => ({
          ...spec,
          machine_id: machineId,
          sort_order: index,
        }))
      
      await Specifications.bulkCreate(specsPayload, { transaction })
    }

    await transaction.commit()

    return {
      success: true,
      data: {
        id: machine.id,
      },
    }
  } catch (error) {
    await transaction.rollback()
    console.error('Machine update error:', error)
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw createError({
        statusCode: 409,
        statusMessage: 'A machine with this code already exists.',
      })
    }
    
    if (error.statusCode === 404) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }
})