import React from 'react';

export interface UploaderProps {
  onFilesSelected?: (files: File[]) => void;
}

export function Uploader({ onFilesSelected }: UploaderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    onFilesSelected?.(Array.from(fileList));
  };
  return (
    <div style={{ display: 'inline-block' }}>
      <input type="file" multiple accept=".csv,text/csv" onChange={handleChange} />
    </div>
  );
}

export default Uploader;


