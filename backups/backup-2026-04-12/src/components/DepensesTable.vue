<template>
  <div class="dt">
    <!-- Filtres -->
    <div class="dt__filters">
      <div class="dt__search">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="dt__search-icon">
          <circle cx="7" cy="7" r="5" stroke="#9ca3af" stroke-width="1.5"/>
          <path d="M11 11L14 14" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <input v-model="searchQuery" placeholder="Rechercher..." class="dt__search-input" />
      </div>
      <select v-model="filterCat" class="dt__select">
        <option value="">Toutes catégories</option>
        <option v-for="cat in store.categories" :key="cat.id" :value="cat.id">{{ cat.nom }}</option>
      </select>
      <select v-model="filterEnv" class="dt__select">
        <option value="">Toutes enveloppes</option>
        <option v-for="env in store.enveloppes" :key="env.id" :value="env.id">{{ env.nom }}</option>
      </select>
    </div>

    <!-- Tableau -->
    <div class="dt__wrap">
      <table class="dt__table">
        <thead>
          <tr>
            <th class="dt__th dt__th--check">
              <MsCheckbox :modelValue="allChecked" :indeterminate="someChecked && !allChecked" @update:modelValue="toggleAll" />
            </th>
            <th class="dt__th dt__th--nom" @click="sortBy('nom')">
              Nom <span class="dt__sort" :class="{ 'dt__sort--on': sortCol === 'nom' }">{{ sortCol === 'nom' ? (sortDir === 'asc' ? '↑' : '↓') : '↕' }}</span>
            </th>
            <th class="dt__th dt__th--amount" v-if="p1">{{ p1.nom }}</th>
            <th class="dt__th dt__th--amount" v-if="p2">{{ p2.nom }}</th>
            <th class="dt__th dt__th--total">Total</th>
            <th class="dt__th">Fréquence</th>
            <th class="dt__th">Catégorie</th>
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
            :class="['dt__row', { 'dt__row--inactive': !dep.actif, 'dt__row--selected': selected.has(dep.id) }]"
          >
            <!-- Checkbox -->
            <td class="dt__td dt__td--check">
              <MsCheckbox :modelValue="selected.has(dep.id)" @update:modelValue="toggleSelect(dep.id)" />
            </td>

            <!-- Nom -->
            <td class="dt__td dt__td--nom-cell">
              <div class="dt__cat-dot" :style="{ background: getCatColor(dep.categorieId) }"></div>
              <AmountCell
                :dep="dep" field="nom" type="text"
                :editing="editing"
                @start="startEdit" @save="saveEdit" @cancel="cancelEdit"
                :edit-input-ref="editInputRef"
              />
            </td>

            <!-- P1 -->
            <td class="dt__td dt__td--amount" v-if="p1">
              <AmountCell
                :dep="dep" field="montantP1" type="number"
                :editing="editing"
                @start="startEdit" @save="saveEdit" @cancel="cancelEdit"
                :edit-input-ref="editInputRef"
              />
            </td>

            <!-- P2 -->
            <td class="dt__td dt__td--amount" v-if="p2">
              <AmountCell
                :dep="dep" field="montantP2" type="number"
                :editing="editing"
                @start="startEdit" @save="saveEdit" @cancel="cancelEdit"
                :edit-input-ref="editInputRef"
              />
            </td>

            <!-- Total (calculé) -->
            <td class="dt__td dt__td--total">
              {{ fmtLine(dep) }}
            </td>

            <!-- Fréquence -->
            <td class="dt__td">
              <select v-model="dep.frequence" class="dt__sel" @change="onDepChange(dep)">
                <option value="hebdomadaire">Hebdo</option>
                <option value="mensuel">Mensuel</option>
                <option value="trimestriel">Trimestr.</option>
                <option value="annuel">Annuel</option>
              </select>
            </td>

            <!-- Catégorie -->
            <td class="dt__td">
              <select v-model="dep.categorieId" class="dt__sel" @change="onDepChange(dep)">
                <option :value="null">—</option>
                <option v-for="cat in store.categories" :key="cat.id" :value="cat.id">{{ cat.nom }}</option>
              </select>
            </td>

            <!-- Actions -->
            <td class="dt__td dt__td--actions">
              <button class="dt__act" @click="toggleActif(dep)" :title="dep.actif ? 'Désactiver' : 'Activer'" type="button">
                {{ dep.actif ? '👁' : '👁‍🗨' }}
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
            <td class="dt__td"></td>
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
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Footer -->
    <div class="dt__footer">
      <MsButton variant="ghost" size="sm" @click="addNew">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0">
          <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
        Ajouter une dépense
      </MsButton>
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
import { ref, computed, watch, nextTick, h, resolveComponent } from 'vue'
import { useBudgetStore } from '../stores/budget'
import { useStorage } from '../composables/useStorage'
import { MsButton, MsCheckbox } from './ui/index.js'

