import { object, string, parse, nullish } from 'valibot';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { models } = await useDB();
  const { ConfigCategories } = models;

  const schema = object({
    name: string('Name is required.'),
    description: nullish(string(), ''),
  });

  try {
    const data = parse(schema, body);
    const newItem = await ConfigCategories.create(data);

    return { success: true, data: newItem };
  } catch (err) {
    if (err.issues) {
      const message = err.issues.map(issue => issue.message).join(' ');
      throw createError({
        statusCode: 400,
        statusMessage: message,
      });
    }
    const message = err.errors?.[0]?.message || 'An error occurred while creating the group.';
    throw createError({
      statusCode: 500,
      statusMessage: message,
    });
  }
});
