import { ref, watch } from 'vue'
import { useBudgetStore } from '../stores/budget'

export function useStorage() {
  const store = useBudgetStore()
  let debounceTimer = null

  function scheduleAutoSave() {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => { store.saveToStorage() }, 500)
  }

  const lastSavedLabel = ref('')

  function updateLabel() {
    if (!store.lastSaved) { lastSavedLabel.value = 'Non sauvegardé'; return }
    const secs = Math.floor((Date.now() - store.lastSaved) / 1000)
    if (secs < 5)   lastSavedLabel.value = 'Sauvegardé à l\'instant'
    else if (secs < 60)  lastSavedLabel.value = `Sauvegardé il y a ${secs}s`
    else if (secs < 3600) lastSavedLabel.value = `Sauvegardé il y a ${Math.floor(secs/60)}min`
    else lastSavedLabel.value = `Sauvegardé il y a ${Math.floor(secs/3600)}h`
  }

  setInterval(updateLabel, 5000)
  watch(() => store.lastSaved, updateLabel, { immediate: true })

  return { scheduleAutoSave, lastSavedLabel }
}
