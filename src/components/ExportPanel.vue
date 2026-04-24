<template>
  <div class="exp">
    <h2 class="exp__title">Export & Sauvegarde</h2>

    <div class="exp__sections">
      <!-- Export PDF -->
      <MsCard title="Export PDF" subtitle="Rapport complet sur 3 pages" padding="md">
        <div class="exp__options">
          <MsCheckbox v-model="pdfOpts.resume"    label="Page 1 — Résumé exécutif + métriques" />
          <MsCheckbox v-model="pdfOpts.tableau"   label="Page 2 — Tableau complet des dépenses" />
          <MsCheckbox v-model="pdfOpts.enveloppes"label="Page 3 — Détail par enveloppe" />
        </div>
        <template #actions>
          <MsButton variant="primary" size="sm" @click="exportPDF" :loading="pdfLoading">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v8M3 7l3.5 3.5L10 7M1.5 11.5h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Exporter PDF
          </MsButton>
        </template>
      </MsCard>

      <!-- Export CSV -->
      <MsCard title="Export CSV" subtitle="Compatible Excel & Google Sheets" padding="md">
        <div class="exp__options">
          <label class="exp__radio-row">
            <input type="radio" v-model="csvMode" value="all" class="exp__radio" />
            <span>Toutes les dépenses</span>
          </label>
          <label class="exp__radio-row">
            <input type="radio" v-model="csvMode" value="cat" class="exp__radio" />
            <span>Par catégorie</span>
          </label>
          <label class="exp__radio-row">
            <input type="radio" v-model="csvMode" value="env" class="exp__radio" />
            <span>Par enveloppe</span>
          </label>
        </div>
        <template #actions>
          <MsButton variant="secondary" size="sm" @click="exportCSV">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v8M3 7l3.5 3.5L10 7M1.5 11.5h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Exporter CSV
          </MsButton>
        </template>
      </MsCard>

      <!-- JSON -->
      <MsCard title="Sauvegarde JSON" subtitle="Import / export des données brutes" padding="md">
        <div class="exp__json-actions">
          <MsButton variant="ghost" @click="store.exportJSON()">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v8M3 7l3.5 3.5L10 7M1.5 11.5h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Exporter JSON
          </MsButton>
          <label class="exp__import-btn">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 12V4M10 6.5L6.5 3 3 6.5M1.5 11.5h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Importer JSON
            <input type="file" accept=".json" class="exp__file-input" @change="onImport" />
          </label>
        </div>
      </MsCard>

      <!-- Paramètres personnes -->
      <MsCard title="Paramètres" subtitle="Noms et salaires" padding="md">
        <div class="exp__persons">
          <div v-for="p in store.personnes" :key="p.id" class="exp__person-row">
            <div class="exp__person-dot" :style="{ background: p.couleur }"></div>
            <input class="exp__person-name-input" v-model="p.nom" @change="onPersonChange" placeholder="Prénom" />
            <MsNumberInput
              :modelValue="p.salaire"
              @update:modelValue="v => onSalaireChange(p, v)"
              :min="0" :max="20000" :step="50"
              suffix="€/mois"
            />
          </div>
        </div>
      </MsCard>

      <!-- Réinitialisation -->
      <MsCard title="Zone de danger" padding="md">
        <p style="font-size:13px; color: var(--muted-foreground); margin-bottom: var(--space-lg)">
          Réinitialise toutes les données vers les valeurs par défaut.
        </p>
        <MsButton variant="danger" @click="confirmReset = true">Réinitialiser toutes les données</MsButton>
      </MsCard>
    </div>

    <!-- Modal reset -->
    <Teleport to="body">
      <div v-if="confirmReset" class="exp__modal-overlay" @click.self="confirmReset = false">
        <div class="exp__modal">
          <h3>Réinitialiser les données ?</h3>
          <p>Toutes vos modifications seront perdues. Cette action est irréversible.</p>
          <div class="exp__modal-actions">
            <MsButton variant="secondary" @click="confirmReset = false">Annuler</MsButton>
            <MsButton variant="danger" @click="doReset">Réinitialiser</MsButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import Papa from 'papaparse'
import { useBudgetStore } from '../stores/budget'
import { useStorage } from '../composables/useStorage'
import { MsCard, MsButton, MsCheckbox, MsNumberInput } from './ui/index.js'

const store = useBudgetStore()
const { scheduleAutoSave } = useStorage()

const pdfLoading = ref(false)
const pdfOpts    = ref({ resume: true, tableau: true, enveloppes: true })
const csvMode    = ref('all')
const confirmReset = ref(false)

