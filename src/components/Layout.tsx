// src/components/Layout.tsx
import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'

interface LayoutProps {
  children: ReactNode
  cerrarSesion: () => void
}

export function Layout({ children, cerrarSesion }: LayoutProps) {
  const [open, setOpen] = useState(false)

  const navItems = [
    { to: '/nueva-venta', label: 'Nueva Venta' },
    { to: '/productos', label: 'Catálogo' },
    { to: '/resumen', label: 'Resumen' }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      {/* HEADER */}
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-accent">
            Distribuidora
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-4 items-center">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg font-medium transition ${
                    isActive
                      ? 'bg-accent text-primary'
                      : 'text-white hover:bg-white/10'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <button
              onClick={cerrarSesion}
              className="ml-4 px-3 py-1 bg-white text-primary font-medium rounded hover:bg-gray-100"
            >
              Cerrar sesión
            </button>
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden"
            onClick={() => setOpen(o => !o)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile nav */}
        {open && (
          <nav className="md:hidden bg-primary px-4 pb-4">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md font-medium transition ${
                    isActive
                      ? 'bg-accent text-primary'
                      : 'text-white hover:bg-white/10'
                  }`
                }
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <button
              onClick={() => {
                cerrarSesion()
                setOpen(false)
              }}
              className="block w-full mt-2 text-left px-4 py-2 text-white hover:bg-white/10"
            >
              Cerrar sesión
            </button>
          </nav>
        )}
      </header>

      {/* MAIN */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Distribuidora. Todos los derechos reservados. Sistema desarrollado por Bortiz Digital.
      </footer>

      {/* TOASTS */}
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  )
}