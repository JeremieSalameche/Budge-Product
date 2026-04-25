<template>
  <div class="pp">

    <!-- Gauche : calculateur -->
    <div class="pp__left">
      <CalculateurProjet ref="calcRef" />

      <!-- Bouton sauvegarder -->
      <div v-if="montantActuel > 0" class="pp__save-bar">
        <input
          v-model="nomProjet"
          class="pp__save-input"
          placeholder="Nom du projet (ex: Voyage Japon…)"
          maxlength="40"
        />
        <button class="pp__save-btn" @click="sauvegarder" :disabled="projets.length >= MAX && !peutRemplacer">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Sauvegarder ce projet
        </button>
        <span v-if="projets.length >= MAX" class="pp__save-hint">{{ MAX }}/{{ MAX }} — supprimez un projet pour en sauvegarder un nouveau</span>
      </div>
    </div>

    <!-- Droite : projets sauvegardés -->
    <div class="pp__right">
      <div class="pp__right-header">
        <span class="pp__right-title">Projets sauvegardés</span>
        <span class="pp__right-count">{{ projets.length }}/{{ MAX }}</span>
      </div>

      <div v-if="projets.length === 0" class="pp__empty">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
        <p>Aucun projet sauvegardé.<br>Saisissez un montant et cliquez sur <strong>Sauvegarder</strong>.</p>
      </div>

      <div class="pp__cards">
        <div v-for="p in projets" :key="p.id" class="pp__card">
          <div class="pp__card-top">
            <span class="pp__card-nom">{{ p.nom }}</span>
            <button class="pp__card-del" @click="supprimer(p.id)" title="Supprimer">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div class="pp__card-amount">{{ fmt(p.montant) }}</div>
          <div class="pp__card-rows">
            <div class="pp__card-row">
              <span class="pp__card-label">{{ p.nomP1 }}</span>
              <span class="pp__card-val">{{ p.dureeP1 }}</span>
            </div>
            <template v-if="!isSolo">
              <div class="pp__card-row">
                <span class="pp__card-label">{{ p.nomP2 }}</span>
                <span class="pp__card-val">{{ p.dureeP2 }}</span>
              </div>
              <div class="pp__card-row pp__card-row--couple">
                <span class="pp__card-label">Ensemble</span>
                <span class="pp__card-val pp__card-val--green">{{ p.dureeCouple }}</span>
              </div>
            </template>
          </div>
          <div class="pp__card-footer">
            <span class="pp__card-date">{{ fmtDate(p.savedAt) }}</span>
            <button class="pp__card-load" @click="charger(p)">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
              Charger
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useBudgetStore } from '../stores/budget'
import CalculateurProjet from './CalculateurProjet.vue'

const store  = useBudgetStore()
const isSolo = computed(() => store.personnes.length <= 1)
const calcRef   = ref(null)
const nomProjet = ref('')
const MAX = 3

// Lecture réactive du montant depuis l'enfant
const montantActuel = computed(() => calcRef.value?.montantProjet ?? 0)

const storageKey = computed(() => `budget-projets-v1-${store.foyerActif?.id ?? 'default'}`)

function chargerStorage() {
  try { return JSON.parse(localStorage.getItem(storageKey.value) || '[]') } catch { return [] }
}
const projets = ref(chargerStorage())

// Recharger les projets quand on change de foyer
watch(storageKey, () => { projets.value = chargerStorage() })

function persister() {
  localStorage.setItem(storageKey.value, JSON.stringify(projets.value))
}

const peutRemplacer = computed(() => projets.value.length < MAX)

function fmtDuree(mois) {
  if (!isFinite(mois) || mois <= 0) return '—'
  const ans = Math.floor(mois / 12)
  const m   = Math.round(mois % 12)
  if (ans === 0) return `${m} mois`
  if (m  === 0) return `${ans} an${ans > 1 ? 's' : ''}`
  return `${ans} an${ans > 1 ? 's' : ''} et ${m} mois`
}

function fmt(n = 0) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

function fmtDate(ts) {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(ts))
}

