<template>
  <div class="equite-card">
    <div class="equite-header">
      <div class="card-title">Équité du couple</div>
      <div class="equite-score" :style="{ color: scoreColor }">{{ score }}%</div>
    </div>

    <div class="equite-bar-wrap">
      <div class="equite-bar-bg">
        <div class="equite-bar-fill" :style="{ width: score + '%', background: scoreColor }"></div>
      </div>
      <div class="equite-bar-caption">{{ scoreCaption }}</div>
    </div>

    <div class="equite-rows">
      <div class="equite-row" v-for="p in persons" :key="p.id">
        <span class="equite-dot" :style="{ background: p.couleur }"></span>
        <span class="equite-nom">{{ p.nom }}</span>
        <div class="equite-right">
          <span class="equite-charges">{{ formatEur(p.charges) }}</span>
          <span class="equite-taux">{{ p.taux }}% du salaire</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '../stores/budget'

const store = useBudgetStore()

const persons = computed(() => {
  const p1 = store.personnes[0]
  const p2 = store.personnes[1]
  const t1 = store.totalMensuelP1
  const t2 = store.totalMensuelP2
  const taux1 = p1?.salaire ? Math.round((t1 / p1.salaire) * 100) : 0
  const taux2 = p2?.salaire ? Math.round((t2 / p2.salaire) * 100) : 0
  return [
    { id: 'p1', nom: p1?.nom || 'P1', couleur: '#7C6FCD', charges: t1, taux: taux1 },
    { id: 'p2', nom: p2?.nom || 'P2', couleur: '#4A9EDB', charges: t2, taux: taux2 },
  ]
})

const score = computed(() => {
  const [a, b] = persons.value
  if (!a.taux && !b.taux) return 100
  const diff = Math.abs(a.taux - b.taux)
  return Math.max(0, Math.round(100 - diff * 2))
})

const scoreColor = computed(() => {
  if (score.value >= 80) return '#22C55E'
  if (score.value >= 55) return '#F59E0B'
  return '#EF4444'
})

const scoreCaption = computed(() => {
  if (score.value >= 80) return 'Répartition équitable'
  if (score.value >= 55) return 'Légère disparité'
  return 'Déséquilibre à corriger'
})

function formatEur(val) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)
}
</script>

<style scoped>
.equite-card {
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
}

.equite-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.equite-score {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.02em;
}

.equite-bar-wrap {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.equite-bar-bg {
  height: 8px;
  border-radius: 999px;
  background: var(--border);
  overflow: hidden;
}
.equite-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 600ms ease;
}
.equite-bar-caption {
  font-size: 12px;
  color: var(--muted-foreground);
}

.equite-rows {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.equite-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: var(--background);
  border-radius: 10px;
  border: 1px solid var(--border);
}
.equite-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.equite-nom {
  font-size: 13px;
  color: var(--muted-foreground);
  flex: 1;
}
.equite-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
}
.equite-charges {
  font-size: 14px;
  font-weight: 600;
  color: var(--foreground);
}
.equite-taux {
  font-size: 11px;
  color: var(--muted-foreground);
}
</style>
