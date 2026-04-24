<template>
  <LoginPage v-if="!authStore.user && !authStore.loading" />
  <div v-else-if="authStore.loading || appLoading" class="app-loading">
    <div class="app-loading__spinner"></div>
  </div>
  <template v-else>
    <FoyerSetup v-if="needsOnboarding" :premierDemarrage="true" @fermer="needsOnboarding = false" />
    <div v-else id="app">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar__logo">
        <img src="/logobudge.svg" class="sidebar__logo-img" alt="Budge" />
      </div>

      <FoyerSwitcher />

      <nav class="sidebar__nav">
        <button
          v-for="item in navItems"
          :key="item.id"
          :class="['sidebar__nav-item', { 'sidebar__nav-item--active': activeTab === item.id }]"
          @click="activeTab = item.id"
          type="button"
        >
          <span class="sidebar__nav-icon" v-html="item.icon"></span>
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <!-- Gestion des données -->
      <div class="sidebar__data-item">
        <button
          class="sidebar__nav-item"
          :class="{ 'sidebar__nav-item--active': dataMenuOpen }"
          type="button"
          @click="dataMenuOpen = !dataMenuOpen"
        >
          <span class="sidebar__nav-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><ellipse cx="8" cy="4.5" rx="5" ry="2" stroke="currentColor" stroke-width="1.4"/><path d="M3 4.5v3c0 1.1 2.24 2 5 2s5-.9 5-2v-3" stroke="currentColor" stroke-width="1.4"/><path d="M3 7.5v3c0 1.1 2.24 2 5 2s5-.9 5-2v-3" stroke="currentColor" stroke-width="1.4"/></svg>
          </span>
          <span>Partage</span>
          <svg class="sidebar__chevron" :class="{ 'sidebar__chevron--open': dataMenuOpen }" width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>

        <div v-if="dataMenuOpen" class="sidebar__data-card">
          <button class="sidebar__data-action" type="button" @click="store.exportBudge(); dataMenuOpen = false">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v8M4 6l3 3 3-3M2 10.5v1A1.5 1.5 0 003.5 13h7A1.5 1.5 0 0012 11.5v-1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <div>
              <div class="sidebar__data-action-title">Exporter le foyer</div>
              <div class="sidebar__data-action-sub">Partager avec votre partenaire (.budge)</div>
            </div>
          </button>
          <div class="sidebar__data-divider"></div>
          <button class="sidebar__data-action" type="button" @click="$refs.budgeInput.click(); dataMenuOpen = false">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 13V5M4 8l3-3 3 3M2 3.5v-1A1.5 1.5 0 013.5 1h7A1.5 1.5 0 0112 2.5v1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <div>
              <div class="sidebar__data-action-title">Importer un foyer</div>
              <div class="sidebar__data-action-sub">Charger un fichier .budge partagé</div>
            </div>
          </button>
        </div>
        <input ref="budgeInput" type="file" accept=".budge,.json" style="display:none" @change="onImportBudge" />
      </div>

      <div class="sidebar__footer">
        <div class="sidebar__user">
          <img v-if="authStore.user?.photoURL" :src="authStore.user.photoURL" class="sidebar__user-avatar" referrerpolicy="no-referrer" />
          <div v-else class="sidebar__user-avatar sidebar__user-avatar--initials">
            {{ authStore.user?.displayName?.[0]?.toUpperCase() ?? '?' }}
          </div>
          <div class="sidebar__user-info">
            <span class="sidebar__user-name">{{ authStore.user?.displayName?.split(' ')[0] ?? 'Compte' }}</span>
            <span class="sidebar__user-saved">{{ lastSavedLabel }}</span>
          </div>
          <button class="sidebar__logout-icon" @click="authStore.logout()" type="button" title="Se déconnecter">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M5.5 13H3a1.5 1.5 0 01-1.5-1.5v-8A1.5 1.5 0 013 2h2.5M10 10.5l3-3-3-3M13 7.5H5.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <main class="main">
      <div class="main__container">
        <header class="main__header">
          <h1 class="main__title">{{ currentNavItem?.label }}</h1>

          <div class="header-pills">
            <div
              v-for="(p, pi) in store.personnes"
              :key="p.id"
              class="main__chip-wrap"
            >
              <button
                type="button"
                :class="['main__revenu-chip', { 'main__revenu-chip--active': openPopover === p.id }]"
                :style="{ borderColor: openPopover === p.id ? '#18181B' : PERSON_COLORS[pi] + '40', color: openPopover === p.id ? '#FAFAFA' : PERSON_COLORS[pi], background: openPopover === p.id ? '#18181B' : '#FAFAFA' }"
                @click.stop="togglePopover(p)"
              >
                {{ p.nom }} · {{ fmt(p.salaire) }}/mois
                <span
                  v-if="pctCharges[store.personnes.indexOf(p)] > 0"
                  class="pill-pct"
                >{{ pctCharges[store.personnes.indexOf(p)] }}% du foyer</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style="margin-left:4px;opacity:0.5"><path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </button>

              <!-- Popover édition -->
              <div v-if="openPopover === p.id" class="main__popover" @click.stop>
                <div class="main__popover-field">
                  <label class="main__popover-label">Prénom</label>
                  <input class="main__popover-input" v-model="popNom" type="text" placeholder="Prénom" @keydown.enter="savePopover(p)" />
                </div>
                <div class="main__popover-field">
                  <label class="main__popover-label">Salaire net</label>
                  <div class="main__popover-input-wrap">
                    <input class="main__popover-input" v-model.number="popSalaire" type="number" min="0" step="50" @keydown.enter="savePopover(p)" />
                    <span class="main__popover-suffix">€/mois</span>
                  </div>
                </div>
                <button class="main__popover-save" @click="savePopover(p)" type="button">Enregistrer</button>
              </div>
            </div>
          </div>

          <div class="header-spacer"></div>

          <div class="header-reste">
            <div class="main__reste" :class="{ 'main__reste--danger': store.resteAVivre < 0 }">
              <span class="main__reste-label">Reste à vivre</span>
              <span class="main__reste-value">{{ fmt(store.resteAVivre) }}</span>
            </div>
          </div>
        </header>

        <div class="main__content">
          <Dashboard         v-if="activeTab === 'dashboard'" @navigate="activeTab = $event" />
          <div               v-if="activeTab === 'depenses'" class="depenses-page">
            <DepensesTable @selection-change="onSelectionChange" />
            <CalculateurSelection :selectedIds="selectedDepenses" @clear="selectedDepenses = []" />
          </div>
          <Enveloppes        v-if="activeTab === 'enveloppes'" />
          <PageEpargne       v-if="activeTab === 'epargne'" />
          <PageProjets       v-if="activeTab === 'projets'" />
        </div>
      </div>
    </main>

    <!-- Overlay fermeture popover -->
    <div v-if="openPopover" class="popover-overlay" @click="openPopover = null"></div>

    <!-- Notification globale -->
    <div class="notif-zone">
      <MsNotification
        :message="store.notification.message"
        :type="store.notification.type"
        :visible="store.notification.visible"
        @close="store.hideNotification()"
      />
    </div>
  </div>
  </template>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useBudgetStore } from './stores/budget'
