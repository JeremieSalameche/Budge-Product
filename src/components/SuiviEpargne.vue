<template>
  <div class="se">
    <!-- Page header -->
    <div class="page-header epargne-header">
      <div>
        <h2 class="page-title">Épargne</h2>
        <p class="page-subtitle">Suivez et planifiez votre épargne</p>
      </div>
      <div class="page-header-actions epargne-actions">
        <MsButton variant="secondary" size="sm" @click="ouvrirPanel">Gérer</MsButton>
        <MsButton variant="primary"   size="sm" @click="openModal">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" style="flex-shrink:0">
            <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          Nouveau mouvement
        </MsButton>
      </div>
    </div>

    <!-- Graphique -->
    <template v-if="store.epargnes.length">
      <div class="se__chart-wrap">
        <VChart class="epargne-chart" :option="chartOption" autoresize />
      </div>
      <p v-if="chartData.labels.length < 4" class="chart-hint">
        Ajoutez encore {{ 4 - chartData.labels.length }} mois de données pour voir les courbes s'arrondir.
      </p>
    </template>
    <div v-else class="se__empty">
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="16" stroke="rgba(0,0,0,0.15)" stroke-width="1.5"/>
        <path d="M18 11v7l4 4" stroke="rgba(0,0,0,0.20)" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <p>Aucun mouvement enregistré.<br>Commencez par ajouter votre première entrée.</p>
    </div>

    <!-- Totaux cumulés -->
    <div class="se__totals">
      <div class="se__total se__total--p1">
        <span class="se__total-name">{{ store.personnes[0]?.nom }}</span>
        <span class="se__total-label">Total épargné</span>
        <span class="se__total-val" :class="totalP1 < 0 ? 'se__total-val--danger' : 'se__total-val--p1'">
          {{ fmt(totalP1) }}
        </span>
      </div>
      <template v-if="!isSolo">
        <div class="se__total se__total--p2">
          <span class="se__total-name">{{ store.personnes[1]?.nom }}</span>
          <span class="se__total-label">Total épargné</span>
          <span class="se__total-val" :class="totalP2 < 0 ? 'se__total-val--danger' : 'se__total-val--p2'">
            {{ fmt(totalP2) }}
          </span>
        </div>
        <div class="se__total" :class="totalCouple === 0 ? 'se__total--zero' : 'se__total--couple'">
          <span class="se__total-name">Couple</span>
          <span class="se__total-label">Total combiné</span>
          <span class="se__total-val" :class="totalCouple < 0 ? 'se__total-val--danger' : totalCouple === 0 ? 'se__total-val--zero' : 'se__total-val--couple'">
            {{ fmt(totalCouple) }}
          </span>
        </div>
      </template>
    </div>

    <!-- Modale -->
    <Teleport to="body">
      <div v-if="showModal" class="se__overlay" @click.self="showModal = false">
        <div class="se__modal">
          <h3 class="se__modal-title">Mouvement d'épargne</h3>

          <!-- Toggle Épargne / Retrait -->
          <div class="se__toggle">
            <button
              :class="['se__toggle-btn', { 'se__toggle-btn--active': typeMode === 'epargne' }]"
              @click="typeMode = 'epargne'"
              type="button"
            >+ Épargne</button>
            <button
              :class="['se__toggle-btn', 'se__toggle-btn--danger', { 'se__toggle-btn--active-danger': typeMode === 'retrait' }]"
              @click="typeMode = 'retrait'"
              type="button"
            >− Retrait</button>
          </div>

          <!-- Sélecteur de personne (couple uniquement) -->
          <div v-if="!isSolo" class="se__field">
            <label class="se__label">Pour qui ?</label>
            <div class="personne-pills">
              <button
                class="personne-pill"
                :class="{ active: personneSel === 'p1', 'color-p1': personneSel === 'p1' }"
                @click="personneSel = 'p1'"
                type="button"
              >
                <span class="pill-dot" style="background: #7C6FCD"></span>
                {{ nomP1 }}
              </button>
              <button
                class="personne-pill"
                :class="{ active: personneSel === 'p2', 'color-p2': personneSel === 'p2' }"
                @click="personneSel = 'p2'"
                type="button"
              >
                <span class="pill-dot" style="background: #4A9EDB"></span>
                {{ nomP2 }}
              </button>
            </div>
          </div>

          <!-- Date -->
          <div class="se__field">
            <label class="se__label">Date</label>
            <input class="se__input" type="date" v-model="formDate" />
          </div>

          <!-- Montant unique -->
          <div class="se__field">
            <label class="se__label">
              {{ nomPersonneSel }} {{ typeMode === 'epargne' ? 'a épargné' : 'a retiré' }}
            </label>
            <div class="input-with-suffix">
              <input
                class="se__input"
                type="number"
                v-model.number="formMontant"
                min="0"
                step="1"
                placeholder="0"
              />
              <span class="input-suffix">€</span>
            </div>
          </div>

          <!-- Note -->
          <div class="se__field">
            <label class="se__label">Note (optionnel)</label>
            <input
              class="se__input"
              type="text"
              v-model="formNote"
              :placeholder="typeMode === 'retrait' ? 'Réparation voiture, dépense imprévue…' : 'Virement Livret A…'"
            />
          </div>

          <div class="se__modal-actions">
            <button class="se__btn se__btn--secondary" @click="showModal = false" type="button">Annuler</button>
            <button
              :class="['se__btn', typeMode === 'retrait' ? 'se__btn--danger' : 'se__btn--primary']"
              @click="enregistrerMouvement"
              type="button"
            >Enregistrer</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Side panel Gérer les mouvements -->
    <Teleport to="body">
      <Transition name="se-panel">
        <div v-if="panelGererOuvert" class="se-panel__overlay" @click.self="fermerPanel">
          <div class="se-panel">
            <div class="se-panel__header">
              <div>
                <div class="se-panel__title">Mouvements d'épargne</div>
                <div class="se-panel__sub">{{ mouvementsEdition.length }} mouvement{{ mouvementsEdition.length > 1 ? 's' : '' }}</div>
              </div>
              <button class="se-panel__close" @click="fermerPanel" type="button">✕</button>
            </div>
            <div class="se-panel__body">
              <EpargneTable
                :mouvements="mouvementsEdition"
                @modifier="onModifier"
                @supprimer="onSupprimer"
              />
            </div>
            <div class="se-panel__footer">
              <button class="se-panel__btn-secondary" @click="fermerPanel" type="button">Fermer</button>
              <button
                class="se-panel__btn-primary"
                :disabled="!hasChanges"
                @click="sauvegarder"
                type="button"
              >Enregistrer</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import EpargneTable from './EpargneTable.vue'
