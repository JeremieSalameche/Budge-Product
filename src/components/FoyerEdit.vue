<template>
  <Teleport to="body">
    <div class="fe-overlay" @click.self="!confirmSuppr && $emit('fermer')">
      <div class="fe">

        <!-- Header -->
        <div class="fe__header">
          <span class="fe__title">Modifier le foyer</span>
          <button class="fe__close" type="button" @click="$emit('fermer')">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="fe__body">

          <!-- Nom + Couleur -->
          <div class="fe__section">
            <div class="fe__field">
              <label class="fe__label">Nom du foyer</label>
              <input class="fe__input" v-model="nom" type="text" placeholder="Ex : Mon appartement" />
            </div>
            <div class="fe__field">
              <label class="fe__label">Couleur</label>
              <div class="fe__colors">
                <button
                  v-for="c in couleurs" :key="c"
                  type="button"
                  class="fe__color-btn"
                  :class="{ 'fe__color-btn--active': couleur === c }"
                  :style="{ background: c }"
                  @click="couleur = c"
                ></button>
              </div>
            </div>
          </div>

          <!-- Type -->
          <div class="fe__section">
            <label class="fe__label">Configuration du foyer</label>
            <div class="fe__type-tabs">
              <button
                v-for="t in typeOptions" :key="t.value"
                type="button"
                class="fe__type-btn"
                :class="{ 'fe__type-btn--active': type === t.value }"
                @click="setType(t.value)"
              >{{ t.label }}</button>
            </div>
          </div>

          <!-- Membres -->
          <div class="fe__section fe__section--membres">
            <label class="fe__label">Membres</label>

            <div v-for="(p, i) in personnes" :key="i" class="fe__membre">
              <div class="fe__membre-avatar" :style="{ background: p.couleur || couleursMembres[i % couleursMembres.length] }">
                {{ p.nom ? p.nom[0].toUpperCase() : String.fromCharCode(65 + i) }}
              </div>
              <div class="fe__membre-fields">
                <input class="fe__input fe__input--sm" v-model="p.nom" type="text" :placeholder="`Prénom ${i + 1}`" />
                <div class="fe__input-wrap">
                  <input class="fe__input fe__input--sm" v-model.number="p.salaire" type="number" min="0" step="100" placeholder="0" />
                  <span class="fe__suffix">€/mois</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        <!-- Footer principal -->
        <div class="fe__footer">
          <button class="fe__btn fe__btn--ghost" type="button" @click="$emit('fermer')">Annuler</button>
          <button class="fe__btn fe__btn--primary" type="button" @click="sauvegarder">Enregistrer</button>
        </div>

        <!-- Zone danger -->
        <div class="fe__danger-zone">
          <button
            class="fe__delete-btn"
            type="button"
            :disabled="store.foyers.length <= 1"
            @click="confirmSuppr = true"
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10"/>
            </svg>
            Supprimer le foyer
          </button>
        </div>

        <!-- Confirmation suppression -->
        <Transition name="fe-confirm">
          <div v-if="confirmSuppr" class="fe__confirm" @click.stop>
            <div class="fe__confirm-icon">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="9" stroke="#EF4444" stroke-width="1.5"/>
                <path d="M11 7v5M11 15v.5" stroke="#EF4444" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </div>
            <p class="fe__confirm-title">Supprimer le foyer ?</p>
            <p class="fe__confirm-msg">
              Toutes les données de <strong>{{ nom }}</strong> seront définitivement supprimées.
              Téléchargez une copie avant de continuer.
            </p>
            <button class="fe__btn fe__btn--csv" type="button" @click="exporterCSV">
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v8M4 6l3 3 3-3M2 11h10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Télécharger les données en CSV
            </button>
            <div class="fe__confirm-actions">
              <button class="fe__btn fe__btn--ghost" type="button" @click="confirmSuppr = false">Annuler</button>
              <button class="fe__btn fe__btn--danger" type="button" @click="supprimerFoyer">Supprimer définitivement</button>
            </div>
          </div>
        </Transition>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useBudgetStore } from '../stores/budget'

const emit = defineEmits(['fermer'])
const store = useBudgetStore()

