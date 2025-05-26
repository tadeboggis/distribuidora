import { forwardRef } from 'react'

interface Item {
  codigo: string
  nombre: string
  precio: number
  cantidad: number
}

interface VistaPreviaComprobanteProps {
  items: Item[]
}

export const VistaPreviaComprobante = forwardRef<HTMLDivElement, VistaPreviaComprobanteProps>(
  ({ items }, ref) => {
    const totalBultos = items.reduce((acc, i) => acc + i.cantidad, 0)
    const totalVenta = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0)

    return (
      <div
        ref={ref}
        className="bg-white p-8 text-base text-black rounded-xl shadow-md print:shadow-none print:rounded-none print:p-0 print:m-0 print:text-[13px] print:leading-relaxed"
      >
        <h1 className="text-2xl font-bold text-center mb-1">Distribuidora de Bebidas</h1>
        <p className="text-center italic text-gray-600 mb-4">Este documento no es válido como factura</p>

        <div className="flex justify-between mb-4 text-sm font-medium">
          <span>Fecha: {new Date().toLocaleDateString()}</span>
          <span>Hora: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs</span>
        </div>

        <table className="w-full border border-gray-400 border-collapse mb-6">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-2 text-left">#</th>
              <th className="border px-2 py-2 text-left">Código</th>
              <th className="border px-2 py-2 text-left">Descripción</th>
              <th className="border px-2 py-2 text-center">Bultos</th>
              <th className="border px-2 py-2 text-right">P. Unit.</th>
              <th className="border px-2 py-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="border px-3 py-4 text-center italic text-gray-400">
                  Aún no se agregaron ítems.
                </td>
              </tr>
            ) : (
              items.map((item, i) => (
                <tr key={i}>
                  <td className="border px-2 py-2">{i + 1}</td>
                  <td className="border px-2 py-2">{item.codigo}</td>
                  <td className="border px-2 py-2">{item.nombre}</td>
                  <td className="border px-2 py-2 text-center">{item.cantidad}</td>
                  <td className="border px-2 py-2 text-right">${item.precio}</td>
                  <td className="border px-2 py-2 text-right">${item.precio * item.cantidad}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="flex justify-between text-lg font-bold mb-6">
          <span>Total bultos: {totalBultos}</span>
          <span>Total venta: ${totalVenta}</span>
        </div>

        <p className="text-center text-gray-600 mb-8">Gracias por su compra</p>

        <div className="text-center text-xs text-gray-500 print:mt-8">
          Sistema desarrollado por <strong>Bortiz Digital</strong>
        </div>
      </div>
    )
  }
)

VistaPreviaComprobante.displayName = 'VistaPreviaComprobante'