function fmt(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}
function toMonthlyLabel(dep) {
  const m = store.toMonthly(dep.montant, dep.frequence)
  return fmt(m)
}

// ── PDF ──────────────────────────────────────────────────────
async function exportPDF() {
  pdfLoading.value = true
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const accent = [24, 24, 27]
    const dark   = [9, 9, 11]

    // ── Page 1 : Résumé ──────────────────────────────────────
    if (pdfOpts.value.resume) {
      doc.setFillColor(...accent)
      doc.rect(0, 0, 210, 40, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(22); doc.setFont('helvetica', 'bold')
      doc.text('Budget Personnel / Couple', 15, 18)
      doc.setFontSize(11); doc.setFont('helvetica', 'normal')
      doc.text(`Rapport du ${new Date().toLocaleDateString('fr-FR')}`, 15, 28)

      doc.setTextColor(...dark)
      doc.setFontSize(14); doc.setFont('helvetica', 'bold')
      doc.text('Résumé exécutif', 15, 52)

      const kpis = [
        ['Revenus totaux', fmt(store.totalRevenus)],
        ['Dépenses totales', fmt(store.totalDepensesMensuel)],
        ['Reste à vivre', fmt(store.resteAVivre)],
        ["Taux d'épargne", store.tauxEpargne.toFixed(1) + '%'],
        ...store.personnes.map(p => [`Reste ${p.nom}`, fmt(store.resteParPersonne[p.id])])
      ]
      autoTable(doc, {
        startY: 58, head: [['Indicateur', 'Valeur']],
        body: kpis, margin: { left: 15, right: 15 },
        styles: { fontSize: 11 },
        headStyles: { fillColor: accent },
      })
    }

    // ── Page 2 : Tableau complet ─────────────────────────────
    if (pdfOpts.value.tableau) {
      if (pdfOpts.value.resume) doc.addPage()
      doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(...dark)
      doc.text('Tableau des dépenses', 15, 20)

      const rows = store.depenses.map(d => {
        const cat = store.categories.find(c => c.id === d.categorieId)
        const env = store.enveloppes.find(e => e.id === d.enveloppeId)
        return [
          d.nom,
          fmt(d.montant),
          d.frequence,
          toMonthlyLabel(d),
          cat?.nom || '—',
          env?.nom || '—',
          d.actif ? 'Actif' : 'Inactif',
        ]
      })
      autoTable(doc, {
        startY: 28,
        head: [['Nom', 'Montant', 'Fréquence', 'Mensuel', 'Catégorie', 'Enveloppe', 'État']],
        body: rows, margin: { left: 15, right: 15 },
        styles: { fontSize: 9 },
        headStyles: { fillColor: accent },
        alternateRowStyles: { fillColor: [248, 247, 247] },
      })
    }

    // ── Page 3 : Enveloppes ──────────────────────────────────
    if (pdfOpts.value.enveloppes) {
      doc.addPage()
      doc.setFontSize(14); doc.setFont('helvetica', 'bold'); doc.setTextColor(...dark)
      doc.text('Détail par enveloppe', 15, 20)
      let y = 28

      store.enveloppes.forEach(env => {
        if (y > 250) { doc.addPage(); y = 20 }
        doc.setFontSize(12); doc.setFont('helvetica', 'bold')
        doc.text(env.nom, 15, y); y += 6
        const deps = store.depenses.filter(d => d.enveloppeId === env.id)
        if (!deps.length) { y += 6; return }
        const rows = deps.map(d => {
          const parts = store.personnes.map(p => `${p.nom}: ${fmt(store.toMonthly(d.montant, d.frequence) * (d.repartition[p.id] || 0) / 100)}`).join(' | ')
          return [d.nom, fmt(store.toMonthly(d.montant, d.frequence)), parts]
        })
        autoTable(doc, {
          startY: y, head: [['Dépense', 'Mensuel', 'Répartition']],
          body: rows, margin: { left: 15, right: 15 },
          styles: { fontSize: 9 }, headStyles: { fillColor: accent },
          didDrawPage: (d) => { y = d.cursor.y + 6 }
        })
        y = doc.lastAutoTable.finalY + 10
      })
    }

    doc.save(`budget-${new Date().toISOString().slice(0,10)}.pdf`)
    store.showNotification('PDF exporté avec succès', 'success')
  } finally {
    pdfLoading.value = false
  }
}

