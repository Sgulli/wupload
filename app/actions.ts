'use server';

import * as Papa from 'papaparse';
import { identifyProtectedColumns } from './utils/protected-columns';
import { processRow } from './utils/row-processing';
import { cleanupProcessFromSet, addProcessToSet, isProcessInSet } from './utils/cancellation-store';

// Generate a unique ID for each processing request
function generateProcessId() {
  return `process_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Get a preview of the CSV data without processing it
export async function getCSVPreview(formData: FormData) {
  console.log("👁️ GETTING CSV PREVIEW - This should happen when clicking the preview button.");
  
  try {
    const file = formData.get('csv') as File;
    
    if (!file) {
      return { error: 'No file provided' };
    }

    // Check if the file is a CSV
    if (!file.name.endsWith('.csv')) {
      return { error: 'File must be a CSV' };
    }

    // Parse the CSV file
    const csvText = await file.text();
    const parseResult = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    // Return a preview of the data (e.g., first 15 rows and headers)
    return {
      headers: parseResult.meta.fields || [],
      rows: parseResult.data.slice(0, 15) as Record<string, string>[],
      totalRows: parseResult.data.length
    };
  } catch (error) {
    console.error('Error getting CSV preview:', error);
    return { error: 'Failed to parse CSV file' };
  }
}

// Process a CSV file
export async function processCSV(formData: FormData) {
  console.log("🔄 PROCESSING CSV - This should only happen when submitting the form, not when previewing.");
  
  try {
    const file = formData.get('csv') as File;
    const language = formData.get('language') as string || 'Italian';
    
    if (!file) {
      return { error: 'No file provided' };
    }

    // Check if the file is a CSV
    if (!file.name.endsWith('.csv')) {
      return { error: 'File must be a CSV' };
    }

    // Parse the CSV file
    const csvText = await file.text();
    const parseResult = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    const headers = parseResult.meta.fields || [];
    const rows = parseResult.data as Record<string, string>[];

    // Generate a unique process ID
    const processId = generateProcessId();

    // Identify protected columns
    const protectedColumns = identifyProtectedColumns(headers);

    // Process rows
    const processedRows = [];
    for (let i = 0; i < rows.length; i++) {
      // Check if the process was cancelled
      if (isProcessInSet(processId)) {
        console.log('Processing cancelled');
        cleanupProcessFromSet(processId);
        return { 
          processId,
          cancelled: true,
          completedRows: i,
          totalRows: rows.length
        };
      }

      try {
        const processedRow = await processRow(rows[i], headers, protectedColumns, language, processId);
        processedRows.push(processedRow);
      } catch (error) {
        console.error(`Error processing row ${i}:`, error);
        // Continue with the next row on error
        processedRows.push(rows[i]);
      }
    }

    // Generate CSV from processed rows
    const csv = Papa.unparse({
      fields: headers,
      data: processedRows,
    });

    // Clean up the process ID
    cleanupProcessFromSet(processId);

    return {
      processId,
      csv,
      completedRows: processedRows.length,
      totalRows: rows.length
    };

  } catch (error) {
    console.error('Error processing CSV:', error);
    return { error: 'Failed to process CSV file' };
  }
}

// Cancel a processing job
export async function cancelProcess(processId: string) {
  try {
    console.log(`Cancelling process: ${processId}`);
    addProcessToSet(processId);
    return { success: true, message: 'Cancellation request received' };
  } catch (error) {
    console.error('Error cancelling processing:', error);
    return { success: false, error: 'Failed to cancel processing' };
  }
} 