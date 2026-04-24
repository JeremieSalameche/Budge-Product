<template>
  <Teleport to="body">
    <div class="fsetup-overlay" @click.self="!premierDemarrage && $emit('fermer')">
      <div class="fsetup">

        <!-- Header -->
        <div class="fsetup__header">
          <div class="fsetup__header-left">
            <div class="fsetup__step-badge">Étape {{ etape }}/{{ totalEtapes }}</div>
            <span class="fsetup__title">{{ titresEtapes[etape - 1] }}</span>
          </div>
          <button v-if="!premierDemarrage" class="fsetup__close" type="button" @click="$emit('fermer')">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- Étape 1 : Nom du foyer -->
        <div v-if="etape === 1" class="fsetup__body">
          <p class="fsetup__hint">Donnez un nom à votre foyer pour le distinguer des autres.</p>

          <div class="fsetup__field">
            <label class="fsetup__label">Nom du foyer</label>
            <input
              class="fsetup__input"
              v-model="nom"
              type="text"
              placeholder="Ex : Famille Martin, Notre appartement…"
              @keydown.enter="peutContinuer && suivant()"
              autofocus
            />
          </div>

          <div class="fsetup__field">
            <label class="fsetup__label">Couleur d'identification</label>
            <div class="fsetup__colors">
              <button
                v-for="c in couleurs"
                :key="c"
                type="button"
                class="fsetup__color-btn"
                :class="{ 'fsetup__color-btn--active': couleur === c }"
                :style="{ background: c }"
                @click="couleur = c"
              ></button>
            </div>
          </div>
        </div>

        <!-- Étape 2 : Membres -->
        <div v-if="etape === 2" class="fsetup__body">
          <p class="fsetup__hint">Renseignez les informations des membres du foyer.</p>

          <div v-for="(p, i) in personnes" :key="i" class="fsetup__membre">
            <div class="fsetup__membre-header">
              <div class="fsetup__membre-avatar" :style="{ background: p.couleur }">
                {{ p.nom ? p.nom[0].toUpperCase() : (i === 0 ? 'A' : 'B') }}
              </div>
              <span class="fsetup__membre-label">Personne {{ i + 1 }}</span>
            </div>
            <div class="fsetup__membre-fields">
              <div class="fsetup__field">
                <label class="fsetup__label">Prénom</label>
                <input
                  class="fsetup__input"
                  v-model="p.nom"
                  type="text"
                  :placeholder="i === 0 ? 'Ex : Marie' : 'Ex : Thomas'"
                />
              </div>
              <div class="fsetup__field">
                <label class="fsetup__label">Salaire net mensuel</label>
                <div class="fsetup__input-wrap">
                  <input
                    class="fsetup__input"
                    v-model.number="p.salaire"
                    type="number"
                    min="0"
                    step="100"
                    placeholder="0"
                  />
                  <span class="fsetup__suffix">€/mois</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Étape 3 : Confirmation -->
        <div v-if="etape === 3" class="fsetup__body">
          <div class="fsetup__recap">
            <div class="fsetup__recap-avatar" :style="{ background: couleur }">
              {{ getInitiales(nom) }}
            </div>
            <div class="fsetup__recap-info">
              <span class="fsetup__recap-nom">{{ nom }}</span>
              <span class="fsetup__recap-detail">
                {{ revenuTotal }}/mois
                <template v-if="membresFiltres.length">
                  · {{ membresFiltres.map(p => p.nom).join(' &amp; ') }}
                </template>
              </span>
            </div>
          </div>

          <div class="fsetup__recap-list">
            <div v-for="p in membresFiltres" :key="p.nom" class="fsetup__recap-row">
              <div class="fsetup__recap-row-avatar" :style="{ background: p.couleur }">
                {{ p.nom[0].toUpperCase() }}
              </div>
              <span class="fsetup__recap-row-nom">{{ p.nom }}</span>
              <span class="fsetup__recap-row-salaire">{{ fmt(p.salaire) }}/mois</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="fsetup__footer">
          <button
            v-if="etape > 1"
            class="fsetup__btn fsetup__btn--ghost"
            type="button"
            @click="precedent"
          >
            Retour
          </button>
          <div style="flex:1"></div>
          <button
            class="fsetup__btn fsetup__btn--primary"
            type="button"
            :disabled="!peutContinuer"
            @click="etape < totalEtapes ? suivant() : creer()"
          >
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
})
const emit = defineEmits(['fermer'])

const store = useBudgetStore()

const totalEtapes   = 3
const titresEtapes  = ['Nommer le foyer', 'Les membres', 'Confirmation']

