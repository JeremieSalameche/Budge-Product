<template>
  <div class="dep">

    <!-- Page header -->
    <div class="page-header">
      <div>
        <h2 class="page-title">Dépenses</h2>
        <p class="page-subtitle">Gérez toutes vos charges fixes et variables</p>
      </div>
      <div class="page-header-actions">
        <MsButton variant="primary" size="sm" @click="openAdd">
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" style="flex-shrink:0">
            <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          Nouvelle dépense
        </MsButton>
      </div>
    </div>

    <!-- ── Barre de contrôle ─────────────────────────────────── -->
    <div class="dep__bar">
      <select v-model="filterCat" class="dep__select">
        <option value="">Toutes catégories</option>
        <option v-for="cat in store.categories" :key="cat.id" :value="cat.id">{{ cat.nom }}</option>
      </select>
    </div>

    <!-- ── Empty state (aucune dépense) ───────────────────── -->
    <div v-if="store.depenses.length === 0" class="dep__empty-state">
      <div class="dep__empty-state-icon">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
      </div>
      <div class="dep__empty-state-title">Aucune dépense enregistrée</div>
      <div class="dep__empty-state-sub">Ajoutez votre première dépense pour commencer à suivre votre budget mensuel.</div>
      <MsButton variant="primary" size="sm" @click="openAdd">
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style="flex-shrink:0"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        Ajouter une dépense
      </MsButton>
    </div>

    <!-- Overlay fermeture menu kebab -->
    <div v-if="openMenuId" class="dep__menu-overlay" @click="openMenuId = null"></div>

    <!-- ── Colonnes ────────────────────────────────────────── -->
    <div v-if="store.depenses.length > 0">

      <!-- Tabs mobile (couple uniquement) -->
      <div v-if="!isSolo" class="dep__mobile-tabs">
        <button :class="['dep__mobile-tab', { 'dep__mobile-tab--active': mobileCol === 'p1' }]" @click="mobileCol = 'p1'">
          <span class="dep__mobile-tab-dot" :style="{ background: p1.couleur }"></span>
          {{ p1.nom }}
        </button>
        <button :class="['dep__mobile-tab', { 'dep__mobile-tab--active': mobileCol === 'p2' }]" @click="mobileCol = 'p2'">
          <span class="dep__mobile-tab-dot" :style="{ background: p2.couleur }"></span>
          {{ p2.nom }}
        </button>
        <button :class="['dep__mobile-tab', { 'dep__mobile-tab--active': mobileCol === 'commun' }]" @click="mobileCol = 'commun'">
          Commun
        </button>
      </div>

    <div :class="['dep__cols', { 'dep__cols--solo': isSolo }]" :data-mobile-col="mobileCol">

      <!-- Colonne P1 (masquée en solo) -->
      <div v-if="!isSolo" class="dep__col">
        <div class="dep__col-head">
          <div class="dep__col-ava" :style="{ background: p1.couleur }">{{ p1.nom[0]?.toUpperCase() }}</div>
          <div class="dep__col-headinfo">
            <span class="dep__col-name">{{ p1.nom }}</span>
            <span class="dep__col-count">{{ depP1.length }} dépense{{ depP1.length !== 1 ? 's' : '' }}</span>
          </div>
          <span class="dep__col-sum">{{ fmt(totalP1) }}</span>
        </div>
        <div class="dep__col-body">
          <div v-if="depP1.length === 0" class="dep__empty">Aucune dépense individuelle</div>
          <div
            v-for="dep in depP1" :key="dep.id"
            :class="['dep__card', { 'dep__card--off': !dep.actif }]"
            :style="{ '--acc': catColor(dep) }"
          >
            <div class="dep__card-content">
              <div class="dep__card-top">
                <span class="dep__card-nom">{{ dep.nom || '—' }}</span>
                <span class="dep__card-amount">{{ fmtMonthly(dep) }}</span>
              </div>
              <div class="dep__card-bot">
                <span class="dep__card-meta">
                  <span class="dep__card-meta-dot" :style="{ background: catColor(dep) }"></span>
                  {{ catNom(dep) }}<template v-if="dep.frequence !== 'mensuel'"> · {{ freqLabel(dep.frequence) }}</template>
                </span>
                <div class="dep__card-acts">
                  <div class="dep__menu-wrap">
                    <button class="dep__kebab" type="button" @click.stop="openMenuId = openMenuId === dep.id ? null : dep.id">
                      <svg width="3" height="13" viewBox="0 0 3 13" fill="currentColor">
                        <circle cx="1.5" cy="1.5" r="1.5"/><circle cx="1.5" cy="6.5" r="1.5"/><circle cx="1.5" cy="11.5" r="1.5"/>
                      </svg>
                    </button>
                    <div v-if="openMenuId === dep.id" class="dep__menu" @click.stop>
                      <button class="dep__menu-item" type="button" @click="openEdit(dep); openMenuId = null">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Modifier
                      </button>
                      <button class="dep__menu-item" type="button" @click="toggleActif(dep); openMenuId = null">
                        <svg v-if="dep.actif" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        {{ dep.actif ? 'Désactiver' : 'Activer' }}
                      </button>
                      <div class="dep__menu-sep"></div>
                      <button class="dep__menu-item dep__menu-item--del" type="button" @click="confirmDelete(dep); openMenuId = null">
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1.75 3.5H12.25M5.25 3.5V2.333a.583.583 0 01.583-.583h2.334a.583.583 0 01.583.583V3.5M10.5 3.5l-.583 8.167H4.083L3.5 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Colonne P2 -->
      <div v-if="!isSolo" class="dep__col">
        <div class="dep__col-head">
          <div class="dep__col-ava" :style="{ background: p2.couleur }">{{ p2.nom[0]?.toUpperCase() }}</div>
          <div class="dep__col-headinfo">
            <span class="dep__col-name">{{ p2.nom }}</span>
            <span class="dep__col-count">{{ depP2.length }} dépense{{ depP2.length !== 1 ? 's' : '' }}</span>
          </div>
          <span class="dep__col-sum">{{ fmt(totalP2) }}</span>
        </div>
        <div class="dep__col-body">
          <div v-if="depP2.length === 0" class="dep__empty">Aucune dépense individuelle</div>
          <div
            v-for="dep in depP2" :key="dep.id"
            :class="['dep__card', { 'dep__card--off': !dep.actif }]"
            :style="{ '--acc': catColor(dep) }"
          >
            <div class="dep__card-content">
              <div class="dep__card-top">
                <span class="dep__card-nom">{{ dep.nom || '—' }}</span>
                <span class="dep__card-amount">{{ fmtMonthly(dep) }}</span>
              </div>
              <div class="dep__card-bot">
                <span class="dep__card-meta">
                  <span class="dep__card-meta-dot" :style="{ background: catColor(dep) }"></span>
                  {{ catNom(dep) }}<template v-if="dep.frequence !== 'mensuel'"> · {{ freqLabel(dep.frequence) }}</template>
                </span>
                <div class="dep__card-acts">
                  <div class="dep__menu-wrap">
                    <button class="dep__kebab" type="button" @click.stop="openMenuId = openMenuId === dep.id ? null : dep.id">
                      <svg width="3" height="13" viewBox="0 0 3 13" fill="currentColor">
                        <circle cx="1.5" cy="1.5" r="1.5"/><circle cx="1.5" cy="6.5" r="1.5"/><circle cx="1.5" cy="11.5" r="1.5"/>
                      </svg>
                    </button>
                    <div v-if="openMenuId === dep.id" class="dep__menu" @click.stop>
                      <button class="dep__menu-item" type="button" @click="openEdit(dep); openMenuId = null">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Modifier
                      </button>
                      <button class="dep__menu-item" type="button" @click="toggleActif(dep); openMenuId = null">
                        <svg v-if="dep.actif" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        {{ dep.actif ? 'Désactiver' : 'Activer' }}
                      </button>
                      <div class="dep__menu-sep"></div>
                      <button class="dep__menu-item dep__menu-item--del" type="button" @click="confirmDelete(dep); openMenuId = null">
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1.75 3.5H12.25M5.25 3.5V2.333a.583.583 0 01.583-.583h2.334a.583.583 0 01.583.583V3.5M10.5 3.5l-.583 8.167H4.083L3.5 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Colonne Commun -->
      <div class="dep__col dep__col--commun">
        <div class="dep__col-head">
          <template v-if="isSolo">
            <div class="dep__col-ava" :style="{ background: p1.couleur }">{{ p1.nom[0]?.toUpperCase() }}</div>
            <div class="dep__col-headinfo">
              <span class="dep__col-name">{{ p1.nom }}</span>
              <span class="dep__col-count">{{ filtered.length }} dépense{{ filtered.length !== 1 ? 's' : '' }}</span>
            </div>
            <span class="dep__col-sum">{{ fmt(totalSolo) }}</span>
          </template>
          <template v-else>
            <div class="dep__col-avas">
              <div class="dep__col-ava" :style="{ background: p1.couleur }">{{ p1.nom[0]?.toUpperCase() }}</div>
              <div class="dep__col-ava dep__col-ava--overlap" :style="{ background: p2.couleur }">{{ p2.nom[0]?.toUpperCase() }}</div>
            </div>
            <div class="dep__col-headinfo">
              <span class="dep__col-name">Commun</span>
              <span class="dep__col-count">{{ depCommun.length }} dépense{{ depCommun.length !== 1 ? 's' : '' }}</span>
            </div>
            <div class="dep__col-sums-commun">
              <span class="dep__col-sum-person" :style="{ color: p1.couleur }">{{ fmt(totalCommunP1) }}</span>
              <span class="dep__col-sum-sep">/</span>
              <span class="dep__col-sum-person" :style="{ color: p2.couleur }">{{ fmt(totalCommunP2) }}</span>
            </div>
          </template>
        </div>
        <div class="dep__col-body">
          <div v-if="(isSolo ? filtered : depCommun).length === 0" class="dep__empty">Aucune dépense{{ isSolo ? '' : ' commune' }}</div>
          <div
            v-for="dep in (isSolo ? filtered : depCommun)" :key="dep.id"
            :class="['dep__card', { 'dep__card--off': !dep.actif }]"
            :style="{ '--acc': catColor(dep) }"
          >
            <div class="dep__card-content">
              <div class="dep__card-top">
                <span class="dep__card-nom">{{ dep.nom || '—' }}</span>
                <span class="dep__card-amount">{{ fmtMonthly(dep) }}</span>
              </div>
              <div v-if="!isSolo" class="dep__card-shares">
                <span class="dep__share" :style="{ background: p1.couleur + '22', color: p1.couleur }">
                  {{ p1.nom }} · {{ fmt(store.toMonthly(dep.montantP1 || 0, dep.frequence)) }}
                </span>
                <span class="dep__share" :style="{ background: p2.couleur + '22', color: p2.couleur }">
                  {{ p2.nom }} · {{ fmt(store.toMonthly(dep.montantP2 || 0, dep.frequence)) }}
                </span>
              </div>
              <div class="dep__card-bot">
                <span class="dep__card-meta">
                  <span class="dep__card-meta-dot" :style="{ background: catColor(dep) }"></span>
                  {{ catNom(dep) }}<template v-if="dep.frequence !== 'mensuel'"> · {{ freqLabel(dep.frequence) }}</template>
                </span>
                <div class="dep__card-acts">
                  <div class="dep__menu-wrap">
                    <button class="dep__kebab" type="button" @click.stop="openMenuId = openMenuId === dep.id ? null : dep.id">
                      <svg width="3" height="13" viewBox="0 0 3 13" fill="currentColor">
                        <circle cx="1.5" cy="1.5" r="1.5"/><circle cx="1.5" cy="6.5" r="1.5"/><circle cx="1.5" cy="11.5" r="1.5"/>
                      </svg>
                    </button>
                    <div v-if="openMenuId === dep.id" class="dep__menu" @click.stop>
                      <button class="dep__menu-item" type="button" @click="openEdit(dep); openMenuId = null">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Modifier
                      </button>
                      <button class="dep__menu-item" type="button" @click="toggleActif(dep); openMenuId = null">
                        <svg v-if="dep.actif" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        {{ dep.actif ? 'Désactiver' : 'Activer' }}
                      </button>
                      <div class="dep__menu-sep"></div>
                      <button class="dep__menu-item dep__menu-item--del" type="button" @click="confirmDelete(dep); openMenuId = null">
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M1.75 3.5H12.25M5.25 3.5V2.333a.583.583 0 01.583-.583h2.334a.583.583 0 01.583.583V3.5M10.5 3.5l-.583 8.167H4.083L3.5 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
    </div><!-- /v-if depenses.length > 0 -->

    <!-- ── Modale ajout / édition ─────────────────────────────── -->
    <Teleport to="body">
      <div v-if="modalOpen" class="dep__overlay" @click.self="closeModal">
        <div class="dep__modal">

          <div class="dep__modal-head">
            <h3 class="dep__modal-title">{{ editId ? 'Modifier la dépense' : 'Nouvelle dépense' }}</h3>
            <button class="dep__modal-close" @click="closeModal" type="button">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </button>
          </div>

          <div class="dep__modal-body">

            <!-- Nom -->
            <div class="dep__mfield">
              <label class="dep__mlabel">Nom de la dépense</label>
              <input class="dep__minput" v-model="form.nom" type="text" placeholder="Ex : Loyer, Spotify, Carburant…" autofocus @keydown.enter="canSave && saveModal()" />
            </div>

            <!-- Catégorie + Fréquence -->
            <div class="dep__mrow">
              <div class="dep__mfield">
                <label class="dep__mlabel">Catégorie</label>
                <select class="dep__mselect" v-model="form.categorieId">
                  <option :value="null">— Aucune —</option>
                  <option v-for="cat in store.categories" :key="cat.id" :value="cat.id">{{ cat.nom }}</option>
                </select>
              </div>
              <div class="dep__mfield">
                <label class="dep__mlabel">Fréquence</label>
                <select class="dep__mselect" v-model="form.frequence">
                  <option value="mensuel">Mensuelle</option>
                  <option value="hebdomadaire">Hebdomadaire</option>
                  <option value="trimestriel">Trimestrielle</option>
                  <option value="annuel">Annuelle</option>
                </select>
              </div>
            </div>

            <!-- Qui paie (masqué en solo) -->
            <div v-if="!isSolo" class="dep__mfield">
              <label class="dep__mlabel">Qui paie ?</label>
              <div class="dep__qui">
                <button
                  type="button"
                  :class="['dep__qui-btn', { 'dep__qui-btn--on': form.qui === 'p1' }]"
                  :style="form.qui === 'p1' ? { borderColor: p1.couleur, background: p1.couleur + '18', color: p1.couleur } : {}"
                  @click="form.qui = 'p1'"
                >
                  <span class="dep__qui-dot" :style="{ background: p1.couleur }"></span>
                  {{ p1.nom }}
                </button>
                <button
                  type="button"
                  :class="['dep__qui-btn', { 'dep__qui-btn--on': form.qui === 'commun' }]"
                  :style="form.qui === 'commun' ? { borderColor: '#18181b', background: '#18181b12', color: '#18181b' } : {}"
                  @click="form.qui = 'commun'"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Les deux
                </button>
                <button
                  type="button"
                  :class="['dep__qui-btn', { 'dep__qui-btn--on': form.qui === 'p2' }]"
                  :style="form.qui === 'p2' ? { borderColor: p2.couleur, background: p2.couleur + '18', color: p2.couleur } : {}"
                  @click="form.qui = 'p2'"
                >
                  <span class="dep__qui-dot" :style="{ background: p2.couleur }"></span>
                  {{ p2.nom }}
                </button>
              </div>
            </div>

            <!-- Montant P1 seul -->
            <div v-if="isSolo || form.qui === 'p1'" class="dep__mfield">
              <label class="dep__mlabel">Montant</label>
              <div class="dep__minput-wrap">
                <input class="dep__minput dep__minput--num" v-model.number="form.montantP1" type="number" min="0" step="1" placeholder="0" />
                <span class="dep__minput-suffix">€</span>
              </div>
            </div>

            <!-- Montant P2 seul -->
            <div v-else-if="form.qui === 'p2'" class="dep__mfield">
              <label class="dep__mlabel">Montant</label>
              <div class="dep__minput-wrap">
                <input class="dep__minput dep__minput--num" v-model.number="form.montantP2" type="number" min="0" step="1" placeholder="0" />
                <span class="dep__minput-suffix">€</span>
              </div>
            </div>

            <!-- Montants commun -->
            <div v-else class="dep__commun-block">
              <div class="dep__mrow">
                <div class="dep__mfield">
                  <label class="dep__mlabel" :style="{ color: p1.couleur }">{{ p1.nom }}</label>
                  <div class="dep__minput-wrap">
                    <input class="dep__minput dep__minput--num" v-model.number="form.montantP1" type="number" min="0" step="1" placeholder="0" />
                    <span class="dep__minput-suffix">€</span>
                  </div>
                </div>
                <div class="dep__mfield">
                  <label class="dep__mlabel" :style="{ color: p2.couleur }">{{ p2.nom }}</label>
                  <div class="dep__minput-wrap">
                    <input class="dep__minput dep__minput--num" v-model.number="form.montantP2" type="number" min="0" step="1" placeholder="0" />
                    <span class="dep__minput-suffix">€</span>
                  </div>
                </div>
              </div>

              <!-- Total -->
              <div v-if="(form.montantP1 || 0) + (form.montantP2 || 0) > 0" class="dep__total-row">
                <span class="dep__total-label">Total</span>
                <span class="dep__total-val">
                  {{ fmt((form.montantP1 || 0) + (form.montantP2 || 0)) }}
                  <span class="dep__total-freq">/ {{ freqLabel(form.frequence).toLowerCase() }}</span>
                </span>
              </div>

              <!-- Indicateur équité -->
              <div v-if="equityInfo" class="dep__equity" :class="'dep__equity--' + equityInfo.status">
                <div class="dep__equity-bar">
                  <div class="dep__equity-bar-p1" :style="{ width: equityInfo.realPct + '%', background: p1.couleur }"></div>
                  <div class="dep__equity-bar-p2" :style="{ width: (100 - equityInfo.realPct) + '%', background: p2.couleur }"></div>
                </div>
                <div class="dep__equity-labels">
                  <span :style="{ color: p1.couleur }">{{ p1.nom }} {{ equityInfo.realPct }}%</span>
                  <span class="dep__equity-verdict">
                    <span v-if="equityInfo.status === 'ok'">✓ Équitable</span>
                    <span v-else-if="equityInfo.status === 'warn'">⚠ Légèrement déséquilibrée</span>
                    <span v-else>✗ Déséquilibrée</span>
                  </span>
                  <span :style="{ color: p2.couleur }">{{ 100 - equityInfo.realPct }}% {{ p2.nom }}</span>
                </div>
                <div class="dep__equity-ideal">
                  Répartition idéale selon les revenus : {{ equityInfo.idealPct }}% / {{ 100 - equityInfo.idealPct }}%
                </div>
              </div>

              <!-- Bouton suggérer -->
              <button v-if="canSuggest" type="button" class="dep__suggest-btn" @click="suggestSplit">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                Répartir équitablement — {{ equityInfo?.idealPct ?? '…' }}% / {{ equityInfo ? 100 - equityInfo.idealPct : '…' }}%
              </button>
            </div>

          </div>

          <div class="dep__modal-foot">
            <button class="dep__mbtn dep__mbtn--ghost" type="button" @click="closeModal">Annuler</button>
            <button class="dep__mbtn dep__mbtn--primary" type="button" :disabled="!canSave" @click="saveModal">
              {{ editId ? 'Enregistrer' : 'Ajouter la dépense' }}
            </button>
          </div>

        </div>
      </div>
    </Teleport>

    <!-- ── Modale suppression ─────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="deleteTarget" class="dep__overlay" @click.self="deleteTarget = null">
        <div class="dep__modal dep__modal--sm">
          <div class="dep__modal-head">
            <h3 class="dep__modal-title">Supprimer cette dépense ?</h3>
          </div>
          <div class="dep__modal-body">
            <p class="dep__modal-text">« {{ deleteTarget.nom }} » sera définitivement supprimée.</p>
          </div>
          <div class="dep__modal-foot">
            <button class="dep__mbtn dep__mbtn--ghost" type="button" @click="deleteTarget = null">Annuler</button>
            <button class="dep__mbtn dep__mbtn--danger" type="button" @click="doDelete">Supprimer</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBudgetStore } from '../stores/budget'
