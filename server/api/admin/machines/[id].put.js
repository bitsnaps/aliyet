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

    // Update specs associations
    // 1. Remove all associations
    await machine.setSpecifications([], { transaction });

    // 2. Add new associations
    if (specs && specs.length > 0) {
      for (const [index, specData] of specs.entries()) {
        if (!specData.parameter || !specData.value) continue;

        // Find or create the specification (parameter, unit)
        // Note: unit can be null, so we need to handle it carefully in where clause
        const whereClause = { parameter: specData.parameter };
        if (specData.unit) {
          whereClause.unit = specData.unit;
        } else {
          whereClause.unit = null;
        }

        const [spec] = await Specifications.findOrCreate({
          where: whereClause,
          defaults: {
             parameter: specData.parameter,
             unit: specData.unit
          },
          transaction
        });
        
        // Add association with value and sort_order
        await machine.addSpecification(spec, {
          through: {
            value: specData.value,
            sort_order: index
          },
          transaction
        });
      }
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