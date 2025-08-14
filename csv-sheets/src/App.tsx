import { useMemo, useState } from 'react'
import './App.css'
import Uploader from './components/Uploader'
import SheetTabs from './components/SheetTabs'
import Toolbar from './components/Toolbar'
import GridView from './components/GridView'
import StatusBar from './components/StatusBar'
import WarningsPanel from './components/WarningsPanel'
import { startParse } from './workers/parserClient'
import { computeFileHash } from './utils/fileHash'
import { shouldUsePerformanceMode } from './utils/perf'
import { DexieAdapter } from './data/adapters/DexieAdapter'
import { MemoryAdapter } from './data/adapters/MemoryAdapter'
import type { IDataAdapter, PatchMap } from './data/models'
import { exportSheetCSV } from './utils/csvExport'
import { exportAllZip } from './utils/zipExport'

function App() {
  const [tabs, setTabs] = useState<{ id: string; name: string; dirty?: boolean }[]>([])
  const [activeId, setActiveId] = useState<string | undefined>(undefined)
  const [search, setSearch] = useState('')
  const [editMode, setEditMode] = useState(false)

  const active = useMemo(() => tabs.find((t) => t.id === activeId), [tabs, activeId])

  type SheetData = { headers: string[]; previewRows: string[][]; rowCount: number; warnings: string[]; performance: boolean }
  const [sheets, setSheets] = useState<Record<string, SheetData>>({})
  const [, setProgress] = useState<Record<string, { rowsParsed: number; elapsedMs: number }>>({})
  const [adapters, setAdapters] = useState<Record<string, IDataAdapter>>({})
  const [patches] = useState<Record<string, PatchMap>>({}) as any

  const onFilesSelected = (files: File[]) => {
    const newTabs = files.map((f) => ({ id: computeFileHash(f), name: f.name.replace(/\.[^/.]+$/, '') }))
    setTabs((prev) => [...prev, ...newTabs])
    if (!activeId && newTabs[0]) setActiveId(newTabs[0].id)

    for (const f of files) {
      const id = computeFileHash(f)
      const perf = shouldUsePerformanceMode({ fileSizeBytes: f.size })
      const adapter: IDataAdapter = perf ? new DexieAdapter({ sheetId: id }) : new MemoryAdapter()
      setAdapters((a) => ({ ...a, [id]: adapter }))
      startParse(
        id,
        f,
        { headerRowIndex: 1, skipEmptyLines: true },
        {
          onMeta: async ({ headers }) => {
            if (adapter.setHeaders) await adapter.setHeaders(headers)
            setSheets((s) => ({ ...s, [id]: { headers, previewRows: [], rowCount: 0, warnings: [], performance: perf } }))
          },
          onChunk: async ({ rows }) => {
            if (adapter.appendRows) await adapter.appendRows(rows)
            setSheets((s) => {
              const prev = s[id]
              const previewRows = prev?.previewRows ? prev.previewRows.slice() : []
              if (previewRows.length < 1000) {
                const toAdd = rows.slice(0, Math.max(0, 1000 - previewRows.length))
                previewRows.push(...toAdd)
              }
              const rowCount = (prev?.rowCount ?? 0) + rows.length
              const headers = prev?.headers ?? []
              const performance = prev?.performance ?? perf
              return { ...s, [id]: { headers, previewRows, rowCount, warnings: prev?.warnings ?? [], performance } }
            })
          },
          onProgress: ({ rowsParsed, elapsedMs }) =>
            setProgress((p) => ({ ...p, [id]: { rowsParsed, elapsedMs } })),
          onDone: ({ totalRows }) =>
            setSheets((s) => {
              const prev = s[id]
              if (!prev) return s
              return { ...s, [id]: { ...prev, rowCount: totalRows } }
            }),
          onError: ({ error }) => console.error('Parse error', error),
        }
      )
    }
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
        onExportSheet={async () => {
          if (!active) return
          const adapter = adapters[active.id]
          if (!adapter) return
          const blob = await exportSheetCSV(adapter, {
            columnOrder: sheets[active.id]?.headers.map((_, i) => i) ?? [],
            hidden: sheets[active.id]?.headers.map(() => false) ?? [],
            patches: (patches[active.id] ?? new Map()) as any,
            lineEnding: '\n',
          })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${active.name}.csv`
          a.click()
          URL.revokeObjectURL(url)
        }}
        onExportAll={async () => {
          const list = tabs
            .filter((t) => adapters[t.id])
            .map((t) => ({
              name: t.name,
              adapter: adapters[t.id]!,
              columnOrder: sheets[t.id]?.headers.map((_, i) => i) ?? [],
              hidden: sheets[t.id]?.headers.map(() => false) ?? [],
              patches: (patches[t.id] ?? new Map()) as any,
              lineEnding: '\n' as const,
              hasEdits: !!patches[t.id],
            }))
          const blob = await exportAllZip(list)
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `all-sheets.zip`
          a.click()
          URL.revokeObjectURL(url)
        }}
        onResetLayout={() => {
          // placeholder; view state persistence to be wired to Grid events
          // would clear localStorage for the active sheet id
        }}
      />
      <main style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 12 }}>
        <GridView
          headers={active && sheets[active.id] ? sheets[active.id]!.headers : []}
          rows={active && sheets[active.id] ? sheets[active.id]!.previewRows : []}
          performanceMode={!!(active && sheets[active.id] && sheets[active.id]!.performance)}
        />
        <WarningsPanel warnings={active && sheets[active.id] ? sheets[active.id]!.warnings : []} headerRowIndex={1} skipEmptyLines={true} />
      </main>
      <StatusBar rows={active && sheets[active.id] ? sheets[active.id]!.rowCount : 0} cols={active && sheets[active.id] ? sheets[active.id]!.headers.length : 0} warningsCount={active && sheets[active.id] ? sheets[active.id]!.warnings.length : 0} performanceMode={!!(active && sheets[active.id] && sheets[active.id]!.performance)} />
    </div>
  )
}

export default App