import { useStorage } from '../composables/useStorage'
import { MsButton } from './ui/index.js'

defineEmits(['selection-change'])

const store = useBudgetStore()
const { scheduleAutoSave } = useStorage()

// ── Personnes ─────────────────────────────────────────────
const isSolo = computed(() => store.personnes.length < 2)
const p1 = computed(() => store.personnes[0] ?? { id: 'p1', nom: '?', couleur: '#7C6FCD', salaire: 0 })
const p2 = computed(() => store.personnes[1] ?? { id: 'p2', nom: '?', couleur: '#4A9EDB', salaire: 0 })

// ── Mobile col switcher ───────────────────────────────────
const mobileCol  = ref('p1')
const openMenuId = ref(null)

// ── Filtre ────────────────────────────────────────────────
const filterCat = ref('')

const filtered = computed(() => {
  let list = [...store.depenses]
  if (filterCat.value) list = list.filter(d => d.categorieId === filterCat.value)
  return list
})

// ── Classification ────────────────────────────────────────
function classify(dep) {
  const h1 = (dep.montantP1 || 0) > 0
  const h2 = (dep.montantP2 || 0) > 0
  if (h1 && h2) return 'commun'
  if (h1) return 'p1'
  if (h2) return 'p2'
  return 'commun'
}

