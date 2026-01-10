import { useDB } from '../../../utils/db';

export default defineEventHandler(async (event) => {
  const { id } = event.context.params;
  const { models } = await useDB();
  const { 
    Machines, 
    ConfigCategories, 
    Configurations, 
    ConfigOptions, 
    OptionalAdditions,
    ConfigCategoryConfigurations,
    ConfigOptionalCompatibility
  } = models;

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Machine ID is required',
    });
  }

  try {
    const machine = await Machines.findByPk(id, {
      include: [
        {
          model: ConfigCategories,
          include: [
            {
              model: Configurations,
              through: {
                model: ConfigCategoryConfigurations,
                attributes: ['sort_order']
              },
              include: [
                {
                  model: ConfigOptions,
                  order: [['sort_order', 'ASC']]
                }
              ]
            },
            {
              model: OptionalAdditions,
              through: {
                model: ConfigOptionalCompatibility,
                attributes: ['sort_order']
              }
            }
          ]
        }
      ]
    });

    if (!machine) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Machine not found',
      });
    }

    if (!machine.ConfigCategory) {
       return {
          success: true,
          data: {
              main: [],
              optional: []
          }
       }
    }

    // Process and sort the data
    const configCategory = machine.ConfigCategory;
    
    // Sort configurations by sort_order from junction table
    const mainConfigs = configCategory.Configurations.sort((a, b) => {
       return (a.ConfigCategoryConfigurations?.sort_order || 0) - (b.ConfigCategoryConfigurations?.sort_order || 0);
    }).map(config => ({
      id: config.id,
      name: config.name,
      description: config.description,
      type: config.type || 'select',
      price: config.price,
      options: config.ConfigOptions ? config.ConfigOptions.map(opt => ({
        id: opt.id,
        name: opt.name,
        price: opt.price
      })) : []
    }));

    // Sort optional additions by sort_order from junction table
    const optionalConfigs = configCategory.OptionalAdditions.sort((a, b) => {
        return (a.ConfigOptionalCompatibility?.sort_order || 0) - (b.ConfigOptionalCompatibility?.sort_order || 0);
    }).map(opt => ({
      id: opt.id,
      name: opt.name,
      description: opt.description,
      price: opt.price,
      type: 'checkbox' // Optional additions are always checkboxes (yes/no)
    }));

    return {
      success: true,
      data: {
        main: mainConfigs,
        optional: optionalConfigs
      }
    };

  } catch (error) {
    console.error(`Error fetching machine config ${id}:`, error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});