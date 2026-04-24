<template>
  <div class="et">
    <table v-if="mouvements.length" class="et__table">
      <thead>
        <tr>
          <th class="et__th et__th--date">Date</th>
          <th class="et__th et__th--person">Personne</th>
          <th class="et__th et__th--amount">Montant</th>
          <th class="et__th et__th--note">Note</th>
          <th class="et__th et__th--actions"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in flatRows"
          :key="row.mvt.id + '-' + row.pi"
          class="et__row"
        >
          <!-- Date -->
          <td class="et__td et__td--date">
            <div class="et__date-wrap">
              <span class="et__date-label">{{ fmtDate(row.mvt.date) }}</span>
              <input
                type="date"
                class="et__date-input"
                :value="row.mvt.date"
                @change="onChangeDate(row, $event.target.value)"
              />
            </div>
          </td>

          <!-- Personne -->
          <td class="et__td et__td--person">
            <div class="et__person-pill" :style="{ background: personColor(row.pi) + '18', borderColor: personColor(row.pi) + '44' }">
              <span class="et__person-dot" :style="{ background: personColor(row.pi) }"></span>
              <span class="et__person-name">{{ store.personnes[row.pi]?.nom }}</span>
            </div>
          </td>

          <!-- Montant -->
          <td class="et__td et__td--amount">
            <div class="et__amount-wrap">
              <input
                type="number"
                class="et__amount-input"
                :value="row.montant || 0"
                step="1"
                min="0"
                @blur="onChangeMontant(row, Number($event.target.value))"
                @keyup.enter="onChangeMontant(row, Number($event.target.value)); $event.target.blur()"
              />
              <span class="et__amount-suffix">€</span>
            </div>
          </td>

          <!-- Note -->
          <td class="et__td et__td--note">
            <input
              type="text"
              class="et__note-input"
              :value="row.mvt.note"
              placeholder="—"
              @blur="onChangeNote(row, $event.target.value)"
              @keyup.enter="onChangeNote(row, $event.target.value); $event.target.blur()"
            />
          </td>

          <!-- Actions -->
          <td class="et__td et__td--actions">
            <button class="et__del-btn" type="button" @click="demanderSuppression(row)" title="Supprimer">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10"/>
              </svg>
            </button>
          </td>
        </tr>
      </tbody>

      <tfoot>
        <tr class="et__total-row">
          <td colspan="5">
            <div class="et__total-inner">
              <span class="et__total-label">Total épargné</span>
              <div class="et__total-persons">
                <span v-for="(p, i) in store.personnes" :key="p.id" class="et__total-person">
                  <span class="et__total-dot" :style="{ background: personColor(i) }"></span>
                  <span class="et__total-name">{{ p.nom }}</span>
                  <strong class="et__total-amount">{{ fmt(totals[i]) }}</strong>
                </span>
              </div>
            </div>
          </td>
        </tr>
      </tfoot>
    </table>

    <div v-else class="et__empty">Aucun mouvement enregistré.</div>
  </div>

  <!-- Modale confirmation suppression -->
  <Teleport to="body">
    <div v-if="rowASupprimer" class="et__confirm-overlay" @click.self="rowASupprimer = null">
      <div class="et__confirm-modal">
        <p class="et__confirm-text">Supprimer ce mouvement ?</p>
        <div class="et__confirm-actions">
          <button class="et__confirm-cancel" type="button" @click="rowASupprimer = null">Annuler</button>
          <button class="et__confirm-delete" type="button" @click="confirmerSuppression">Supprimer</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBudgetStore } from '../stores/budget'

const PERSON_COLORS = ['#7C6FCD', '#4A9EDB']

const props = defineProps({ mouvements: { type: Array, default: () => [] } })
const emit  = defineEmits(['modifier', 'supprimer'])

const store = useBudgetStore()
const rowASupprimer = ref(null)

function demanderSuppression(row) {
  rowASupprimer.value = row
}

function confirmerSuppression() {
  if (rowASupprimer.value) {
    onSupprimer(rowASupprimer.value)
    rowASupprimer.value = null
  }
}

function personColor(pi) {
  return PERSON_COLORS[pi] || '#71717A'
}

// ── Flat rows : une ligne = un mouvement + une personne ─────────────────
const mouvementsTriees = computed(() =>
  [...props.mouvements].sort((a, b) => new Date(b.date) - new Date(a.date))
)

const flatRows = computed(() =>
  mouvementsTriees.value.map(mvt => {
    // Déterminer qui "possède" ce mouvement : personne avec montant > 0, sinon P1 par défaut
    const pi = (mvt.montantP2 > 0 && !(mvt.montantP1 > 0)) ? 1 : 0
    const montant = pi === 0 ? (mvt.montantP1 || 0) : (mvt.montantP2 || 0)
    return { mvt, pi, montant }
  })
)

// ── Totaux par personne ─────────────────────────────────────────────────
const totals = computed(() =>
  store.personnes.map((_, i) =>
    props.mouvements.reduce((s, m) => s + (i === 0 ? (m.montantP1 || 0) : (m.montantP2 || 0)), 0)
  )
)

// ── Handlers ────────────────────────────────────────────────────────────
function onChangeDate(row, date) {
  emit('modifier', { ...row.mvt, date })
}


function onChangeMontant(row, montant) {
  const updated = {
    ...row.mvt,
    montantP1: row.pi === 0 ? montant : row.mvt.montantP1,
    montantP2: row.pi === 1 ? montant : row.mvt.montantP2,
  }
  emit('modifier', updated)
}

