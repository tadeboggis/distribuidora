import { format } from 'date-fns'
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
  const totalBultos = items.reduce((acc, i) => acc + i.cantidad, 0)
  const totalVenta = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0)

  const handlePrint = () => {
    const fecha = format(new Date(), 'd/M/yyyy')
    const hora = format(new Date(), 'HH:mm')

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Comprobante</title>
  <style>
    @page {
      size: A4;
      margin: 25mm;
    }

    html, body {
      margin: 0;
      padding: 0;
      background: white;
      font-family: Arial, sans-serif;
      font-size: 13px;
      text-align: center;
    }

    .wrapper {
      display: inline-block;
      text-align: left;
      width: 800px;
    }

    h1 {
      text-align: center;
      font-size: 22px;
      margin-bottom: 2px;
    }

    .subtitulo {
      text-align: center;
      font-size: 12px;
      margin-bottom: 20px;
      font-style: italic;
    }

    .header {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      margin-bottom: 10px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }

    th, td {
      border: 1px solid #000;
      padding: 8px;
      text-align: left;
    }

    th {
      background: #f0f0f0;
    }

    .totales {
      margin-top: 30px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      font-size: 18px;
      color: #000;
    }

    .footer {
      text-align: center;
      font-size: 11px;
      margin-top: 40px;
      color: #444;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <h1>Distribuidora de Bebidas</h1>
    <p class="subtitulo">Este documento no es válido como factura</p>
    <div class="header">
      <span>Fecha: ${fecha}</span>
      <span>Hora: ${hora} hs</span>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Código</th>
          <th>Descripción</th>
          <th>Bultos</th>
          <th>P. Unit.</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (item, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${item.codigo}</td>
                <td>${item.nombre}</td>
                <td>${item.cantidad}</td>
                <td>$${item.precio}</td>
                <td>$${item.precio * item.cantidad}</td>
              </tr>
            `
          )
          .join('')}
      </tbody>
    </table>

    <div class="totales">
      <span>Total bultos: ${totalBultos}</span>
      <span>Total venta: $${totalVenta}</span>
    </div>

    <p class="footer">Gracias por su compra</p>
  </div>

  <script>
    window.onload = function() {
      window.print();
      setTimeout(() => window.close(), 500);
    };
  </script>
</body>
</html>
`

    const win = window.open('', '_blank', 'width=900,height=650')
    if (win) {
      win.document.write(html)
      win.document.close()
    }
  }

  return (
    <div>
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-primary">Distribuidora de Bebidas</h1>
        <p className="text-sm italic text-gray-600 mb-4">Este documento no es válido como factura</p>

        {items.length === 0 ? (
          <p className="text-gray-500 italic">Agregá productos para generar el comprobante.</p>
        ) : (
          <table className="w-full text-sm border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-3 py-2">#</th>
                <th className="border px-3 py-2">Código</th>
                <th className="border px-3 py-2">Descripción</th>
                <th className="border px-3 py-2">Bultos</th>
                <th className="border px-3 py-2">P. Unit.</th>
                <th className="border px-3 py-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td className="border px-3 py-2 text-center">{i + 1}</td>
                  <td className="border px-3 py-2">{item.codigo}</td>
                  <td className="border px-3 py-2">{item.nombre}</td>
                  <td className="border px-3 py-2 text-center">{item.cantidad}</td>
                  <td className="border px-3 py-2 text-right">${item.precio}</td>
                  <td className="border px-3 py-2 text-right">${item.precio * item.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="flex justify-between mt-4 font-semibold text-primary text-lg">
          <span>Total bultos: {totalBultos}</span>
          <span>Total venta: ${totalVenta}</span>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">Gracias por su compra</p>
      </div>

      <div className="flex gap-4 mt-6">
        <Button onClick={handlePrint}>Imprimir comprobante</Button>
        {onSave && <Button onClick={onSave} variant="outline">Guardar comprobante</Button>}
      </div>
    </div>
  )
}