export interface GridViewProps {
  headers: string[];
  rowCount: number;
  performanceMode?: boolean;
}

export function GridView({ headers, rowCount, performanceMode }: GridViewProps) {
  return (
    <div style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12, minHeight: 240 }}>
      <div style={{ marginBottom: 8, color: '#666' }}>
        Grid placeholder — columns: {headers.length}, rows: {rowCount} {performanceMode ? '(Performance Mode)' : ''}
      </div>
      <div style={{ fontSize: 12, color: '#999' }}>Integrate AG Grid here (virtualized, sortable, filterable, editable).</div>
    </div>
  );
}

export default GridView;


