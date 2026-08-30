---
title: Qui peut faire quoi
description: Les cinq rôles de compte dans Reparto Docente, ce que chacun peut voir et modifier, et pourquoi certains boutons sont absents plutôt que grisés.
sidebar:
  label: Qui peut faire quoi
  order: 4
---

Reparto Docente **n'ajoute aucun rôle qui lui soit propre**. Il lit le rôle que votre compte
possède déjà sur ce site et en déduit tout le reste.

**Sur cette page :** [les cinq rôles](#les-cinq-rôles) ·
[chef de département](#le-rôle-de-chef-de-département) ·
[enregistrements propres](#enregistrements-propres-ce-quun-rédacteur-peut-faire) ·
[boutons absents](#pourquoi-un-bouton-est-absent-plutôt-que-grisé) ·
[les trois niveaux de vue](#les-trois-niveaux-de-vue)

---

## Les cinq rôles

Les rôles forment une échelle : chacun accorde tout ce qu'accordent les rôles inférieurs.

```text
Utilisateur  <  Lecteur  <  Rédacteur  <  Administrateur  <  Super administrateur
```

| Rôle | Voir les pages | Modifier ses propres données | Piloter le département (planifier, affecter, configurer) | Configuration globale (établissements, années, niveaux) |
| --- | --- | --- | --- | --- |
| **Utilisateur** | ✗ | ✗ | ✗ | ✗ |
| **Lecteur** | ✓ presque toutes* | ✗ | ✗ | ✗ |
| **Rédacteur** | ✓ presque toutes* | ✓ les siennes uniquement | ✗ | ✗ |
| **Administrateur** | ✓ | ✓ | ✓ | ✓ |
| **Super administrateur** | ✓ | ✓ | ✓ | ✓ |

\* Huit pages — **Tableau de bord**, **Réunion**, **Participants**, **Affectations**,
**Planification**, **Audit**, **Versions** et **Exports** — exigent le rôle Administrateur
pour être *consultées*, car les données qui les alimentent nomment d'autres enseignants et
leurs heures. Voir [les trois niveaux de vue](#les-trois-niveaux-de-vue).

:::caution[Un compte « Utilisateur » n'obtient rien ici]
`Utilisateur` est un compte parfaitement valable sur ce site, mais il n'a **aucune** capacité
dans Reparto Docente — y compris en lecture. Toutes les pages le refuseront. Si un collègue
vous dit que les pages Reparto sont vides ou refusées pour lui, vérifiez d'abord son rôle.
:::

## Le rôle de chef de département

Chaque fois que ce guide dit *« le chef de département fait X »*, l'exigence est simplement :
**votre compte est Administrateur ou Super administrateur.** Il n'existe pas de type de
compte « chef de département » distinct, et il n'y en aura jamais.

Un département possède bien un champ **Chef de département**, mais il est *purement
descriptif* : il enregistre qui est nominalement responsable, pour la trace d'audit et pour
l'affichage. Il n'accorde aucune permission. Y désigner quelqu'un ne lui permet rien, et le
vider ne lui retire rien.

:::note
En raison de la façon dont le service de comptes protège son annuaire d'utilisateurs,
*renseigner* le champ de chef de département n'est en pratique possible que pour un super
administrateur. Un administrateur peut *vider* le champ mais généralement pas le renseigner.
C'est une limite du service de comptes, pas un défaut de Reparto Docente — et comme le champ
n'autorise rien, cela ne change rien à qui peut piloter le département.
:::

## Enregistrements propres : ce qu'un Rédacteur peut faire

Un **Rédacteur** ne peut créer, modifier ou supprimer que des données qui l'identifient comme
leur propriétaire :

- **sa propre fiche d'enseignant** — ses coordonnées et ses notes, jamais le lien entre la
  fiche et un compte ;
- **son propre choix de poste** pendant une séance : se lier lui-même, et lui seul, à un
  poste disponible ;
- **son propre tour** : le démarrer, le terminer ou le passer, dès lors qu'il lui appartient.

Tout le reste — participants, matières, classes, matrice, plan, affectations des autres — est
du travail de chef de département et exige Administrateur ou plus.

L'utilisation d'un **code de rattachement** est une exception étroite accessible à partir
de Lecteur : le code ne peut lier que la fiche qu'il désigne au compte actuellement
connecté. Il ne permet de choisir ni un autre compte ni une autre fiche. Émettre le code
reste une action Administrateur.

Notez que « Rédacteur » est un *seuil*, pas une attribution : il dit que ce niveau de compte
peut détenir un tel contrôle. Que *cet enregistrement précis* vous appartienne est vérifié
séparément, ligne par ligne.

## Pourquoi un bouton est absent plutôt que grisé

Reparto Docente distingue trois situations et affiche chacune différemment :

| Situation | Ce que vous voyez |
| --- | --- |
| **Vous n'avez pas du tout le droit** | Le contrôle n'est pas affiché. Rien à cliquer, rien de grisé. |
| **Vous avez le droit, mais pas maintenant** | Le contrôle est présent et désactivé, avec la raison indiquée à côté. |
| **Nous ne savons pas encore** | Ni le contenu ni un refus : un bref état d'attente. « Pas encore » n'est pas « pas le droit ». |

Ce dernier point compte : si l'application n'a pas fini de déterminer qui vous êtes, elle ne
devine pas. Elle attend, puis elle vous montre la page ou vous la refuse.

## Les trois niveaux de vue

L'étape 3 présente le même processus à trois publics différents, et c'est le *serveur* qui
décide ce que chacun a le droit de recevoir. Ce n'est pas un réglage d'affichage que vous
pourriez modifier.

| Niveau | Qui | Ce qu'il reçoit |
| --- | --- | --- |
| **Chef de département** | Administrateur / Super administrateur | Tout : heures par enseignant, motifs, diagnostics, trace d'audit complète. |
| **Enseignant** | Un participant, sur **Mon espace** | Ses cinq chiffres, les postes encore libres, à qui est le tour, et un équilibre agrégé du plan qui ne nomme personne. Jamais les heures d'un autre enseignant, ni le motif écrit d'une autorisation d'heures supplémentaires. |
| **Écran partagé** | Le vidéoprojecteur de la salle | Uniquement des agrégats. Les données qu'il reçoit ne contiennent aucun nom de participant ni aucune heure par enseignant — l'écran projeté ne peut donc physiquement pas en afficher. |

Un enseignant qui demande le niveau chef de département est refusé. Demander *vers le bas* —
un chef consultant le niveau écran partagé — est autorisé.

:::note[Le niveau s'applique sur tous les chemins, pas seulement à l'écran]
Les niveaux ci-dessus sont appliqués là où les données sont servies, non là où elles sont
affichées. Le tableau de bord du processus et la liste des participants portent le niveau
chef de département — les heures des autres enseignants et le motif écrit des heures
supplémentaires — le serveur les refuse donc à quiconque en dessous d'Administrateur, et
huit pages héritent de ce seuil : **Tableau de bord**, **Réunion**, **Participants**,
**Affectations**, **Planification**, **Audit**, **Versions** et **Exports**. Un Lecteur ou
un Rédacteur qui en ouvre une est averti que la page exige le rôle Administrateur.

Rien de ce dont un enseignant a besoin n'a bougé : **Mon espace** sert ses cinq chiffres et
les postes libres, et l'écran partagé sert ses agrégats sans nom ; les deux sont
inchangés.
:::

---

**Précédent :** [← Premiers pas](/fr/docs/reparto/getting-started/) ·
**Suivant :** [Heures, équilibres et faisabilité →](/fr/docs/reparto/hours-and-balances/)
