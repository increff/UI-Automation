/* eslint-disable no-restricted-globals */
import Papa from 'papaparse';

type ParseStartMsg = {
  type: 'PARSESTART';
  sheetId: string;
  file: File;
  options: {
    headerRowIndex: number;
    delimiter?: string;
    encoding?: string;
    skipEmptyLines: boolean;
  };
};

type CancelMsg = { type: 'CANCEL'; sheetId: string };

type InMsg = ParseStartMsg | CancelMsg;

self.onmessage = (e: MessageEvent<InMsg>) => {
  const msg = e.data;
  if (msg.type === 'PARSESTART') {
    const { sheetId, file, options } = msg;
    let rowId = 0;
    Papa.parse(file, {
      worker: true,
      header: false,
      skipEmptyLines: options.skipEmptyLines,
      delimiter: options.delimiter || undefined,
      encoding: options.encoding || undefined,
      chunk: ({ data }: { data: string[][] }) => {
        const rows: string[][] = data;
        const start = rowId;
        rowId += rows.length;
        // @ts-ignore - postMessage is available on worker global scope
        postMessage({ type: 'CHUNK', sheetId, rows, startRowId: start });
      },
      complete: () => {
        // @ts-ignore
        postMessage({ type: 'DONE', sheetId, totalRows: rowId });
      },
      error: (error: any) => {
        // @ts-ignore
        postMessage({ type: 'ERROR', sheetId, error: String(error) });
      },
    });
  }
};


