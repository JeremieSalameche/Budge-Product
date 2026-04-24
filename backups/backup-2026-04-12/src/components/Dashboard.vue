<template>
  <div class="dash">
    <!-- KPI Cards -->
    <div class="dash__kpis">
      <div class="dash__kpi">
        <div class="dash__kpi-label">Revenus totaux</div>
        <div class="dash__kpi-value-row">
          <span class="dash__kpi-value">{{ fmt(store.totalRevenus) }}</span>
          <span class="dash__kpi-sub">/ mois</span>
        </div>
      </div>
      <div class="dash__kpi">
        <div class="dash__kpi-label">Dépenses totales</div>
        <div class="dash__kpi-value-row">
          <span class="dash__kpi-value">{{ fmt(store.totalDepensesMensuel) }}</span>
          <span class="dash__kpi-sub">/ mois</span>
        </div>
      </div>
      <div class="dash__kpi">
        <div class="dash__kpi-inner">
          <div class="dash__kpi-text">
            <div class="dash__kpi-label">Épargne possible {{ store.personnes[0]?.nom }}</div>
            <div class="dash__kpi-value-row">
              <span class="dash__kpi-value dash__kpi-value--p1">
                {{ fmt((store.personnes[0]?.salaire || 0) - store.totalMensuelP1) }}
              </span>
              <span class="dash__kpi-sub">/ mois</span>
            </div>
          </div>
          <MiniDonut
            :valeur="(store.personnes[0]?.salaire || 0) - store.totalMensuelP1"
            :total="store.personnes[0]?.salaire || 1"
            color="#7C6FCD"
          />
        </div>
      </div>
      <div class="dash__kpi">
        <div class="dash__kpi-inner">
          <div class="dash__kpi-text">
            <div class="dash__kpi-label">Épargne possible {{ store.personnes[1]?.nom }}</div>
            <div class="dash__kpi-value-row">
              <span class="dash__kpi-value dash__kpi-value--p2">
                {{ fmt((store.personnes[1]?.salaire || 0) - store.totalMensuelP2) }}
              </span>
              <span class="dash__kpi-sub">/ mois</span>
            </div>
          </div>
          <MiniDonut
            :valeur="(store.personnes[1]?.salaire || 0) - store.totalMensuelP2"
            :total="store.personnes[1]?.salaire || 1"
            color="#4A9EDB"
          />
        </div>
      </div>
    </div>

    <!-- Graphiques -->
    <div class="dash__charts">

      <!-- Colonne gauche : jauge catégories -->
      <div class="dash__chart-left">
        <div class="dash__ccard dash__ccard--light">
          <div class="dash__ccard-header">
            <div class="dash__title-row">
              <div class="dash__icon-cartouche">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
                  <path d="M22 12A10 10 0 0 0 12 2v10z"/>
                </svg>
              </div>
              <span class="card-title">Répartition par catégorie</span>
            </div>
            <div class="dash__ccard-metric">{{ fmt(store.totalDepensesMensuel) }}</div>
            <div class="card-subtitle">dépenses mensuelles totales</div>
          </div>
          <div class="dash__ccard-chart">
            <GaugeCategories
              :categories="gaugeCategories"
              :total="store.totalDepensesMensuel"
              :nb-alertes="nbAlertesOptimisation"
              @ouvrir-optimisation="panelOptimisationVisible = true"
            />
          </div>
        </div>
      </div>

      <!-- Colonne droite : répartition + équité -->
      <div class="dash__chart-right">
        <div class="dash__right-col">
          <ChargesRepartition />
          <EquiteCouple />
        </div>
      </div>

    </div>

    <OptimisationPanel :visible="panelOptimisationVisible" @fermer="panelOptimisationVisible = false" />

    <!-- Suivi épargne + Calculateur projet -->
    <div class="dash__bottom-grid">
      <MsCard padding="md" class="dash__bottom-card">
        <SuiviEpargne />
      </MsCard>
      <MsCard padding="md" class="dash__bottom-card">
        <CalculateurProjet />
      </MsCard>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBudgetStore } from '../stores/budget'
