import { useRef } from 'react'
import { VistaPreviaComprobante } from './VistaPreviaComprobante'
import { Button } from './Button'

export interface Item {
  codigo: string
  nombre: string
  precio: number
  cantidad: number
}

interface ComprobanteProps {
  items: Item[]
  onSave?: () => void
}

export function Comprobante({ items, onSave }: ComprobanteProps) {
  const comprobanteRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (comprobanteRef.current) {
      const printWindow = window.open('', '_blank', 'width=900,height=650')

      const tailwindStyles = Array.from(document.querySelectorAll('style'))
        .map(style => style.innerHTML)
        .join('\n')

      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Comprobante</title>
              <style>${tailwindStyles}</style>
              <style>
                body {
                  background: white;
                  padding: 40px;
                }
              </style>
            </head>
            <body>
              ${comprobanteRef.current.innerHTML}
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
  }

  return (
    <div>
      <div ref={comprobanteRef}>
        <VistaPreviaComprobante items={items} ref={comprobanteRef} />
      </div>

      <div className="flex gap-4 mt-6">
        <Button onClick={handlePrint}>Imprimir comprobante</Button>
        {onSave && <Button onClick={onSave} variant="outline">Guardar comprobante</Button>}
      </div>
    </div>
  )
}