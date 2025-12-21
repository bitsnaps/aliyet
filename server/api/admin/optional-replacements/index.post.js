import { object, string, number, boolean, parse, nullish } from 'valibot';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { models } = await useDB();
  const { OptionalReplacements, Configurations } = models;

  // Helper to safely cast to number and handle invalid decimal separators
  const toNumber = (val) => {
    if (val === undefined || val === null || val === '') return undefined;
    const n = Number(String(val).replace(',', '.'));
    return isNaN(n) ? undefined : n;
  };

  body.price = toNumber(body.price);
  body.configurationId = toNumber(body.configurationId);

  const schema = object({
    name: string('Name is required.'),
    description: nullish(string(), ''),
    price: nullish(number(), 0),
    available: nullish(boolean(), true),
    configurationId: nullish(number()),
  });

  try {
    const data = parse(schema, body);
    const newItem = await OptionalReplacements.create(data);

    if (data.configurationId) {
      const config = await Configurations.findByPk(data.configurationId);
      if (config) {
        await newItem.addConfiguration(config);
      }
    }

    return { success: true, data: newItem };
  } catch (err) {
    if (err.issues) {
      // Valibot error
      const message = err.issues.map(issue => issue.message).join(' ');
      throw createError({
        statusCode: 400,
        statusMessage: message,
      });
    }
    // Sequelize or other errors
    const message = err.errors?.[0]?.message || 'An error occurred while creating the item.';
    throw createError({
      statusCode: 500,
      statusMessage: message,
    });
  }
});