const store = useBudgetStore()
const { scheduleAutoSave } = useStorage()

const p1 = computed(() => store.personnes[0])
const p2 = computed(() => store.personnes[1])

// ── Filtres & tri ──────────────────────────────────────────
const searchQuery = ref('')
const filterCat   = ref('')
const filterEnv   = ref('')
const sortCol     = ref('nom')
const sortDir     = ref('asc')

function sortBy(col) {
  if (sortCol.value === col) sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  else { sortCol.value = col; sortDir.value = 'asc' }
}

const filteredDepenses = computed(() => {
  let list = [...store.depenses]
  if (searchQuery.value) list = list.filter(d => d.nom.toLowerCase().includes(searchQuery.value.toLowerCase()))
  if (filterCat.value)   list = list.filter(d => d.categorieId === filterCat.value)
  if (filterEnv.value)   list = list.filter(d => d.enveloppeId === filterEnv.value)
  list.sort((a, b) => {
    let va = a[sortCol.value] ?? '', vb = b[sortCol.value] ?? ''
    if (typeof va === 'string') { va = va.toLowerCase(); vb = vb.toLowerCase() }
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

const estFiltre = computed(() =>
  searchQuery.value.trim() !== '' || filterCat.value !== '' || filterEnv.value !== ''
)

// ── Sélection ─────────────────────────────────────────────
const selected    = ref(new Set())
const allChecked  = computed(() => filteredDepenses.value.length > 0 && filteredDepenses.value.every(d => selected.value.has(d.id)))
const someChecked = computed(() => filteredDepenses.value.some(d => selected.value.has(d.id)))

function toggleSelect(id) {
  const s = new Set(selected.value)
  s.has(id) ? s.delete(id) : s.add(id)
  selected.value = s
}
function toggleAll(val) {
  selected.value = val ? new Set(filteredDepenses.value.map(d => d.id)) : new Set()
}

const emit = defineEmits(['selection-change'])
watch(selected, s => emit('selection-change', [...s]), { deep: true })

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
function getCatColor(catId) {
  return store.categories.find(c => c.id === catId)?.couleur || '#E5E7EB'
}
</script>

<style scoped>
.dt { display: flex; flex-direction: column; gap: 16px; width: 100%; box-sizing: border-box; }

/* Filtres */
.dt__filters {
  display: flex; gap: 8px; flex-wrap: wrap; align-items: center;
  background: var(--muted); border-bottom: 1px solid var(--border); padding: 12px 16px;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  margin-bottom: -1px;
}
.dt__search {
  flex: 1; min-width: 200px;
  display: flex; align-items: center; gap: 8px;
  padding: 0 12px;
  border: 1px solid var(--input); border-radius: var(--radius-md); background: var(--background);
  height: 36px;
}
.dt__search-input { flex: 1; border: none; outline: none; font-size: 14px; background: transparent; color: var(--foreground); }
.dt__search-icon { flex-shrink: 0; }
.dt__select {
  height: 36px; padding: 0 12px;
  border: 1px solid var(--input); border-radius: var(--radius-md);
  background: var(--background); font-size: 13px; color: var(--foreground);
  outline: none; cursor: pointer; font-family: inherit;
}

/* Tableau */
.dt__wrap {
  overflow-x: auto;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
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
.dt__th--check, .dt__th--actions { cursor: default; }
.dt__th--amount, .dt__th--total { text-align: right; width: 110px; }
.dt__th--nom { min-width: 160px; }
.dt__th--actions { width: 80px; }
.dt__sort { margin-left: 4px; opacity: 0.4; font-size: 11px; }
.dt__sort--on { opacity: 1; color: var(--primary); }

/* Rows */
.dt__row--inactive { opacity: 0.45; }
.dt__row--selected { background: var(--accent); }
.dt__row:hover { background: var(--accent); }

.dt__td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  font-size: 13px; vertical-align: middle;
  color: var(--foreground);
}
.dt__td--check { width: 40px; }
.dt__td--nom-cell { display: flex; align-items: center; gap: 8px; }
.dt__td--amount { text-align: right; width: 110px; }
.dt__td--total { text-align: right; width: 100px; font-weight: 600; color: var(--muted-foreground); }
.dt__td--actions { width: 80px; white-space: nowrap; }

.dt__cat-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

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

/* Tfoot */
.dt__foot-row { background: var(--muted); }
.dt__foot-row .dt__td { border-top: 2px solid var(--border); border-bottom: none; }
.dt__foot-label { font-weight: 600; font-size: 13px; display: flex; align-items: center; gap: 8px; }
.dt__filtre-badge { font-size: 11px; font-weight: 400; color: var(--muted-foreground); }
.dt__foot-num { text-align: right; font-weight: 600; font-size: 13px; }
.dt__foot-total { text-align: right; font-weight: 700; font-size: 14px; }

/* Footer */
.dt__footer { display: flex; align-items: center; gap: 16px; }
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
