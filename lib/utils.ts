import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Removes Markdown JSON code block markers from the input string.
 *
 * If the input starts with "```json" and ends with "```", this function returns the content in between.
 * Otherwise, it returns the input unchanged.
 *
 * @param input - The string that may contain a Markdown JSON code block.
 * @returns The JSON content without the Markdown code block markers.
 */
export function removeJsonTemplate(input: string): string {
  const regex = /^```json\s*([\s\S]*?)\s*```$/;
  const match = regex.exec(input);
  return match ? match[1].trim() : input;
}
