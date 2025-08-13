import { useMemo, useState } from 'react'
import Papa from 'papaparse'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'

type Sheet = {
  name: string
  headers: string[]
  rows: string[][]
}

export default function App() {
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [activeIndex, setActiveIndex] = useState(0)

  const active = sheets[activeIndex]
  const columnDefs: ColDef[] = useMemo(() => {
    if (!active) return []
    return active.headers.map((h, i) => ({ headerName: h, field: String(i), resizable: true, sortable: true, filter: true }))
  }, [active])

  const rowData = useMemo(() => {
    if (!active) return []
    return active.rows.map((r, idx) => {
      const rec: Record<string, string> = { _id: String(idx) }
      r.forEach((cell, i) => { rec[String(i)] = cell })
      return rec
    })
  }, [active])

  const onFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const newSheets: Sheet[] = []
    let processed = 0
    Array.from(files).forEach((file) => {
      Papa.parse<string[]>(file, {
        worker: true,
        skipEmptyLines: true,
        complete: (res: Papa.ParseResult<string[]>) => {
          const rows = res.data as unknown as string[][]
          const headers = (rows.shift() || []).map((h) => String(h))
          newSheets.push({ name: file.name.replace(/\.[^.]+$/, ''), headers, rows })
          processed += 1
          if (processed === files.length) {
            setSheets((prev) => [...prev, ...newSheets])
            if (sheets.length === 0) setActiveIndex(0)
          }
        },
        error: () => {
          processed += 1
        },
      })
    })
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: 12, display: 'flex', gap: 12, alignItems: 'center', borderBottom: '1px solid #eee' }}>
        <input type="file" multiple accept=".csv,text/csv" onChange={(e) => onFiles(e.target.files)} />
        <div style={{ display: 'flex', gap: 8 }}>
          {sheets.map((s, i) => (
            <button key={s.name + i} onClick={() => setActiveIndex(i)} style={{ fontWeight: activeIndex === i ? 700 : 400 }}>
              {s.name}
            </button>
          ))}
        </div>
      </header>
      <main style={{ flex: 1 }}>
        {active ? (
          <div className="ag-theme-quartz" style={{ height: '100%', width: '100%' }}>
            <AgGridReact columnDefs={columnDefs} rowData={rowData} getRowId={(p) => p.data._id} rowSelection="single" animateRows />
          </div>
        ) : (
          <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: '#666' }}>Drop or select CSV files to preview</div>
        )}
      </main>
    </div>
  )
}
