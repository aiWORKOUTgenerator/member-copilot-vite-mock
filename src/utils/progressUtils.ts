/**
 * Update progress with a delay for visual feedback
 * @param updateFn Function to update progress
 * @param progress Progress value (0-100)
 * @param delay Delay in milliseconds
 */
export const updateProgressWithDelay = async (
  updateFn: (progress: number) => void,
  progress: number,
  delay = 500
): Promise<void> => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      updateFn(Math.min(100, Math.max(0, progress)));
      resolve();
    }, delay);
  });
};

/**
 * Simulate realistic progress during AI operations
 * @param updateFn Function to update progress
 * @param startProgress Start progress value
 * @param endProgress End progress value
 * @param duration Total duration in milliseconds
 * @param abortSignal Optional abort signal
 */
export const simulateAIProgress = async (
  updateFn: (progress: number) => void,
  startProgress: number,
  endProgress: number,
  duration: number,
  abortSignal?: AbortSignal
): Promise<void> => {
  const steps = 8; // Number of progress updates
  const stepSize = (endProgress - startProgress) / steps;
  const stepDelay = duration / steps;
  
  for (let i = 1; i <= steps; i++) {
    if (abortSignal?.aborted) break;
    
    const currentProgress = startProgress + (stepSize * i);
    await updateProgressWithDelay(updateFn, currentProgress, stepDelay);
  }
};