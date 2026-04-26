<template>
  <div class="env">

    <!-- Header -->
    <div class="env__header">
      <div>
        <h2 class="env__title">Enveloppes</h2>
        <p class="env__subtitle">Automatisez ce que vous envoyez sur chaque compte de paiement chaque mois</p>
      </div>
      <div class="env__header-actions">
        <MsButton variant="primary" size="sm" @click="openNewModal()">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          Nouvelle enveloppe
        </MsButton>
      </div>
    </div>

    <!-- Bandeau méthode enveloppes -->
    <div class="env__banner" @click="sumOpen = true">
      <div class="env__banner-icon">💡</div>
      <div class="env__banner-text">
        <span class="env__banner-title">La méthode des enveloppes numériques</span>
        <span class="env__banner-sub">Ouvrez un compte dédié par poste de budget. Chaque compte a son IBAN et sa CB. Zéro surprise en fin de mois.</span>
      </div>
      <button class="env__banner-cta" type="button">
        Découvrir la méthode
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>

    <!-- Side panel (drawer) -->
    <Teleport to="body">
      <Transition name="sum-backdrop">
        <div v-if="sumOpen" class="sum__backdrop" @click="sumOpen = false" />
      </Transition>
      <Transition name="sum-drawer">
        <div v-if="sumOpen" class="sum__drawer">

          <!-- Drawer header -->
          <div class="sum__drawer-head">
            <span class="sum__idea-badge">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 1 5.292 11.584C16.4 14.56 16 15.524 16 16.5V17a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-.5c0-.976-.4-1.94-1.292-2.916A7 7 0 0 1 12 2zm-2 17h4v1a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-1z"/></svg>
              Idée
            </span>
            <span class="sum__drawer-title">Mieux organiser ses dépenses</span>
            <button class="sum__drawer-close" type="button" @click="sumOpen = false">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </button>
          </div>

          <!-- Drawer content -->
          <div class="sum__drawer-body">
            <div class="sum__panel">

          <!-- Titre accroche -->
          <div class="sum__hero">
            <h3 class="sum__hero-title">La méthode des enveloppes numériques</h3>
            <p class="sum__hero-sub">Une technique de gestion financière éprouvée depuis des générations, réinventée pour l'ère du virement et du prélèvement automatique.</p>
          </div>

          <!-- Stat intro -->
          <div class="sum__stat-row">
            <div class="sum__stat">
              <div class="sum__stat-num">68%</div>
              <div class="sum__stat-lbl">des Français ont du mal à boucler leurs fins de mois</div>
            </div>
            <div class="sum__stat-sep"></div>
            <div class="sum__stat-body">
              La méthode des enveloppes répond à une question simple : <strong>où part mon argent chaque mois ?</strong> En affectant chaque euro à une catégorie avant de dépenser, vous arrêtez de subir votre compte et vous reprenez le contrôle.
            </div>
          </div>

          <!-- Pourquoi ça marche -->
          <div class="sum__why">
            <div class="sum__why-title">Pourquoi ça fonctionne</div>
            <div class="sum__why-list">
              <div class="sum__why-item">
                <span class="sum__why-ico">👁</span>
                <div>
                  <strong>Clarté totale</strong>
                  <span>Chaque poste a sa limite définie. Fini le solde global flou dont vous ne savez plus si vos prélèvements sont déjà passés.</span>
                </div>
              </div>
              <div class="sum__why-item">
                <span class="sum__why-ico">🧠</span>
                <div>
                  <strong>Moins de dépenses impulsives</strong>
                  <span>Voir l'argent restant dans une enveloppe avant d'acheter crée une prise de conscience que le paiement par carte n'active pas.</span>
                </div>
              </div>
              <div class="sum__why-item">
                <span class="sum__why-ico">📈</span>
                <div>
                  <strong>Une épargne qui se forme naturellement</strong>
                  <span>Ce qui reste dans chaque enveloppe en fin de mois part en épargne. Pas par discipline, par mécanique.</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Réalité numérique -->
          <div class="sum__reality">
            <div class="sum__anxiety-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;margin-top:1px"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>La vraie anxiété : <em>« Est-ce que tous mes prélèvements du mois sont passés avant que je dépense ce qu'il reste ? »</em></span>
            </div>
            <p class="sum__reality-text">
              En 2026, presque toutes vos charges sont <strong>numériques</strong> : loyer par virement, Netflix/Spotify/salle de sport par prélèvement CB, Engie ou EDF par prélèvement automatique, achats en ligne.
              Les enveloppes en papier avec du cash ne s'appliquent pas à cette réalité.
            </p>
            <p class="sum__reality-text">
              La version numérique résout ce problème : chaque poste a son propre <strong>compte bancaire avec un IBAN dédié</strong>. Les prélèvements tombent directement sur le bon compte. Votre compte principal n'est jamais débité par surprise.
            </p>
          </div>

          <!-- Séparateur -->
          <div class="sum__divider">
            <span>Comment ça s'organise concrètement</span>
          </div>

          <!-- Schéma de flux -->
          <div class="flo">

            <div class="flo__label">Exemple · règle des 50/30/20 · Crédit Agricole + Sumeria</div>

            <div class="flo__grid">

              <!-- Compte principal (gauche) -->
              <div class="flo__source">
                <div class="flo__bank-logo flo__bank-logo--ca">CA</div>
                <div class="flo__source-name">Compte principal</div>
                <div class="flo__source-bank">Crédit Agricole</div>
                <div class="flo__source-hr"></div>
                <div class="flo__source-income-lbl">Salaire mensuel</div>
                <div class="flo__source-income">2 500 €</div>
                <div class="flo__source-hr"></div>
                <div class="flo__source-shield">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  Jamais débité directement
                </div>
              </div>

              <!-- Enveloppes (droite, avec lignes de connexion) -->
              <div class="flo__envs">

                <div class="flo__row">
                  <div class="flo__wire"></div>
                  <div class="flo__card flo__card--loyer">
                    <div class="flo__card-l">
                      <span class="flo__card-ico">🏠</span>
                      <div>
                        <div class="flo__card-name">Loyer <span class="flo__card-pct">30%</span></div>
                        <div class="flo__card-detail">Virement permanent propriétaire</div>
                      </div>
                    </div>
                    <div class="flo__card-r">
                      <div class="flo__bank-logo flo__bank-logo--ca">CA</div>
                      <div class="flo__card-amt">750 €</div>
                    </div>
                  </div>
                </div>

                <div class="flo__row">
                  <div class="flo__wire"></div>
                  <div class="flo__card flo__card--charges">
                    <div class="flo__card-l">
                      <span class="flo__card-ico">💳</span>
                      <div>
                        <div class="flo__card-name">Charges fixes <span class="flo__card-pct">16%</span></div>
                        <div class="flo__card-detail">Netflix · Assurance · Téléphone · Internet</div>
                      </div>
                    </div>
                    <div class="flo__card-r">
                      <div class="flo__bank-logo flo__bank-logo--sumeria">Sumeria</div>
                      <div class="flo__tags">
                        <span class="flo__tag flo__tag--iban">IBAN</span>
                        <span class="flo__tag flo__tag--cb">CB propre</span>
                      </div>
                      <div class="flo__card-amt">400 €</div>
                    </div>
                  </div>
                </div>

                <div class="flo__row">
                  <div class="flo__wire"></div>
                  <div class="flo__card flo__card--energie">
                    <div class="flo__card-l">
                      <span class="flo__card-ico">⚡</span>
                      <div>
                        <div class="flo__card-name">Énergie <span class="flo__card-pct">4%</span></div>
                        <div class="flo__card-detail">Engie · lissé, facturé tous les 2 mois</div>
                      </div>
                    </div>
                    <div class="flo__card-r">
                      <div class="flo__bank-logo flo__bank-logo--sumeria">Sumeria</div>
                      <div class="flo__tags">
                        <span class="flo__tag flo__tag--iban">IBAN</span>
                        <span class="flo__tag flo__tag--cb">CB propre</span>
                      </div>
                      <div class="flo__card-amt">100 €</div>
                    </div>
                  </div>
                </div>

                <div class="flo__row">
                  <div class="flo__wire"></div>
                  <div class="flo__card flo__card--cash">
                    <div class="flo__card-l">
                      <span class="flo__card-ico">🛒</span>
                      <div>
                        <div class="flo__card-name">Alimentation &amp; loisirs <span class="flo__card-pct">30%</span></div>
                        <div class="flo__card-detail">Courses · restaurant · sorties</div>
                      </div>
                    </div>
                    <div class="flo__card-r">
                      <span class="flo__tag flo__tag--especes">💵 Retrait en espèces</span>
                      <div class="flo__card-amt">750 €</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <!-- Résultat -->
            <div class="flo__result">
              <div class="flo__result-check">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1.5 6.5L4.5 9.5L10.5 2.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
              <div class="flo__result-body">
                <strong>Zéro prélèvement imprévisible</strong> sur votre compte principal. Les 20% restants partent directement en épargne.
              </div>
              <div class="flo__result-r">
                <div class="flo__result-amt">500 €</div>
                <div class="flo__result-lbl">épargne (20%)</div>
              </div>
            </div>

          </div>

          <!-- Banques qui proposent ce service -->
          <div class="sum__providers">
            <div class="sum__providers-title">Banques digitales qui proposent ce système</div>
            <div class="sum__providers-grid">

              <a class="sum__prov" href="https://sumeria.eu/blog/budget/mieux-gerer-son-budget-avec-les-enveloppes-virtuelles/" target="_blank" rel="noopener noreferrer">
                <div class="sum__prov-top">
                  <span class="sum__prov-logo sum__prov-logo--sumeria">Sumeria</span>
                  <span class="sum__prov-price">3,90€<span>/mois</span></span>
                </div>
                <div class="sum__prov-sub">by Lydia · Banque française</div>
                <div class="sum__prov-desc">Comptes secondaires avec IBAN + CB dédiée</div>
              </a>

              <a class="sum__prov" href="https://www.bunq.com/fr/personal-account/banking-features/budgeting" target="_blank" rel="noopener noreferrer">
                <div class="sum__prov-top">
                  <span class="sum__prov-logo sum__prov-logo--bunq">bunq</span>
                  <span class="sum__prov-price">3,99€<span>/mois</span></span>
                </div>
                <div class="sum__prov-sub">Banque néerlandaise</div>
                <div class="sum__prov-desc">Jusqu'à 25 comptes avec IBAN propre</div>
              </a>

              <a class="sum__prov" href="https://n26.com/fr-fr/espaces" target="_blank" rel="noopener noreferrer">
                <div class="sum__prov-top">
                  <span class="sum__prov-logo sum__prov-logo--n26">N26</span>
                  <span class="sum__prov-price sum__prov-price--free">Gratuit<span>+ premium</span></span>
                </div>
                <div class="sum__prov-sub">Banque allemande</div>
                <div class="sum__prov-desc">Spaces avec IBAN dédié par espace</div>
              </a>

              <a class="sum__prov" href="https://vivid.money/fr-fr/pockets" target="_blank" rel="noopener noreferrer">
                <div class="sum__prov-top">
                  <span class="sum__prov-logo sum__prov-logo--vivid">Vivid</span>
                  <span class="sum__prov-price sum__prov-price--free">0€<span>/mois</span></span>
                </div>
                <div class="sum__prov-sub">Banque européenne</div>
                <div class="sum__prov-desc">Pockets avec IBAN · jusqu'à 15 comptes</div>
              </a>

            </div>
            <div class="sum__providers-note">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" stroke-width="1.2"/><line x1="5.5" y1="4" x2="5.5" y2="6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/><circle cx="5.5" cy="7.5" r="0.6" fill="currentColor"/></svg>
              Revolut Pockets partagent un seul IBAN. Les prélèvements reviennent sur le compte principal.
            </div>
          </div>

            </div>
          </div>

        </div>
      </Transition>
    </Teleport>

    <!-- Grille comptes -->
    <div class="env__grid" v-if="store.enveloppes.length">
      <div v-for="env in store.enveloppes" :key="env.id"
           class="env__card"
           :style="{ '--env-color': env.couleur }">
        <div class="env__card-body">

          <!-- Header compte -->
          <div class="env__card-header">
            <div class="env__card-left">
              <div class="env__card-name">{{ env.nom }}</div>
            </div>
            <div class="env__card-right">
              <button class="env__cta" type="button" @click="openEditModal(env)">Modifier</button>
            </div>
          </div>

          <!-- Pills personne(s) -->
          <div v-if="!isSolo" class="env__persons-row">
            <template v-if="!env.appartientA || env.appartientA === 'tous'">
              <div class="env__person-chip" v-if="store.personnes[0]"
                   :style="{ background: hexToRgba(store.personnes[0].couleur, 0.09), borderColor: hexToRgba(store.personnes[0].couleur, 0.22) }">
                <span class="env__person-dot" :style="{ background: store.personnes[0].couleur }"></span>
                <span class="env__person-name">{{ store.personnes[0].nom }}</span>
                <span class="env__person-amt" :style="{ color: store.personnes[0].couleur }">{{ fmt(store.totalParEnveloppe[env.id]?.p1Charge || 0) }}</span>
              </div>
              <div class="env__person-chip" v-if="store.personnes[1]"
                   :style="{ background: hexToRgba(store.personnes[1].couleur, 0.09), borderColor: hexToRgba(store.personnes[1].couleur, 0.22) }">
                <span class="env__person-dot" :style="{ background: store.personnes[1].couleur }"></span>
                <span class="env__person-name">{{ store.personnes[1].nom }}</span>
                <span class="env__person-amt" :style="{ color: store.personnes[1].couleur }">{{ fmt(store.totalParEnveloppe[env.id]?.p2Charge || 0) }}</span>
              </div>
            </template>
            <template v-else>
              <div class="env__person-chip"
                   :style="{ background: hexToRgba((env.appartientA === 'p1' ? store.personnes[0] : store.personnes[1])?.couleur, 0.09), borderColor: hexToRgba((env.appartientA === 'p1' ? store.personnes[0] : store.personnes[1])?.couleur, 0.22) }">
                <span class="env__person-dot" :style="{ background: (env.appartientA === 'p1' ? store.personnes[0] : store.personnes[1])?.couleur }"></span>
                <span class="env__person-name">{{ (env.appartientA === 'p1' ? store.personnes[0] : store.personnes[1])?.nom }}</span>
              </div>
            </template>
          </div>

          <!-- Montant à virer -->
          <div class="env__virement">
            <div class="env__virement-top">
              <span class="env__virement-label">Total à virer</span>
              <span class="env__virement-amount">{{ fmt(getTotal(env.id)) }}</span>
            </div>
            <div v-if="env.banque" class="env__virement-bank-pill">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
              <img v-if="getBankDomain(env.banque)" :src="`https://www.google.com/s2/favicons?domain=${getBankDomain(env.banque)}&sz=32`" class="env__virement-bank-logo" />
              <span>{{ getBankNom(env.banque) }}</span>
            </div>
          </div>

          <!-- Liste charges -->
          <template v-if="depensesOfEnv(env.id).length">
            <div class="env__lines-header">{{ depensesOfEnv(env.id).length }} dépense{{ depensesOfEnv(env.id).length > 1 ? 's' : '' }}</div>
            <div class="env__lines">
            <div v-for="dep in depensesOfEnv(env.id)" :key="dep.id" class="env__line">
              <div class="env__line-cat">
                <span class="env__line-cat-icon" v-html="getCatIcon(dep)"></span>
                <span class="env__line-cat-nom">{{ getCatNom(dep) }}</span>
              </div>
              <div class="env__line-main">
                <span class="env__line-nom" :class="{ 'env__line-inactive': !dep.actif }">{{ dep.nom }}</span>
                <span class="env__line-montant">{{ fmt(getMontantDepense(dep, env)) }}</span>
              </div>
            </div>
            </div>
          </template>
          <p v-else class="env__empty">Aucune charge assignée</p>

        </div>
      </div>
    </div>

    <!-- État vide -->
    <div v-else class="env__empty-state">
      <div class="env__empty-icon-wrap">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
      </div>
      <p class="env__empty-title">Aucune enveloppe</p>
      <p class="env__empty-sub">Créez votre première enveloppe pour savoir exactement quoi virer chaque mois.</p>
      <MsButton variant="primary" @click="openNewModal()">Créer la première enveloppe</MsButton>
    </div>

    <!-- ── MODALES ── -->
    <Teleport to="body">
      <!-- Édition / Création -->
      <div v-if="editTarget" class="env__overlay" @click.self="editTarget = null">
        <div class="env__modal env__modal--large">
          <h3>{{ editTarget.id ? 'Modifier l\'enveloppe' : 'Nouvelle enveloppe' }}</h3>

          <MsInput label="Nom de l'enveloppe" v-model="editNom" placeholder="Ex: Charges fixes" />

          <div class="env__edit-field">
            <label class="env__edit-label">Couleur</label>
            <div class="env__color-picker">
              <button
                v-for="c in COLORS" :key="c" type="button"
                :class="['env__color-swatch', { 'env__color-swatch--active': editCouleur === c }]"
                :style="{ background: c }"
                @click="editCouleur = c"
              >
                <svg v-if="editCouleur === c" width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="env__edit-field">
            <label class="env__edit-label">Ce compte appartient à</label>
            <div class="env__pills">
              <button type="button" :class="['env__pill', { 'env__pill--active': editAppartientA === 'tous' }]" @click="editAppartientA = 'tous'">Les deux</button>
              <button type="button" :class="['env__pill', { 'env__pill--active': editAppartientA === 'p1' }]" @click="editAppartientA = 'p1'">{{ store.personnes[0]?.nom || 'P1' }}</button>
              <button type="button" :class="['env__pill', { 'env__pill--active': editAppartientA === 'p2' }]" @click="editAppartientA = 'p2'">{{ store.personnes[1]?.nom || 'P2' }}</button>
            </div>
          </div>

          <div class="env__edit-field">
            <label class="env__edit-label">Compte bancaire associé</label>
            <div class="env__bank-select-wrap">
              <img
                v-if="editBanque && editBanque !== 'autre' && getBankDomain(editBanque)"
                :src="`https://www.google.com/s2/favicons?domain=${getBankDomain(editBanque)}&sz=32`"
                class="env__bank-select-favicon"
                alt=""
              />
              <select :class="['env__bank-select', { 'env__bank-select--with-icon': editBanque && editBanque !== 'autre' && getBankDomain(editBanque) }]" v-model="editBanque">
                <option :value="null">Aucune banque</option>
                <option v-for="bank in BANKS" :key="bank.id" :value="bank.id">{{ bank.nom }}</option>
                <option value="autre">Autre...</option>
              </select>
            </div>
            <input
              v-if="editBanque === 'autre'"
              class="env__edit-input env__bank-autre"
              v-model="editBanqueAutre"
              placeholder="Nom de votre banque"
            />
          </div>

          <div class="env__edit-field">
            <label class="env__edit-label">
              Charges assignées à ce compte
              <span class="env__edit-label-hint">— filtré selon le propriétaire ci-dessus</span>
            </label>
            <div class="env__dep-list">
              <label v-for="dep in filteredDepensesForEnv" :key="dep.id" class="env__dep-row">
                <input type="checkbox" class="env__dep-check" :checked="editLignes.includes(dep.id)" @change="toggleDepLigne(dep.id)" />
                <div class="env__dep-dot" :style="{ background: getCatColor(dep.categorieId) }"></div>
                <span class="env__dep-nom">{{ dep.nom }}</span>
                <span class="env__dep-montant">{{ fmt(montantPourPerson(dep)) }}</span>
              </label>
              <div v-if="filteredDepensesForEnv.length === 0" class="env__dep-empty">Aucune charge pour ce propriétaire</div>
            </div>
          </div>

          <div class="env__modal-actions">
            <button v-if="editTarget && editTarget.id" class="env__del-link" type="button" @click="() => { const t = editTarget; editTarget = null; deleteTarget = t }">Supprimer ce compte</button>
            <div v-else></div>
            <div style="display:flex;gap:8px;">
              <MsButton variant="secondary" @click="editTarget = null">Annuler</MsButton>
              <MsButton variant="primary" @click="saveEdit" :disabled="!editNom.trim()">{{ editTarget && editTarget.id ? 'Enregistrer' : 'Créer l\'enveloppe' }}</MsButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Suppression -->
      <div v-if="deleteTarget" class="env__overlay" @click.self="deleteTarget = null">
        <div class="env__modal">
          <h3>Supprimer ce compte ?</h3>
          <p>Les charges de « {{ deleteTarget.nom }} » seront désassignées, pas supprimées.</p>
          <div class="env__modal-actions">
            <MsButton variant="secondary" @click="deleteTarget = null">Annuler</MsButton>
            <MsButton variant="danger" @click="doDeleteEnv">Supprimer</MsButton>
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
import { MsButton, MsInput } from './ui/index.js'

