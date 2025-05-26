import { useEffect, useState, useRef } from 'react'
import { collection, deleteDoc, doc, query, orderBy, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase/config'
import { AlertTriangle } from 'lucide-react'

interface Item {
  codigo: string
  nombre: string
  bultos: number
  precio: number
}

interface Venta {
  id: string
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
    const q = query(collection(db, 'ventas'), orderBy('fecha', 'desc'))
    const unsubscribe = onSnapshot(q, snapshot => {
      const data: Venta[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Venta))
      setVentas(data)
    })
    return () => unsubscribe()
  }, [])

  const confirmarEliminacion = (venta: Venta) => {
    setVentaAEliminar(venta)
    setMostrarModal(true)
  }

  const eliminarVenta = async () => {
    if (!ventaAEliminar) return
    await deleteDoc(doc(db, 'ventas', ventaAEliminar.id))
    setMostrarModal(false)
    setVentaAEliminar(null)
  }

  const ventasFiltradasPorFecha = ventas
    .filter(v => v.fecha.startsWith(fechaSeleccionada))
    .sort((a, b) => b.fecha.localeCompare(a.fecha))

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
    // Mantené tu JSX original desde acá sin cambios visuales
    <div className="container mx-auto px-4 py-8 space-y-10 relative">
      {/* ...contenido original (inputs, tabla, impresión, etc.) sin tocar... */}
    </div>
  )
}