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
      for (const [index, specData] of specs.entries()) {
        if (!specData.parameter || !specData.value) continue;
        
        const [spec] = await Specifications.findOrCreate({
          where: { 
            parameter: specData.parameter,
            unit: specData.unit || null 
          },
          defaults: { 
            parameter: specData.parameter, 
            unit: specData.unit || null 
          },
          transaction
        });

        await newMachine.addSpecification(spec, {
          through: { value: specData.value, sort_order: index },
          transaction
        });
      }
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