<template>
  <div class="depenses-table-wrapper">
    <table v-if="mouvements.length" class="depenses-table">
      <thead>
        <tr>
          <th class="col-date">Date</th>
          <th class="col-p1">{{ nomP1 }}</th>
          <th class="col-p2">{{ nomP2 }}</th>
          <th class="col-note">Note</th>
          <th class="col-actions"></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="mvt in mouvementsTriees"
          :key="mvt.id"
          class="depense-row"
          :class="{ 'row-confirming': ligneAConfirmer === mvt.id, 'row-saved': ligneSauvee === mvt.id }"
        >
          <td class="col-date">
            <div class="date-cell-wrap">
              <span class="date-display">{{ fmtDate(mvt.date) }}</span>
              <input
                type="date"
                class="date-input-hidden"
                :value="mvt.date"
                @change="onModifier({ ...mvt, date: $event.target.value })"
              />
            </div>
          </td>

          <td class="col-p1">
            <div class="cell-amount" :class="{ negative: mvt.montantP1 < 0 }">
              <input
                type="number"
                class="cell-input amount"
                :value="mvt.montantP1 || 0"
                step="1"
                @blur="onModifier({ ...mvt, montantP1: Number($event.target.value) })"
                @keyup.enter="onModifier({ ...mvt, montantP1: Number($event.target.value) }); $event.target.blur()"
              />
              <span class="cell-suffix">€</span>
            </div>
          </td>

          <td class="col-p2">
            <div class="cell-amount" :class="{ negative: mvt.montantP2 < 0 }">
              <input
                type="number"
                class="cell-input amount"
                :value="mvt.montantP2 || 0"
                step="1"
                @blur="onModifier({ ...mvt, montantP2: Number($event.target.value) })"
                @keyup.enter="onModifier({ ...mvt, montantP2: Number($event.target.value) }); $event.target.blur()"
              />
              <span class="cell-suffix">€</span>
            </div>
          </td>

          <td class="col-note">
            <input
              type="text"
              class="cell-input note"
              :value="mvt.note"
              placeholder="—"
              @blur="onModifier({ ...mvt, note: $event.target.value })"
              @keyup.enter="onModifier({ ...mvt, note: $event.target.value }); $event.target.blur()"
            />
          </td>

          <td class="col-actions">
            <template v-if="ligneAConfirmer !== mvt.id">
              <button class="action-btn delete-btn" @click="ligneAConfirmer = mvt.id" type="button" title="Supprimer">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                  <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10"/>
                </svg>
              </button>
            </template>
            <template v-else>
              <div class="confirm-row">
                <button class="btn-del-confirm" type="button"
                  @click="emit('supprimer', mvt.id); ligneAConfirmer = null">Supprimer</button>
                <button class="btn-del-cancel" type="button"
                  @click="ligneAConfirmer = null">Annuler</button>
              </div>
            </template>
          </td>
        </tr>
      </tbody>

      <tfoot>
        <tr class="total-row">
          <td class="total-label">Total épargné</td>
          <td class="total-val" :class="{ negative: totalP1 < 0 }">{{ fmt(totalP1) }}</td>
          <td class="total-val" :class="{ negative: totalP2 < 0 }">{{ fmt(totalP2) }}</td>
          <td colspan="2"></td>
        </tr>
      </tfoot>
    </table>

    <div v-else class="table-empty">Aucun mouvement enregistré.</div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBudgetStore } from '../stores/budget'

const props = defineProps({ mouvements: Array })
const emit = defineEmits(['modifier', 'supprimer'])

const store = useBudgetStore()
const nomP1 = computed(() => store.personnes[0]?.nom || 'P1')
const nomP2 = computed(() => store.personnes[1]?.nom || 'P2')

const ligneAConfirmer = ref(null)
const ligneSauvee = ref(null)

function onModifier(mvt) {
  emit('modifier', mvt)
  ligneSauvee.value = mvt.id
  setTimeout(() => { ligneSauvee.value = null }, 800)
}

