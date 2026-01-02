import { useDB } from '../../utils/db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { models } = await useDB();
  const { Settings } = models;

  try {
    // Process each group in the body
    const promises = Object.keys(body).map(async (group) => {
      const data = body[group];
      
      // Upsert logic: find by group, if exists update, else create
      const existingSetting = await Settings.findOne({ where: { group } });
      
      if (existingSetting) {
        existingSetting.data = data;
        return existingSetting.save();
      } else {
        return Settings.create({
          group,
          data
        });
      }
    });

    await Promise.all(promises);

    return {
      status: 200,
      body: {
        message: 'Settings saved successfully'
      }
    };
  } catch (error) {
    console.error('Error saving settings:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save settings'
    });
  }
});