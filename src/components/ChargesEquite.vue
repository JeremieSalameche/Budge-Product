<template>
  <div class="ce-card">

    <h3 class="card-title">Charges & équité</h3>

    <!-- Donut centré + légende 2 colonnes -->
    <div class="ce-top">

      <div class="ce-donut-container">
        <canvas ref="donutRef"></canvas>
        <div class="ce-donut-center">
          <span class="ce-donut-total">{{ fmt(totalCharges) }}</span>
          <span class="ce-donut-label">/ mois</span>
        </div>
      </div>

      <div class="ce-legend-grid">
        <div class="ce-legend-item">
          <span class="ce-dot" style="background:#7C6FCD"></span>
          <div>
            <div class="ce-legend-name">{{ nomP1 }}</div>
            <div class="ce-legend-amount">{{ fmt(totalP1) }}</div>
            <div class="ce-legend-pct">{{ pctP1 }}% des charges</div>
          </div>
        </div>
        <div class="ce-legend-item">
          <span class="ce-dot" style="background:#4A9EDB"></span>
          <div>
            <div class="ce-legend-name">{{ nomP2 }}</div>
            <div class="ce-legend-amount">{{ fmt(totalP2) }}</div>
            <div class="ce-legend-pct">{{ pctP2 }}% des charges</div>
          </div>
        </div>
      </div>

    </div>

    <div class="ce-divider"></div>

    <!-- Jauge équité -->
    <div class="ce-equite">

      <div class="ce-equite-header">
        <div class="ce-equite-left">
          <span class="ce-niveau-icon">{{ niveaux.icon }}</span>
          <div>
            <div class="ce-equite-label">Équité du couple</div>
            <div class="ce-niveau-titre" :class="niveaux.classe">{{ niveaux.titre }}</div>
          </div>
        </div>
        <div class="ce-score-badge" :class="niveaux.classe">
          {{ score }}<span class="ce-score-unit">/100</span>
        </div>
      </div>

      <div class="ce-equite-bar-track">
        <div class="ce-equite-bar-fill" :class="niveaux.classe" :style="{ width: score + '%' }"></div>
        <div class="ce-bar-marker" style="left: 50%"></div>
        <div class="ce-bar-marker" style="left: 70%"></div>
        <div class="ce-bar-marker" style="left: 85%"></div>
        <div class="ce-bar-marker" style="left: 95%"></div>
      </div>

      <div class="ce-niveau-phrase" :class="niveaux.classe">{{ niveaux.phrase }}</div>

    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useBudgetStore } from '../stores/budget'
import Chart from 'chart.js/auto'

const store = useBudgetStore()
const donutRef = ref(null)
let chartInstance = null

const nomP1 = computed(() => store.personnes[0]?.nom || 'P1')
const nomP2 = computed(() => store.personnes[1]?.nom || 'P2')
const salaireP1 = computed(() => store.personnes[0]?.salaire || 0)
const salaireP2 = computed(() => store.personnes[1]?.salaire || 0)
const totalP1 = computed(() => store.totalMensuelP1)
const totalP2 = computed(() => store.totalMensuelP2)
const totalCharges = computed(() => totalP1.value + totalP2.value)

const pctP1 = computed(() =>
  totalCharges.value > 0 ? Math.round(totalP1.value / totalCharges.value * 100) : 50
)
const pctP2 = computed(() => 100 - pctP1.value)

const revenuCouple = computed(() => salaireP1.value + salaireP2.value)
const partRevenusP1 = computed(() =>
  revenuCouple.value > 0 ? salaireP1.value / revenuCouple.value * 100 : 50
)
const ecartP1 = computed(() => pctP1.value - partRevenusP1.value)
const chargesEquitablesP1 = computed(() => totalCharges.value * (partRevenusP1.value / 100))
const montantReeq = computed(() => Math.abs(totalP1.value - chargesEquitablesP1.value))
const score = computed(() => Math.max(0, Math.round(100 - Math.abs(ecartP1.value) * 2)))

const niveaux = computed(() => {
  const s = score.value
  const p1 = nomP1.value
  const p2 = nomP2.value
  const m = Math.round(montantReeq.value)
  const surcharge = ecartP1.value > 0 ? p1 : p2

  if (s >= 95) return {
    icon: '🏆',
    titre: 'Parfaitement équilibré',
    phrase: `${p1} et ${p2} contribuent chacun selon leurs moyens. Bel équilibre !`,
    classe: 'niveau-parfait'
  }
  if (s >= 85) return {
    icon: '✅',
    titre: 'Très bonne répartition',
    phrase: `Léger écart de ${m} €/mois — dans la marge normale pour un couple.`,
    classe: 'niveau-bon'
  }
  if (s >= 70) return {
    icon: '⚖️',
    titre: 'Disparité modérée',
    phrase: `${surcharge} prend ${m} €/mois de plus que sa part. Un petit rééquilibrage serait juste.`,
    classe: 'niveau-moyen'
  }
  if (s >= 50) return {
    icon: '⚠️',
    titre: 'Déséquilibre notable',
    phrase: `${surcharge} supporte ${m} €/mois de trop par rapport à son salaire. À revoir ensemble.`,
    classe: 'niveau-attention'
  }
  return {
    icon: '🚨',
    titre: 'Déséquilibre important',
    phrase: `${surcharge} porte ${m} €/mois de plus que sa part équitable. Une discussion s'impose.`,
    classe: 'niveau-alerte'
  }
})

function fmt(v) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0
  }).format(v)
}

