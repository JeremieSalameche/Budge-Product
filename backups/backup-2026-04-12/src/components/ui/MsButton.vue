<template>
  <button
    :class="['ms-btn', `ms-btn--${variant}`, `ms-btn--${size}`, { 'ms-btn--loading': loading }]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <span v-if="loading" class="ms-btn__spinner"></span>
    <span v-if="icon && !loading" class="ms-btn__icon" v-html="icon"></span>
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | ghost | danger
  size:    { type: String, default: 'md' },       // sm | md | lg
  disabled: { type: Boolean, default: false },
  loading:  { type: Boolean, default: false },
  icon:     { type: String, default: null },
})
</script>

<style scoped>
.ms-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  border-radius: var(--radius-md);
  font-family: var(--font-family);
  font-weight: 500;
  font-size: 14px;
  line-height: 1;
  white-space: nowrap;
  transition: background var(--transition), color var(--transition), border-color var(--transition), opacity var(--transition), box-shadow var(--transition);
  cursor: pointer;
  border: none;
  text-decoration: none;
}

/* Sizes */
.ms-btn--sm { height: 32px; padding: 0 12px; font-size: 13px; }
.ms-btn--md { height: 36px; padding: 0 16px; font-size: 14px; }
.ms-btn--lg { height: 40px; padding: 0 20px; font-size: 15px; }

/* Primary */
.ms-btn--primary { background: var(--primary); color: var(--primary-foreground); border: none; }
.ms-btn--primary:hover:not(:disabled) { background: var(--zinc-800); }
.ms-btn--primary:focus-visible { box-shadow: var(--shadow-focus); }

/* Secondary */
.ms-btn--secondary { background: var(--secondary); border: 1px solid var(--border); color: var(--secondary-foreground); }
.ms-btn--secondary:hover:not(:disabled) { background: var(--zinc-200); }

/* Ghost */
.ms-btn--ghost { background: transparent; border: none; color: var(--foreground); }
.ms-btn--ghost:hover:not(:disabled) { background: var(--accent); }

/* Outline */
.ms-btn--outline { background: transparent; border: 1px solid var(--border); color: var(--foreground); }
.ms-btn--outline:hover:not(:disabled) { background: var(--accent); }

/* Danger */
.ms-btn--danger { background: var(--destructive); color: var(--destructive-foreground); border: none; }
.ms-btn--danger:hover:not(:disabled) { background: #dc2626; }

.ms-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* Loading */
.ms-btn--loading { pointer-events: none; }
.ms-btn__spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.ms-btn__icon { display: flex; align-items: center; font-size: 16px; }
</style>
