<template>
  <div class="eq">

    <!-- Score header -->
    <div class="eq__header">
      <div class="eq__score-left">
        <div class="eq__icon-cartouche">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
            <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
            <path d="M7 21h10"/>
            <path d="M12 3v18"/>
            <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
          </svg>
        </div>
        <span class="eq__title">Équité du couple</span>
      </div>
      <div class="eq__score-right">
        <!-- Score réel -->
        <div v-if="basePct > 0" class="eq__score-block">
          <div class="eq__score-val" :style="{ color: cfg.color }">
            {{ score }}<span class="eq__score-max">/100</span>
          </div>
          <div class="eq__status" :style="{ color: cfg.color }">{{ cfg.label }}</div>
        </div>
        <!-- Placeholder : pas encore de dépenses -->
        <div v-else class="eq__score-block">
          <div class="eq__score-val eq__score-val--empty">
            0<span class="eq__score-max">/100</span>
          </div>
          <div class="eq__status eq__status--empty">Aucune donnée</div>
        </div>
      </div>
    </div>

    <!-- Empty state : pas encore de dépenses -->
    <template v-if="basePct === 0">
      <div class="eq__empty">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="eq__empty-icon"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
        <span class="eq__empty-title">Aucune charge à analyser</span>
        <span class="eq__empty-sub">Le score d'équité s'affiche dès que vous renseignez des dépenses partagées</span>
      </div>
    </template>

    <template v-else>
      <!-- Barre de progression -->
      <div class="eq__bar-track">
        <div class="eq__bar-fill" :style="{ width: score + '%', background: cfg.color }"></div>
      </div>

      <!-- Message équité — juste après la barre -->
      <div class="eq__message" :style="{ background: cfg.bg, color: cfg.color }">
        {{ cfg.message }}
      </div>

      <!-- Détail par personne + shared card en bas -->
      <div class="eq__detail">
        <div v-for="(row, i) in detailRows" :key="i" class="eq__detail-row">
          <span class="eq__detail-dot" :style="{ background: row.color }"></span>
          <span class="eq__detail-name">{{ row.nom }}</span>
          <span class="eq__detail-info">
            <strong>{{ row.pctCharges }}%</strong> charges ·
            <strong>{{ row.pctRevenus }}%</strong> revenus
          </span>
          <span class="eq__detail-tag" :class="row.tagClass">{{ row.tagLabel }}</span>
        </div>
      </div>

      <!-- Footer gris collé en bas -->
      <div class="eq__shared-card">
        <span class="eq__shared-title">Dépenses partagées à rééquilibrer</span>
        <span v-if="recos.length === 0 && score >= 78" class="eq__recos-empty">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Tout équilibré
        </span>
        <span v-else-if="recos.length === 0 && score < 78" class="eq__recos-none">
          Aucune dépense n'est actuellement partagée entre les deux
        </span>
        <button v-else class="eq__cta" @click="panelOpen = true">
          Dépenses à rééquilibrer
          <span class="eq__cta-badge">{{ recos.length }}</span>
        </button>
      </div>
    </template>

    <!-- Side panel — toutes les recommandations -->
    <Teleport to="body">
      <Transition name="eq-panel">
        <div v-if="panelOpen" class="eq-panel__overlay" @click.self="panelOpen = false">
          <div class="eq-panel">
            <div class="eq-panel__header">
              <div>
                <div class="eq-panel__title">Lignes partagées</div>
                <div class="eq-panel__sub">{{ recos.length }} ligne{{ recos.length > 1 ? 's' : '' }} à rééquilibrer selon vos revenus</div>
              </div>
              <button class="eq-panel__close" @click="panelOpen = false">✕</button>
            </div>

            <div class="eq-panel__summary">
              <div class="eq-panel__summary-item">
                <span class="eq-panel__summary-label">Potentiel de rééquilibrage</span>
                <span class="eq-panel__summary-val">{{ fmtMontant(totalPotentiel) }} / an</span>
              </div>
              <div class="eq-panel__summary-item">
                <span class="eq-panel__summary-label">Score actuel</span>
                <span class="eq-panel__summary-val" :style="{ color: cfg.color }">{{ score }}/100</span>
              </div>
            </div>

            <div class="eq-panel__body">
              <div v-for="r in recos" :key="r.id" class="eq-panel__reco">
                <div class="eq-panel__reco-top">
                  <span class="eq-panel__reco-nom">{{ r.nom }}</span>
                  <span class="eq-panel__reco-badge" :class="r.badgeClass">{{ r.badgeLabel }}</span>
                </div>
                <div class="eq-panel__persons">
                  <div class="eq-panel__person eq-panel__person--p1">
                    <span class="eq-panel__person-dot"></span>
                    <div class="eq-panel__person-body">
                      <div class="eq-panel__person-row1">
                        <span class="eq-panel__person-name">{{ p1.nom }}</span>
                        <span class="eq-panel__person-amount">{{ r.m1 }} €/mois</span>
                      </div>
                      <div class="eq-panel__person-row2">
                        <span class="eq-panel__person-pct">{{ r.pctP1 }}% de la ligne</span>
                        <span class="eq-panel__person-sep">·</span>
                        <span class="eq-panel__person-ideal">Idéal : {{ r.idealP1 }} €</span>
                      </div>
                    </div>
                  </div>
                  <div class="eq-panel__person eq-panel__person--p2">
                    <span class="eq-panel__person-dot"></span>
                    <div class="eq-panel__person-body">
                      <div class="eq-panel__person-row1">
                        <span class="eq-panel__person-name">{{ p2.nom }}</span>
                        <span class="eq-panel__person-amount">{{ r.m2 }} €/mois</span>
                      </div>
                      <div class="eq-panel__person-row2">
                        <span class="eq-panel__person-pct">{{ r.pctP2 }}% de la ligne</span>
                        <span class="eq-panel__person-sep">·</span>
                        <span class="eq-panel__person-ideal">Idéal : {{ r.idealP2 }} €</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="eq-panel__suggestion">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {{ r.suggestion }}
                </div>
                <button class="eq-panel__apply" type="button" @click="applyReco(r)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Appliquer la répartition
                </button>
              </div>

              <!-- Section loisirs -->
              <div v-if="leisureInsight.hasData" class="eq-panel__leisure">
                <div class="eq-panel__leisure-header">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 6v6l4 2"/></svg>
                  Loisirs — budget personnel
                  <span v-if="leisureInsight.disparity" class="eq-panel__leisure-alert">Écart notable</span>
                </div>
                <div class="eq-panel__leisure-row">
                  <div class="eq-panel__leisure-person eq-panel__leisure-person--p1">
                    <span class="eq-panel__leisure-dot"></span>
                    <div class="eq-panel__person-body">
                      <div class="eq-panel__person-row1">
                        <span class="eq-panel__leisure-name">{{ p1.nom }}</span>
                        <span class="eq-panel__leisure-amount">{{ leisureInsight.totalP1 }} €/mois</span>
                      </div>
                      <div class="eq-panel__person-row2">
                        <span class="eq-panel__leisure-pct" :class="leisureInsight.pct1 < 3 ? 'eq-panel__leisure-pct--low' : ''">{{ leisureInsight.pct1 }}% de son revenu</span>
                      </div>
                    </div>
                  </div>
                  <div class="eq-panel__leisure-person eq-panel__leisure-person--p2">
                    <span class="eq-panel__leisure-dot"></span>
                    <div class="eq-panel__person-body">
                      <div class="eq-panel__person-row1">
                        <span class="eq-panel__leisure-name">{{ p2.nom }}</span>
                        <span class="eq-panel__leisure-amount">{{ leisureInsight.totalP2 }} €/mois</span>
                      </div>
                      <div class="eq-panel__person-row2">
                        <span class="eq-panel__leisure-pct" :class="leisureInsight.pct2 < 3 ? 'eq-panel__leisure-pct--low' : ''">{{ leisureInsight.pct2 }}% de son revenu</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p v-if="leisureInsight.disparity" class="eq-panel__leisure-note">
                  <template v-if="leisureInsight.pct1 < leisureInsight.pct2">
                    {{ p1.nom }} dispose de moins de marge pour les loisirs ({{ leisureInsight.pct1 }}% de son revenu vs {{ leisureInsight.pct2 }}% pour {{ p2.nom }}). Ses charges fixes absorbent peut-être une trop grande part de ses revenus.
                  </template>
                  <template v-else>
                    {{ p2.nom }} dispose de moins de marge pour les loisirs ({{ leisureInsight.pct2 }}% de son revenu vs {{ leisureInsight.pct1 }}% pour {{ p1.nom }}). Ses charges fixes absorbent peut-être une trop grande part de ses revenus.
                  </template>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useBudgetStore, toMonthly } from '../stores/budget'
