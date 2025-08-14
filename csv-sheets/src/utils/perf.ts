export const LARGE_FILE_ROW_THRESHOLD = 2_000_000;
export const LARGE_FILE_SIZE_MB = 200;

export function shouldUsePerformanceMode(params: { fileSizeBytes?: number; totalRows?: number }): boolean {
  if ((params.totalRows ?? 0) >= LARGE_FILE_ROW_THRESHOLD) return true;
  const sizeMb = (params.fileSizeBytes ?? 0) / (1024 * 1024);
  return sizeMb >= LARGE_FILE_SIZE_MB;
}


