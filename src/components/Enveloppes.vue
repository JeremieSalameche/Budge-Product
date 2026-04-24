<template>
  <div class="env">

    <!-- Header -->
    <div class="env__header">
      <div>
        <h2 class="env__title">Comptes & virements</h2>
        <p class="env__subtitle">Automatisez ce que vous envoyez sur chaque compte de paiement chaque mois</p>
      </div>
      <MsButton variant="primary" size="sm" @click="showAddModal = true">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        Nouveau compte
      </MsButton>
    </div>

    <!-- Banner concept -->
    <div class="env__concept">
      <div class="env__concept-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
      </div>
      <div class="env__concept-body">
        <div class="env__concept-title">Votre compte principal ne devrait jamais être votre compte de dépenses</div>
        <div class="env__concept-text">
          Les enveloppes physiques ne règlent pas tout : loyer, abonnements, crédits, téléphone — tout se paie en digital. La vraie solution, c'est un compte avec son propre RIB et sa propre CB pour chaque usage.
          <strong> Votre compte principal (Crédit Agricole, BNP…) devient un simple point de collecte et de sécurité.</strong>
        </div>
        <div class="env__concept-steps">
          <div class="env__concept-step">
            <span class="env__concept-step-n">1</span>
            <span>Ouvrez un compte Sumeria — IBAN + CB en 5 min, gratuit</span>
          </div>
          <div class="env__concept-step">
            <span class="env__concept-step-n">2</span>
            <span>Programmez un virement automatique le 1er du mois</span>
          </div>
          <div class="env__concept-step">
            <span class="env__concept-step-n">3</span>
            <span>Payez uniquement avec la CB de ce compte — zéro surprise sur le compte principal</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Résumé virements par personne -->
    <div v-if="store.enveloppes.length && !isSolo" class="env__summary">
      <div class="env__summary-person">
        <span class="env__summary-dot" :style="{ background: store.personnes[0]?.couleur }"></span>
        <span class="env__summary-name">{{ store.personnes[0]?.nom }}</span>
        <span class="env__summary-label">à virer / mois</span>
        <span class="env__summary-amount">{{ fmt(totalAVirerP1) }}</span>
      </div>
      <div class="env__summary-sep"></div>
      <div class="env__summary-person">
        <span class="env__summary-dot" :style="{ background: store.personnes[1]?.couleur }"></span>
        <span class="env__summary-name">{{ store.personnes[1]?.nom }}</span>
        <span class="env__summary-label">à virer / mois</span>
        <span class="env__summary-amount">{{ fmt(totalAVirerP2) }}</span>
      </div>
    </div>

    <!-- Grille comptes -->
    <div class="env__grid" v-if="store.enveloppes.length">
      <div v-for="env in store.enveloppes" :key="env.id" class="env__card">
        <div class="env__card-stripe" :style="{ background: env.couleur }"></div>
        <div class="env__card-body">

          <!-- Header compte -->
          <div class="env__card-header">
            <div class="env__card-left">
              <div class="env__dot" :style="{ background: env.couleur }"></div>
              <div>
                <div class="env__card-name">{{ env.nom }}</div>
                <div class="env__card-sub">{{ depensesOfEnv(env.id).length }} charge{{ depensesOfEnv(env.id).length > 1 ? 's' : '' }} assignée{{ depensesOfEnv(env.id).length > 1 ? 's' : '' }}</div>
              </div>
            </div>
            <div class="env__card-right">
              <span :class="['env__badge', 'env__badge--' + (env.appartientA || 'tous')]">{{ badgeLabel(env) }}</span>
              <div class="env__card-actions">
                <button class="env__icon-btn" @click="openEditModal(env)" title="Modifier" type="button">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2l2 2-6 6H3V8l6-6z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>
                </button>
                <button class="env__icon-btn env__icon-btn--danger" @click="confirmDeleteEnv(env)" title="Supprimer" type="button">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 3H12M4.5 3V2.2a.7.7 0 01.7-.7h2.6a.7.7 0 01.7.7V3M9.5 3l-.5 7.5H4L3.5 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Montant à virer -->
          <div class="env__virement">
            <div class="env__virement-main">
              <span class="env__virement-label">À virer le 1er du mois</span>
              <span class="env__virement-amount">{{ fmt(getTotal(env.id)) }}</span>
            </div>
            <div v-if="env.budgetMax > 0" class="env__virement-budget">
              <MsProgress :value="getTotal(env.id) / env.budgetMax * 100" :show-label="false" size="sm" />
              <span class="env__budget-label">{{ fmt(getTotal(env.id)) }} / {{ fmt(env.budgetMax) }} budget</span>
            </div>
            <button v-else class="env__set-budget-btn" @click="openEditModal(env)" type="button">+ Définir un budget max</button>
          </div>

          <!-- Détail par personne si "tous" -->
          <div v-if="(!env.appartientA || env.appartientA === 'tous') && !isSolo" class="env__persons-row">
            <div class="env__person-chip" v-if="store.personnes[0]">
              <span class="env__person-dot" :style="{ background: store.personnes[0].couleur }"></span>
              <span class="env__person-name">{{ store.personnes[0].nom }}</span>
              <span class="env__person-amt">{{ fmt(store.totalParEnveloppe[env.id]?.p1Charge || 0) }}</span>
            </div>
            <div class="env__person-chip" v-if="store.personnes[1]">
              <span class="env__person-dot" :style="{ background: store.personnes[1].couleur }"></span>
              <span class="env__person-name">{{ store.personnes[1].nom }}</span>
              <span class="env__person-amt">{{ fmt(store.totalParEnveloppe[env.id]?.p2Charge || 0) }}</span>
            </div>
          </div>

          <!-- Liste charges -->
          <div class="env__lines" v-if="depensesOfEnv(env.id).length">
            <div v-for="dep in depensesOfEnv(env.id)" :key="dep.id" class="env__line">
              <div class="env__line-dot" :style="{ background: getCatColor(dep.categorieId) }"></div>
              <span class="env__line-nom" :class="{ 'env__line-inactive': !dep.actif }">{{ dep.nom }}</span>
              <span class="env__line-montant">{{ fmt(getMontantDepense(dep, env)) }}</span>
            </div>
          </div>
          <p v-else class="env__empty">Aucune charge assignée</p>

        </div>
      </div>
    </div>

    <!-- État vide -->
    <div v-else class="env__empty-state">
      <div class="env__empty-icon-wrap">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
      </div>
      <p class="env__empty-title">Aucun compte de paiement</p>
      <p class="env__empty-sub">Créez votre premier compte digital pour savoir exactement quoi virer chaque mois.</p>
      <MsButton variant="primary" @click="showAddModal = true">Créer le premier compte</MsButton>
    </div>

    <!-- ── MODALES ── -->
    <Teleport to="body">
      <!-- Ajout rapide -->
      <div v-if="showAddModal" class="env__overlay" @click.self="showAddModal = false">
        <div class="env__modal">
          <h3>Nouveau compte de paiement</h3>
          <MsInput label="Nom du compte" v-model="newEnvNom" placeholder="Ex: Charges fixes, Loisirs, Alimentation…" />
          <div class="env__modal-actions">
            <MsButton variant="secondary" @click="showAddModal = false">Annuler</MsButton>
            <MsButton variant="primary" @click="createEnveloppe" :disabled="!newEnvNom.trim()">Créer</MsButton>
          </div>
        </div>
      </div>

      <!-- Édition complète -->
      <div v-if="editTarget" class="env__overlay" @click.self="editTarget = null">
        <div class="env__modal env__modal--large">
          <h3>Configurer le compte</h3>

          <MsInput label="Nom du compte" v-model="editNom" placeholder="Ex: Charges fixes" />

          <div class="env__edit-field">
            <label class="env__edit-label">Budget max (€/mois) — laisser vide = pas de limite</label>
            <input class="env__edit-input" type="number" min="0" step="50" v-model.number="editBudget" placeholder="Ex: 1500" />
          </div>

          <div class="env__edit-field">
            <label class="env__edit-label">Couleur</label>
            <div class="env__color-picker">
              <button
                v-for="c in COLORS" :key="c" type="button"
                :class="['env__color-swatch', { 'env__color-swatch--active': editCouleur === c }]"
                :style="{ background: c }"
                @click="editCouleur = c"
              >
                <svg v-if="editCouleur === c" width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="env__edit-field">
            <label class="env__edit-label">Ce compte appartient à</label>
            <div class="env__pills">
              <button type="button" :class="['env__pill', { 'env__pill--active': editAppartientA === 'tous' }]" @click="editAppartientA = 'tous'">Les deux</button>
              <button type="button" :class="['env__pill', { 'env__pill--active': editAppartientA === 'p1' }]" @click="editAppartientA = 'p1'">{{ store.personnes[0]?.nom || 'P1' }}</button>
              <button type="button" :class="['env__pill', { 'env__pill--active': editAppartientA === 'p2' }]" @click="editAppartientA = 'p2'">{{ store.personnes[1]?.nom || 'P2' }}</button>
            </div>
          </div>

          <div class="env__edit-field">
            <label class="env__edit-label">
              Charges assignées à ce compte
              <span class="env__edit-label-hint">— filtré selon le propriétaire ci-dessus</span>
            </label>
            <div class="env__dep-list">
              <label v-for="dep in filteredDepensesForEnv" :key="dep.id" class="env__dep-row">
                <input type="checkbox" class="env__dep-check" :checked="editLignes.includes(dep.id)" @change="toggleDepLigne(dep.id)" />
                <div class="env__dep-dot" :style="{ background: getCatColor(dep.categorieId) }"></div>
                <span class="env__dep-nom">{{ dep.nom }}</span>
                <span class="env__dep-montant">{{ fmt(montantPourPerson(dep)) }}</span>
              </label>
              <div v-if="filteredDepensesForEnv.length === 0" class="env__dep-empty">Aucune charge pour ce propriétaire</div>
            </div>
          </div>

          <div class="env__modal-actions">
            <MsButton variant="secondary" @click="editTarget = null">Annuler</MsButton>
            <MsButton variant="primary" @click="saveEdit">Enregistrer</MsButton>
          </div>
        </div>
      </div>

      <!-- Suppression -->
      <div v-if="deleteTarget" class="env__overlay" @click.self="deleteTarget = null">
        <div class="env__modal">
          <h3>Supprimer ce compte ?</h3>
          <p>Les charges de « {{ deleteTarget.nom }} » seront désassignées, pas supprimées.</p>
          <div class="env__modal-actions">
            <MsButton variant="secondary" @click="deleteTarget = null">Annuler</MsButton>
            <MsButton variant="danger" @click="doDeleteEnv">Supprimer</MsButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBudgetStore } from '../stores/budget'
