import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  deleteUser,
  reauthenticateWithPopup,
} from 'firebase/auth'
import { auth, provider } from '../firebase'
import { doc, deleteDoc } from 'firebase/firestore'
import { db } from '../firebase'

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

export const useAuthStore = defineStore('auth', () => {
  const user    = ref(null)
  const loading = ref(true)

  async function init() {
    // On mobile, Firebase uses redirect flow — pick up the result if coming back
    if (isMobile) {
      try { await getRedirectResult(auth) } catch {}
    }
    return new Promise(resolve => {
      onAuthStateChanged(auth, u => {
        user.value    = u
        loading.value = false
        resolve(u)
      })
    })
  }

  async function loginWithGoogle() {
    if (isMobile) {
      await signInWithRedirect(auth, provider)
    } else {
      await signInWithPopup(auth, provider)
    }
  }

  async function logout() {
    await signOut(auth)
  }

  async function deleteAccount() {
    const u = auth.currentUser
    if (!u) return
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
