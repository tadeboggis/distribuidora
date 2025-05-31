// src/pages/Resumen.tsx
import { useEffect, useState, useRef } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { AlertTriangle, Printer, Trash2 } from 'lucide-react'

interface Item {
  codigo: string
  nombre: string
  bultos: number
  precio: number
}
interface Venta {
  id: string
  fecha: string
  hora: string
  totalVenta: number
  totalBultos: number
  items: Item[]
}

const fmt = (n: number) =>
  n % 1 === 0
    ? n.toLocaleString('es-AR')
    : n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function Resumen() {
  const hoyISO = new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires'
  })
  const [fecha, setFecha] = useState(hoyISO)
  const [filtro, setFiltro] = useState('')
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(false)
  const [ventaSel, setVentaSel] = useState<Venta | null>(null)
  const refPrint = useRef<HTMLDivElement>(null)

  /* ───────── carga realtime ───────── */
  useEffect(() => {
    setLoading(true)
    const q = query(collection(db, 'ventas'), where('fecha', '==', fecha))
    const unsub = onSnapshot(q, snap => {
      const data = snap.docs
        .map(d => ({ id: d.id, ...(d.data() as Omit<Venta, 'id'>) }))
        .sort((a, b) => b.hora.localeCompare(a.hora)) // más reciente primero
      setVentas(data)
      setLoading(false)
    })
    return unsub
  }, [fecha])

  const ventasFiltradas = ventas.filter(v =>
    filtro ? ventas.length - ventas.indexOf(v) === Number(filtro) : true
  )
  const totalBultos = ventasFiltradas.reduce((s, v) => s + v.totalBultos, 0)
  const totalVenta = ventasFiltradas.reduce((s, v) => s + v.totalVenta, 0)

  /* ───────── eliminar (optimistic) ───────── */
  const eliminarVenta = async () => {
    if (!ventaSel) return
    // optimista
    setVentas(prev => prev.filter(v => v.id !== ventaSel.id))
    setVentaSel(null)
    try {
      await deleteDoc(doc(db, 'ventas', ventaSel.id))
    } catch (e) {
      console.error(e)
      // rollback si falló
      setVentas(prev => [...prev, ventaSel].sort((a, b) => b.hora.localeCompare(a.hora)))
    }
  }

  /* ───────── imprimir ───────── */
  const handlePrint = () => {
    const html = refPrint.current?.innerHTML
    if (!html) return
    const [yy, mm, dd] = fecha.split('-')
    const legible = `${dd}/${mm}/${yy}`

    const win = window.open('', '', 'width=900,height=650')!
    win.document.write(`
      <html><head><title>Resumen</title>
      <style>
        @page{size:A4;margin:12mm}
        body{font-family:Arial;font-size:11px}
        h1{font-size:18px;margin:0;text-align:center}
        .totdia{font-size:14px;font-weight:bold;margin:8px 0 14px;text-align:center}
        table{width:100%;border-collapse:collapse}
        th,td{border:1px solid #000;padding:4px 6px;text-align:center}
        th{background:#e5e5e5}
        .card{margin-bottom:18px;page-break-inside:avoid}
        .card-total{margin-top:6px;text-align:right;font-weight:bold;font-size:12px}
        footer{margin-top:20px;text-align:center;font-size:10px;color:#555}
        button{display:none}
      </style></head><body>
        <h1>Resumen de ventas</h1>
        <div style="text-align:center"><strong>Fecha:</strong> ${legible}</div>
        <div class="totdia">
          Total de bultos: ${fmt(totalBultos)} &nbsp;—&nbsp; Total vendido: $${fmt(totalVenta)}
        </div>
        ${html}
        <footer>Sistema desarrollado por Bortiz Digital</footer>
      </body></html>
    `)
    win.document.close(); win.focus(); win.print(); win.close()
  }

  /* ───────── UI ───────── */
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      {/* filtros */}
      <div className="bg-white shadow rounded-2xl p-6 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div className="flex flex-col w-56">
          <label className="text-base font-bold mb-1">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            className="border rounded-lg px-3 py-2 text-lg"
          />
        </div>
        <div className="flex flex-col w-48">
          <label className="text-base font-bold mb-1"># Comprobante</label>
          <input
            type="number"
            min={1}
            placeholder="Ej: 2"
            value={filtro}
            onChange={e => setFiltro(e.target.value)}
            className="border rounded-lg px-3 py-2 text-lg"
          />
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg text-lg self-start md:self-auto"
        >
          <Printer size={20}/> Imprimir resumen
        </button>
      </div>

      {/* totales pantalla (fuera de lo imprimible) */}
      <div className="bg-white shadow rounded-2xl p-6 text-center space-y-2">
        <div className="text-lg font-semibold">Total bultos vendidos</div>
        <div className="text-4xl font-extrabold">{fmt(totalBultos)}</div>
        <div className="text-lg font-semibold">Total vendido</div>
        <div className="text-4xl font-extrabold">$ {fmt(totalVenta)}</div>
      </div>

      {/* contenedor imprimible */}
      <div ref={refPrint} className="space-y-10">
        {loading ? (
          /* skeleton */
          <div className="bg-gray-200 h-40 rounded-2xl animate-pulse" />
        ) : ventasFiltradas.length === 0 ? (
          <div className="flex items-center gap-2 text-gray-500">
            <AlertTriangle size={20}/> No hay ventas para esta fecha / filtro.
          </div>
        ) : (
          ventasFiltradas.map(v => {
            const nro = ventas.length - ventas.indexOf(v)
            return (
              <div
                key={v.id}
                className="bg-white shadow rounded-2xl p-6 space-y-4 card transition hover:shadow-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold">Comprobante #{nro}</h3>
                    <p className="text-sm text-gray-600">Hora: {v.hora}</p>
                  </div>
                  <button
                    onClick={() => setVentaSel(v)}
                    className="text-red-600 hover:text-red-800 no-print"
                    title="Eliminar"
                  >
                    <Trash2 size={20}/>
                  </button>
                </div>

                <table className="w-full text-base">
                  <thead>
                    <tr>
                      <th className="w-20">Cant.</th>
                      <th>Producto</th>
                      <th className="w-28">Precio</th>
                      <th className="w-32">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {v.items.map((it, i) => (
                      <tr key={i}>
                        <td className="text-center">{it.bultos}</td>
                        <td className="text-center">{it.nombre}</td>
                        <td className="text-center">$ {fmt(it.precio)}</td>
                        <td className="text-center">$ {fmt(it.precio * it.bultos)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="text-right font-bold text-lg card-total">
                  Total: $ {fmt(v.totalVenta)} &nbsp;—&nbsp; Bultos: {fmt(v.totalBultos)}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* modal */}
      {ventaSel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 space-y-6 w-80 text-center">
            <div className="flex items-center justify-center gap-2 text-red-600">
              <AlertTriangle size={28}/>
              <span className="font-semibold">¿Eliminar este comprobante?</span>
            </div>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setVentaSel(null)}
                className="px-4 py-2 rounded border"
              >
                Cancelar
              </button>
              <button
                onClick={eliminarVenta}
                className="px-4 py-2 rounded bg-red-600 text-white"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}