import { MsButton } from './ui/index.js'
import { useBudgetStore } from '../stores/budget'
import { useStorage } from '../composables/useStorage'

use([CanvasRenderer, LineChart, GridComponent, TooltipComponent, LegendComponent])

const store = useBudgetStore()
const { scheduleAutoSave } = useStorage()

function fmt(n = 0) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

const isSolo = computed(() => store.personnes.length <= 1)
const nomP1  = computed(() => store.personnes[0]?.nom || 'Personne 1')
const nomP2  = computed(() => store.personnes[1]?.nom || 'Personne 2')

// ── Totaux (depuis le getter partagé avec CalculateurProjet) ──
const totalP1 = computed(() => store.totalEpargneParPersonne.p1)
const totalP2 = computed(() => store.totalEpargneParPersonne.p2)
const totalCouple = computed(() => totalP1.value + totalP2.value)

// ── Données cumulées par mois (ordre chronologique garanti) ──
const chartData = computed(() => {
  if (!store.epargnes?.length) return { labels: [], dataP1: [], dataP2: [] }

  // 1. Tri par date croissante
  const sorted = [...store.epargnes].sort((a, b) => new Date(a.date) - new Date(b.date))

  // 2. Agrégation dans une Map ordonnée (clé = label affiché)
  const moisMap = new Map()
  sorted.forEach(e => {
    const d = new Date(e.date)
    const key = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
    if (!moisMap.has(key)) moisMap.set(key, { deltaP1: 0, deltaP2: 0 })
    const entry = moisMap.get(key)
    entry.deltaP1 += (e.montantP1 || 0)
    entry.deltaP2 += (e.montantP2 || 0)
  })

  // 3. Cumul progressif — dernier point doit égaler store.totalEpargneParPersonne
  const labels = [], dataP1 = [], dataP2 = []
  let cumulP1 = 0, cumulP2 = 0
  moisMap.forEach((val, key) => {
    cumulP1 += val.deltaP1
    cumulP2 += val.deltaP2
    labels.push(key)
    dataP1.push(Math.round(cumulP1))
    dataP2.push(Math.round(cumulP2))
  })

  return { labels, dataP1, dataP2 }
})

