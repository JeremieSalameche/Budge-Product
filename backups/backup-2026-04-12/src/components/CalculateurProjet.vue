<template>
  <div class="cp">
    <div class="cp__header">
      <div class="cp__title-row">
        <div class="cp__icon-cartouche">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="6"/>
            <circle cx="12" cy="12" r="2"/>
          </svg>
        </div>
        <span class="cp__title">Calculateur de projet</span>
      </div>
      <span class="cp__subtitle">Combien de temps pour concrétiser votre projet ?</span>
    </div>

    <!-- Input montant -->
    <div class="cp__input-wrap">
      <input
        class="cp__input"
        type="number"
        min="0"
        step="500"
        v-model.number="montantProjet"
        placeholder="15 000"
      />
      <span class="cp__input-suffix">€</span>
    </div>

    <template v-if="montantProjet > 0">
      <!-- Bloc épargne déjà accumulée -->
      <div v-if="totalEpargneCouple > 0" class="cp__info-bloc">
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none" class="cp__info-icon">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/>
          <path d="M5.5 8.5l2 2 3-3.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <div class="cp__info-text">
          <span>Vous avez déjà <strong>{{ fmt(totalEpargneCouple) }}</strong> d'épargne cumulée</span>
          <span class="cp__info-detail">
            {{ store.personnes[0]?.nom }} {{ fmt(totalEpargneP1) }}
            &nbsp;·&nbsp;
            {{ store.personnes[1]?.nom }} {{ fmt(totalEpargneP2) }}
          </span>
        </div>
      </div>

      <!-- Projet déjà couvert par l'épargne couple -->
      <div v-if="montantProjet <= totalEpargneCouple" class="cp__success-bloc">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="9.5" stroke="currentColor" stroke-width="1.6"/>
          <path d="M7 11.5l3 3 5-5.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Votre épargne actuelle couvre déjà ce projet ✓</span>
      </div>

      <!-- Résultats -->
      <div v-else class="cp__results">
        <!-- P1 -->
        <div class="cp__row">
          <svg class="cp__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="5" r="3" stroke="currentColor" stroke-width="1.4"/>
            <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
          <span class="cp__row-label">
            {{ store.personnes[0]?.nom }} — il reste <strong>{{ fmt(resteP1) }}</strong> à épargner
          </span>
          <span v-if="resteP1 === 0" class="cp__row-done">Objectif atteint ✓</span>
          <span v-else-if="epargneP1 > 0" class="cp__row-dur">{{ fmtDuree(resteP1 / epargneP1) }}</span>
          <span v-else class="cp__row-err">Dépenses supérieures aux revenus</span>
        </div>

        <!-- P2 -->
        <div class="cp__row">
          <svg class="cp__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="5" r="3" stroke="currentColor" stroke-width="1.4"/>
            <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
          <span class="cp__row-label">
            {{ store.personnes[1]?.nom }} — il reste <strong>{{ fmt(resteP2) }}</strong> à épargner
          </span>
          <span v-if="resteP2 === 0" class="cp__row-done">Objectif atteint ✓</span>
          <span v-else-if="epargneP2 > 0" class="cp__row-dur">{{ fmtDuree(resteP2 / epargneP2) }}</span>
          <span v-else class="cp__row-err">Dépenses supérieures aux revenus</span>
        </div>

        <!-- Couple -->
        <div class="cp__row cp__row--couple">
          <svg class="cp__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="5.5" cy="5" r="2.5" stroke="currentColor" stroke-width="1.4"/>
            <circle cx="10.5" cy="5" r="2.5" stroke="currentColor" stroke-width="1.4"/>
            <path d="M1 14c0-2.761 2.015-5 4.5-5M15 14c0-2.761-2.015-5-4.5-5M8 9c1.657 0 3 2.239 3 5H5c0-2.761 1.343-5 3-5z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
          <span class="cp__row-label">
            Ensemble — il reste <strong>{{ fmt(resteCouple) }}</strong> à épargner
          </span>
          <span v-if="resteCouple === 0" class="cp__row-done">Objectif atteint ✓</span>
          <span v-else-if="epargneCouple > 0" class="cp__row-dur cp__row-dur--green">{{ fmtDuree(resteCouple / epargneCouple) }}</span>
          <span v-else class="cp__row-err">Revenus combinés insuffisants</span>
        </div>

        <!-- Épargnes mensuelles de référence -->
        <div class="cp__ref">
          <span>Épargne mensuelle disponible :</span>
          <span :style="{ color: epargneP1 > 0 ? 'var(--primary)' : 'var(--color-danger)' }">
            {{ store.personnes[0]?.nom }} {{ fmt(epargneP1) }}/mois
          </span>
          <span :style="{ color: epargneP2 > 0 ? 'var(--chart-p2)' : 'var(--color-danger)' }">
            {{ store.personnes[1]?.nom }} {{ fmt(epargneP2) }}/mois
          </span>
        </div>
      </div>
    </template>

    <div v-else class="cp__placeholder">
      Saisissez un montant pour estimer le délai de réalisation.
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBudgetStore } from '../stores/budget'

