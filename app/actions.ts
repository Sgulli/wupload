'use server';

import { parseCSV, stringifyCSV } from '@/lib/csv-utils';
import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { removeJsonTemplate } from '@/lib/utils';

export async function processCSV(formData: FormData): Promise<string> {
  try {
    const file = formData.get('csv') as File;
    if (!file) {
      throw new Error('No file provided');
    }

    // Read the file content
    const fileContent = await file.text();

    // Parse the CSV
    const { headers, rows } = await parseCSV(fileContent);

    // Identify columns that should not be filled
    const protectedColumns = headers.filter(
      (header) =>
        header.toLowerCase().includes('Product Thumbnail') ||
        header.toLowerCase().includes('Product HS Code') ||
        header.toLowerCase().includes('Product Prizes') ||
        header.toLowerCase().includes('handle') ||
        header.toLowerCase().includes('uuid') ||
        header.toLowerCase().includes('path') ||
        header.toLowerCase().includes('sku') ||
        header.toLowerCase().includes('barcode') ||
        header.toLowerCase().includes('inventory') ||
        header.toLowerCase().includes('price') ||
        header.toLowerCase().includes('sales channel') ||
        header.toLowerCase().includes('status') ||
        header.toLowerCase().includes('category') ||
        header.toLowerCase().includes('backorder') ||
        header.toLowerCase().includes('manage') ||
        header.toLowerCase().includes('weight') ||
        header.toLowerCase().includes('length') ||
        header.toLowerCase().includes('width') ||
        header.toLowerCase().includes('height') ||
        header.toLowerCase().includes('external') ||
        header.toLowerCase().includes('profile') ||
        header.toLowerCase().includes('discountable') ||
        header.toLowerCase().includes('seller') ||
        header.toLowerCase().includes('variant is') ||
        header.toLowerCase().includes('option')
    );

    // Process each row with missing data
    const processedRows = await Promise.all(
      rows.map(async (row) => {
        // Check if the row has any empty fields that are not protected
        const hasMissingData = headers.some(
          (header) => !row[header] && !protectedColumns.includes(header)
        );

        if (!hasMissingData) {
          return row; // No processing needed
        }

        // Create a description of the wine from the available data
        const wineDescription = headers
          .filter((header) => row[header] && !protectedColumns.includes(header))
          .map((header) => `${header}: ${row[header]}`)
          .join('\n');

        // List the missing fields that need to be filled
        const missingFields = headers
          .filter(
            (header) => !row[header] && !protectedColumns.includes(header)
          )
          .join(', ');

        // Use AI to fill in the missing data
        const { text: aiResponse } = await generateText({
          model: google('gemini-2.0-flash-exp'),
          prompt: createWinePrompt(wineDescription, missingFields),
          // maxTokens: 1024,
        });

        console.log('AI Response:', aiResponse);

        const cleansedResponse = removeJsonTemplate(aiResponse);

        // Parse the AI response and update the row
        const updatedRow = { ...row };

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
      })
    );

    // Convert back to CSV
    return stringifyCSV(headers, processedRows);
  } catch (error) {
    console.error('Error processing CSV:', error);
    throw new Error('Failed to process the CSV file');
  }
}

function createWinePrompt(
  wineDescription: string,
  missingFields: string
): string {
  return `You are an expert sommelier and wine specialist with extensive knowledge of wines from around the world, particularly Italian wines. 
  
I have a wine database with some missing information. Based on the available data, please fill in the missing fields with accurate information.

Available wine data:
${wineDescription}

Missing fields that need to be filled: ${missingFields}

Important instructions:
1. Only provide information for the missing fields listed above.
2. Be specific and accurate, using your expert knowledge of wines.
3. For Italian wines like Barbera d'Asti, provide region-specific details.
4. For Product Description, write a compelling 2-3 sentence description of the wine.
5. For grape varieties (Product Grape), be specific about the grape varieties used.
6. For alcohol content (Product Alchool), provide a realistic percentage (e.g., "13.5%").
7. For Product Region, specify the wine region in Italy (e.g., "Piedmont").
8. For Product Appellation, provide the specific appellation (e.g., "Barbera d'Asti DOCG").
9. For Product Description Taste, provide detailed tasting notes.
10. For Product Description Matching, suggest food pairings.
11. For Product Temperature, suggest the ideal serving temperature (e.g., "16-18°C").
12. For Product Best In Year, suggest the optimal drinking window.
13. For Product Best In Glass, suggest the ideal glass type.
14. For Product Terroir, describe the soil and climate conditions.
15. For Product Bottle Production, estimate production numbers if not provided.
16. For Product Philosophy, describe the winemaking approach.
17. For Product Cork, specify the closure type (e.g., "Natural Cork").

Format your response as a JSON object with the missing fields as keys and your expert completions as values. For example:
{
  "Product Description": "A robust and elegant Barbera d'Asti with rich fruit character and balanced acidity. This wine showcases the best of Piedmont's terroir.",
  "Product Grape": "Barbera",
  "Product Alchool": "14%",
  "Product Region": "Piedmont",
  "Product Appelation": "Barbera d'Asti DOCG"
}

Only include the fields that were listed as missing. Do not include fields that already have data or fields that were not in the original data.`;
}
