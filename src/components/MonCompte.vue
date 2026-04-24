<template>
  <div class="moncompte">

    <!-- Profil -->
    <section class="mc-section">
      <h2 class="mc-section-title">Profil</h2>
      <div class="mc-profile">
        <img v-if="user?.photoURL" :src="user.photoURL" class="mc-avatar" referrerpolicy="no-referrer" />
        <div v-else class="mc-avatar mc-avatar--initials">{{ initial }}</div>
        <div class="mc-profile-info">
          <div class="mc-profile-name">{{ user?.displayName ?? 'Utilisateur' }}</div>
          <div class="mc-profile-email">{{ user?.email ?? '—' }}</div>
          <div class="mc-profile-since">Compte créé le {{ creationDate }}</div>
        </div>
      </div>
    </section>

    <!-- Partage -->
    <section class="mc-section">
      <h2 class="mc-section-title">Partage du foyer</h2>
      <p class="mc-section-desc">Exportez un foyer pour le partager ou le sauvegarder. Importez un fichier .budge pour remplacer les données du foyer actif.</p>
      <div class="mc-actions">

        <!-- Export avec picker de foyer -->
        <div class="mc-action-wrap">
          <button class="mc-action" type="button" @click="exportPickerOpen = !exportPickerOpen">
            <div class="mc-action-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1v9M5 7l3 3 3-3M2 11.5v1A1.5 1.5 0 003.5 14h9A1.5 1.5 0 0014 12.5v-1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <div class="mc-action-body">
              <div class="mc-action-title">Exporter un foyer</div>
              <div class="mc-action-sub">Télécharge un fichier .budge avec toutes les données</div>
            </div>
            <svg class="mc-action-arrow" :class="{ 'mc-action-arrow--open': exportPickerOpen }" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>

          <!-- Picker foyers -->
          <div v-if="exportPickerOpen" class="mc-foyer-picker">
            <button
              v-for="f in store.foyers"
              :key="f.id"
              class="mc-foyer-row"
              type="button"
              @click="exportFoyer(f.id)"
            >
              <span class="mc-foyer-dot" :style="{ background: f.couleur }"></span>
              <span class="mc-foyer-name">{{ f.nom }}</span>
              <span class="mc-foyer-count">{{ f.depenses?.length ?? 0 }} dépense{{ (f.depenses?.length ?? 0) !== 1 ? 's' : '' }}</span>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v8M3 7l3.5 3.5L10 7M1.5 11.5h10" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>
        </div>

        <button class="mc-action" type="button" @click="$refs.fileInput.click()">
          <div class="mc-action-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 14V5M5 8l3-3 3 3M2 3.5v-1A1.5 1.5 0 013.5 1h9A1.5 1.5 0 0114 2.5v1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="mc-action-body">
            <div class="mc-action-title">Importer un foyer</div>
            <div class="mc-action-sub">Charger un fichier .budge — remplace les données actuelles</div>
          </div>
          <svg class="mc-action-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <input ref="fileInput" type="file" accept=".budge,.json" style="display:none" @change="onImport" />
      </div>
    </section>

    <!-- Connexion -->
    <section class="mc-section">
      <h2 class="mc-section-title">Connexion</h2>
      <div class="mc-actions">
        <button class="mc-action" type="button" @click="authStore.logout()">
          <div class="mc-action-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 14H3.5A1.5 1.5 0 012 12.5v-9A1.5 1.5 0 013.5 2H6M10.5 11.5l3-3-3-3M13.5 8.5H5.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="mc-action-body">
            <div class="mc-action-title">Se déconnecter</div>
            <div class="mc-action-sub">{{ user?.email }}</div>
          </div>
          <svg class="mc-action-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>
    </section>

    <!-- Zone dangereuse -->
    <section class="mc-section mc-section--danger">
      <h2 class="mc-section-title mc-section-title--danger">Zone dangereuse</h2>
      <p class="mc-section-desc">La suppression est définitive et irréversible. Toutes vos données Budge seront effacées.</p>
      <button class="mc-btn-danger" type="button" @click="confirmDelete" :disabled="deleting">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 3.5h9M5.5 3.5V2h4v1.5M6 6v5M9 6v5M2.5 3.5l.5 9a1 1 0 001 1h7a1 1 0 001-1l.5-9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        {{ deleting ? 'Suppression…' : 'Supprimer mon compte' }}
      </button>
    </section>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBudgetStore } from '../stores/budget'
import { useAuthStore }   from '../stores/auth'

const store     = useBudgetStore()
const authStore = useAuthStore()
const deleting  = ref(false)
const exportPickerOpen = ref(false)

function exportFoyer(foyerId) {
  store.exportBudge(foyerId)
  exportPickerOpen.value = false
}

