import { useMemo } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export interface GridViewProps {
  headers: string[];
  rows: string[][];
  performanceMode?: boolean;
}

export function GridView({ headers, rows, performanceMode }: GridViewProps) {
  const columnDefs = useMemo(
    () => headers.map((h, i) => ({ headerName: h, field: `c${i}` })),
    [headers]
  );
  const rowData = useMemo(
    () =>
      rows.map((r, idx) => {
        const obj: Record<string, string | number> = { id: idx };
        for (let i = 0; i < headers.length; i++) obj[`c${i}`] = r[i] ?? '';
        return obj;
      }),
    [rows, headers]
  );

  return (
    <div className="ag-theme-alpine" style={{ width: '100%', height: 480 }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        getRowId={(params) => String(params.data.id)}
        rowSelection="single"
        suppressContextMenu={true}
        animateRows={true}
      />
      <div style={{ fontSize: 12, color: '#999', paddingTop: 6 }}>
        {performanceMode ? 'Performance Mode' : null}
      </div>
    </div>
  );
}

export default GridView;


