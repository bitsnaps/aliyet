import { useDB } from '../../../utils/db';
import { readMultipartFormData } from 'h3';
import * as XLSX from 'xlsx';

export default defineEventHandler(async (event) => {
  const modelName = getRouterParam(event, 'model');
  const { sequelize, models } = await useDB();

  // Case-insensitive lookup for model
  const targetModelName = Object.keys(models).find(m => m.toLowerCase() === modelName.toLowerCase());

  if (!targetModelName) {
    throw createError({
      statusCode: 404,
      statusMessage: `Model '${modelName}' not found.`
    });
  }

  const Model = models[targetModelName];

  // Parse multipart form data
  const formData = await readMultipartFormData(event);
  if (!formData || formData.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded.' });
  }

  const filePart = formData.find(part => part.name === 'file');
  const optionsPart = formData.find(part => part.name === 'options');

  if (!filePart) {
    throw createError({ statusCode: 400, statusMessage: 'File field is missing.' });
  }

  // Parse options
  let options = { mode: 'SKIP', selectedFields: [] }; // Modes: SKIP, UPDATE, ERROR
  if (optionsPart) {
    try {
      options = JSON.parse(optionsPart.data.toString());
    } catch (e) {
      console.warn('Invalid options JSON', e);
    }
  }

  // Parse Excel file
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

  // Normalize JSON keys to match model attributes (case-insensitive)
  const modelAttributes = Object.keys(Model.rawAttributes);
  const normalizedData = jsonData.map(row => {
    const newRow = {};
    Object.keys(row).forEach(key => {
      // Find matching attribute (case-insensitive)
      const matchedAttr = modelAttributes.find(attr => attr.toLowerCase() === key.toLowerCase());
      
      // Only include if it's in the selected fields (if specified) or if it exists in the model
      const isSelected = options.selectedFields.length === 0 || options.selectedFields.includes(matchedAttr);
      
      if (matchedAttr && isSelected) {
        newRow[matchedAttr] = row[key];
      }
    });
    return newRow;
  });

  // Transactional Import
  const t = await sequelize.transaction();
  let successCount = 0;
  let errors = [];

  try {
    for (const [index, row] of normalizedData.entries()) {
      try {
        // Check for unique constraints (assuming 'id' or unique fields like 'name' or 'code')
        // We need to know which field is unique to check for existence.
        // For simplicity, we look for 'id' or try to catch the unique constraint error.
        
        // Strategy: Try creation. If duplicate, handle based on mode.
        // However, standard create throws error.
        
        // Better approach for generic:
        // 1. Identify unique keys from model definition
        const uniqueKeys = Object.keys(Model.rawAttributes).filter(key => Model.rawAttributes[key].unique);
        
        let existingRecord = null;
        if (uniqueKeys.length > 0) {
            // Construct where clause for unique check
            const whereClause = {};
            let hasUniqueData = false;
            for (const key of uniqueKeys) {
                if (row[key]) {
                    whereClause[key] = row[key];
                    hasUniqueData = true;
                    // We only need one match to find the record (assuming simple unique constraints)
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
        // If mode is ERROR, we abort the whole transaction
        if (options.mode === 'ERROR') {
            throw err; 
        }
        // Otherwise record error and continue
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
});