import { useStorage } from '../composables/useStorage'

const store     = useBudgetStore()
const { scheduleAutoSave } = useStorage()
const panelOpen = ref(false)

const p1 = computed(() => store.personnes[0])
const p2 = computed(() => store.personnes[1])

const totalMensuelP1     = computed(() => store.totalMensuelP1)
const totalMensuelP2     = computed(() => store.totalMensuelP2)
const totalMensuelCommun = computed(() => store.totalMensuelCommun)
const basePct            = computed(() => totalMensuelP1.value + totalMensuelP2.value + totalMensuelCommun.value)
const pctChargesP1       = computed(() => basePct.value > 0 ? Math.round((totalMensuelP1.value + totalMensuelCommun.value / 2) / basePct.value * 100) : 50)
const pctChargesP2       = computed(() => 100 - pctChargesP1.value)

const totalRevenus = computed(() => store.totalRevenus)
const partFoyerP1  = computed(() => totalRevenus.value > 0 ? (p1.value?.salaire || 0) / totalRevenus.value * 100 : 50)
const partFoyerP2  = computed(() => 100 - partFoyerP1.value)

const ecartP1 = computed(() => pctChargesP1.value - Math.round(partFoyerP1.value))
const ecartP2 = computed(() => pctChargesP2.value - Math.round(partFoyerP2.value))

