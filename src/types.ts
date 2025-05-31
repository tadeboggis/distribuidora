// src/types.ts
export interface Producto {
    id: string;
    nombre: string;
    precio: number;
    // …lo que uses (litros, stock, etc.)
  }
  
  export interface Comprobante {
    id: string;
    productos: Producto[];
    total: number;
    bultos: number;
    hora: any;          // Timestamp de Firestore
  }
  
  export type NuevaVenta = Omit<Comprobante, "id" | "hora">;  