import { useDB } from '../../../utils/db';
import { readMultipartFormData } from 'h3';
import ExcelJS from 'exceljs';

export default defineEventHandler(async (event) => {
  try {
    const modelName = getRouterParam(event, 'model');
    
    // 1. Database Connection
    const { sequelize, models } = await useDB();

    // 2. Model Lookup
    const targetModelName = Object.keys(models).find(m => m.toLowerCase() === modelName.toLowerCase());
    if (!targetModelName) {
      throw createError({
        statusCode: 404,
        statusMessage: `Model '${modelName}' not found.`
      });
    }
    const Model = models[targetModelName];

    // 3. Parse Form Data
    const formData = await readMultipartFormData(event);
    if (!formData || formData.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'No file uploaded.' });
    }

    const filePart = formData.find(part => part.name === 'file');
    const optionsPart = formData.find(part => part.name === 'options');

    if (!filePart) {
      throw createError({ statusCode: 400, statusMessage: 'File field is missing.' });
    }

    // 4. Parse Options
    let options = { mode: 'SKIP', selectedFields: [] };
    if (optionsPart) {
      try {
        options = JSON.parse(optionsPart.data.toString());
      } catch (e) {
        console.warn('Invalid options JSON', e);
      }
    }

    // 5. Parse Excel File using ExcelJS
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(filePart.data);
    } catch (e) {
      throw createError({ statusCode: 400, statusMessage: `Invalid Excel file: ${e.message}` });
    }

    const worksheet = workbook.getWorksheet(1); // ExcelJS uses 1-based indexing for worksheets
    if (!worksheet) {
       return { success: true, count: 0, message: 'File is empty (no worksheet found).' };
    }

    // Extract Data
    // ExcelJS rows are 1-based. Row 1 is header.
    const jsonData = [];
    const headerRow = worksheet.getRow(1);
    
    if (headerRow.cellCount === 0) {
       return { success: true, count: 0, message: 'File is empty.' };
    }

    // Map column index to header name
    const headers = {};
    headerRow.eachCell((cell, colNumber) => {
        headers[colNumber] = cell.value ? String(cell.value).trim() : '';
    });

    // Iterate over data rows (starting from row 2)
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        const rowData = {};
        let hasData = false;
        
        row.eachCell((cell, colNumber) => {
            const header = headers[colNumber];
            if (header) {
                // Handle different cell types if necessary (e.g. formulas, rich text)
                // For now, we take the raw value or result
                let value = cell.value;
                if (typeof value === 'object' && value !== null) {
                     if (value.hasOwnProperty('result')) {
                         value = value.result; // Formula result
                     } else if (value.hasOwnProperty('text')) {
                         value = value.text; // Rich text
                     } else if (value.hasOwnProperty('hyperlink')) {
                         value = value.text || value.hyperlink; // Hyperlink
                     }
                }
                rowData[header] = value;
                hasData = true;
            }
        });

        if (hasData) {
            jsonData.push(rowData);
        }
    });

    if (jsonData.length === 0) {
      return { success: true, count: 0, message: 'File is empty.' };
    }

    // 6. Normalize Data
    const modelAttributes = Object.keys(Model.rawAttributes);
    const normalizedData = jsonData.map(row => {
      const newRow = {};
      Object.keys(row).forEach(key => {
        const matchedAttr = modelAttributes.find(attr => attr.toLowerCase() === key.toLowerCase());
        const isSelected = options.selectedFields.length === 0 || options.selectedFields.includes(matchedAttr);
        if (matchedAttr && isSelected) {
          newRow[matchedAttr] = row[key];
        }
      });
      return newRow;
    });

    // 7. Transactional Import
    const t = await sequelize.transaction();
    let successCount = 0;
    let errors = [];

    try {
      for (const [index, row] of normalizedData.entries()) {
        try {
          const uniqueKeys = Object.keys(Model.rawAttributes).filter(key => Model.rawAttributes[key].unique);
          
          let existingRecord = null;
          if (uniqueKeys.length > 0) {
              const whereClause = {};
              let hasUniqueData = false;
              for (const key of uniqueKeys) {
                  if (row[key]) {
                      whereClause[key] = row[key];
                      hasUniqueData = true;
                      break; 
                  }
              }
              if (hasUniqueData) {
                  existingRecord = await Model.findOne({ where: whereClause, transaction: t });
              }
          }

          if (existingRecord) {
              if (options.mode === 'SKIP') {
                  continue;
              } else if (options.mode === 'UPDATE') {
                  await existingRecord.update(row, { transaction: t });
                  successCount++;
              } else if (options.mode === 'ERROR') {
                  throw new Error(`Duplicate record found for row ${index + 2}`);
              }
          } else {
              await Model.create(row, { transaction: t });
              successCount++;
          }

        } catch (err) {
          if (options.mode === 'ERROR') {
              throw err; 
          }
          errors.push({ row: index + 2, message: err.message });
        }
      }

      await t.commit();
      
      return {
        success: true,
        count: successCount,
        errors: errors,
        message: `Imported ${successCount} records successfully.` + (errors.length > 0 ? ` ${errors.length} failed.` : '')
      };

    } catch (error) {
      await t.rollback();
      throw createError({
        statusCode: 500,
        statusMessage: `Import failed: ${error.message}`
      });
    }

  } catch (globalError) {
    // If it's already a H3Error, throw it as is
    if (globalError.statusCode) {
      throw globalError;
    }
    // Otherwise wrap in 500
    throw createError({
      statusCode: 500,
      statusMessage: `Server Error: ${globalError.message}`
    });
  }
});