import { useStorage } from '../composables/useStorage'
import { MsButton, MsInput, MsProgress } from './ui/index.js'

const store = useBudgetStore()
const { scheduleAutoSave } = useStorage()

const isSolo = computed(() => store.personnes.length < 2)

const COLORS = ['#18181B', '#71717A', '#E8643A', '#EF4444', '#22C55E', '#F08C46', '#25566E', '#D4A84B']

function fmt(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}
function getCatColor(catId) {
  return store.categories.find(c => c.id === catId)?.couleur || '#E5E7EB'
}
function depensesOfEnv(envId) {
  return store.depenses.filter(d => d.enveloppeId === envId)
}
function getTotal(envId) { return store.totalParEnveloppe[envId]?.totalAffiche || 0 }

function getMontantDepense(dep, env) {
  const ap = env.appartientA || 'tous'
  if (ap === 'p1') return store.toMonthly(dep.montantP1 || 0, dep.frequence)
  if (ap === 'p2') return store.toMonthly(dep.montantP2 || 0, dep.frequence)
  return store.toMonthly((dep.montantP1||0) + (dep.montantP2||0) + (dep.montantCommun||0), dep.frequence)
}

function badgeLabel(env) {
  const ap = env.appartientA || 'tous'
  if (ap === 'p1') return store.personnes[0]?.nom || 'P1'
  if (ap === 'p2') return store.personnes[1]?.nom || 'P2'
  return 'Commun'
}

