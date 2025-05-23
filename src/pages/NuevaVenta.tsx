import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../components/Button'
import { VistaPreviaComprobante } from '../components/VistaPreviaComprobante'

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
  const [catalogo, setCatalogo] = useState(() => {
    const stored = localStorage.getItem('catalogo')
    return stored ? JSON.parse(stored) : []
  })

  const totalBultos = items.reduce((sum, i) => sum + i.bultos, 0)
  const totalVenta = items.reduce((sum, i) => sum + i.precio * i.bultos, 0)

  const comprobanteRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (comprobanteRef.current) {
      const printWindow = window.open('', '_blank', 'width=900,height=650')

      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Comprobante</title>
              <style>
                @page { size: A4; margin: 20mm; }
                html, body {
                  margin: 0;
                  padding: 0;
                  font-family: Arial, sans-serif;
                  font-size: 13px;
                  background: white;
                }
                .wrapper {
                  width: 100%;
                  max-width: 800px;
                  margin: 0 auto;
                }
                h1 {
                  font-size: 22px;
                  text-align: center;
                  margin: 0 0 6px 0;
                }
                .subtitulo {
                  text-align: center;
                  font-size: 13px;
                  font-style: italic;
                  color: #666;
                  margin-bottom: 20px;
                }
                .datos {
                  display: flex;
                  justify-content: space-between;
                  font-size: 12px;
                  margin-bottom: 10px;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 20px;
                }
                th, td {
                  border: 1px solid #ccc;
                  padding: 8px;
                  font-size: 13px;
                }
                th {
                  background: #f5f5f5;
                }
                .totales {
                  display: flex;
                  justify-content: space-between;
                  font-weight: bold;
                  font-size: 16px;
                  margin-top: 30px;
                  border-top: 2px solid #000;
                  padding-top: 10px;
                }
                .footer {
                  text-align: center;
                  font-size: 12px;
                  color: #666;
                  margin-top: 40px;
                }
              </style>
            </head>
            <body>
              <div class="wrapper">
                ${comprobanteRef.current.innerHTML}
              </div>
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(() => window.close(), 500);
                }
              </script>
            </body>
          </html>
        `)
        printWindow.document.close()
      }
    }

    if (items.length > 0) {
      const venta = {
        id: Date.now(),
        fecha: new Date().toISOString(),
        totalVenta,
        totalBultos,
        items,
      }

      const ventasGuardadas = JSON.parse(localStorage.getItem('ventasDelDia') || '[]')
      localStorage.setItem('ventasDelDia', JSON.stringify([...ventasGuardadas, venta]))

      const storedCatalog = localStorage.getItem('catalogo')
      if (storedCatalog) {
        const catalog = JSON.parse(storedCatalog)
        const updatedCatalog = catalog.map((product: any) => {
          const item = items.find(i => i.codigo === product.codigo)
          if (item) {
            return {
              ...product,
              stock: Math.max((product.stock || 0) - item.bultos, 0)
            }
          }
          return product
        })
        localStorage.setItem('catalogo', JSON.stringify(updatedCatalog))
      }

      toast.success('Venta registrada e impresa ✔️')
      setItems([])
    }
  }

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

  useEffect(() => {
    const cargarCatalogo = () => {
      const stored = localStorage.getItem('catalogo')
      if (stored) {
        setCatalogo(JSON.parse(stored))
      }
    }

    cargarCatalogo()

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        cargarCatalogo()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

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
              <label className="block text-lg font-medium mb-1">P. Unit. ($)</label>
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

      <div ref={comprobanteRef}>
        <VistaPreviaComprobante
          ref={comprobanteRef}
          items={items.map(i => ({
            ...i,
            cantidad: i.bultos
          }))}
        />
      </div>

      <div className="flex justify-center mt-6 no-print">
        <Button onClick={handlePrint}>Imprimir comprobante</Button>
      </div>
    </div>
  )
}