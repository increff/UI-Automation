export function computeFileHash(file: File): string {
  // Basic stable hash from name + size + lastModified; replace with crypto subtle if needed
  return `${file.name}|${file.size}|${file.lastModified}`;
}


