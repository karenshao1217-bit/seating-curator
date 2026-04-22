import { useState, useEffect } from 'react'
import { onAuthStateChanged, signInAnonymously, type User } from 'firebase/auth'
import { auth } from '../lib/firebase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  const ensureAuth = async (): Promise<User> => {
    if (auth.currentUser) return auth.currentUser
    const cred = await signInAnonymously(auth)
    return cred.user
  }

  return { user, loading, ensureAuth }
}