const depP1     = computed(() => filtered.value.filter(d => classify(d) === 'p1'))
const depP2     = computed(() => filtered.value.filter(d => classify(d) === 'p2'))
const depCommun = computed(() => filtered.value.filter(d => classify(d) === 'commun'))

// ── Totaux ────────────────────────────────────────────────
const totalP1 = computed(() =>
  depP1.value.reduce((s, d) => s + store.toMonthly(d.montantP1 || 0, d.frequence), 0)
)
const totalP2 = computed(() =>
  depP2.value.reduce((s, d) => s + store.toMonthly(d.montantP2 || 0, d.frequence), 0)
)
const totalCommun = computed(() =>
  depCommun.value.reduce((s, d) =>
    s + store.toMonthly((d.montantP1 || 0) + (d.montantP2 || 0) + (d.montantCommun || 0), d.frequence), 0)
)
const totalCommunP1 = computed(() =>
  depCommun.value.reduce((s, d) =>
    s + store.toMonthly((d.montantP1 || 0) + (d.montantCommun || 0) / 2, d.frequence), 0)
)
const totalCommunP2 = computed(() =>
  depCommun.value.reduce((s, d) =>
    s + store.toMonthly((d.montantP2 || 0) + (d.montantCommun || 0) / 2, d.frequence), 0)
)
const totalSolo = computed(() =>
  filtered.value.reduce((s, d) =>
    s + store.toMonthly((d.montantP1 || 0) + (d.montantP2 || 0) + (d.montantCommun || 0), d.frequence), 0)
)

