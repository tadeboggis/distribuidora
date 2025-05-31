// src/App.tsx
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth }          from "./firebase/config";      // ← cambio
import { Layout }        from "./components/Layout";    // ← cambio
import { NuevaVenta }    from "./pages/NuevaVenta";     // ← cambio
import { Productos }     from "./pages/Productos";      // ← cambio
import { Resumen }       from "./pages/Resumen";        // ← cambio
import { Login }         from "./pages/Login";          // ← cambio

export default function App() {
  const [logueado, setLogueado] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      setLogueado(!!user);
      setChecking(false);
    });
    return unsub;
  }, []);

  const cerrarSesion = () => signOut(auth);

  if (checking) return <div className="p-8 text-xl">Cargando…</div>;

  return (
    <BrowserRouter>
      {logueado ? (
        <Layout cerrarSesion={cerrarSesion}>
          <Routes>
            <Route index element={<Navigate to="/nueva-venta" replace />} />
            <Route path="/nueva-venta" element={<NuevaVenta />} />
            <Route path="/productos"  element={<Productos />} />
            <Route path="/resumen"    element={<Resumen />} />
          </Routes>
        </Layout>
      ) : (
        <Login onLogin={() => setLogueado(true)} />
      )}
    </BrowserRouter>
  );
}