export interface TabSpec { id: string; name: string; dirty?: boolean }

export interface SheetTabsProps {
  tabs: TabSpec[];
  activeId?: string;
  onSelect?: (id: string) => void;
  onClose?: (id: string) => void;
}

export function SheetTabs({ tabs, activeId, onSelect, onClose }: SheetTabsProps) {
  return (
    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '8px 0' }}>
      {tabs.map((t) => (
        <div key={t.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => onSelect?.(t.id)}
            style={{
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid #ccc',
              background: t.id === activeId ? '#eef' : '#fff',
            }}
          >
            {t.name}
            {t.dirty ? ' *' : ''}
          </button>
          <button aria-label={`Close ${t.name}`} onClick={() => onClose?.(t.id)} style={{ border: 'none', background: 'transparent' }}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default SheetTabs;


