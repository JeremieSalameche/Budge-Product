<template>
  <div class="pe">
    <SuiviEpargne />
  </div>
</template>

<script setup>
import SuiviEpargne from './SuiviEpargne.vue'
</script>

<style scoped>
.pe {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 20px;
}

@media (max-width: 768px) {
  .pe {
    background: transparent;
    border: none;
    border-radius: 0;
    padding: 0;
  }
}
</style>
