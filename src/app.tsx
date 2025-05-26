// src/App.tsx
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { NuevaVenta } from './pages/NuevaVenta'
import { Productos } from './pages/Productos'
import { Resumen } from './pages/Resumen'
import { Login } from './pages/Login'
import { cerrarSesion as cerrarSesionFirebase } from './utils/logout'

export default function App() {
  const [logueado, setLogueado] = useState(false)

  useEffect(() => {
    setLogueado(localStorage.getItem('logueado') === 'true')
  }, [])

  const cerrarSesion = async () => {
    await cerrarSesionFirebase()
    setLogueado(false)
  }

  return (
    <BrowserRouter>
      {logueado ? (
        <Layout cerrarSesion={cerrarSesion}>
          <Routes>
            <Route index element={<Navigate to="/nueva-venta" replace />} />
            <Route path="/nueva-venta" element={<NuevaVenta />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/resumen" element={<Resumen />} />
          </Routes>
        </Layout>
      ) : (
        <Login onLogin={() => setLogueado(true)} />
      )}
    </BrowserRouter>
  )
}