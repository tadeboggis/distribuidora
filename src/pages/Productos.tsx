// ✅ Reemplazo optimizado de Productos.tsx con onSnapshot

import { useState, useEffect } from 'react'
import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { Button } from '../components/Button'
import toast from 'react-hot-toast'

interface Product {
  codigo: string
  nombre: string
  precio: number
  stock: number
  stockMinimo: number
}

export function Productos() {
  const [catalogo, setCatalogo] = useState<Product[]>([])
  const [codigo, setCodigo] = useState('')
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState<number | string>('')
  const [stock, setStock] = useState<number | string>('')
  const [stockMinimo, setStockMinimo] = useState<number | string>('1')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'catalogo'), snapshot => {
      const data = snapshot.docs.map(doc => doc.data() as Product)
      setCatalogo(data)
    })
    return () => unsubscribe()
  }, [])

  const filtered = catalogo.filter(p =>
    p.codigo.includes(search.toUpperCase()) ||
    p.nombre.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async () => {
    const numPrecio = Number(precio)
    const numStock = Number(stock)
    const numStockMin = Number(stockMinimo)

    if (!codigo || !nombre || numPrecio <= 0) {
      toast.error('Completa todos los campos antes de guardar')
      return
    }

    const product: Product = {
      codigo,
      nombre,
      precio: numPrecio,
      stock: numStock,
      stockMinimo: numStockMin
    }

    await setDoc(doc(db, 'catalogo', codigo), product)
    toast.success('Producto guardado')
    setCodigo('')
    setNombre('')
    setPrecio('')
    setStock('')
    setStockMinimo('1')
  }

  const handleDelete = async (code: string) => {
    await deleteDoc(doc(db, 'catalogo', code))
    toast('Producto eliminado', { icon: '🗑️' })
  }

  const updateField = async (codigo: string, key: keyof Product, value: number) => {
    const producto = catalogo.find(p => p.codigo === codigo)
    if (!producto) return
    const actualizado = { ...producto, [key]: value }
    await setDoc(doc(db, 'catalogo', codigo), actualizado)
  }

  const hayBajoStock = catalogo.some(p => p.stock <= p.stockMinimo)

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-4xl font-bold text-primary">Catálogo de Productos</h1>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-base font-semibold mb-1">Código</label>
            <input
              placeholder="Código del producto"
              value={codigo}
              onChange={e => setCodigo(e.target.value.toUpperCase())}
              className="w-full text-center"
            />
          </div>
          <div>
            <label className="block text-base font-semibold mb-1">Nombre</label>
            <input
              placeholder="Nombre del producto"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              className="w-full text-center"
            />
          </div>
          <div>
            <label className="block text-base font-semibold mb-1">Precio ($)</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\\d*"
              placeholder="Precio"
              value={precio}
              onChange={e => setPrecio(e.target.value.replace(/^0+(?!$)/, ''))}
              className="w-full text-center"
            />
          </div>
          <div>
            <label className="block text-base font-semibold mb-1">Stock</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\\d*"
              placeholder="Cantidad"
              value={stock}
              onChange={e => setStock(e.target.value.replace(/^0+(?!$)/, ''))}
              className="w-full text-center"
            />
          </div>
          <div>
            <label className="block text-base font-semibold mb-1">Stock mínimo</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="\\d*"
              placeholder="Mínimo deseado"
              value={stockMinimo}
              onChange={e => setStockMinimo(e.target.value.replace(/^0+(?!$)/, ''))}
              className="w-full text-center"
            />
          </div>
        </div>
        <div className="mt-6">
          <Button onClick={handleSubmit} fullWidth>
            Guardar producto
          </Button>
        </div>
      </div>

      {hayBajoStock && (
        <div className="bg-red-200 border-2 border-red-500 text-red-900 font-bold text-lg p-4 rounded-lg animate-pulse">
          🚨 ¡Atención! Hay productos con stock por debajo del mínimo establecido.
        </div>
      )}

      <div className="flex justify-end">
        <input
          type="text"
          placeholder="🔍 Buscar código o nombre"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full md:w-1/3"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-4 text-center">Código</th>
              <th className="p-4 text-center">Nombre</th>
              <th className="p-4 text-center">Precio</th>
              <th className="p-4 text-center">Stock</th>
              <th className="p-4 text-center">Stock mínimo</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No se encontraron productos
                </td>
              </tr>
            ) : (
              filtered.map(p => (
                <tr
                  key={p.codigo}
                  className={
                    p.stock <= p.stockMinimo ? 'bg-red-100 text-red-800 font-semibold' : 'even:bg-gray-50'
                  }
                >
                  <td className="p-4 text-center">{p.codigo}</td>
                  <td className="p-4 text-center">{p.nombre}</td>
                  <td className="p-4 text-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="\\d*"
                      className="w-24 text-center"
                      value={p.precio}
                      onChange={e => updateField(p.codigo, 'precio', Number(e.target.value.replace(/^0+(?!$)/, '')))}
                      onFocus={e => e.target.select()}
                    />
                  </td>
                  <td className="p-4 text-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="\\d*"
                      className="w-24 text-center"
                      value={p.stock}
                      onChange={e => updateField(p.codigo, 'stock', Number(e.target.value.replace(/^0+(?!$)/, '')))}
                      onFocus={e => e.target.select()}
                    />
                  </td>
                  <td className="p-4 text-center">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="\\d*"
                      className="w-24 text-center"
                      value={p.stockMinimo}
                      onChange={e => updateField(p.codigo, 'stockMinimo', Number(e.target.value.replace(/^0+(?!$)/, '')))}
                      onFocus={e => e.target.select()}
                    />
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleDelete(p.codigo)}
                      className="text-red-500 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}