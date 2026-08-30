---
title: Comment fonctionne le plugin
description: Les dix idées qui sous-tendent Reparto Docente — postes indivisibles, cibles exactes, deux équilibres indépendants, révisions immuables et rien qui ne soit jamais supprimé.
sidebar:
  label: Comment ça marche
  order: 2
---

Reparto Docente ne contient qu'une dizaine d'idées. Une fois que vous les connaissez, chaque
écran et chaque refus prennent leur sens. Rien sur cette page n'est facultatif : ces règles
sont imposées par le serveur, pas simplement suggérées par l'interface.

**Sur cette page :** [trois étapes](#1-trois-étapes-dans-un-ordre-fixe) ·
[dotation](#2-la-direction-vous-donne-un-nombre-et-peut-le-changer) ·
[la matrice](#3-la-matrice-classe-matière-contient-les-vrais-chiffres) ·
[activités](#4-lactivité-denseignement-est-lunité-de-planification) ·
[deux équilibres](#5-il-y-a-deux-totaux-dheures-et-les-deux-sont-justes) ·
[postes indivisibles](#6-les-postes-sont-indivisibles) ·
[cibles exactes](#7-chaque-enseignant-doit-atteindre-exactement-sa-cible) ·
[faisabilité](#8-la-faisabilité-est-une-troisième-vérification) ·
[rien nest supprimé](#9-rien-nest-jamais-supprimé) ·
[le serveur décide](#10-cest-le-serveur-qui-décide-pas-lécran)

---

## 1. Trois étapes, dans un ordre fixe

**Configuration → Planification → Affectation.**

On ne peut pas générer de postes avant que le plan ne soit équilibré et verrouillé, et on ne
peut pas affecter un poste avant qu'il n'ait été généré. Si un écran vous indique qu'une
étape n'est pas encore disponible, c'est que l'étape précédente n'est pas terminée, pas que
quelque chose est cassé.

Le menu de gauche est groupé selon ces trois étapes : le menu lui-même est donc l'ordre de
travail.

## 2. La direction vous donne un nombre, et peut le changer

La direction de l'établissement indique au département combien d'**heures de classe
hebdomadaires** lui sont attribuées — 120 dans l'exemple de ce guide. Ce nombre s'enregistre
sur la page **Dotation de la direction**.

Ce chiffre n'est jamais écrasé. À chaque changement, vous enregistrez une **nouvelle
révision**, avec un motif écrit, et l'ancienne est conservée définitivement en historique.
Une seule révision est « courante » à la fois.

![La page de dotation de la direction, avec sa révision courante et son historique](../../../../../assets/reparto/fr/allocation.png)

Si la direction modifie le nombre *après* votre planification, le plan est marqué
**obsolète** et les nouvelles affectations sont bloquées jusqu'à une réconciliation
explicite — voir
[Étape 2](/fr/docs/reparto/stage-2-planning/#quand-la-dotation-change).

## 3. La matrice classe-matière contient les vrais chiffres

Trois listes sont saisies à l'étape 1 :

- **Classes** — les groupes d'élèves : *1° ESO A*, *2° BAC B*, etc.
- **Matières** — ce qui est enseigné : *Matemáticas*, *Tutoría*, *Docencia compartida*…
  Chaque matière porte des heures par défaut *suggérées*.
- **La matrice classe-matière** — une cellule par couple (classe, matière) réellement
  existant. C'est là que vivent les valeurs de planification **réelles**.

Les valeurs par défaut de la matière ne font qu'*amorcer* une nouvelle cellule. Modifier une
valeur par défaut plus tard ne réécrit jamais une cellule déjà créée. C'est délibéré : vos
décisions classe par classe ne sont pas silencieusement écrasées par un changement de
modèle.

:::note[Vide n'est pas zéro]
Dans un champ d'heures, laisser la case **vide** signifie *« utiliser la valeur par défaut de
la matière »*. Saisir **0** signifie *« réellement zéro heure »*. Ce sont deux choses
différentes et l'application ne les confond jamais. Pour qu'une cellule suive sa matière,
videz la case plutôt que d'y saisir 0.
:::

## 4. L'activité d'enseignement est l'unité de planification

Une **activité d'enseignement** est un élément concret d'enseignement. Elle porte :

| Champ | Signification |
| --- | --- |
| **Heures groupe par classe** | Combien d'heures hebdomadaires *la classe* reçoit. |
| **Heures enseignant par poste** | Combien d'heures hebdomadaires *un enseignant* y consacre. |
| **Postes enseignants** | Combien d'enseignants sont nécessaires en même temps. |
| **Classes liées** | À quelles classes elle s'applique (une, plusieurs ou aucune). |

Les activités viennent de deux sources :

- Les **activités principales** sont générées pour vous, une par cellule active de matière
  principale de la matrice. On appelle cela la *matérialisation*, et elle ne crée que celles
  qui manquent.
- Les **activités secondaires** — tutorat, co-intervention, tâches de département — sont
  ajoutées à la main, parce qu'elles constituent la part discrétionnaire du plan.

## 5. Il y a deux totaux d'heures, et les deux sont justes

C'est la seule idée qui surprend tout le monde ; elle a donc sa propre page :
[Heures, équilibres et faisabilité](/fr/docs/reparto/hours-and-balances/).

En résumé :

```text
Heures de classe    = ce que reçoivent les classes  → doit égaler la dotation de la direction
Heures enseignant   = ce que travaillent les enseignants → doit égaler la somme des cibles
```

Ce **ne sont pas** le même nombre et ils ne doivent **jamais** être additionnés. Dans
l'exemple, le plan représente 120 heures de classe et 124 heures enseignant, et les deux
chiffres sont justes en même temps.

![L'en-tête d'équilibre de planification : 120,00 heures de classe et 124,00 heures enseignant, avec un écart de 0,00 pour les deux](../../../../../assets/reparto/fr/planning-balance.png)

## 6. Les postes sont indivisibles

Au verrouillage du plan, l'application génère un **créneau de besoin** — ce guide l'appelle
un *poste* — pour chaque enseignant dont une activité a besoin.

Un poste de 4 heures va à **un** enseignant, en entier. Il ne peut pas être coupé en 3 + 1.
Il ne peut pas être partagé. Un enseignant à qui il ne reste que 3 heures ne peut pas le
prendre. Le tableau d'affectation ne comporte aucune case d'heures, précisément parce qu'il
n'y a rien à saisir : les heures viennent du poste.

Une activité qui demande deux enseignants de 2 heures chacun produit **deux** postes de 2
heures, et ils doivent aller à des enseignants **différents**.

## 7. Chaque enseignant doit atteindre exactement sa cible

Chaque enseignant participant a :

```text
cible = heures de base hebdomadaires + heures supplémentaires autorisées
```

Avant que le processus puisse être clos, chaque participant actif doit atteindre cette cible
**exactement**. Ni en dessous, ni au-dessus. Il n'existe nulle part dans l'application de
moyen de passer outre.

Si un enseignant doit réellement travailler davantage, le chef de département lui
**autorise** d'abord des **heures supplémentaires** : une action distincte, exigeant un motif
écrit et tracée dans l'audit, qui relève la cible. Retirer une autorisation, c'est la même
action avec la valeur 0.

Les enseignants portant des heures supplémentaires autorisées sont signalés comme
**surcharge autorisée** partout où ils apparaissent.

## 8. La faisabilité est une troisième vérification

Que les deux totaux concordent est nécessaire mais pas suffisant. Il est tout à fait possible
que les heures de classe et les heures enseignant s'équilibrent et qu'il n'existe malgré tout
*aucun moyen* de distribuer les postes indivisibles de sorte que chacun tombe exactement sur
sa cible.

L'application effectue donc une troisième vérification, la **faisabilité du reparto**, et
l'affiche à côté des deux équilibres. Les trois doivent être au vert avant de pouvoir
verrouiller le plan :

![Les trois invariants : heures de classe équilibrées, charge enseignante équilibrée, faisabilité du reparto réalisable](../../../../../assets/reparto/fr/dashboard-invariants.png)

La faisabilité n'est *pas* un état du plan : c'est une réponse à part entière, et elle
revient à **Non évaluée** dès qu'un élément pertinent change. C'est normal — relancez
l'évaluation depuis la page de planification.

## 9. Rien n'est jamais supprimé

Reparto Docente est un registre de décisions ; il ne supprime donc presque rien :

| Au lieu de supprimer… | …l'application fait ceci |
| --- | --- |
| Une activité d'enseignement | La **retire** : elle cesse de compter, mais reste visible avec sa date de retrait. |
| Une cellule de la matrice | La **retire**, de la même façon. |
| Une affectation | **Annuler** : libère le poste et rouvre le tour de l'enseignant. Exige un motif écrit. |
| Déplacer un poste vers quelqu'un d'autre | **Réaffecter** : une seule opération atomique, pas une suppression suivie d'une création. Exige un motif écrit. |
| Un chiffre de dotation | Une **nouvelle révision** le remplace ; l'ancien est conservé. |

Les affectations annulées restent au tableau à titre d'historique, sans boutons d'action.

## 10. C'est le serveur qui décide, pas l'écran

Chaque vérification de permission dans l'interface est une affirmation sur **ce qu'il faut
vous montrer**. Le service Reparto revérifie la même chose à chaque requête, et c'est lui qui
tranche. Deux conséquences visibles :

- **Tout échoue en mode fermé.** Quand l'application ne connaît pas encore votre rôle, ou ne
  peut pas joindre le serveur, elle refuse au lieu de supposer que vous avez le droit.
- **Les boutons disparaissent, ils ne sont pas grisés.** Si votre compte n'a pas du tout le
  droit de faire quelque chose, le contrôle n'est généralement pas affiché. Si un contrôle
  *est* présent mais désactivé, la raison figure à côté.

---

**Précédent :** [← Présentation du guide](/fr/docs/reparto/) ·
**Suivant :** [Premiers pas →](/fr/docs/reparto/getting-started/)
