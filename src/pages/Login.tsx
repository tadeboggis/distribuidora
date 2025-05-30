// src/pages/Login.tsx
import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase/config'

export function Login({ onLogin }: { onLogin: () => void }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, user, pass)
      localStorage.setItem('logueado', 'true')
      onLogin()
    } catch (err) {
      console.error(err)
      setError('Usuario o contraseña incorrectos')
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md space-y-4 w-[300px]">
        <h1 className="text-xl font-bold text-center text-primary">Acceso al sistema</h1>
        <input
          type="email"
          placeholder="Email"
          value={user}
          onChange={e => setUser(e.target.value)}
          className="w-full border border-gray-300 px-4 py-2 rounded"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={pass}
          onChange={e => setPass(e.target.value)}
          className="w-full border border-gray-300 px-4 py-2 rounded"
        />
        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
        <button type="submit" className="w-full bg-accent text-white font-semibold py-2 rounded">Ingresar</button>
      </form>
    </div>
  )
}