import { useAuthStore }   from './stores/auth'
import { useStorage } from './composables/useStorage'
import Dashboard from './components/Dashboard.vue'
import DepensesTable from './components/DepensesTable.vue'
import Enveloppes from './components/Enveloppes.vue'
import PageEpargne from './components/PageEpargne.vue'
import PageProjets from './components/PageProjets.vue'
import CalculateurSelection from './components/CalculateurSelection.vue'
import LoginPage   from './components/LoginPage.vue'
import FoyerSetup  from './components/FoyerSetup.vue'
import { MsNotification } from './components/ui/index.js'
import FoyerSwitcher from './components/FoyerSwitcher.vue'

const store          = useBudgetStore()
const authStore      = useAuthStore()
const needsOnboarding = ref(false)
const appLoading      = ref(false)
const PERSON_COLORS = ['#7C6FCD', '#4A9EDB']
const { scheduleAutoSave, lastSavedLabel } = useStorage()

const activeTab        = ref('dashboard')
const selectedDepenses = ref([])
const dataMenuOpen     = ref(false)

// ── Popover salaires ───────────────────────────────────────
const openPopover = ref(null)
const popNom      = ref('')
const popSalaire  = ref(0)

function togglePopover(p) {
  if (openPopover.value === p.id) {
    openPopover.value = null
    return
  }
  popNom.value     = p.nom
  popSalaire.value = p.salaire
  openPopover.value = p.id
}

