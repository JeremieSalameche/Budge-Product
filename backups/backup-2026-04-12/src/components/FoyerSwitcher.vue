<template>
  <div class="fs" ref="switcherRef">
    <!-- Trigger -->
    <button class="fs__trigger" type="button" @click.stop="popoverOuvert = !popoverOuvert">
      <span class="fs__trigger-bullet" :style="{ background: store.foyerActif?.couleur || '#7C6FCD' }"></span>
      <span class="fs__trigger-nom">{{ store.foyerActif?.nom || 'Mon foyer' }}</span>
      <svg
        class="fs__chevron"
        :class="{ 'fs__chevron--open': popoverOuvert }"
        width="14" height="14" viewBox="0 0 14 14" fill="none"
      >
        <path d="M3 5l4 4 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>

    <!-- Dropdown -->
    <div v-if="popoverOuvert" class="fs__dropdown" @click.stop>

      <!-- Liste des foyers -->
      <div class="fs__list">
        <div
          v-for="f in store.foyers"
          :key="f.id"
          class="fs__item"
        >
          <!-- Sélection -->
          <button class="fs__item-select" type="button" @click="selectionner(f.id)">
            <svg
              class="fs__item-check"
              :style="{ opacity: f.id === store.foyerActifId ? 1 : 0 }"
              width="14" height="14" viewBox="0 0 14 14" fill="none"
            >
              <path d="M2 7.5l3.5 3.5 6.5-7" stroke="#22C55E" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="fs__item-bullet" :style="{ background: f.couleur || '#7C6FCD' }"></span>
            <span class="fs__item-nom">{{ f.nom }}</span>
          </button>

          <!-- Roue crantée -->
          <button
            v-if="f.id === store.foyerActifId"
            class="fs__gear"
            type="button"
            @click.stop="ouvrirEdit"
            title="Modifier le foyer"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
              <path d="M6.5 1.5h3l.5 1.5a5 5 0 011.2.7l1.5-.5 1.5 2.6-1.2 1.1c.03.2.05.4.05.6s-.02.4-.05.6l1.2 1.1-1.5 2.6-1.5-.5a5 5 0 01-1.2.7l-.5 1.5h-3l-.5-1.5A5 5 0 014.8 11l-1.5.5L1.8 8.9l1.2-1.1A5 5 0 013 7.4c0-.2.02-.4.05-.6L1.8 5.7l1.5-2.6 1.5.5A5 5 0 016 2.9l.5-1.5z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
              <circle cx="8" cy="7.5" r="2" stroke="currentColor" stroke-width="1.3"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Séparateur -->
      <div class="fs__sep"></div>

      <!-- CTA nouveau foyer -->
      <div class="fs__footer">
        <button class="fs__new-btn" type="button" @click="ouvrirSetup">
          Nouveau foyer +
        </button>
      </div>

    </div>
  </div>

  <!-- Overlay -->
  <div v-if="popoverOuvert" class="fs__overlay" @click="popoverOuvert = false"></div>

  <FoyerSetup v-if="setupOuvert" @fermer="setupOuvert = false" />
  <FoyerEdit  v-if="editOuvert"  @fermer="editOuvert = false" />
</template>

<script setup>
import { ref } from 'vue'
import { useBudgetStore } from '../stores/budget'
import FoyerSetup from './FoyerSetup.vue'
import FoyerEdit  from './FoyerEdit.vue'

const store = useBudgetStore()
const switcherRef   = ref(null)
const popoverOuvert = ref(false)
const setupOuvert   = ref(false)
const editOuvert    = ref(false)

function selectionner(id) {
  store.switcherFoyer(id)
  popoverOuvert.value = false
}

function ouvrirSetup() {
  popoverOuvert.value = false
  setupOuvert.value = true
}

function ouvrirEdit() {
  popoverOuvert.value = false
  editOuvert.value = true
}
</script>

<style scoped>
.fs {
  position: relative;
  padding: 0 12px 16px;
  border-bottom: 1px solid var(--sidebar-border);
  margin-bottom: 12px;
}

/* Trigger */
.fs__trigger {
  display: flex; align-items: center; gap: 2px; justify-content: space-between;
  width: 100%; padding: 10px 14px;
  background: rgba(255,255,255,0.6);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  cursor: pointer; font-family: inherit;
  transition: background 150ms;
}
.fs__trigger:hover { background: rgba(255,255,255,0.9); }

.fs__trigger-bullet {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}

.fs__trigger-nom {
  flex: 1; min-width: 0;
  font-size: 13px; font-weight: 600; color: var(--foreground);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  text-align: left;
}

.fs__chevron {
  flex-shrink: 0; color: var(--muted-foreground);
  transition: transform 200ms ease;
}
.fs__chevron--open { transform: rotate(180deg); }

/* Dropdown */
.fs__dropdown {
  position: absolute;
  top: calc(100% - 4px); left: 12px; right: 12px;
  z-index: 200;
  background: var(--popover);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

/* Liste */
.fs__list { padding: 6px 8px; display: flex; flex-direction: column; gap: 2px; }

.fs__item {
  display: flex; align-items: center;
  border-radius: var(--radius-md);
}

.fs__item-select {
  display: flex; align-items: center; gap: 8px;
  flex: 1; min-width: 0; padding: 8px 6px;
  background: none; border: none; cursor: pointer;
  text-align: left; font-family: inherit;
}

.fs__item-check { flex-shrink: 0; }

.fs__item-bullet {
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
}

.fs__item-nom {
  font-size: 13px; font-weight: 500; color: var(--foreground);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* Roue crantée */
.fs__gear {
  display: flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; border-radius: 6px; flex-shrink: 0;
  margin-right: 4px;
  background: none; border: none; cursor: pointer;
  color: var(--muted-foreground);
  transition: background 120ms, color 120ms;
}
.fs__gear:hover { background: var(--accent); color: var(--foreground); }

/* Séparateur */
.fs__sep {
  height: 1px; background: var(--border); margin: 0 8px;
}

/* CTA */
.fs__footer { padding: 8px; }
.fs__new-btn {
  display: flex; align-items: center; justify-content: center;
  width: 100%; padding: 9px 14px;
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 13px; font-weight: 500; color: var(--foreground); font-family: inherit;
  cursor: pointer; transition: background 120ms;
}
.fs__new-btn:hover { background: var(--muted); }

.fs__overlay { position: fixed; inset: 0; z-index: 199; }
</style>
