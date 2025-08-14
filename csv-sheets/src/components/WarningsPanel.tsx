export interface WarningsPanelProps {
  warnings: string[];
  headerRowIndex: number;
  delimiter?: string;
  encoding?: string;
  skipEmptyLines: boolean;
}

export function WarningsPanel({ warnings }: WarningsPanelProps) {
  return (
    <div style={{ borderLeft: '1px solid #eee', paddingLeft: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Warnings</div>
      {warnings.length === 0 ? (
        <div style={{ color: '#777' }}>No warnings</div>
      ) : (
        <ul>
          {warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default WarningsPanel;