function sauvegarder() {
  const c = calcRef.value
  if (!c || !(montantActuel.value > 0) || projets.value.length >= MAX) return
  const montant = montantActuel.value

  const epP1 = (store.personnes[0]?.salaire || 0) - store.totalMensuelP1
  const epP2 = (store.personnes[1]?.salaire || 0) - store.totalMensuelP2
  const epCouple = epP1 + epP2
  const totP1 = store.totalEpargneParPersonne.p1
  const totP2 = store.totalEpargneParPersonne.p2
  const totCouple = totP1 + totP2
  const resteP1 = Math.max(0, montant - totP1)
  const resteP2 = Math.max(0, montant - totP2)
  const resteCouple = Math.max(0, montant - totCouple)

  projets.value.push({
    id:         Date.now(),
    nom:        nomProjet.value.trim() || `Projet ${projets.value.length + 1}`,
    montant,
    nomP1:      store.personnes[0]?.nom || 'P1',
    nomP2:      store.personnes[1]?.nom || 'P2',
    dureeP1:    epP1  > 0 ? fmtDuree(resteP1  / epP1)  : '—',
    dureeP2:    epP2  > 0 ? fmtDuree(resteP2  / epP2)  : '—',
    dureeCouple: epCouple > 0 ? fmtDuree(resteCouple / epCouple) : '—',
    savedAt:    Date.now(),
  })
  persister()
  nomProjet.value = ''
}

function supprimer(id) {
  projets.value = projets.value.filter(p => p.id !== id)
  persister()
}

function charger(p) {
  calcRef.value?.charger(p.montant)
  nomProjet.value = p.nom
}
</script>

<style scoped>
.pp {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 20px;
  align-items: stretch;
}

/* Gauche */
.pp__left {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pp__save-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.pp__save-input {
  flex: 1;
  min-width: 160px;
  height: 34px;
  padding: 0 10px;
  border: 1px solid var(--input);
  border-radius: var(--radius-md);
  font-size: 13px;
  font-family: inherit;
  color: var(--foreground);
  background: var(--background);
  outline: none;
}
.pp__save-input:focus { border-color: var(--primary); }

.pp__save-btn {
  display: inline-flex; align-items: center; gap: 6px;
  height: 34px; padding: 0 14px;
  background: var(--primary); color: var(--primary-foreground);
  border: none; border-radius: var(--radius-md);
  font-size: 12px; font-weight: 500; font-family: inherit;
  cursor: pointer; white-space: nowrap;
  transition: background 150ms;
}
.pp__save-btn:hover:not(:disabled) { background: var(--zinc-800); }
.pp__save-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.pp__save-hint {
  font-size: 11px;
  color: var(--muted-foreground);
  width: 100%;
}

/* Droite */
.pp__right {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.pp__right-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--muted);
}
.pp__right-title {
  font-size: 12px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.05em;
  color: var(--muted-foreground);
}
.pp__right-count {
  font-size: 11px; font-weight: 600;
  color: var(--muted-foreground);
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: 99px;
  padding: 1px 8px;
}

.pp__empty {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 40px 24px;
  color: var(--muted-foreground); text-align: center;
}
.pp__empty p { font-size: 13px; line-height: 1.6; margin: 0; }
.pp__empty strong { color: var(--foreground); }

.pp__cards {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Carte projet */
.pp__card {
  padding: 16px;
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pp__card:last-child { border-bottom: none; }

.pp__card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pp__card-nom {
  font-size: 14px; font-weight: 600; color: var(--foreground);
}
.pp__card-del {
  width: 22px; height: 22px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: transparent; border: none;
  color: var(--muted-foreground); cursor: pointer;
  transition: background 150ms, color 150ms;
}
.pp__card-del:hover { background: #FEE2E2; color: #DC2626; }

.pp__card-amount {
  font-size: 22px; font-weight: 700; color: var(--foreground); line-height: 1;
}

.pp__card-rows {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: var(--muted);
  border-radius: 8px;
  padding: 10px 12px;
}
.pp__card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
}
.pp__card-row--couple {
  margin-top: 4px;
  padding-top: 6px;
  border-top: 1px solid var(--border);
}
.pp__card-label { color: var(--muted-foreground); }
.pp__card-val   { font-weight: 600; color: var(--foreground); }
.pp__card-val--green { color: #16A34A; }

.pp__card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pp__card-date { font-size: 11px; color: var(--muted-foreground); }
.pp__card-load {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 500; font-family: inherit;
  color: var(--primary); background: transparent;
  border: 1px solid var(--primary);
  border-radius: var(--radius-sm);
  padding: 3px 10px; cursor: pointer;
  transition: background 150ms, color 150ms;
}
.pp__card-load:hover { background: var(--primary); color: var(--primary-foreground); }

@media (max-width: 768px) {
  .pp { grid-template-columns: 1fr; }
}
</style>