// Totaux virements par personne
const totalAVirerP1 = computed(() =>
  store.enveloppes.reduce((s, env) => s + (store.totalParEnveloppe[env.id]?.p1Charge || 0), 0)
)
const totalAVirerP2 = computed(() =>
  store.enveloppes.reduce((s, env) => s + (store.totalParEnveloppe[env.id]?.p2Charge || 0), 0)
)

// ── Ajout rapide ──────────────────────────────────────────
const showAddModal = ref(false)
const newEnvNom    = ref('')
function createEnveloppe() {
  if (!newEnvNom.value.trim()) return
  store.addEnveloppe(newEnvNom.value.trim())
  scheduleAutoSave()
  newEnvNom.value = ''
  showAddModal.value = false
}

// ── Édition complète ──────────────────────────────────────
const editTarget      = ref(null)
const editNom         = ref('')
const editBudget      = ref(0)
const editCouleur     = ref(COLORS[0])
const editLignes      = ref([])
const editAppartientA = ref('tous')

// Bug fix: filtrer les dépenses selon le propriétaire sélectionné
const filteredDepensesForEnv = computed(() => {
  if (editAppartientA.value === 'p1') return store.depenses.filter(d => (d.montantP1 || 0) > 0)
  if (editAppartientA.value === 'p2') return store.depenses.filter(d => (d.montantP2 || 0) > 0)
  return store.depenses
})

