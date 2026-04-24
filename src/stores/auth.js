import { defineStore } from 'pinia'
import { ref } from 'vue'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { auth, provider } from '../firebase'

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

  return { user, loading, init, loginWithGoogle, logout }
})