import { toMonthly } from '../stores/budget'
import { MsCard, MsProgress } from './ui/index.js'
import GaugeCategories from './GaugeCategories.vue'
import SuiviEpargne from './SuiviEpargne.vue'
import CalculateurProjet from './CalculateurProjet.vue'
import ChargesRepartition from './ChargesRepartition.vue'
import EquiteCouple from './EquiteCouple.vue'
import OptimisationPanel from './OptimisationPanel.vue'
import MiniDonut from './MiniDonut.vue'

const store = useBudgetStore()
const panelOptimisationVisible = ref(false)

function fmt(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}
// ── Gauge catégories ────────────────────────────────────────
const gaugeCategories = computed(() =>
  store.categories
    .map(cat => ({ nom: cat.nom, couleur: cat.couleur, montant: store.depensesParCategorie[cat.id] || 0 }))
    .filter(c => c.montant > 0)
    .sort((a, b) => b.montant - a.montant)
)

// ── Nb alertes optimisation (pour badge CTA) ────────────────
const SEUILS_OPT = { 'Loisirs': 15, 'Abonnements': 5, 'Transport': 15, 'Alimentation': 20, 'Logement': 40 }
const nbAlertesOptimisation = computed(() => {
  const total = store.totalDepensesMensuel || 1
  return store.categories.filter(cat => {
    const montant = store.depensesParCategorie[cat.id] || 0
    const seuil = SEUILS_OPT[cat.nom]
    if (!seuil || montant === 0) return false
    return Math.round(montant / total * 100) > seuil
  }).length
})



</script>

<style scoped>
.dash { display: flex; flex-direction: column; gap: 16px; width: 100%; }

/* KPIs */
.dash__kpis {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}
@media (max-width: 900px) { .dash__kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); } }

.dash__kpi {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: var(--shadow-xs);
  box-sizing: border-box;
}
.dash__kpi-label { font-size: 11px; font-weight: 500; color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.04em; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dash__kpi-value-row { display: flex; align-items: baseline; gap: 4px; flex-wrap: nowrap; }
.dash__kpi-value { font-size: 20px; font-weight: 600; color: var(--foreground); line-height: 1; white-space: nowrap; }
.dash__kpi-value--success { color: var(--color-success); }
.dash__kpi-value--danger  { color: var(--color-danger); }
.dash__kpi-value--accent  { color: var(--primary); }
.dash__kpi-value--p1      { color: #7C6FCD; }
.dash__kpi-value--p2      { color: #4A9EDB; }
.dash__kpi-sub { font-size: 11px; color: var(--muted-foreground); font-weight: 400; white-space: nowrap; }
.dash__kpi-context { font-size: 11px; color: var(--muted-foreground); white-space: nowrap; margin-left: 4px; align-self: baseline; }

.dash__kpi-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 100%;
}
.dash__kpi-text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}
.dash__kpi-text .dash__kpi-context {
  margin-left: 0;
  align-self: auto;
}

/* Charts */
.dash__charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: stretch;
  width: 100%;
}
@media (max-width: 900px) { .dash__charts { grid-template-columns: 1fr; } }

/* Colonne gauche */
.dash__chart-left {
  display: flex;
  flex-direction: column;
}
.dash__chart-left > * {
  flex: 1;
  height: 100%;
}

/* Colonne droite */
.dash__chart-right {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.dash__chart-right > * {
  flex: 1;
  min-height: 0;
}

.dash__ccard {
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.dash__ccard--dark  { background: #18181B; }
.dash__ccard--light { background: var(--card); border: 1px solid var(--border); }

.dash__ccard-header { display: flex; flex-direction: column; gap: 4px; }

.dash__title-row { display: flex; align-items: center; gap: 8px; }

.dash__icon-cartouche {
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

.dash__ccard-metric {
  font-size: 40px; font-weight: 700;
  line-height: 1.05; letter-spacing: -0.025em;
}
.dash__ccard--dark  .dash__ccard-metric { color: #FFFFFF; }
.dash__ccard--light .dash__ccard-metric { color: var(--foreground); }

.dash__ccard-chart { flex: 1; position: relative; min-height: 200px; }

.dash__right-col { display: flex; flex-direction: column; gap: 12px; height: 100%; }
.dash__right-col > * { flex: 1; min-height: 0; }

/* Bottom grid */
.dash__bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 900px) { .dash__bottom-grid { grid-template-columns: 1fr; } }
.dash__bottom-card { min-height: 320px; display: flex; flex-direction: column; }
</style>
