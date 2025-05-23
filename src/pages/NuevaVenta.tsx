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
      const styles = Array.from(document.querySelectorAll('style')).map(s => s.innerHTML).join('\n')

      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Comprobante</title>
              <style>${styles}</style>
              <style>
                html, body {
                  margin: 0;
                  padding: 0;
                  height: 100%;
                  font-family: Arial, sans-serif;
                  font-size: 14px;
                  background: white;
                }

                body {
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  padding: 30mm 20mm;
                  box-sizing: border-box;
                }

                .comprobante-wrapper {
                  width: 100%;
                  max-width: 800px;
                  page-break-after: always;
                }

                h1 {
                  font-size: 24px;
                  margin-bottom: 4px;
                  text-align: center;
                }

                .subtitulo {
                  font-size: 13px;
                  color: #666;
                  text-align: center;
                  margin-bottom: 20px;
                  font-style: italic;
                }

                .datos {
                  display: flex;
                  justify-content: space-between;
                  font-size: 13px;
                  margin-bottom: 15px;
                }

                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 30px;
                }

                th, td {
                  border: 1px solid #ccc;
                  padding: 8px;
                  font-size: 13px;
                  text-align: left;
                }

                th {
                  background: #f2f2f2;
                }

                .totales {
                  font-size: 16px;
                  font-weight: bold;
                  display: flex;
                  justify-content: space-between;
                  margin-top: 20px;
                  margin-bottom: 30px;
                  padding-top: 10px;
                  border-top: 2px solid #000;
                }

                .footer {
                  text-align: center;
                  font-size: 12px;
                  color: #444;
                }
              </style>
            </head>
            <body>
              <div class="comprobante-wrapper">
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