// src/firebase/config.ts
import { initializeApp } from "firebase/app";
import {
  initializeFirestore,
  enableIndexedDbPersistence,
  setLogLevel
} from "firebase/firestore";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword
} from "firebase/auth";

/* ─────── credenciales de tu proyecto ─────── */
const firebaseConfig = {
  apiKey:            "AIzaSyDUR2OrmNVo-etLH_iCMZgJcBu0iy6H6i4",
  authDomain:        "distribuidora-d1763.firebaseapp.com",
  projectId:         "distribuidora-d1763",
  storageBucket:     "distribuidora-d1763.appspot.com",
  messagingSenderId: "757645771230",
  appId:             "1:757645771230:web:c5221d5dcc9aa0df3a5d4f"
};

const app = initializeApp(firebaseConfig);

/* ─── Firestore con long-polling y caché offline ─── */
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  cacheSizeBytes: 40 * 1024 * 1024        // 40 MB
});

enableIndexedDbPersistence(db).catch(() => {
  /* incógnito o bloqueo del storage → seguimos online-only */
});

/* ─── Auth ─── */
export const auth = getAuth(app);

/**
 * Inicia sesión con el usuario “de servicio” de la empresa
 * y mantiene la sesión guardada en localStorage para que
 * esté disponible en cualquier pestaña / dispositivo.
 */
export async function loginEmpresa () {
  await setPersistence(auth, browserLocalPersistence);   // recuerda la sesión

  // ⚠️ CREAR este usuario en la consola de Firebase Authentication
  //     o usar uno que ya exista.
  return signInWithEmailAndPassword(
    auth,
    "sistema@mi-empresa.com",
    "CLAVE_SUPER_SEGURA"
  );
}

/* ─── Ocultar verbosidad en producción (opcional) ─── */
// if (import.meta.env.PROD) setLogLevel("error");