function onChangeNote(row, note) {
  emit('modifier', { ...row.mvt, note })
}

function onSupprimer(row) {
  emit('supprimer', row.mvt.id)
}

function fmt(v = 0) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v)
}

function fmtDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr + 'T12:00:00')
  const s = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}
</script>

<style scoped>
.et { width: 100%; overflow-x: auto; }

.et__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  font-family: var(--font-family);
  table-layout: fixed;
}

/* Header */
.et__th {
  padding: 10px 14px;
  text-align: left;
  font-size: 11px; font-weight: 500;
  color: var(--muted-foreground);
  text-transform: uppercase; letter-spacing: 0.04em;
  background: var(--muted);
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}
.et__th--date    { width: 28%; }
.et__th--person  { width: 22%; }
.et__th--amount  { width: 18%; text-align: right; }
.et__th--note    { width: auto; }
.et__th--actions { width: 110px; }

/* Rows */
.et__td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
  color: var(--foreground);
}
.et__row:hover .et__td { background: var(--muted); }

/* Date */
.et__date-wrap {
  position: relative;
  display: inline-flex; align-items: center;
  cursor: pointer; border-radius: 6px;
  padding: 4px 6px; transition: background 120ms;
}
.et__date-wrap:hover { background: var(--accent); }
.et__date-label { font-size: 13px; color: var(--foreground); white-space: nowrap; pointer-events: none; }
.et__date-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }

/* Personne pill */
.et__td--person { padding-top: 8px; padding-bottom: 8px; }
.et__person-pill {
  display: inline-flex; align-items: center; gap: 6px;
  border: 1px solid transparent; border-radius: 99px;
  padding: 4px 10px 4px 8px;
}
.et__person-dot  { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.et__person-name { font-size: 12px; font-weight: 500; color: var(--foreground); white-space: nowrap; }

/* Montant */
.et__td--amount { text-align: right; }
.et__amount-wrap { display: inline-flex; align-items: center; justify-content: flex-end; gap: 4px; }
.et__amount-input {
  width: 80px; text-align: right;
  background: transparent; border: 1px solid transparent; border-radius: 6px;
  padding: 4px 8px; font-size: 13px; font-weight: 600;
  color: #16A34A; font-family: inherit;
  transition: border-color 120ms, background 120ms;
}
.et__amount-input:hover { border-color: var(--border); background: var(--background); }
.et__amount-input:focus { border-color: var(--ring); background: var(--background); outline: none; }
.et__amount-suffix { font-size: 12px; color: var(--muted-foreground); }

/* Note */
.et__note-input {
  width: 100%; background: transparent; border: 1px solid transparent; border-radius: 6px;
  padding: 4px 8px; font-size: 13px; color: var(--foreground); font-family: inherit;
  transition: border-color 120ms, background 120ms;
}
.et__note-input:hover { border-color: var(--border); background: var(--background); }
.et__note-input:focus { border-color: var(--ring); background: var(--background); outline: none; }

/* Actions */
.et__td--actions { text-align: right; }
.et__del-btn {
  background: none; border: none; cursor: pointer;
  color: var(--muted-foreground); padding: 4px; border-radius: 6px;
  display: inline-flex; align-items: center; justify-content: center;
}
.et__del-btn:hover { color: #DC2626; background: #FEE2E2; }

/* Modale confirmation */
.et__confirm-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.35);
  display: flex; align-items: center; justify-content: center;
  z-index: 2000;
}
.et__confirm-modal {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 20px 24px;
  box-shadow: var(--shadow-xl); min-width: 260px;
  display: flex; flex-direction: column; gap: 16px;
}
.et__confirm-text {
  font-size: 14px; font-weight: 500; color: var(--foreground); margin: 0;
}
.et__confirm-actions { display: flex; gap: 8px; justify-content: flex-end; }
.et__confirm-cancel {
  height: 32px; padding: 0 14px; border-radius: var(--radius-md);
  font-size: 12px; font-weight: 500; font-family: inherit; cursor: pointer;
  background: var(--secondary); color: var(--secondary-foreground);
  border: 1px solid var(--border);
}
.et__confirm-cancel:hover { background: var(--accent); }
.et__confirm-delete {
  height: 32px; padding: 0 14px; border-radius: var(--radius-md);
  font-size: 12px; font-weight: 500; font-family: inherit; cursor: pointer;
  background: #DC2626; color: #fff; border: none;
}
.et__confirm-delete:hover { background: #B91C1C; }

/* Footer totaux */
.et__total-row td {
  background: var(--muted); border-top: 1px solid var(--border);
  padding: 10px 14px; vertical-align: middle;
}
.et__total-inner {
  display: flex; align-items: center; gap: 16px;
}
.et__total-label   { font-size: 12px; color: var(--muted-foreground); font-weight: 500; flex-shrink: 0; }
.et__total-persons { display: flex; gap: 16px; align-items: center; }
.et__total-person  { display: inline-flex; align-items: center; gap: 6px; }
.et__total-dot     { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.et__total-name    { font-size: 12px; color: var(--muted-foreground); white-space: nowrap; }
.et__total-amount  { font-size: 14px; font-weight: 700; }

/* Empty */
.et__empty {
  padding: 32px; text-align: center;
  font-size: 13px; color: var(--muted-foreground);
}
</style>