// ── CSV ──────────────────────────────────────────────────────
function exportCSV() {
  let rows = []
  const baseFields = (d) => {
    const cat = store.categories.find(c => c.id === d.categorieId)
    const env = store.enveloppes.find(e => e.id === d.enveloppeId)
    const obj = {
      Nom: d.nom,
      Montant: d.montant,
      Frequence: d.frequence,
      Mensuel: store.toMonthly(d.montant, d.frequence).toFixed(2),
      Categorie: cat?.nom || '',
      Enveloppe: env?.nom || '',
      Actif: d.actif ? 'Oui' : 'Non',
      Note: d.note,
    }
    store.personnes.forEach(p => {
      obj[`Part_${p.nom}_pct`]  = d.repartition[p.id] || 0
      obj[`Part_${p.nom}_eur`]  = (store.toMonthly(d.montant, d.frequence) * (d.repartition[p.id] || 0) / 100).toFixed(2)
    })
    return obj
  }

  if (csvMode.value === 'all') {
    rows = store.depenses.map(baseFields)
  } else if (csvMode.value === 'cat') {
    store.categories.forEach(cat => {
      const deps = store.depenses.filter(d => d.categorieId === cat.id)
      deps.forEach(d => rows.push({ Categorie_group: cat.nom, ...baseFields(d) }))
    })
  } else {
    store.enveloppes.forEach(env => {
      const deps = store.depenses.filter(d => d.enveloppeId === env.id)
      deps.forEach(d => rows.push({ Enveloppe_group: env.nom, ...baseFields(d) }))
    })
  }

  const csv = Papa.unparse(rows, { delimiter: ';' })
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `budget-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
  store.showNotification('CSV exporté', 'success')
}

// ── Import JSON ──────────────────────────────────────────────
async function onImport(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    await store.importJSON(file)
  } catch (err) {
    store.showNotification('Erreur : ' + err.message, 'error')
  }
  e.target.value = ''
}

// ── Personnes ────────────────────────────────────────────────
function onPersonChange() { scheduleAutoSave() }
function onSalaireChange(p, val) {
  store.updateSalaire(p.id, val)
  scheduleAutoSave()
}

// ── Reset ────────────────────────────────────────────────────
function doReset() {
  store.resetData()
  confirmReset.value = false
}
</script>

<style scoped>
.exp { display: flex; flex-direction: column; gap: var(--space-xl); width: 100%; box-sizing: border-box; }
.exp__title { font-size: 18px; font-weight: 700; color: var(--foreground); }
.exp__sections { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, minmax(0, 1fr))); gap: var(--space-lg); width: 100%; box-sizing: border-box; }
.exp__options { display: flex; flex-direction: column; gap: var(--space-sm); margin-top: var(--space-sm); }

.exp__radio-row { display: flex; align-items: center; gap: var(--space-sm); cursor: pointer; font-size: 14px; color: var(--foreground); padding: 4px 0; }
.exp__radio { accent-color: var(--primary); }

.exp__json-actions { display: flex; gap: var(--space-sm); flex-wrap: wrap; }
.exp__import-btn {
  display: inline-flex; align-items: center; gap: var(--space-sm);
  height: 36px; padding: 0 16px;
  border-radius: var(--radius-md);
  background: var(--secondary);
  border: 1px solid var(--border);
  font-size: 14px; font-weight: 500;
  color: var(--secondary-foreground);
  cursor: pointer;
  transition: background var(--transition);
}
.exp__import-btn:hover { background: var(--zinc-200); }
.exp__file-input { display: none; }

.exp__persons { display: flex; flex-direction: column; gap: var(--space-md); }
.exp__person-row { display: flex; align-items: center; gap: var(--space-sm); }
.exp__person-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.exp__person-name-input {
  flex: 1; min-width: 80px;
  height: 36px; padding: 0 10px;
  border: 1px solid var(--input);
  border-radius: var(--radius-md); font-size: 14px;
  background: var(--background); outline: none; color: var(--foreground);
  transition: border-color 150ms ease;
}
.exp__person-name-input:focus { border-color: var(--ring); }

.exp__modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.exp__modal {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: var(--space-xl); max-width: 360px; width: 90%;
  box-shadow: var(--shadow-xl);
  display: flex; flex-direction: column; gap: var(--space-lg);
}
.exp__modal h3 { font-size: 16px; font-weight: 600; }
.exp__modal p  { font-size: 14px; color: var(--muted-foreground); }
.exp__modal-actions { display: flex; gap: var(--space-sm); justify-content: flex-end; }
</style>