const store = useBudgetStore()
const { scheduleAutoSave } = useStorage()

const isSolo  = computed(() => store.personnes.length < 2)
const sumOpen = ref(false)

const COLORS = ['#18181B', '#71717A', '#E8643A', '#EF4444', '#22C55E', '#F08C46', '#25566E', '#D4A84B']

const BANKS = [
  { id: 'sumeria',      nom: 'Sumeria',          domain: 'sumeria.eu' },
  { id: 'boursorama',   nom: 'Boursorama',        domain: 'boursorama.com' },
  { id: 'revolut',      nom: 'Revolut',           domain: 'revolut.com' },
  { id: 'n26',          nom: 'N26',               domain: 'n26.com' },
  { id: 'fortuneo',     nom: 'Fortuneo',          domain: 'fortuneo.fr' },
  { id: 'hellobank',    nom: 'Hello bank!',       domain: 'hellobank.fr' },
  { id: 'nickel',       nom: 'Nickel',            domain: 'nickel.eu' },
  { id: 'qonto',        nom: 'Qonto',             domain: 'qonto.com' },
  { id: 'traderepublic',nom: 'Trade Republic',    domain: 'traderepublic.com' },
  { id: 'ca',           nom: 'Crédit Agricole',   domain: 'credit-agricole.fr' },
  { id: 'bnp',          nom: 'BNP Paribas',       domain: 'bnpparibas.fr' },
  { id: 'sg',           nom: 'Société Générale',  domain: 'societegenerale.fr' },
  { id: 'lcl',          nom: 'LCL',               domain: 'lcl.fr' },
  { id: 'postale',      nom: 'Banque Postale',    domain: 'labanquepostale.fr' },
  { id: 'cic',          nom: 'CIC',               domain: 'cic.fr' },
]

