<template>
  <div v-if="authStore.loading || appLoading" class="app-loading">
    <div class="app-loading__spinner"></div>
  </div>

  <!-- Layout partagé : login → onboarding (left panel fixe, right switch) -->
  <div v-else-if="!authStore.user || needsOnboarding" class="preapp">
    <!-- Left : dark panel permanent -->
    <div class="preapp__left">
      <div class="preapp__glow preapp__glow--1"></div>
      <div class="preapp__glow preapp__glow--2"></div>
      <div class="preapp__glow preapp__glow--3"></div>
      <div class="preapp__left-top">
        <img src="/logo-budge-white.svg" class="preapp__logo" alt="Budge" />
      </div>
      <div class="preapp__left-content">
        <h2 class="preapp__title">Gérez votre budget,<br>seul ou à deux.</h2>
        <p class="preapp__sub">Visualisez vos dépenses, partagez les charges équitablement et atteignez vos objectifs financiers ensemble.</p>
      </div>
      <div class="preapp__features">
        <div class="preapp__feature">
          <div class="preapp__feature-icon">⚖️</div>
          <div>
            <div class="preapp__feature-title">Partage équitable</div>
            <div class="preapp__feature-desc">Charges réparties selon les revenus de chacun</div>
          </div>
        </div>
        <div class="preapp__feature">
          <div class="preapp__feature-icon">📊</div>
          <div>
            <div class="preapp__feature-title">Vue claire</div>
            <div class="preapp__feature-desc">Dashboard complet avec reste à vivre en temps réel</div>
          </div>
        </div>
        <div class="preapp__feature">
          <div class="preapp__feature-icon">☁️</div>
          <div>
            <div class="preapp__feature-title">Sync cloud</div>
            <div class="preapp__feature-desc">Accédez à vos données depuis n'importe quel appareil</div>
          </div>
        </div>
      </div>
    </div>
    <!-- Right : login ou onboarding -->
    <div class="preapp__right">
      <Transition name="preapp-slide" mode="out-in">
        <LoginPage v-if="!authStore.user" key="login" />
        <FoyerSetup v-else key="onboarding" :premierDemarrage="true" :soloForm="true" @fermer="needsOnboarding = false" />
      </Transition>
    </div>
  </div>

  <template v-else>
    <div id="app">
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

      <div class="sidebar__footer">
        <div class="sidebar__user" :class="{ 'sidebar__user--active': activeTab === 'moncompte' }" @click="activeTab = 'moncompte'" role="button" style="cursor:pointer">
          <img v-if="authStore.user?.photoURL" :src="authStore.user.photoURL" class="sidebar__user-avatar" referrerpolicy="no-referrer" />
          <div v-else class="sidebar__user-avatar sidebar__user-avatar--initials">
            {{ authStore.user?.displayName?.[0]?.toUpperCase() ?? '?' }}
          </div>
          <div class="sidebar__user-info">
            <span class="sidebar__user-name">{{ authStore.user?.displayName?.split(' ')[0] ?? 'Compte' }}</span>
            <span class="sidebar__user-saved">{{ lastSavedLabel }}</span>
          </div>
          <svg class="sidebar__settings-icon" width="15" height="15" viewBox="0 0 16 16" fill="none">
            <path d="M6.5 1.5h3l.5 1.5a5 5 0 011.2.7l1.5-.5 1.5 2.6-1.2 1.1c.03.2.05.4.05.6s-.02.4-.05.6l1.2 1.1-1.5 2.6-1.5-.5a5 5 0 01-1.2.7l-.5 1.5h-3l-.5-1.5A5 5 0 014.8 11l-1.5.5L1.8 8.9l1.2-1.1A5 5 0 013 7.4c0-.2.02-.4.05-.6L1.8 5.7l1.5-2.6 1.5.5A5 5 0 016 2.9l.5-1.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
            <circle cx="8" cy="7.5" r="2" stroke="currentColor" stroke-width="1.3"/>
          </svg>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <main class="main">
      <div class="main__container">
        <header class="main__header">
          <h1 class="main__title">{{ activeTab === 'moncompte' ? 'Mon compte' : currentNavItem?.label }}</h1>

          <div v-if="activeTab !== 'moncompte'" class="header-pills">
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

          <div v-if="activeTab !== 'moncompte'" class="header-spacer"></div>

          <div v-if="activeTab !== 'moncompte'" class="header-reste">
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
          <MonCompte         v-if="activeTab === 'moncompte'" />
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
import MonCompte   from './components/MonCompte.vue'
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


