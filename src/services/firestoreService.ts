// src/services/firestoreService.ts
import {
    collection,
    doc,
    addDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    Timestamp,
    getDocs
  } from "firebase/firestore";
  
  import { db } from "../firebase/config";              // ← ruta relativa
  import type { Producto, Comprobante, NuevaVenta } from "../types";
  
  const catalogRef = collection(db, "catalogo");
  
  /* ─────────── Productos ─────────── */
  export const productos = {
    listen: (cb: (docs: Producto[]) => void) =>
      onSnapshot(query(catalogRef, orderBy("nombre", "asc")), snap =>
        cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Producto)))
      ),
  
    add:    (p: Omit<Producto, "id">) => addDoc(catalogRef, p),
    remove: (id: string)             => deleteDoc(doc(catalogRef, id))
  };
  
  /* ─────────── Ventas / comprobantes ─────────── */
  export const ventas = {
    /* escuchar las ventas de un día (colección anidada) */
    listenDelDia: (fecha: string, cb: (c: Comprobante[]) => void) => {
      const col = collection(db, `ventas/${fecha}/comprobantes`);
      return onSnapshot(query(col, orderBy("hora", "desc")), snap =>
        cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Comprobante)))
      );
    },
  
    /* crear comprobante con marca de tiempo */
    addComprobante: (fecha: string, data: NuevaVenta) => {
      const col = collection(db, `ventas/${fecha}/comprobantes`);
      return addDoc(col, { ...data, hora: Timestamp.now() });
    },
  
    deleteComprobante: (fecha: string, id: string) =>
      deleteDoc(doc(db, `ventas/${fecha}/comprobantes/${id}`)),
  
    /* utilitario para la impresión A4 */
    async traerDelDia(fecha: string) {
      const col  = collection(db, `ventas/${fecha}/comprobantes`);
      const snap = await getDocs(query(col, orderBy("hora", "desc")));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Comprobante));
    }
  };   