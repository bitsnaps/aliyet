import { useDB } from '../../../../utils/db';

export default defineEventHandler(async (event) => {
  const modelName = getRouterParam(event, 'model');
  const { models } = await useDB();

  // Case-insensitive lookup for model
  const targetModelName = Object.keys(models).find(m => m.toLowerCase() === modelName.toLowerCase());

  if (!targetModelName) {
    throw createError({
      statusCode: 404,
      statusMessage: `Model '${modelName}' not found.`
    });
  }

  const model = models[targetModelName];
  const attributes = model.rawAttributes;
  const schema = [];

  // Fields to exclude from the import mapping UI by default
  const ignoredFields = ['id', 'created_at', 'updated_at', 'deleted_at'];

  for (const key in attributes) {
    if (ignoredFields.includes(key)) continue;

    const attr = attributes[key];
    // Attempt to determine a readable type
    let type = 'STRING';
    if (attr.type) {
        if (typeof attr.type === 'string') type = attr.type;
        else if (attr.type.key) type = attr.type.key;
        else if (attr.type.constructor && attr.type.constructor.name) type = attr.type.constructor.name;
    }

    schema.push({
      key: key,
      type: type,
      allowNull: attr.allowNull !== false, // Default to true if undefined
      label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
    });
  }

  return schema;
});