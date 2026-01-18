import { useDB } from '../../../utils/db';
import ExcelJS from 'exceljs';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const { tables: tablesParam, limit: limitParam } = query;

    if (!tablesParam) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No tables specified for export.'
      });
    }

    const requestedTables = tablesParam.split(',').filter(t => t.trim().length > 0);
    const limit = limitParam ? parseInt(limitParam) : 0;

    // 1. Database Connection
    const { models } = await useDB();

    // 2. Create Workbook
    const workbook = new ExcelJS.Workbook();

    // 3. Process each requested table
    for (const tableName of requestedTables) {
      // Find model case-insensitively
      const modelName = Object.keys(models).find(m => m.toLowerCase() === tableName.toLowerCase());
      
      if (!modelName) {
        // Skip unknown tables or maybe add an empty sheet with a warning? 
        // For now, let's skip them or maybe log.
        continue;
      }

      const Model = models[modelName];
      
      // Fetch Data
      const findAllOptions = {
        raw: true
      };
      if (limit && limit > 0) {
        findAllOptions.limit = limit;
      }

      const data = await Model.findAll(findAllOptions);
      
      // Add Worksheet
      // Sheet name must be same as table name (model name)
      const worksheet = workbook.addWorksheet(modelName);

      // Define Columns based on model attributes
      const fields = Object.keys(Model.rawAttributes);
      worksheet.columns = fields.map(attr => ({
        header: attr,
        key: attr,
        width: 20
      }));

      // Add Rows
      if (data.length > 0) {
        worksheet.addRows(data);
      }
    }

    // 4. Generate Buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // 5. Send Response
    setResponseHeader(event, 'Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    setResponseHeader(event, 'Content-Disposition', `attachment; filename="bulk-export-${new Date().toISOString().split('T')[0]}.xlsx"`);
    
    return buffer;

  } catch (error) {
    console.error('Bulk export error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: `Bulk export failed: ${error.message}`
    });
  }
});
