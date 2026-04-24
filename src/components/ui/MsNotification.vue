<template>
  <Transition name="notif">
    <div v-if="visible" :class="['ms-notif', `ms-notif--${type}`]" role="alert">
      <span class="ms-notif__icon">{{ icons[type] }}</span>
      <span class="ms-notif__msg">{{ message }}</span>
      <button class="ms-notif__close" @click="$emit('close')" type="button">✕</button>
    </div>
  </Transition>
</template>

<script setup>
import { watch } from 'vue'
const props = defineProps({
  message:  { type: String, default: '' },
  type:     { type: String, default: 'info' }, // success | error | warning | info
  duration: { type: Number, default: 3000 },
  visible:  { type: Boolean, default: false },
})
const emit = defineEmits(['close'])
const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' }

watch(() => props.visible, (val) => {
  if (val && props.duration > 0) {
    setTimeout(() => emit('close'), props.duration)
  }
})
</script>

<style scoped>
.ms-notif {
  background: var(--popover);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 14px 16px;
  box-shadow: var(--shadow-lg);
  display: flex; align-items: flex-start; gap: 10px;
  max-width: 360px;
  font-size: 14px; font-weight: 500;
  pointer-events: all;
}
.ms-notif--success { border-left: 4px solid var(--color-success); color: var(--color-success-text); }
.ms-notif--error   { border-left: 4px solid var(--color-danger); color: var(--color-danger-text); }
.ms-notif--warning { border-left: 4px solid var(--color-warning); color: var(--color-warning-text); }
.ms-notif--info    { border-left: 4px solid var(--muted-foreground); color: var(--foreground); }
.ms-notif__icon { font-size: 16px; }
.ms-notif__msg  { flex: 1; }
.ms-notif__close { background: none; border: none; cursor: pointer; opacity: 0.5; font-size: 12px; padding: 2px; }
.ms-notif__close:hover { opacity: 1; }

.notif-enter-active, .notif-leave-active { transition: all 0.3s ease; }
.notif-enter-from { opacity: 0; transform: translateY(-12px); }
.notif-leave-to   { opacity: 0; transform: translateX(20px); }
</style>
