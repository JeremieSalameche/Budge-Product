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

    <!-- Apparence -->
    <section class="mc-section">
      <h2 class="mc-section-title">Apparence</h2>
      <div class="mc-theme-toggle">
        <button
          :class="['mc-theme-btn', { 'mc-theme-btn--active': theme === 'light' }]"
          type="button"
          @click="theme = 'light'"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
          Clair
        </button>
        <button
          :class="['mc-theme-btn', { 'mc-theme-btn--active': theme === 'dark' }]"
          type="button"
          @click="theme = 'dark'"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
          Sombre
        </button>
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
      <p class="mc-section-desc">La suppression est définitive et irréversible. Toutes vos données Budge seront effacées et ne pourront pas être récupérées.</p>
      <button class="mc-btn-danger" type="button" @click="deleteModalOpen = true" :disabled="deleting">
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M3 3.5h9M5.5 3.5V2h4v1.5M6 6v5M9 6v5M2.5 3.5l.5 9a1 1 0 001 1h7a1 1 0 001-1l.5-9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        Supprimer mon compte
      </button>
    </section>

  </div>

  <!-- Modale suppression compte -->
  <Teleport to="body">
    <div v-if="deleteModalOpen" class="mcd__overlay" @click.self="deleteModalOpen = false">
      <div class="mcd__modal">

        <!-- Header -->
        <div class="mcd__head">
          <div class="mcd__head-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M8.485 8.485L10 10m0 0l1.515 1.515M10 10l1.515-1.515M10 10L8.485 11.515M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
          </div>
          <div>
            <h3 class="mcd__title">Supprimer votre compte ?</h3>
            <p class="mcd__subtitle">Cette action ne peut pas être annulée</p>
          </div>
          <button class="mcd__close" type="button" @click="deleteModalOpen = false">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          </button>
        </div>

        <!-- Warning -->
        <div class="mcd__warning">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style="flex-shrink:0;margin-top:1px"><path d="M7.5 1.5L13.5 12.5H1.5L7.5 1.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><line x1="7.5" y1="6" x2="7.5" y2="9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="7.5" cy="11" r="0.7" fill="currentColor"/></svg>
          <p>Toutes vos données seront <strong>définitivement supprimées</strong> — foyers, dépenses, comptes, projets. Il n'existe aucun moyen de les récupérer après coup.</p>
        </div>

        <!-- Export avant suppression -->
        <div class="mcd__export">
          <div class="mcd__export-text">
            <div class="mcd__export-title">Conserver une copie de vos données ?</div>
            <div class="mcd__export-sub">Exportez votre foyer au format .budge avant de continuer — vous pourrez le réimporter plus tard si besoin.</div>
          </div>
          <button class="mcd__export-btn" type="button" @click="exportBeforeDelete">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1v9M5 7l3 3 3-3M2 11.5v1A1.5 1.5 0 003.5 14h9A1.5 1.5 0 0014 12.5v-1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Exporter mes données
          </button>
        </div>

        <!-- Actions -->
        <div class="mcd__foot">
          <button class="mcd__btn mcd__btn--cancel" type="button" @click="deleteModalOpen = false">Annuler</button>
          <button class="mcd__btn mcd__btn--confirm" type="button" @click="doDeleteAccount" :disabled="deleting">
            <svg width="13" height="13" viewBox="0 0 15 15" fill="none"><path d="M3 3.5h9M5.5 3.5V2h4v1.5M6 6v5M9 6v5M2.5 3.5l.5 9a1 1 0 001 1h7a1 1 0 001-1l.5-9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            {{ deleting ? 'Suppression en cours…' : 'Supprimer définitivement' }}
          </button>
        </div>

      </div>
    </div>
  </Teleport>

</template>

<script setup>
import { ref, computed } from 'vue'
import { useBudgetStore } from '../stores/budget'
import { useAuthStore }   from '../stores/auth'
import { useTheme }       from '../composables/useTheme'

const store     = useBudgetStore()
const authStore = useAuthStore()
const { theme } = useTheme()
const deleting  = ref(false)
const exportPickerOpen = ref(false)
const deleteModalOpen  = ref(false)

function exportFoyer(foyerId) {
  store.exportBudge(foyerId)
  exportPickerOpen.value = false
}

