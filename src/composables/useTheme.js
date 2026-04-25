import { ref, watch } from 'vue'

const theme = ref(localStorage.getItem('budge-theme') || 'light')

watch(theme, val => {
  localStorage.setItem('budge-theme', val)
  document.documentElement.setAttribute('data-theme', val)
}, { immediate: true })

export function useTheme() {
  return { theme }
}
