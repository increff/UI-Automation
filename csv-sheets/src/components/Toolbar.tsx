export interface ToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  editMode: boolean;
  onToggleEdit: () => void;
  onExportSheet?: () => void;
  onExportAll?: () => void;
  onResetLayout?: () => void;
  onClearSearch?: () => void;
}

export function Toolbar({ search, onSearchChange, editMode, onToggleEdit, onExportSheet, onExportAll, onResetLayout, onClearSearch }: ToolbarProps) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <input
        placeholder="Search visible columns"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ flex: 1, padding: '6px 8px' }}
        aria-label="Search"
      />
      {search && (
        <button onClick={onClearSearch} aria-label="Clear search">×</button>
      )}
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <input type="checkbox" checked={editMode} onChange={onToggleEdit} /> Edit Mode
      </label>
      <button onClick={onExportSheet}>Export Sheet</button>
      <button onClick={onExportAll}>Export All</button>
      <button onClick={onResetLayout}>Reset Layout</button>
    </div>
  );
}

export default Toolbar;