function exportBeforeDelete() {
  const foyerId = store.foyerActifId
  if (foyerId) store.exportBudge(foyerId)
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

async function doDeleteAccount() {
  deleting.value = true
  try {
    await authStore.deleteAccount()
    // localStorage déjà vidé dans deleteAccount() côté auth store
  } catch {
    store.showNotification('Échec de la suppression. Réessayez.', 'error')
    deleting.value = false
    deleteModalOpen.value = false
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

/* ── Modale suppression compte ───────────────────────────── */
.mcd__overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000; padding: 24px;
}
.mcd__modal {
  background: #fff; border-radius: 18px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.18);
  width: 100%; max-width: 460px;
  display: flex; flex-direction: column;
  overflow: hidden;
}

/* Header */
.mcd__head {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 22px 22px 18px;
  border-bottom: 1.5px solid #fee2e2;
  background: #fff5f5;
}
.mcd__head-icon {
  width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
  background: #fee2e2; border: 1.5px solid #fecaca; color: #ef4444;
  display: flex; align-items: center; justify-content: center;
}
.mcd__title   { font-size: 16px; font-weight: 700; color: #18181b; margin: 0 0 2px; }
.mcd__subtitle { font-size: 12px; color: #ef4444; margin: 0; font-weight: 500; }
.mcd__close {
  margin-left: auto; flex-shrink: 0;
  width: 28px; height: 28px; border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  background: none; border: none; color: #a1a1aa;
  cursor: pointer; transition: background 0.12s, color 0.12s;
}
.mcd__close:hover { background: #f4f4f5; color: #18181b; }

/* Warning */
.mcd__warning {
  display: flex; align-items: flex-start; gap: 10px;
  margin: 18px 22px 0;
  padding: 14px 16px; border-radius: 10px;
  background: #fff7ed; border: 1.5px solid #fed7aa; color: #7c2d12;
  font-size: 13px; line-height: 1.55;
}
.mcd__warning strong { font-weight: 700; }
.mcd__warning svg { color: #ea580c; }

/* Export */
.mcd__export {
  display: flex; align-items: center; gap: 14px;
  margin: 12px 22px 0;
  padding: 14px 16px; border-radius: 10px;
  background: #fafafa; border: 1.5px solid #e4e4e7;
}
.mcd__export-text { flex: 1; }
.mcd__export-title { font-size: 13px; font-weight: 600; color: #18181b; }
.mcd__export-sub   { font-size: 11px; color: #71717a; margin-top: 2px; line-height: 1.4; }
.mcd__export-btn {
  display: inline-flex; align-items: center; gap: 6px; flex-shrink: 0;
  height: 34px; padding: 0 14px; border-radius: 8px;
  font-size: 12px; font-weight: 600; font-family: inherit;
  background: #fff; border: 1.5px solid #e4e4e7; color: #18181b;
  cursor: pointer; transition: border-color 0.12s, background 0.12s;
  white-space: nowrap;
}
.mcd__export-btn:hover { border-color: #a1a1aa; background: #f4f4f5; }

/* Pied */
.mcd__foot {
  display: flex; gap: 8px; justify-content: flex-end;
  padding: 18px 22px 22px;
}
.mcd__btn {
  height: 40px; padding: 0 20px; border-radius: 10px;
  font-size: 13px; font-weight: 600; font-family: inherit;
  cursor: pointer; border: none; transition: background 0.12s, opacity 0.12s;
  display: inline-flex; align-items: center; gap: 7px;
}
.mcd__btn--cancel  { background: #f4f4f5; color: #18181b; }
.mcd__btn--cancel:hover { background: #e4e4e7; }
.mcd__btn--confirm { background: #ef4444; color: #fff; }
.mcd__btn--confirm:hover:not(:disabled) { background: #dc2626; }
.mcd__btn--confirm:disabled { opacity: 0.5; cursor: not-allowed; }

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

/* ── Apparence toggle ── */
.mc-theme-toggle {
  display: flex;
  gap: 8px;
}
.mc-theme-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border);
  background: var(--card);
  color: var(--muted-foreground);
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}
.mc-theme-btn--active {
  border-color: var(--foreground);
  color: var(--foreground);
  background: var(--muted);
}
</style>
