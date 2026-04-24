import { defineStore } from 'pinia'
import { ref } from 'vue'
import { signInWithPopup, signOut, onAuthStateChanged, deleteUser, reauthenticateWithPopup } from 'firebase/auth'
import { auth, provider } from '../firebase'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'

export const useAuthStore = defineStore('auth', () => {
  const user    = ref(null)
  const loading = ref(true)

  function init() {
    return new Promise(resolve => {
      onAuthStateChanged(auth, u => {
        user.value    = u
        loading.value = false
        resolve(u)
      })
    })
  }

  async function loginWithGoogle() {
    await signInWithPopup(auth, provider)
  }

  async function logout() {
    await signOut(auth)
  }

  async function deleteAccount() {
    const u = auth.currentUser
    if (!u) return
    // Vider le cache local AVANT que deleteUser() déclenche onAuthStateChanged
    // (sinon le composant peut se démonter avant que l'appelant ait le temps de le faire)
    localStorage.removeItem('budget-simulator-v1')
    try {
      await deleteDoc(doc(db, 'users', u.uid))
      await deleteUser(u)
    } catch (err) {
      if (err.code === 'auth/requires-recent-login') {
        await reauthenticateWithPopup(u, provider)
        try { await deleteDoc(doc(db, 'users', u.uid)) } catch {}
        await deleteUser(u)
      } else {
        throw err
      }
    }
  }

  return { user, loading, init, loginWithGoogle, logout, deleteAccount }
})
