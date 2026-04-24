import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuthStore } from './auth'
const defaultData = {
  config: {
    personnes: [
      { id: 'p1', nom: 'Personne 1', salaire: 0, couleur: '#7C6FCD' },
      { id: 'p2', nom: 'Personne 2', salaire: 0, couleur: '#4A9EDB' },
    ]
  },
  categories: [
    { id: 'cat1',  nom: 'Logement',     couleur: '#E8643A' },
    { id: 'cat2',  nom: 'Transport',    couleur: '#F08C46' },
    { id: 'cat3',  nom: 'Alimentation', couleur: '#2CA87F' },
    { id: 'cat4',  nom: 'Loisirs',      couleur: '#25566E' },
    { id: 'cat5',  nom: 'Santé',        couleur: '#D4A84B' },
    { id: 'cat6',  nom: 'Épargne',      couleur: '#22C55E' },
    { id: 'cat7',  nom: 'Abonnements',  couleur: '#71717A' },
    { id: 'cat8',  nom: 'Enfants',      couleur: '#E8643A' },
    { id: 'cat9',  nom: 'Assurance',    couleur: '#60A5FA' },
    { id: 'cat10', nom: 'Emprunt',      couleur: '#A78BFA' },
  ],
  depenses:   [],
  enveloppes: [],
  epargnes:   [],
}

function deepClone(obj) { return JSON.parse(JSON.stringify(obj)) }

export function toMonthly(montant, frequence) {
  switch (frequence) {
    case 'hebdomadaire': return montant * 52 / 12
    case 'mensuel':      return montant
    case 'trimestriel':  return montant / 3
    case 'annuel':       return montant / 12
    default:             return montant
  }
}

// ─── Migrations des dépenses ──────────────────────────────────────────────────
function migrateDepense(d) {
  if ('montantP1' in d) return { createdAt: parseInt(d.id?.replace('dep','')) || 0, ...d }
  const montant = d.montant || 0
  const rep = d.repartition || {}
  return {
    id:            d.id,
    nom:           d.nom,
    montantP1:     Math.round(montant * (rep.p1 || 0) / 100),
    montantP2:     Math.round(montant * (rep.p2 || 0) / 100),
    montantCommun: 0,
    frequence:     d.frequence || 'mensuel',
    categorieId:   d.categorieId || null,
    enveloppeId:   d.enveloppeId || null,
    actif:         d.actif !== false,
    note:          d.note || '',
  }
}

function migrateEnveloppe(e) {
  if ('appartientA' in e) return e
  return { ...e, appartientA: 'tous' }
}

// ─── Création d'un foyer par défaut ───────────────────────────────────────────
function _creerFoyerParDefaut() {
  const d = deepClone(defaultData)
  return {
    id:         crypto.randomUUID(),
    nom:        'Mon foyer',
    couleur:    '#7C6FCD',
    config:     d.config,
    categories: d.categories,
    depenses:   (d.depenses || []).map(migrateDepense),
    enveloppes: (d.enveloppes || []).map(migrateEnveloppe),
    epargnes:   d.epargnes || [],
  }
}

// ─── Migration catégories manquantes ─────────────────────────────────────────
// Ajoute les catégories absentes à chaque foyer sans modifier les dépenses existantes
const CATS_REQUIRED = [
  { id: 'cat9',  nom: 'Assurance', couleur: '#60A5FA' },
  { id: 'cat10', nom: 'Emprunt',   couleur: '#A78BFA' },
]
function _migrateCategories(foyers) {
  foyers.forEach(foyer => {
    CATS_REQUIRED.forEach(required => {
      const alreadyHas = foyer.categories?.some(
        c => c.id === required.id || c.nom === required.nom
      )
      if (!alreadyHas) {
        foyer.categories = foyer.categories || []
        foyer.categories.push({ ...required })
      }
    })
  })
}

// ─── Migration flat → multi-foyer ─────────────────────────────────────────────
function _charger(raw) {
  if (!raw) return null

  // Nouveau format: { foyerActifId, foyers }
  if (raw.foyers && Array.isArray(raw.foyers)) {
    _migrateCategories(raw.foyers)
    return raw
  }

  // Ancien format plat: { config, categories, depenses, ... }
  if (raw.depenses || raw.config) {
    const foyer = {
      id:         crypto.randomUUID(),
      nom:        raw.config?.nom || 'Mon foyer',
      couleur:    '#7C6FCD',
      config:     raw.config || deepClone(defaultData.config),
      categories: raw.categories || deepClone(defaultData.categories),
      depenses:   (raw.depenses || []).map(migrateDepense),
      enveloppes: (raw.enveloppes || []).map(migrateEnveloppe),
      epargnes:   raw.epargnes || [],
    }
    _migrateCategories([foyer])
    return { foyerActifId: foyer.id, foyers: [foyer] }
  }

  return null
}

