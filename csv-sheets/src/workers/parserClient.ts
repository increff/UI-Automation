export type ParserHandlers = {
  onMeta?: (payload: { headers: string[]; detected?: { delimiter?: string; encoding?: string } }) => void;
  onChunk?: (payload: { rows: string[][]; startRowId: number }) => void;
  onProgress?: (payload: { rowsParsed: number; elapsedMs: number }) => void;
  onDone?: (payload: { totalRows: number }) => void;
  onWarning?: (payload: { message: string; sample?: string }) => void;
  onError?: (payload: { error: string }) => void;
};

export function startParse(
  sheetId: string,
  file: File,
  options: { headerRowIndex: number; delimiter?: string; encoding?: string; skipEmptyLines: boolean },
  handlers: ParserHandlers
) {
  const worker = new Worker(new URL('./parser.worker.ts', import.meta.url), { type: 'module' });
  const onMessage = (e: MessageEvent<any>) => {
    const msg = e.data;
    if (!msg || msg.sheetId !== sheetId) return;
    switch (msg.type) {
      case 'META':
        handlers.onMeta?.({ headers: msg.headers, detected: msg.detected });
        break;
      case 'WARNING':
        handlers.onWarning?.({ message: msg.message, sample: msg.sample });
        break;
      case 'CHUNK':
        handlers.onChunk?.({ rows: msg.rows, startRowId: msg.startRowId });
        break;
      case 'PROGRESS':
        handlers.onProgress?.({ rowsParsed: msg.rowsParsed, elapsedMs: msg.elapsedMs });
        break;
      case 'DONE':
        handlers.onDone?.({ totalRows: msg.totalRows });
        cleanup();
        break;
      case 'ERROR':
        handlers.onError?.({ error: msg.error });
        cleanup();
        break;
    }
  };
  worker.addEventListener('message', onMessage);
  worker.postMessage({ type: 'PARSESTART', sheetId, file, options });

  function cleanup() {
    worker.removeEventListener('message', onMessage);
    worker.terminate();
  }

  return {
    cancel: () => {
      try {
        worker.postMessage({ type: 'CANCEL', sheetId });
      } finally {
        cleanup();
      }
    },
  };
}