const couleurs       = ['#7C6FCD', '#4A9EDB', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1', '#14B8A6']
const couleursMembres = ['#7C6FCD', '#4A9EDB', '#10B981', '#F59E0B', '#EF4444', '#EC4899']
const typeOptions    = [
  { value: 'seul',   label: 'Seul' },
  { value: 'couple', label: 'Couple' },
]

const f           = store.foyerActif
const nom         = ref(f?.nom || '')
const couleur     = ref(f?.couleur || '#7C6FCD')
const confirmSuppr = ref(false)

function detectType(personnes) {
  if (!personnes || personnes.length <= 1) return 'seul'
  return 'couple'
}

const type      = ref(detectType(f?.config?.personnes))
const personnes = ref((f?.config?.personnes ?? []).map(p => ({ ...p })))

if (personnes.value.length === 0) {
  personnes.value = [{ id: 'p1', nom: '', salaire: 0, couleur: '#7C6FCD' }]
}

function setType(t) {
  type.value = t
  if (t === 'seul') {
    personnes.value = [personnes.value[0] ?? { id: 'p1', nom: '', salaire: 0, couleur: '#7C6FCD' }]
  } else if (t === 'couple') {
    while (personnes.value.length < 2) {
      personnes.value.push({ id: 'p2', nom: '', salaire: 0, couleur: '#4A9EDB' })
    }
    personnes.value = personnes.value.slice(0, 2)
  }
}

function ajouterPersonne() {
  if (personnes.value.length >= 6) return
  personnes.value.push({
    id:      'p' + (personnes.value.length + 1),
    nom:     '',
    salaire: 0,
    couleur: couleursMembres[personnes.value.length % couleursMembres.length],
  })
}

function retirerPersonne(i) {
  if (personnes.value.length <= 1) return
  personnes.value.splice(i, 1)
}

function sauvegarder() {
  const normalised = personnes.value.map((p, i) => ({
    ...p,
    id:      'p' + (i + 1),
    couleur: p.couleur || couleursMembres[i % couleursMembres.length],
  }))
  store.updateFoyer({ nom: nom.value.trim() || 'Mon foyer', couleur: couleur.value, personnes: normalised })
  emit('fermer')
}

function exporterCSV() {
  const fo = store.foyerActif
  if (!fo) return

  const rows = []
  rows.push(['Type', 'Date', 'Nom', 'Montant P1 (€)', 'Montant P2 (€)', 'Montant Commun (€)', 'Catégorie', 'Fréquence', 'Note'])

  fo.depenses.forEach(d => {
    const cat = fo.categories.find(c => c.id === d.categorieId)?.nom || ''
    rows.push(['Dépense', '', d.nom, d.montantP1, d.montantP2, d.montantCommun, cat, d.frequence, d.note || ''])
  })

  rows.push([])
  rows.push(['Type', 'Date', 'Montant P1 (€)', 'Montant P2 (€)', 'Note'])
  fo.epargnes.forEach(e => {
    rows.push(['Épargne', e.date, e.montantP1, e.montantP2, e.note || ''])
  })

  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `foyer-${fo.nom}-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

function supprimerFoyer() {
  const id = store.foyerActifId
  emit('fermer')
  store.supprimerFoyer(id)
}
</script>

<style scoped>
.fe-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0, 0, 0, 0.45);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
}

.fe {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%; max-width: 460px;
  display: flex; flex-direction: column;
  max-height: calc(100vh - 48px);
  overflow: hidden;
  position: relative;
}

/* Header */
.fe__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 24px; border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.fe__title { font-size: 14px; font-weight: 600; color: var(--foreground); }
.fe__close {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 6px;
  background: none; border: none; cursor: pointer;
  color: var(--muted-foreground); transition: background 120ms, color 120ms;
}
.fe__close:hover { background: var(--muted); color: var(--foreground); }

/* Body */
.fe__body {
  padding: 20px 24px; display: flex; flex-direction: column; gap: 20px;
  overflow-y: auto; flex: 1;
}

.fe__section { display: flex; flex-direction: column; gap: 12px; }
.fe__section--membres { gap: 8px; }
.fe__field { display: flex; flex-direction: column; gap: 6px; }
.fe__label { font-size: 12px; font-weight: 500; color: var(--muted-foreground); }

.fe__input-wrap { position: relative; display: flex; align-items: center; }
.fe__input {
  width: 100%; height: 38px; padding: 0 12px;
  background: var(--background); border: 1px solid var(--input);
  border-radius: var(--radius-md); font-size: 13px; font-family: inherit; color: var(--foreground);
  outline: none; box-sizing: border-box; transition: border-color 150ms ease;
}
.fe__input--sm { height: 34px; }
.fe__input-wrap .fe__input { padding-right: 56px; }
.fe__input:focus { border-color: var(--ring); }
.fe__suffix { position: absolute; right: 10px; font-size: 12px; color: var(--muted-foreground); pointer-events: none; }

.fe__colors { display: flex; gap: 8px; flex-wrap: wrap; }
.fe__color-btn {
  width: 26px; height: 26px; border-radius: 50%;
  border: 2px solid transparent; cursor: pointer; flex-shrink: 0;
  transition: transform 120ms, border-color 120ms;
}
.fe__color-btn:hover { transform: scale(1.1); }
.fe__color-btn--active { border-color: var(--foreground); transform: scale(1.1); }

.fe__type-tabs {
  display: flex; gap: 6px;
  background: var(--muted); border-radius: var(--radius-md); padding: 4px;
}
.fe__type-btn {
  flex: 1; height: 30px; border-radius: calc(var(--radius-md) - 2px);
  border: none; background: none; cursor: pointer;
  font-size: 12px; font-weight: 500; color: var(--muted-foreground); font-family: inherit;
  transition: background 120ms, color 120ms;
}
.fe__type-btn:hover { color: var(--foreground); }
.fe__type-btn--active { background: var(--background); color: var(--foreground); box-shadow: 0 1px 3px rgba(0,0,0,0.08); }

.fe__membre {
  display: flex; align-items: center; gap: 10px;
  background: var(--muted); border-radius: var(--radius-md); padding: 10px 12px;
}
.fe__membre-avatar {
  width: 30px; height: 30px; border-radius: 7px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: #fff;
}
.fe__membre-fields { flex: 1; display: flex; gap: 8px; min-width: 0; }
.fe__membre-fields .fe__input { min-width: 0; }

.fe__remove-btn {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 6px; flex-shrink: 0;
  background: none; border: none; cursor: pointer; color: var(--muted-foreground);
  transition: background 120ms, color 120ms;
}
.fe__remove-btn:hover { background: var(--color-danger-subtle); color: var(--color-danger); }

.fe__add-btn {
  display: flex; align-items: center; gap: 8px; padding: 8px 12px;
  border-radius: var(--radius-md); background: none; border: 1px dashed var(--border);
  cursor: pointer; font-size: 12px; font-weight: 500; color: var(--muted-foreground); font-family: inherit;
  transition: background 120ms, color 120ms, border-color 120ms;
}
.fe__add-btn:hover { background: var(--muted); color: var(--foreground); border-color: var(--foreground); }

/* Footer */
.fe__footer {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 14px 24px; border-top: 1px solid var(--border); flex-shrink: 0;
}

/* Zone danger */
.fe__danger-zone {
  display: flex; justify-content: center;
  padding: 10px 24px 16px;
  flex-shrink: 0;
}
.fe__delete-btn {
  display: flex; align-items: center; gap: 6px;
  background: none; border: none; cursor: pointer;
  font-size: 12px; font-weight: 500; color: var(--muted-foreground);
  font-family: inherit; padding: 4px 8px; border-radius: 6px;
  transition: color 120ms, background 120ms;
}
.fe__delete-btn:hover:not(:disabled) { color: var(--color-danger); background: var(--color-danger-subtle); }
.fe__delete-btn:disabled { opacity: 0.35; cursor: not-allowed; }

/* Boutons génériques */
.fe__btn {
  height: 36px; padding: 0 18px;
  border-radius: var(--radius-md); font-size: 13px; font-weight: 500; font-family: inherit;
  cursor: pointer; border: none; transition: background 150ms, color 150ms;
  display: inline-flex; align-items: center; gap: 6px;
}
.fe__btn--ghost { background: none; border: 1px solid var(--border); color: var(--foreground); }
.fe__btn--ghost:hover { background: var(--muted); }
.fe__btn--primary { background: var(--primary); color: var(--primary-foreground); }
.fe__btn--primary:hover { background: var(--zinc-800); }
.fe__btn--danger { background: var(--color-danger); color: #fff; }
.fe__btn--danger:hover { background: #dc2626; }
.fe__btn--csv {
  width: 100%; justify-content: center;
  background: var(--muted); border: 1px solid var(--border); color: var(--foreground);
}
.fe__btn--csv:hover { background: var(--accent); }

/* Confirmation suppression */
.fe__confirm {
  position: absolute; inset: 0;
  background: var(--background);
  border-radius: var(--radius-lg);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; padding: 32px 28px;
  z-index: 10;
}
.fe__confirm-icon { margin-bottom: 4px; }
.fe__confirm-title { font-size: 16px; font-weight: 700; color: var(--foreground); margin: 0; text-align: center; }
.fe__confirm-msg {
  font-size: 13px; color: var(--muted-foreground); text-align: center; margin: 0;
  line-height: 1.5;
}
.fe__confirm-msg strong { color: var(--foreground); }
.fe__confirm-actions { display: flex; gap: 8px; margin-top: 4px; }

.fe-confirm-enter-active, .fe-confirm-leave-active { transition: opacity 180ms ease; }
.fe-confirm-enter-from, .fe-confirm-leave-to { opacity: 0; }
</style>