function getBankById(id) { return BANKS.find(b => b.id === id) ?? null }
function getBankNom(id)  {
  if (!id) return ''
  const bank = getBankById(id)
  if (bank) return bank.nom
  return id // custom free-text stored directly as the value
}
function getBankDomain(id) { return getBankById(id)?.domain ?? '' }

function fmt(n) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}
function getCatColor(catId) {
  return store.categories.find(c => c.id === catId)?.couleur || '#E5E7EB'
}
function getCatNom(dep) {
  return store.categories.find(c => c.id === dep.categorieId)?.nom ?? '—'
}
function getCatIcon(dep) {
  const nom = getCatNom(dep).toLowerCase()
  const map = {
    logement:     '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>',
    transport:    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    alimentation: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
    loisirs:      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
    'santé':      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    'épargne':    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    abonnements:  '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>',
    enfants:      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    assurance:    '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    emprunt:      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
    charges:      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
  }
  const key = Object.keys(map).find(k => nom.includes(k))
  return key ? map[key] : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>'
}
function depensesOfEnv(envId) {
  return store.depenses.filter(d => d.enveloppeId === envId)
}
function getTotal(envId) { return store.totalParEnveloppe[envId]?.totalAffiche || 0 }

function getMontantDepense(dep, env) {
  const ap = env.appartientA || 'tous'
  if (ap === 'p1') return store.toMonthly(dep.montantP1 || 0, dep.frequence)
  if (ap === 'p2') return store.toMonthly(dep.montantP2 || 0, dep.frequence)
  return store.toMonthly((dep.montantP1||0) + (dep.montantP2||0) + (dep.montantCommun||0), dep.frequence)
}

