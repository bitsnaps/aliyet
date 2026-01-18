import { useDB } from '../../../utils/db';
import { readMultipartFormData } from 'h3';
import ExcelJS from 'exceljs';

export default defineEventHandler(async (event) => {
  try {
    // 1. Database Connection
    const { sequelize, models } = await useDB();

    // 2. Parse Form Data
    const formData = await readMultipartFormData(event);
    if (!formData || formData.length === 0) {
      throw createError({ statusCode: 400, statusMessage: 'No file uploaded.' });
    }

    const filePart = formData.find(part => part.name === 'file');
    const optionsPart = formData.find(part => part.name === 'options');

    if (!filePart) {
      throw createError({ statusCode: 400, statusMessage: 'File field is missing.' });
    }

    // 3. Parse Options
    let options = { mode: 'SKIP', tables: [] };
    if (optionsPart) {
      try {
        options = JSON.parse(optionsPart.data.toString());
      } catch (e) {
        console.warn('Invalid options JSON', e);
      }
    }

    if (!options.tables || !Array.isArray(options.tables) || options.tables.length === 0) {
        throw createError({ statusCode: 400, statusMessage: 'No tables selected for import.' });
    }

    // 4. Parse Excel File using ExcelJS
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(filePart.data);
    } catch (e) {
      throw createError({ statusCode: 400, statusMessage: `Invalid Excel file: ${e.message}` });
    }

    // 5. Transactional Import
    const t = await sequelize.transaction();
    const summary = {
        totalSuccess: 0,
        totalErrors: 0,
        details: []
    };

    try {
        // Loop through selected tables
        for (const tableName of options.tables) {
            const tableSummary = { table: tableName, success: 0, errors: [] };
            
            // Find Model
            const modelName = Object.keys(models).find(m => m.toLowerCase() === tableName.toLowerCase());
            if (!modelName) {
                tableSummary.errors.push({ message: `Model '${tableName}' not found in system.` });
                summary.details.push(tableSummary);
                continue;
            }
            const Model = models[modelName];

            // Find Worksheet
            // Worksheet name should match tableName (case insensitive check?)
            // ExcelJS worksheets are accessed by name or id.
            const worksheet = workbook.getWorksheet(modelName) || workbook.worksheets.find(ws => ws.name.toLowerCase() === modelName.toLowerCase());

            if (!worksheet) {
                // If sheet is missing, we just ignore it for this table (or report it?)
                // "The extra sheets (where the name of the sheet doesn't match any table's name) will just be ignored"
                // But here we are iterating requested tables. If a requested table is NOT in the file, we should probably report it.
                tableSummary.errors.push({ message: `Sheet '${modelName}' not found in Excel file.` });
                summary.details.push(tableSummary);
                continue;
            }

            // Extract Data
            const jsonData = [];
            const headerRow = worksheet.getRow(1);
            
            if (headerRow.cellCount === 0) {
                 tableSummary.errors.push({ message: `Sheet '${modelName}' is empty.` });
                 summary.details.push(tableSummary);
                 continue;
            }

            const headers = {};
            headerRow.eachCell((cell, colNumber) => {
                headers[colNumber] = cell.value ? String(cell.value).trim() : '';
            });

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return; // Skip header

                const rowData = {};
                let hasData = false;
                
                row.eachCell((cell, colNumber) => {
                    const header = headers[colNumber];
                    if (header) {
                        let value = cell.value;
                        if (typeof value === 'object' && value !== null) {
                             if (value.hasOwnProperty('result')) value = value.result;
                             else if (value.hasOwnProperty('text')) value = value.text;
                             else if (value.hasOwnProperty('hyperlink')) value = value.text || value.hyperlink;
                        }
                        rowData[header] = value;
                        hasData = true;
                    }
                });

                if (hasData) jsonData.push(rowData);
            });

            // Normalize and Import Data
            const modelAttributes = Object.keys(Model.rawAttributes);
            
            for (const [index, row] of jsonData.entries()) {
                try {
                    // Map row data to model attributes
                    const newRow = {};
                    Object.keys(row).forEach(key => {
                        const matchedAttr = modelAttributes.find(attr => attr.toLowerCase() === key.toLowerCase());
                        if (matchedAttr) {
                            newRow[matchedAttr] = row[key];
                        }
                    });

                    // Check for unique constraints (duplicates)
                    const uniqueKeys = modelAttributes.filter(key => Model.rawAttributes[key].unique || Model.rawAttributes[key].primaryKey);
                    
                    let existingRecord = null;
                    // Only check if we have data for unique keys
                    // If no unique keys defined (besides ID), and ID is not in file, we might assume new record.
                    // Usually ID is primary key.
                    
                    const whereClause = {};
                    let hasUniqueData = false;

                    // Prioritize checking by Primary Key if present
                    const pk = modelAttributes.find(key => Model.rawAttributes[key].primaryKey);
                    if (pk && newRow[pk]) {
                        whereClause[pk] = newRow[pk];
                        hasUniqueData = true;
                    } else {
                        // Check other unique keys
                        for (const key of uniqueKeys) {
                            if (key !== pk && newRow[key]) {
                                whereClause[key] = newRow[key];
                                hasUniqueData = true;
                                break; 
                            }
                        }
                    }

                    if (hasUniqueData) {
                        existingRecord = await Model.findOne({ where: whereClause, transaction: t });
                    }

                    if (existingRecord) {
                        if (options.mode === 'SKIP') {
                            continue;
                        } else if (options.mode === 'UPDATE') {
                            await existingRecord.update(newRow, { transaction: t });
                            tableSummary.success++;
                        } else if (options.mode === 'ERROR') {
                            throw new Error(`Duplicate record found for row ${index + 2}`);
                        }
                    } else {
                        await Model.create(newRow, { transaction: t });
                        tableSummary.success++;
                    }

                } catch (err) {
                    if (options.mode === 'ERROR') {
                        throw err; // Abort everything
                    }
                    tableSummary.errors.push({ row: index + 2, message: err.message });
                }
            }
            
            summary.totalSuccess += tableSummary.success;
            summary.totalErrors += tableSummary.errors.length;
            summary.details.push(tableSummary);
        }

        await t.commit();
        
        return {
            success: true,
            summary
        };

    } catch (error) {
        await t.rollback();
        throw createError({
            statusCode: 500,
            statusMessage: `Bulk import failed: ${error.message}`
        });
    }

  } catch (globalError) {
    if (globalError.statusCode) throw globalError;
    throw createError({
      statusCode: 500,
      statusMessage: `Server Error: ${globalError.message}`
    });
  }
});