const score = computed(() => {
  const e = Math.max(Math.abs(ecartP1.value), Math.abs(ecartP2.value))
  return Math.max(0, Math.min(100, Math.round(100 - e * 4)))
})

const cfg = computed(() => {
  const s = score.value, n1 = p1.value?.nom || 'P1', n2 = p2.value?.nom || 'P2'
  if (s >= 92) return { label: 'Parfaitement équilibré',  color: '#16A34A', bg: '#F0FDF4', message: `${n1} et ${n2} contribuent chacun selon leurs moyens.` }
  if (s >= 78) return { label: 'Bonne répartition',        color: '#22C55E', bg: '#F0FDF4', message: `Léger ajustement possible, mais l'essentiel est juste.` }
  if (s >= 60) return { label: 'Répartition acceptable',   color: '#F59E0B', bg: '#FFFBEB', message: `Quelques écarts à corriger entre ${n1} et ${n2}.` }
  if (s >= 40) return { label: 'Déséquilibre notable',     color: '#EF4444', bg: '#FEF2F2', message: `La répartition mérite d'être revue sur certains postes.` }
  return           { label: 'Déséquilibre significatif',  color: '#DC2626', bg: '#FEF2F2', message: `Déséquilibre important — consultez les lignes ci-dessous.` }
})

const detailRows = computed(() => [
  {
    nom: p1.value?.nom, color: '#7C6FCD',
    pctCharges: pctChargesP1.value, pctRevenus: Math.round(partFoyerP1.value),
    tagClass: Math.abs(ecartP1.value) <= 3 ? 'eq__tag--ok' : 'eq__tag--warn',
    tagLabel: Math.abs(ecartP1.value) <= 3 ? 'Juste' : `${ecartP1.value > 0 ? '+' : ''}${ecartP1.value}%`,
  },
  {
    nom: p2.value?.nom, color: '#4A9EDB',
    pctCharges: pctChargesP2.value, pctRevenus: Math.round(partFoyerP2.value),
    tagClass: Math.abs(ecartP2.value) <= 3 ? 'eq__tag--ok' : 'eq__tag--warn',
    tagLabel: Math.abs(ecartP2.value) <= 3 ? 'Juste' : `${ecartP2.value > 0 ? '+' : ''}${ecartP2.value}%`,
  },
])