// ── Graphique cumulatif (ECharts) ───────────────────────
const chartOption = computed(() => {
  const { labels, dataP1, dataP2 } = chartData.value
  const p1 = store.personnes[0]
  const p2 = store.personnes[1]
  const isSmooth = dataP1.length >= 4 ? 0.6 : false

  const fmtVal = v => new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0
  }).format(v)

  return {
    grid: { top: 36, right: 12, bottom: 28, left: 60 },
    legend: {
      top: 0, left: 0,
      itemWidth: 10, itemHeight: 10,
      textStyle: { fontSize: 11, color: '#71717A' },
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 11, color: '#71717A' },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      min: 0,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#71717A',
        fontSize: 11,
        formatter: v => v >= 1000
          ? (v / 1000).toFixed(v % 1000 === 0 ? 0 : 1) + 'k€'
          : v + ' €'
      },
      splitLine: { lineStyle: { color: '#E4E4E7', width: 0.5 } },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#FFFFFF',
      borderColor: '#E4E4E7',
      borderWidth: 1,
      formatter: params => {
        let html = `<div style="font-weight:500;font-size:12px;color:#09090B;margin-bottom:6px">${params[0].axisValue}</div>`
        params.forEach(p => {
          const idx = p.dataIndex
          const seriesData = p.seriesIndex === 0 ? dataP1 : dataP2
          const delta = idx > 0 ? p.data - seriesData[idx - 1] : p.data
          const deltaStr = delta >= 0 ? `+${fmtVal(delta)}` : fmtVal(delta)
          const deltaColor = delta >= 0 ? '#22C55E' : '#EF4444'
          html += `<div style="display:flex;align-items:center;gap:8px;margin:3px 0">
            <span style="width:8px;height:8px;border-radius:50%;background:${p.color};flex-shrink:0;display:inline-block"></span>
            <span style="font-size:12px;color:#71717A">${p.seriesName}</span>
            <span style="margin-left:auto;font-weight:500;font-size:12px;color:#09090B;padding-left:12px">${fmtVal(p.data)}</span>
            <span style="font-size:11px;color:${deltaColor}">${deltaStr}</span>
          </div>`
        })
        return `<div style="padding:4px 2px">${html}</div>`
      }
    },
    series: [
      {
        name: p1?.nom || 'P1',
        type: 'line',
        data: dataP1,
        smooth: isSmooth,
        lineStyle: { color: '#7C6FCD', width: 2.5 },
        itemStyle: { color: '#7C6FCD', borderColor: '#fff', borderWidth: 2 },
        symbol: 'circle', symbolSize: 6,
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(124,111,205,0.18)' },
              { offset: 1, color: 'rgba(124,111,205,0.0)' },
            ]
          }
        },
      },
      ...(!isSolo.value ? [{
        name: p2?.nom || 'P2',
        type: 'line',
        data: dataP2,
        smooth: isSmooth,
        lineStyle: { color: '#4A9EDB', width: 2.5 },
        itemStyle: { color: '#4A9EDB', borderColor: '#fff', borderWidth: 2 },
        symbol: 'circle', symbolSize: 6,
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(74,158,219,0.18)' },
              { offset: 1, color: 'rgba(74,158,219,0.0)' },
            ]
          }
        },
      }] : []),
    ]
  }
})

// ── Side panel Gérer ─────────────────────────────────────
const panelGererOuvert = ref(false)
const mouvementsEdition = ref([])
const hasChanges = ref(false)

function ouvrirPanel() {
  mouvementsEdition.value = store.epargnes.map(e => ({ ...e }))
  hasChanges.value = false
  panelGererOuvert.value = true
}

function fermerPanel() {
  panelGererOuvert.value = false
}

function onModifier(mvt) {
  const idx = mouvementsEdition.value.findIndex(m => m.id === mvt.id)
  if (idx !== -1) mouvementsEdition.value.splice(idx, 1, { ...mvt })
  hasChanges.value = true
}

function onSupprimer(id) {
  mouvementsEdition.value = mouvementsEdition.value.filter(m => m.id !== id)
  hasChanges.value = true
}

function sauvegarder() {
  const localIds = new Set(mouvementsEdition.value.map(m => m.id))
  store.epargnes
    .filter(e => !localIds.has(e.id))
    .forEach(e => store.supprimerEpargne(e.id))
  mouvementsEdition.value.forEach(mvt => store.modifierEpargne(mvt))
  scheduleAutoSave()
  hasChanges.value = false
}

// ── Modale Mouvement ──────────────────────────────────────
const showModal = ref(false)
const personneSel = ref('p1')
const formMontant = ref(0)
const formDate = ref('')
const formNote = ref('')
const typeMode = ref('epargne')

