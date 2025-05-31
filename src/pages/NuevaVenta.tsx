// src/pages/NuevaVenta.tsx
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../components/Button'
import { VistaPreviaComprobante } from '../components/VistaPreviaComprobante'
import { db } from '../firebase/config'
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot
} from 'firebase/firestore'

interface Item {
  codigo: string
  nombre: string
  bultos: number
  precio: number
}

export function NuevaVenta() {
  const [items, setItems] = useState<Item[]>([])
  const [codigo, setCodigo] = useState('')
  const [nombre, setNombre] = useState('')
  const [bultos, setBultos] = useState(1)
  const [precio, setPrecio] = useState(0)
  const [catalogo, setCatalogo] = useState<any[]>([])

  const totalBultos = items.reduce((sum, i) => sum + i.bultos, 0)
  const totalVenta = items.reduce((sum, i) => sum + i.precio * i.bultos, 0)

  const comprobanteRef = useRef<HTMLDivElement>(null)

  const handlePrint = async () => {
    /* ───────────── IMPRIME ───────────── */
    if (comprobanteRef.current) {
      const printWindow = window.open('', '_blank', 'width=900,height=650')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Comprobante</title>
              <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
              <style>
                @page { size: A4; margin: 25mm; }
                html, body { padding:0;margin:0;background:#fff;font-size:14px;font-family:sans-serif;color:#000 }
                .no-shadow * { box-shadow:none!important;border-radius:0!important }
              </style>
            </head>
            <body>
              <div class="no-shadow">${comprobanteRef.current.innerHTML}</div>
              <script>
                window.onload = () => { window.print(); setTimeout(() => window.close(), 500) }
              </script>
            </body>
          </html>
        `)
        printWindow.document.close()
      }
    }

    /* ───────────── GUARDA VENTA + ACTUALIZA STOCK ───────────── */
    if (items.length === 0) return

    const ahora = new Date()
    const venta = {
      /* fecha en formato YYYY-MM-DD que espera Resumen */
      fecha: ahora.toLocaleDateString('en-CA', {
        timeZone: 'America/Argentina/Buenos_Aires'
      }),
      /* hora HH:MM (24 h) para mostrar en el comprobante del Resumen */
      hora: ahora.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      totalVenta,
      totalBultos,
      items
    }

    try {
      await addDoc(collection(db, 'ventas'), venta)

      // descuenta stock de cada producto
      for (const it of items) {
        const prod = catalogo.find((p: any) => p.codigo === it.codigo)
        if (prod) {
          const nuevoStock = Math.max((prod.stock ?? 0) - it.bultos, 0)
          await updateDoc(doc(db, 'catalogo', prod.codigo), { stock: nuevoStock })
        }
      }

      toast.success('Venta registrada e impresa ✔️')
      setItems([])
    } catch (err) {
      console.error('Error al guardar la venta:', err)
      toast.error('Error al guardar la venta')
    }
  }

  /* ───────────── AGREGA ITEM ───────────── */
  const agregarItem = () => {
    if (!codigo || !nombre || precio <= 0 || bultos <= 0) {
      toast.error('Completa todos los campos para agregar ítem')
      return
    }
    setItems([...items, { codigo, nombre, bultos, precio }])
    setCodigo('')
    setNombre('')
    setBultos(1)
    setPrecio(0)
    toast.success('Ítem agregado')
  }

  /* ───────────── CARGA CATÁLOGO EN TIEMPO REAL ───────────── */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'catalogo'), snap => {
      setCatalogo(snap.docs.map(d => d.data()))
    })
    return unsub
  }, [])

  /* ───────────── UI ───────────── */
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      <div className="bg-white rounded-2xl shadow-lg p-8 no-print">
        <h1 className="text-4xl font-bold text-primary mb-6">Nueva Venta</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-lg font-medium mb-1">Código</label>
            <input
              type="text"
              list="codigos"
              value={codigo}
              onChange={e => {
                const val = e.target.value.toUpperCase()
                setCodigo(val)
                const prod = catalogo.find((p: any) => p.codigo === val)
                if (prod) {
                  setNombre(prod.nombre)
                  setPrecio(prod.precio)
                } else {
                  setNombre('')
                  setPrecio(0)
                }
              }}
              placeholder="Código del producto"
              className="w-full"
            />
            <datalist id="codigos">
              {catalogo.map((p: any) => (
                <option key={p.codigo} value={p.codigo}>
                  {p.codigo} — {p.nombre}
                </option>
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-lg font-medium mb-1">Descripción</label>
            <input
              type="text"
              value={nombre}
              readOnly
              placeholder="Nombre del producto"
              className="w-full bg-gray-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-lg font-medium mb-1">Bultos</label>
              <input
                type="number"
                min={1}
                value={bultos}
                onChange={e => setBultos(Number(e.target.value))}
                placeholder="Cantidad"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-lg font-medium mb-1">
                P. Unit. ($)
              </label>
              <input
                type="number"
                value={precio}
                readOnly
                placeholder="Precio unitario"
                className="w-full bg-gray-50"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={agregarItem} fullWidth>
            Agregar ítem
          </Button>
        </div>
      </div>

      {/* comprobante */}
      <div ref={comprobanteRef}>
        <VistaPreviaComprobante
          ref={comprobanteRef}
          items={items.map(it => ({ ...it, cantidad: it.bultos }))}
        />
      </div>

      <div className="flex justify-center mt-6 no-print">
        <Button onClick={handlePrint}>Imprimir comprobante</Button>
      </div>
    </div>
  )
}