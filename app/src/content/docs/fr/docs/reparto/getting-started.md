---
title: Premiers pas
description: Se connecter, trouver le menu Reparto, choisir un processus et ouvrir la liste de contrôle qui indique ce qui manque encore.
sidebar:
  label: Premiers pas
  order: 3
---

Cette page vous mène d'un navigateur vide à un écran opérationnel. Elle suppose que
quelqu'un a déjà installé et activé le plugin Reparto sur ce site — voir
[Savoir si Reparto Docente est activé ici](/fr/docs/reparto/#savoir-si-reparto-docente-est-activé-ici)

**Sur cette page :** [se connecter](#1-se-connecter) · [le menu](#2-trouver-le-menu) ·
[choisir un processus](#3-choisir-un-processus) ·
[la liste de contrôle](#4-lire-la-liste-de-contrôle) ·
[par quoi commencer](#5-par-quoi-commencer)

:::tip[Deux boutons en haut de chaque page]
**?** répond à *qu'est-ce que cette page et comment l'utiliser*. **Liste de configuration**
répond à *où en suis-je dans l'ensemble du parcours*. Aucun des deux ne recouvre la page
sur laquelle vous êtes.
:::

---

## 1. Se connecter

Utilisez le lien de compte au bas du menu de gauche, ou allez directement à la page de
connexion du site. Reparto Docente n'a pas de connexion propre : il utilise le même compte
que le reste du site.

Ce que votre compte peut faire dépend de son **rôle**. En bref :

- **Administrateur** ou **Super administrateur** — vous êtes ici le *chef de département*.
  Vous pouvez faire tout ce que décrit ce guide.
- **Rédacteur** — vous pouvez agir sur vos propres enregistrements : votre fiche
  d'enseignant, vos propres choix de poste, votre propre tour.
- **Lecteur** — vous pouvez tout consulter et ne rien modifier.
- **Utilisateur** — cette application ne vous est pas accessible du tout.

Le tableau complet se trouve sur [Qui peut faire quoi](/fr/docs/reparto/roles/).

## 2. Trouver le menu

Quand le plugin est activé, une entrée **Repartition docente** apparaît dans le menu de
gauche. Ouvrez-la et vous y trouverez les trois étapes :

```text
Repartition docente
├── Étape 1 · Configuration
│     Tableau de bord · Processus · Établissements · Années scolaires · Départements
│     Niveaux scolaires · Liste du personnel enseignant · Dotation de la direction
│     Participants au processus · Matières · Classes
│     Matrice groupe-matière · Paramètres du processus
├── Étape 2 · Planification
│     Planification · Besoins horaires · Exports de planification
└── Étape 3 · Affectation
      Affectations · Séance · Mon espace · Écran partagé
      Versions · Exports · Audit
```

Ce menu **est** l'ordre de travail. Le parcourir de haut en bas est une manière valable de
configurer un département en partant de zéro.

**Tableau de bord** et **Processus** ouvrent l'étape 1 parce que rien d'autre ne s'ouvre
avant qu'un processus soit sélectionné — mais ce ne sont pas des étapes à accomplir. Ils
rendent compte du travail au lieu de le faire, et c'est pourquoi leur panneau **?** indique
**Vue d'ensemble** plutôt que *Étape 1*.

:::tip
Chaque page Reparto comporte aussi des liens **Précédent** et **Suivant** en bas, dans le
même ordre. Vous pouvez parcourir toute l'application avec eux seuls.
:::

## 3. Choisir un processus

Presque tout dans Reparto Docente appartient à un **processus d'affectation** : un
département, dans un établissement, pour une année scolaire. Le processus est le conteneur
du travail de toute une année.

La plupart des pages portent en haut une barre **Processus courant**. Si aucun processus
n'est encore sélectionné, la page affiche **Aucun processus sélectionné** à la place de son
contenu, avec une simple liste déroulante des processus existants. Choisissez-en un et la
page se remplit. Votre choix est mémorisé sur ce navigateur ; vous ne le ferez donc qu'une
fois.

![La liste des processus d'affectation existants](../../../../../assets/reparto/fr/processes.png)

Cet écran ne fait que *choisir*. Si aucun processus n'existe encore, suivez son lien
**Créer un processus d'affectation** — ou allez directement à la page **Processus**, qui est
l'endroit où l'on crée les processus. Appuyez-y sur **Créer** puis choisissez l'année
scolaire, l'établissement et le département. Les trois doivent exister d'abord, et chaque
liste déroulante propose une option **Créer**, vous pouvez donc tout faire depuis ce seul
écran.

:::note[Pourquoi la création n'est pas sur le tableau de bord]
Un tableau de bord rend compte d'un processus, et il ne peut rien dire d'un processus qui
n'existe pas. Il s'ouvrait auparavant sur le formulaire de création : la première chose que
vous rencontriez sur un navigateur neuf était donc un formulaire, et non la page demandée.
La création se trouve désormais sur **Processus** uniquement.
:::

:::note[Le sélecteur ne vous demande jamais d'identifiant]
On choisit un processus par année, établissement et département, jamais par un code long.
Les messages de validation composés par le serveur nomment également le participant concerné.
:::

## 4. Lire la liste de contrôle

**Configurez votre reparto** est une liste de quinze étapes, groupées selon les trois
grandes étapes, qui vous dit à l'instant ce qui est fait et ce qui manque. On y accède de
deux façons.

**Depuis n'importe quelle page.** Chaque page Reparto porte en haut un bouton **Liste de
configuration**, à côté du bouton **?**. Appuyez dessus et la liste s'ouvre par-dessus la
page ; fermez-la et vous êtes revenu où vous étiez. La page que vous êtes venu voir n'est
jamais enfouie dessous.

**Sur le tableau de bord.** Le **Tableau de bord** présente la même liste en entier, parce
que rendre compte de l'état du processus est précisément sa raison d'être. Il s'ouvre sur
une barre de progression et un compte par étape — *Configuration 9/9, Planification 2/4,
Affectation 0/2* — puis **Suite**, qui nomme la seule étape à faire maintenant, puis les
quinze lignes complètes.

![La liste de contrôle du tableau de bord, montrant l'avancement dans les quinze étapes](../../../../../assets/reparto/fr/dashboard.png)

Chaque étape indique **Terminé**, **Ouvrir** ou **Non vérifié ici**. Cette dernière mention
n'est pas un échec : elle signifie que cet écran-là ne lit pas cette information — par
exemple, aucun processus n'a encore été sélectionné, donc les étapes de niveau processus ne
peuvent pas être vérifiées. Ces étapes sont comptées à part et jamais comptées comme
manquantes : *11 sur 15 terminées, 2 non vérifiées ici* ne dit pas la même chose que *11 sur
15 terminées*.

**Chaque nom d'étape est un lien** vers la page où cette étape se fait ; vous n'avez donc
jamais à la chercher dans le menu.

Les quinze étapes sont :

| # | Étape | Phase |
| --- | --- | --- |
| 1 | Créer un établissement | 1 |
| 2 | Créer une année scolaire | 1 |
| 3 | Créer un département | 1 |
| 4 | Créer un processus d'affectation | 1 |
| 5 | Enregistrer la dotation horaire de la direction | 1 |
| 6 | Ajouter les participants et leurs heures cibles | 1 |
| 7 | Ajouter les matières enseignées | 1 |
| 8 | Ajouter les classes | 1 |
| 9 | Remplir la matrice classe-matière | 1 |
| 10 | Vérifier la configuration et les paramètres de sélection | 1 |
| 11 | Créer le plan d'enseignement | 2 |
| 12 | Équilibrer les heures de classe et la charge enseignante | 2 |
| 13 | Verrouiller le plan d'enseignement | 2 |
| 14 | Générer les créneaux de besoin | 2 |
| 15 | Attribuer les postes en séance | 3 |

À côté de la liste, le tableau de bord affiche les deux équilibres, les trois invariants, combien
de postes restent libres et où en est chaque participant.

![Le panneau d'avancement de l'affectation : 37 créneaux actifs, 10 attribués, 27 disponibles](../../../../../assets/reparto/fr/dashboard-progress.png)

## 5. Par quoi commencer

Si vous partez de zéro, procédez dans cet ordre. Chaque lien mène aux instructions
détaillées.

1. **[Créer l'établissement, l'année scolaire et le département](/fr/docs/reparto/stage-1-configuration/#configuration-globale)** —
   ils sont partagés par tout le site, ils existent donc peut-être déjà.
2. **[Ajouter les niveaux scolaires](/fr/docs/reparto/stage-1-configuration/#niveaux-scolaires)** —
   *ESO*, *Bachillerato*… Également partagés, et également peut-être déjà créés.
3. **[Ajouter les enseignants à la liste](/fr/docs/reparto/stage-1-configuration/#liste-du-personnel-enseignant)**.
4. **[Créer le processus d'affectation](/fr/docs/reparto/stage-1-configuration/#le-processus-daffectation)**.
5. **[Enregistrer la dotation de la direction](/fr/docs/reparto/stage-1-configuration/#dotation-de-la-direction)**.
6. **[Ajouter les participants et leurs heures](/fr/docs/reparto/stage-1-configuration/#participants)**.
7. **[Ajouter les matières et les classes](/fr/docs/reparto/stage-1-configuration/#matières)**.
8. **[Remplir la matrice classe-matière](/fr/docs/reparto/stage-1-configuration/#la-matrice-classe-matière)**.
9. **[Vérifier les paramètres du processus](/fr/docs/reparto/stage-1-configuration/#paramètres-du-processus)**.
10. Passez à l'**[Étape 2 — Planification](/fr/docs/reparto/stage-2-planning/)**.

:::tip[Vous ne pouvez rien casser en regardant]
Rien ne change dans Reparto Docente du seul fait d'ouvrir une page. Toute action qui modifie
quelque chose vous demande d'abord de confirmer, et celles qui comptent vous demandent en
plus un motif écrit.
:::

---

**Précédent :** [← Comment fonctionne le plugin](/fr/docs/reparto/how-it-works/) ·
**Suivant :** [Qui peut faire quoi →](/fr/docs/reparto/roles/)