const nomPersonneSel = computed(() =>
  personneSel.value === 'p1' ? nomP1.value : nomP2.value
)

watch(showModal, val => {
  if (val) {
    personneSel.value = 'p1'
    formMontant.value = 0
    formDate.value = new Date().toISOString().split('T')[0]
    formNote.value = ''
    typeMode.value = 'epargne'
  }
})

function openModal() {
  showModal.value = true
}

function enregistrerMouvement() {
  if (!formMontant.value || formMontant.value <= 0) return
  const valeur = typeMode.value === 'retrait'
    ? -Math.abs(formMontant.value)
    : Math.abs(formMontant.value)
  store.ajouterEpargne({
    date:      formDate.value || new Date().toISOString().split('T')[0],
    montantP1: personneSel.value === 'p1' ? valeur : 0,
    montantP2: personneSel.value === 'p2' ? valeur : 0,
    note:      formNote.value.trim(),
  })
  scheduleAutoSave()
  showModal.value = false
}
</script>

<style scoped>
.se { display: flex; flex-direction: column; gap: 16px; height: 100%; }

.epargne-actions { display: flex; gap: 8px; align-items: center; }

@media (max-width: 768px) {
  .epargne-header { flex-wrap: wrap; gap: 8px; }
  .epargne-actions { width: 100%; display: flex; gap: 8px; }
  /* Gérer : taille fixe, Nouveau mouvement : prend le reste */
  .epargne-actions :deep(.ms-btn:first-child) { flex: 0 0 auto; }
  .epargne-actions :deep(.ms-btn:last-child)  { flex: 1; justify-content: center; }
}

.se__chart-wrap { height: 200px; position: relative; }
.epargne-chart  { height: 200px; width: 100%; }
.chart-hint {
  font-size: 11px;
  color: var(--muted-foreground);
  text-align: center;
  margin: 0;
}

.se__empty {
  height: 180px; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 10px; text-align: center;
}
.se__empty p { font-size: 12px; color: var(--muted-foreground); line-height: 1.5; }

/* Totaux */
.se__totals { display: flex; gap: 8px; flex-wrap: wrap; }
.se__total {
  flex: 1; min-width: 90px;
  display: flex; flex-direction: column; gap: 2px;
  padding: 10px 12px; border-radius: var(--radius-md);
  background: var(--muted);
}
.se__total--couple { background: var(--color-success-subtle); }
.se__total--zero   { background: var(--muted); }
.se__total-name  { font-size: 11px; font-weight: 600; color: var(--muted-foreground); }
.se__total--p1 .se__total-name { color: #7C6FCD; font-weight: 500; }
.se__total--p2 .se__total-name { color: #4A9EDB; font-weight: 500; }
.se__total-label { font-size: 10px; color: var(--muted-foreground); }
.se__total-val   { font-size: 15px; font-weight: 700; color: var(--foreground); }
.se__total-val--p1     { color: var(--chart-p1); }
.se__total-val--p2     { color: var(--chart-p2); }
.se__total-val--couple { color: var(--color-success); }
.se__total-val--danger { color: var(--color-danger); }
.se__total-val--zero   { color: var(--muted-foreground); }

/* Modale */
.se__overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
}
.se__modal {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 28px;
  max-width: 400px; width: 100%;
  box-shadow: var(--shadow-xl);
  display: flex; flex-direction: column; gap: 16px;
}
.se__modal-title { font-size: 16px; font-weight: 600; color: var(--foreground); }

/* Toggle épargne / retrait */
.se__toggle {
  display: flex;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--secondary);
}
.se__toggle-btn {
  flex: 1; padding: 8px 0; font-size: 13px; font-weight: 500; font-family: inherit;
  border: none; background: transparent; cursor: pointer;
  color: var(--muted-foreground); transition: background 120ms ease, color 120ms ease;
}
.se__toggle-btn--active {
  background: var(--primary); color: var(--primary-foreground);
}
.se__toggle-btn--danger { color: var(--color-danger); }
.se__toggle-btn--active-danger {
  background: var(--destructive); color: var(--destructive-foreground);
}

.se__field { display: flex; flex-direction: column; gap: 6px; }
.se__label { font-size: 12px; font-weight: 500; color: var(--muted-foreground); }
.se__input-wrap { position: relative; display: flex; align-items: center; }
.se__input {
  width: 100%; height: 36px; padding: 0 12px; border-radius: var(--radius-md);
  border: 1px solid var(--input); font-size: 14px;
  font-family: inherit; color: var(--foreground); background: var(--background); outline: none;
  box-sizing: border-box;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}
