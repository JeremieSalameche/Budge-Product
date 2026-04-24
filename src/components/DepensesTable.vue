<template>
  <div class="dt">
    <!-- Bloc collé : filtres + tableau -->
    <div class="dt__block">
      <!-- Filtres + CTA -->
      <div class="dt__filters">
        <div class="dt__filters-left">
          <select v-model="filterCat" class="dt__select">
            <option value="">Toutes catégories</option>
            <option v-for="cat in store.categories" :key="cat.id" :value="cat.id">{{ cat.nom }}</option>
          </select>
          <select v-model="filterEnv" class="dt__select">
            <option value="">Toutes enveloppes</option>
            <option v-for="env in store.enveloppes" :key="env.id" :value="env.id">{{ env.nom }}</option>
          </select>
        </div>
        <MsButton variant="primary" size="sm" @click="addNew">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0">
            <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          Ajouter une dépense
        </MsButton>
      </div>

      <!-- Tableau -->
      <div class="dt__wrap">
        <table class="dt__table">
          <thead>
            <tr>
              <th class="dt__th dt__th--nom" @click="sortBy('nom')">
                Nom <span class="dt__sort" :class="{ 'dt__sort--on': sortCol === 'nom' }">{{ sortCol === 'nom' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span>
              </th>
              <th class="dt__th dt__th--amount" v-if="p1">{{ p1.nom }}</th>
              <th class="dt__th dt__th--amount" v-if="p2">{{ p2.nom }}</th>
              <th class="dt__th dt__th--total">Total</th>
              <th class="dt__th">Fréquence</th>
              <th class="dt__th">Catégorie</th>
              <th class="dt__th dt__th--date" @click="sortBy('createdAt')">
                Ajouté le <span class="dt__sort" :class="{ 'dt__sort--on': sortCol === 'createdAt' }">{{ sortCol === 'createdAt' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span>
              </th>
              <th class="dt__th dt__th--actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <!-- État vide -->
            <tr v-if="filteredDepenses.length === 0">
              <td :colspan="8" class="dt__empty-cell">
                <div class="dt__empty">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="6" y="8" width="28" height="24" rx="4" stroke="rgba(0,0,0,0.15)" stroke-width="2"/><path d="M12 16h16M12 22h10" stroke="rgba(0,0,0,0.15)" stroke-width="2" stroke-linecap="round"/></svg>
                  <p>Aucune dépense. Cliquez sur <strong>+ Ajouter</strong> pour commencer.</p>
                </div>
              </td>
            </tr>

            <tr
              v-for="dep in filteredDepenses"
              :key="dep.id"
              :class="['dt__row', { 'dt__row--inactive': !dep.actif }]"
            >
              <td class="dt__td dt__td--nom-cell">
                <AmountCell :dep="dep" field="nom" type="text" :editing="editing" @start="startEdit" @save="saveEdit" @cancel="cancelEdit" :edit-input-ref="editInputRef" />
              </td>
              <td class="dt__td dt__td--amount" v-if="p1">
                <AmountCell :dep="dep" field="montantP1" type="number" :editing="editing" @start="startEdit" @save="saveEdit" @cancel="cancelEdit" :edit-input-ref="editInputRef" />
              </td>
              <td class="dt__td dt__td--amount" v-if="p2">
                <AmountCell :dep="dep" field="montantP2" type="number" :editing="editing" @start="startEdit" @save="saveEdit" @cancel="cancelEdit" :edit-input-ref="editInputRef" />
              </td>
              <td class="dt__td dt__td--total">{{ fmtLine(dep) }}</td>
              <td class="dt__td">
                <select v-model="dep.frequence" class="dt__sel" @change="onDepChange(dep)">
                  <option value="hebdomadaire">Hebdo</option>
                  <option value="mensuel">Mensuel</option>
                  <option value="trimestriel">Trimestr.</option>
                  <option value="annuel">Annuel</option>
                </select>
              </td>
              <td class="dt__td">
                <div class="dt__cat-wrap">
                  <span class="dt__cat-icon" v-html="getCatIcon(dep.categorieId)"></span>
                  <select v-model="dep.categorieId" class="dt__sel" @change="onDepChange(dep)">
                    <option :value="null">—</option>
                    <option v-for="cat in store.categories" :key="cat.id" :value="cat.id">{{ cat.nom }}</option>
                  </select>
                </div>
              </td>
              <td class="dt__td dt__td--date">{{ fmtDate(dep.createdAt) }}</td>
              <td class="dt__td dt__td--actions">
                <button class="dt__act dt__act--toggle" @click="toggleActif(dep)" :title="dep.actif ? 'Masquer du budget' : 'Afficher dans le budget'" type="button">
                  <svg v-if="dep.actif" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                  {{ dep.actif ? 'Cacher' : 'Afficher' }}
                </button>
                <button class="dt__act dt__act--danger" @click="confirmDelete(dep)" title="Supprimer" type="button">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1.75 3.5H12.25M5.25 3.5V2.333a.583.583 0 01.583-.583h2.334a.583.583 0 01.583.583V3.5M10.5 3.5l-.583 8.167H4.083L3.5 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>

          <!-- Totaux -->
          <tfoot>
            <tr class="dt__foot-row">
              <td class="dt__td dt__foot-label">
                <span>Total mensuel</span>
                <span v-if="estFiltre" class="dt__filtre-badge">{{ filteredDepenses.length }} filtrée{{ filteredDepenses.length > 1 ? 's' : '' }}</span>
              </td>
              <td class="dt__td dt__foot-num" v-if="p1">{{ fmt(totalFiltreMensuelP1) }}</td>
              <td class="dt__td dt__foot-num" v-if="p2">{{ fmt(totalFiltreMensuelP2) }}</td>
              <td class="dt__td dt__foot-total">{{ fmt(totalFiltreGlobal) }}</td>
              <td class="dt__td"></td>
              <td class="dt__td"></td>
              <td class="dt__td"></td>
              <td class="dt__td"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Footer : juste le compteur -->
    <div class="dt__footer">
      <span class="dt__count">{{ filteredDepenses.length }} dépense{{ filteredDepenses.length > 1 ? 's' : '' }}</span>
    </div>

    <!-- Modale suppression -->
    <Teleport to="body">
      <div v-if="deleteTarget" class="dt__overlay" @click.self="deleteTarget = null">
        <div class="dt__modal">
          <h3>Supprimer cette dépense ?</h3>
          <p>« {{ deleteTarget.nom }} » sera définitivement supprimée.</p>
          <div class="dt__modal-actions">
            <MsButton variant="secondary" @click="deleteTarget = null">Annuler</MsButton>
            <MsButton variant="danger" @click="doDelete">Supprimer</MsButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, h } from 'vue'
import { useBudgetStore } from '../stores/budget'
import { useStorage } from '../composables/useStorage'
import { MsButton } from './ui/index.js'

const store = useBudgetStore()
const { scheduleAutoSave } = useStorage()

const p1 = computed(() => store.personnes[0])
const p2 = computed(() => store.personnes[1])

// ── Filtres & tri ──────────────────────────────────────────
const filterCat = ref('')
const filterEnv = ref('')
const sortCol     = ref('createdAt')
const sortDir     = ref('desc')

function sortBy(col) {
  if (sortCol.value === col) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortCol.value = col; sortDir.value = 'asc' }
}

const filteredDepenses = computed(() => {
  let list = [...store.depenses]
  if (filterCat.value) list = list.filter(d => d.categorieId === filterCat.value)
  if (filterEnv.value)   list = list.filter(d => d.enveloppeId === filterEnv.value)
  list.sort((a, b) => {
    let va = a[sortCol.value] ?? 0, vb = b[sortCol.value] ?? 0
    if (typeof va === 'string') { va = va.toLowerCase(); vb = (vb + '').toLowerCase() }
    return sortDir.value === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
  })
  return list
})

// ── Totaux filtrés ────────────────────────────────────────
function toMonthly(montant, frequence) {
  switch (frequence) {
    case 'hebdomadaire': return montant * 52 / 12
    case 'trimestriel':  return montant / 3
    case 'annuel':       return montant / 12
    default:             return montant
  }
}

const totalFiltreMensuelP1 = computed(() =>
  filteredDepenses.value.reduce((sum, d) => sum + toMonthly(d.montantP1 || 0, d.frequence), 0)
)
const totalFiltreMensuelP2 = computed(() =>
  filteredDepenses.value.reduce((sum, d) => sum + toMonthly(d.montantP2 || 0, d.frequence), 0)
)
const totalFiltreGlobal = computed(() =>
  filteredDepenses.value.reduce((sum, d) =>
    sum + toMonthly((d.montantP1 || 0) + (d.montantP2 || 0) + (d.montantCommun || 0), d.frequence), 0)
)

const estFiltre = computed(() => filterCat.value !== '' || filterEnv.value !== '')


// ── Édition inline ─────────────────────────────────────────
const editing      = ref({ id: null, field: null, value: null })
const editInputRef = ref(null)

function startEdit(dep, field) {
  editing.value = { id: dep.id, field, value: dep[field] }
  nextTick(() => {
    const input = document.querySelector('.ac--focus input')
    if (input) { input.focus(); input.select?.() }
  })
}

function saveEdit(dep) {
  if (editing.value.id !== dep.id) return
  const { field, value } = editing.value
  if (field !== 'nom' && value < 0) { cancelEdit(); return }
  store.updateDepense(dep.id, { [field]: value })
  scheduleAutoSave()
  editing.value = { id: null, field: null, value: null }
}

function cancelEdit() {
  editing.value = { id: null, field: null, value: null }
}

// ── Composant AmountCell (render function — pas de template string) ────
const AmountCell = {
  props: ['dep', 'field', 'type', 'editing', 'editInputRef'],
  emits: ['start', 'save', 'cancel'],
  setup(props, { emit }) {
    const isEditing = computed(() => props.editing.id === props.dep.id && props.editing.field === props.field)
    const rawValue  = computed(() => props.dep[props.field])

    function displayText() {
      if (props.type === 'number') {
        const v = rawValue.value || 0
        if (v === 0) return null // affiche "—"
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v)
      }
      return rawValue.value || null
    }

    return () => {
      if (isEditing.value) {
        return h('div', { class: 'ac ac--focus' }, [
          h('input', {
            ref: props.editInputRef,
            class: props.type === 'number' ? 'ac__input ac__input--num' : 'ac__input',
            type: props.type,
            min: props.type === 'number' ? 0 : undefined,
            step: props.type === 'number' ? 1 : undefined,
            value: props.editing.value,
            onInput: (e) => {
              props.editing.value = props.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
            },
            onBlur: () => emit('save', props.dep),
            onKeydown: (e) => {
              if (e.key === 'Enter') { e.preventDefault(); emit('save', props.dep) }
              if (e.key === 'Escape') emit('cancel')
              if (e.key === 'Tab') emit('save', props.dep)
            },
          }),
          props.type === 'number' ? h('span', { class: 'ac__suffix' }, '€') : null,
        ])
      }

      const text = displayText()
      return h('div', {
        class: text ? 'ac ac--filled' : 'ac ac--empty',
        onClick: () => emit('start', props.dep, props.field),
      }, [
        h('span', text || '—'),
      ])
    }
  }
}

// ── Changements ───────────────────────────────────────────
function onDepChange(dep) {
  store.updateDepense(dep.id, { ...dep })
  scheduleAutoSave()
}
function toggleActif(dep) {
  store.toggleDepense(dep.id)
  scheduleAutoSave()
}

// ── Ajout ─────────────────────────────────────────────────
function addNew() {
  const id = store.addDepense({})
  scheduleAutoSave()
  nextTick(() => {
    const dep = store.depenses.find(d => d.id === id)
    if (dep) startEdit(dep, 'nom')
  })
}

// ── Suppression ───────────────────────────────────────────
const deleteTarget = ref(null)
function confirmDelete(dep) { deleteTarget.value = dep }
function doDelete() {
  store.deleteDepense(deleteTarget.value.id)
  scheduleAutoSave()
  deleteTarget.value = null
}

// ── Helpers ───────────────────────────────────────────────
function fmt(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}
function fmtLine(dep) {
  const total = store.toMonthly((dep.montantP1||0) + (dep.montantP2||0) + (dep.montantCommun||0), dep.frequence)
  return fmt(total)
}
const CAT_ICONS = {
  'Abonnements': `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 3H8"/><path d="M12 3v4"/></svg>`,
  'Logement':    `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  'Enfants':     `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.38 8.38 0 0 1 13 0"/></svg>`,
  'Transport':   `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  'Alimentation':`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z"/><path d="M21 15v7"/></svg>`,
  'Loisirs':     `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
  'Loisir':      `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
  'Santé':       `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  'Épargne':     `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
  'Assurance':   `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  'Emprunt':     `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`,
}
const CAT_ICON_DEFAULT = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`

function getCatIcon(catId) {
  const nom = store.categories.find(c => c.id === catId)?.nom
  return CAT_ICONS[nom] || CAT_ICON_DEFAULT
}

function fmtDate(ts) {
  if (!ts) return '—'
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(new Date(ts))
}
</script>

<style scoped>
.dt { display: flex; flex-direction: column; gap: 12px; width: 100%; box-sizing: border-box; }

/* Bloc collé filtres + tableau */
.dt__block {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

/* Filtres */
.dt__filters {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
  background: var(--muted); border-bottom: 1px solid var(--border); padding: 10px 16px;
  position: sticky; top: 0; z-index: 10;
}
.dt__filters-left { display: flex; gap: 8px; align-items: center; }
.dt__select {
  height: 34px; padding: 0 10px;
  border: 1px solid var(--input); border-radius: var(--radius-md);
  background: #ffffff; font-size: 13px; color: var(--foreground);
  outline: none; cursor: pointer; font-family: inherit;
}

/* Tableau */
.dt__wrap {
  overflow-x: auto;
  background: var(--card);
  overflow: hidden;
}
.dt__table { width: 100%; border-collapse: collapse; min-width: 800px; }

.dt__th {
  padding: 10px 12px; text-align: left;
  font-size: 12px; font-weight: 500; color: var(--muted-foreground);
  background: var(--muted); border-bottom: 1px solid var(--border);
  cursor: pointer; white-space: nowrap; user-select: none;
  text-transform: uppercase; letter-spacing: 0.04em;
}
.dt__th--actions { cursor: default; }
.dt__th--amount, .dt__th--total { text-align: right; width: 110px; }
.dt__th--nom { min-width: 160px; }
.dt__th--actions { width: 80px; }
.dt__sort { margin-left: 4px; opacity: 0.4; font-size: 11px; }
.dt__sort--on { opacity: 1; color: var(--primary); }

/* Rows */
.dt__row:nth-child(even) { background: #fbfbfb; }
.dt__row--inactive { opacity: 0.45; }
.dt__row--selected { background: var(--accent); }
.dt__row:hover { background: var(--accent); }

.dt__td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  font-size: 13px; vertical-align: middle;
  color: var(--foreground);
}
.dt__td--nom-cell { display: flex; align-items: center; gap: 8px; }
.dt__td--amount { text-align: right; width: 110px; }
.dt__td--total { text-align: right; width: 100px; font-weight: 600; color: var(--muted-foreground); }
.dt__td--actions { width: 80px; white-space: nowrap; }

.dt__cat-wrap { display: flex; align-items: center; gap: 6px; }
.dt__cat-icon { display: flex; align-items: center; flex-shrink: 0; color: var(--muted-foreground); }

/* ── AmountCell états ─────────────────────────────────────── */
:deep(.ac) {
  display: inline-flex; align-items: center;
  min-width: 70px; max-width: 100%;
  padding: 5px 8px; border-radius: var(--radius-sm);
  cursor: text; transition: border 120ms ease, box-shadow 120ms ease;
  border: 1px solid transparent;
  font-size: 13px;
}
:deep(.ac--filled) { color: var(--foreground); }
:deep(.ac--empty)  { color: var(--muted-foreground); }
.dt__row:hover :deep(.ac) { border-color: var(--border); }
:deep(.ac--focus) {
  border-color: var(--ring) !important;
  box-shadow: 0 0 0 2px rgba(24,24,27,0.12) !important;
  background: var(--background);
}
:deep(.ac__input) {
  border: none; outline: none; background: transparent;
  font-size: 13px; font-family: inherit; color: var(--foreground);
  width: 80px; padding: 0;
}
:deep(.ac__input--num) { text-align: right; }
:deep(.ac__input::-webkit-inner-spin-button),
:deep(.ac__input::-webkit-outer-spin-button) { -webkit-appearance: none; }
:deep(.ac__suffix) { font-size: 11px; color: var(--muted-foreground); margin-left: 4px; }

/* Selects inline */
.dt__sel {
  border: none; background: transparent; outline: none;
  font-size: 13px; color: var(--foreground); cursor: pointer;
  padding: 4px 6px; border-radius: var(--radius-sm); font-family: inherit; max-width: 130px;
}
.dt__sel:hover { background: var(--accent); }

/* Actions */
.dt__act {
  width: 28px; height: 28px; border-radius: var(--radius-sm);
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 13px; background: transparent; color: var(--muted-foreground);
  transition: background 150ms ease, color 150ms ease; cursor: pointer; border: none; padding: 0;
}
.dt__act:hover { background: var(--accent); color: var(--foreground); }
.dt__act--danger:hover { background: var(--color-danger-subtle); color: var(--color-danger); }

.dt__act--toggle {
  width: auto; height: 24px;
  padding: 0 8px; gap: 4px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 11px; font-weight: 500;
  font-family: inherit;
  color: var(--muted-foreground);
  background: transparent;
  display: inline-flex; align-items: center;
  cursor: pointer;
  transition: border-color 150ms, color 150ms, background 150ms;
}
.dt__act--toggle:hover { border-color: var(--foreground); color: var(--foreground); background: var(--accent); }

/* Tfoot */
.dt__foot-row { background: var(--muted); }
.dt__foot-row .dt__td { border-top: 2px solid var(--border); border-bottom: none; }
.dt__foot-label { font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 8px; }
.dt__filtre-badge { font-size: 11px; font-weight: 400; color: var(--muted-foreground); }
.dt__foot-num { text-align: right; font-weight: 600; font-size: 13px; }
.dt__foot-total { text-align: right; font-weight: 700; font-size: 14px; }

/* Colonne date */
.dt__th--date { width: 80px; white-space: nowrap; cursor: pointer; }
.dt__td--date { font-size: 11px; color: var(--muted-foreground); white-space: nowrap; }

/* Footer */
.dt__footer { display: flex; align-items: center; }
.dt__count { font-size: 12px; color: var(--muted-foreground); }

/* État vide */
.dt__empty-cell { padding: 0 !important; border-bottom: none !important; }
.dt__empty {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 48px; color: var(--muted-foreground); text-align: center;
}
.dt__empty p { font-size: 14px; }
.dt__empty strong { color: var(--foreground); }

/* Modale */
.dt__overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.dt__modal {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 24px; max-width: 360px; width: 90%;
  box-shadow: var(--shadow-xl);
}
.dt__modal h3 { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
.dt__modal p  { font-size: 14px; color: var(--muted-foreground); margin-bottom: 24px; }
.dt__modal-actions { display: flex; gap: 8px; justify-content: flex-end; }
</style>