// Catégories loisir — exclues des recos (choix personnel, pas une charge partagée)
const CATS_LOISIR = ['Loisirs', 'Loisir']

// Recommandations : uniquement lignes partagées hors loisirs
const recos = computed(() => {
  return store.depenses
    .filter(d => {
      if (!d.actif || !(d.montantP1 > 0 && d.montantP2 > 0)) return false
      const cat = store.categories.find(c => c.id === d.categorieId)
      return !(cat && CATS_LOISIR.includes(cat.nom))
    })
    .map(d => {
      const m1    = toMonthly(d.montantP1, d.frequence)
      const m2    = toMonthly(d.montantP2, d.frequence)
      const total = m1 + m2
      const pctActP1 = m1 / total
      const idealP1  = partFoyerP1.value / 100

      const ecartAbs = Math.abs(pctActP1 - idealP1)
      if (ecartAbs < 0.03) return null   // < 3% d'écart → ok

      const mIdealP1   = Math.round(total * idealP1)
      const mIdealP2   = Math.round(total * (1 - idealP1))
      const ajust       = Math.round(Math.abs(m1 - mIdealP1))
      const surpayeur   = pctActP1 > idealP1 ? p1.value.nom : p2.value.nom
      const bénéficiaire = pctActP1 > idealP1 ? p2.value.nom : p1.value.nom

      return {
        id: d.id,
        nom: d.nom,
        frequence: d.frequence,
        m1: Math.round(m1), m2: Math.round(m2),
        pctP1: Math.round(pctActP1 * 100), pctP2: Math.round((1 - pctActP1) * 100),
        idealP1: mIdealP1, idealP2: mIdealP2,
        ecartAbs,
        potentielAnnuel: ajust * 12,
        badgeLabel: ecartAbs > 0.15 ? 'Fort déséquilibre' : 'Léger écart',
        badgeClass: ecartAbs > 0.15 ? 'eq__badge--red' : 'eq__badge--yellow',
        suggestion: `${surpayeur} paie ~${ajust} €/mois de trop → réduire et passer à ${surpayeur === p1.value.nom ? mIdealP1 : mIdealP2} €`,
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.ecartAbs - a.ecartAbs)
})

const totalPotentiel  = computed(() => recos.value.reduce((s, r) => s + r.potentielAnnuel, 0))

// Loisirs : budget par personne et % du revenu
const leisureInsight = computed(() => {
  const loisirDeps = store.depenses.filter(d => {
    if (!d.actif) return false
    const cat = store.categories.find(c => c.id === d.categorieId)
    return cat && CATS_LOISIR.includes(cat.nom)
  })
  const totalP1 = loisirDeps.reduce((s, d) => s + toMonthly(d.montantP1 || 0, d.frequence), 0)
  const totalP2 = loisirDeps.reduce((s, d) => s + toMonthly(d.montantP2 || 0, d.frequence), 0)
  const sal1 = p1.value?.salaire || 0
  const sal2 = p2.value?.salaire || 0
  const pct1 = sal1 > 0 ? Math.round(totalP1 / sal1 * 100) : 0
  const pct2 = sal2 > 0 ? Math.round(totalP2 / sal2 * 100) : 0
  const disparity = Math.abs(pct1 - pct2) >= 5
  return { totalP1: Math.round(totalP1), totalP2: Math.round(totalP2), pct1, pct2, disparity, hasData: totalP1 > 0 || totalP2 > 0 }
})

function fmtMontant(v) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v)
}

function fromMonthly(monthlyAmount, freq) {
  switch (freq) {
    case 'hebdomadaire': return Math.round(monthlyAmount * 12 / 52)
    case 'trimestriel':  return Math.round(monthlyAmount * 3)
    case 'annuel':       return Math.round(monthlyAmount * 12)
    default:             return Math.round(monthlyAmount)
  }
}

