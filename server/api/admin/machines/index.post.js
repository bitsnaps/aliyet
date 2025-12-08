import { useDB } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { sequelize, models } = await useDB();
  const { Machines, Specifications } = models;

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
    const newMachine = await Machines.create(machinePayload, { transaction })

    if (specs && specs.length > 0) {
      const specsPayload = specs
        .filter(s => s.parameter && s.value) // Ensure spec is not empty
        .map((spec, index) => ({
          ...spec,
          machine_id: newMachine.id,
          sort_order: index,
        }))
      
      await Specifications.bulkCreate(specsPayload, { transaction })
    }

    await transaction.commit()

    return {
      success: true,
      data: {
        id: newMachine.id,
      },
    }
  } catch (error) {
    await transaction.rollback()
    console.error('Machine creation error:', error)
    
    // Check for unique constraint violation
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw createError({
        statusCode: 409, // Conflict
        statusMessage: 'A machine with this code already exists.',
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }
})