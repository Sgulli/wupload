export interface CSVData {
  headers: string[];
  rows: Record<string, string>[];
}

/**
 * Parses CSV content into headers and rows.
 * This parser assumes a semicolon-delimited CSV and supports quoted fields.
 *
 * @param csvContent - The CSV content as a string.
 * @returns CSVData containing headers and rows.
 * @throws Error if a row contains unclosed quotes.
 */
export function parseCSV(csvContent: string): CSVData {
  if (!csvContent.trim()) {
    return { headers: [], rows: [] };
  }

  // Split content into lines (handling both \r\n and \n) and filter out empty lines
  const lines = csvContent.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  // Extract headers from the first line
  const headers = parseCSVLine(lines[0]);

  // Process each subsequent row
  const rows = lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    return row;
  });

  return { headers, rows };
}

/**
 * Converts headers and rows into a semicolon-delimited CSV string.
 * Fields that contain semicolons, quotes, or newlines are wrapped in quotes.
 *
 * @param headers - Array of header strings.
 * @param rows - Array of row objects.
 * @returns A CSV string.
 */
export function stringifyCSV(
  headers: string[],
  rows: Record<string, string>[]
): string {
  const csvLines: string[] = [];

  // Create the header row
  csvLines.push(headers.join(';'));

  // Process each row
  rows.forEach((row) => {
    const line = headers
      .map((header) => {
        let value = row[header] ?? '';
        // If the value contains special characters, wrap it in quotes and escape internal quotes.
        if (
          value.includes(';') ||
          value.includes('"') ||
          value.includes('\n')
        ) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      })
      .join(';');
    csvLines.push(line);
  });

  return csvLines.join('\n');
}

/**
 * Parses a single CSV line, correctly handling quoted fields.
 *
 * @param line - A CSV row string.
 * @returns An array of field values.
 * @throws Error if an unclosed quote is detected.
 *
 * Note: This function does not trim unquoted values. If you require trimming,
 * you can apply .trim() on each returned field.
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      // If already in quotes and the next character is also a quote, it's an escaped quote.
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++; // Skip the escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ';' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // If we ended still inside quotes, the CSV is malformed.
  if (inQuotes) {
    throw new Error(`Malformed CSV: Unclosed quotes in line: ${line}`);
  }

  result.push(current);
  return result;
}

/**
 * Converts a JSON array of objects to a CSV string.
 * The JSON input can be provided as a JSON string or as an array of objects.
 * The resulting CSV will include headers determined from the union of keys found in the objects.
 *
 * @param input - A JSON string representing an array of objects, or an array of objects.
 * @returns A CSV string.
 * @throws Error if the input is not a valid JSON array.
 */
export function jsonToCSV(input: string | Record<string, unknown>[]): string {
  let data: Record<string, unknown>[];
  if (typeof input === 'string') {
    data = JSON.parse(input);
  } else {
    data = input;
  }

  if (!Array.isArray(data)) {
    throw new Error('Invalid JSON data: expected an array of objects.');
  }

  // Determine headers from the first object, preserving order, and add any missing keys from subsequent objects
  let headers: string[] = [];
  if (data.length > 0) {
    headers = Object.keys(data[0]);
    data.forEach((item) => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach((key) => {
          if (!headers.includes(key)) {
            headers.push(key);
          }
        });
      }
    });
  }

  // Convert each row into a record of string values
  const rows: Record<string, string>[] = data.map((item) => {
    const row: Record<string, string> = {};
    headers.forEach((header) => {
      row[header] =
        item[header] !== undefined && item[header] !== null
          ? typeof item[header] === 'object'
            ? JSON.stringify(item[header])
            : String(item[header])
          : '';
    });
    return row;
  });

  return stringifyCSV(headers, rows);
}
