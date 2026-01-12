import { useDB } from '../../../../utils/db';
import { object, array, number, parse } from 'valibot';

export default defineEventHandler(async (event) => {
  const { id } = event.context.params;
  const body = await readBody(event);
  const { models } = await useDB();
  const { ConfigCategories, ConfigCategoryConfigurations, ConfigOptionalCompatibility } = models;

  // Validation Schema
  const schema = object({
    configurations: array(object({
      id: number(),
      sort_order: number()
    })),
    optionals: array(object({
      id: number(),
      sort_order: number()
    }))
  });

  try {
    const { configurations, optionals } = parse(schema, body);

    // Verify category exists
    const category = await ConfigCategories.findByPk(id);
    if (!category) {
      throw createError({ statusCode: 404, statusMessage: 'Configuration Group not found' });
    }

    // Update Configurations Associations
    // 1. Clear existing
    await ConfigCategoryConfigurations.destroy({
      where: { config_category_id: id }
    });

    // 2. Create new
    if (configurations.length > 0) {
      const configRecords = configurations.map(c => ({
        config_category_id: id,
        configuration_id: c.id,
        sort_order: c.sort_order
      }));
      await ConfigCategoryConfigurations.bulkCreate(configRecords);
    }

    // Update Optional Additions Associations
    // 1. Clear existing
    await ConfigOptionalCompatibility.destroy({
      where: { config_category_id: id }
    });

    // 2. Create new
    if (optionals.length > 0) {
      const optionalRecords = optionals.map(o => ({
        config_category_id: id,
        optional_addition_id: o.id,
        sort_order: o.sort_order
      }));
      await ConfigOptionalCompatibility.bulkCreate(optionalRecords);
    }

    return { success: true };

  } catch (err) {
    console.error('Update Associations Error:', err);
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.statusMessage || 'Failed to update associations'
    });
  }
});