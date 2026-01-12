import { useDB } from '../../../../utils/db';

export default defineEventHandler(async (event) => {
  const { id } = event.context.params;
  const { models } = await useDB();
  const { 
    ConfigCategories, 
    Configurations, 
    OptionalAdditions, 
    ConfigCategoryConfigurations, 
    ConfigOptionalCompatibility 
  } = models;

  try {
    const category = await ConfigCategories.findByPk(id, {
      include: [
        {
          model: Configurations,
          through: {
            model: ConfigCategoryConfigurations,
            attributes: ['sort_order']
          },
          attributes: ['id', 'name']
        },
        {
          model: OptionalAdditions,
          through: {
            model: ConfigOptionalCompatibility,
            attributes: ['sort_order']
          },
          attributes: ['id', 'name']
        }
      ]
    });

    if (!category) {
      throw createError({ statusCode: 404, statusMessage: 'Configuration Group not found' });
    }

    // Format response
    const configurations = category.Configurations.map(c => ({
      id: c.id,
      name: c.name,
      sort_order: c.ConfigCategoryConfigurations.sort_order
    })).sort((a, b) => a.sort_order - b.sort_order);

    const optionals = category.OptionalAdditions.map(o => ({
      id: o.id,
      name: o.name,
      sort_order: o.ConfigOptionalCompatibility.sort_order
    })).sort((a, b) => a.sort_order - b.sort_order);

    // Also fetch ALL available items for selection
    const allConfigurations = await Configurations.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    const allOptionals = await OptionalAdditions.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']]
    });

    return {
      success: true,
      data: {
        configurations,
        optionals,
        available: {
          configurations: allConfigurations,
          optionals: allOptionals
        }
      }
    };

  } catch (err) {
    console.error('Fetch Associations Error:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to fetch associations'
    });
  }
});