<template>
  <Transition name="calcsel">
    <div v-if="selectedIds.length > 0" class="calcsel">
      <div class="calcsel__inner">
        <div class="calcsel__info">
          <span class="calcsel__count">{{ selectedIds.length }} ligne{{ selectedIds.length > 1 ? 's' : '' }}</span>
          <div class="calcsel__metrics">
            <div class="calcsel__metric">
              <span class="calcsel__metric-label">Total sélection</span>
              <span class="calcsel__metric-value">{{ fmt(totalSelection) }}</span>
            </div>
            <div class="calcsel__metric" v-for="p in store.personnes" :key="p.id">
              <span class="calcsel__metric-label" :style="{ color: p.couleur }">{{ p.nom }}</span>
              <span class="calcsel__metric-value">{{ fmt(partParPersonne[p.id] || 0) }}</span>
            </div>
          </div>
        </div>
        <div class="calcsel__actions">
          <MsButton variant="secondary" size="sm" @click="$emit('clear')">Tout désélectionner</MsButton>
          <MsButton variant="primary" size="sm" @click="showModal = true">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
            Créer enveloppe
          </MsButton>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Modal création enveloppe depuis sélection -->
  <Teleport to="body">
    <div v-if="showModal" class="calcsel__modal-overlay" @click.self="showModal = false">
      <div class="calcsel__modal">
        <h3>Créer une enveloppe depuis la sélection</h3>
        <p>{{ selectedIds.length }} dépense{{ selectedIds.length > 1 ? 's' : '' }} · {{ fmt(totalSelection) }}/mois</p>
        <MsInput label="Nom de l'enveloppe" v-model="newName" placeholder="Ex: Charges fixes" />
        <div class="calcsel__modal-actions">
          <MsButton variant="secondary" @click="showModal = false">Annuler</MsButton>
          <MsButton variant="primary" @click="createEnveloppe" :disabled="!newName.trim()">Créer</MsButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBudgetStore } from '../stores/budget'
import { useStorage } from '../composables/useStorage'
import { MsButton, MsInput } from './ui/index.js'

const props = defineProps({ selectedIds: { type: Array, default: () => [] } })
const emit  = defineEmits(['clear'])

const store = useBudgetStore()
const { scheduleAutoSave } = useStorage()

const showModal = ref(false)
const newName   = ref('')

const selectedDepenses = computed(() => store.depenses.filter(d => props.selectedIds.includes(d.id)))

const totalSelection = computed(() =>
  selectedDepenses.value.filter(d => d.actif).reduce((s, d) => s + store.toMonthly(d.montant, d.frequence), 0)
)
const partParPersonne = computed(() => {
  const res = {}
  store.personnes.forEach(p => { res[p.id] = 0 })
  selectedDepenses.value.filter(d => d.actif).forEach(d => {
    const m = store.toMonthly(d.montant, d.frequence)
    store.personnes.forEach(p => { res[p.id] += m * ((d.repartition[p.id] || 0) / 100) })
  })
  return res
})

function createEnveloppe() {
  if (!newName.value.trim()) return
  store.addEnveloppe(newName.value.trim(), [...props.selectedIds])
  scheduleAutoSave()
  newName.value  = ''
  showModal.value = false
  emit('clear')
  store.showNotification(`Enveloppe « ${newName.value || 'nouvelle'} » créée`, 'success')
}

function fmt(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}
</script>

<style scoped>
.calcsel {
  position: sticky; bottom: var(--space-xl);
  z-index: 50; pointer-events: none;
}
.calcsel__inner {
  background: var(--primary);
  border-radius: var(--radius-lg);
  padding: var(--space-lg) var(--space-xl);
  display: flex; align-items: center; justify-content: space-between; gap: var(--space-xl);
  box-shadow: var(--shadow-lg);
  pointer-events: all;
  border: 1px solid var(--zinc-700);
}
.calcsel__info { display: flex; align-items: center; gap: var(--space-xl); }
.calcsel__count { font-size: 13px; font-weight: 600; color: rgba(250,250,250,0.7); }
.calcsel__metrics { display: flex; gap: var(--space-xl); }
.calcsel__metric { display: flex; flex-direction: column; gap: 2px; }
.calcsel__metric-label { font-size: 11px; color: rgba(250,250,250,0.5); }
.calcsel__metric-value { font-size: 15px; font-weight: 700; color: var(--primary-foreground); }
.calcsel__actions { display: flex; gap: var(--space-sm); }

/* Transition */
.calcsel-enter-active, .calcsel-leave-active { transition: all 0.3s ease; }
.calcsel-enter-from, .calcsel-leave-to { opacity: 0; transform: translateY(20px); }

/* Modal */
.calcsel__modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.calcsel__modal {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: var(--space-xl); max-width: 360px; width: 90%;
  box-shadow: var(--shadow-xl);
  display: flex; flex-direction: column; gap: var(--space-lg);
}
.calcsel__modal h3 { font-size: 16px; font-weight: 600; }
.calcsel__modal p  { font-size: 13px; color: var(--muted-foreground); }
.calcsel__modal-actions { display: flex; gap: var(--space-sm); justify-content: flex-end; }
</style>
