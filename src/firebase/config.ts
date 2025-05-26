// src/firebase/config.ts
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyDUR2OrmNVo-etLH_iCMZgJcBu0iy6H6i4", // 👈 ESTA es la clave correcta
  authDomain: "distribuidora-d1763.firebaseapp.com",
  projectId: "distribuidora-d1763",
  storageBucket: "distribuidora-d1763.appspot.com",
  messagingSenderId: "757645771230",
  appId: "1:757645771230:web:c5221d5dcc9aa0df3a5d4f"
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
export const auth = getAuth(app)