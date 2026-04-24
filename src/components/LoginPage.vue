<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="login-logo">💰</div>
      <h1>Budget Simulator</h1>
      <p>Connecte-toi pour accéder à ton budget</p>
      <button class="btn-google" @click="login" :disabled="loading">
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {{ loading ? 'Connexion...' : 'Continuer avec Google' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const loading   = ref(false)

async function login() {
  loading.value = true
  try {
    await authStore.loginWithGoogle()
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrapper {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f4f5;
  font-family: system-ui, -apple-system, sans-serif;
}
.login-card {
  background: white;
  border-radius: 20px;
  padding: 48px 40px;
  text-align: center;
  box-shadow: 0 8px 40px rgba(0,0,0,0.10);
  width: 100%;
  max-width: 380px;
  margin: 16px;
}
.login-logo { font-size: 44px; margin-bottom: 20px; display: block; }
h1 { font-size: 22px; font-weight: 700; margin: 0 0 8px; color: #18181b; letter-spacing: -0.3px; }
p  { color: #71717a; margin: 0 0 32px; font-size: 14px; line-height: 1.5; }
.btn-google {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 13px 24px;
  border: 1.5px solid #e4e4e7;
  border-radius: 12px;
  background: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
  color: #18181b;
  font-family: inherit;
}
.btn-google:hover:not(:disabled) { background: #f9f9f9; border-color: #d4d4d8; }
.btn-google:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
