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
    window.print()
  }

  return (
    <div className="print-a4 print-wrapper">
      <div ref={comprobanteRef}>
        <VistaPreviaComprobante items={items} ref={comprobanteRef} />
      </div>

      <div className="flex gap-4 mt-6 no-print">
        <Button onClick={handlePrint}>Imprimir comprobante</Button>
        {onSave && <Button onClick={onSave} variant="outline">Guardar comprobante</Button>}
      </div>
    </div>
  )
}