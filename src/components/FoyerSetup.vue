<template>
  <!-- Mode onboarding : split-screen pleine page -->
  <div v-if="premierDemarrage" :class="['onboarding', { 'onboarding--solo': soloForm }]">

    <!-- Gauche : panel marketing (masqué si soloForm) -->
    <div v-if="!soloForm" class="onboarding__right">
      <div class="onboarding__right-glow"></div>

      <div class="onboarding__right-top">
        <img src="/logo-budge-white.svg" class="onboarding__right-logo" alt="Budge" />
      </div>

      <div class="onboarding__right-content">
        <div class="onboarding__right-badge">✦ Nouveau</div>
        <h3 class="onboarding__right-title">Gérez votre budget, seul ou à deux, simplement.</h3>
        <p class="onboarding__right-sub">Visualisez vos dépenses, partagez les charges équitablement et atteignez vos objectifs ensemble.</p>
      </div>
      <div class="onboarding__right-features">
        <div class="onboarding__feature">
          <div class="onboarding__feature-icon">⚖️</div>
          <div>
            <div class="onboarding__feature-title">Partage équitable</div>
            <div class="onboarding__feature-desc">Charges réparties selon les revenus de chacun</div>
          </div>
        </div>
        <div class="onboarding__feature">
          <div class="onboarding__feature-icon">📊</div>
          <div>
            <div class="onboarding__feature-title">Vue claire</div>
            <div class="onboarding__feature-desc">Dashboard complet avec reste à vivre en temps réel</div>
          </div>
        </div>
        <div class="onboarding__feature">
          <div class="onboarding__feature-icon">☁️</div>
          <div>
            <div class="onboarding__feature-title">Sync cloud</div>
            <div class="onboarding__feature-desc">Accédez à vos données depuis n'importe quel appareil</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Droite : formulaire -->
    <div class="onboarding__left">
      <div class="onboarding__left-inner">

        <!-- Stepper numéroté -->
        <div class="onboarding__stepper">
          <template v-for="i in totalEtapes" :key="i">
            <div class="onboarding__stepper-step" :class="{ 'is-done': i < etape, 'is-active': i === etape }">
              <div class="onboarding__stepper-circle">
                <svg v-if="i < etape" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span v-else>{{ i }}</span>
              </div>
              <span class="onboarding__stepper-label">{{ stepperLabels[i - 1] }}</span>
            </div>
            <div v-if="i < totalEtapes" class="onboarding__stepper-line" :class="{ 'is-done': i < etape }"></div>
          </template>
        </div>

        <!-- Titre de l'étape -->
        <div class="onboarding__form-head">
          <h2 class="onboarding__title">{{ titresEtapes[etape - 1] }}</h2>
          <p class="onboarding__hint">{{ hintEtapes[etape - 1] }}</p>
        </div>

        <!-- Étape 1 : Nom du foyer -->
        <div v-if="etape === 1" class="onboarding__fields">
          <div class="onboarding__field">
            <label class="onboarding__label">Nom du foyer</label>
            <input
              class="onboarding__input"
              v-model="nom"
              type="text"
              placeholder="Ex : Famille Martin, Notre appart…"
              @keydown.enter="peutContinuer && suivant()"
              autofocus
            />
          </div>
          <div class="onboarding__field">
            <label class="onboarding__label">Couleur</label>
            <div class="onboarding__colors">
              <button
                v-for="c in couleurs"
                :key="c"
                type="button"
                class="onboarding__color-btn"
                :class="{ 'onboarding__color-btn--active': couleur === c }"
                :style="{ background: c }"
                @click="couleur = c"
              ></button>
            </div>
          </div>

          <div class="onboarding__divider"><span>ou</span></div>

          <button class="onboarding__import-csv" type="button" @click="$refs.budgeImport.click()">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 14V6M5 9l3-3 3 3M2 4V3a1.5 1.5 0 011.5-1.5h9A1.5 1.5 0 0114 3v1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <div>
              <div class="onboarding__import-csv-title">Vous avez déjà un export Budge ?</div>
              <div class="onboarding__import-csv-sub">Importez votre fichier .budge pour tout récupérer en un clic</div>
            </div>
          </button>
          <input ref="budgeImport" type="file" accept=".budge,.json" style="display:none" @change="onImportCsvOnboarding" />
        </div>

        <!-- Étape 2 : Membres -->
        <div v-if="etape === 2" class="onboarding__fields">
          <div v-for="(p, i) in personnes" :key="i" class="onboarding__membre" :class="{ 'onboarding__membre--gap': i > 0 }">
            <div class="onboarding__membre-header">
              <div class="onboarding__membre-avatar" :style="{ background: p.couleur }">
                {{ p.nom ? p.nom[0].toUpperCase() : (i === 0 ? 'A' : 'B') }}
              </div>
              <span class="onboarding__membre-label">Personne {{ i + 1 }}</span>
            </div>
            <div class="onboarding__membre-row">
              <div class="onboarding__field">
                <label class="onboarding__label">Prénom</label>
                <input class="onboarding__input" v-model="p.nom" type="text" :placeholder="i === 0 ? 'Ex : Marie' : 'Ex : Thomas'" />
              </div>
              <div class="onboarding__field">
                <label class="onboarding__label">Salaire net mensuel</label>
                <div class="onboarding__input-wrap">
                  <input class="onboarding__input" v-model.number="p.salaire" type="number" min="0" step="100" placeholder="0" />
                  <span class="onboarding__suffix">€/mois</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Étape 3 : Récap -->
        <div v-if="etape === 3" class="onboarding__fields">
          <div class="onboarding__recap">
            <div class="onboarding__recap-avatar" :style="{ background: couleur }">{{ getInitiales(nom) }}</div>
            <div class="onboarding__recap-info">
              <span class="onboarding__recap-nom">{{ nom }}</span>
              <span class="onboarding__recap-sub">{{ revenuTotal }}/mois · {{ membresFiltres.length }} membre{{ membresFiltres.length > 1 ? 's' : '' }}</span>
            </div>
          </div>
          <div class="onboarding__recap-list">
            <div v-for="p in membresFiltres" :key="p.nom" class="onboarding__recap-row">
              <div class="onboarding__recap-row-avatar" :style="{ background: p.couleur }">{{ p.nom[0].toUpperCase() }}</div>
              <span class="onboarding__recap-row-nom">{{ p.nom }}</span>
              <span class="onboarding__recap-row-salaire">{{ fmt(p.salaire) }}/mois</span>
            </div>
          </div>

        </div>

        <!-- Footer nav -->
        <div class="onboarding__nav">
          <button
            class="onboarding__btn onboarding__btn--primary"
            type="button"
            :disabled="!peutContinuer"
            @click="etape < totalEtapes ? suivant() : creer()"
          >
            <span>{{ etape < totalEtapes ? 'Continuer' : 'Créer mon foyer' }}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button v-if="etape > 1" class="onboarding__btn onboarding__btn--ghost" type="button" @click="precedent">
            ← Retour
          </button>
        </div>

      </div>
    </div>


  </div>

  <!-- Mode normal : modale -->
  <Teleport v-else to="body">
    <div class="fsetup-overlay" @click.self="$emit('fermer')">
      <div class="fsetup">
        <div class="fsetup__header">
          <div class="fsetup__header-left">
            <div class="fsetup__step-badge">Étape {{ etape }}/{{ totalEtapes }}</div>
            <span class="fsetup__title">{{ titresEtapes[etape - 1] }}</span>
          </div>
          <button class="fsetup__close" type="button" @click="$emit('fermer')">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <div v-if="etape === 1" class="fsetup__body">
          <p class="fsetup__hint">Donnez un nom à votre foyer pour le distinguer des autres.</p>
          <div class="fsetup__field">
            <label class="fsetup__label">Nom du foyer</label>
            <input class="fsetup__input" v-model="nom" type="text" placeholder="Ex : Famille Martin…" @keydown.enter="peutContinuer && suivant()" autofocus />
          </div>
          <div class="fsetup__field">
            <label class="fsetup__label">Couleur d'identification</label>
            <div class="fsetup__colors">
              <button v-for="c in couleurs" :key="c" type="button" class="fsetup__color-btn" :class="{ 'fsetup__color-btn--active': couleur === c }" :style="{ background: c }" @click="couleur = c"></button>
            </div>
          </div>
        </div>

        <div v-if="etape === 2" class="fsetup__body">
          <p class="fsetup__hint">Renseignez les informations des membres du foyer.</p>
          <div class="fsetup__membres-grid">
            <div v-for="(p, i) in personnes" :key="i" class="fsetup__membre">
              <div class="fsetup__membre-header">
                <div class="fsetup__membre-avatar" :style="{ background: p.couleur }">{{ p.nom ? p.nom[0].toUpperCase() : (i === 0 ? 'A' : 'B') }}</div>
                <span class="fsetup__membre-label">Personne {{ i + 1 }}</span>
              </div>
              <div class="fsetup__membre-fields">
                <div class="fsetup__field">
                  <label class="fsetup__label">Prénom</label>
                  <input class="fsetup__input" v-model="p.nom" type="text" :placeholder="i === 0 ? 'Ex : Marie' : 'Ex : Thomas'" />
                </div>
                <div class="fsetup__field">
                  <label class="fsetup__label">Salaire net mensuel</label>
                  <div class="fsetup__input-wrap">
                    <input class="fsetup__input" v-model.number="p.salaire" type="number" min="0" step="100" placeholder="0" />
                    <span class="fsetup__suffix">€/mois</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Copie depuis un foyer existant (toggle) -->
          <div v-if="foyersSource.length > 0" class="fsetup__copy-toggle-wrap">
            <button type="button" class="fsetup__copy-toggle" @click="toggleCopie">
              <span class="fsetup__copy-toggle-label">Copier les dépenses d'un foyer existant</span>
              <span class="fsetup__toggle-track" :class="{ 'fsetup__toggle-track--on': copieActive }">
                <span class="fsetup__toggle-thumb"></span>
              </span>
            </button>
            <div v-if="copieActive" class="fsetup__copy-list">
              <button v-for="f in foyersSource" :key="f.id" type="button" class="fsetup__copy-row" :class="{ 'fsetup__copy-row--active': copierDepensesDeId === f.id }" @click="copierDepensesDeId = f.id; keepPersonneIdx = null">
                <span class="fsetup__copy-dot" :style="{ background: f.couleur }"></span>
                <span class="fsetup__copy-name">{{ f.nom }}</span>
                <span class="fsetup__copy-count">{{ f.depenses.length }} dépense{{ f.depenses.length !== 1 ? 's' : '' }}</span>
              </button>
            </div>
            <!-- Sélection de profil si foyer source à 2 personnes et nouveau foyer solo -->
            <div v-if="copieActive && sourceFoyerPersonnes.length === 2 && membresFiltres.length === 1" class="fsetup__profil-pick">
              <p class="fsetup__profil-title">Ce foyer a 2 membres — quel profil copier ?</p>
              <div class="fsetup__profil-btns">
                <button v-for="(p, i) in sourceFoyerPersonnes" :key="i" type="button"
                  class="fsetup__profil-btn"
                  :class="{ 'fsetup__profil-btn--active': keepPersonneIdx === i }"
                  :style="keepPersonneIdx === i ? { borderColor: p.couleur, background: p.couleur + '15' } : {}"
                  @click="keepPersonneIdx = i">
                  <span class="fsetup__profil-dot" :style="{ background: p.couleur }"></span>
                  <div>
                    <div class="fsetup__profil-nom">{{ p.nom }}</div>
                    <div class="fsetup__profil-hint">Dépenses perso + sa part du commun</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-if="etape === 3" class="fsetup__body">
          <div class="fsetup__recap">
            <div class="fsetup__recap-avatar" :style="{ background: couleur }">{{ getInitiales(nom) }}</div>
            <div class="fsetup__recap-info">
              <span class="fsetup__recap-nom">{{ nom }}</span>
              <span class="fsetup__recap-detail">{{ revenuTotal }}/mois<template v-if="membresFiltres.length"> · {{ membresFiltres.map(p => p.nom).join(' &amp; ') }}</template></span>
            </div>
          </div>
          <div class="fsetup__recap-list">
            <div v-for="p in membresFiltres" :key="p.nom" class="fsetup__recap-row">
              <div class="fsetup__recap-row-avatar" :style="{ background: p.couleur }">{{ p.nom[0].toUpperCase() }}</div>
              <span class="fsetup__recap-row-nom">{{ p.nom }}</span>
              <span class="fsetup__recap-row-salaire">{{ fmt(p.salaire) }}/mois</span>
            </div>
          </div>
        </div>

        <div class="fsetup__footer">
          <button v-if="etape > 1" class="fsetup__btn fsetup__btn--ghost" type="button" @click="precedent">Retour</button>
          <div style="flex:1"></div>
          <button class="fsetup__btn fsetup__btn--primary" type="button" :disabled="!peutContinuer" @click="etape < totalEtapes ? suivant() : creer()">
            {{ etape < totalEtapes ? 'Continuer' : 'Créer le foyer' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBudgetStore } from '../stores/budget'

const props = defineProps({
  premierDemarrage: { type: Boolean, default: false },
  soloForm:         { type: Boolean, default: false },
})
const emit = defineEmits(['fermer'])

const store = useBudgetStore()

const totalEtapes   = 3
const stepperLabels = ['Foyer', 'Membres', 'Récap']
const titresEtapes  = ['Configurez votre foyer', 'Qui fait partie du foyer ?', 'Tout est prêt !']
const hintEtapes    = [
  'Donnez un nom et une couleur à votre espace budgétaire.',
  'Renseignez les membres et leurs revenus mensuels nets.',
  'Vérifiez vos informations avant de démarrer.',
]

const etape   = ref(1)
const nom     = ref('')
const couleur = ref('#7C6FCD')
const couleurs = ['#7C6FCD','#4A9EDB','#10B981','#F59E0B','#EF4444','#EC4899','#6366F1','#14B8A6']
const copierDepensesDeId = ref(null)
const keepPersonneIdx    = ref(null)
const copieActive        = ref(false)

function toggleCopie() {
  copieActive.value = !copieActive.value
  if (!copieActive.value) {
    copierDepensesDeId.value = null
    keepPersonneIdx.value    = null
  } else if (foyersSource.value.length === 1) {
    copierDepensesDeId.value = foyersSource.value[0].id
  }
}

const foyersSource = computed(() => store.foyers)

const sourceFoyerPersonnes = computed(() => {
  if (!copierDepensesDeId.value) return []
  const f = store.foyers.find(f => f.id === copierDepensesDeId.value)
  return f?.config?.personnes ?? []
})

const personnes = ref([
  { nom: '', salaire: 0, couleur: '#7C6FCD' },
  { nom: '', salaire: 0, couleur: '#4A9EDB' },
])

const membresFiltres = computed(() => personnes.value.filter(p => p.nom.trim()))

const needsProfilePick = computed(() =>
  sourceFoyerPersonnes.value.length === 2 && membresFiltres.value.length === 1
)

const peutContinuer = computed(() => {
  if (etape.value === 1) return nom.value.trim().length > 0
  if (etape.value === 2) {
    if (!personnes.value.some(p => p.nom.trim().length > 0)) return false
    if (copieActive.value && !copierDepensesDeId.value) return false
    if (copieActive.value && needsProfilePick.value && keepPersonneIdx.value === null) return false
    return true
  }
  return true
})

const revenuTotal = computed(() => fmt(personnes.value.reduce((s, p) => s + (p.salaire || 0), 0)))

function fmt(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0)
}

