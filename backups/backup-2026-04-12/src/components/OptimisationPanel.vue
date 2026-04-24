<template>
  <Teleport to="body">
    <!-- Overlay -->
    <Transition name="fade">
      <div v-if="visible" class="op-overlay" @click="emit('fermer')"></div>
    </Transition>

    <!-- Panel -->
    <Transition name="slide">
      <div v-if="visible" class="op-panel">

        <!-- Header -->
        <div class="op-header">
          <div>
            <h3 class="op-title">Optimisation budgétaire</h3>
            <p class="op-subtitle">Analyse de vos {{ depenses.length }} dépenses actives</p>
          </div>
          <button class="op-close" @click="emit('fermer')">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <path d="M3 3l10 10M13 3L3 13"/>
            </svg>
          </button>
        </div>

        <!-- Économies potentielles détaillées -->
        <div class="op-economies">
          <div class="op-eco-header">
            <span class="op-eco-title">Économies potentielles</span>
            <span class="op-eco-total">{{ potentielTotal > 0 ? '−' + fmt(potentielTotal) : '—' }} /mois</span>
          </div>
          <div class="op-eco-grid">
            <div class="op-eco-card">
              <div class="op-eco-name">
                <span class="op-eco-dot" style="background:#7C6FCD"></span>
                {{ nomP1 }}
              </div>
              <div class="op-eco-row">
                <span class="op-eco-label">Par mois</span>
                <span class="op-eco-val">{{ potentielP1 > 0 ? '−' + fmt(potentielP1) : '—' }}</span>
              </div>
              <div class="op-eco-row">
                <span class="op-eco-label">Par an</span>
                <span class="op-eco-val accent">{{ potentielP1 > 0 ? '−' + fmt(potentielP1 * 12) : '—' }}</span>
              </div>
            </div>
            <div class="op-eco-card">
              <div class="op-eco-name">
                <span class="op-eco-dot" style="background:#4A9EDB"></span>
                {{ nomP2 }}
              </div>
              <div class="op-eco-row">
                <span class="op-eco-label">Par mois</span>
                <span class="op-eco-val">{{ potentielP2 > 0 ? '−' + fmt(potentielP2) : '—' }}</span>
              </div>
              <div class="op-eco-row">
                <span class="op-eco-label">Par an</span>
                <span class="op-eco-val accent">{{ potentielP2 > 0 ? '−' + fmt(potentielP2 * 12) : '—' }}</span>
              </div>
            </div>
            <div class="op-eco-card op-eco-card--couple">
              <div class="op-eco-name">
                <span class="op-eco-dot" style="background:#2E7D32"></span>
                Couple
              </div>
              <div class="op-eco-row">
                <span class="op-eco-label">Par mois</span>
                <span class="op-eco-val">{{ potentielTotal > 0 ? '−' + fmt(potentielTotal) : '—' }}</span>
              </div>
              <div class="op-eco-row">
                <span class="op-eco-label">Par an</span>
                <span class="op-eco-val accent">{{ potentielTotal > 0 ? '−' + fmt(potentielTotal * 12) : '—' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats rapides -->
        <div class="op-summary">
          <div class="op-sm-card">
            <div class="op-sm-label">Points d'attention</div>
            <div class="op-sm-val" :class="nbAlertes > 0 ? 'orange' : 'green'">{{ nbAlertes }}</div>
          </div>
          <div class="op-sm-card">
            <div class="op-sm-label">Catégories OK</div>
            <div class="op-sm-val green">{{ recommandations.filter(r => r.type === 'ok').length }}</div>
          </div>
          <div class="op-sm-card">
            <div class="op-sm-label">Dépenses analysées</div>
            <div class="op-sm-val">{{ depenses.length }}</div>
          </div>
        </div>

        <!-- Liste recommandations -->
        <div class="op-list">
          <div
            v-for="r in recommandations"
            :key="r.id"
            class="op-item"
            :class="`op-item--${r.type}`"
          >
            <div class="op-item-icon" :class="`op-item-icon--${r.type}`">
              <svg v-if="r.type === 'danger'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <svg v-else-if="r.type === 'warning'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div class="op-item-body">
              <div class="op-item-titre">{{ r.titre }}</div>
              <div class="op-item-desc">{{ r.desc }}</div>
              <span class="op-tag" :class="`op-tag--${r.tagType}`">{{ r.tag }}</span>
            </div>
            <div v-if="r.potentiel > 0" class="op-saving">
              <div class="op-saving-val">−{{ fmt(r.potentiel) }}</div>
              <div class="op-saving-lbl">/mois</div>
            </div>
          </div>

          <div v-if="recommandations.length === 0" class="op-empty">
            Aucune catégorie avec seuil défini dans vos dépenses.
          </div>
        </div>

        <!-- Footer -->
        <div class="op-footer">
          <p class="op-footer-note">
            Basé sur les recommandations budgétaires de la règle 50/30/20.
            Ces estimations sont indicatives.
          </p>
        </div>

      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '../stores/budget'
import { toMonthly } from '../stores/budget'

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['fermer'])
const store = useBudgetStore()

const depenses = computed(() => store.depensesActives)
const totalMensuel = computed(() => store.totalDepensesMensuel || 1)

const parCategorie = computed(() => {
  const map = new Map()
  depenses.value.forEach(d => {
    const cat = store.categories.find(c => c.id === d.categorieId)
    const nom = cat?.nom || 'Autre'
    const couleur = cat?.couleur || '#888'
    const montant = toMonthly(
      (d.montantP1 || 0) + (d.montantP2 || 0) + (d.montantCommun || 0),
      d.frequence
    )
    if (!map.has(nom)) map.set(nom, { nom, couleur, montant: 0, items: [] })
    map.get(nom).montant += montant
    map.get(nom).items.push(d)
  })
  return [...map.values()].sort((a, b) => b.montant - a.montant)
})

const SEUILS = {
  'Loisirs':       { max: 15 },
  'Abonnements':   { max: 5 },
  'Transport':     { max: 15 },
  'Alimentation':  { max: 20 },
  'Logement':      { max: 40 },
}

const recommandations = computed(() => {
  const total = totalMensuel.value
  const results = []

  parCategorie.value.forEach(cat => {
    const pct = Math.round(cat.montant / total * 100)
    const seuil = SEUILS[cat.nom]

    if (!seuil) return

    if (pct > seuil.max) {
      const montantCible = Math.round(total * seuil.max / 100)
      const potentiel = Math.round(cat.montant - montantCible)
      const isAlert = pct > seuil.max * 1.5
      results.push({
        id: cat.nom,
        type: isAlert ? 'danger' : 'warning',
        icon: null,
        titre: `${cat.nom} — ${pct}% du budget`,
        desc: `Seuil recommandé : ${seuil.max}%. Vous dépensez ${fmt(cat.montant)}/mois, soit ${fmt(potentiel)} de plus que conseillé.`,
        potentiel,
        tag: `${pct}% du budget`,
        tagType: isAlert ? 'danger' : 'warning',
        couleur: cat.couleur,
      })
    } else {
      results.push({
        id: cat.nom,
        type: 'ok',
        icon: null,
        titre: `${cat.nom} — dans la norme`,
        desc: `${pct}% du budget. Seuil recommandé : ${seuil.max}%. Bonne maîtrise.`,
        potentiel: 0,
        tag: 'Sous contrôle',
        tagType: 'ok',
        couleur: cat.couleur,
      })
    }

    // Règle spéciale : trop d'abonnements
    if (cat.nom === 'Abonnements' && cat.items.length > 3) {
      results.push({
        id: 'abonnements-nb',
        type: 'warning',
        icon: '📋',
        titre: `${cat.items.length} abonnements actifs`,
        desc: `Vous avez ${cat.items.length} abonnements. Vérifiez les doublons ou inutilisés.`,
        potentiel: 0,
        tag: `${cat.items.length} abonnements`,
        tagType: 'warning',
        couleur: '#9E9E9E',
      })
    }
  })

  const ordre = { danger: 0, warning: 1, ok: 2 }
  return results.sort((a, b) => ordre[a.type] - ordre[b.type])
})

const nomP1 = computed(() => store.personnes[0]?.nom || 'P1')
const nomP2 = computed(() => store.personnes[1]?.nom || 'P2')

const nbAlertes = computed(() => recommandations.value.filter(r => r.type !== 'ok').length)
const potentielTotal = computed(() => recommandations.value.reduce((s, r) => s + r.potentiel, 0))

const potentielParPersonne = computed(() => {
  let p1 = 0, p2 = 0
  recommandations.value.forEach(r => {
    if (r.potentiel <= 0) return
    const cat = store.categories.find(c => c.nom === r.id)
    if (!cat) return
    const depensesCat = depenses.value.filter(d => d.categorieId === cat.id)
    let totalCatP1 = 0, totalCatP2 = 0
    depensesCat.forEach(d => {
      totalCatP1 += toMonthly(d.montantP1 || 0, d.frequence)
      totalCatP2 += toMonthly(d.montantP2 || 0, d.frequence)
    })
    const totalCat = totalCatP1 + totalCatP2
    if (totalCat === 0) return
    p1 += Math.round(r.potentiel * (totalCatP1 / totalCat))
    p2 += Math.round(r.potentiel * (totalCatP2 / totalCat))
  })
  return { p1, p2 }
})

const potentielP1 = computed(() => potentielParPersonne.value.p1)
const potentielP2 = computed(() => potentielParPersonne.value.p2)

function fmt(v) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0
  }).format(v)
}
</script>

