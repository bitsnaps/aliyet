import { useDB } from '../../../utils/db';
import { readMultipartFormData } from 'h3';

export default defineEventHandler(async (event) => {
  const debugLogs = [];
  const addLog = (msg) => debugLogs.push(`[${new Date().toISOString()}] ${msg}`);

  try {
    addLog('Starting import handler');

    // 1. Dynamic Import of XLSX to catch missing dependency issues
    let XLSX;
    try {
      addLog('Attempting to dynamically import xlsx...');
      const _xlsx = await import('xlsx');
      XLSX = _xlsx.default || _xlsx;
      addLog('xlsx imported successfully.');
    } catch (e) {
      addLog(`Failed to import xlsx: ${e.message}`);
      return {
        success: false,
        message: `Critical Server Error: The 'xlsx' library could not be loaded. Please ensure it is installed properly on the server. Details: ${e.message}`,
        logs: debugLogs
      };
    }

    const modelName = getRouterParam(event, 'model');
    addLog(`Model parameter: ${modelName}`);

    // 2. Database Connection
    let sequelize, models;
    try {
      addLog('Connecting to database...');
      const db = await useDB();
      sequelize = db.sequelize;
      models = db.models;
      addLog('Database connected.');
    } catch (e) {
      addLog(`Database connection failed: ${e.message}`);
      return {
        success: false,
        message: `Database connection error: ${e.message}`,
        logs: debugLogs
      };
    }

    // 3. Model Lookup
    const targetModelName = Object.keys(models).find(m => m.toLowerCase() === modelName.toLowerCase());
    if (!targetModelName) {
      addLog(`Model '${modelName}' not found in registered models: ${Object.keys(models).join(', ')}`);
      return {
        success: false,
        message: `Model '${modelName}' not found. Available models: ${Object.keys(models).join(', ')}`,
        logs: debugLogs
      };
    }
    const Model = models[targetModelName];
    addLog(`Target model identified: ${targetModelName}`);

    // 4. Parse Form Data
    addLog('Reading multipart form data...');
    let formData;
    try {
      formData = await readMultipartFormData(event);
    } catch (e) {
      addLog(`readMultipartFormData failed: ${e.message}`);
      return {
         success: false,
         message: `Failed to read uploaded data: ${e.message}`,
         logs: debugLogs
      };
    }

    addLog(`Form data parts received: ${formData ? formData.length : 0}`);
    if (!formData || formData.length === 0) {
      return { success: false, message: 'No file uploaded (empty form data).', logs: debugLogs };
    }

    const filePart = formData.find(part => part.name === 'file');
    const optionsPart = formData.find(part => part.name === 'options');

    if (!filePart) {
      addLog('File part missing in form data.');
      return { success: false, message: 'File field is missing from the upload.', logs: debugLogs };
    }
    addLog(`File part found. Filename: ${filePart.filename}, Type: ${filePart.type}, Size: ${filePart.data.length} bytes`);

    // 5. Parse Options
    let options = { mode: 'SKIP', selectedFields: [] };
    if (optionsPart) {
      try {
        const optionsStr = optionsPart.data.toString();
        options = JSON.parse(optionsStr);
        addLog(`Options parsed: ${optionsStr}`);
      } catch (e) {
        addLog(`Error parsing options JSON: ${e.message}`);
        console.warn('Invalid options JSON', e);
      }
    } else {
        addLog('No options part found, using defaults.');
    }

    // 6. Parse Excel File
    addLog('Parsing Excel buffer...');
    let workbook;
    try {
      workbook = XLSX.read(filePart.data, { type: 'buffer' });
      addLog(`Workbook parsed. Sheets: ${workbook.SheetNames.join(', ')}`);
    } catch (e) {
      addLog(`XLSX.read failed: ${e.message}`);
      return { success: false, message: 'Invalid Excel file. Could not parse.', logs: debugLogs };
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    let jsonData;
    try {
        jsonData = XLSX.utils.sheet_to_json(worksheet);
    } catch (e) {
        addLog(`sheet_to_json failed: ${e.message}`);
        return { success: false, message: 'Failed to convert sheet to JSON.', logs: debugLogs };
    }
    
    addLog(`First sheet '${sheetName}' converted to JSON. Rows: ${jsonData ? jsonData.length : 0}`);

    if (!jsonData || jsonData.length === 0) {
      return { success: true, count: 0, message: 'File is empty.', logs: debugLogs };
    }

    // 7. Normalize Data
    addLog('Normalizing data against model attributes...');
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
    addLog('Data normalization complete.');

    // 8. Transactional Import
    addLog('Starting database transaction...');
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
      addLog(`Transaction committed. Imported: ${successCount}, Errors: ${errors.length}`);
      
      return {
        success: true,
        count: successCount,
        errors: errors,
        message: `Imported ${successCount} records successfully.` + (errors.length > 0 ? ` ${errors.length} failed.` : ''),
        logs: debugLogs
      };

    } catch (error) {
      await t.rollback();
      addLog(`Transaction rolled back due to error: ${error.message}`);
      return {
        success: false,
        message: `Import failed during database transaction: ${error.message}`,
        logs: debugLogs
      };
    }

  } catch (globalError) {
    addLog(`UNHANDLED GLOBAL ERROR: ${globalError.message}\nStack: ${globalError.stack}`);
    return {
      success: false,
      message: `Server Error: ${globalError.message}`,
      logs: debugLogs,
      stack: globalError.stack
    };
  }
});