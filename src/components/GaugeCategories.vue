<template>
  <div :class="['gc', { 'gc--dark': dark }]" @mousemove="onMouseMove" @mouseleave="hovered = null">
    <!-- SVG gauge -->
    <div class="gc__svg-wrap">
      <svg viewBox="0 0 300 160" width="100%" style="display:block;overflow:visible">
        <defs>
          <radialGradient
            v-for="(seg, i) in segments"
            :key="'grad-' + i"
            :id="'grad-' + i"
            cx="150" cy="150" r="130"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="30%"  :stop-color="seg.couleur.from" stop-opacity="1" />
            <stop offset="100%" :stop-color="seg.couleur.to"   stop-opacity="0.8" />
          </radialGradient>
          <!-- Clip : masque les bouts arrondis qui débordent sous la ligne de base -->
          <clipPath id="gauge-clip">
            <rect x="0" y="0" width="300" height="152" />
          </clipPath>
        </defs>

        <!-- Segments -->
        <path
          v-for="(seg, i) in segments"
          :key="i"
          :d="seg.path"
          :fill="'url(#grad-' + i + ')'"
          stroke="none"
          :opacity="hovered !== null && hovered !== i ? 0.3 : 1"
          style="cursor:pointer;transition:opacity 150ms ease"
          @mouseenter="hovered = i"
        />

        <!-- Texte central -->
        <text
          x="150" y="132"
          text-anchor="middle"
          font-family="system-ui,sans-serif"
        >
          <tspan
            font-size="26" font-weight="600"
            :fill="dark ? '#FFFFFF' : '#09090B'"
          >{{ hovered !== null ? fmt(segments[hovered].montant) : fmt(total) }}</tspan>
          <tspan
            font-size="11" font-weight="400"
            :fill="dark ? 'rgba(255,255,255,0.45)' : '#71717A'"
            dx="4"
          >{{ hovered !== null ? '' : '/ mois' }}</tspan>
        </text>
        <text
          v-if="hovered !== null"
          x="150" y="148"
          text-anchor="middle"
          font-size="11"
          :fill="dark ? 'rgba(255,255,255,0.45)' : '#71717A'"
          font-family="system-ui,sans-serif"
        >{{ segments[hovered].nom }}</text>
      </svg>

      <!-- Tooltip flottant -->
      <div
        v-if="hovered !== null"
        class="gc__tooltip"
        :style="{ left: mouse.x + 12 + 'px', top: mouse.y - 36 + 'px' }"
      >
        <span class="gc__tooltip-name">{{ segments[hovered].nom }}</span>
        <span class="gc__tooltip-val">{{ fmt(segments[hovered].montant) }}</span>
        <span class="gc__tooltip-pct">{{ pct(segments[hovered].montant) }}%</span>
      </div>
    </div>

    <!-- Légende 2 colonnes -->
    <div class="gc__legend">
      <div
        v-for="(seg, i) in segments"
        :key="i"
        class="gc__legend-item"
        :class="{ 'gc__legend-item--active': hovered === i }"
        @mouseenter="hovered = i"
        @mouseleave="hovered = null"
      >
        <span class="gc__dot" :style="{ background: seg.couleur.from }"></span>
        <span class="gc__label">{{ seg.nom }}</span>
        <span class="gc__val">{{ fmt(seg.montant) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  categories: { type: Array, default: () => [] },
  total:      { type: Number, default: 0 },
  dark:       { type: Boolean, default: false },
  nbAlertes:  { type: Number, default: 0 },
})

defineEmits(['ouvrir-optimisation'])

const hovered = ref(null)
const mouse   = ref({ x: 0, y: 0 })