// ── Helpers ───────────────────────────────────────────────
function fmt(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0)
}
function fmtMonthly(dep) {
  const total = (dep.montantP1 || 0) + (dep.montantP2 || 0) + (dep.montantCommun || 0)
  return fmt(store.toMonthly(total, dep.frequence))
}
function freqLabel(f) {
  return { mensuel: 'Mensuel', hebdomadaire: 'Hebdo', trimestriel: 'Trimestr.', annuel: 'Annuel' }[f] ?? f
}
function catNom(dep) {
  return store.categories.find(c => c.id === dep.categorieId)?.nom ?? '—'
}
function catColor(dep) {
  return store.categories.find(c => c.id === dep.categorieId)?.couleur ?? '#a1a1aa'
}

// ── Actions ───────────────────────────────────────────────
function toggleActif(dep) {
  store.toggleDepense(dep.id)
  scheduleAutoSave()
}
const deleteTarget = ref(null)
function confirmDelete(dep) { deleteTarget.value = dep }
function doDelete() {
  store.deleteDepense(deleteTarget.value.id)
  scheduleAutoSave()
  deleteTarget.value = null
}

// ── Modal ─────────────────────────────────────────────────
const modalOpen = ref(false)
const editId    = ref(null)
const form      = ref({ nom: '', categorieId: null, frequence: 'mensuel', qui: 'commun', montantP1: 0, montantP2: 0 })

