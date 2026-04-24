<template>
  <div class="login-page">

    <!-- Glows background -->
    <div class="login-glow login-glow--1"></div>
    <div class="login-glow login-glow--2"></div>
    <div class="login-glow login-glow--3"></div>

    <!-- Logo top center -->
    <div class="login-top-logo">
      <img src="/logo-budge-white.svg" class="login-top-logo__img" alt="Budge" />
    </div>

    <!-- Card centrée -->
    <div class="login-card">

      <div class="login-card__body">
        <h1 class="login-card__title">Votre budget.<br>Sous contrôle.</h1>
        <p class="login-card__sub">Connecte-toi pour accéder à ton espace budget.</p>
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

      <p class="login-card__legal">En continuant, tu acceptes nos conditions d'utilisation.</p>

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
* { box-sizing: border-box; }

.login-page {
  position: fixed; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  background: #0d0d0f;
  font-family: system-ui, -apple-system, sans-serif;
  padding: 40px 24px 24px;
}

.login-top-logo {
  position: absolute;
  top: 40px; left: 0; right: 0;
  display: flex; justify-content: center;
  z-index: 1;
}
.login-top-logo__img { height: 50px; width: auto; }

/* Glows */
.login-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
.login-glow--1 {
  width: 700px; height: 700px;
  bottom: -250px; left: -150px;
  background: radial-gradient(circle, rgba(236,72,153,0.28) 0%, transparent 60%);
  filter: blur(60px);
}
.login-glow--2 {
  width: 600px; height: 600px;
  bottom: -200px; left: 15%;
  background: radial-gradient(circle, rgba(124,111,205,0.22) 0%, transparent 60%);
  filter: blur(60px);
}
.login-glow--3 {
  width: 500px; height: 500px;
  bottom: -100px; right: -100px;
  background: radial-gradient(circle, rgba(74,158,219,0.18) 0%, transparent 60%);
  filter: blur(60px);
}

/* Card */
.login-card {
  position: relative; z-index: 1;
  width: 100%; max-width: 400px;
  background: #ffffff;
  border-radius: 20px;
  padding: 40px 36px 32px;
  display: flex; flex-direction: column; gap: 24px;
  box-shadow: 0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06);
}

.login-card__body { display: flex; flex-direction: column; gap: 8px; }
.login-card__title {
  font-size: 22px; font-weight: 700; color: #18181b;
  margin: 0; letter-spacing: -0.5px; line-height: 1.2;
}
.login-card__sub {
  font-size: 14px; color: #71717a;
  margin: 0; line-height: 1.5;
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
  background: #fafafa;
  border-color: #d4d4d8;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.login-google:disabled { opacity: 0.55; cursor: not-allowed; }

.login-card__legal {
  font-size: 11px; color: #a1a1aa;
  text-align: center; margin: 0; line-height: 1.5;
}
</style>