function badgeLabel(env) {
  const ap = env.appartientA || 'tous'
  if (ap === 'p1') return store.personnes[0]?.nom || 'P1'
  if (ap === 'p2') return store.personnes[1]?.nom || 'P2'
  return 'Commun'
}

function hexToRgba(hex, alpha) {
  if (!hex || !hex.startsWith('#')) return `rgba(0,0,0,${alpha})`
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16)
  const g = parseInt(h.substring(2, 4), 16)
  const b = parseInt(h.substring(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function badgeStyle(env) {
  const ap = env.appartientA || 'tous'
  if (ap === 'p1') {
    const col = store.personnes[0]?.couleur
    if (!col) return {}
    return { background: hexToRgba(col, 0.12), color: col, border: `1px solid ${hexToRgba(col, 0.28)}` }
  }
  if (ap === 'p2') {
    const col = store.personnes[1]?.couleur
    if (!col) return {}
    return { background: hexToRgba(col, 0.12), color: col, border: `1px solid ${hexToRgba(col, 0.28)}` }
  }
  return {}
}

function virementStyle(env) {
  const p1col = store.personnes[0]?.couleur ?? '#7C6FCD'
  const p2col = store.personnes[1]?.couleur ?? '#4A9EDB'
  if (!env.appartientA || env.appartientA === 'tous') {
    return {
      background: `linear-gradient(135deg, ${hexToRgba(p1col, 0.13)} 0%, ${hexToRgba(p2col, 0.13)} 100%)`,
      borderColor: hexToRgba(p1col, 0.22),
    }
  }
  const col = env.appartientA === 'p1' ? p1col : p2col
  return { background: hexToRgba(col, 0.10), borderColor: hexToRgba(col, 0.25) }
}

// Totaux virements par personne
const totalAVirerP1 = computed(() =>
  store.enveloppes.reduce((s, env) => s + (store.totalParEnveloppe[env.id]?.p1Charge || 0), 0)
)
const totalAVirerP2 = computed(() =>
  store.enveloppes.reduce((s, env) => s + (store.totalParEnveloppe[env.id]?.p2Charge || 0), 0)
)

// ── Ajout / Édition (modale unifiée) ─────────────────────
const editTarget      = ref(null)   // null = fermé, {} = création, env = édition
const editNom         = ref('')
const editCouleur     = ref(COLORS[0])
const editLignes      = ref([])
const editAppartientA = ref('tous')
const editBanque      = ref(null)   // id prédéfini | 'autre' | null
const editBanqueAutre = ref('')     // texte libre si editBanque === 'autre'

function openNewModal() {
  editTarget.value      = {}        // objet vide = pas d'id → mode création
  editNom.value         = ''
  editCouleur.value     = COLORS[0]
  editAppartientA.value = 'tous'
  editBanque.value      = null
  editBanqueAutre.value = ''
  editLignes.value      = []
}

// Bug fix: filtrer les dépenses selon le propriétaire sélectionné
const filteredDepensesForEnv = computed(() => {
  if (editAppartientA.value === 'p1') return store.depenses.filter(d => (d.montantP1 || 0) > 0)
  if (editAppartientA.value === 'p2') return store.depenses.filter(d => (d.montantP2 || 0) > 0)
  return store.depenses
})

// Montant affiché dans la liste selon le propriétaire
function montantPourPerson(dep) {
  if (editAppartientA.value === 'p1') return store.toMonthly(dep.montantP1 || 0, dep.frequence)
  if (editAppartientA.value === 'p2') return store.toMonthly(dep.montantP2 || 0, dep.frequence)
  return store.toMonthly((dep.montantP1||0) + (dep.montantP2||0) + (dep.montantCommun||0), dep.frequence)
}

function openEditModal(env) {
  editTarget.value      = env
  editNom.value         = env.nom
  editCouleur.value     = env.couleur || COLORS[0]
  editAppartientA.value = env.appartientA || 'tous'
  const storedBanque    = env.banque ?? null
  const isKnown         = storedBanque && BANKS.find(b => b.id === storedBanque)
  editBanque.value      = isKnown ? storedBanque : (storedBanque ? 'autre' : null)
  editBanqueAutre.value = (!isKnown && storedBanque) ? storedBanque : ''
  editLignes.value      = store.depenses.filter(d => d.enveloppeId === env.id).map(d => d.id)
}

function toggleDepLigne(depId) {
  const idx = editLignes.value.indexOf(depId)
  if (idx === -1) editLignes.value.push(depId)
  else editLignes.value.splice(idx, 1)
}

function saveEdit() {
  if (!editTarget.value) return
  const nomTrimmed = editNom.value.trim()
  if (!nomTrimmed) return
  const banqueVal = editBanque.value === 'autre'
    ? (editBanqueAutre.value.trim() || null)
    : editBanque.value

  const isCreate = !editTarget.value.id
  let envId
  if (isCreate) {
    envId = store.addEnveloppe(nomTrimmed, [], editAppartientA.value)
    store.updateEnveloppe(envId, { couleur: editCouleur.value, banque: banqueVal })
  } else {
    envId = editTarget.value.id
    store.updateEnveloppe(envId, {
      nom:         nomTrimmed,
      couleur:     editCouleur.value,
      appartientA: editAppartientA.value,
      banque:      banqueVal,
    })
  }
  store.depenses.forEach(d => {
    const shouldBeIn = editLignes.value.includes(d.id)
    const isIn       = d.enveloppeId === envId
    if (shouldBeIn && !isIn) store.assignDepenseToEnveloppe(d.id, envId)
    else if (!shouldBeIn && isIn) store.assignDepenseToEnveloppe(d.id, null)
  })
  scheduleAutoSave()
  editTarget.value = null
}

// ── Suppression ───────────────────────────────────────────
const deleteTarget = ref(null)
function confirmDeleteEnv(env) { deleteTarget.value = env }
function doDeleteEnv() {
  store.deleteEnveloppe(deleteTarget.value.id)
  scheduleAutoSave()
  deleteTarget.value = null
}
</script>

<style scoped>
.env { display: flex; flex-direction: column; gap: 24px; width: 100%; box-sizing: border-box; }

.env__header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.env__header-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.env__title { font-size: 18px; font-weight: 700; margin: 0; }
.env__subtitle { font-size: 13px; color: var(--muted-foreground); margin: 4px 0 0; }

/* ── Bandeau méthode enveloppes ─────────────────────────── */
.env__banner {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 18px; border-radius: 12px;
  background: #fefce8; border: 1px solid #fde68a;
  cursor: pointer; transition: background 0.15s, border-color 0.15s;
}
.env__banner:hover { background: #fef9c3; border-color: #facc15; }
.env__banner-icon { font-size: 20px; flex-shrink: 0; }
.env__banner-text { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.env__banner-title { font-size: 13px; font-weight: 700; color: #713f12; }
.env__banner-sub { font-size: 12px; color: #92400e; line-height: 1.4; }
.env__banner-cta {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 14px; border-radius: 8px; flex-shrink: 0;
  font-size: 12px; font-weight: 600; font-family: inherit;
  background: #713f12; color: #fff; border: none;
  cursor: pointer; white-space: nowrap;
  transition: background 0.12s;
}
.env__banner:hover .env__banner-cta { background: #92400e; }

.sum__idea-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 8px; border-radius: 99px;
  background: #fef9c3; color: #92400e;
  font-size: 11px; font-weight: 700; flex-shrink: 0;
}

/* ── Side panel (drawer) ────────────────────────────────── */
.sum__backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.38); z-index: 400;
}
.sum__drawer {
  position: fixed; top: 0; right: 0; bottom: 0;
  width: 700px; max-width: 95vw; z-index: 401;
  background: #fff; border-left: 1px solid #e4e4e7;
  box-shadow: -16px 0 56px rgba(0,0,0,0.12);
  display: flex; flex-direction: column; overflow: hidden;
}

.sum__drawer-head {
  display: flex; align-items: center; gap: 10px;
  padding: 16px 20px; border-bottom: 1px solid #e4e4e7; flex-shrink: 0;
}
.sum__drawer-title {
  flex: 1; font-size: 14px; font-weight: 600; color: #18181b;
}
.sum__drawer-close {
  width: 28px; height: 28px; border-radius: 7px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: none; border: none; color: #a1a1aa;
  cursor: pointer; transition: background 0.12s, color 0.12s;
}
.sum__drawer-close:hover { background: #f4f4f5; color: #18181b; }

.sum__drawer-body {
  flex: 1; overflow-y: auto; padding: 20px;
}

/* Panel contenu */
.sum__panel {
  display: flex; flex-direction: column; gap: 20px;
}

/* Transitions drawer */
.sum-backdrop-enter-active, .sum-backdrop-leave-active { transition: opacity 0.22s; }
.sum-backdrop-enter-from,   .sum-backdrop-leave-to    { opacity: 0; }
.sum-drawer-enter-active, .sum-drawer-leave-active { transition: transform 0.28s cubic-bezier(0.4,0,0.2,1); }
.sum-drawer-enter-from,   .sum-drawer-leave-to    { transform: translateX(100%); }

/* Titre accroche */
.sum__hero { display: flex; flex-direction: column; gap: 6px; padding-top: 18px; }
.sum__hero-title {
  font-size: 17px; font-weight: 800; color: #18181b;
  letter-spacing: -0.4px; margin: 0; line-height: 1.25;
}
.sum__hero-sub {
  font-size: 13px; color: #71717a; margin: 0; line-height: 1.55;
}

/* Stat row */
.sum__stat-row {
  display: flex; align-items: center; gap: 20px;
  padding: 16px 18px; border-radius: 12px;
  background: #f0fdf4; border: 1px solid #bbf7d0;
}
.sum__stat { flex-shrink: 0; text-align: center; }
.sum__stat-num { font-size: 28px; font-weight: 900; color: #15803d; letter-spacing: -1px; line-height: 1; }
.sum__stat-lbl { font-size: 10px; color: #166534; font-weight: 500; margin-top: 3px; max-width: 80px; line-height: 1.3; }
.sum__stat-sep { width: 1px; height: 48px; background: #86efac; flex-shrink: 0; }
.sum__stat-body { font-size: 13px; color: #166534; line-height: 1.6; }
.sum__stat-body strong { color: #14532d; font-weight: 700; }

/* Pourquoi ça marche */
.sum__why { display: flex; flex-direction: column; gap: 8px; }
.sum__why-title { font-size: 12px; font-weight: 700; color: var(--muted-foreground); text-transform: uppercase; letter-spacing: 0.05em; }
.sum__why-list { display: flex; flex-direction: column; gap: 0; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
.sum__why-item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 12px 14px; background: var(--card);
  border-bottom: 1px solid var(--border); font-size: 13px;
}
.sum__why-item:last-child { border-bottom: none; }
.sum__why-ico { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
.sum__why-item strong { display: block; font-weight: 700; color: var(--foreground); margin-bottom: 2px; font-size: 13px; }
.sum__why-item span { color: var(--muted-foreground); line-height: 1.5; }

/* Réalité numérique */
.sum__reality { display: flex; flex-direction: column; gap: 12px; }
.sum__reality-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.sum__chip {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 10px; border-radius: 99px;
  background: var(--muted); border: 1px solid var(--border);
  font-size: 12px; font-weight: 500; color: var(--foreground);
}
.sum__reality-text {
  font-size: 13px; color: var(--muted-foreground); line-height: 1.65; margin: 0;
}
.sum__reality-text strong { color: var(--foreground); font-weight: 600; }
.sum__anxiety-box {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 10px 14px; border-radius: 8px;
  background: #fefce8; border: 1px solid #fde047;
  font-size: 13px; color: #713f12; line-height: 1.55;
}
.sum__anxiety-box em { font-style: italic; }

/* Séparateur */
.sum__divider {
  display: flex; align-items: center; gap: 12px;
  color: var(--muted-foreground); font-size: 11px; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.05em;
}
.sum__divider::before, .sum__divider::after {
  content: ''; flex: 1; height: 1px; background: var(--border);
}

.sum__header {
  display: flex; align-items: center; justify-content: space-between;
}
.sum__logo { display: flex; align-items: center; gap: 8px; }
.sum__logo-text { font-size: 18px; font-weight: 800; color: #1a1aff; letter-spacing: -0.5px; }
.sum__logo-by   { font-size: 11px; color: var(--muted-foreground); margin-top: 2px; }
.sum__gratuit {
  font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 99px;
  background: #dcfce7; color: #166534;
}

.sum__pitch {
  font-size: 13px; color: var(--muted-foreground); line-height: 1.65; margin: 0;
}

.sum__features { display: flex; flex-direction: column; gap: 12px; }
.sum__feature  { display: flex; align-items: flex-start; gap: 12px; }
.sum__feature-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
.sum__feature-title { font-size: 13px; font-weight: 600; color: var(--foreground); }
.sum__feature-sub   { font-size: 12px; color: var(--muted-foreground); line-height: 1.5; margin-top: 2px; }

/* ── Schéma de flux ─────────────────────────────────────── */
.flo {
  border: 1.5px solid #e4e4e7; border-radius: 14px; overflow: hidden; background: #fff;
}

.flo__label {
  padding: 7px 16px; text-align: center;
  font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
  color: #0369a1; background: #f0f9ff; border-bottom: 1px solid #e0f2fe;
}

/* Layout 2 colonnes */
.flo__grid {
  display: grid; grid-template-columns: 154px 1fr;
}

/* Colonne gauche — Compte principal */
.flo__source {
  display: flex; flex-direction: column; gap: 8px;
  padding: 18px 16px; border-right: 2px solid #e4e4e7; background: #fafafa;
}
.flo__bank-logo {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 3px 8px; border-radius: 6px;
  font-size: 11px; font-weight: 800; letter-spacing: 0.3px;
  white-space: nowrap; flex-shrink: 0;
}
.flo__bank-logo--ca { background: #1b7e3e; color: #fff; }
.flo__bank-logo--sumeria { background: #6d28d9; color: #fff; }
.flo__source-name { font-size: 13px; font-weight: 700; color: #18181b; }
.flo__source-bank { font-size: 10px; color: #a1a1aa; line-height: 1.4; }
.flo__source-hr   { height: 1px; background: #e4e4e7; margin: 2px 0; }
.flo__source-income-lbl { font-size: 10px; color: #71717a; font-weight: 500; }
.flo__source-income { font-size: 22px; font-weight: 800; color: #18181b; letter-spacing: -0.5px; }
.flo__source-shield {
  display: flex; align-items: center; gap: 5px; margin-top: auto; padding-top: 4px;
  font-size: 10px; color: #71717a; font-weight: 500;
  background: #f4f4f5; border-radius: 6px; padding: 6px 8px;
}

/* Colonne droite — Enveloppes */
.flo__envs { display: flex; flex-direction: column; }

.flo__row {
  display: flex; align-items: center; gap: 0;
  padding: 9px 14px 9px 0;
  border-bottom: 1px solid #f4f4f5;
}
.flo__row:last-child { border-bottom: none; }

/* Fil de connexion (le "maillage") */
.flo__wire {
  flex-shrink: 0; width: 22px; height: 2px; background: #d4d4d8;
  margin-right: 10px;
}

/* Carte enveloppe */
.flo__card {
  flex: 1; display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 10px 14px; border-radius: 10px;
  border: 1.5px solid #e4e4e7; background: #fff;
}
.flo__card--loyer   { border-color: #ddd6fe; }
.flo__card--charges { border-color: #bfdbfe; }
.flo__card--energie { border-color: #fed7aa; }
.flo__card--cash    { border-color: #bbf7d0; }

.flo__card-l { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.flo__card-ico  { font-size: 18px; flex-shrink: 0; }
.flo__card-name { font-size: 13px; font-weight: 700; color: #18181b; display: flex; align-items: center; gap: 6px; }
.flo__card-pct { font-size: 10px; font-weight: 700; color: #6d28d9; background: #ede9fe; padding: 1px 5px; border-radius: 4px; }
.flo__card-detail { font-size: 10px; color: #71717a; margin-top: 1px; }

.flo__card-r { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; flex-shrink: 0; }

.flo__tags { display: flex; gap: 4px; }
.flo__tag {
  font-size: 10px; font-weight: 700; padding: 2px 6px;
  border-radius: 4px; letter-spacing: 0.02em; white-space: nowrap;
}
.flo__env-label   { font-size: 9px; font-weight: 700; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap; }
.flo__tag--iban   { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
.flo__tag--cb     { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.flo__tag--especes { font-size: 11px; padding: 3px 8px; background: #fefce8; color: #713f12; border: 1px solid #fde68a; white-space: nowrap; }

.flo__card-amt { font-size: 18px; font-weight: 800; color: #18181b; letter-spacing: -0.5px; }

/* Bande résultat */
.flo__result {
  display: flex; align-items: center; gap: 12px;
  padding: 13px 18px; background: #f0fdf4; border-top: 1.5px solid #bbf7d0;
}
.flo__result-check {
  width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: #16a34a; color: #fff;
}
.flo__result-body { flex: 1; font-size: 12px; color: #14532d; line-height: 1.5; }
.flo__result-body strong { font-weight: 700; }
.flo__result-r { text-align: right; flex-shrink: 0; }
.flo__result-amt { font-size: 20px; font-weight: 800; color: #14532d; letter-spacing: -0.5px; }
.flo__result-lbl { font-size: 10px; color: #16a34a; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }

/* ── Providers ──────────────────────────────────────────── */
.sum__providers { display: flex; flex-direction: column; gap: 10px; }
.sum__providers-title {
  font-size: 11px; font-weight: 600; color: #a1a1aa;
  text-transform: uppercase; letter-spacing: 0.06em;
}
.sum__providers-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
}

.sum__prov {
  display: flex; flex-direction: column; gap: 5px;
  padding: 14px 14px 12px; border-radius: 12px;
  border: 1.5px solid #e4e4e7; background: #fafafa;
  text-decoration: none; transition: border-color 0.13s, background 0.13s;
}
.sum__prov:hover { border-color: #a1a1aa; background: #f4f4f5; }

.sum__prov-top {
  display: flex; align-items: baseline; justify-content: space-between; gap: 8px;
}
.sum__prov-logo {
  font-weight: 900; font-size: 17px; letter-spacing: -0.5px; line-height: 1;
}
.sum__prov-logo--sumeria { font-family: Georgia, 'Times New Roman', serif; color: #18181b; }
.sum__prov-logo--bunq    { color: #00c29a; font-size: 18px; }
.sum__prov-logo--n26     { color: #26AEB3; font-size: 17px; }
.sum__prov-logo--vivid   { color: #FF6B35; font-size: 17px; }

.sum__prov-price {
  font-size: 15px; font-weight: 800; color: #18181b; white-space: nowrap; letter-spacing: -0.3px;
}
.sum__prov-price span { font-size: 11px; font-weight: 500; color: #a1a1aa; }
.sum__prov-price--free { color: #16a34a; }
.sum__prov-price--free span { color: #86efac; }

.sum__prov-sub  { font-size: 10px; color: #a1a1aa; font-weight: 500; }
.sum__prov-desc { font-size: 12px; color: #52525b; line-height: 1.4; }

.sum__providers-note {
  display: flex; align-items: flex-start; gap: 6px;
  font-size: 11px; color: #a1a1aa; line-height: 1.5;
}
.sum__providers-note svg { flex-shrink: 0; margin-top: 1px; }


/* ── Résumé virements ───────────────────────────────────── */
.env__summary {
  display: flex; align-items: center; gap: 0;
  background: var(--card); border: 1px solid var(--border);
  border-radius: 12px; overflow: hidden;
}
.env__summary-person {
  flex: 1; display: flex; align-items: center; gap: 10px;
  padding: 16px 20px;
}
.env__summary-sep { width: 1px; background: var(--border); align-self: stretch; }
.env__summary-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.env__summary-info { display: flex; flex-direction: column; gap: 1px; flex: 1; }
.env__summary-name { font-size: 13px; font-weight: 600; color: var(--foreground); }
.env__summary-label { font-size: 11px; color: var(--muted-foreground); }
.env__summary-amount { font-size: 16px; font-weight: 700; color: var(--foreground); flex-shrink: 0; }

/* ── Grille ─────────────────────────────────────────────── */
.env__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
@media (max-width: 900px) { .env__grid { grid-template-columns: minmax(0, 1fr); } }

.env__card {
  background: var(--card); border-radius: 14px;
  border: 1px solid var(--border);
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  overflow: hidden; display: flex; flex-direction: column;
  transition: box-shadow 0.2s ease, transform 0.18s ease;
}
.env__card:hover {
  box-shadow: 0 6px 20px rgba(0,0,0,0.09), 0 2px 6px rgba(0,0,0,0.06);
  transform: translateY(-2px);
}
.env__card-body { padding: 18px; display: flex; flex-direction: column; gap: 14px; }

.env__card-header { display: flex; align-items: flex-start; justify-content: space-between; }
.env__card-left { display: flex; align-items: flex-start; gap: 10px; }
.env__card-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.env__dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; background: var(--env-color, #e5e7eb); }
.env__card-name { font-size: 13px; font-weight: 600; color: var(--foreground); }
.env__card-sub  { font-size: 12px; color: var(--muted-foreground); margin-top: 2px; }
.env__cta {
  height: 24px; padding: 0 9px; border-radius: 5px;
  font-size: 11px; font-weight: 500; font-family: inherit;
  background: transparent; border: 1px solid var(--border);
  color: var(--muted-foreground); cursor: pointer;
  transition: border-color 0.12s, color 0.12s;
  white-space: nowrap;
}
.env__cta:hover { border-color: var(--zinc-400); color: var(--foreground); }

.env__badge {
  font-size: 11px; padding: 2px 10px;
  border-radius: var(--radius-full);
  white-space: nowrap; font-weight: 600;
  background: var(--secondary); color: var(--secondary-foreground);
  border: 1px solid var(--border);
}

.env__del-link {
  background: none; border: none; padding: 0;
  font-size: 12px; font-weight: 500; color: #ef4444;
  cursor: pointer; text-decoration: underline; text-underline-offset: 2px;
  transition: opacity 0.12s;
}
.env__del-link:hover { opacity: 0.7; }
.env__modal-actions { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 4px; }

/* Virement principal */
.env__virement {
  border: none; border-bottom: 1px solid var(--border);
  border-radius: 0; padding: 0 0 12px;
  display: flex; flex-direction: column; gap: 6px;
}
.env__virement-top { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; }
.env__virement-label { font-size: 11px; font-weight: 500; color: var(--muted-foreground); }
.env__virement-amount { font-size: 16px; font-weight: 700; color: var(--foreground); letter-spacing: -0.5px; }
.env__virement-bank-pill {
  display: inline-flex; align-items: center; gap: 5px; align-self: flex-start;
  padding: 3px 8px; border-radius: 99px;
  background: var(--muted); border: 1px solid var(--border);
  font-size: 11px; font-weight: 500; color: var(--muted-foreground);
}
.env__virement-bank-pill svg { flex-shrink: 0; }
.env__virement-bank-logo { width: 13px; height: 13px; border-radius: 2px; object-fit: contain; flex-shrink: 0; }

/* Chips personnes */
.env__persons-row { display: flex; gap: 6px; flex-wrap: wrap; }
.env__person-chip {
  display: flex; align-items: center; gap: 6px;
  border: 1px solid transparent; border-radius: 8px; padding: 7px 10px;
  flex: 1; min-width: 0;
}
.env__person-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.env__person-name { font-size: 12px; font-weight: 500; color: var(--foreground); flex: 1; }
.env__person-amt { font-size: 13px; font-weight: 700; }

/* Charges */
.env__lines-header {
  font-size: 9px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.05em; color: var(--muted-foreground);
}
.env__lines { display: flex; flex-direction: column; }
.env__line {
  display: flex; flex-direction: column; gap: 3px;
  padding: 8px 0; border-bottom: 1px solid var(--border);
}
.env__line:last-child { border-bottom: none; }

.env__line-cat {
  display: flex; align-items: center; gap: 4px;
}
.env__line-cat-icon {
  flex-shrink: 0; display: flex; align-items: center; color: var(--muted-foreground);
}
.env__line-cat-nom {
  font-size: 9px; font-weight: 600; color: var(--muted-foreground);
  text-transform: uppercase; letter-spacing: 0.06em;
}

.env__line-main {
  display: flex; align-items: center; justify-content: space-between; gap: 8px;
}
.env__line-nom  { flex: 1; font-size: 13px; font-weight: 600; color: var(--foreground); min-width: 0; }
.env__line-montant { font-size: 13px; font-weight: 400; color: var(--foreground); flex-shrink: 0; }
.env__line-inactive { opacity: 0.4; text-decoration: line-through; }
.env__empty { font-size: 13px; color: var(--muted-foreground); text-align: center; padding: 8px 0; }

/* État vide */
.env__empty-state {
  text-align: center; padding: 48px 32px;
  display: flex; flex-direction: column; align-items: center; gap: 12px;
}
.env__empty-icon-wrap { color: var(--border); }
.env__empty-title { font-size: 16px; font-weight: 600; color: var(--foreground); margin: 0; }
.env__empty-sub { font-size: 13px; color: var(--muted-foreground); margin: 0; max-width: 360px; line-height: 1.6; }

/* ── Modales ─────────────────────────────────────────────── */
.env__overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
  padding: 20px;
}
.env__modal {
  background: var(--card); border: 1px solid var(--border);
  border-radius: var(--radius-xl); padding: 24px;
  max-width: 400px; width: 100%; box-shadow: var(--shadow-xl);
  display: flex; flex-direction: column; gap: 16px;
  max-height: 90vh; overflow-y: auto;
}
.env__modal--large { max-width: 520px; }
.env__modal h3 { font-size: 16px; font-weight: 600; margin: 0; }
.env__modal p  { font-size: 14px; color: var(--muted-foreground); margin: 0; }


.env__edit-field { display: flex; flex-direction: column; gap: 6px; }
.env__edit-label { font-size: 12px; font-weight: 500; color: var(--muted-foreground); }
.env__edit-label-hint { font-weight: 400; font-style: italic; }
.env__edit-input {
  height: 36px; padding: 0 12px;
  border: 1px solid var(--input); border-radius: var(--radius-md);
  font-size: 14px; font-family: inherit; color: var(--foreground);
  background: var(--background); outline: none;
  transition: border-color 150ms, box-shadow 150ms;
}
.env__edit-input:focus { border-color: var(--ring); box-shadow: 0 0 0 2px rgba(24,24,27,0.12); }

.env__pills { display: flex; gap: 8px; flex-wrap: wrap; }
.env__pill {
  padding: 6px 16px; border-radius: var(--radius-full);
  font-size: 13px; font-family: inherit; cursor: pointer;
  background: var(--secondary); border: 1px solid var(--border); color: var(--secondary-foreground);
  transition: background 150ms, color 150ms, border-color 150ms;
}
.env__pill--active { background: var(--primary); border-color: var(--primary); color: var(--primary-foreground); }

.env__color-picker { display: flex; gap: 8px; flex-wrap: wrap; }
.env__color-swatch {
  width: 30px; height: 30px; border-radius: 50%;
  border: 2px solid transparent;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: transform 150ms;
}
.env__color-swatch:hover { transform: scale(1.1); }
.env__color-swatch--active { border-color: rgba(0,0,0,0.25); transform: scale(1.1); }

/* Bank select dropdown */
.env__bank-select-wrap {
  position: relative; display: flex; align-items: center;
}
.env__bank-select-favicon {
  position: absolute; left: 10px; width: 16px; height: 16px;
  border-radius: 3px; object-fit: contain; pointer-events: none; z-index: 1;
}
.env__bank-select {
  width: 100%; height: 36px;
  padding: 0 32px 0 12px;
  border: 1px solid var(--input); border-radius: var(--radius-md);
  font-size: 13px; font-family: inherit; color: var(--foreground);
  background: var(--background); outline: none; cursor: pointer;
  appearance: none; -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  transition: border-color 150ms;
}
.env__bank-select:focus { border-color: var(--ring); }
.env__bank-select--with-icon { padding-left: 34px; }
.env__bank-autre { margin-top: 6px; width: 100%; }

/* Bank on card */
.env__card-bank {
  display: flex; align-items: center; gap: 5px; margin-top: 4px;
}
.env__card-bank-logo { width: 14px; height: 14px; border-radius: 3px; object-fit: contain; }
.env__card-bank-name { font-size: 11px; color: var(--muted-foreground); }

.env__dep-list {
  border: 1px solid var(--border); border-radius: var(--radius-md);
  overflow-y: auto; max-height: 200px;
}
.env__dep-row {
  display: flex; align-items: center; gap: 8px;
  padding: 9px 12px; cursor: pointer;
  border-bottom: 1px solid var(--border); transition: background 150ms;
}
.env__dep-row:last-child { border-bottom: none; }
.env__dep-row:hover { background: var(--accent); }
.env__dep-check { accent-color: var(--primary); width: 15px; height: 15px; flex-shrink: 0; cursor: pointer; }
.env__dep-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.env__dep-nom { flex: 1; font-size: 13px; color: var(--foreground); }
.env__dep-montant { font-size: 12px; font-weight: 600; color: var(--muted-foreground); }
.env__dep-empty { padding: 16px; font-size: 13px; color: var(--muted-foreground); text-align: center; }

/* ── Mobile responsive ───────────────────────────────────── */
@media (max-width: 768px) {
  /* Drawer plein écran */
  .sum__drawer {
    width: 100vw;
    max-width: 100vw;
    border-left: none;
  }

  /* Schema flux : pile verticale */
  .flo__grid {
    grid-template-columns: 1fr;
  }
  .flo__source {
    border-right: none;
    border-bottom: 2px solid #e4e4e7;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
  }
  .flo__source-hr { display: none; }
  .flo__source-name { font-size: 12px; }
  .flo__source-income { font-size: 18px; }
  .flo__source-shield { margin-top: 0; }

  .flo__wire { display: none; }

  .flo__card { border-radius: 8px; }

  /* Banner */
  .env__banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .env__banner-cta { width: 100%; justify-content: center; }

  /* Grid providers 2x2 → 1 colonne */
  .sum__providers-grid { grid-template-columns: 1fr; }

  /* Stat row */
  .sum__stat-row { flex-direction: column; gap: 12px; }
  .sum__stat-sep { display: none; }

  /* Env header */
  .env__header { flex-wrap: wrap; gap: 10px; margin-top: 18px; }

  /* Add/edit modal full screen */
  .env__modal {
    width: 100vw;
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
  }
}
</style>
