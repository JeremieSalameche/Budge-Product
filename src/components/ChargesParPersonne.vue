<template>
  <div class="charges-card">
    <div class="card-title">Charges par personne</div>
    <div class="charges-total">{{ formatEur(totalCharges) }}</div>

    <div class="split-bar">
      <div class="bar-p1" :style="{ flex: pctP1 }"></div>
      <div class="bar-p2" :style="{ flex: pctP2 }"></div>
    </div>

    <div class="persons">
      <div class="person">
        <span class="p-name">
          <span class="dot dot-p1"></span>
          {{ nomP1 }}
        </span>
        <span class="p-amount">{{ formatEur(totalP1) }}</span>
        <span class="p-pct">{{ pctP1 }}% du total</span>
      </div>
      <div class="person">
        <span class="p-name">
          <span class="dot dot-p2"></span>
          {{ nomP2 }}
        </span>
        <span class="p-amount">{{ formatEur(totalP2) }}</span>
        <span class="p-pct">{{ pctP2 }}% du total</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '../stores/budget'

const store = useBudgetStore()

const nomP1 = computed(() => store.personnes[0]?.nom || 'Personne 1')
const nomP2 = computed(() => store.personnes[1]?.nom || 'Personne 2')

const totalP1 = computed(() => store.totalMensuelP1)
const totalP2 = computed(() => store.totalMensuelP2)
const totalCharges = computed(() => totalP1.value + totalP2.value)

const pctP1 = computed(() => {
  if (totalCharges.value === 0) return 50
  return Math.round((totalP1.value / totalCharges.value) * 100)
})
const pctP2 = computed(() => 100 - pctP1.value)

function formatEur(val) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)
}
</script>

<style scoped>
.charges-card {
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.charges-total {
  font-size: 40px;
  font-weight: 700;
  color: var(--foreground);
  line-height: 1.05;
  letter-spacing: -0.025em;
  margin-bottom: 1.25rem;
}
.split-bar {
  display: flex;
  height: 10px;
  border-radius: 999px;
  overflow: hidden;
  margin-bottom: 1.25rem;
  gap: 2px;
}
.bar-p1 {
  background: #7C6FCD;
  border-radius: 999px 0 0 999px;
}
.bar-p2 {
  background: #4A9EDB;
  border-radius: 0 999px 999px 0;
}
.persons {
  display: flex;
  gap: 8px;
}
.person {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 0.75rem 1rem;
  background: var(--background);
  border-radius: 12px;
  border: 1px solid var(--border);
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 6px;
  flex-shrink: 0;
}
.dot-p1 { background: #7C6FCD; }
.dot-p2 { background: #4A9EDB; }
.p-name {
  font-size: 12px;
  color: var(--muted-foreground);
  display: flex;
  align-items: center;
}
.p-amount {
  font-size: 19px;
  font-weight: 500;
  color: var(--foreground);
}
.p-pct {
  font-size: 12px;
  color: var(--muted-foreground);
}
</style>
