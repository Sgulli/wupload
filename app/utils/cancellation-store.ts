// A simple in-memory store for tracking cancellation requests
const cancellationRequests = new Set<string>();

// Add a process ID to the cancellation list
export function addProcessToSet(processId: string): void {
  console.log(`Adding cancellation for process: ${processId}`);
  cancellationRequests.add(processId);
}

// Check if a process has been cancelled
export function isProcessInSet(processId: string): boolean {
  return cancellationRequests.has(processId);
}

// Clean up a completed process from the cancellation list
export function cleanupProcessFromSet(processId: string): void {
  cancellationRequests.delete(processId);
} 