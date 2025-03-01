'use server';

import * as Papa from 'papaparse';
import { processRow } from './helpers/row-processing';
import { identifyProtectedColumns } from './helpers/protected-columns';
import { isProcessCancelled, cleanupProcess } from './cancellation';

// Generate a unique ID for each processing request
function generateProcessId() {
  return `process_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
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
      if (await isProcessCancelled(processId)) {
        console.log('Processing cancelled');
        await cleanupProcess(processId);
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
    await cleanupProcess(processId);

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
export async function cancelProcessing(processId: string) {
  try {
    console.log(`Attempting to cancel processing for ${processId}`);
    
    // Import the cancellation function dynamically to avoid circular dependencies
    const { cancelProcess } = await import('./cancellation');
    await cancelProcess(processId);
    
    return { success: true, message: 'Cancellation request received' };
  } catch (error) {
    console.error('Error cancelling processing:', error);
    return { success: false, error: 'Failed to cancel processing' };
  }
} 