// Montant affiché dans la liste selon le propriétaire
function montantPourPerson(dep) {
  if (editAppartientA.value === 'p1') return store.toMonthly(dep.montantP1 || 0, dep.frequence)
  if (editAppartientA.value === 'p2') return store.toMonthly(dep.montantP2 || 0, dep.frequence)
  return store.toMonthly((dep.montantP1||0) + (dep.montantP2||0) + (dep.montantCommun||0), dep.frequence)
}

function openEditModal(env) {
  editTarget.value      = env
  editNom.value         = env.nom
  editBudget.value      = env.budgetMax || ''
  editCouleur.value     = env.couleur || COLORS[0]
  editAppartientA.value = env.appartientA || 'tous'
  editLignes.value      = store.depenses.filter(d => d.enveloppeId === env.id).map(d => d.id)
}

function toggleDepLigne(depId) {
  const idx = editLignes.value.indexOf(depId)
  if (idx === -1) editLignes.value.push(depId)
  else editLignes.value.splice(idx, 1)
}

function saveEdit() {
  if (!editTarget.value) return
  const envId = editTarget.value.id
  store.updateEnveloppe(envId, {
    nom:         editNom.value.trim() || editTarget.value.nom,
    couleur:     editCouleur.value,
    budgetMax:   parseFloat(editBudget.value) || 0,
    appartientA: editAppartientA.value,
  })
  store.depenses.forEach(d => {
    const shouldBeIn = editLignes.value.includes(d.id)
    const isIn       = d.enveloppeId === envId
    if (shouldBeIn && !isIn) store.assignDepenseToEnveloppe(d.id, envId)
    else if (!shouldBeIn && isIn) store.assignDepenseToEnveloppe(d.id, null)
  })
  scheduleAutoSave()
  editTarget.value = null
}

// ── Suppression ───────────────────────────────────────────
const deleteTarget = ref(null)
function confirmDeleteEnv(env) { deleteTarget.value = env }
function doDeleteEnv() {
  store.deleteEnveloppe(deleteTarget.value.id)
  scheduleAutoSave()
  deleteTarget.value = null
}
</script>

<style scoped>
.env { display: flex; flex-direction: column; gap: 24px; width: 100%; box-sizing: border-box; }

.env__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.env__title { font-size: 18px; font-weight: 700; margin: 0; }
.env__subtitle { font-size: 13px; color: var(--muted-foreground); margin: 4px 0 0; }

