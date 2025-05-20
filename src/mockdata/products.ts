// src/mockdata/products.ts

export interface Product {
    codigo: string
    nombre: string
    precio: number
    stock: number
    stockMinimo: number
  }
  
  export const products: Product[] = [
    { codigo: 'A001', nombre: 'Coca Cola 2L', precio: 400, stock: 10, stockMinimo: 4 },
    { codigo: 'B002', nombre: 'Seven Up 2L', precio: 350, stock: 7, stockMinimo: 3 },
    { codigo: 'C003', nombre: 'Fernet Branca 750ml', precio: 2000, stock: 5, stockMinimo: 2 },
    { codigo: 'D004', nombre: 'Agua Villavicencio 1.5L', precio: 300, stock: 8, stockMinimo: 3 },
    { codigo: 'E005', nombre: 'Vino Tinto López 750ml', precio: 1800, stock: 6, stockMinimo: 2 }
  ]  