const store = useBudgetStore()
const montantProjet = ref(null)

// Épargne mensuelle disponible
const epargneP1 = computed(() => (store.personnes[0]?.salaire || 0) - store.totalMensuelP1)
const epargneP2 = computed(() => (store.personnes[1]?.salaire || 0) - store.totalMensuelP2)
const epargneCouple = computed(() => epargneP1.value + epargneP2.value)

// Épargne déjà accumulée (depuis le suivi)
const totalEpargneP1 = computed(() => store.totalEpargneParPersonne.p1)
const totalEpargneP2 = computed(() => store.totalEpargneParPersonne.p2)
const totalEpargneCouple = computed(() => totalEpargneP1.value + totalEpargneP2.value)

// Ce qu'il reste à épargner
const resteP1 = computed(() => Math.max(0, (montantProjet.value || 0) - totalEpargneP1.value))
const resteP2 = computed(() => Math.max(0, (montantProjet.value || 0) - totalEpargneP2.value))
const resteCouple = computed(() => Math.max(0, (montantProjet.value || 0) - totalEpargneCouple.value))

function fmt(n = 0) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

function fmtDuree(mois) {
  if (!isFinite(mois) || mois <= 0) return '—'
  const ans = Math.floor(mois / 12)
  const m = Math.round(mois % 12)
  if (ans === 0) return `${m} mois`
  if (m === 0) return `${ans} an${ans > 1 ? 's' : ''}`
  return `${ans} an${ans > 1 ? 's' : ''} et ${m} mois`
}
</script>

<style scoped>
.cp { display: flex; flex-direction: column; gap: 14px; height: 100%; }

.cp__header { display: flex; flex-direction: column; gap: 4px; }
.cp__title-row { display: flex; align-items: center; gap: 8px; }
.cp__title    { font-size: 14px; font-weight: 600; color: var(--foreground); }

.cp__icon-cartouche {
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
.cp__subtitle { font-size: 12px; color: var(--muted-foreground); }

/* Input montant */
.cp__input-wrap {
  position: relative;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  display: flex; align-items: center;
}
.cp__input {
  width: 100%; padding: 14px 44px 14px 20px;
  font-size: 28px; font-weight: 600; text-align: center;
  font-family: inherit; color: var(--foreground);
  background: transparent; border: none; outline: none;
}
.cp__input::placeholder { color: var(--muted-foreground); font-weight: 400; opacity: 0.4; }
.cp__input-suffix {
  position: absolute; right: 16px;
  font-size: 20px; font-weight: 600; color: var(--muted-foreground);
  pointer-events: none; opacity: 0.5;
}

/* Bloc épargne accumulée */
.cp__info-bloc {
  display: flex; align-items: flex-start; gap: 10px;
  background: var(--accent); border-radius: var(--radius-md); padding: 10px 14px;
  color: var(--accent-foreground);
}
.cp__info-icon { flex-shrink: 0; margin-top: 1px; color: var(--foreground); }
.cp__info-text { display: flex; flex-direction: column; gap: 2px; font-size: 13px; }
.cp__info-text strong { font-weight: 700; }
.cp__info-detail { font-size: 11px; color: var(--muted-foreground); }

/* Bloc succès */
.cp__success-bloc {
  display: flex; align-items: center; gap: 10px;
  background: var(--color-success-subtle);
  color: var(--color-success-text);
  border-radius: var(--radius-md); padding: 14px 16px;
  font-size: 15px; font-weight: 600;
}

/* Résultats */
.cp__results { display: flex; flex-direction: column; gap: 8px; }

.cp__row {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  background: var(--muted); border-radius: var(--radius-md); padding: 10px 14px;
}
.cp__row--couple { background: var(--color-success-subtle); }
.cp__icon { flex-shrink: 0; color: var(--muted-foreground); }
.cp__row--couple .cp__icon { color: var(--color-success); }

.cp__row-label { font-size: 13px; color: var(--muted-foreground); flex: 1; min-width: 0; }
.cp__row-label strong { color: var(--foreground); }
.cp__row-dur {
  font-size: 14px; font-weight: 600; color: var(--foreground); flex-shrink: 0;
}
.cp__row-dur--green { color: var(--color-success); }
.cp__row-done { font-size: 13px; font-weight: 600; color: var(--color-success); flex-shrink: 0; }
.cp__row-err { font-size: 12px; color: var(--color-danger); flex-shrink: 0; }

/* Référence épargnes mensuelles */
.cp__ref {
  display: flex; gap: 12px; flex-wrap: wrap; align-items: center;
  font-size: 11px; color: var(--muted-foreground);
  padding: 8px 0 0;
  border-top: 1px solid var(--border);
}

/* Placeholder */
.cp__placeholder {
  flex: 1; display: flex; align-items: center; justify-content: center;
  font-size: 12px; color: var(--muted-foreground); text-align: center;
  padding: 20px;
}
</style>
