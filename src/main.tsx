// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";
import "./index.css";

/* ─── login automático ─── */
import { loginEmpresa } from "./firebase/config";   // ← ruta relativa
loginEmpresa().catch(console.error);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);