function onMouseMove(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  mouse.value = { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function fmt(n = 0) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}
function fmtShort(n = 0) {
  if (n >= 1000) return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(n / 1000) + ' k€'
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' €'
}
function pct(montant = 0) {
  if (!props.total) return '0.0'
  return ((montant / props.total) * 100).toFixed(1)
}

// ── Palette dégradés violet → bleu clair ─────────────────
const PALETTE_SEGMENTS = [
  { from: '#9B6FD4', to: '#C49EE8' },   // violet foncé → violet clair
  { from: '#6B5FC8', to: '#9B8FE0' },   // bleu violet foncé → bleu violet clair
  { from: '#5B7FD4', to: '#8BAEE8' },   // bleu moyen → bleu clair
  { from: '#7AAEE8', to: '#AAD0F5' },   // bleu clair → bleu très pâle
  { from: '#9BC4F0', to: '#C4DDF8' },   // bleu pâle → bleu lavande
  { from: '#B8D8F8', to: '#D8EEFB' },   // bleu très pâle → quasi blanc
]

// ── SVG ──────────────────────────────────────────────────
// Coordinate system : x = cx + r·cos(θ), y = cy − r·sin(θ)
// θ=180° → left, θ=90° → top, θ=0° → right
// Outer arc left→right (through top) : sweep=1
// Inner arc right→left (through top) : sweep=0

const CX = 150, CY = 150, OR = 130, IR = 105, GAP = 1.5

function pt(cx, cy, r, deg) {
  const rad = deg * Math.PI / 180
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }
}

function segPath(startDeg, endDeg) {
  const la = (startDeg - endDeg) > 180 ? 1 : 0
  const os = pt(CX, CY, OR, startDeg)
  const oe = pt(CX, CY, OR, endDeg)
  const ie = pt(CX, CY, IR, endDeg)
  const is = pt(CX, CY, IR, startDeg)
  const f  = v => v.toFixed(3)
  return [
    `M ${f(os.x)} ${f(os.y)}`,
    `A ${OR} ${OR} 0 ${la} 1 ${f(oe.x)} ${f(oe.y)}`,
    `L ${f(ie.x)} ${f(ie.y)}`,
    `A ${IR} ${IR} 0 ${la} 0 ${f(is.x)} ${f(is.y)}`,
    'Z'
  ].join(' ')
}

// Total utilisé pour l'arc = somme exacte des catégories affichées
// (évite que des dépenses sans catégorie laissent un trou en fin d'arc)
const arcTotal = computed(() => props.categories.reduce((s, c) => s + (c.montant || 0), 0))

const segments = computed(() => {
  if (!arcTotal.value || !props.categories.length) return []

  const sorted = [...props.categories].sort((a, b) => b.montant - a.montant)
  const colorMap = new Map(
    sorted.map((cat, i) => [cat.nom, PALETTE_SEGMENTS[Math.min(i, PALETTE_SEGMENTS.length - 1)]])
  )

  let cur = 180
  return props.categories
    .map(cat => {
      const span       = (cat.montant / arcTotal.value) * 180
      const actualSpan = span - GAP
      if (actualSpan < 0.5) { cur -= span; return null }
      const start = cur
      const end   = cur - actualSpan
      cur -= span
      return { path: segPath(start, end), couleur: colorMap.get(cat.nom), nom: cat.nom, montant: cat.montant }
    })
    .filter(Boolean)
})
</script>

<style scoped>
.gc { display: flex; flex-direction: column; gap: 16px; height: 100%; box-sizing: border-box; background: #FFFFFF; }
.gc__svg-wrap { position: relative; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }

/* Tooltip */
.gc__tooltip {
  position: absolute;
  background: rgba(9,9,11,0.90);
  color: #fff;
  border-radius: var(--radius-md);
  padding: 6px 10px;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  pointer-events: none;
  white-space: nowrap;
  z-index: 10;
}
.gc__tooltip-name { font-weight: 600; font-size: 11px; opacity: 0.75; }
.gc__tooltip-val  { font-weight: 700; font-size: 13px; }
.gc__tooltip-pct  { font-size: 11px; opacity: 0.65; }

/* Séparateur légende */
.gc__legend {
  border-top: 1px solid var(--border);
  padding-top: 14px;
}

/* Légende */
.gc__legend {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 16px;
}
.gc__legend-item {
  display: flex; align-items: center; gap: 6px;
  cursor: default;
  padding: 2px 4px; border-radius: var(--radius-sm);
  transition: background 120ms ease;
}
.gc__legend-item--active { background: var(--accent); }
.gc__dot   { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.gc__label { font-size: 12px; color: var(--muted-foreground); flex: 1; }
.gc__val   { font-size: 12px; font-weight: 600; color: var(--foreground); }

/* Dark mode overrides */
.gc--dark .gc__legend-item--active { background: rgba(255,255,255,0.08); }
.gc--dark .gc__label { color: rgba(255,255,255,0.50); }
.gc--dark .gc__val   { color: #FFFFFF; }

</style>