function applyReco(r) {
  store.updateDepense(r.id, {
    montantP1: fromMonthly(r.idealP1, r.frequence),
    montantP2: fromMonthly(r.idealP2, r.frequence),
  })
  scheduleAutoSave()
  store.showNotification(`${r.nom} rééquilibrée`, 'success')
}
</script>

<style scoped>
.eq {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: var(--shadow-xs);
}

/* Header score */
.eq__header        { display: flex; justify-content: space-between; align-items: center; }
.eq__score-left    { display: flex; align-items: center; gap: 8px; }
.eq__score-right   { display: flex; align-items: center; gap: 6px; }
.eq__score-block   { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; }

.eq__info-btn {
  display: flex; align-items: center; justify-content: center;
  width: 20px; height: 20px; border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--muted-foreground);
  cursor: pointer;
  padding: 0;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
  margin-bottom: 2px;
}
.eq__info-btn:hover { background: var(--muted); color: var(--foreground); }

.eq__icon-cartouche {
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
.eq__title         { font-size: 14px; font-weight: 600; color: var(--foreground); }
.eq__status        { font-size: 10px; font-weight: 500; text-align: right; }
.eq__score-val     { font-size: 26px; font-weight: 700; line-height: 1; }
.eq__score-val--empty { color: var(--muted-foreground) !important; }
.eq__score-max     { font-size: 12px; font-weight: 500; color: var(--muted-foreground); margin-left: 1px; }
.eq__status--empty { color: var(--muted-foreground) !important; }

/* Barre */
.eq__bar-track { height: 6px; background: var(--muted); border-radius: 99px; overflow: hidden; }
.eq__bar-fill  { height: 100%; border-radius: 99px; transition: width 0.5s ease; }

/* Détail */
.eq__detail { display: flex; flex-direction: column; gap: 0; flex: 1; }
.eq__detail-row  { display: flex; align-items: center; gap: 7px; font-size: 12px; padding: 14px 0; border-bottom: 1px solid var(--border); }
.eq__detail-row:last-child { border-bottom: none; }
.eq__detail-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.eq__detail-name { font-weight: 600; color: var(--foreground); flex: 1; }
.eq__detail-info { color: var(--muted-foreground); margin-left: auto; flex-shrink: 0; text-align: right; }
.eq__detail-info strong { color: var(--foreground); }
.eq__detail-tag  { font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 99px; flex-shrink: 0; }
.eq__tag--ok   { background: #DCFCE7; color: #16A34A; }
.eq__tag--warn { background: #FEF9C3; color: #CA8A04; }


/* Empty state */
.eq__empty {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 6px; text-align: center; padding: 20px; min-height: 120px;
}
.eq__empty-icon { color: var(--border); }
.eq__empty-title { font-size: 12px; font-weight: 600; color: var(--muted-foreground); }
.eq__empty-sub { font-size: 11px; color: var(--muted-foreground); opacity: 0.7; max-width: 210px; line-height: 1.4; }

/* Recommandations */
.eq__shared-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 12px 0 16px;
  padding: 12px 14px;
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: 8px;
}
.eq__shared-title { font-size: 12px; font-weight: 600; color: var(--foreground); flex-shrink: 0; }
.eq__recos-empty  { font-size: 12px; color: var(--muted-foreground); }
.eq__recos-none   { font-size: 12px; color: #DC2626; font-style: italic; }

.eq__cta-badge {
  background: #EF5350;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: 20px;
  padding: 1px 6px;
  margin-left: 4px;
}

.eq__cta {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--card);
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  color: var(--foreground);
  cursor: pointer;
  width: auto;
  flex-shrink: 0;
  white-space: nowrap;
  font-family: inherit;
  transition: background 0.15s;
  display: inline-flex;
  align-items: center;
}
.eq__cta:hover { background: var(--muted); }

.eq__message { font-size: 12px; border-radius: 8px; padding: 8px 12px; line-height: 1.4; }

/* ── Info panel ── */
.eq-info-panel { width: 520px; }
.eq-info-body  { padding: 24px; display: flex; flex-direction: column; gap: 24px; }

.eq-info-section { display: flex; flex-direction: column; gap: 10px; }
.eq-info-section-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; font-weight: 600; color: var(--foreground);
}
.eq-info-icon {
  width: 26px; height: 26px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.eq-info-icon--blue   { background: #EFF6FF; color: #2563EB; }
.eq-info-icon--purple { background: #F3F0FF; color: #7C6FCD; }
.eq-info-icon--green  { background: #F0FDF4; color: #16A34A; }

.eq-info-text { font-size: 13px; color: var(--muted-foreground); line-height: 1.6; margin: 0; }
.eq-info-text--sm { font-size: 12px; }
.eq-info-text strong { color: var(--foreground); }

.eq-info-formula {
  background: var(--muted); border-radius: 8px; padding: 12px 14px;
  display: flex; flex-direction: column; gap: 6px;
}
.eq-info-formula-row { display: flex; gap: 12px; font-size: 12px; font-family: monospace; }
.eq-info-formula-label { color: var(--muted-foreground); width: 44px; flex-shrink: 0; }
.eq-info-formula-val   { color: var(--foreground); font-weight: 500; }

.eq-info-intro {
  font-size: 13px; color: var(--muted-foreground); line-height: 1.6; margin: 0;
}
.eq-info-intro strong { color: var(--foreground); }

.eq-info-cases { display: flex; flex-direction: column; gap: 10px; }
.eq-info-case {
  display: flex; gap: 14px; align-items: flex-start;
  background: var(--muted); border-radius: 8px; padding: 12px 14px;
}
.eq-info-case-score {
  min-width: 52px; font-size: 22px; font-weight: 800; line-height: 1;
  flex-shrink: 0; padding-top: 2px;
}
.eq-info-case-score span { font-size: 12px; font-weight: 500; opacity: 0.6; }
.eq-info-case-score--green { color: #16A34A; }
.eq-info-case-score--yellow { color: #D97706; }
.eq-info-case-score--red    { color: #DC2626; }
.eq-info-case strong { font-size: 13px; color: var(--foreground); display: block; margin-bottom: 3px; }
.eq-info-case p { font-size: 12px; color: var(--muted-foreground); line-height: 1.5; margin: 0; }

/* ── Side panel ── */
.eq-panel-enter-active, .eq-panel-leave-active { transition: opacity 0.2s ease; }
.eq-panel-enter-active .eq-panel, .eq-panel-leave-active .eq-panel { transition: transform 0.25s ease; }
.eq-panel-enter-from, .eq-panel-leave-to { opacity: 0; }
.eq-panel-enter-from .eq-panel, .eq-panel-leave-to .eq-panel { transform: translateX(100%); }

.eq-panel__overlay {
  position: fixed; inset: 0; background: rgba(48,41,39,0.28); z-index: 500;
  display: flex; justify-content: flex-end;
}
.eq-panel {
  width: 560px; height: 100%; background: var(--popover);
  box-shadow: -4px 0 32px rgba(48,41,39,0.12);
  display: flex; flex-direction: column;
}
.eq-panel__header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 20px 24px 16px; border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.eq-panel__title { font-size: 16px; font-weight: 600; color: var(--foreground); }
.eq-panel__sub   { font-size: 12px; color: var(--muted-foreground); margin-top: 3px; }
.eq-panel__close {
  background: none; border: none; font-size: 16px; cursor: pointer;
  color: var(--muted-foreground); padding: 4px; font-family: inherit;
}
.eq-panel__close:hover { color: var(--foreground); }

.eq-panel__summary {
  display: flex; gap: 0; border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.eq-panel__summary-item {
  flex: 1; padding: 12px 24px;
  display: flex; flex-direction: column; gap: 2px;
  border-right: 1px solid var(--border);
}
.eq-panel__summary-item:last-child { border-right: none; }
.eq-panel__summary-label { font-size: 11px; color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.04em; }
.eq-panel__summary-val   { font-size: 18px; font-weight: 700; color: var(--foreground); }

.eq-panel__body { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }

.eq-panel__reco { background: var(--muted); border-radius: 10px; padding: 14px 16px; display: flex; flex-direction: column; gap: 10px; }
.eq-panel__reco-top    { display: flex; justify-content: space-between; align-items: center; }
.eq-panel__reco-nom    { font-size: 14px; font-weight: 600; color: var(--foreground); }
.eq-panel__reco-badge  { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 99px; }
.eq-panel__persons     { display: flex; flex-direction: column; gap: 8px; }
.eq-panel__person {
  display: flex; align-items: flex-start; gap: 8px;
}
.eq-panel__person-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 4px;
}
.eq-panel__person--p1 .eq-panel__person-dot { background: #7C6FCD; }
.eq-panel__person--p2 .eq-panel__person-dot { background: #4A9EDB; }
.eq-panel__person-body   { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.eq-panel__person-row1   { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; min-width: 0; }
.eq-panel__person-row2   { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.eq-panel__person-name   { font-size: 12px; font-weight: 600; color: var(--foreground); min-width: 0; }
.eq-panel__person-amount { font-size: 13px; font-weight: 700; color: var(--foreground); flex-shrink: 0; white-space: nowrap; }
.eq-panel__person-sep    { color: var(--muted-foreground); font-size: 11px; }
.eq-panel__person-pct    { font-size: 11px; color: var(--muted-foreground); }
.eq-panel__person-ideal  { font-size: 11px; color: var(--muted-foreground); font-style: italic; }
.eq-panel__suggestion { font-size: 12px; color: var(--muted-foreground); font-style: italic; background: var(--card); border-radius: 6px; padding: 8px 10px; display: flex; align-items: flex-start; gap: 6px; }

.eq-panel__apply {
  display: inline-flex; align-items: center; gap: 6px;
  align-self: flex-end;
  padding: 7px 14px; border-radius: 8px;
  font-size: 12px; font-weight: 600; font-family: inherit;
  background: transparent; color: var(--primary);
  border: 1px solid var(--primary);
  cursor: pointer; transition: background 0.15s, color 0.15s;
}
.eq-panel__apply:hover { background: var(--primary); color: #fff; }
.eq__recos-empty { display: inline-flex; align-items: center; gap: 5px; color: #16A34A; font-size: 12px; font-weight: 500; }

/* Section loisirs dans le panel */
.eq-panel__leisure {
  background: var(--muted); border-radius: 10px; padding: 14px 16px;
  display: flex; flex-direction: column; gap: 10px;
  border: 1px solid var(--border);
}
.eq-panel__leisure-header {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 600; color: var(--muted-foreground);
  text-transform: uppercase; letter-spacing: 0.04em;
}
.eq-panel__leisure-alert {
  margin-left: auto; font-size: 10px; font-weight: 700;
  background: #FEF9C3; color: #CA8A04; border-radius: 99px;
  padding: 2px 8px; text-transform: none; letter-spacing: 0;
  white-space: nowrap; flex-shrink: 0;
}
.eq-panel__leisure-row { display: flex; flex-direction: column; gap: 8px; }
.eq-panel__leisure-person { display: flex; align-items: flex-start; gap: 8px; }
.eq-panel__leisure-dot {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 4px;
}
.eq-panel__leisure-person--p1 .eq-panel__leisure-dot { background: #7C6FCD; }
.eq-panel__leisure-person--p2 .eq-panel__leisure-dot { background: #4A9EDB; }
.eq-panel__leisure-name   { font-size: 12px; font-weight: 600; color: var(--foreground); min-width: 0; }
.eq-panel__leisure-amount { font-size: 13px; font-weight: 700; color: var(--foreground); flex-shrink: 0; white-space: nowrap; }
.eq-panel__leisure-pct    { font-size: 11px; color: var(--muted-foreground); }
.eq-panel__leisure-pct--low { color: #DC2626; font-weight: 600; }
.eq-panel__leisure-note {
  font-size: 12px; color: var(--muted-foreground); line-height: 1.5;
  margin: 0; padding-top: 4px; border-top: 1px solid var(--border);
}

@media (max-width: 768px) {
  .eq-panel, .eq-info-panel { width: 100vw; }

  .eq__shared-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .eq__cta {
    width: 100%;
    justify-content: center;
  }
}
</style>
