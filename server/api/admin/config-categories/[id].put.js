import { object, string, parse, nullish } from 'valibot';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { id } = event.context.params;
  const { models } = await useDB();
  const { ConfigCategories } = models;

  const schema = object({
    name: string('Name is required.'),
    description: nullish(string(), ''),
  });

  try {
    const data = parse(schema, body);
    const item = await ConfigCategories.findByPk(id);

    if (!item) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Configuration Group not found.',
      });
    }

    await item.update(data);

    return { success: true, data: item };
  } catch (err) {
    if (err.issues) {
      const message = err.issues.map(issue => issue.message).join(' ');
      throw createError({
        statusCode: 400,
        statusMessage: message,
      });
    }
    const message = err.errors?.[0]?.message || 'An error occurred while updating the group.';
    throw createError({
      statusCode: 500,
      statusMessage: message,
    });
  }
});
