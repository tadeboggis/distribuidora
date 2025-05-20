// src/pages/Resumen.tsx

import { useEffect, useState, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Item {
  codigo: string
  nombre: string
  bultos: number
  precio: number
}

interface Venta {
  id: number
  fecha: string
  totalVenta: number
  totalBultos: number
  items: Item[]
}

export function Resumen() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [fechaSeleccionada, setFechaSeleccionada] = useState(() => new Date().toISOString().split('T')[0])
  const [filtroComprobante, setFiltroComprobante] = useState('')

  const [ventaAEliminar, setVentaAEliminar] = useState<Venta | null>(null)
  const [mostrarModal, setMostrarModal] = useState(false)
  const resumenRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stored = localStorage.getItem('ventasDelDia')
    const todasLasVentas: Venta[] = stored ? JSON.parse(stored) : []
    const ordenadas = todasLasVentas.sort((a, b) => b.id - a.id)
    setVentas(ordenadas)
  }, [])

  const confirmarEliminacion = (venta: Venta) => {
    setVentaAEliminar(venta)
    setMostrarModal(true)
  }

  const eliminarVenta = () => {
    if (!ventaAEliminar) return
    const nuevasVentas = ventas.filter(v => v.id !== ventaAEliminar.id)
    setVentas(nuevasVentas)
    localStorage.setItem('ventasDelDia', JSON.stringify(nuevasVentas))
    setMostrarModal(false)
    setVentaAEliminar(null)
  }

  const ventasFiltradasPorFecha = ventas
    .filter(v => {
      const fechaVenta = new Date(v.fecha)
      const fechaLocal = new Date(fechaVenta.getTime() - fechaVenta.getTimezoneOffset() * 60000)
      return fechaLocal.toISOString().startsWith(fechaSeleccionada)
    })
    .sort((a, b) => b.id - a.id)

  const ventasFiltradasFinal = ventasFiltradasPorFecha.filter((venta, idx) => {
    if (!filtroComprobante) return true
    const numeroComprobante = ventasFiltradasPorFecha.length - idx
    return numeroComprobante.toString() === filtroComprobante.trim()
  })

  const totalBultos = ventasFiltradasFinal.reduce((sum, venta) => sum + venta.totalBultos, 0)
  const totalVenta = ventasFiltradasFinal.reduce((sum, venta) => sum + venta.totalVenta, 0)

  const handlePrint = () => {
    const printContents = resumenRef.current?.innerHTML
    const win = window.open('', '', 'width=900,height=650')
    if (win && printContents) {
      win.document.write(`
        <html>
          <head>
            <title>Resumen de ventas</title>
            <style>
              @page { size: A4; margin: 15mm; }
              body { font-family: Arial, sans-serif; font-size: 11px; color: #000; }
              h1 { text-align: center; font-size: 16px; margin-bottom: 16px; }
              .resumen-info {
                text-align: center;
                margin-bottom: 20px;
              }
              .resumen-info .valor {
                font-size: 14px;
                font-weight: bold;
                margin: 4px 0;
              }
              .comprobante {
                margin-bottom: 24px;
                padding-bottom: 12px;
                border-bottom: 1px dashed #aaa;
              }
              .comprobante h3 {
                margin: 0 0 6px;
                font-size: 13px;
              }
              .comprobante .meta {
                font-size: 11px;
                color: #555;
                margin-bottom: 6px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 4px;
              }
              th, td {
                border: 1px solid #000;
                padding: 4px 6px;
                font-size: 11px;
              }
              th {
                background-color: #f0f0f0;
              }
              .total-line {
                text-align: right;
                font-weight: bold;
                margin-top: 8px;
                font-size: 12px;
              }
              .footer {
                text-align: center;
                font-size: 10px;
                margin-top: 30px;
                color: #777;
              }
            </style>
          </head>
          <body>
            ${printContents}
          </body>
        </html>
      `)
      win.document.close()
      win.focus()
      win.print()
      win.close()
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-10 relative">
      <h1 className="text-4xl font-bold text-primary">Resumen de ventas</h1>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-1">Seleccionar fecha</label>
          <input
            type="date"
            value={fechaSeleccionada}
            onChange={e => setFechaSeleccionada(e.target.value)}
            className="border border-gray-300 rounded px-4 py-2 text-lg w-full"
          />
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-700 mb-1">Buscar comprobante</label>
          <input
            type="text"
            value={filtroComprobante}
            onChange={e => setFiltroComprobante(e.target.value)}
            placeholder="Ej: 3"
            className="border border-gray-300 rounded px-4 py-2 text-lg w-full"
          />
        </div>
      </div>

      <div ref={resumenRef} className="space-y-8">
        <div className="bg-white rounded-xl shadow-md p-6 text-center space-y-1">
          <p className="text-lg text-gray-700">Total bultos vendidos:</p>
          <p className="text-3xl font-bold text-primary">{totalBultos}</p>
          <p className="text-lg text-gray-700">Total vendido:</p>
          <p className="text-3xl font-bold text-primary">${totalVenta}</p>
        </div>

        {ventasFiltradasFinal.length > 0 ? (
          <div className="space-y-6">
            {ventasFiltradasFinal.map((venta) => {
              const indexEnLista = ventasFiltradasPorFecha.findIndex(v => v.id === venta.id)
              const numeroComprobante = ventasFiltradasPorFecha.length - indexEnLista
              return (
                <div key={venta.id} className="bg-white p-6 rounded-xl shadow-md space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-semibold text-primary">Comprobante #{numeroComprobante}</div>
                    <button
                      onClick={() => confirmarEliminacion(venta)}
                      className="text-sm text-red-500 hover:underline"
                    >
                      Eliminar
                    </button>
                  </div>
                  <div className="text-sm text-gray-600">
                    Hora: {new Date(venta.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <table className="w-full text-sm border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-3 py-2">Cantidad</th>
                        <th className="border px-3 py-2">Producto</th>
                        <th className="border px-3 py-2">Precio</th>
                        <th className="border px-3 py-2">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {venta.items.map((item, i) => (
                        <tr key={i}>
                          <td className="border px-3 py-2 text-center">{item.bultos}</td>
                          <td className="border px-3 py-2">{item.nombre}</td>
                          <td className="border px-3 py-2 text-right">${item.precio}</td>
                          <td className="border px-3 py-2 text-right">${item.precio * item.bultos}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-right text-sm font-medium text-primary mt-2">
                    Total: ${venta.totalVenta} – Bultos: {venta.totalBultos}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-600 italic">No hay ventas registradas para esta fecha.</p>
        )}
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center transition-opacity duration-300 animate-fade-in">
          <div className="bg-white p-6 rounded-lg shadow-xl border border-red-200 w-[320px] text-center">
            <AlertTriangle size={40} className="mx-auto text-red-600 mb-3" />
            <p className="text-lg font-semibold text-red-600 mb-4">¿Eliminar este comprobante?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={eliminarVenta}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => {
                  setMostrarModal(false)
                  setVentaAEliminar(null)
                }}
                className="text-gray-600 hover:underline px-4 py-2"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}