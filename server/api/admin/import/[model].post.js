import { useDB } from '../../../utils/db';
import { readMultipartFormData } from 'h3';

export default defineEventHandler(async (event) => {
  try {
    // 1. Dynamic Import of XLSX (mini version to avoid codepage issues in production)
    // Using the mjs build directly avoids the dependency on cpexcel.js which causes issues in bundled environments
    let XLSX;
    try {
      const _xlsx = await import('xlsx/xlsx.mjs');
      XLSX = _xlsx.default || _xlsx;
    } catch (e) {
      throw createError({
        statusCode: 500,
        statusMessage: `Server Error: Failed to load xlsx library. ${e.message}`
      });
    }

    const modelName = getRouterParam(event, 'model');
    
    // 2. Database Connection
    const { sequelize, models } = await useDB();

    // 3. Model Lookup
    const targetModelName = Object.keys(models).find(m => m.toLowerCase() === modelName.toLowerCase());
    if (!targetModelName) {
      throw createError({
        statusCode: 404,
        statusMessage: `Model '${modelName}' not found.`
      });
    }
    const Model = models[targetModelName];

    // 4. Parse Form Data
    const formData = await readMultipartFormData(event);
    if (!formData || formData.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'No file uploaded.' });
    }

    const filePart = formData.find(part => part.name === 'file');
    const optionsPart = formData.find(part => part.name === 'options');

    if (!filePart) {
      throw createError({ statusCode: 400, statusMessage: 'File field is missing.' });
    }

    // 5. Parse Options
    let options = { mode: 'SKIP', selectedFields: [] };
    if (optionsPart) {
      try {
        options = JSON.parse(optionsPart.data.toString());
      } catch (e) {
        console.warn('Invalid options JSON', e);
      }
    }

    // 6. Parse Excel File
    let workbook;
    try {
      workbook = XLSX.read(filePart.data, { type: 'buffer' });
    } catch (e) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid Excel file.' });
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    if (!jsonData || jsonData.length === 0) {
      return { success: true, count: 0, message: 'File is empty.' };
    }

    // 7. Normalize Data
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

    // 8. Transactional Import
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