function fmt(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

const navItems = [
  { id: 'dashboard',  label: 'Accueil',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="2" width="6" height="6" rx="2" stroke="currentColor" stroke-width="1.5"/><rect x="10" y="2" width="6" height="6" rx="2" stroke="currentColor" stroke-width="1.5"/><rect x="2" y="10" width="6" height="6" rx="2" stroke="currentColor" stroke-width="1.5"/><rect x="10" y="10" width="6" height="6" rx="2" stroke="currentColor" stroke-width="1.5"/></svg>` },
  { id: 'depenses',   label: 'Dépenses',
    icon: `<svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 5h12M3 9h12M3 13h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>` },
  { id: 'enveloppes', label: 'Comptes & virements',
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
  padding: 8px 10px; border-radius: 8px; margin: -8px -10px;
  transition: background 0.15s;
}
.sidebar__user:hover { background: var(--muted); }
.sidebar__user--active { background: var(--muted); }
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
.sidebar__settings-icon {
  color: var(--muted-foreground); flex-shrink: 0;
  transition: color 0.15s;
}
.sidebar__user--active .sidebar__settings-icon,
.sidebar__user:hover .sidebar__settings-icon { color: var(--foreground); }

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

/* ── Pre-app layout partagé ────────────────────────────────── */
.preapp {
  position: fixed; inset: 0;
  display: flex;
  font-family: system-ui, -apple-system, sans-serif;
}
.preapp__left {
  width: 50%; flex-shrink: 0;
  background: #18181b;
  position: relative; overflow: hidden;
  display: flex; flex-direction: column; justify-content: space-between;
  padding: 48px;
}
.preapp__glow {
  position: absolute; border-radius: 50%;
  pointer-events: none;
}
.preapp__glow--1 {
  width: 700px; height: 700px;
  bottom: -250px; left: -150px;
  background: radial-gradient(circle, rgba(236,72,153,0.28) 0%, transparent 60%);
  filter: blur(60px);
}
.preapp__glow--2 {
  width: 600px; height: 600px;
  bottom: -200px; left: 15%;
  background: radial-gradient(circle, rgba(124,111,205,0.22) 0%, transparent 60%);
  filter: blur(60px);
}
.preapp__glow--3 {
  width: 500px; height: 500px;
  bottom: -100px; right: -100px;
  background: radial-gradient(circle, rgba(74,158,219,0.18) 0%, transparent 60%);
  filter: blur(60px);
}
.preapp__left-top { position: relative; z-index: 1; }
.preapp__logo { height: 50px; width: auto; display: block; }
.preapp__left-content { position: relative; z-index: 1; }
.preapp__badge {
  display: inline-flex; align-items: center;
  padding: 5px 12px; border-radius: 20px;
  background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7);
  font-size: 12px; font-weight: 500; margin-bottom: 24px;
}
.preapp__title {
  font-size: 32px; font-weight: 700; color: #fff;
  line-height: 1.25; letter-spacing: -0.5px; margin: 0 0 16px; max-width: 360px;
}
.preapp__sub {
  font-size: 15px; color: rgba(255,255,255,0.5); line-height: 1.6; margin: 0; max-width: 340px;
}
.preapp__features { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 20px; }
.preapp__feature { display: flex; align-items: flex-start; gap: 14px; }
.preapp__feature-icon {
  font-size: 20px; width: 40px; height: 40px;
  background: rgba(255,255,255,0.08); border-radius: 10px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.preapp__feature-title { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 2px; }
.preapp__feature-desc  { font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.4; }

.preapp__right {
  flex: 1; background: #fff;
  position: relative; overflow: hidden;
}

/* Transition slide */
.preapp-slide-enter-active,
.preapp-slide-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.preapp-slide-enter-from   { opacity: 0; transform: translateX(16px); }
.preapp-slide-leave-to     { opacity: 0; transform: translateX(-16px); }

@media (max-width: 768px) {
  .preapp__left { display: none; }
  .preapp__right { width: 100%; }
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