const user        = computed(() => authStore.user)
const initial     = computed(() => user.value?.displayName?.[0]?.toUpperCase() ?? '?')
const creationDate = computed(() => {
  const t = user.value?.metadata?.creationTime
  if (!t) return '—'
  return new Date(t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
})

async function onImport(e) {
  const file = e.target.files?.[0]
  if (!file) return
  e.target.value = ''
  try {
    await store.importBudge(file)
    store.showNotification('Foyer importé avec succès', 'success')
  } catch (err) {
    store.showNotification(err.message || 'Import échoué', 'error')
  }
}

async function confirmDelete() {
  const ok = window.confirm(
    'Supprimer définitivement votre compte ?\n\nToutes vos données seront effacées et cette action est irréversible.'
  )
  if (!ok) return
  deleting.value = true
  try {
    await authStore.deleteAccount()
    localStorage.removeItem('budget-simulator-v1')
  } catch {
    store.showNotification('Échec de la suppression. Réessayez.', 'error')
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.moncompte {
  display: flex; flex-direction: column; gap: 36px;
  max-width: 560px; padding: 4px 0 48px;
}

.mc-section { display: flex; flex-direction: column; gap: 14px; }
.mc-section--danger { padding-top: 8px; border-top: 1.5px solid #f4f4f5; }

.mc-section-title {
  font-size: 11px; font-weight: 600; color: #a1a1aa;
  text-transform: uppercase; letter-spacing: 0.6px; margin: 0;
}
.mc-section-title--danger { color: #f87171; }

.mc-section-desc { font-size: 13px; color: #71717a; margin: 0; line-height: 1.5; }

/* Profile card */
.mc-profile {
  display: flex; align-items: center; gap: 16px;
  padding: 20px; border-radius: 14px;
  background: #fafafa; border: 1.5px solid #e4e4e7;
}
.mc-avatar {
  width: 56px; height: 56px; border-radius: 14px;
  object-fit: cover; flex-shrink: 0;
}
.mc-avatar--initials {
  background: #18181b; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-weight: 700;
}
.mc-profile-info  { display: flex; flex-direction: column; gap: 3px; }
.mc-profile-name  { font-size: 16px; font-weight: 700; color: #18181b; }
.mc-profile-email { font-size: 13px; color: #52525b; }
.mc-profile-since { font-size: 12px; color: #a1a1aa; margin-top: 2px; }

/* Action rows */
.mc-actions { display: flex; flex-direction: column; gap: 8px; }
.mc-action {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 16px; border-radius: 12px; width: 100%;
  background: #fafafa; border: 1.5px solid #e4e4e7;
  cursor: pointer; font-family: inherit; text-align: left;
  transition: border-color 0.15s, background 0.15s;
}
.mc-action:hover { border-color: #a1a1aa; background: #f4f4f5; }
.mc-action-icon {
  width: 36px; height: 36px; border-radius: 9px; flex-shrink: 0;
  background: #f4f4f5; border: 1.5px solid #e4e4e7;
  display: flex; align-items: center; justify-content: center;
  color: #52525b;
}
.mc-action-body { flex: 1; min-width: 0; }
.mc-action-title { font-size: 14px; font-weight: 500; color: #18181b; }
.mc-action-sub   { font-size: 12px; color: #71717a; margin-top: 1px; }
.mc-action-arrow { color: #d4d4d8; flex-shrink: 0; }

/* Export foyer picker */
.mc-action-wrap { display: flex; flex-direction: column; }
.mc-action-arrow { transition: transform 0.2s ease; }
.mc-action-arrow--open { transform: rotate(90deg); }

.mc-foyer-picker {
  border: 1.5px solid #e4e4e7;
  border-top: none;
  border-radius: 0 0 12px 12px;
  overflow: hidden;
  background: #fff;
}
.mc-foyer-row {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 11px 16px;
  background: #fafafa; border: none; border-top: 1px solid #f0f0f0;
  cursor: pointer; font-family: inherit; text-align: left;
  transition: background 0.12s;
}
.mc-foyer-row:first-child { border-top: none; }
.mc-foyer-row:hover { background: #f4f4f5; }
.mc-foyer-dot {
  width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
}
.mc-foyer-name { flex: 1; font-size: 13px; font-weight: 500; color: #18181b; }
.mc-foyer-count { font-size: 12px; color: #a1a1aa; }
.mc-foyer-row svg { color: #a1a1aa; flex-shrink: 0; }

/* Danger button */
.mc-btn-danger {
  display: inline-flex; align-items: center; gap: 8px;
  height: 44px; padding: 0 18px; border-radius: 10px;
  font-size: 14px; font-weight: 500; font-family: inherit;
  cursor: pointer;
  background: #fff5f5; border: 1.5px solid #fecaca; color: #ef4444;
  transition: background 0.15s, border-color 0.15s;
}
.mc-btn-danger:hover:not(:disabled) { background: #fee2e2; border-color: #ef4444; }
.mc-btn-danger:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