function openAdd() {
  editId.value  = null
  form.value    = { nom: '', categorieId: null, frequence: 'mensuel', qui: isSolo.value ? 'p1' : 'commun', montantP1: 0, montantP2: 0 }
  modalOpen.value = true
}

function openEdit(dep) {
  editId.value = dep.id
  const h1 = (dep.montantP1 || 0) > 0
  const h2 = (dep.montantP2 || 0) > 0
  form.value = {
    nom:         dep.nom,
    categorieId: dep.categorieId,
    frequence:   dep.frequence,
    qui:         (h1 && h2) ? 'commun' : h2 ? 'p2' : 'p1',
    montantP1:   dep.montantP1 || 0,
    montantP2:   dep.montantP2 || 0,
  }
  modalOpen.value = true
}

function closeModal() { modalOpen.value = false }

const canSave = computed(() => {
  if (!form.value.nom.trim()) return false
  if (form.value.qui === 'p1') return (form.value.montantP1 || 0) > 0
  if (form.value.qui === 'p2') return (form.value.montantP2 || 0) > 0
  return (form.value.montantP1 || 0) > 0 || (form.value.montantP2 || 0) > 0
})

function saveModal() {
  if (!canSave.value) return
  const payload = {
    nom:          form.value.nom.trim(),
    categorieId:  form.value.categorieId,
    frequence:    form.value.frequence,
    montantP1:    form.value.qui !== 'p2' ? (form.value.montantP1 || 0) : 0,
    montantP2:    form.value.qui !== 'p1' ? (form.value.montantP2 || 0) : 0,
    montantCommun: 0,
  }
  if (editId.value) {
    store.updateDepense(editId.value, payload)
  } else {
    store.addDepense(payload)
  }
  scheduleAutoSave()
  closeModal()
}

