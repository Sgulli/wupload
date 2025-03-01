'use server';

// This file is kept for backward compatibility
// The code has been refactored and moved to more modular files in the actions/ directory

// Import all required functions
import { processCSV as _processCSV, cancelProcessing as _cancelProcessing } from './actions/csv-processing';
import { getCSVPreview as _getCSVPreview } from './actions/preview';
import { 
  cancelProcess as _cancelProcess, 
  isProcessCancelled as _isProcessCancelled, 
  cleanupProcess as _cleanupProcess 
} from './actions/cancellation';

// Create wrapper for processCSV
export async function processCSV(formData: FormData) {
  return _processCSV(formData);
}

// Create wrapper for getCSVPreview
export async function getCSVPreview(formData: FormData) {
  return _getCSVPreview(formData);
}

// Create wrapper for cancelProcessing
export async function cancelProcessing(processId: string) {
  return _cancelProcessing(processId);
}

// Wrapper for non-async functions
export async function cancelProcess(processId: string): Promise<void> {
  _cancelProcess(processId);
}

export async function isProcessCancelled(processId: string): Promise<boolean> {
  return _isProcessCancelled(processId);
}

export async function cleanupProcess(processId: string): Promise<void> {
  _cleanupProcess(processId);
}

// The helper functions shouldn't be exported directly from a server action file
// They should be imported directly from their source files when needed