const etape   = ref(1)
const nom     = ref('')
const couleur = ref('#7C6FCD')
const couleurs = [
  '#7C6FCD', '#4A9EDB', '#10B981', '#F59E0B',
  '#EF4444', '#EC4899', '#6366F1', '#14B8A6',
]

const personnes = ref([
  { nom: '', salaire: 0, couleur: '#7C6FCD' },
  { nom: '', salaire: 0, couleur: '#4A9EDB' },
])

const membresFiltres = computed(() => personnes.value.filter(p => p.nom.trim()))

const peutContinuer = computed(() => {
  if (etape.value === 1) return nom.value.trim().length > 0
  if (etape.value === 2) return personnes.value.some(p => p.nom.trim().length > 0)
  return true
})

const revenuTotal = computed(() => {
  const total = personnes.value.reduce((s, p) => s + (p.salaire || 0), 0)
  return fmt(total)
})

function fmt(n) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  }).format(n || 0)
}

function getInitiales(n) {
  if (!n) return '?'
  return n.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function suivant()  { if (etape.value < totalEtapes) etape.value++ }
function precedent() { if (etape.value > 1) etape.value-- }

function creer() {
  store.creerFoyer({
    nom:      nom.value.trim(),
    couleur:  couleur.value,
    personnes: personnes.value,
  })
  emit('fermer')
}
</script>

<style scoped>
.fsetup-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(0, 0, 0, 0.45);
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
}

.fsetup {
  background: var(--background);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 100%; max-width: 480px;
  display: flex; flex-direction: column;
  overflow: hidden;
}

/* Header */
.fsetup__header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border);
  gap: 12px;
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
  background: none; border: none; cursor: pointer;
  color: var(--muted-foreground);
  transition: background 120ms, color 120ms;
  flex-shrink: 0;
}
.fsetup__close:hover { background: var(--muted); color: var(--foreground); }

/* Body */
.fsetup__body {
  padding: 24px;
  display: flex; flex-direction: column; gap: 20px;
  min-height: 220px;
}
.fsetup__hint { font-size: 13px; color: var(--muted-foreground); margin: 0; }

.fsetup__field { display: flex; flex-direction: column; gap: 6px; }
.fsetup__label { font-size: 12px; font-weight: 500; color: var(--muted-foreground); }

.fsetup__input-wrap { position: relative; display: flex; align-items: center; }
.fsetup__input {
  width: 100%; height: 40px; padding: 0 12px;
  background: var(--background); border: 1px solid var(--input);
  border-radius: var(--radius-md); font-size: 14px; font-family: inherit; color: var(--foreground);
  outline: none; box-sizing: border-box;
  transition: border-color 150ms ease;
}
.fsetup__input-wrap .fsetup__input { padding-right: 60px; }
.fsetup__input:focus { border-color: var(--ring); }
.fsetup__suffix {
  position: absolute; right: 12px;
  font-size: 12px; color: var(--muted-foreground); pointer-events: none;
}

/* Couleurs */
.fsetup__colors { display: flex; gap: 8px; flex-wrap: wrap; }
.fsetup__color-btn {
  width: 28px; height: 28px; border-radius: 50%;
  border: 2px solid transparent; cursor: pointer; flex-shrink: 0;
  transition: transform 120ms, border-color 120ms;
}
.fsetup__color-btn:hover { transform: scale(1.1); }
.fsetup__color-btn--active { border-color: var(--foreground); transform: scale(1.1); }

/* Membres */
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

/* Récap étape 3 */
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
.fsetup__recap-nom { font-size: 16px; font-weight: 700; color: var(--foreground); }
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
.fsetup__recap-row-nom { flex: 1; font-size: 13px; font-weight: 500; color: var(--foreground); }
.fsetup__recap-row-salaire { font-size: 13px; font-weight: 600; color: var(--foreground); }

/* Footer */
.fsetup__footer {
  display: flex; align-items: center; gap: 10px;
  padding: 16px 24px;
  border-top: 1px solid var(--border);
}

.fsetup__btn {
  height: 38px; padding: 0 20px;
  border-radius: var(--radius-md); font-size: 13px; font-weight: 500; font-family: inherit;
  cursor: pointer; border: none; transition: background 150ms, color 150ms;
}
.fsetup__btn--ghost {
  background: none; border: 1px solid var(--border); color: var(--foreground);
}
.fsetup__btn--ghost:hover { background: var(--muted); }
.fsetup__btn--primary {
  background: var(--primary); color: var(--primary-foreground);
}
.fsetup__btn--primary:hover:not(:disabled) { background: var(--zinc-800); }
.fsetup__btn--primary:disabled { opacity: 0.4; cursor: not-allowed; }
</style>
