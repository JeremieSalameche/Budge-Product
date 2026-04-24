<template>
  <div class="cr">
    <div class="cr__header">
      <div class="cr__title-row">
        <div class="cr__icon-cartouche">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="9" cy="12" r="7"/>
            <circle cx="15" cy="12" r="7"/>
          </svg>
        </div>
        <span class="cr__title">Charges & répartition</span>
      </div>
      <span class="cr__total">{{ fmt(totalDepenses) }} / mois</span>
    </div>

    <template v-if="totalDepenses > 0">
      <div class="cr__viz">
        <svg :viewBox="`0 0 ${W} ${H}`" :width="W" :height="H" style="overflow:visible;display:block;margin:auto">
          <!-- Cercle P1 -->
          <circle :cx="cx1" :cy="cy" :r="r1" :fill="C_P1" fill-opacity="0.22" />
          <circle :cx="cx1" :cy="cy" :r="r1" fill="none" :stroke="C_P1" stroke-opacity="0.35" stroke-width="1.5" />
          <!-- Cercle P2 -->
          <circle :cx="cx2" :cy="cy" :r="r2" :fill="C_P2" fill-opacity="0.22" />
          <circle :cx="cx2" :cy="cy" :r="r2" fill="none" :stroke="C_P2" stroke-opacity="0.35" stroke-width="1.5" />

          <!-- Texte P1 -->
          <text :x="tx1" :y="cy - r1 * 0.12" text-anchor="middle" :fill="C_P1" font-family="Inter,sans-serif" font-size="11" font-weight="600" opacity="0.85">{{ p1.nom }}</text>
          <text :x="tx1" :y="cy + r1 * 0.26" text-anchor="middle" :fill="C_P1_DARK" font-family="Inter,sans-serif" :font-size="pctFontSize(r1)" font-weight="700">{{ pctP1 }}%</text>

          <!-- Texte P2 -->
          <text :x="tx2" :y="cy - r2 * 0.12" text-anchor="middle" :fill="C_P2" font-family="Inter,sans-serif" font-size="11" font-weight="600" opacity="0.85">{{ p2.nom }}</text>
          <text :x="tx2" :y="cy + r2 * 0.26" text-anchor="middle" :fill="C_P2_DARK" font-family="Inter,sans-serif" :font-size="pctFontSize(r2)" font-weight="700">{{ pctP2 }}%</text>
        </svg>
      </div>

      <div class="cr__amounts">
        <div class="cr__amount-row">
          <span class="cr__dot" :style="{ background: C_P1 }"></span>
          <span class="cr__amount-name">{{ p1.nom }}</span>
          <span class="cr__amount-val">{{ fmt(totalMensuelP1) }}</span>
          <span class="cr__amount-sub">/ mois</span>
        </div>
        <div class="cr__amount-row">
          <span class="cr__dot" :style="{ background: C_P2 }"></span>
          <span class="cr__amount-name">{{ p2.nom }}</span>
          <span class="cr__amount-val">{{ fmt(totalMensuelP2) }}</span>
          <span class="cr__amount-sub">/ mois</span>
        </div>
      </div>
    </template>

    <div v-else class="cr__empty">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="cr__empty-icon"><circle cx="9" cy="12" r="7"/><circle cx="15" cy="12" r="7"/></svg>
      <span class="cr__empty-title">Pas encore de dépenses</span>
      <span class="cr__empty-sub">La répartition s'affichera dès que vous ajoutez des dépenses</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '../stores/budget'

const store = useBudgetStore()

const C_P1      = '#7C6FCD'
const C_P1_DARK = '#4B3FA8'
const C_P2      = '#4A9EDB'
const C_P2_DARK = '#1E6FA8'

const p1 = computed(() => store.personnes[0])
const p2 = computed(() => store.personnes[1])

const totalMensuelP1 = computed(() => store.totalMensuelP1)
const totalMensuelP2 = computed(() => store.totalMensuelP2)
const totalDepenses  = computed(() => store.totalDepensesMensuel)
const basePct        = computed(() => totalMensuelP1.value + totalMensuelP2.value)
const pctP1          = computed(() => basePct.value > 0 ? Math.round(totalMensuelP1.value / basePct.value * 100) : 50)
const pctP2          = computed(() => 100 - pctP1.value)

// Dimensions SVG
const W = 260
const H = 160
const cy = H / 2 + 4
const R_MAX = 68
const R_MIN = 44

const r1 = computed(() => basePct.value > 0 ? R_MIN + (R_MAX - R_MIN) * (totalMensuelP1.value / basePct.value) : (R_MAX + R_MIN) / 2)
const r2 = computed(() => basePct.value > 0 ? R_MIN + (R_MAX - R_MIN) * (totalMensuelP2.value / basePct.value) : (R_MAX + R_MIN) / 2)

// Positionnement : chevauchement de 22% de la somme des rayons
const OVERLAP = 0.22
const cx1 = computed(() => W / 2 - (r1.value + r2.value) * (1 - OVERLAP) / 2)
const cx2 = computed(() => W / 2 + (r1.value + r2.value) * (1 - OVERLAP) / 2)

// Les textes sont légèrement décalés vers l'extérieur du chevauchement
const tx1 = computed(() => cx1.value - r1.value * 0.1)
const tx2 = computed(() => cx2.value + r2.value * 0.1)

function pctFontSize(r) { return Math.max(18, Math.min(26, r * 0.38)) }

function fmt(v) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Math.round(v))
}
</script>

<style scoped>
.cr {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: var(--shadow-xs);
}
.cr__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.cr__title-row { display: flex; align-items: center; gap: 8px; }
.cr__title { font-size: 14px; font-weight: 600; color: var(--foreground); }

.cr__icon-cartouche {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 4px;
  flex-shrink: 0;
  color: var(--foreground);
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.cr__total { font-size: 13px; font-weight: 500; color: var(--muted-foreground); }

.cr__viz { display: flex; justify-content: center; align-items: center; padding: 4px 0; }

.cr__amounts { display: flex; flex-direction: column; gap: 0; }

.cr__empty {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px; text-align: center; padding: 20px; min-height: 140px;
}
.cr__empty-icon { color: var(--border); }
.cr__empty-title { font-size: 12px; font-weight: 600; color: var(--muted-foreground); }
.cr__empty-sub { font-size: 11px; color: var(--muted-foreground); opacity: 0.7; max-width: 200px; line-height: 1.4; }
.cr__amount-row { display: flex; align-items: center; gap: 8px; padding: 10px 0; }
.cr__amount-row:first-child { border-bottom: 1px solid var(--border); }
.cr__dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.cr__amount-name { font-size: 12px; color: var(--foreground); flex: 1; }
.cr__amount-val { font-size: 13px; font-weight: 600; color: var(--foreground); }
.cr__amount-sub { font-size: 11px; color: var(--muted-foreground); }
</style>