function savePopover(p) {
  if (popNom.value.trim()) store.updateNomPersonne(p.id, popNom.value.trim())
  store.updateSalaire(p.id, popSalaire.value || 0)
  scheduleAutoSave()
  openPopover.value = null
  store.showNotification('Profil mis à jour', 'success')
}

// ─────────────────────────────────────────────────────────
function onSelectionChange(ids) { selectedDepenses.value = ids }

watch(() => store.foyers, () => scheduleAutoSave(), { deep: true })

// Retour au dashboard à chaque changement de foyer
watch(() => store.foyerActifId, () => { activeTab.value = 'dashboard' })

async function initApp(user) {
  if (!user) return
  appLoading.value = true
  await store.loadFromStorage()
  appLoading.value = false
  // Onboarding si aucune dépense et aucun revenu saisi
  const f = store.foyerActif
  const hasData = f && (
    (f.depenses?.length > 0) ||
    (f.config?.personnes?.some(p => p.salaire > 0))
  )
  needsOnboarding.value = !hasData
}

onMounted(async () => {
  await authStore.init()
  await initApp(authStore.user)
})

watch(() => authStore.user, async (user) => {
  await initApp(user)
})

async function onImportBudge(e) {
  const file = e.target.files?.[0]
  if (!file) return
  e.target.value = ''
  try {
    await store.importBudge(file)
  } catch (err) {
    store.showNotification(err.message || 'Import échoué', 'error')
  }
}

