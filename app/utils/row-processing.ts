import { removeJsonTemplate } from '@/lib/utils';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { createWinePrompt } from './wine-prompt';
import { isProcessInSet } from './cancellation-store';

// Helper to check if row needs processing
export function rowNeedsProcessing(row: Record<string, string>, headers: string[], protectedColumns: string[]): boolean {
  return headers.some(
    (header) => !row[header] && !protectedColumns.includes(header)
  );
}

// Helper to create wine description from available data
export function createWineDataDescription(row: Record<string, string>, headers: string[], protectedColumns: string[]): string {
  return headers
    .filter((header) => row[header] && !protectedColumns.includes(header))
    .map((header) => `${header}: ${row[header]}`)
    .join('\n');
}

// Helper to get missing fields
export function getMissingFields(row: Record<string, string>, headers: string[], protectedColumns: string[]): string {
  return headers
    .filter(
      (header) => !row[header] && !protectedColumns.includes(header)
    )
    .join(', ');
}

// Helper to apply AI response to row
export async function applyAIResponse(row: Record<string, string>, headers: string[], protectedColumns: string[], aiResponse: string): Promise<Record<string, string>> {
  const updatedRow = { ...row };
  const cleansedResponse = removeJsonTemplate(aiResponse);

  try {
    const responseData = JSON.parse(cleansedResponse);

    // Update the row with the AI-generated data
    for (const [key, value] of Object.entries(responseData)) {
      if (
        headers.includes(key) &&
        !protectedColumns.includes(key) &&
        !row[key]
      ) {
        updatedRow[key] = value as string;
      }
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    // If JSON parsing fails, try to extract data using regex
    const fieldRegex = /([a-zA-Z_]+):\s*(.+?)(?=\n[a-zA-Z_]+:|$)/gs;
    let match;

    while ((match = fieldRegex.exec(aiResponse)) !== null) {
      const [, field, value] = match;
      if (
        headers.includes(field) &&
        !protectedColumns.includes(field) &&
        !row[field]
      ) {
        updatedRow[field] = value.trim();
      }
    }
  }

  return updatedRow;
}

// Process a single row
export async function processRow(
  row: Record<string, string>, 
  headers: string[], 
  protectedColumns: string[], 
  language: string,
  processId: string
): Promise<Record<string, string>> {
  // Check if the row needs processing
  if (!rowNeedsProcessing(row, headers, protectedColumns)) {
    return row;
  }

  try {
    // Check for cancellation before AI call
    if (isProcessInSet(processId)) {
      throw new Error('CSV processing cancelled by user');
    }

    const wineDescription = createWineDataDescription(row, headers, protectedColumns);
    const missingFields = getMissingFields(row, headers, protectedColumns);

    // Use AI to fill in the missing data
    const abortController = new AbortController();
    const { text: aiResponse } = await generateText({
      model: google('gemini-2.0-flash-exp', {
        useSearchGrounding: true,
      }),
      prompt: createWinePrompt(wineDescription, missingFields, language),
      abortSignal: abortController.signal
    });
    

    return await applyAIResponse(row, headers, protectedColumns, aiResponse);
  } catch (err) {
    if (isProcessInSet(processId)) {
      throw new Error('CSV processing cancelled by user');
    }
    // For other errors, just use the original row
    console.error('Error processing row:', err);
    return row;
  }
} 