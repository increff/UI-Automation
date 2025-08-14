/* eslint-disable no-restricted-globals */
import Papa from 'papaparse';

type ParseStartMsg = {
  type: 'PARSESTART';
  sheetId: string;
  file: File;
  options: {
    headerRowIndex: number; // 1-based index
    delimiter?: string; // undefined = auto-detect
    encoding?: string;
    skipEmptyLines: boolean;
  };
};

type CancelMsg = { type: 'CANCEL'; sheetId: string };

type InMsg = ParseStartMsg | CancelMsg;

self.onmessage = (e: MessageEvent<InMsg>) => {
  const msg = e.data;
  if (msg.type !== 'PARSESTART') return;

  const { sheetId, file, options } = msg;
  let headers: string[] | null = null;
  let metaSent = false;
  let dataRowId = 0;
  let rowsSeen = 0; // includes header rows
  const startTs = Date.now();

  Papa.parse<string[]>(file, {
    worker: true,
    header: false,
    skipEmptyLines: options.skipEmptyLines,
    delimiter: options.delimiter || undefined,
    // @ts-ignore Papa in worker supports encoding but browser FileReader may ignore
    encoding: options.encoding || undefined,
    chunk: (results) => {
      const data: string[][] = results.data as unknown as string[][];
      const detectedDelimiter = results.meta?.delimiter as string | undefined;
      const outRows: string[][] = [];
      for (const row of data) {
        rowsSeen += 1;
        if (!headers && rowsSeen === options.headerRowIndex) {
          headers = row;
          if (!metaSent) {
            // @ts-ignore
            postMessage({ type: 'META', sheetId, headers, detected: { delimiter: detectedDelimiter, encoding: options.encoding } });
            metaSent = true;
          }
        } else if (headers) {
          outRows.push(row);
        }
      }
      if (outRows.length > 0) {
        const start = dataRowId;
        dataRowId += outRows.length;
        // @ts-ignore
        postMessage({ type: 'CHUNK', sheetId, rows: outRows, startRowId: start });
        // @ts-ignore
        postMessage({ type: 'PROGRESS', sheetId, rowsParsed: dataRowId, elapsedMs: Date.now() - startTs });
      }
    },
    complete: () => {
      // @ts-ignore
      postMessage({ type: 'DONE', sheetId, totalRows: dataRowId });
    },
    error: (error: any) => {
      // @ts-ignore
      postMessage({ type: 'ERROR', sheetId, error: String(error) });
    },
  });
};