function getInitiales(n) {
  if (!n) return '?'
  return n.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function suivant()   { if (etape.value < totalEtapes) etape.value++ }
function precedent() { if (etape.value > 1) etape.value-- }

function creer() {
  store.creerFoyer({
    nom:               nom.value.trim(),
    couleur:           couleur.value,
    personnes:         personnes.value,
    remplacerDefaut:   props.premierDemarrage,
    copierDepensesDeId: copierDepensesDeId.value,
    keepPersonneIdx:   keepPersonneIdx.value,
  })
  emit('fermer')
}

async function onImportCsvOnboarding(e) {
  const file = e.target.files?.[0]
  if (!file) return
  e.target.value = ''
  // Crée un foyer vide pour qu'importBudge ait un foyer actif à patcher
  store.creerFoyer({ nom: '_import', couleur: couleur.value, personnes: personnes.value, remplacerDefaut: props.premierDemarrage })
  try {
    await store.importBudge(file)
    emit('fermer') // ferme l'onboarding immédiatement, pas besoin des étapes 2 et 3
  } catch (err) {
    store.showNotification(err.message || 'Import échoué', 'error')
  }
}
</script>

<style scoped>
/* ═══════════════════════════════════════════════
   ONBOARDING SPLIT-SCREEN
═══════════════════════════════════════════════ */
.onboarding {
  position: fixed; inset: 0;
  display: flex;
  font-family: system-ui, -apple-system, sans-serif;
}
.onboarding--solo {
  position: absolute; inset: 0;
}
.onboarding--solo .onboarding__left {
  width: 100%;
}

/* ── Formulaire (droite) ── */
.onboarding__left {
  width: 50%; flex-shrink: 0;
  background: #fff;
  display: flex; align-items: center; justify-content: center;
  padding: 48px 40px;
  overflow-y: auto;
}
.onboarding__left-inner {
  width: 100%; max-width: 420px;
  display: flex; flex-direction: column; gap: 32px;
}

/* Stepper numéroté */
.onboarding__stepper {
  display: flex;
  align-items: flex-start;
}
.onboarding__stepper-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.onboarding__stepper-circle {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600;
  border: 2px solid #e4e4e7;
  background: #fff;
  color: #a1a1aa;
  transition: background 0.25s, border-color 0.25s, color 0.25s;
}
.onboarding__stepper-step.is-active .onboarding__stepper-circle {
  background: #18181b;
  border-color: #18181b;
  color: #fff;
}
.onboarding__stepper-step.is-done .onboarding__stepper-circle {
  background: #18181b;
  border-color: #18181b;
  color: #fff;
}
.onboarding__stepper-label {
  font-size: 11px; font-weight: 500;
  color: #a1a1aa;
  white-space: nowrap;
  transition: color 0.25s, font-weight 0.25s;
}
.onboarding__stepper-step.is-active .onboarding__stepper-label,
.onboarding__stepper-step.is-done .onboarding__stepper-label {
  color: #18181b;
  font-weight: 600;
}
.onboarding__stepper-line {
  flex: 1;
  height: 2px;
  background: #e4e4e7;
  margin-top: 15px;
  min-width: 24px;
  transition: background 0.3s;
}
.onboarding__stepper-line.is-done { background: #18181b; }

/* Step header */
.onboarding__form-head { display: flex; flex-direction: column; gap: 6px; }
.onboarding__title { font-size: 24px; font-weight: 700; color: #18181b; margin: 0; letter-spacing: -0.4px; line-height: 1.2; }
.onboarding__hint  { font-size: 14px; color: #71717a; margin: 0; line-height: 1.5; }

/* Fields */
.onboarding__fields { display: flex; flex-direction: column; gap: 18px; }
.onboarding__field  { display: flex; flex-direction: column; gap: 6px; }
.onboarding__label  { font-size: 12px; font-weight: 500; color: #52525b; }
.onboarding__input-wrap { position: relative; display: flex; align-items: center; }
.onboarding__input {
  width: 100%; height: 46px; padding: 0 14px;
  background: #fafafa; border: 1.5px solid #e4e4e7;
  border-radius: 10px; font-size: 14px; font-family: inherit; color: #18181b;
  outline: none; box-sizing: border-box; transition: border-color 0.15s, background 0.15s;
}
.onboarding__input-wrap .onboarding__input { padding-right: 64px; }
.onboarding__input:focus { border-color: #18181b; background: #fff; }
.onboarding__input::placeholder { color: #a1a1aa; }
.onboarding__suffix {
  position: absolute; right: 14px;
  font-size: 12px; color: #71717a; pointer-events: none;
}

/* Color picker */
.onboarding__colors { display: flex; gap: 10px; flex-wrap: wrap; }
.onboarding__color-btn {
  width: 30px; height: 30px; border-radius: 50%;
  border: 2.5px solid transparent; cursor: pointer;
  transition: transform 0.12s, border-color 0.12s;
  flex-shrink: 0;
}
.onboarding__color-btn:hover { transform: scale(1.15); }
.onboarding__color-btn--active { border-color: #18181b; transform: scale(1.15); }

/* Membres */
.onboarding__membre {
  background: #f9f9f9; border-radius: 12px; padding: 16px;
  display: flex; flex-direction: column; gap: 12px;
  border: 1.5px solid #f4f4f5;
}
.onboarding__membre--gap { margin-top: 12px; }
.onboarding__membre-header { display: flex; align-items: center; gap: 10px; }
.onboarding__membre-avatar {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: #fff; flex-shrink: 0;
}
.onboarding__membre-label { font-size: 13px; font-weight: 600; color: #18181b; }
.onboarding__membre-row { display: flex; flex-direction: column; gap: 12px; }

/* Récap */
.onboarding__recap {
  display: flex; align-items: center; gap: 14px;
  background: #f9f9f9; border-radius: 12px; padding: 16px;
  border: 1.5px solid #f4f4f5;
}
.onboarding__recap-avatar {
  width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 700; color: #fff;
}
.onboarding__recap-info { display: flex; flex-direction: column; gap: 3px; }
.onboarding__recap-nom  { font-size: 16px; font-weight: 700; color: #18181b; }
.onboarding__recap-sub  { font-size: 13px; color: #71717a; }
.onboarding__recap-list { display: flex; flex-direction: column; gap: 8px; }
.onboarding__recap-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; background: #f9f9f9; border-radius: 10px;
  border: 1.5px solid #f4f4f5;
}
.onboarding__recap-row-avatar {
  width: 28px; height: 28px; border-radius: 6px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: #fff;
}
.onboarding__recap-row-nom     { flex: 1; font-size: 13px; font-weight: 500; color: #18181b; }
.onboarding__recap-row-salaire { font-size: 13px; font-weight: 600; color: #18181b; }

/* Navigation */
.onboarding__nav {
  display: flex; flex-direction: column; gap: 10px;
}
.onboarding__btn {
  width: 100%; height: 48px;
  border-radius: 12px;
  font-size: 15px; font-weight: 500; font-family: inherit;
  cursor: pointer; border: none;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: background 0.15s, opacity 0.15s, color 0.15s;
}
.onboarding__btn--primary {
  background: #18181b; color: #fff;
}
.onboarding__btn--primary:hover:not(:disabled) { background: #27272a; }
.onboarding__btn--primary:disabled { opacity: 0.3; cursor: not-allowed; }
.onboarding__btn--ghost {
  background: transparent; color: #71717a;
  font-size: 13px; height: 36px;
  border: none;
}
.onboarding__btn--ghost:hover { color: #18181b; }

/* Séparateur "ou" */
.onboarding__divider {
  display: flex; align-items: center; gap: 12px;
  color: #d4d4d8; font-size: 12px;
}
.onboarding__divider::before,
.onboarding__divider::after {
  content: ''; flex: 1; height: 1px; background: #e4e4e7;
}

/* Import CSV onboarding */
.onboarding__import-csv {
  display: flex; align-items: center; gap: 12px;
  width: 100%; padding: 12px 14px;
  background: #f9f9f9; border: 1.5px dashed #d4d4d8;
  border-radius: 10px; cursor: pointer; font-family: inherit;
  text-align: left; transition: border-color 0.15s, background 0.15s;
  color: #52525b;
}
.onboarding__import-csv:hover { border-color: #18181b; background: #f4f4f5; }
.onboarding__import-csv svg { flex-shrink: 0; color: #71717a; }
.onboarding__import-csv-title { font-size: 13px; font-weight: 500; color: #18181b; }
.onboarding__import-csv-sub   { font-size: 12px; color: #71717a; margin-top: 1px; }

/* ── Panel dark (gauche) ── */
.onboarding__right {
  width: 50%;
  background: #18181b;
  position: relative; overflow: hidden;
  display: flex; flex-direction: column; justify-content: space-between;
  padding: 48px;
  flex-shrink: 0;
}
.onboarding__right-glow {
  position: absolute; bottom: -200px; left: -150px;
  width: 800px; height: 800px; border-radius: 50%;
  background: radial-gradient(circle, rgba(236,72,153,0.3) 0%, rgba(124,111,205,0.25) 35%, transparent 65%);
  filter: blur(40px);
  pointer-events: none;
}
.onboarding__right-top { position: relative; z-index: 1; }
.onboarding__right-logo { height: 50px; width: auto; display: block; }
.onboarding__right-content { position: relative; z-index: 1; }
.onboarding__right-badge {
  display: inline-flex; align-items: center;
  padding: 5px 12px; border-radius: 20px;
  background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7);
  font-size: 12px; font-weight: 500; margin-bottom: 24px;
}
.onboarding__right-title {
  font-size: 32px; font-weight: 700; color: #fff;
  line-height: 1.25; letter-spacing: -0.5px; margin: 0 0 16px;
  max-width: 360px;
}
.onboarding__right-sub {
  font-size: 15px; color: rgba(255,255,255,0.5);
  line-height: 1.6; margin: 0; max-width: 340px;
}
.onboarding__right-features {
  position: relative; z-index: 1;
  display: flex; flex-direction: column; gap: 20px;
}
.onboarding__feature { display: flex; align-items: flex-start; gap: 14px; }
.onboarding__feature-icon {
  font-size: 20px; width: 40px; height: 40px;
  background: rgba(255,255,255,0.08); border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.onboarding__feature-title { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 2px; }
.onboarding__feature-desc  { font-size: 13px; color: rgba(255,255,255,0.45); line-height: 1.4; }

@media (max-width: 768px) {
  .onboarding__right { display: none; }
  .onboarding__left  { width: 100%; }
}

/* ═══════════════════════════════════════════════
   MODALE (mode normal)
═══════════════════════════════════════════════ */
.fsetup-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; padding: 24px;
}
.fsetup {
  background: var(--background); border: 1px solid var(--border);
  border-radius: var(--radius-lg); box-shadow: var(--shadow-lg);
  width: 100%; max-width: 560px;
  display: flex; flex-direction: column; overflow: hidden;
  max-height: 90vh; overflow-y: auto;
}
.fsetup__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 16px; border-bottom: 1px solid var(--border); gap: 12px;
}
.fsetup__header-left { display: flex; align-items: center; gap: 10px; }
.fsetup__step-badge {
  font-size: 11px; font-weight: 600;
  background: var(--muted); color: var(--muted-foreground);
  padding: 3px 8px; border-radius: 20px; white-space: nowrap;
}
.fsetup__title { font-size: 14px; font-weight: 600; color: var(--foreground); }
.fsetup__close {
  display: flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 6px;
  background: none; border: none; cursor: pointer; color: var(--muted-foreground);
  transition: background 120ms, color 120ms; flex-shrink: 0;
}
.fsetup__close:hover { background: var(--muted); color: var(--foreground); }
.fsetup__body {
  padding: 24px; display: flex; flex-direction: column; gap: 20px; min-height: 220px;
}
.fsetup__hint  { font-size: 13px; color: var(--muted-foreground); margin: 0; }
.fsetup__field { display: flex; flex-direction: column; gap: 6px; }
.fsetup__label { font-size: 12px; font-weight: 500; color: var(--muted-foreground); }
.fsetup__input-wrap { position: relative; display: flex; align-items: center; }
.fsetup__input {
  width: 100%; height: 40px; padding: 0 12px;
  background: var(--background); border: 1px solid var(--input);
  border-radius: var(--radius-md); font-size: 14px; font-family: inherit; color: var(--foreground);
  outline: none; box-sizing: border-box; transition: border-color 150ms ease;
}
.fsetup__input-wrap .fsetup__input { padding-right: 60px; }
.fsetup__input:focus { border-color: var(--ring); }
.fsetup__suffix { position: absolute; right: 12px; font-size: 12px; color: var(--muted-foreground); pointer-events: none; }
.fsetup__colors { display: flex; gap: 8px; flex-wrap: wrap; }
.fsetup__color-btn {
  width: 28px; height: 28px; border-radius: 50%;
  border: 2px solid transparent; cursor: pointer; flex-shrink: 0;
  transition: transform 120ms, border-color 120ms;
}
.fsetup__color-btn:hover { transform: scale(1.1); }
.fsetup__color-btn--active { border-color: var(--foreground); transform: scale(1.1); }
.fsetup__membres-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
}
.fsetup__membre {
  background: var(--muted); border-radius: var(--radius-md); padding: 16px;
  display: flex; flex-direction: column; gap: 12px;
}
.fsetup__membre-header { display: flex; align-items: center; gap: 10px; }
.fsetup__membre-avatar {
  width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700; color: #fff;
}
.fsetup__membre-label { font-size: 13px; font-weight: 600; color: var(--foreground); }
.fsetup__membre-fields { display: flex; flex-direction: column; gap: 12px; }
.fsetup__recap {
  display: flex; align-items: center; gap: 14px;
  background: var(--muted); border-radius: var(--radius-md); padding: 16px;
}
.fsetup__recap-avatar {
  width: 44px; height: 44px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; font-weight: 700; color: #fff;
}
.fsetup__recap-info { display: flex; flex-direction: column; gap: 3px; }
.fsetup__recap-nom    { font-size: 16px; font-weight: 700; color: var(--foreground); }
.fsetup__recap-detail { font-size: 12px; color: var(--muted-foreground); }
.fsetup__recap-list { display: flex; flex-direction: column; gap: 8px; }
.fsetup__recap-row {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; background: var(--muted); border-radius: var(--radius-md);
}
.fsetup__recap-row-avatar {
  width: 28px; height: 28px; border-radius: 6px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: #fff;
}
.fsetup__recap-row-nom     { flex: 1; font-size: 13px; font-weight: 500; color: var(--foreground); }
.fsetup__recap-row-salaire { font-size: 13px; font-weight: 600; color: var(--foreground); }
/* Toggle copie */
.fsetup__copy-toggle-wrap { display: flex; flex-direction: column; gap: 10px; }
.fsetup__copy-toggle {
  display: flex; align-items: center; justify-content: space-between;
  width: 100%; background: none; border: none; cursor: pointer;
  font-family: inherit; padding: 0;
}
.fsetup__copy-toggle-label { font-size: 13px; font-weight: 500; color: var(--foreground); }
.fsetup__toggle-track {
  width: 36px; height: 20px; border-radius: 99px;
  background: var(--border); position: relative;
  transition: background 0.2s; flex-shrink: 0;
}
.fsetup__toggle-track--on { background: var(--primary); }
.fsetup__toggle-thumb {
  position: absolute; top: 3px; left: 3px;
  width: 14px; height: 14px; border-radius: 50%;
  background: white; transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.fsetup__toggle-track--on .fsetup__toggle-thumb { transform: translateX(16px); }

.fsetup__copy-list { display: flex; flex-direction: column; gap: 6px; }
.fsetup__copy-row {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 10px 12px; border-radius: var(--radius-md);
  background: var(--muted); border: 1.5px solid transparent;
  cursor: pointer; font-family: inherit; text-align: left;
  transition: border-color 0.12s, background 0.12s;
}
.fsetup__copy-row:hover { border-color: var(--border); }
.fsetup__copy-row--active { border-color: var(--foreground); background: var(--background); }
.fsetup__copy-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.fsetup__copy-none-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; background: var(--border); }
.fsetup__copy-name { flex: 1; font-size: 13px; font-weight: 500; color: var(--foreground); }
.fsetup__copy-count { font-size: 12px; color: var(--muted-foreground); }

.fsetup__footer {
  display: flex; align-items: center; gap: 10px;
  padding: 16px 24px; border-top: 1px solid var(--border);
}
.fsetup__btn {
  height: 38px; padding: 0 20px; border-radius: var(--radius-md);
  font-size: 13px; font-weight: 500; font-family: inherit;
  cursor: pointer; border: none; transition: background 150ms, color 150ms;
}
.fsetup__btn--ghost   { background: none; border: 1px solid var(--border); color: var(--foreground); }
.fsetup__btn--ghost:hover { background: var(--muted); }
.fsetup__btn--primary { background: var(--primary); color: var(--primary-foreground); }
.fsetup__btn--primary:hover:not(:disabled) { background: var(--zinc-800); }
.fsetup__btn--primary:disabled { opacity: 0.4; cursor: not-allowed; }

/* Sélection de profil (modale) */
.fsetup__profil-pick { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
.fsetup__profil-title { font-size: 12px; font-weight: 500; color: var(--muted-foreground); margin: 0; }
.fsetup__profil-btns { display: flex; gap: 8px; flex-wrap: wrap; }
.fsetup__profil-btn {
  flex: 1; min-width: 180px; display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: var(--radius-md);
  background: var(--muted); border: 1.5px solid transparent;
  cursor: pointer; font-family: inherit; text-align: left;
  transition: border-color 0.15s, background 0.15s;
}
.fsetup__profil-btn:hover { border-color: var(--border); }
.fsetup__profil-btn--active { border-color: currentColor; }
.fsetup__profil-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.fsetup__profil-nom  { font-size: 13px; font-weight: 600; color: var(--foreground); }
.fsetup__profil-hint { font-size: 11px; color: var(--muted-foreground); margin-top: 1px; }

/* Sélection de profil (onboarding) */
.onboarding__copy-list { display: flex; flex-direction: column; gap: 6px; }
.onboarding__copy-row {
  display: flex; align-items: center; gap: 10px;
  width: 100%; padding: 10px 12px; border-radius: 10px;
  background: #f9f9f9; border: 1.5px solid transparent;
  cursor: pointer; font-family: inherit; text-align: left;
  transition: border-color 0.12s, background 0.12s;
}
.onboarding__copy-row:hover { border-color: #d4d4d8; }
.onboarding__copy-row--active { border-color: #18181b; background: #fff; }
.onboarding__copy-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.onboarding__copy-none-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; background: #d4d4d8; }
.onboarding__copy-name { flex: 1; font-size: 13px; font-weight: 500; color: #18181b; }
.onboarding__copy-count { font-size: 12px; color: #71717a; }

.onboarding__profil-pick { display: flex; flex-direction: column; gap: 8px; margin-top: 4px; }
.onboarding__profil-title { font-size: 12px; font-weight: 500; color: #71717a; margin: 0; }
.onboarding__profil-btns { display: flex; gap: 8px; }
.onboarding__profil-btn {
  flex: 1; display: flex; align-items: center; gap: 10px;
  padding: 10px 12px; border-radius: 10px;
  background: #f9f9f9; border: 1.5px solid transparent;
  cursor: pointer; font-family: inherit; text-align: left;
  transition: border-color 0.15s, background 0.15s;
}
.onboarding__profil-btn:hover { border-color: #d4d4d8; }
.onboarding__profil-btn--active { border-color: currentColor; }
.onboarding__profil-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.onboarding__profil-nom  { font-size: 13px; font-weight: 600; color: #18181b; }
.onboarding__profil-hint { font-size: 11px; color: #71717a; margin-top: 1px; }
</style>
