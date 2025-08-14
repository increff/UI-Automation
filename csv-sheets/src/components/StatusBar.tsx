export interface StatusBarProps {
  rows: number;
  cols: number;
  performanceMode?: boolean;
  warningsCount?: number;
}

export function StatusBar({ rows, cols, performanceMode, warningsCount = 0 }: StatusBarProps) {
  return (
    <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#555', paddingTop: 8 }}>
      <div>Rows: {rows}</div>
      <div>Cols: {cols}</div>
      {performanceMode && <div>Performance Mode</div>}
      {warningsCount > 0 && <div>Warnings: {warningsCount}</div>}
    </div>
  );
}

export default StatusBar;