/* ── Banner concept ─────────────────────────────────────── */
.env__concept {
  display: flex; gap: 16px;
  background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%);
  border: 1px solid #c7d7f8;
  border-radius: 14px;
  padding: 20px;
}
.env__concept-icon {
  width: 40px; height: 40px; border-radius: 10px;
  background: var(--primary); color: #fff;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.env__concept-body { display: flex; flex-direction: column; gap: 10px; }
.env__concept-title { font-size: 14px; font-weight: 700; color: #1e3a8a; }
.env__concept-text { font-size: 13px; color: #374151; line-height: 1.6; }
.env__concept-text strong { color: #1e3a8a; }
.env__concept-steps { display: flex; flex-direction: column; gap: 6px; }
.env__concept-step {
  display: flex; align-items: flex-start; gap: 10px;
  font-size: 12px; color: #374151; line-height: 1.5;
}
.env__concept-step-n {
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--primary); color: #fff;
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 1px;
}

/* ── Résumé virements ───────────────────────────────────── */
.env__summary {
  display: flex; align-items: center; gap: 0;
  background: var(--card); border: 1px solid var(--border);
  border-radius: 12px; overflow: hidden;
}
.env__summary-person {
  flex: 1; display: flex; align-items: center; gap: 10px;
  padding: 16px 20px;
}
.env__summary-sep { width: 1px; background: var(--border); align-self: stretch; }
.env__summary-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.env__summary-name { font-size: 13px; font-weight: 600; color: var(--foreground); flex: 1; }
.env__summary-label { font-size: 11px; color: var(--muted-foreground); }
.env__summary-amount { font-size: 16px; font-weight: 700; color: var(--foreground); }

/* ── Grille ─────────────────────────────────────────────── */
.env__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
@media (max-width: 900px) { .env__grid { grid-template-columns: minmax(0, 1fr); } }

.env__card {
  background: var(--card); border-radius: 12px;
  border: 1px solid var(--border); box-shadow: var(--shadow-xs);
  overflow: hidden; display: flex; flex-direction: column;
}
.env__card-stripe { height: 4px; width: 100%; flex-shrink: 0; }
.env__card-body { padding: 18px; display: flex; flex-direction: column; gap: 14px; }

.env__card-header { display: flex; align-items: flex-start; justify-content: space-between; }
.env__card-left { display: flex; align-items: flex-start; gap: 10px; }
.env__card-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.env__dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; }
.env__card-name { font-size: 15px; font-weight: 600; color: var(--foreground); }
.env__card-sub  { font-size: 12px; color: var(--muted-foreground); margin-top: 2px; }
.env__card-actions { display: flex; gap: 4px; }

.env__badge {
  font-size: 11px; padding: 2px 10px;
  border-radius: var(--radius-full);
  white-space: nowrap; font-weight: 500;
}
.env__badge--tous { background: var(--secondary); color: var(--secondary-foreground); }
.env__badge--p1   { background: var(--primary); color: var(--primary-foreground); }
.env__badge--p2   { background: var(--muted); border: 1px solid var(--border); color: var(--muted-foreground); }

.env__icon-btn {
  width: 28px; height: 28px; border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  color: var(--muted-foreground); cursor: pointer; border: none; background: transparent;
  transition: background 150ms, color 150ms;
}
.env__icon-btn:hover { background: var(--accent); color: var(--foreground); }
.env__icon-btn--danger:hover { background: #fef2f2; color: #ef4444; }

/* Virement principal */
.env__virement {
  background: #f8faff; border: 1px solid #e0e9ff;
  border-radius: 10px; padding: 14px 16px;
  display: flex; flex-direction: column; gap: 8px;
}
.env__virement-main { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.env__virement-label { font-size: 11px; font-weight: 600; color: var(--primary); text-transform: uppercase; letter-spacing: 0.04em; }
.env__virement-amount { font-size: 22px; font-weight: 800; color: var(--foreground); }
.env__virement-budget { display: flex; flex-direction: column; gap: 4px; }
.env__budget-label { font-size: 11px; color: var(--muted-foreground); }
.env__set-budget-btn { font-size: 12px; color: var(--primary); background: transparent; border: none; cursor: pointer; padding: 0; text-align: left; }
.env__set-budget-btn:hover { text-decoration: underline; }

/* Chips personnes */
.env__persons-row { display: flex; gap: 8px; flex-wrap: wrap; }
.env__person-chip {
  display: flex; align-items: center; gap: 6px;
  background: var(--muted); border-radius: 8px; padding: 6px 10px;
  flex: 1; min-width: 0;
}
.env__person-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.env__person-name { font-size: 12px; font-weight: 500; color: var(--foreground); flex: 1; }
.env__person-amt { font-size: 12px; font-weight: 700; color: var(--foreground); }

/* Charges */
.env__lines { display: flex; flex-direction: column; }
.env__line {
  display: flex; align-items: center; gap: 8px;
  padding: 7px 0; border-bottom: 1px solid var(--border);
}
.env__line:last-child { border-bottom: none; }
.env__line-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.env__line-nom  { flex: 1; font-size: 13px; color: var(--foreground); }
.env__line-montant { font-size: 13px; font-weight: 600; color: var(--muted-foreground); }
.env__line-inactive { opacity: 0.4; text-decoration: line-through; }
.env__empty { font-size: 13px; color: var(--muted-foreground); text-align: center; padding: 8px 0; }

/* État vide */
.env__empty-state {
  text-align: center; padding: 48px 32px;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.env__empty-icon-wrap { color: var(--border); }
.env__empty-title { font-size: 16px; font-weight: 600; color: var(--foreground); margin: 0; }
.env__empty-sub { font-size: 13px; color: var(--muted-foreground); margin: 0; max-width: 360px; line-height: 1.6; }

/* ── Modales ─────────────────────────────────────────────── */
.env__overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
  padding: 20px;
}
.env__modal {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--radius-xl); padding: 24px;
  max-width: 400px; width: 100%; box-shadow: var(--shadow-xl);
  display: flex; flex-direction: column; gap: 16px;
  max-height: 90vh; overflow-y: auto;
}
.env__modal--large { max-width: 520px; }
.env__modal h3 { font-size: 16px; font-weight: 600; margin: 0; }
.env__modal p  { font-size: 14px; color: var(--muted-foreground); margin: 0; }
.env__modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px; }

.env__edit-field { display: flex; flex-direction: column; gap: 6px; }
.env__edit-label { font-size: 12px; font-weight: 500; color: var(--muted-foreground); }
.env__edit-label-hint { font-weight: 400; font-style: italic; }
.env__edit-input {
  height: 36px; padding: 0 12px;
  border: 1px solid var(--input); border-radius: var(--radius-md);
  font-size: 14px; font-family: inherit; color: var(--foreground);
  background: var(--background); outline: none;
  transition: border-color 150ms, box-shadow 150ms;
}
.env__edit-input:focus { border-color: var(--ring); box-shadow: 0 0 0 2px rgba(24,24,27,0.12); }

.env__pills { display: flex; gap: 8px; flex-wrap: wrap; }
.env__pill {
  padding: 6px 16px; border-radius: var(--radius-full);
  font-size: 13px; font-family: inherit; cursor: pointer;
  background: var(--secondary); border: 1px solid var(--border); color: var(--secondary-foreground);
  transition: background 150ms, color 150ms, border-color 150ms;
}
.env__pill--active { background: var(--primary); border-color: var(--primary); color: var(--primary-foreground); }

.env__color-picker { display: flex; gap: 8px; flex-wrap: wrap; }
.env__color-swatch {
  width: 30px; height: 30px; border-radius: 50%;
  border: 2px solid transparent;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: transform 150ms;
}
.env__color-swatch:hover { transform: scale(1.1); }
.env__color-swatch--active { border-color: rgba(0,0,0,0.25); transform: scale(1.1); }

.env__dep-list {
  border: 1px solid var(--border); border-radius: var(--radius-md);
  overflow-y: auto; max-height: 200px;
}
.env__dep-row {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 12px; cursor: pointer;
  border-bottom: 1px solid var(--border); transition: background 150ms;
}
.env__dep-row:last-child { border-bottom: none; }
.env__dep-row:hover { background: var(--accent); }
.env__dep-check { accent-color: var(--primary); width: 15px; height: 15px; flex-shrink: 0; cursor: pointer; }
.env__dep-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.env__dep-nom { flex: 1; font-size: 13px; color: var(--foreground); }
.env__dep-montant { font-size: 12px; font-weight: 600; color: var(--muted-foreground); }
.env__dep-empty { padding: 16px; font-size: 13px; color: var(--muted-foreground); text-align: center; }
</style>
