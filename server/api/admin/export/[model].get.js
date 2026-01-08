import { useDB } from '../../../utils/db';
import ExcelJS from 'exceljs';

export default defineEventHandler(async (event) => {
  try {
    const modelName = getRouterParam(event, 'model');
    const query = getQuery(event);

    // 1. Database Connection
    const { models } = await useDB();

    // 2. Model Lookup
    const targetModelName = Object.keys(models).find(m => m.toLowerCase() === modelName.toLowerCase());
    if (!targetModelName) {
      throw createError({
        statusCode: 404,
        statusMessage: `Model '${modelName}' not found.`
      });
    }
    const Model = models[targetModelName];

    // 3. Parse Options
    const limit = query.limit ? parseInt(query.limit) : undefined;
    const fields = query.fields ? query.fields.split(',') : Object.keys(Model.rawAttributes);

    // 4. Fetch Data
    const findAllOptions = {
        raw: true,
        attributes: fields
    };
    if (limit && limit > 0) {
        findAllOptions.limit = limit;
    }
    
    const data = await Model.findAll(findAllOptions);

    // 5. Create Workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(targetModelName);

    // 6. Define Columns based on selected fields
    worksheet.columns = fields.map(attr => ({
        header: attr,
        key: attr,
        width: 20
    }));

    // 6. Add Rows
    if (data.length > 0) {
        worksheet.addRows(data);
    }

    // 7. Generate Buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // 8. Send Response
    setResponseHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    setResponseHeader(event, 'Content-Disposition', `attachment; filename="${modelName}-${new Date().toISOString().split('T')[0]}.xlsx"`);
    
    return buffer;

  } catch (error) {
    console.error('Export error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: `Export failed: ${error.message}`
    });
  }
});