// ── Équité ────────────────────────────────────────────────
const equityInfo = computed(() => {
  if (form.value.qui !== 'commun') return null
  const total = (form.value.montantP1 || 0) + (form.value.montantP2 || 0)
  if (total === 0) return null
  const sal1 = p1.value?.salaire || 0
  const sal2 = p2.value?.salaire || 0
  if (sal1 + sal2 === 0) return null
  const idealPct = Math.round(sal1 / (sal1 + sal2) * 100)
  const realPct  = Math.round((form.value.montantP1 || 0) / total * 100)
  const diff = Math.abs(realPct - idealPct)
  return {
    idealPct,
    realPct,
    diff,
    status: diff <= 4 ? 'ok' : diff <= 10 ? 'warn' : 'bad',
  }
})

const canSuggest = computed(() => {
  const total = (form.value.montantP1 || 0) + (form.value.montantP2 || 0)
  return form.value.qui === 'commun'
    && total > 0
    && (p1.value?.salaire || 0) + (p2.value?.salaire || 0) > 0
})

function suggestSplit() {
  const sal1  = p1.value?.salaire || 0
  const sal2  = p2.value?.salaire || 0
  const total = (form.value.montantP1 || 0) + (form.value.montantP2 || 0)
  form.value.montantP1 = Math.round(total * sal1 / (sal1 + sal2))
  form.value.montantP2 = total - form.value.montantP1
}
</script>

<style scoped>
.dep { display: flex; flex-direction: column; gap: 14px; width: 100%; box-sizing: border-box; }

/* ── Barre ─────────────────────────────────────────────── */
.dep__bar {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
}
.dep__select {
  height: 34px; padding: 0 10px;
  border: 1px solid var(--input); border-radius: var(--radius-md);
  background: #fff; font-size: 13px; color: var(--foreground);
  outline: none; cursor: pointer; font-family: inherit;
}

/* ── Colonnes ──────────────────────────────────────────── */
.dep__cols {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  align-items: start;
}
.dep__cols--solo {
  grid-template-columns: 1fr;
  max-width: 540px;
}

.dep__col {
  display: flex; flex-direction: column;
  border: 1.5px solid var(--border);
  border-radius: 14px; overflow: hidden;
}

.dep__col-head {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px;
  background: #fff;
  border-bottom: 1.5px solid var(--border);
}

.dep__col-avas { display: flex; flex-shrink: 0; }