const mouvementsTriees = computed(() =>
  [...props.mouvements].sort((a, b) => new Date(b.date) - new Date(a.date))
)

const totalP1 = computed(() => props.mouvements.reduce((s, m) => s + (m.montantP1 || 0), 0))
const totalP2 = computed(() => props.mouvements.reduce((s, m) => s + (m.montantP2 || 0), 0))

function fmt(v) {
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
.depenses-table-wrapper { width: 100%; overflow-x: auto; }

.depenses-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  font-family: var(--font-family);
}

.depenses-table thead tr {
  background: var(--muted);
  border-bottom: 1px solid var(--border);
}

.depenses-table th {
  padding: 10px 14px;
  text-align: left;
  font-size: 11px;
  font-weight: 500;
  color: var(--muted-foreground);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.depenses-table td {
  padding: 8px 14px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
  color: var(--foreground);
}

.depense-row:hover td { background: var(--muted); }
.depense-row.row-confirming td { background: rgba(239,68,68,0.04); }
.depense-row.row-saved td { background: rgba(92,122,92,0.07); transition: background 0.3s; }

.col-date    { width: 160px; }

.date-cell-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  border-radius: 6px;
  padding: 4px 6px;
  transition: background 120ms;
}
.date-cell-wrap:hover { background: var(--accent); }
.date-display { font-size: 13px; color: var(--foreground); white-space: nowrap; pointer-events: none; }
.date-input-hidden {
  position: absolute; inset: 0; opacity: 0;
  cursor: pointer; width: 100%; height: 100%;
}
.col-p1      { width: 120px; }
.col-p2      { width: 120px; }
.col-actions { width: 110px; text-align: right; }

.cell-input {
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 13px;
  color: var(--foreground);
  font-family: var(--font-family);
  width: 100%;
  box-sizing: border-box;
  transition: border-color 120ms, background 120ms;
}
.cell-input:hover { border-color: var(--border); background: var(--background); }
.cell-input:focus { border-color: var(--ring); background: var(--background); outline: none; box-shadow: 0 0 0 2px rgba(24,24,27,0.12); }
.cell-input.amount { width: 70px; text-align: right; }
.cell-input.note { min-width: 100px; }

.cell-amount { display: flex; align-items: center; gap: 2px; }
.cell-amount .cell-input { color: var(--color-success); }
.cell-amount.negative .cell-input { color: var(--color-danger); }
.cell-suffix { font-size: 12px; color: var(--muted-foreground); flex-shrink: 0; }

.action-btn {
  background: none; border: none; cursor: pointer;
  color: var(--muted-foreground); padding: 4px; border-radius: 6px;
  display: inline-flex; align-items: center; justify-content: center;
  margin-left: auto;
}
.delete-btn:hover { color: var(--color-danger); background: var(--color-danger-subtle); }

.confirm-row { display: flex; gap: 6px; align-items: center; justify-content: flex-end; }
.btn-del-confirm {
  font-size: 12px; font-weight: 500; font-family: inherit;
  color: var(--color-danger-text); background: var(--color-danger-subtle);
  border: 1px solid var(--color-danger); border-radius: 6px;
  padding: 3px 10px; cursor: pointer; white-space: nowrap;
}
.btn-del-confirm:hover { background: var(--color-danger); color: #fff; }
.btn-del-cancel {
  font-size: 12px; font-family: inherit;
  color: var(--muted-foreground); background: transparent;
  border: none; cursor: pointer; padding: 3px 6px; border-radius: 6px;
}
.btn-del-cancel:hover { color: var(--foreground); background: var(--muted); }

.total-row td {
  background: var(--muted);
  border-top: 1px solid var(--border);
  padding: 10px 14px;
}
.total-label { font-size: 12px; color: var(--muted-foreground); font-weight: 500; }
.total-val   { font-size: 14px; font-weight: 600; color: var(--foreground); }
.total-val.negative { color: var(--color-danger); }

.table-empty {
  padding: 32px;
  text-align: center;
  font-size: 13px;
  color: var(--muted-foreground);
}
</style>
