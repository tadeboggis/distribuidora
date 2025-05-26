// src/firebase/config.ts

import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth" // 👈 para autenticación

const firebaseConfig = {
  apiKey: "AIzaSyDUR2ornNVo-etLH_iCMZgJcBu0iy6H6i4",
  authDomain: "distribuidora-d1763.firebaseapp.com",
  projectId: "distribuidora-d1763",
  storageBucket: "distribuidora-d1763.appspot.com",
  messagingSenderId: "757645771230",
  appId: "1:757645771230:web:c5221d5dcc9aa0df3a5d4f"
}

// Inicializa la app
const app = initializeApp(firebaseConfig)

// Exporta servicios
export const db = getFirestore(app)
export const auth = getAuth(app)