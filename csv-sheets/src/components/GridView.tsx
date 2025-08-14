import { useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef } from 'ag-grid-community';
import type { ViewState } from '../data/models';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export interface GridViewProps {
  headers: string[];
  rows: string[][];
  performanceMode?: boolean;
  onViewStateChange?: (state: { columnOrder: number[]; hidden: boolean[]; sorts: Array<{ col: number; dir: 'asc' | 'desc' }>; filters: Record<number, any[]> }) => void;
  onEditCell?: (payload: { rowId: number; colIdx: number; value: string; oldValue?: string }) => void;
  registerUndoRedo?: (fns: { undo: () => void; redo: () => void }) => void;
  editable?: boolean;
  quickFilterText?: string;
  initialViewState?: ViewState;
}

export function GridView({ headers, rows, performanceMode, onViewStateChange, onEditCell, registerUndoRedo, editable = true, quickFilterText, initialViewState }: GridViewProps) {
  const columnDefs = useMemo<ColDef[]>(
    () =>
      headers.map((h, i) => ({
        headerName: h,
        field: `c${i}`,
        editable,
        filter: true,
        sortable: true,
        resizable: true,
      })),
    [headers, editable]
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

  const emitVS = (_api: any, columnApi: any) => {
    if (!onViewStateChange) return;
    const allColumns = columnApi?.getAllGridColumns?.() ?? columnApi?.getColumns?.() ?? [];
    const columnOrder = allColumns.map((c: any) => Number(String(c.getColId?.() ?? c.getId?.() ?? '').slice(1)));
    const hidden = allColumns.map((c: any) => (c.isVisible?.() ? false : true));
    const colState = columnApi?.getColumnState?.() ?? [];
    const sorts = (colState ?? [])
      .filter((s: any) => s.sort)
      .map((s: any) => ({ col: Number(String(s.colId).slice(1)), dir: s.sort } as { col: number; dir: 'asc' | 'desc' }));
    const filters: Record<number, any[]> = {};
    onViewStateChange({ columnOrder, hidden, sorts, filters });
  };

  const undoRef = useRef<() => void>(() => {});
  const redoRef = useRef<() => void>(() => {});

  return (
    <div className="ag-theme-alpine" style={{ width: '100%', height: 480 }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        multiSortKey={'shift' as any}
        getRowId={(params) => String(params.data.id)}
        rowSelection="single"
        suppressContextMenu={true}
        animateRows={true}
        theme={"legacy" as any}
        undoRedoCellEditing={true as any}
        undoRedoCellEditingLimit={100 as any}
        onGridReady={(e: any) => {
          // Apply initial view state if provided
          if (initialViewState) {
            const colState = (initialViewState.columnOrder.length ? initialViewState.columnOrder : headers.map((_, i) => i)).map((idx) => {
              const id = `c${idx}`;
              const sortEntry = (initialViewState.sorts || []).find((s) => s.col === idx);
              return {
                colId: id,
                sort: sortEntry?.dir,
                hide: initialViewState.hidden?.[idx] ?? false,
              };
            });
            const columnApi = e.columnApi ?? e.api;
            if (columnApi?.applyColumnState) {
              columnApi.applyColumnState({ state: colState, applyOrder: true });
            }
          }
          if (quickFilterText) {
            (e.api as any).setGridOption?.('quickFilterText', quickFilterText);
            (e.api as any).setQuickFilter?.(quickFilterText);
          }
          emitVS(e.api, e.columnApi ?? e.api);
          undoRef.current = () => (e.api as any).undoCellEditing?.();
          redoRef.current = () => (e.api as any).redoCellEditing?.();
          registerUndoRedo?.({ undo: () => undoRef.current(), redo: () => redoRef.current() });
        }}
        onColumnMoved={(e: any) => emitVS(e.api, e.columnApi ?? e.api)}
        onColumnVisible={(e: any) => emitVS(e.api, e.columnApi ?? e.api)}
        onSortChanged={(e: any) => emitVS(e.api, e.columnApi ?? e.api)}
        onCellValueChanged={(e) => {
          const colId = String(e.colDef.field);
          const colIdx = Number(colId.slice(1));
          const rowId = Number(e.data.id);
          const value = String(e.newValue ?? '');
          const oldValue = String(e.oldValue ?? '');
          onEditCell?.({ rowId, colIdx, value, oldValue });
        }}
      />
      <div style={{ fontSize: 12, color: '#999', paddingTop: 6 }}>
        {performanceMode ? 'Performance Mode' : null}
      </div>
    </div>
  );
}

export default GridView;