.dep__col-sums-commun { display: flex; align-items: center; gap: 4px; flex-shrink: 0; }
.dep__col-sum-person { font-size: 12px; font-weight: 700; white-space: nowrap; }
.dep__col-sum-sep { font-size: 11px; color: var(--muted-foreground); }
.dep__col-ava {
  width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700; color: #fff;
}
.dep__col-ava--overlap { margin-left: -10px; box-shadow: -2px 0 0 #fff; }
.dep__col-ava--commun { background: #18181b; }

.dep__col-headinfo { flex: 1; display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.dep__col-name { font-size: 13px; font-weight: 600; color: var(--foreground); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dep__col-count { font-size: 11px; color: var(--muted-foreground); }
.dep__col-sum { font-size: 13px; font-weight: 700; color: var(--foreground); white-space: nowrap; }

.dep__col-body {
  display: flex; flex-direction: column; gap: 8px;
  padding: 10px; background: #fafafa; flex: 1;
}

.dep__empty {
  text-align: center; font-size: 13px; color: var(--muted-foreground);
  padding: 28px 12px; opacity: 0.6;
}

/* Empty state global (aucune dépense du tout) */
.dep__empty-state {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 64px 32px; text-align: center;
}
.dep__empty-state-icon {
  width: 56px; height: 56px; border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  background: #f4f4f5; border: 1.5px solid #e4e4e7;
  color: #a1a1aa;
}
.dep__empty-state-title { font-size: 16px; font-weight: 700; color: var(--foreground); }
.dep__empty-state-sub {
  font-size: 13px; color: var(--muted-foreground); max-width: 320px;
  line-height: 1.6; margin-bottom: 4px;
}

/* ── Cards ─────────────────────────────────────────────── */
.dep__card {
  display: flex;
  background: #fff;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.dep__card:hover {
  border-color: #b0b0b0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.dep__card--off { opacity: 0.4; }

.dep__card-content {
  flex: 1; min-width: 0; padding: 10px 12px;
  display: flex; flex-direction: column; gap: 6px;
}

.dep__card-top {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
}
.dep__card-nom {
  font-size: 13px; font-weight: 600; color: var(--foreground);
  flex: 1; min-width: 0; word-break: break-word;
}
.dep__card-amount {
  font-size: 12px; font-weight: 500; color: var(--muted-foreground);
  white-space: nowrap; flex-shrink: 0;
}

.dep__card-shares { display: flex; gap: 5px; flex-wrap: wrap; }
.dep__share {
  font-size: 11px; font-weight: 500;
  padding: 2px 8px; border-radius: 20px; white-space: nowrap;
}

.dep__card-bot {
  display: flex; align-items: center; gap: 6px;
}
.dep__card-meta {
  display: flex; align-items: center; gap: 5px;
  font-size: 11px; color: var(--muted-foreground);
  flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.dep__card-meta-dot {
  width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
}

.dep__card-acts { margin-left: auto; }

.dep__menu-overlay {
  position: fixed; inset: 0; z-index: 99;
}

.dep__menu-wrap { position: relative; }

.dep__kebab {
  width: 26px; height: 26px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  background: transparent; border: none;
  color: var(--muted-foreground); cursor: pointer;
  transition: background 0.12s, color 0.12s;
}
.dep__kebab:hover { background: var(--muted); color: var(--foreground); }

.dep__menu {
  position: absolute; right: 0; top: calc(100% + 4px);
  background: var(--card); border: 1px solid var(--border);
  border-radius: 10px; padding: 4px;
  min-width: 160px; z-index: 100;
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
  display: flex; flex-direction: column; gap: 1px;
}

.dep__menu-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 12px; border-radius: 7px;
  background: none; border: none; cursor: pointer;
  font-family: inherit; font-size: 13px; font-weight: 500;
  color: var(--foreground); text-align: left; width: 100%;
  transition: background 0.1s;
}
.dep__menu-item:hover { background: var(--muted); }
.dep__menu-item svg { flex-shrink: 0; color: var(--muted-foreground); }

.dep__menu-item--del { color: #ef4444; }
.dep__menu-item--del svg { color: #ef4444; }
.dep__menu-item--del:hover { background: #fff0f0; }

.dep__menu-sep { height: 1px; background: var(--border); margin: 3px 0; }

/* ── Overlay / Modal ───────────────────────────────────── */
.dep__overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 24px;
}

.dep__modal {
  background: #fff; border: 1px solid var(--border);
  border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.14);
  width: 100%; max-width: 480px;
  display: flex; flex-direction: column;
  max-height: 90vh; overflow-y: auto;
}
.dep__modal--sm { max-width: 360px; }

.dep__modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px 16px; border-bottom: 1px solid var(--border);
  position: sticky; top: 0; background: #fff; z-index: 1;
}
.dep__modal-title { font-size: 16px; font-weight: 700; color: var(--foreground); margin: 0; }
.dep__modal-close {
  width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
  border-radius: 7px; background: none; border: none;
  color: var(--muted-foreground); cursor: pointer;
  transition: background 0.12s, color 0.12s;
}
.dep__modal-close:hover { background: var(--muted); color: var(--foreground); }

.dep__modal-body { padding: 20px 24px; display: flex; flex-direction: column; gap: 16px; }
.dep__modal-text { font-size: 14px; color: var(--muted-foreground); margin: 0; }

.dep__modal-foot {
  display: flex; align-items: center; justify-content: flex-end; gap: 8px;
  padding: 16px 24px; border-top: 1px solid var(--border);
  position: sticky; bottom: 0; background: #fff;
}

/* Champs */
.dep__mfield { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 0; }
.dep__mlabel { font-size: 12px; font-weight: 500; color: var(--muted-foreground); }
.dep__mrow { display: flex; gap: 12px; }

.dep__minput {
  height: 40px; padding: 0 12px;
  border: 1.5px solid var(--input); border-radius: 9px;
  font-size: 14px; font-family: inherit; color: var(--foreground);
  background: #fafafa; outline: none; width: 100%; box-sizing: border-box;
  transition: border-color 0.15s, background 0.15s;
}
.dep__minput:focus { border-color: #18181b; background: #fff; }
.dep__minput--num { text-align: right; padding-right: 32px; }

.dep__minput-wrap { position: relative; }
.dep__minput-suffix {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  font-size: 12px; color: var(--muted-foreground); pointer-events: none;
}

.dep__mselect {
  height: 40px; padding: 0 12px;
  border: 1.5px solid var(--input); border-radius: 9px;
  font-size: 14px; font-family: inherit; color: var(--foreground);
  background: #fafafa; outline: none; cursor: pointer; width: 100%;
  transition: border-color 0.15s;
}
.dep__mselect:focus { border-color: #18181b; }

/* Qui paie */
.dep__qui { display: flex; gap: 8px; }
.dep__qui-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px;
  height: 40px; padding: 0 10px;
  border: 1.5px solid var(--border); border-radius: 9px;
  font-size: 13px; font-weight: 500; font-family: inherit;
  color: var(--muted-foreground); background: #fafafa;
  cursor: pointer; transition: border-color 0.12s, background 0.12s, color 0.12s;
}
.dep__qui-btn:hover { border-color: #a1a1aa; color: var(--foreground); }
.dep__qui-btn--on { font-weight: 600; }
.dep__qui-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

/* Commun block */
.dep__commun-block { display: flex; flex-direction: column; gap: 12px; }

.dep__total-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; background: var(--muted); border-radius: 9px;
}
.dep__total-label { font-size: 13px; color: var(--muted-foreground); }
.dep__total-val { font-size: 15px; font-weight: 700; color: var(--foreground); }
.dep__total-freq { font-size: 12px; font-weight: 400; color: var(--muted-foreground); }

/* Équité */
.dep__equity {
  padding: 12px 14px; border-radius: 9px; border: 1.5px solid;
  display: flex; flex-direction: column; gap: 8px;
}
.dep__equity--ok   { border-color: #bbf7d0; background: #f0fdf4; }
.dep__equity--warn { border-color: #fde68a; background: #fffbeb; }
.dep__equity--bad  { border-color: #fecaca; background: #fff5f5; }

.dep__equity-bar {
  height: 6px; border-radius: 3px; overflow: hidden; display: flex;
}
.dep__equity-bar-p1,
.dep__equity-bar-p2 { height: 100%; transition: width 0.3s ease; }

.dep__equity-labels {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 12px; font-weight: 500;
}
.dep__equity-verdict { font-size: 12px; }
.dep__equity--ok   .dep__equity-verdict { color: #16a34a; }
.dep__equity--warn .dep__equity-verdict { color: #d97706; }
.dep__equity--bad  .dep__equity-verdict { color: #dc2626; }

.dep__equity-ideal { font-size: 11px; color: var(--muted-foreground); }

/* Bouton suggérer */
.dep__suggest-btn {
  display: inline-flex; align-items: center; gap: 7px;
  height: 36px; padding: 0 14px;
  border: 1.5px solid var(--border); border-radius: 8px;
  font-size: 13px; font-weight: 500; font-family: inherit;
  color: var(--foreground); background: var(--muted);
  cursor: pointer; transition: border-color 0.12s, background 0.12s;
  align-self: flex-start;
}
.dep__suggest-btn:hover { border-color: #a1a1aa; background: #ebebeb; }

/* Boutons modale */
.dep__mbtn {
  height: 38px; padding: 0 20px; border-radius: 8px;
  font-size: 13px; font-weight: 500; font-family: inherit;
  cursor: pointer; border: none; transition: background 0.12s, opacity 0.12s;
}
.dep__mbtn--ghost { background: none; border: 1.5px solid var(--border); color: var(--foreground); }
.dep__mbtn--ghost:hover { background: var(--muted); }
.dep__mbtn--primary { background: #18181b; color: #fff; }
.dep__mbtn--primary:hover:not(:disabled) { background: #27272a; }
.dep__mbtn--primary:disabled { opacity: 0.35; cursor: not-allowed; }
.dep__mbtn--danger { background: #ef4444; color: #fff; }
.dep__mbtn--danger:hover { background: #dc2626; }

/* ── Mobile responsive ───────────────────────────────────── */
.dep__mobile-tabs { display: none; }

@media (max-width: 768px) {
  .dep__bar { flex-wrap: wrap; gap: 8px; }
  .dep__select { flex: 1; min-width: 0; }

  .dep__mobile-tabs {
    display: flex;
    gap: 0;
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 12px;
  }

  .dep__mobile-tab {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
    padding: 10px 8px; font-size: 13px; font-weight: 500; font-family: inherit;
    background: var(--card); border: none; cursor: pointer;
    color: var(--muted-foreground); border-right: 1px solid var(--border);
    transition: background 0.12s, color 0.12s;
  }
  .dep__mobile-tab:last-child { border-right: none; }
  .dep__mobile-tab--active { background: #18181b; color: #fff; font-weight: 700; }
  .dep__mobile-tab-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

  .dep__cols {
    grid-template-columns: 1fr;
    gap: 0;
  }

  /* Masquer les colonnes non actives sur mobile */
  .dep__cols .dep__col:nth-child(1) { display: none; }
  .dep__cols .dep__col:nth-child(2) { display: none; }
  .dep__cols .dep__col:nth-child(3) { display: none; }
  .dep__cols[data-mobile-col="p1"] .dep__col:nth-child(1) { display: flex; }
  .dep__cols[data-mobile-col="p2"] .dep__col:nth-child(2) { display: flex; }
  .dep__cols[data-mobile-col="commun"] .dep__col:nth-child(3) { display: flex; }

  .dep__cols--solo .dep__col { display: flex !important; }

  .dep__modal { width: calc(100vw - 32px); max-height: 90dvh; }
  .dep__mrow { flex-direction: column; gap: 12px; }
}
</style>