.se__input:focus {
  border-color: var(--ring);
  box-shadow: 0 0 0 2px rgba(24,24,27,0.12);
}
.se__input-wrap .se__input { padding-right: 28px; }
.se__suffix {
  position: absolute; right: 10px;
  font-size: 13px; color: var(--muted-foreground); pointer-events: none;
}

.personne-pills { display: flex; gap: 8px; }
.personne-pill {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px 16px; border: 1.5px solid var(--border);
  border-radius: var(--radius-md); background: var(--secondary);
  font-size: 14px; font-weight: 400; color: var(--muted-foreground);
  font-family: inherit; cursor: pointer; transition: all 150ms;
}
.personne-pill:hover { border-color: var(--zinc-300); color: var(--foreground); }
.personne-pill.active.color-p1 {
  border-color: #7C6FCD; background: rgba(124,111,205,0.08); color: #5A4FB0; font-weight: 500;
}
.personne-pill.active.color-p2 {
  border-color: #4A9EDB; background: rgba(74,158,219,0.08); color: #2A7AB8; font-weight: 500;
}
.pill-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

.input-with-suffix { position: relative; display: flex; align-items: center; }
.input-with-suffix .se__input { padding-right: 32px; }
.input-suffix {
  position: absolute; right: 14px;
  font-size: 14px; color: var(--muted-foreground); pointer-events: none;
}

.se__modal-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px; }
.se__btn {
  height: 36px; padding: 0 18px; border-radius: var(--radius-md);
  font-size: 13px; font-weight: 500;
  font-family: inherit; cursor: pointer; border: none; transition: opacity 120ms ease;
}
.se__btn--primary   { background: var(--primary); color: var(--primary-foreground); }
.se__btn--danger    { background: var(--destructive); color: var(--destructive-foreground); }
.se__btn--secondary { background: var(--secondary); color: var(--secondary-foreground); border: 1px solid var(--border); }
.se__btn:hover { opacity: 0.85; }

/* ── Side panel Gérer ──────────────────────────────────── */
.se-panel-enter-active, .se-panel-leave-active { transition: opacity 0.2s ease; }
.se-panel-enter-active .se-panel, .se-panel-leave-active .se-panel { transition: transform 0.25s ease; }
.se-panel-enter-from, .se-panel-leave-to { opacity: 0; }
.se-panel-enter-from .se-panel, .se-panel-leave-to .se-panel { transform: translateX(100%); }

.se-panel__overlay {
  position: fixed; inset: 0; background: rgba(48,41,39,0.28); z-index: 500;
  display: flex; justify-content: flex-end;
}
.se-panel {
  width: 680px; height: 100%; background: var(--popover);
  box-shadow: -4px 0 32px rgba(48,41,39,0.12);
  display: flex; flex-direction: column;
}
.se-panel__header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 20px 24px 16px; border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.se-panel__title { font-size: 16px; font-weight: 600; color: var(--foreground); }
.se-panel__sub   { font-size: 12px; color: var(--muted-foreground); margin-top: 3px; }
.se-panel__close {
  background: none; border: none; font-size: 16px; cursor: pointer;
  color: var(--muted-foreground); padding: 4px; font-family: inherit;
}
.se-panel__close:hover { color: var(--foreground); }

.se-panel__body { flex: 1; overflow-y: auto; }

.se-panel__footer {
  display: flex; gap: 10px; justify-content: flex-end; align-items: center;
  padding: 16px 24px; border-top: 1px solid var(--border);
  flex-shrink: 0; background: var(--card);
}
.se-panel__btn-secondary {
  height: 36px; padding: 0 18px; border-radius: var(--radius-md);
  font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer;
  background: var(--secondary); color: var(--secondary-foreground);
  border: 1px solid var(--border); transition: background 120ms;
}
.se-panel__btn-secondary:hover { background: var(--accent); }
.se-panel__btn-primary {
  height: 36px; padding: 0 20px; border-radius: var(--radius-md);
  font-size: 13px; font-weight: 500; font-family: inherit; cursor: pointer;
  background: var(--primary); color: var(--primary-foreground);
  border: none; transition: opacity 120ms;
}
.se-panel__btn-primary:hover:not(:disabled) { opacity: 0.85; }
.se-panel__btn-primary:disabled { opacity: 0.35; cursor: default; }
</style>