<style scoped>
/* Overlay */
.op-overlay {
  position: fixed;
  inset: 0;
  background: rgba(48,41,39,0.3);
  z-index: 300;
}

/* Panel */
.op-panel {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 600px;
  background: var(--popover);
  box-shadow: var(--shadow-xl);
  z-index: 301;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: transform 0.3s cubic-bezier(0.4,0,0.2,1); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }

/* Header */
.op-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 24px 16px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.op-title    { font-size: 16px; font-weight: 600; color: var(--foreground); margin: 0 0 3px; }
.op-subtitle { font-size: 12px; color: var(--muted-foreground); margin: 0; }
.op-close {
  background: none; border: none; cursor: pointer;
  color: var(--muted-foreground); padding: 4px; border-radius: 6px;
  display: flex; flex-shrink: 0;
  transition: background 150ms ease;
}
.op-close:hover { background: var(--muted); color: var(--foreground); }

/* Économies détaillées */
.op-economies {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.op-eco-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.op-eco-title {
  font-size: 11px;
  font-weight: 500;
  color: var(--muted-foreground);
  text-transform: uppercase;
  letter-spacing: .04em;
}
.op-eco-total {
  font-size: 15px;
  font-weight: 700;
  color: #2E7D32;
}
.op-eco-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
}
.op-eco-card {
  background: var(--secondary);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.op-eco-card--couple {
  background: rgba(46,125,50,0.06);
  border: 1px solid rgba(46,125,50,0.2);
}
.op-eco-name {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--muted-foreground);
  margin-bottom: 2px;
}
.op-eco-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.op-eco-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.op-eco-label { font-size: 10px; color: var(--muted-foreground); }
.op-eco-val { font-size: 13px; font-weight: 600; color: var(--foreground); }
.op-eco-val.accent { color: #2E7D32; font-size: 14px; }

/* Stats rapides */
.op-summary {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  padding: 12px 24px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}
.op-sm-card {
  background: var(--secondary);
  border-radius: var(--radius-md);
  padding: 10px 12px;
}
.op-sm-label { font-size: 10px; color: var(--muted-foreground); text-transform: uppercase; letter-spacing: .04em; margin-bottom: 4px; }
.op-sm-val   { font-size: 16px; font-weight: 600; color: var(--foreground); }
.op-sm-val.green  { color: #2E7D32; }
.op-sm-val.orange { color: #E65100; }

/* Liste */
.op-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 24px 16px;
}
.op-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}
.op-item:last-child { border-bottom: none; }
.op-item-icon {
  width: 30px; height: 30px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.op-item-icon--danger  { background: #FEE2E2; color: #DC2626; }
.op-item-icon--warning { background: #FEF9C3; color: #CA8A04; }
.op-item-icon--ok      { background: #DCFCE7; color: #16A34A; }
.op-item-body { flex: 1; min-width: 0; }
.op-item-titre { font-size: 13px; font-weight: 500; color: var(--foreground); margin-bottom: 3px; }
.op-item-desc  { font-size: 12px; color: var(--muted-foreground); line-height: 1.5; margin-bottom: 6px; }

/* Tags */
.op-tag { display: inline-block; font-size: 10px; padding: 2px 8px; border-radius: 20px; font-weight: 500; }
.op-tag--danger  { background: #FFEBEE; color: #C62828; }
.op-tag--warning { background: #FFF3E0; color: #E65100; }
.op-tag--ok      { background: #E8F5E9; color: #2E7D32; }

/* Économie potentielle */
.op-saving { text-align: right; flex-shrink: 0; }
.op-saving-val { font-size: 14px; font-weight: 600; color: #2E7D32; }
.op-saving-lbl { font-size: 10px; color: var(--muted-foreground); }

/* Empty state */
.op-empty {
  padding: 32px 0;
  text-align: center;
  font-size: 13px;
  color: var(--muted-foreground);
}

/* Footer */
.op-footer {
  padding: 12px 24px 16px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}
.op-footer-note { font-size: 11px; color: var(--muted-foreground); line-height: 1.5; margin: 0; }
</style>
