<template>
  <div class="dash">
    <!-- KPI Cards -->
    <div class="dash__kpis">
      <!-- Card 1 : flux -->
      <div class="dash__kpi-group">
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
      </div>

      <!-- Card 2 : épargne -->
      <div class="dash__kpi-group" :class="{ 'dash__kpi-group--solo': isSolo }">
        <div class="dash__kpi">
          <div class="dash__kpi-label">Épargne possible {{ store.personnes[0]?.nom }}</div>
          <div class="dash__kpi-value-row">
            <span class="dash__kpi-value dash__kpi-value--p1">
              {{ fmt((store.personnes[0]?.salaire || 0) - store.totalMensuelP1) }}
            </span>
            <span class="dash__kpi-sub">/ mois</span>
          </div>
          <MiniDonut
            class="dash__kpi-donut"
            :valeur="(store.personnes[0]?.salaire || 0) - store.totalMensuelP1"
            :total="store.personnes[0]?.salaire || 1"
            color="#7C6FCD"
          />
        </div>
        <div v-if="!isSolo" class="dash__kpi">
          <div class="dash__kpi-label">Épargne possible {{ store.personnes[1]?.nom }}</div>
          <div class="dash__kpi-value-row">
            <span class="dash__kpi-value dash__kpi-value--p2">
              {{ fmt((store.personnes[1]?.salaire || 0) - store.totalMensuelP2) }}
            </span>
            <span class="dash__kpi-sub">/ mois</span>
          </div>
          <MiniDonut
            class="dash__kpi-donut"
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
              <div class="dash__title-left">
                <div class="dash__icon-cartouche">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
                    <path d="M22 12A10 10 0 0 0 12 2v10z"/>
                  </svg>
                </div>
                <span class="card-title">Répartition par catégorie</span>
              </div>
              <button class="btn-optimiser-inline" @click="panelOptimisationVisible = true">
                Optimiser mon budget
                <span v-if="nbAlertesOptimisation > 0" class="btn-badge">{{ nbAlertesOptimisation }}</span>
              </button>
            </div>
          </div>
          <div class="dash__ccard-chart">
            <!-- Filtres par personne (couple uniquement) -->
            <div v-if="!isSolo && store.totalDepensesMensuel > 0" class="gauge__filters">
              <button
                v-for="f in gaugeFilterOptions" :key="f.id"
                class="gauge__filter-tag"
                :class="{ 'gauge__filter-tag--active': gaugeFilter === f.id }"
                :style="{}"
                @click="gaugeFilter = f.id"
              >
                <span v-if="f.color" class="gauge__filter-dot" :style="{ background: f.color }"></span>
                {{ f.label }}
              </button>
            </div>

            <GaugeCategories
              v-if="store.totalDepensesMensuel > 0"
              :categories="gaugeCategories"
              :total="gaugeTotalFiltered"
              :nb-alertes="nbAlertesOptimisation"
              @ouvrir-optimisation="panelOptimisationVisible = true"
            />
            <div v-else class="dash__empty">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="dash__empty-icon"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
              <span class="dash__empty-title">Aucune dépense pour le moment</span>
              <span class="dash__empty-sub">Commencez par renseigner vos charges pour voir vos statistiques</span>
              <MsButton variant="primary" size="sm" @click="$emit('navigate', 'depenses')">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style="flex-shrink:0"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                Ajouter une dépense
              </MsButton>
            </div>
          </div>
          <div v-if="alertesDetails.length" class="dash__alerts" @click="panelOptimisationVisible = true">
            <div class="dash__alert-icon">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div class="dash__alert-body">
              <span class="dash__alert-title">
                <template v-if="alertesDetails.length === 1">
                  {{ alertesDetails[0].nom }} — {{ alertesDetails[0].pct }}% du budget
                </template>
                <template v-else>
                  {{ alertesDetails.length }} catégories dépassent les seuils
                </template>
              </span>
              <span class="dash__alert-names" v-if="alertesDetails.length > 1">
                {{ alertesDetails.map(a => a.nom).join(', ') }}
              </span>
              <span class="dash__alert-names" v-else>
                Seuil recommandé : {{ alertesDetails[0].seuil }}%
              </span>
            </div>
            <div class="dash__alert-cta">
              Voir les optimisations
              <span class="dash__alert-badge">{{ alertesDetails.length }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Colonne droite -->
      <div class="dash__chart-right">
        <div class="dash__right-col">

          <!-- MODE COUPLE -->
          <template v-if="!isSolo">
            <ChargesRepartition />
            <EquiteCouple />
          </template>

          <!-- MODE SOLO -->
          <template v-else>

            <!-- Module 1 : Règle 50/30/20 -->
            <div class="solo-card">
              <div class="solo-card__header">
                <div class="solo-card__title-row">
                  <div class="dash__icon-cartouche">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>
                  </div>
                  <span class="solo-card__title">Règle 50/30/20</span>
                </div>
                <!-- Score -->
                <div class="rule__header-right" v-if="store.totalDepensesMensuel > 0">
                  <div class="rule__score-with-info">
                    <div class="rule__score-block">
                      <span class="rule__score-val" :style="{ color: ruleCfg.color }">{{ ruleScore }}<span class="rule__score-max">/100</span></span>
                      <span class="rule__score-label" :style="{ color: ruleCfg.color }">{{ ruleCfg.label }}</span>
                    </div>
                    <button class="rule__info-score-btn" type="button" @click="ruleInfoPanelOpen = true" title="En savoir plus">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="8" stroke-width="2.5"/><line x1="12" y1="12" x2="12" y2="16"/></svg>
                    </button>
                  </div>
                </div>
                <span v-else class="solo-card__sub">de votre revenu</span>
              </div>

              <!-- Barre score -->
              <div v-if="store.totalDepensesMensuel > 0" class="rule__score-bar-track">
                <div class="rule__score-bar-fill" :style="{ width: ruleScore + '%', background: ruleCfg.color }"></div>
              </div>

              <template v-if="store.totalDepensesMensuel > 0 && soloSalaire > 0">
                <div class="rule__rows">
                  <div v-for="bucket in rule503020" :key="bucket.label" class="rule__row">
                    <div class="rule__row-head">
                      <span class="rule__label">{{ bucket.label }}</span>
                      <span class="rule__info-btn">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="8"/><line x1="12" y1="12" x2="12" y2="16"/></svg>
                        <span class="rule__tooltip">{{ bucket.info }}</span>
                      </span>
                      <span class="rule__actual">
                        <span :style="{ color: ruleActualColor(bucket) }">{{ bucket.actual }}%</span>
                        <span class="rule__actual-vs">vs</span><span class="rule__actual-target">{{ bucket.target }}%</span>
                      </span>
                    </div>
                    <div class="rule__track">
                      <!-- Fill : pour plancher (Épargne), barre va jusqu'à actual ; pour plafond, jusqu'à min(actual, target) -->
                      <div class="rule__fill" :style="{
                        width: bucket.isFloor
                          ? Math.min(bucket.actual, 100) + '%'
                          : Math.min(bucket.actual, bucket.target) + '%',
                        background: bucket.isFloor && bucket.actual > bucket.target + 3
                          ? 'linear-gradient(to right, #16A34A, #4ADE80)'
                          : bucket.gradient
                      }"></div>
                      <!-- Hachures seulement si c'est un mauvais dépassement (Besoins/Envies > plafond) -->
                      <div v-if="!bucket.isFloor && bucket.actual > bucket.target" class="rule__fill rule__fill--over"
                        :style="{
                          left: bucket.target + '%',
                          width: Math.min(bucket.actual - bucket.target, 100 - bucket.target) + '%',
                          background: `repeating-linear-gradient(45deg, ${bucket.color}55, ${bucket.color}55 3px, ${bucket.color}18 3px, ${bucket.color}18 7px)`
                        }">
                      </div>
                      <!-- Ligne limite -->
                      <div class="rule__target-line" :style="{ left: bucket.target + '%' }"></div>
                    </div>
                    <div class="rule__amounts">
                      <span class="rule__amount-actual">{{ fmt(bucket.montant) }}</span>
                      <span class="rule__amount-sep">vs</span>
                      <span class="rule__amount-ideal">{{ fmt(bucket.ideal) }} idéal</span>
                    </div>
                  </div>
                </div>
              </template>
              <div v-else class="solo-card__empty">
                <span class="solo-card__empty-txt">Ajoutez des dépenses pour voir votre répartition 50/30/20</span>
              </div>

              <!-- Footer CTA identique à EquiteCouple -->
              <div v-if="store.totalDepensesMensuel > 0" class="rule__footer">
                <span class="rule__footer-title">Postes à optimiser</span>
                <span v-if="ruleBucketsOver === 0" class="rule__footer-ok">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Tout équilibré
                </span>
                <button v-else class="rule__footer-cta" @click="rulePanelOpen = true">
                  Voir les optimisations
                  <span class="rule__footer-badge">{{ ruleBucketsOver }}</span>
                </button>
              </div>
            </div>

            <!-- Side panel 50/30/20 -->
            <Teleport to="body">
              <Transition name="rule-panel">
                <div v-if="rulePanelOpen" class="rule-panel__overlay" @click.self="rulePanelOpen = false">
                  <div class="rule-panel">
                    <div class="rule-panel__header">
                      <div>
                        <div class="rule-panel__title">Optimisation 50/30/20</div>
                        <div class="rule-panel__sub">Analyse de votre répartition budgétaire</div>
                      </div>
                      <button class="rule-panel__close" @click="rulePanelOpen = false">✕</button>
                    </div>
                    <div class="rule-panel__summary">
                      <div class="rule-panel__summary-item">
                        <span class="rule-panel__summary-label">Score actuel</span>
                        <span class="rule-panel__summary-val" :style="{ color: ruleCfg.color }">{{ ruleScore }}/100</span>
                      </div>
                      <div class="rule-panel__summary-item">
                        <span class="rule-panel__summary-label">Revenu mensuel</span>
                        <span class="rule-panel__summary-val">{{ fmt(soloSalaire) }}</span>
                      </div>
                    </div>
                    <div class="rule-panel__body">
                      <div v-for="bucket in rule503020" :key="bucket.label" class="rule-panel__bucket">
                        <div class="rule-panel__bucket-head">
                          <span class="rule-panel__bucket-dot" :style="{ background: bucket.color }"></span>
                          <span class="rule-panel__bucket-name">{{ bucket.label }}</span>
                          <span class="rule-panel__bucket-badge" :class="bucket.actual > bucket.target + 5 ? 'badge--warn' : bucket.actual < bucket.target - 5 ? 'badge--low' : 'badge--ok'">
                            {{ bucket.actual > bucket.target + 5 ? 'Au-dessus' : bucket.actual < bucket.target - 5 ? 'En dessous' : 'Dans l\'objectif' }}
                          </span>
                        </div>
                        <div class="rule-panel__bucket-stats">
                          <div class="rule-panel__stat-row">
                            <span>Actuel</span>
                            <span style="font-weight:600">{{ fmt(bucket.montant) }} — {{ bucket.actual }}%</span>
                          </div>
                          <div class="rule-panel__stat-row">
                            <span>Objectif {{ bucket.target }}%</span>
                            <span style="font-weight:600">{{ fmt(bucket.ideal) }}</span>
                          </div>
                          <div class="rule-panel__stat-row" v-if="Math.abs(bucket.actual - bucket.target) > 2">
                            <span>{{ bucket.actual > bucket.target ? 'À réduire de' : 'Marge disponible' }}</span>
                            <span :style="{ fontWeight: 600, color: bucket.actual > bucket.target ? '#D97706' : '#16A34A' }">
                              {{ fmt(Math.abs(bucket.montant - bucket.ideal)) }} / mois
                            </span>
                          </div>
                        </div>
                        <div class="rule-panel__bucket-tip" v-if="bucket.actual > bucket.target + 5 || bucket.actual < bucket.target - 5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="flex-shrink:0;margin-top:1px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                          <span>{{ bucket.tip }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </Teleport>

            <!-- Side panel : Explication règle 50/30/20 -->
            <Teleport to="body">
              <Transition name="rule-panel">
                <div v-if="ruleInfoPanelOpen" class="rule-panel__overlay" @click.self="ruleInfoPanelOpen = false">
                  <div class="rule-panel">
                    <div class="rule-panel__header">
                      <div>
                        <div class="rule-panel__title">La règle des 50/30/20</div>
                        <div class="rule-panel__sub">Un cadre simple pour équilibrer votre budget</div>
                      </div>
                      <button class="rule-panel__close" @click="ruleInfoPanelOpen = false">✕</button>
                    </div>
                    <div class="rule-panel__body rule-info__body">

                      <div class="rule-info__section">
                        <div class="rule-info__icon-row">
                          <span class="rule-info__dot" style="background:#9B6FD4"></span>
                          <span class="rule-info__heading">50% — Besoins essentiels</span>
                        </div>
                        <p class="rule-info__text">La moitié de votre revenu devrait couvrir vos dépenses <strong>indispensables</strong> : loyer, courses, transport, santé, assurances. Ce sont les charges incompressibles que vous auriez du mal à réduire rapidement.</p>
                        <div class="rule-info__tip">💡 Si vos besoins dépassent 50%, regardez d'abord le logement et le transport — les deux postes les plus lourds.</div>
                      </div>

                      <div class="rule-info__section">
                        <div class="rule-info__icon-row">
                          <span class="rule-info__dot" style="background:#5B7FD4"></span>
                          <span class="rule-info__heading">30% — Envies & plaisirs</span>
                        </div>
                        <p class="rule-info__text">Un tiers pour tout ce qui améliore votre quotidien sans être vital : restaurants, loisirs, abonnements, voyages, shopping. Ces dépenses sont importantes pour votre bien-être, mais peuvent être ajustées.</p>
                        <div class="rule-info__tip">💡 Les abonnements s'accumulent vite. Un audit rapide permet souvent de libérer 50–100 € / mois.</div>
                      </div>

                      <div class="rule-info__section">
                        <div class="rule-info__icon-row">
                          <span class="rule-info__dot" style="background:#7AAAE8"></span>
                          <span class="rule-info__heading">20% — Épargne (plancher)</span>
                        </div>
                        <p class="rule-info__text">Au moins 20% de votre revenu mis de côté chaque mois. Contrairement aux deux autres catégories, l'épargne est un <strong>plancher</strong> — épargner plus est toujours positif pour votre score.</p>
                        <div class="rule-info__tip">💡 Automatisez un virement le jour de votre salaire. Ce que vous ne voyez pas, vous ne le dépensez pas.</div>
                      </div>

                      <div class="rule-info__score-explainer">
                        <div class="rule-info__score-title">Comment le score est calculé ?</div>
                        <p class="rule-info__score-text">Le score part de 100 et perd des points pour chaque écart négatif : trop de Besoins, trop d'Envies, ou pas assez d'Épargne. Épargner <em>plus</em> que 20% n'est jamais pénalisé.</p>
                      </div>

                    </div>
                  </div>
                </div>
              </Transition>
            </Teleport>

            <!-- Module 2 : Simulateur épargne -->
            <div class="solo-card">
              <div class="solo-card__header">
                <div class="solo-card__title-row">
                  <div class="dash__icon-cartouche">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  <span class="solo-card__title">Simulateur d'épargne</span>
                </div>
              </div>
              <div class="sim__body">
                <div class="sim__input-wrap">
                  <label class="sim__label">Je veux économiser</label>
                  <div class="sim__input-row">
                    <input class="sim__input" type="number" v-model.number="simObjectif" min="0" step="500" placeholder="5 000" />
                    <span class="sim__suffix">€</span>
                  </div>
                </div>
                <template v-if="simObjectif > 0 && soloReste > 0">
                  <div class="sim__result">
                    <div class="sim__result-main">
                      <span class="sim__result-val">{{ simDuree }}</span>
                      <span class="sim__result-sub">en épargnant {{ fmt(soloReste) }}/mois</span>
                    </div>
                    <div class="sim__result-detail" v-if="simObjectif > 0">
                      <div class="sim__detail-row">
                        <span>Épargne mensuelle disponible</span>
                        <span class="sim__detail-val">{{ fmt(soloReste) }}</span>
                      </div>
                      <div class="sim__detail-row">
                        <span>Objectif atteint le</span>
                        <span class="sim__detail-val">{{ simDateCible }}</span>
                      </div>
                    </div>
                  </div>
                </template>
                <div v-else-if="soloReste <= 0 && soloSalaire > 0" class="sim__no-epargne">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  Aucune marge d'épargne — réduisez vos dépenses
                </div>
                <div v-else class="solo-card__empty">
                  <span class="solo-card__empty-txt">Saisissez un montant à atteindre</span>
                </div>
              </div>
            </div>

          </template>
        </div>
      </div>

    </div>

    <OptimisationPanel :visible="panelOptimisationVisible" @fermer="panelOptimisationVisible = false" />

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

defineEmits(['navigate'])
import { useBudgetStore } from '../stores/budget'
import { toMonthly } from '../stores/budget'
import { MsCard, MsProgress, MsButton } from './ui/index.js'
import GaugeCategories from './GaugeCategories.vue'
import ChargesRepartition from './ChargesRepartition.vue'
import EquiteCouple from './EquiteCouple.vue'
import OptimisationPanel from './OptimisationPanel.vue'
import MiniDonut from './MiniDonut.vue'

const store = useBudgetStore()
const panelOptimisationVisible = ref(false)

const isSolo      = computed(() => store.personnes.length <= 1)
const soloSalaire = computed(() => store.personnes[0]?.salaire || 0)
const soloReste   = computed(() => soloSalaire.value - store.totalDepensesMensuel)
const tauxEffort  = computed(() => soloSalaire.value > 0 ? Math.round(store.totalDepensesMensuel / soloSalaire.value * 100) : 0)
const tauxEpargne = computed(() => soloSalaire.value > 0 ? Math.round(soloReste.value / soloSalaire.value * 100) : 0)

// ── Règle 50/30/20 ──────────────────────────────────────────
const CATS_BESOINS = ['Logement', 'Transport', 'Alimentation', 'Santé', 'Enfants', 'Assurance', 'Emprunt']
const rule503020 = computed(() => {
  const sal   = soloSalaire.value || 1
  const total = store.totalDepensesMensuel

  const besoinsMontant = store.categories
    .filter(c => CATS_BESOINS.includes(c.nom))
    .reduce((s, c) => s + (store.depensesParCategorie[c.id] || 0), 0)

  const enviesMontant  = Math.max(0, total - besoinsMontant)
  const epargne        = Math.max(0, soloReste.value)

  return [
    // Besoins/Envies : plafond (dépasser = mauvais), Épargne : plancher (dépasser = bon)
    { label: 'Besoins', target: 50, montant: besoinsMontant, actual: Math.round(besoinsMontant / sal * 100), ideal: Math.round(sal * 0.50), color: '#9B6FD4', gradient: 'linear-gradient(to right, #9B6FD4, #B89CE8)', isFloor: false, info: 'Dépenses essentielles : loyer, transport, alimentation, santé. Ce dont vous ne pouvez pas vous passer.', tip: besoinsMontant > sal * 0.50 ? 'Vos charges fixes sont élevées. Renégociez votre loyer, mutualisez les abonnements ou optimisez vos trajets.' : 'Vos besoins sont bien maîtrisés.' },
    { label: 'Envies',  target: 30, montant: enviesMontant,  actual: Math.round(enviesMontant  / sal * 100), ideal: Math.round(sal * 0.30), color: '#5B7FD4', gradient: 'linear-gradient(to right, #5B7FD4, #8BAEE8)', isFloor: false, info: 'Dépenses plaisir : loisirs, abonnements, restaurants, voyages. Tout ce qui améliore votre quotidien sans être indispensable.', tip: enviesMontant > sal * 0.30 ? 'Vos envies dépassent l\'objectif. Identifiez les postes les moins essentiels à réduire en priorité.' : 'Vos envies sont dans les clous.' },
    { label: 'Épargne', target: 20, montant: epargne,        actual: Math.round(epargne        / sal * 100), ideal: Math.round(sal * 0.20), color: '#7AAAE8', gradient: 'linear-gradient(to right, #7AAAE8, #AAD0F5)', isFloor: true,  info: 'Ce qu\'il reste de votre revenu après toutes vos dépenses. L\'idéal est d\'en mettre au moins 20% de côté chaque mois.', tip: epargne < sal * 0.20 ? `Vous épargnez moins que l'objectif. Réduire vos Besoins ou Envies de ${fmt(Math.round(sal * 0.20 - epargne))} / mois vous permettrait d'atteindre 20%.` : 'Excellent ! Vous épargnez au-dessus de l\'objectif.' },
  ]
})

// ── Score 50/30/20 ───────────────────────────────────────────
const rulePanelOpen     = ref(false)
const ruleInfoPanelOpen = ref(false)
const ruleScore = computed(() => {
  if (!soloSalaire.value) return 0
  const penalties = rule503020.value.map(b => {
    if (b.isFloor) return Math.max(0, b.target - b.actual) // Épargne : pénalité si sous le plancher
    else           return Math.max(0, b.actual - b.target) // Besoins/Envies : pénalité si au-dessus du plafond
  })
  const totalPenalty = penalties.reduce((s, p) => s + p, 0)
  return Math.max(0, Math.round(100 - totalPenalty * 2.5))
})
// Buckets problématiques : Besoins/Envies > target, Épargne < target
const ruleBucketsOver = computed(() =>
  rule503020.value.filter(b => b.isFloor ? b.actual < b.target - 3 : b.actual > b.target + 3).length
)

function ruleActualColor(bucket) {
  if (bucket.isFloor) {
    // Épargne : vert si au-dessus, rouge si en-dessous
    if (bucket.actual > bucket.target + 3) return '#16A34A'
    if (bucket.actual < bucket.target - 3) return '#EF4444'
  } else {
    // Besoins/Envies : rouge si au-dessus du plafond
    if (bucket.actual > bucket.target + 3) return '#EF4444'
  }
  return bucket.color
}

const ruleCfg = computed(() => {
  const s = ruleScore.value
  if (s >= 90) return { label: 'Excellent',          color: '#16A34A' }
  if (s >= 75) return { label: 'Bonne répartition',  color: '#22C55E' }
  if (s >= 55) return { label: 'Acceptable',         color: '#F59E0B' }
  if (s >= 35) return { label: 'À améliorer',        color: '#EF4444' }
  return              { label: 'Déséquilibré',       color: '#DC2626' }
})

// ── Simulateur épargne ───────────────────────────────────────
const simObjectif = ref(0)

// Reset simulateur au changement de foyer
watch(() => store.foyerActifId, () => { simObjectif.value = 0 })
const simMois = computed(() => {
  if (!simObjectif.value || soloReste.value <= 0) return 0
  return Math.ceil(simObjectif.value / soloReste.value)
})
const simDuree = computed(() => {
  const m = simMois.value
  if (!m) return '—'
  const ans = Math.floor(m / 12), mois = m % 12
  if (ans === 0) return `${mois} mois`
  if (mois === 0) return `${ans} an${ans > 1 ? 's' : ''}`
  return `${ans} an${ans > 1 ? 's' : ''} et ${mois} mois`
})
const simDateCible = computed(() => {
  if (!simMois.value) return '—'
  const d = new Date()
  d.setMonth(d.getMonth() + simMois.value)
  return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(d)
})

function fmt(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}
// ── Gauge catégories ────────────────────────────────────────
// ── Filtre gauge par personne ────────────────────────────────
const gaugeFilter = ref('tous') // 'tous' | 'p1' | 'p2'

const gaugeFilterOptions = computed(() => [
  { id: 'tous',  label: 'Tous',                         color: null },
  { id: 'p1',    label: store.personnes[0]?.nom || 'P1', color: '#7C6FCD' },
  { id: 'p2',    label: store.personnes[1]?.nom || 'P2', color: '#4A9EDB' },
])

// Reset filtre si on passe en solo
watch(isSolo, (solo) => { if (solo) gaugeFilter.value = 'tous' })

const gaugeCategoriesFiltered = computed(() => {
  return store.categories
    .map(cat => {
      let montant = 0
      store.depensesActives.forEach(d => {
        if (d.categorieId !== cat.id) return
        const m = gaugeFilter.value === 'p1'
          ? store.toMonthly(d.montantP1 || 0, d.frequence)
          : gaugeFilter.value === 'p2'
            ? store.toMonthly(d.montantP2 || 0, d.frequence)
            : store.toMonthly((d.montantP1||0) + (d.montantP2||0) + (d.montantCommun||0), d.frequence)
        montant += m
      })
      return { nom: cat.nom, couleur: cat.couleur, montant: Math.round(montant) }
    })
    .filter(c => c.montant > 0)
    .sort((a, b) => b.montant - a.montant)
})

const gaugeTotalFiltered = computed(() =>
  gaugeCategoriesFiltered.value.reduce((s, c) => s + c.montant, 0)
)

const gaugeCategories = computed(() => gaugeCategoriesFiltered.value)

// ── Nb alertes optimisation (pour badge CTA) ────────────────
const SEUILS_OPT = { 'Abonnements': 5, 'Transport': 15, 'Alimentation': 20, 'Logement': 40 }

const alertesDetails = computed(() => {
  const total = store.totalDepensesMensuel || 1
  return store.categories
    .filter(cat => {
      const montant = store.depensesParCategorie[cat.id] || 0
      const seuil = SEUILS_OPT[cat.nom]
      return seuil && montant > 0 && Math.round(montant / total * 100) > seuil
    })
    .map(cat => {
      const montant = store.depensesParCategorie[cat.id] || 0
      return {
        nom: cat.nom,
        pct: Math.round(montant / total * 100),
        seuil: SEUILS_OPT[cat.nom],
      }
    })
})

const nbAlertesOptimisation = computed(() => alertesDetails.value.length)



</script>

<style scoped>
.dash { display: flex; flex-direction: column; gap: 16px; width: 100%; }

/* KPIs */
.dash__kpis {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
@media (max-width: 900px) { .dash__kpis { grid-template-columns: 1fr; } }

.dash__kpi-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.dash__kpi-group--solo {
  grid-template-columns: 1fr;
}

.dash__kpi {
  padding: 14px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
  box-sizing: border-box;
  position: relative;
  min-width: 0;
}
.dash__kpi:not(:last-child) {
  border-right: 1px solid var(--border);
}
.dash__kpi-donut {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
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

.dash__title-row { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.dash__title-left { display: flex; align-items: center; gap: 8px; }

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


.dash__ccard-chart { flex: 1; position: relative; min-height: 200px; display: flex; flex-direction: column; gap: 8px; }

/* Filtres gauge */
.gauge__filters { display: flex; gap: 6px; flex-wrap: wrap; }
.gauge__filter-tag {
  display: inline-flex; align-items: center; gap: 5px;
  height: 26px; padding: 0 10px;
  border: 1px solid var(--border); border-radius: 99px;
  background: transparent; font-size: 12px; font-weight: 500;
  color: var(--muted-foreground); font-family: inherit;
  cursor: pointer; transition: all 120ms;
}
.gauge__filter-tag:hover { background: var(--muted); color: var(--foreground); }
.gauge__filter-tag--active {
  font-weight: 600;
  border-color: transparent;
  background: var(--primary);
  color: var(--primary-foreground);
}
.gauge__filter-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

.dash__right-col { display: grid; grid-template-rows: 1fr auto; gap: 12px; height: 100%; }

/* Alertes sous le graphique */
.dash__alerts {
  border-top: 1px solid var(--border);
  padding-top: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin-top: 4px;
  background: #FFF7ED;
  border: 1px solid #FDE68A;
  border-radius: 8px;
  cursor: pointer;
  transition: background 120ms;
}
.dash__alerts:hover { background: #FEF3C7; }
.dash__alert-icon {
  width: 28px; height: 28px; border-radius: 6px;
  background: #FEE2A0; color: #D97706;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.dash__alert-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.dash__alert-title { font-size: 12px; font-weight: 600; color: var(--foreground); }
.dash__alert-names { font-size: 11px; color: var(--muted-foreground); }
.dash__alert-cta {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 500; color: #92400E;
  white-space: nowrap; flex-shrink: 0;
}
.dash__alert-badge {
  background: #D97706; color: #fff;
  font-size: 10px; font-weight: 700;
  border-radius: 20px; padding: 1px 6px;
}

/* CTA inline titre */
.btn-optimiser-inline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--foreground);
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  white-space: nowrap;
}
.btn-optimiser-inline:hover { background: var(--muted); }
.btn-badge {
  background: #EF5350;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  border-radius: 20px;
  padding: 1px 6px;
  margin-left: 2px;
}

/* Empty state */
.dash__empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 8px; height: 100%; min-height: 220px; text-align: center; padding: 24px;
}
.dash__empty-icon { color: var(--border); }
.dash__empty-title { font-size: 13px; font-weight: 600; color: var(--muted-foreground); }
.dash__empty-sub { font-size: 12px; color: var(--muted-foreground); opacity: 0.7; max-width: 240px; line-height: 1.5; }

/* ── Solo cards ─────────────────────────────────── */
.solo-card {
  background: var(--card); border: 1px solid var(--border);
  border-radius: 12px; padding: 16px 20px;
  display: flex; flex-direction: column; gap: 12px;
  box-shadow: var(--shadow-xs);
}
.solo-card__header { display: flex; justify-content: space-between; align-items: center; }
.solo-card__title-row { display: flex; align-items: center; gap: 8px; }
.solo-card__title { font-size: 14px; font-weight: 600; color: var(--foreground); }
.solo-card__sub   { font-size: 12px; color: var(--muted-foreground); }
.solo-card__empty { padding: 12px 0; text-align: center; }
.solo-card__empty-txt { font-size: 12px; color: var(--muted-foreground); }

/* Règle 50/30/20 — footer CTA */
.rule__footer {
  display: flex; flex-direction: row; align-items: center; justify-content: space-between;
  gap: 12px; padding: 12px 14px;
  background: var(--muted); border: 1px solid var(--border); border-radius: 8px;
}
.rule__footer-title { font-size: 12px; font-weight: 600; color: var(--foreground); flex-shrink: 0; }
.rule__footer-ok    { display: inline-flex; align-items: center; gap: 5px; color: #16A34A; font-size: 12px; font-weight: 500; }
.rule__footer-cta {
  border: 1px solid var(--border); border-radius: 8px; background: var(--card);
  padding: 6px 12px; font-size: 12px; font-weight: 500; color: var(--foreground);
  cursor: pointer; flex-shrink: 0; white-space: nowrap; font-family: inherit;
  transition: background 0.15s; display: inline-flex; align-items: center;
}
.rule__footer-cta:hover { background: var(--muted); }
.rule__footer-badge {
  background: #EF5350; color: #fff; font-size: 10px; font-weight: 700;
  border-radius: 20px; padding: 1px 6px; margin-left: 6px;
}

/* Règle 50/30/20 — header score */
.rule__header-right { display: flex; align-items: center; gap: 10px; }
.rule__score-block  { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }
.rule__score-val    { font-size: 22px; font-weight: 700; line-height: 1; }
.rule__score-max    { font-size: 11px; font-weight: 500; color: var(--muted-foreground); margin-left: 1px; }
.rule__score-label  { font-size: 10px; font-weight: 500; }
.rule__score-with-info { display: flex; align-items: center; gap: 8px; }
.rule__info-score-btn {
  display: flex; align-items: center; justify-content: center;
  width: 20px; height: 20px; border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--muted-foreground);
  cursor: pointer; padding: 0; flex-shrink: 0;
  transition: background 150ms, color 150ms;
}
.rule__info-score-btn:hover { background: var(--muted); color: var(--foreground); }

/* Info panel */
.rule-info__body { display: flex; flex-direction: column; gap: 0; padding: 0; }
.rule-info__section {
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
  display: flex; flex-direction: column; gap: 10px;
}
.rule-info__icon-row { display: flex; align-items: center; gap: 8px; }
.rule-info__dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.rule-info__heading { font-size: 14px; font-weight: 600; color: var(--foreground); }
.rule-info__text { font-size: 13px; color: var(--muted-foreground); line-height: 1.6; margin: 0; }
.rule-info__text strong { color: var(--foreground); }
.rule-info__tip {
  font-size: 12px; color: var(--foreground);
  background: var(--muted); border-radius: var(--radius-md);
  padding: 8px 12px; line-height: 1.5;
}
.rule-info__score-explainer {
  padding: 20px 24px;
  display: flex; flex-direction: column; gap: 8px;
}
.rule-info__score-title { font-size: 13px; font-weight: 600; color: var(--foreground); }
.rule-info__score-text  { font-size: 13px; color: var(--muted-foreground); line-height: 1.6; margin: 0; }
.rule-info__score-text em { color: #16A34A; font-style: normal; font-weight: 600; }

.rule__score-bar-track { height: 5px; background: var(--muted); border-radius: 99px; overflow: hidden; }
.rule__score-bar-fill  { height: 100%; border-radius: 99px; transition: width 0.5s ease; }

/* Règle 50/30/20 — rows */
.rule__rows { display: flex; flex-direction: column; gap: 16px; }
.rule__row  { display: flex; flex-direction: column; gap: 6px; }
.rule__row-head { display: flex; align-items: center; gap: 6px; }
.rule__label  { font-size: 13px; font-weight: 600; color: var(--foreground); }
.rule__info-btn {
  position: relative; display: inline-flex; align-items: center;
  color: var(--muted-foreground); cursor: default; flex-shrink: 0;
}
.rule__tooltip {
  display: none;
  position: absolute; bottom: calc(100% + 6px); left: 50%; transform: translateX(-50%);
  background: #18181B; color: #fff; font-size: 11px; line-height: 1.5;
  padding: 8px 10px; border-radius: 6px; width: 220px; white-space: normal;
  text-align: left; font-weight: 400; z-index: 100;
  pointer-events: none;
}
.rule__info-btn:hover .rule__tooltip { display: block; }
.rule__target { font-size: 11px; color: var(--muted-foreground); margin-left: auto; }
.rule__actual { font-size: 13px; font-weight: 700; display: inline-flex; align-items: center; justify-content: flex-end; gap: 5px; margin-left: auto; }
.rule__actual-vs     { font-size: 10px; font-weight: 400; color: var(--muted-foreground); }
.rule__actual-target { font-size: 13px; font-weight: 700; color: var(--foreground); }
.rule__track  { height: 8px; background: var(--muted); border-radius: 99px; overflow: visible; position: relative; }
.rule__fill   { position: absolute; top: 0; left: 0; height: 100%; border-radius: 99px; transition: width 0.5s ease; }
.rule__fill--over { border-radius: 0 99px 99px 0; }
.rule__target-line {
  position: absolute; top: -5px; bottom: -5px;
  width: 3px; background: var(--foreground); border-radius: 2px; opacity: 0.55;
  transform: translateX(-50%); z-index: 2;
}
.rule__amounts { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--muted-foreground); }
.rule__amount-actual { font-weight: 600; color: var(--foreground); }
.rule__amount-sep { opacity: 0.5; }
.rule__amount-ideal { font-style: italic; }

/* Simulateur épargne */
.sim__body { display: flex; flex-direction: column; gap: 12px; }
.sim__input-wrap { display: flex; flex-direction: column; gap: 5px; }
.sim__label { font-size: 11px; font-weight: 500; color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.04em; }
.sim__input-row { display: flex; align-items: center; background: var(--muted); border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
.sim__input {
  flex: 1; border: none; background: transparent; padding: 10px 12px;
  font-size: 18px; font-weight: 600; color: var(--foreground); font-family: inherit;
  outline: none;
}
.sim__suffix { padding: 0 12px 0 0; font-size: 16px; color: var(--muted-foreground); }
.sim__result { display: flex; flex-direction: column; gap: 10px; }
.sim__result-main { display: flex; flex-direction: column; gap: 2px; }
.sim__result-val  { font-size: 22px; font-weight: 700; color: #7C6FCD; }
.sim__result-sub  { font-size: 12px; color: var(--muted-foreground); }
.sim__result-detail { display: flex; flex-direction: column; gap: 0; border-top: 1px solid var(--border); padding-top: 10px; }
.sim__detail-row { display: flex; justify-content: space-between; align-items: center; font-size: 12px; padding: 6px 0; }
.sim__detail-row:not(:last-child) { border-bottom: 1px solid var(--border); }
.sim__detail-val { font-weight: 600; color: var(--foreground); }
.sim__no-epargne {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: #EF4444; font-weight: 500;
  background: #FEF2F2; border-radius: 6px; padding: 8px 10px;
}

/* ── Side panel 50/30/20 ─────────────────────── */
.rule-panel-enter-active, .rule-panel-leave-active { transition: opacity 0.2s ease; }
.rule-panel-enter-active .rule-panel, .rule-panel-leave-active .rule-panel { transition: transform 0.25s ease; }
.rule-panel-enter-from, .rule-panel-leave-to { opacity: 0; }
.rule-panel-enter-from .rule-panel, .rule-panel-leave-to .rule-panel { transform: translateX(100%); }

.rule-panel__overlay { position: fixed; inset: 0; background: rgba(48,41,39,0.28); z-index: 500; display: flex; justify-content: flex-end; }
.rule-panel { width: 480px; height: 100%; background: var(--popover); box-shadow: -4px 0 32px rgba(48,41,39,0.12); display: flex; flex-direction: column; }
.rule-panel__header { display: flex; justify-content: space-between; align-items: flex-start; padding: 20px 24px 16px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.rule-panel__title { font-size: 16px; font-weight: 600; color: var(--foreground); }
.rule-panel__sub   { font-size: 12px; color: var(--muted-foreground); margin-top: 3px; }
.rule-panel__close { background: none; border: none; font-size: 16px; cursor: pointer; color: var(--muted-foreground); padding: 4px; font-family: inherit; }
.rule-panel__close:hover { color: var(--foreground); }
.rule-panel__summary { display: flex; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.rule-panel__summary-item { flex: 1; padding: 12px 24px; display: flex; flex-direction: column; gap: 2px; border-right: 1px solid var(--border); }
.rule-panel__summary-item:last-child { border-right: none; }
.rule-panel__summary-label { font-size: 11px; color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.04em; }
.rule-panel__summary-val   { font-size: 18px; font-weight: 700; color: var(--foreground); }
.rule-panel__body { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 14px; }
.rule-panel__bucket { background: var(--muted); border-radius: 10px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }
.rule-panel__bucket-head { display: flex; align-items: center; gap: 8px; }
.rule-panel__bucket-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.rule-panel__bucket-name { font-size: 14px; font-weight: 600; color: var(--foreground); flex: 1; }
.rule-panel__bucket-badge { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 99px; }
.badge--ok   { background: #DCFCE7; color: #16A34A; }
.badge--warn { background: #FEF9C3; color: #CA8A04; }
.badge--low  { background: #EFF6FF; color: #2563EB; }
.rule-panel__bucket-stats { background: var(--card); border-radius: 8px; padding: 10px 12px; display: flex; flex-direction: column; gap: 0; }
.rule-panel__stat-row { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: var(--muted-foreground); padding: 6px 0; }
.rule-panel__stat-row:not(:last-child) { border-bottom: 1px solid var(--border); }
.rule-panel__bucket-tip { font-size: 12px; color: var(--muted-foreground); font-style: italic; background: var(--card); border-radius: 6px; padding: 8px 10px; display: flex; align-items: flex-start; gap: 6px; line-height: 1.5; }

/* Bottom grid */
.dash__bottom-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 900px) { .dash__bottom-grid { grid-template-columns: 1fr; } }
.dash__bottom-card { min-height: 320px; display: flex; flex-direction: column; }
</style>
