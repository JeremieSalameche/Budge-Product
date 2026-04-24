<template>
  <div class="login-form">
    <div class="login-form__inner">
      <div class="login-form__head">
        <h1 class="login-form__title">Se connecter</h1>
        <p class="login-form__sub">Accédez à votre espace budget en un clic avec votre compte Google.</p>
      </div>

      <button class="login-google" @click="login" :disabled="loading" type="button">
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {{ loading ? 'Connexion…' : 'Continuer avec Google' }}
      </button>

      <p class="login-form__legal">En continuant, tu acceptes nos conditions d'utilisation.</p>
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
.login-form {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  padding: 40px;
}
.login-form__inner {
  width: 100%; max-width: 400px;
  display: flex; flex-direction: column; gap: 28px;
}
.login-form__head { display: flex; flex-direction: column; gap: 10px; }
.login-form__title {
  font-size: 26px; font-weight: 700; color: #18181b;
  margin: 0; letter-spacing: -0.5px; line-height: 1.2;
}
.login-form__sub {
  font-size: 14px; color: #71717a; margin: 0; line-height: 1.5;
}
.login-google {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  width: 100%; height: 48px;
  background: #fff; border: 1.5px solid #e4e4e7;
  border-radius: 12px;
  font-size: 14px; font-weight: 500; color: #18181b;
  cursor: pointer; font-family: inherit;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
}
.login-google:hover:not(:disabled) {
  background: #fafafa; border-color: #d4d4d8;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.login-google:disabled { opacity: 0.55; cursor: not-allowed; }
.login-form__legal {
  font-size: 11px; color: #a1a1aa; text-align: center; margin: 0; line-height: 1.5;
}
</style>