export const useBudgetStore = defineStore('budget', () => {
  // Initialiser avec un foyer par défaut pour éviter le rendu à blanc
  // avant que loadFromStorage() termine son exécution asynchrone
  const _init        = _creerFoyerParDefaut()
  const foyerActifId = ref(_init.id)
  const foyers       = ref([_init])
  const lastSaved    = ref(null)
  const notification = ref({ visible: false, message: '', type: 'success' })

  // ─── Foyer actif ─────────────────────────────────────────────
  const foyerActif = computed(() =>
    foyers.value.find(f => f.id === foyerActifId.value) ?? foyers.value[0] ?? null
  )

  // Accès mutable pour les actions
  function _foyer() {
    return foyers.value.find(f => f.id === foyerActifId.value) ?? foyers.value[0] ?? null
  }

  // Compat: data computed (utilisé par App.vue watch + composables)
  const data = computed(() => {
    const f = foyerActif.value
    if (!f) return null
    return {
      config:     f.config,
      categories: f.categories,
      depenses:   f.depenses,
      enveloppes: f.enveloppes,
      epargnes:   f.epargnes,
    }
  })

  // ─── Loaders ─────────────────────────────────────────────────
  async function loadFromStorage() {
    const authStore = useAuthStore()
    const uid = authStore.user?.uid
    // 1. Firestore (si connecté)
    if (uid) {
      try {
        const snap = await getDoc(doc(db, 'users', uid))
        if (snap.exists()) {
          const raw = _charger(snap.data())
          if (raw) { foyers.value = raw.foyers; foyerActifId.value = raw.foyerActifId; return }
        }
      } catch {}
    }
    // 2. localStorage (cache local)
    const stored = localStorage.getItem('budget-simulator-v1')
    if (stored) {
      try {
        const raw = _charger(JSON.parse(stored))
        if (raw) { foyers.value = raw.foyers; foyerActifId.value = raw.foyerActifId; return }
      } catch {}
    }
    // 3. Foyer vide par défaut
    const f = _creerFoyerParDefaut()
    foyers.value = [f]
    foyerActifId.value = f.id
  }

  async function saveToStorage() {
    const payload = { foyerActifId: foyerActifId.value, foyers: foyers.value }
    lastSaved.value = Date.now()
    // Cache local
    localStorage.setItem('budget-simulator-v1', JSON.stringify(payload))
    // Firestore (si connecté)
    const authStore = useAuthStore()
    const uid = authStore.user?.uid
    if (uid) {
      try {
        await setDoc(doc(db, 'users', uid), payload)
      } catch {}
    }
  }

  async function resetData() {
    const f = _creerFoyerParDefaut()
    const idx = foyers.value.findIndex(x => x.id === foyerActifId.value)
    if (idx !== -1) foyers.value[idx] = f
    else { foyers.value.push(f); foyerActifId.value = f.id }
    await saveToStorage()
    showNotification('Données réinitialisées', 'warning')
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(data.value, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `budget-${new Date().toISOString().slice(0,10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  function importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const raw = _charger(JSON.parse(e.target.result))
          if (raw) {
            foyers.value = raw.foyers
            foyerActifId.value = raw.foyerActifId
          } else { reject(new Error('JSON invalide')); return }
          await saveToStorage()
          showNotification('Import réussi', 'success')
          resolve()
        } catch { reject(new Error('JSON invalide')) }
      }
      reader.readAsText(file)
    })
  }

  // ─── Notification ────────────────────────────────────────────
  function showNotification(message, type = 'success') {
    notification.value = { visible: true, message, type }
  }
  function hideNotification() { notification.value.visible = false }

  // ─── Gestion des foyers ──────────────────────────────────────
  function creerFoyer({ nom, couleur = '#7C6FCD', personnes = [], remplacerDefaut = false }) {
    const d = deepClone(defaultData)
    const config = deepClone(d.config)
    if (personnes.length > 0) {
      config.personnes = personnes.map((p, i) => ({
        id:      i === 0 ? 'p1' : 'p2',
        nom:     p.nom || (i === 0 ? 'Personne 1' : 'Personne 2'),
        salaire: p.salaire || 0,
        couleur: p.couleur || (i === 0 ? '#7C6FCD' : '#4A9EDB'),
      }))
    }
    const foyer = {
      id:         crypto.randomUUID(),
      nom:        nom || 'Nouveau foyer',
      couleur,
      config,
      categories: deepClone(d.categories),
      depenses:   [],
      enveloppes: [],
      epargnes:   [],
    }
    const estDefautVide = foyers.value.length === 1 && foyers.value[0].depenses.length === 0
    if (remplacerDefaut && estDefautVide) {
      foyers.value = [foyer]
    } else {
      foyers.value.push(foyer)
    }
    foyerActifId.value = foyer.id
    saveToStorage()
    return foyer.id
  }

  function switcherFoyer(id) {
    if (foyers.value.find(f => f.id === id)) {
      foyerActifId.value = id
      saveToStorage()
    }
  }

  function supprimerFoyer(id) {
    if (foyers.value.length <= 1) return
    foyers.value = foyers.value.filter(f => f.id !== id)
    if (foyerActifId.value === id) foyerActifId.value = foyers.value[0]?.id ?? null
    saveToStorage()
  }

  function renommerFoyer(id, nom) {
    const f = foyers.value.find(f => f.id === id)
    if (f) { f.nom = nom; saveToStorage() }
  }

  // Met à jour le nom, la couleur et les membres du foyer actif
  function updateFoyer({ nom, couleur, personnes: nouvellesPersonnes }) {
    const f = _foyer()
    if (!f) return
    if (nom      !== undefined) f.nom = nom
    if (couleur  !== undefined) f.couleur = couleur
    if (nouvellesPersonnes !== undefined) f.config.personnes = nouvellesPersonnes
    saveToStorage()
  }

  // ─── Personnes ───────────────────────────────────────────────
  const personnes = computed(() => foyerActif.value?.config?.personnes ?? [])

  function updateSalaire(personneId, salaire) {
    const f = _foyer()
    if (!f) return
    const p = f.config.personnes.find(p => p.id === personneId)
    if (p) p.salaire = salaire
  }
  function updateNomPersonne(personneId, nom) {
    const f = _foyer()
    if (!f) return
    const p = f.config.personnes.find(p => p.id === personneId)
    if (p) p.nom = nom
  }

  // ─── Catégories ──────────────────────────────────────────────
  const categories = computed(() => foyerActif.value?.categories ?? [])

  // ─── Dépenses ────────────────────────────────────────────────
  const depenses        = computed(() => foyerActif.value?.depenses ?? [])
  const depensesActives = computed(() => (foyerActif.value?.depenses ?? []).filter(d => d.actif))

  function addDepense(dep = {}) {
    const f = _foyer()
    if (!f) return
    const ts = Date.now()
    const id = 'dep' + ts
    f.depenses.push({
      id,
      createdAt:     ts,
      nom:           dep.nom           ?? '',
      montantP1:     dep.montantP1     ?? 0,
      montantP2:     dep.montantP2     ?? 0,
      montantCommun: dep.montantCommun ?? 0,
      frequence:     dep.frequence     ?? 'mensuel',
      categorieId:   dep.categorieId   ?? null,
      enveloppeId:   dep.enveloppeId   ?? null,
      actif:         true,
      note:          dep.note          ?? '',
    })
    return id
  }

  function updateDepense(id, changes) {
    const f = _foyer()
    if (!f) return
    const idx = f.depenses.findIndex(d => d.id === id)
    if (idx !== -1) f.depenses[idx] = { ...f.depenses[idx], ...changes }
  }

  function deleteDepense(id) {
    const f = _foyer()
    if (!f) return
    f.depenses = f.depenses.filter(d => d.id !== id)
    f.enveloppes.forEach(env => {
      env.lignesIds = env.lignesIds.filter(lid => lid !== id)
    })
  }

  function toggleDepense(id) {
    const f = _foyer()
    if (!f) return
    const dep = f.depenses.find(d => d.id === id)
    if (dep) dep.actif = !dep.actif
  }

  // ─── Épargnes ────────────────────────────────────────────────
  const epargnes = computed(() => foyerActif.value?.epargnes ?? [])

  function ajouterEpargne({ date, montantP1, montantP2, note }) {
    const f = _foyer()
    if (!f) return
    f.epargnes.push({
      id:        'ep' + Date.now(),
      date:      date || new Date().toISOString().slice(0, 10),
      montantP1: montantP1 || 0,
      montantP2: montantP2 || 0,
      note:      note || '',
    })
  }

  function supprimerEpargne(id) {
    const f = _foyer()
    if (!f) return
    f.epargnes = f.epargnes.filter(e => e.id !== id)
  }

  function modifierEpargne(mouvement) {
    const f = _foyer()
    if (!f) return
    const index = f.epargnes.findIndex(e => e.id === mouvement.id)
    if (index !== -1) f.epargnes.splice(index, 1, { ...mouvement })
  }

  // ─── Enveloppes ──────────────────────────────────────────────
  const enveloppes = computed(() => foyerActif.value?.enveloppes ?? [])

  function addEnveloppe(nom, lignesIds = [], appartientA = 'tous') {
    const f = _foyer()
    if (!f) return
    const id = 'env' + Date.now()
    const colors = ['#1991FF','#8B5CF6','#10B981','#F59E0B','#EF4444','#EC4899','#14B8A6','#6366F1']
    const couleur = colors[f.enveloppes.length % colors.length]
    f.enveloppes.push({ id, nom, couleur, budgetMax: 0, lignesIds, appartientA })
    lignesIds.forEach(lid => {
      const dep = f.depenses.find(d => d.id === lid)
      if (dep) dep.enveloppeId = id
    })
    return id
  }

  function updateEnveloppe(id, changes) {
    const f = _foyer()
    if (!f) return
    const idx = f.enveloppes.findIndex(e => e.id === id)
    if (idx !== -1) f.enveloppes[idx] = { ...f.enveloppes[idx], ...changes }
  }

  function deleteEnveloppe(id) {
    const f = _foyer()
    if (!f) return
    f.enveloppes = f.enveloppes.filter(e => e.id !== id)
    f.depenses.forEach(d => { if (d.enveloppeId === id) d.enveloppeId = null })
  }

  function assignDepenseToEnveloppe(depId, envId) {
    const f = _foyer()
    if (!f) return
    const dep = f.depenses.find(d => d.id === depId)
    if (!dep) return
    if (dep.enveloppeId) {
      const oldEnv = f.enveloppes.find(e => e.id === dep.enveloppeId)
      if (oldEnv) oldEnv.lignesIds = oldEnv.lignesIds.filter(id => id !== depId)
    }
    dep.enveloppeId = envId
    if (envId) {
      const newEnv = f.enveloppes.find(e => e.id === envId)
      if (newEnv && !newEnv.lignesIds.includes(depId)) newEnv.lignesIds.push(depId)
    }
  }

  // ─── Calculs ─────────────────────────────────────────────────
  const totalRevenus = computed(() =>
    (foyerActif.value?.config?.personnes ?? []).reduce((s, p) => s + (p.salaire || 0), 0)
  )

  const totalMensuelP1 = computed(() =>
    depensesActives.value.reduce((s, d) => s + toMonthly(d.montantP1 || 0, d.frequence), 0)
  )
  const totalMensuelP2 = computed(() =>
    depensesActives.value.reduce((s, d) => s + toMonthly(d.montantP2 || 0, d.frequence), 0)
  )
  const totalMensuelCommun = computed(() =>
    depensesActives.value.reduce((s, d) => s + toMonthly(d.montantCommun || 0, d.frequence), 0)
  )
  const totalDepensesMensuel = computed(() =>
    totalMensuelP1.value + totalMensuelP2.value + totalMensuelCommun.value
  )

  const resteAvivreP1 = computed(() => {
    const p1 = foyerActif.value?.config?.personnes?.find(p => p.id === 'p1')
    return (p1?.salaire || 0) - totalMensuelP1.value - totalMensuelCommun.value / 2
  })
  const resteAvivreP2 = computed(() => {
    const p2 = foyerActif.value?.config?.personnes?.find(p => p.id === 'p2')
    return (p2?.salaire || 0) - totalMensuelP2.value - totalMensuelCommun.value / 2
  })
  const resteAVivre = computed(() => totalRevenus.value - totalDepensesMensuel.value)

  const partParPersonne = computed(() => ({
    p1: totalMensuelP1.value + totalMensuelCommun.value / 2,
    p2: totalMensuelP2.value + totalMensuelCommun.value / 2,
  }))
  const resteParPersonne = computed(() => ({
    p1: resteAvivreP1.value,
    p2: resteAvivreP2.value,
  }))

  const tauxEpargne = computed(() => {
    if (!totalRevenus.value) return 0
    return ((totalRevenus.value - totalDepensesMensuel.value) / totalRevenus.value) * 100
  })

  const depensesParCategorie = computed(() => {
    const map = {}
    ;(foyerActif.value?.categories ?? []).forEach(c => { map[c.id] = 0 })
    depensesActives.value.forEach(d => {
      if (d.categorieId) {
        const total = toMonthly((d.montantP1||0) + (d.montantP2||0) + (d.montantCommun||0), d.frequence)
        map[d.categorieId] = (map[d.categorieId] || 0) + total
      }
    })
    return map
  })

  const totalParEnveloppe = computed(() => {
    const map = {}
    ;(foyerActif.value?.enveloppes ?? []).forEach(env => {
      map[env.id] = { total: 0, totalAffiche: 0, p1: 0, p2: 0, commun: 0, p1Charge: 0, p2Charge: 0 }
    })
    depensesActives.value.forEach(d => {
      if (d.enveloppeId && map[d.enveloppeId]) {
        const env = (foyerActif.value?.enveloppes ?? []).find(e => e.id === d.enveloppeId)
        const ap  = env?.appartientA || 'tous'
        const mp1 = toMonthly(d.montantP1     || 0, d.frequence)
        const mp2 = toMonthly(d.montantP2     || 0, d.frequence)
        const mc  = toMonthly(d.montantCommun || 0, d.frequence)
        const tot = mp1 + mp2 + mc
        map[d.enveloppeId].p1     += mp1
        map[d.enveloppeId].p2     += mp2
        map[d.enveloppeId].commun += mc
        map[d.enveloppeId].total  += tot
        if (ap === 'p1') {
          map[d.enveloppeId].p1Charge     += tot
          map[d.enveloppeId].totalAffiche += mp1
        } else if (ap === 'p2') {
          map[d.enveloppeId].p2Charge     += tot
          map[d.enveloppeId].totalAffiche += mp2
        } else {
          map[d.enveloppeId].p1Charge     += mp1 + mc / 2
          map[d.enveloppeId].p2Charge     += mp2 + mc / 2
          map[d.enveloppeId].totalAffiche += tot
        }
      }
    })
    return map
  })

  const chargesParPersonne = computed(() => {
    const p1 = depensesActives.value.reduce((s, d) => s + toMonthly(d.montantP1 || 0, d.frequence), 0)
    const p2 = depensesActives.value.reduce((s, d) => s + toMonthly(d.montantP2 || 0, d.frequence), 0)
    return { p1: Math.round(p1), p2: Math.round(p2) }
  })

  const totalEpargneParPersonne = computed(() => {
    const total = { p1: 0, p2: 0 }
    ;(foyerActif.value?.epargnes ?? []).forEach(e => {
      total.p1 += (e.montantP1 || 0)
      total.p2 += (e.montantP2 || 0)
    })
    return total
  })

  return {
    // State
    foyerActifId, foyers, foyerActif,
    data, lastSaved, notification,
    // Getters
    personnes, categories, depenses, depensesActives, enveloppes, epargnes,
    totalRevenus, totalDepensesMensuel,
    totalMensuelP1, totalMensuelP2, totalMensuelCommun,
    resteAVivre, resteAvivreP1, resteAvivreP2,
    partParPersonne, resteParPersonne,
    tauxEpargne, depensesParCategorie, totalParEnveloppe, chargesParPersonne,
    totalEpargneParPersonne,
    toMonthly,
    // Actions
    loadFromStorage, saveToStorage, resetData, exportJSON, importJSON,
    showNotification, hideNotification,
    creerFoyer, switcherFoyer, supprimerFoyer, renommerFoyer, updateFoyer,
    updateSalaire, updateNomPersonne,
    ajouterEpargne, supprimerEpargne, modifierEpargne,
    addDepense, updateDepense, deleteDepense, toggleDepense,
    addEnveloppe, updateEnveloppe, deleteEnveloppe, assignDepenseToEnveloppe,
  }
})
