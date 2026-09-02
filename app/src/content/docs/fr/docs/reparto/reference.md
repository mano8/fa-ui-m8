---
title: Référence
description: Toutes les pages de Reparto Docente avec le rôle qu'elles exigent, les états qu'un processus et un plan peuvent prendre, et un glossaire de tous les termes de l'application.
sidebar:
  label: Référence
  order: 13
---

Matériel de consultation. Rien ici n'est un tutoriel : pour cela, partez de la
[présentation du guide](/fr/docs/reparto/).

**Sur cette page :** [pages et permissions](#pages-et-permissions) ·
[états du processus](#états-du-processus) · [états du plan](#états-du-plan-denseignement) ·
[états du poste](#états-du-poste) ·
[réponses de faisabilité](#réponses-de-faisabilité) · [glossaire](#glossaire)

---

## Pages et permissions

Chaque page porte **deux** seuils. **Voir** est le rôle minimal qui peut l'ouvrir. **Modifier**
est le rôle minimal à partir duquel ses contrôles d'édition peuvent apparaître.

| Page | Adresse | Voir | Modifier |
| --- | --- | --- | --- |
| Tableau de bord | `/reparto` | **Administrateur** | Administrateur |
| Processus | `/reparto/processes` | Lecteur | Administrateur |
| Établissements | `/reparto/setup/schools` | Lecteur | Administrateur |
| Années scolaires | `/reparto/setup/academic-years` | Lecteur | Administrateur |
| Départements | `/reparto/setup/departments` | Lecteur | Administrateur |
| Niveaux scolaires | `/reparto/setup/classroom-stages` | Lecteur | Administrateur |
| Liste du personnel enseignant | `/reparto/setup/teacher-roster` | Lecteur | **Rédacteur** |
| Dotation de la direction | `/reparto/processes/{id}/allocation` | Lecteur | Administrateur |
| Participants au processus | `/reparto/processes/{id}/participants` | **Administrateur** | Administrateur |
| Matières | `/reparto/processes/{id}/subjects` | Lecteur | Administrateur |
| Classes | `/reparto/processes/{id}/teaching-groups` | Lecteur | Administrateur |
| Matrice classe-matière | `/reparto/processes/{id}/group-subjects` | Lecteur | Administrateur |
| Paramètres du processus | `/reparto/processes/{id}/settings` | Lecteur | Administrateur |
| Planification | `/reparto/processes/{id}/planning` | **Administrateur** | Administrateur |
| Besoins horaires | `/reparto/processes/{id}/requirements` | Lecteur | Administrateur |
| Affectations | `/reparto/processes/{id}/assignments` | **Administrateur** | Administrateur |
| Séance | `/reparto/meeting/{id}` | **Administrateur** | Administrateur |
| Mon espace | `/reparto/processes/{id}/my-view` | Lecteur | **Rédacteur** |
| Écran partagé | `/reparto/processes/{id}/shared` | Lecteur | Administrateur |
| Versions | `/reparto/processes/{id}/versions` | **Administrateur** | Administrateur |
| Exports | `/reparto/processes/{id}/exports` | **Administrateur** | Administrateur |
| Audit | `/reparto/processes/{id}/audit` | **Administrateur** | Administrateur |

Remarques :

- `{id}` est normalement le mot **`current`**, qui se résout au processus que vous avez choisi. Le
  processus se choisit par année, établissement et département, jamais en saisissant un code.
- Toutes les adresses sont préfixées par la langue du site, par exemple `/fr/reparto/…`.
- Huit pages exigent Administrateur dès la lecture : Tableau de bord, Séance, Participants,
  Affectations, Planification, Audit, Versions et Exports.
- Les deux seuils **Rédacteur** sont des seuils, pas des attributions. La liste du personnel
  applique en plus une vérification de propriété ligne par ligne : un Rédacteur modifie **sa
  propre** fiche et celle de personne d'autre, tandis que créer, lier et supprimer des fiches
  restent du ressort de l'Administrateur. *Mon espace* couvre la sélection propre et le tour propre
  de son utilisateur. Utiliser un code de rattachement est l'exception Lecteur étroite.
- L'administrateur du site peut renommer n'importe quelle adresse ou retirer une page entière ;
  votre installation peut donc différer.
- Toutes ces vérifications portent sur **ce qu'il faut vous montrer**. Le serveur revérifie à chaque
  requête et c'est lui qui tranche.

## États du processus

| État | Signification |
| --- | --- |
| **Brouillon** | En cours de configuration. |
| **Prêt pour la séance** | Configuration et planification terminées. |
| **Séance ouverte** | Une séance de sélection est en cours. |
| **Affectation en cours** | Les postes sont en cours de distribution. |
| **Proposition du département** | Le reparto proposé par le département. |
| **Envoyé à la direction** | Transmis à la direction. |
| **Retourné par la direction** | Renvoyé pour modifications. |
| **Révision interne** | En révision par le département. |
| **Final** | Clos. Tout changement est refusé jusqu'à réouverture. |
| **Rouvert** | Rouvert après avoir été final, avec un motif enregistré. |
| **Archivé** | Terminal. Ne peut pas être rouvert. |

Vous ne les fixez jamais à la main : il n'existe aucun contrôle d'état dans l'application.

## États du plan d'enseignement

| État | Signification |
| --- | --- |
| **Brouillon** | En construction. |
| **Déséquilibré** | Un des deux totaux, ou les deux, ne correspond pas à sa cible. |
| **Équilibré** | Les deux totaux correspondent exactement. |
| **Verrouillé** | Figé, prêt pour la génération. |
| **Besoins générés** | Les postes existent. |
| **Obsolète** | Quelque chose a bougé en dessous — généralement la dotation. |
| **Réconciliation requise** | Un changement de dotation touche des postes attribués et doit être résolu à la main. |

L'état du plan et la faisabilité sont **indépendants**. Un plan peut être *Équilibré* et
*Irréalisable* en même temps ; les deux répondent à des questions différentes.

## États du poste

| État | Signification |
| --- | --- |
| **Disponible** | Libre ; peut être attribué. |
| **Attribué** | Détenu par un participant, en entier. |
| **Obsolète** | Le plan a bougé en dessous. |
| **Réconciliation requise** | Explicitement touché par un changement de dotation. |

## Réponses de faisabilité

| Réponse | Bloque le verrouillage et l'affectation ? |
| --- | --- |
| **Réalisable** | Non. |
| **Irréalisable** | Oui. |
| **Inconnue** | Oui — traitée comme *non prouvée*. |
| **Non évaluée** | Oui — lancez l'évaluation. |

## Glossaire

**Activité d'enseignement** — un élément concret d'enseignement, avec ses heures groupe, ses heures
enseignant par poste, son nombre de postes et ses classes liées.

**Activité principale** — une activité créée pour vous à partir d'une cellule active de matière
principale de la matrice.

**Activité secondaire** — tutorat, co-intervention, soutien ou tâches de département, ajoutée à la
main.

**Affectation** — un participant détenant un poste complet. Annulée par **annuler**, déplacée par
**réaffecter**, jamais supprimée.

**Année scolaire** — une année scolaire libellée, appartenant à un établissement, avec une date de
début et de fin.

**Catégorie d'attribution** — si une matière est **Principale** (donnée de planification
obligatoire) ou **Secondaire** (facultative). Ce n'est pas un oui/non, et cela ne s'appelle jamais
« est principale ».

**Chef de département** — dans cette application, simplement un compte de rôle **Administrateur**
ou **Super administrateur**. Le champ `Chef de département` d'un département est descriptif et
n'accorde rien.

**Classe** — un groupe d'élèves, tel que *1° ESO A*.

**Faisabilité** — le fait que les postes indivisibles *puissent* être distribués de sorte que chaque
participant tombe exactement sur sa cible. Le troisième invariant.

**Génération** — l'acte numéroté de produire des postes à partir d'un plan verrouillé. Chaque
régénération reçoit un nouveau numéro.

**Hérité** — un champ d'heures laissé vide, signifiant « utiliser la valeur par défaut de la
matière ». Ce n'est pas la même chose qu'un `0` saisi.

**Heures cibles** — les `base + supplémentaires autorisées` d'un participant. Doivent être atteintes
exactement.

**Heures de classe** — les heures que reçoit une **classe**. Mesurées face à la dotation de la
direction.

**Heures enseignant** — les heures que travaille un **enseignant**. Mesurées face à la somme des
cibles des participants. Jamais additionnées aux heures de classe.

**Heures supplémentaires autorisées** — un ajout explicite, motivé et tracé à la cible d'un
participant. Ce n'est pas une tolérance appliquée après coup, et cela ne se saisit pas dans le
formulaire de participant.

**Liste du personnel enseignant** — la liste, commune à tout le site, du personnel enseignant,
distincte des comptes utilisateurs. Une fiche peut être liée à un compte.

**Matérialisation** — créer à partir de la matrice les activités principales manquantes. Idempotente
: l'exécuter deux fois ne crée rien de nouveau.

**Matrice classe-matière** — une cellule par couple (classe, matière), portant les valeurs de
planification **réelles**.

**Niveau scolaire** — un cycle d'enseignement (*Secundaria*/`ESO`, *Bachillerato*/`BAC`) avec sa
plage d'années. Partagé par tout le site.

**Obsolète** — un plan dont les données d'entrée ont bougé après son verrouillage ou sa génération.
Bloque les nouvelles affectations jusqu'à réconciliation.

**Participant** — un enseignant prenant part à un processus donné, avec des heures de base, des
heures supplémentaires autorisées et une cible.

**Plan d'enseignement** — l'unique plan que possède un processus. Créé explicitement ; il y en a au
plus un.

**Poste** (ou *créneau de besoin*) — un besoin enseignant indivisible généré à partir d'un plan
verrouillé. Pris en entier ou pas du tout.

**Postes enseignants** — combien d'enseignants une activité requiert en même temps. Deux postes
d'une activité doivent aller à deux enseignants différents.

**Processus d'affectation** — un département, dans un établissement, pour une année scolaire. Le
conteneur de tout.

**Réconciliation** — le flux explicite de résolution d'un changement de dotation touchant des postes
attribués. Jamais automatique, jamais destructif.

**Retirer** — la manière dont les activités et les cellules de la matrice quittent le plan. Elles
cessent de compter mais restent visibles, avec leur date de retrait. Il n'y a pas de suppression.

**Révision de dotation** — un enregistrement immuable des heures de classe hebdomadaires accordées
au département par la direction, avec un motif obligatoire. Une seule est courante ; les autres sont
l'historique.

**Surcharge autorisée** — la marque d'un participant portant des heures supplémentaires autorisées.

**Témoin** — la combinaison déjà résolue que l'application conserve comme preuve que les postes
restants peuvent encore être distribués exactement. Jamais montrée aux enseignants ni au
vidéoprojecteur.

**Type d'activité** — un libellé descriptif porté par une activité : *Ordinaire*, *Tutorat*,
*Co-intervention*, *Soutien*, *Niveau département*, *Autre*. **Ne change jamais le comportement.**

**Version** — un instantané immuable de tout le processus, enregistré à la demande.

---

**Précédent :** [← Dépannage](/fr/docs/reparto/troubleshooting/) ·
**Retour à :** [Présentation du guide](/fr/docs/reparto/)
