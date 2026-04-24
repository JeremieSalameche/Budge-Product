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
        <div>
          <div class="eq__label">Équité du couple</div>
          <div class="eq__status" :style="{ color: cfg.color }">{{ cfg.label }}</div>
        </div>
      </div>
      <div class="eq__score-right">
        <div class="eq__score-val" :style="{ color: cfg.color }">
          {{ score }}<span class="eq__score-max">/100</span>
        </div>
        <button class="eq__info-btn" @click="infoOpen = true" title="En savoir plus sur ce score">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="8"/><line x1="12" y1="12" x2="12" y2="16"/>
          </svg>
        </button>
      </div>
    </div>

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

      <!-- Card dépenses partagées — dans le bloc gris, collée en bas -->
      <div class="eq__shared-card">
        <span class="eq__shared-title">Dépenses partagées à rééquilibrer</span>
        <span v-if="recos.length === 0" class="eq__recos-empty">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Tout équilibré
        </span>
        <button v-else class="eq__cta" @click="panelOpen = true">
          Dépenses à rééquilibrer
          <span class="eq__cta-badge">{{ recos.length }}</span>
        </button>
      </div>
    </div>

    <!-- Side panel — explication du score -->
    <Teleport to="body">
      <Transition name="eq-panel">
        <div v-if="infoOpen" class="eq-panel__overlay" @click.self="infoOpen = false">
          <div class="eq-panel eq-info-panel">
            <div class="eq-panel__header">
              <div>
                <div class="eq-panel__title">Comment fonctionne le score d'équité ?</div>
                <div class="eq-panel__sub">Méthodologie et interprétation</div>
              </div>
              <button class="eq-panel__close" @click="infoOpen = false">✕</button>
            </div>

            <div class="eq-panel__body eq-info-body">

              <div class="eq-info-section">
                <div class="eq-info-section-title">
                  <div class="eq-info-icon eq-info-icon--blue">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>
                  </div>
                  Principe du score
                </div>
                <p class="eq-info-text">Le score mesure à quel point la répartition des charges entre les deux personnes reflète fidèlement leur contribution aux revenus du foyer. Un score de <strong>100</strong> signifie que chacun paie exactement la proportion de dépenses correspondant à sa part de revenus.</p>
              </div>

              <div class="eq-info-section">
                <div class="eq-info-section-title">
                  <div class="eq-info-icon eq-info-icon--purple">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </div>
                  Calcul
                </div>
                <div class="eq-info-formula">
                  <div class="eq-info-formula-row"><span class="eq-info-formula-label">Écart</span><span class="eq-info-formula-val">| % charges P1 − % revenus P1 |</span></div>
                  <div class="eq-info-formula-row"><span class="eq-info-formula-label">Score</span><span class="eq-info-formula-val">100 − (écart × 4), min 0</span></div>
                </div>
                <p class="eq-info-text eq-info-text--sm">Exemple : si {{ p1?.nom || 'P1' }} gagne 60 % des revenus mais supporte 70 % des charges, l'écart est de 10 pts → score = 60/100.</p>
              </div>

              <div class="eq-info-section">
                <div class="eq-info-section-title">
                  <div class="eq-info-icon eq-info-icon--green">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
                  </div>
                  3 cas d'usage
                </div>
                <div class="eq-info-cases">
                  <div class="eq-info-case">
                    <span class="eq-info-case-num">1</span>
                    <div>
                      <strong>Vérifier l'équité globale</strong>
                      <p>Idéal pour s'assurer qu'aucun des deux partenaires ne supporte une charge disproportionnée par rapport à ses revenus, notamment lors d'une évolution salariale.</p>
                    </div>
                  </div>
                  <div class="eq-info-case">
                    <span class="eq-info-case-num">2</span>
                    <div>
                      <strong>Détecter les déséquilibres progressifs</strong>
                      <p>Un score qui baisse dans le temps signale qu'une dépense ou un changement de situation (nouveau loyer, perte d'emploi…) crée un déséquilibre à corriger.</p>
                    </div>
                  </div>
                  <div class="eq-info-case">
                    <span class="eq-info-case-num">3</span>
                    <div>
                      <strong>Négocier sereinement</strong>
                      <p>Le score objective la conversation entre partenaires : plutôt que de "sentir" qu'il y a un déséquilibre, vous avez des chiffres précis pour en discuter.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="eq-info-tip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <div>
                  <strong>Pour améliorer votre score</strong>, utilisez le module <em>Dépenses partagées à rééquilibrer</em> disponible dans cette même carte. Il identifie ligne par ligne quels montants ajuster pour atteindre la répartition idéale selon vos revenus respectifs.
                </div>
              </div>

            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

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
                    <span class="eq-panel__person-name">{{ p1.nom }}</span>
                    <span class="eq-panel__person-amount">{{ r.m1 }} €/mois</span>
                    <span class="eq-panel__person-pct">{{ r.pctP1 }}% de la ligne</span>
                    <span class="eq-panel__person-ideal">Idéal : {{ r.idealP1 }} €</span>
                  </div>
                  <div class="eq-panel__person eq-panel__person--p2">
                    <span class="eq-panel__person-name">{{ p2.nom }}</span>
                    <span class="eq-panel__person-amount">{{ r.m2 }} €/mois</span>
                    <span class="eq-panel__person-pct">{{ r.pctP2 }}% de la ligne</span>
                    <span class="eq-panel__person-ideal">Idéal : {{ r.idealP2 }} €</span>
                  </div>
                </div>
                <div class="eq-panel__suggestion">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {{ r.suggestion }}
                </div>
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

const store     = useBudgetStore()
const panelOpen = ref(false)
const infoOpen  = ref(false)

const p1 = computed(() => store.personnes[0])
const p2 = computed(() => store.personnes[1])