function fmt(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

const navItems = [
  { id: 'dashboard',  label: 'Accueil',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="6" height="6" rx="2" stroke="currentColor" stroke-width="1.5"/><rect x="10" y="2" width="6" height="6" rx="2" stroke="currentColor" stroke-width="1.5"/><rect x="2" y="10" width="6" height="6" rx="2" stroke="currentColor" stroke-width="1.5"/><rect x="10" y="10" width="6" height="6" rx="2" stroke="currentColor" stroke-width="1.5"/></svg>` },
  { id: 'depenses',   label: 'Dépenses',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 5h12M3 9h12M3 13h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>` },
  { id: 'enveloppes', label: 'Enveloppes',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M2 7l7 4 7-4" stroke="currentColor" stroke-width="1.5"/></svg>` },
  { id: 'epargne', label: 'Épargne',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><polyline points="1 13 5 9 8 11 13 5 17 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
  { id: 'projets', label: 'Projets',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="9" r="3" stroke="currentColor" stroke-width="1.5"/><circle cx="9" cy="9" r="1" fill="currentColor"/></svg>` },
]

const currentNavItem = computed(() => navItems.find(n => n.id === activeTab.value))

const pctCharges = computed(() => {
  const total = store.personnes.reduce((s, p) => s + (p.salaire || 0), 0)
  return store.personnes.map(p =>
    total > 0 ? Math.round((p.salaire || 0) / total * 100) : 0
  )
})
</script>

<style>
@import './assets/tokens.css';

#app {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #F0EDEB;
  margin: 0;
  padding: 0;
  width: 100%;
}

/* ── Sidebar ──────────────────────────────────────────────── */
.sidebar {
  width: 220px;
  flex-shrink: 0;
  height: 100%;
  background: #F0EDEB;
  border-right: none;
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  overflow-y: auto;
}
.sidebar__logo {
  padding: 0 24px 20px;
  border-bottom: 1px solid var(--sidebar-border);
  margin-bottom: 12px;
}
.sidebar__logo-img { height: 26px; width: auto; display: block; }

.sidebar__nav { flex: 1; padding: 0; display: flex; flex-direction: column; gap: 2px; }
.sidebar__nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 24px; border-radius: 0;
  font-size: 14px; font-weight: 400;
  color: var(--muted-foreground);
  cursor: pointer; background: none; border: none; border-left: 2px solid transparent; text-align: left;
  transition: background 150ms ease, color 150ms ease;
  width: 100%; box-sizing: border-box;
}
.sidebar__nav-item:hover:not(.sidebar__nav-item--active) {
  background: rgba(48, 41, 39, 0.05);
  color: var(--foreground);
}
.sidebar__nav-item--active {
  background: rgba(48, 41, 39, 0.08);
  color: var(--foreground);
  font-weight: 500;
  border-left: 2px solid #302927;
  padding-left: 22px;
}
.sidebar__nav-icon { display: flex; align-items: center; flex-shrink: 0; }
.sidebar__nav-icon svg { width: 16px; height: 16px; }

.sidebar__footer {
  padding: 12px 16px 0;
  border-top: 1px solid var(--sidebar-border);
  margin-top: auto;
}
.sidebar__user {
  display: flex; align-items: center; gap: 10px;
}
.sidebar__user-avatar {
  width: 30px; height: 30px; border-radius: 8px;
  flex-shrink: 0; object-fit: cover;
}
.sidebar__user-avatar--initials {
  background: #18181b; color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700;
}
.sidebar__user-info {
  flex: 1; min-width: 0;
  display: flex; flex-direction: column; gap: 1px;
}
.sidebar__user-name {
  font-size: 13px; font-weight: 500; color: var(--foreground);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.sidebar__user-saved {
  font-size: 10px; color: var(--muted-foreground); opacity: 0.6;
}
.sidebar__data-item { position: relative; }
.sidebar__chevron { margin-left: auto; flex-shrink: 0; transition: transform 0.2s; color: var(--muted-foreground); }
.sidebar__chevron--open { transform: rotate(180deg); }

.sidebar__data-card {
  margin: 4px 12px 4px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}
.sidebar__data-action {
  display: flex; align-items: flex-start; gap: 10px;
  width: 100%; padding: 11px 14px;
  border: none; background: transparent;
  cursor: pointer; font-family: inherit; text-align: left;
  color: var(--foreground);
  transition: background 0.12s;
}
.sidebar__data-action svg { flex-shrink: 0; margin-top: 2px; color: var(--muted-foreground); }
.sidebar__data-action:hover { background: #f9f9f9; }
.sidebar__data-action-title { font-size: 12px; font-weight: 500; color: var(--foreground); }
.sidebar__data-action-sub { font-size: 11px; color: var(--muted-foreground); margin-top: 1px; }
.sidebar__data-divider { height: 1px; background: var(--border); }

.sidebar__logout-icon {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 6px;
  border: none; background: transparent;
  color: var(--muted-foreground); cursor: pointer; flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}
.sidebar__logout-icon:hover { background: rgba(239,68,68,0.08); color: #ef4444; }

/* ── Main ─────────────────────────────────────────────────── */
.main {
  flex: 1;
  min-width: 0;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: transparent;
  padding: 12px 12px 12px 0;
  box-sizing: border-box;
}

.main__container {
  background: #FFFFFF;
  border-radius: 12px;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  box-shadow: 0 4px 12px rgba(48, 41, 39, 0.08);
  border: 1px solid #E4E0DD;
}

.main__header {
  position: sticky;
  top: 0;
  z-index: 20;
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  background: #FFFFFF;
  border-bottom: 1px solid #F0EDEB;
  padding: 16px 24px 14px;
  display: flex; align-items: center; gap: 12px;
}
.main__title { font-size: 15px; font-weight: 600; color: var(--foreground); margin: 0; flex-shrink: 0; }
.header-pills { display: flex; gap: 8px; flex-shrink: 0; flex-wrap: wrap; }
.header-spacer { flex: 1; }
.header-reste { flex-shrink: 0; }

/* Chip wrapper — relatif pour le popover */
.main__chip-wrap { position: relative; }

.main__revenu-chip {
  display: inline-flex; align-items: center;
  padding: 4px 12px; border-radius: var(--radius-full);
  border: 1px solid var(--border);
  font-size: 12px; font-weight: 500;
  background: var(--secondary);
  color: var(--secondary-foreground);
  cursor: pointer; white-space: nowrap;
  transition: border-color 150ms ease, background 150ms ease, color 150ms ease;
  font-family: inherit;
}
.main__revenu-chip:hover { opacity: 0.85; }

.pill-pct {
  font-size: 11px;
  font-weight: 500;
  padding: 1px 7px;
  border-radius: 20px;
  margin-left: 4px;
  background: var(--muted);
  color: var(--muted-foreground);
}
.main__revenu-chip--active {
  border-color: var(--primary) !important;
  background: var(--primary) !important;
  color: var(--primary-foreground) !important;
}

/* Popover */
.main__popover {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 100;
  background: var(--popover);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px;
  box-shadow: var(--shadow-lg);
  width: 220px;
  display: flex; flex-direction: column; gap: 12px;
}
.main__popover-field { display: flex; flex-direction: column; gap: 4px; }
.main__popover-label { font-size: 11px; font-weight: 500; color: var(--muted-foreground); }
.main__popover-input-wrap { position: relative; display: flex; align-items: center; }
.main__popover-input {
  width: 100%; padding: 0 10px;
  height: 36px;
  border: 1px solid var(--input);
  border-radius: var(--radius-md);
  font-size: 13px; font-family: inherit; color: var(--foreground);
  outline: none; background: var(--background);
  transition: border-color 150ms ease;
}
.main__popover-input:focus { border-color: var(--ring); }
.main__popover-input-wrap .main__popover-input { padding-right: 52px; }
.main__popover-suffix {
  position: absolute; right: 10px;
  font-size: 12px; color: var(--muted-foreground); pointer-events: none;
}
.main__popover-save {
  background: var(--primary);
  color: var(--primary-foreground);
  border-radius: var(--radius-md);
  height: 36px;
  font-size: 13px; font-weight: 500; font-family: inherit;
  border: none; cursor: pointer;
  transition: background 150ms ease;
  width: 100%;
}
.main__popover-save:hover { background: var(--zinc-800); }

.main__reste {
  display: flex; flex-direction: row; align-items: center; gap: 8px;
  padding: 6px 14px; border-radius: var(--radius-md);
  background: #FFFFFF; border: 1px solid var(--border);
  flex-shrink: 0;
}
.main__reste--danger {
  border-color: #FECACA;
}
.main__reste-label { font-size: 12px; color: var(--muted-foreground); }
.main__reste-value { font-size: 13px; font-weight: 600; color: var(--foreground); }
.main__reste--danger .main__reste-value { color: var(--color-danger); }

.main__content {
  flex: 1;
  min-width: 0;
  width: 100%;
  padding: 20px 24px;
  box-sizing: border-box;
}
.depenses-page { display: flex; flex-direction: column; gap: 24px; width: 100%; box-sizing: border-box; }

/* Overlay transparent pour fermer les popovers */
.popover-overlay {
  position: fixed; inset: 0; z-index: 19;
  background: transparent;
}

/* ── Notification ─────────────────────────────────────────── */
.notif-zone {
  position: fixed; bottom: 24px; right: 24px;
  z-index: 2000;
}

/* ── Auth ──────────────────────────────────────────────────── */
.app-loading {
  position: fixed; inset: 0; display: flex; align-items: center;
  justify-content: center; background: #f4f4f5;
}
.app-loading__spinner {
  width: 32px; height: 32px; border-radius: 50%;
  border: 3px solid #e4e4e7; border-top-color: #18181b;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
