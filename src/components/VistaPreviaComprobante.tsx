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

    const styles = `
      body {
        font-family: Arial, sans-serif;
        font-size: 13px;
        color: #000;
        background-color: white;
        padding: 40px;
        margin: 0;
      }
      h1 {
        text-align: center;
        font-size: 20px;
        font-weight: bold;
        margin-bottom: 4px;
      }
      .subtext {
        text-align: center;
        font-style: italic;
        color: #555;
        margin-bottom: 20px;
        font-size: 12px;
      }
      .meta {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        margin-bottom: 12px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 24px;
      }
      th, td {
        border: 1px solid #999;
        padding: 6px 10px;
      }
      th {
        background: #f2f2f2;
        text-align: left;
      }
      td.right {
        text-align: right;
      }
      td.center {
        text-align: center;
      }
      .totals {
        display: flex;
        justify-content: space-between;
        font-weight: bold;
        font-size: 14px;
        margin-bottom: 40px;
      }
      .footer {
        text-align: center;
        font-size: 12px;
        color: #666;
      }
    `

    return (
      <div ref={ref}>
        <style>{styles}</style>
        <h1>Distribuidora de Bebidas</h1>
        <p className="subtext">Este documento no es válido como factura</p>

        <div className="meta">
          <span>Fecha: {new Date().toLocaleDateString()}</span>
          <span>Hora: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Código</th>
              <th>Descripción</th>
              <th className="center">Bultos</th>
              <th className="right">P. Unit.</th>
              <th className="right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="center" style={{ fontStyle: 'italic', color: '#888' }}>
                  Aún no se agregaron ítems.
                </td>
              </tr>
            ) : (
              items.map((item, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{item.codigo}</td>
                  <td>{item.nombre}</td>
                  <td className="center">{item.cantidad}</td>
                  <td className="right">${item.precio}</td>
                  <td className="right">${item.precio * item.cantidad}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="totals">
          <span>Total bultos: {totalBultos}</span>
          <span>Total venta: ${totalVenta}</span>
        </div>

        <p className="footer">Gracias por su compra</p>
        <p className="footer">Sistema desarrollado por <strong>Bortiz Digital</strong></p>
      </div>
    )
  }
)