const totalMensuelP1 = computed(() => store.totalMensuelP1)
const totalMensuelP2 = computed(() => store.totalMensuelP2)
const basePct        = computed(() => totalMensuelP1.value + totalMensuelP2.value)
const pctChargesP1   = computed(() => basePct.value > 0 ? Math.round(totalMensuelP1.value / basePct.value * 100) : 50)
const pctChargesP2   = computed(() => 100 - pctChargesP1.value)

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

// Catégories où le partage doit être 50/50 (pas proportionnel aux revenus)
const CATS_EGALE = ['Loisirs', 'Loisir']

// Recommandations : uniquement lignes partagées (P1 ET P2 paient tous les deux)
const recos = computed(() => {
  return store.depenses
    .filter(d => d.actif && d.montantP1 > 0 && d.montantP2 > 0)
    .map(d => {
      const m1    = toMonthly(d.montantP1, d.frequence)
      const m2    = toMonthly(d.montantP2, d.frequence)
      const total = m1 + m2
      const pctActP1 = m1 / total

      // Loisirs → partage 50/50 attendu, pas proportionnel aux revenus
      const cat = store.categories.find(c => c.id === d.categorieId)
      const idealP1 = (cat && CATS_EGALE.includes(cat.nom)) ? 0.5 : partFoyerP1.value / 100

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

function fmtMontant(v) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(v)
}
</script>

<style scoped>
.eq {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 20px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-shadow: var(--shadow-xs);
}

/* Header score */
.eq__header        { display: flex; justify-content: space-between; align-items: center; }
.eq__score-left    { display: flex; align-items: center; gap: 10px; }
.eq__score-right   { display: flex; align-items: center; gap: 6px; }

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
.eq__label         { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted-foreground); }
.eq__status        { font-size: 13px; font-weight: 600; margin-top: 1px; }
.eq__score-val     { font-size: 26px; font-weight: 700; line-height: 1; }
.eq__score-max     { font-size: 12px; font-weight: 500; color: var(--muted-foreground); margin-left: 1px; }

/* Barre */
.eq__bar-track { height: 6px; background: var(--muted); border-radius: 99px; overflow: hidden; }
.eq__bar-fill  { height: 100%; border-radius: 99px; transition: width 0.5s ease; }

/* Détail */
.eq__detail { display: flex; flex-direction: column; gap: 0; padding: 16px; background: var(--muted); border: 1px solid var(--border); border-radius: 8px; flex: 1; }
.eq__detail-row  { display: flex; align-items: center; gap: 7px; font-size: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); }
.eq__detail-row:last-of-type { border-bottom: none; }
.eq__detail-dot  { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.eq__detail-name { font-weight: 600; color: var(--foreground); width: 90px; flex-shrink: 0; }
.eq__detail-info { color: var(--muted-foreground); flex: 1; }
.eq__detail-info strong { color: var(--foreground); }
.eq__detail-tag  { font-size: 10px; font-weight: 600; padding: 1px 6px; border-radius: 99px; flex-shrink: 0; }
.eq__tag--ok   { background: #DCFCE7; color: #16A34A; }
.eq__tag--warn { background: #FEF9C3; color: #CA8A04; }

/* Recommandations */
.eq__shared-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
}
.eq__shared-title { font-size: 12px; font-weight: 600; color: var(--foreground); flex-shrink: 0; }
.eq__recos-empty  { font-size: 12px; color: var(--muted-foreground); }

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
  background: var(--secondary);
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

.eq-info-cases { display: flex; flex-direction: column; gap: 12px; }
.eq-info-case {
  display: flex; gap: 12px; align-items: flex-start;
  background: var(--muted); border-radius: 8px; padding: 12px 14px;
}
.eq-info-case-num {
  width: 22px; height: 22px; border-radius: 50%;
  background: var(--foreground); color: var(--card);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.eq-info-case strong { font-size: 13px; color: var(--foreground); display: block; margin-bottom: 3px; }
.eq-info-case p { font-size: 12px; color: var(--muted-foreground); line-height: 1.5; margin: 0; }

.eq-info-tip {
  display: flex; gap: 10px; align-items: flex-start;
  background: #EFF6FF; border: 1px solid #BFDBFE;
  border-radius: 8px; padding: 12px 14px;
  font-size: 12px; color: #1D4ED8; line-height: 1.5;
}
.eq-info-tip svg { flex-shrink: 0; margin-top: 2px; }
.eq-info-tip strong { font-weight: 600; }
.eq-info-tip em { font-style: normal; font-weight: 500; }

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
.eq-panel__persons     { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.eq-panel__person {
  background: var(--card); border-radius: 8px; padding: 10px 12px;
  display: flex; flex-direction: column; gap: 3px;
}
.eq-panel__person--p1 { border-left: 3px solid #7C6FCD; }
.eq-panel__person--p2 { border-left: 3px solid #4A9EDB; }
.eq-panel__person-name   { font-size: 11px; font-weight: 600; color: var(--muted-foreground); }
.eq-panel__person-amount { font-size: 16px; font-weight: 700; color: var(--foreground); }
.eq-panel__person-pct    { font-size: 11px; color: var(--muted-foreground); }
.eq-panel__person-ideal  { font-size: 11px; color: var(--muted-foreground); font-style: italic; border-top: 1px solid var(--border); padding-top: 3px; margin-top: 2px; }
.eq-panel__suggestion { font-size: 12px; color: var(--muted-foreground); font-style: italic; background: var(--card); border-radius: 6px; padding: 8px 10px; display: flex; align-items: flex-start; gap: 6px; }
.eq__recos-empty { display: inline-flex; align-items: center; gap: 5px; color: #16A34A; font-size: 12px; font-weight: 500; }
</style>
