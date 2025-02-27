import Papa from 'papaparse';

export interface CSVData {
  headers: string[];
  rows: Record<string, string>[];
}

/**
 * Parses CSV content into headers and rows using PapaParse.
 * This parser assumes a semicolon-delimited CSV and supports quoted fields.
 *
 * @param csvContent - The CSV content as a string.
 * @returns CSVData containing headers and rows.
 * @throws Error if parsing fails.
 */
export function parseCSV(csvContent: string): CSVData {
  if (!csvContent.trim()) {
    return { headers: [], rows: [] };
  }

  const result = Papa.parse<string[]>(csvContent, {
    delimiter: ';',
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    const errorMessages = result.errors.map((err) => err.message).join(', ');
    throw new Error(`CSV Parsing Error: ${errorMessages}`);
  }

  const data = result.data;
  if (data.length === 0) {
    return { headers: [], rows: [] };
  }

  // The first row is assumed to be the header row
  const headers = data[0];
  const rows = data.slice(1).map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((header, index) => {
      record[header] = row[index] ?? '';
    });
    return record;
  });

  return { headers, rows };
}

/**
 * Converts headers and rows into a semicolon-delimited CSV string using PapaParse.
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
  return Papa.unparse(
    {
      fields: headers,
      data: rows,
    },
    { delimiter: ';' }
  );
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
