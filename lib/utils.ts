import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Processes and cleans response text that might contain JSON.
 * Handles various formats like Markdown code blocks, JSON with comments, etc.
 *
 * @param input - The string that may contain JSON in various formats
 * @returns The cleaned JSON string ready for parsing
 */
export function removeJsonTemplate(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  // Try to extract JSON from markdown code blocks
  const markdownRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
  const markdownMatch = markdownRegex.exec(input);
  
  if (markdownMatch) {
    return markdownMatch[1].trim();
  }
  
  // Try to extract content from curly braces if the whole input isn't valid JSON
  try {
    // First check if the input is already valid JSON
    JSON.parse(input);
    return input; // If it parses successfully, return as is
  } catch {
    // Try to extract JSON object with regex
    const jsonObjectRegex = /\{[\s\S]*\}/;
    const match = jsonObjectRegex.exec(input);
    
    if (match) {
      const potentialJson = match[0];
      try {
        // Verify it's valid JSON
        JSON.parse(potentialJson);
        return potentialJson;
      } catch(e:unknown) {
        // If we got here, the extracted content wasn't valid JSON either
        // handle the error
        if (e instanceof Error) {
          throw new Error('Invalid JSON', { cause: e.message });
        }
        throw new Error('Invalid JSON');
      }
    }
    
    // If all else fails, return the original input
    return input;
  }
}
