import { useMemo, useState, useRef } from 'react'
import Papa from 'papaparse'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef } from 'ag-grid-community'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'

type Sheet = {
  name: string
  headers: string[]
  rows: string[][]
  warnings?: string[]
}

export default function App() {
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [progressByFile, setProgressByFile] = useState<Record<string, number>>({})
  const dragDepth = useRef(0)

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

  const parseFile = (file: File) => {
    const fileKey = file.name
    setProgressByFile((p) => ({ ...p, [fileKey]: 0 }))
    let headers: string[] | undefined
    const allRows: string[][] = []
    Papa.parse<string[]>(file, {
      worker: true,
      skipEmptyLines: true,
      chunkSize: 1024 * 256,
      chunk: (results) => {
        const data = results.data as unknown as string[][]
        if (!headers) {
          headers = (data.shift() || []).map((h) => String(h))
        }
        for (const row of data) allRows.push(row)
        setProgressByFile((p) => ({ ...p, [fileKey]: (p[fileKey] || 0) + data.length }))
      },
      complete: () => {
        const name = file.name.replace(/\.[^.]+$/, '')
        let hdrs = headers || []
        const warnings: string[] = []
        // If headers missing or too short, synthesise from longest row
        const maxLen = allRows.reduce((m, r) => Math.max(m, r.length), hdrs.length)
        if (hdrs.length === 0) {
          hdrs = Array.from({ length: maxLen }, (_, i) => `Column ${i + 1}`)
          warnings.push('Header row not detected; generated generic column names.')
        } else if (maxLen > hdrs.length) {
          const add = maxLen - hdrs.length
          for (let i = 0; i < add; i++) hdrs.push(`Column ${hdrs.length + 1}`)
          warnings.push(`Detected rows with more fields than headers; added ${add} generic column name(s).`)
        }
        // Basic ragged row warnings (limit to first 5 to avoid noise)
        const expected = hdrs.length
        let warned = 0
        for (let i = 0; i < allRows.length && warned < 5; i++) {
          if (allRows[i].length !== expected) {
            warnings.push(`Row ${i + 2} has ${allRows[i].length} fields; expected ${expected}.`)
            warned++
          }
        }
        setSheets((prev) => [...prev, { name, headers: hdrs, rows: allRows, warnings }])
        setProgressByFile((p) => {
          const { [fileKey]: _, ...rest } = p
          return rest
        })
        if (sheets.length === 0) setActiveIndex(0)
      },
      error: () => {
        setProgressByFile((p) => {
          const { [fileKey]: _, ...rest } = p
          return rest
        })
      },
    })
  }

  const onFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    Array.from(files).forEach(parseFile)
  }

  return (
    <div
      style={{ height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}
      onDragEnter={(e) => {
        e.preventDefault()
        dragDepth.current += 1
        setIsDragging(true)
      }}
      onDragOver={(e) => {
        e.preventDefault()
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        dragDepth.current -= 1
        if (dragDepth.current <= 0) {
          setIsDragging(false)
          dragDepth.current = 0
        }
      }}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        dragDepth.current = 0
        onFiles(e.dataTransfer?.files || null)
      }}
    >
      <header style={{ padding: 12, display: 'flex', gap: 12, alignItems: 'center', borderBottom: '1px solid #eee' }}>
        <input type="file" multiple accept=".csv,text/csv" onChange={(e) => onFiles(e.target.files)} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {sheets.map((s, i) => (
            <button key={s.name + i} onClick={() => setActiveIndex(i)} style={{ fontWeight: activeIndex === i ? 700 : 400 }}>
              {s.name}
            </button>
          ))}
          {Object.entries(progressByFile).map(([fname, rows]) => (
            <span key={fname} style={{ padding: '6px 10px', border: '1px dashed #aaa', borderRadius: 8, background: '#fafafa' }}>
              Parsing {fname}… {rows} rows
            </span>
          ))}
        </div>
      </header>
      <main style={{ flex: 1 }}>
        {active ? (
          <div className="ag-theme-quartz" style={{ height: '100%', width: '100%', background: '#fff', color: '#000' }}>
            <AgGridReact columnDefs={columnDefs} rowData={rowData} getRowId={(p) => p.data._id} rowSelection="single" animateRows />
            <div style={{ height: 16 }} />
            <div style={{ padding: 12 }}>
              <strong>Preview (first 50 rows)</strong>
              <div style={{ overflow: 'auto', border: '1px solid #eee', marginTop: 6 }}>
                <table style={{ borderCollapse: 'collapse', minWidth: 600 }}>
                  <thead>
                    <tr>
                      {active.headers.map((h, i) => (
                        <th key={i} style={{ border: '1px solid #eee', padding: '6px 8px', textAlign: 'left', background: '#fafafa' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {active.rows.slice(0, 50).map((r, ri) => (
                      <tr key={ri}>
                        {active.headers.map((_, ci) => (
                          <td key={ci} style={{ border: '1px solid #eee', padding: '6px 8px' }}>{r[ci] ?? ''}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: '#666' }}>Drop or select CSV files to preview</div>
        )}
      </main>
      {active?.warnings && active.warnings.length > 0 && (
        <aside style={{ position: 'absolute', right: 12, bottom: 12, maxWidth: 420, background: '#fff8e1', border: '1px solid #f5deb3', padding: 10, borderRadius: 8, color: '#7a5d00' }}>
          <strong>Warnings</strong>
          <ul style={{ margin: '6px 0 0 18px' }}>
            {active.warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </aside>
      )}
      {isDragging && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(100,108,255,0.08)', border: '3px dashed #646cff', display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
          <div style={{ color: '#646cff', fontSize: 18, background: '#fff', padding: '12px 18px', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            Drop CSV files to upload
          </div>
        </div>
      )}
    </div>
  )
}