function buildChart() {
  if (!donutRef.value) return
  if (chartInstance) chartInstance.destroy()

  chartInstance = new Chart(donutRef.value, {
    type: 'doughnut',
    data: {
      labels: [nomP1.value, nomP2.value],
      datasets: [{
        data: [totalP1.value || 1, totalP2.value || 1],
        backgroundColor: ['#7C6FCD', '#4A9EDB'],
        borderColor: '#F8F7F7',
        borderWidth: 3,
        hoverOffset: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          position: 'nearest',
          backgroundColor: '#302927',
          titleColor: '#F8F7F7',
          bodyColor: '#D0CAC3',
          borderColor: 'transparent',
          borderWidth: 0,
          padding: { x: 12, y: 8 },
          cornerRadius: 8,
          displayColors: true,
          boxWidth: 8,
          boxHeight: 8,
          boxPadding: 6,
          callbacks: {
            title: (items) => items[0].label,
            label: (item) => {
              const total = item.dataset.data.reduce((a, b) => a + b, 0)
              const pct = Math.round(item.parsed / total * 100)
              const montant = new Intl.NumberFormat('fr-FR', {
                style: 'currency', currency: 'EUR', maximumFractionDigits: 0
              }).format(item.parsed)
              return `  ${montant} · ${pct}%`
            }
          }
        }
      }
    }
  })
}

onMounted(() => buildChart())
onUnmounted(() => { chartInstance?.destroy() })

watch([totalP1, totalP2], () => {
  if (chartInstance) {
    chartInstance.data.datasets[0].data = [totalP1.value || 1, totalP2.value || 1]
    chartInstance.update('none')
  }
})
</script>

<style scoped>
.ce-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 16px 20px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Donut à gauche + légende à droite */
.ce-top {
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 24px;
  padding: 8px 0;
  min-height: 0;
}

.ce-donut-container {
  width: 160px;
  height: 160px;
  flex-shrink: 0;
  position: relative;
}

.ce-donut-container canvas {
  position: relative;
  z-index: 2;
}

.ce-donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1;
}

.ce-donut-total {
  font-size: 20px;
  font-weight: 600;
  color: var(--foreground);
  line-height: 1;
}

.ce-donut-label {
  font-size: 11px;
  color: var(--muted-foreground);
  margin-top: 3px;
}

/* Légende verticale à droite du donut */
.ce-legend-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.ce-legend-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: var(--surface-raised);
  border-radius: 10px;
  padding: 12px;
}

.ce-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}

.ce-legend-name   { font-size: 12px; color: var(--muted-foreground); margin-bottom: 2px; }
.ce-legend-amount { font-size: 18px; font-weight: 600; color: var(--foreground); line-height: 1.2; }
.ce-legend-pct    { font-size: 11px; color: var(--muted-foreground); margin-top: 2px; }

/* Séparateur */
.ce-divider {
  height: 1px;
  background: var(--border);
  margin: 0 -24px;
  flex-shrink: 0;
}

/* Section équité */
.ce-equite {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 14px;
  flex-shrink: 0;
}

.ce-equite-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.ce-equite-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ce-niveau-icon {
  font-size: 22px;
  line-height: 1;
  flex-shrink: 0;
}

.ce-equite-label {
  font-size: 11px;
  color: var(--muted-foreground);
  margin-bottom: 1px;
}

.ce-niveau-titre {
  font-size: 13px;
  font-weight: 500;
}

.ce-score-badge {
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
  flex-shrink: 0;
}
.ce-score-unit {
  font-size: 13px;
  font-weight: 400;
  opacity: 0.6;
  margin-left: 1px;
}

.ce-equite-bar-track {
  height: 8px;
  background: var(--background);
  border-radius: 999px;
  overflow: visible;
  position: relative;
}

.ce-equite-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.ce-bar-marker {
  position: absolute;
  top: -2px;
  width: 2px;
  height: 12px;
  background: var(--muted);
  border-radius: 1px;
  transform: translateX(-50%);
  pointer-events: none;
}

.ce-niveau-phrase {
  font-size: 12px;
  line-height: 1.5;
  border-radius: 8px;
  padding: 8px 12px;
}

/* Couleurs par niveau */
.niveau-parfait   { color: #2E7D32; }
.niveau-bon       { color: #388E3C; }
.niveau-moyen     { color: #F57C00; }
.niveau-attention { color: #E65100; }
.niveau-alerte    { color: #C62828; }

.ce-score-badge.niveau-parfait   { color: #2E7D32; }
.ce-score-badge.niveau-bon       { color: #388E3C; }
.ce-score-badge.niveau-moyen     { color: #F57C00; }
.ce-score-badge.niveau-attention { color: #E65100; }
.ce-score-badge.niveau-alerte    { color: #C62828; }

.ce-equite-bar-fill.niveau-parfait   { background: #4CAF50; }
.ce-equite-bar-fill.niveau-bon       { background: #66BB6A; }
.ce-equite-bar-fill.niveau-moyen     { background: #FFA726; }
.ce-equite-bar-fill.niveau-attention { background: #FF7043; }
.ce-equite-bar-fill.niveau-alerte    { background: #EF5350; }

.ce-niveau-phrase.niveau-parfait   { background: #E8F5E9; color: #1B5E20; }
.ce-niveau-phrase.niveau-bon       { background: #E8F5E9; color: #2E7D32; }
.ce-niveau-phrase.niveau-moyen     { background: #FFF3E0; color: #E65100; }
.ce-niveau-phrase.niveau-attention { background: #FBE9E7; color: #BF360C; }
.ce-niveau-phrase.niveau-alerte    { background: #FFEBEE; color: #B71C1C; }
</style>
