'use server';

import * as Papa from 'papaparse';

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