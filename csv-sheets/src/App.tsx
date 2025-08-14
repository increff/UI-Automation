import { useMemo, useState } from 'react'
import './App.css'
import Uploader from './components/Uploader'
import SheetTabs from './components/SheetTabs'
import Toolbar from './components/Toolbar'
import GridView from './components/GridView'
import StatusBar from './components/StatusBar'
import WarningsPanel from './components/WarningsPanel'

function App() {
  const [tabs, setTabs] = useState<{ id: string; name: string; dirty?: boolean }[]>([])
  const [activeId, setActiveId] = useState<string | undefined>(undefined)
  const [search, setSearch] = useState('')
  const [editMode, setEditMode] = useState(false)

  const active = useMemo(() => tabs.find((t) => t.id === activeId), [tabs, activeId])

  const onFilesSelected = (files: File[]) => {
    const newTabs = files.map((f) => ({ id: `${f.name}|${f.size}|${f.lastModified}`, name: f.name.replace(/\.[^/.]+$/, '') }))
    setTabs((prev) => [...prev, ...newTabs])
    if (!activeId && newTabs[0]) setActiveId(newTabs[0].id)
  }

  return (
    <div style={{ display: 'grid', gridTemplateRows: 'auto auto auto 1fr auto', gap: 12, minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: 18 }}>CSV Sheets</h1>
        <Uploader onFilesSelected={onFilesSelected} />
      </header>
      <SheetTabs tabs={tabs} activeId={activeId} onSelect={setActiveId} onClose={(id) => setTabs(tabs.filter((t) => t.id !== id))} />
      <Toolbar
        search={search}
        onSearchChange={setSearch}
        editMode={editMode}
        onToggleEdit={() => setEditMode(!editMode)}
        onExportSheet={() => {}}
        onExportAll={() => {}}
        onResetLayout={() => {}}
      />
      <main style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 12 }}>
        <GridView headers={active ? ['Sample Header A', 'Sample Header B'] : []} rowCount={0} performanceMode={false} />
        <WarningsPanel warnings={[]} headerRowIndex={1} skipEmptyLines={true} />
      </main>
      <StatusBar rows={0} cols={active ? 2 : 0} warningsCount={0} />
    </div>
  )
}

export default App
