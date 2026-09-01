---
title: Dépannage
description: Les messages qu'affiche Reparto Docente, ce que chacun signifie réellement, et que faire.
sidebar:
  label: Dépannage
  order: 12
---

La plupart des refus de Reparto Docente sont l'application qui protège une règle, pas une panne.
Cette page traduit ceux que vous rencontrerez le plus souvent.

**Sur cette page :** [rien ne s'affiche](#rien-ne-saffiche) ·
[pages vides](#une-page-est-vide) ·
[impossible de verrouiller](#je-narrive-pas-à-verrouiller-le-plan) ·
[impossible d'affecter](#je-narrive-pas-à-attribuer-un-poste) ·
[changements de dotation](#jai-changé-la-dotation-et-tout-sest-arrêté) ·
[heures fausses](#les-heures-semblent-fausses) ·
[la séance](#les-contrôles-de-séance-sont-désactivés)

---

## Rien ne s'affiche

### Il n'y a pas d'entrée « Repartition docente » dans le menu

Le plugin n'est pas activé sur cette installation. Il est facultatif et n'apparaît que s'il a été
à la fois installé **et** relié à un service Reparto en fonctionnement. Rien de ce que vous ferez
dans l'interface n'y changera quoi que ce soit — adressez-vous à la personne qui administre le
site.

### Vous n'avez pas accès à cette page

Le rôle de votre compte est trop faible. Reparto Docente exige au moins **Lecteur** pour voir quoi
que ce soit ; un compte **Utilisateur** n'a ici aucune capacité. Voir
[Qui peut faire quoi](/fr/docs/reparto/roles/).

### La page reste sur « Vérification de votre accès… » (sans fin)

L'application n'a pas encore déterminé qui vous êtes. Elle n'affiche délibérément ni le contenu ni
un refus tant qu'elle ne le sait pas : « pas encore » n'est pas « pas le droit ». Si cela ne se
résout jamais, rechargez la page.

### J'ai été déconnecté en plein travail

Reconnectez-vous, puis vérifiez l'état de connexion. L'initialisation de l'authentification et
les reprises API partagent désormais un seul rafraîchissement coordonné. Si la déconnexion se
répète, vérifiez la santé du service de comptes et l'erreur réseau du navigateur.

## Une page est vide

### Sélectionnez d'abord un processus

Aucun processus n'est choisi. Utilisez la barre **Processus courant** en haut de la page, ou la
page Processus. Votre choix est mémorisé sur ce navigateur.

### La page de dotation n'affiche aucune dotation courante

C'est normal pour un nouveau processus : aucune dotation n'a encore été enregistrée. C'est un état
vide, pas une erreur.
[Enregistrez la première révision](/fr/docs/reparto/stage-1-configuration/#dotation-de-la-direction).

### Tous les écrans de l'étape 2 sont vides

Le plan d'enseignement n'a pas encore été créé. Un processus possède au plus un plan et il n'est
pas créé automatiquement.
[Créez-le depuis la page de Planification](/fr/docs/reparto/stage-2-planning/#0-créer-le-plan-denseignement).

### Le panneau de matérialisation ne liste rien

Il n'y a aucune cellule active de matière principale dans la matrice. L'étape 2 n'a aucune entrée
tant qu'au moins une cellule n'existe pas.
[Remplissez la matrice](/fr/docs/reparto/stage-1-configuration/#la-matrice-classe-matière).

### La liste de contrôle indique « Non vérifié ici »

Cette étape ne peut pas être évaluée depuis cet écran, généralement parce qu'aucun processus n'est
encore sélectionné. Ce n'est pas un échec.

## Je n'arrive pas à verrouiller le plan

Le verrouillage exige **quatre** choses à la fois. Vérifiez-les dans cet ordre :

1. **L'écart des heures de classe vaut `0.00`.** Sinon, ajustez les activités ou vérifiez la
   dotation.
2. **L'écart des heures enseignant vaut `0.00`.** Sinon, ajustez les activités secondaires, le
   nombre de postes enseignants ou les cibles des participants.
3. **La faisabilité indique Réalisable.** Si elle indique *Non évaluée*, lancez l'évaluation. Si
   elle indique *Irréalisable*, lisez le panneau de diagnostic. Si elle indique *Inconnue*, la
   vérification a épuisé son effort : simplifiez le plan ou réessayez.
4. **Aucun constat bloquant comptant contre le verrouillage.**

:::note[`plan.requirements_not_generated` n'est pas un problème]
Ce constat est présent sur tout plan qui n'a pas encore généré ses postes — c'est-à-dire tout plan
que vous vous apprêtez à verrouiller. Il n'empêche pas le verrouillage.
:::

### Le service ne déverrouille qu'un plan verrouillé avant génération

Vous essayez de déverrouiller un plan qui a déjà généré ses postes. Le déverrouillage n'existe que
pour un plan verrouillé et non encore généré. Utilisez la **régénération** ou le flux de
**réconciliation** — le panneau vous indique lequel.

## Je n'arrive pas à attribuer un poste

### Un participant apparaît avec une raison au lieu d'être sélectionnable

C'est justement le principe : l'application vous dit *pourquoi* au lieu de masquer l'option.

| Raison | Que faire |
| --- | --- |
| Le participant est inactif | Réactivez-le, ou choisissez quelqu'un d'autre. |
| Il détient déjà un autre poste de la même activité | Deux postes d'une activité doivent aller à des enseignants différents. Choisissez quelqu'un d'autre. |
| Cela le ferait dépasser ses heures restantes | Le poste est plus grand que ses heures restantes. Les postes ne se coupent pas : soit vous choisissez un autre participant, soit vous lui autorisez d'abord des heures supplémentaires. |

### La sélection est bloquée car le témoin déterministe n'a pas pu être réparé

Le message complet ressemble à ceci :

> *La sélection est bloquée car le témoin déterministe n'a pas pu être réparé
> (local_repair_not_found) ; une évaluation administrative de faisabilité est requise.*

**Ce que cela signifie :** l'application conserve une combinaison déjà résolue prouvant que les
postes restants peuvent encore être distribués exactement. Vos dernières affectations ont
suffisamment déplacé les choses pour qu'elle ne puisse plus ajuster cette combinaison à la volée,
et elle ne poursuivra pas sur une combinaison qu'elle ne peut plus prouver.

**Que faire :** allez sur la page de Planification, relancez l'évaluation de faisabilité, puis
revenez au tableau. Rien n'est cassé et rien n'est perdu.

### Un créneau ne peut pas être coupé, autorisez d'abord des heures supplémentaires

Le message complet donne les chiffres :

> *Le besoin … nécessite 8,00 heures mais il ne reste au participant que 5,00 avant la cible de
> 21,00 ; un créneau ne peut pas être coupé, autorisez donc d'abord des heures supplémentaires.*

Les postes sont indivisibles. Soit vous confiez ce poste à quelqu'un à qui il reste exactement les
heures nécessaires, soit vous relevez la cible de ce participant en lui autorisant des heures
supplémentaires — une action distincte qui exige un motif écrit.

### Tout le tableau refuse les nouvelles affectations

Le plan est **obsolète** ou requiert une **réconciliation**, généralement parce que la dotation de
la direction a changé. Voir la section suivante.

## J'ai changé la dotation et tout s'est arrêté

C'est le comportement prévu. Enregistrer une nouvelle révision de dotation marque le plan obsolète
et bloque les nouvelles opérations d'affectation jusqu'à une réconciliation explicite.

Rien n'a été supprimé : toutes les activités, tous les postes et toutes les affectations sont
toujours là. Allez sur **Planification → Changements de dotation et réconciliation**,
prévisualisez la réconciliation, résolvez à la main chaque poste attribué concerné, et appliquez
avec un motif et le nombre exact de conflits de l'aperçu.

Instructions complètes :
[Étape 2 — quand la dotation change](/fr/docs/reparto/stage-2-planning/#quand-la-dotation-change).

### L'application a été refusée et mon aperçu a disparu

Quelque chose a changé entre l'aperçu et l'application ; l'aperçu était donc périmé et a été
abandonné plutôt que validé. **Prévisualisez à nouveau.** N'appuyez pas une seconde fois sur
appliquer — cela vaut aussi pour l'éditeur en lot de la matrice et pour la génération des besoins.

## Les heures semblent fausses

### Les deux totaux ne concordent pas entre eux

Ils ne sont pas censés concorder. Les **heures de classe** sont ce que reçoivent les classes ; les
**heures enseignant** sont ce que travaillent les enseignants. 120 et 124 sont justes en même
temps. Lisez
[Heures, équilibres et faisabilité](/fr/docs/reparto/hours-and-balances/).

### Une cellule indique « Hérité » au lieu d'un nombre

La cellule utilise la valeur par défaut de sa matière. C'est ce que signifie un champ d'heures
vide. Si vous voulez une valeur explicite, saisissez-la ; si vous voulez un vrai zéro, saisissez
`0`, ce qui n'est **pas** la même chose que laisser vide.

### J'ai saisi trois décimales et cela a été refusé

Les heures acceptent deux décimales au plus. L'application refuse une troisième plutôt que de
l'arrondir, car modifier en silence un nombre que vous avez saisi serait pire.

### La faisabilité indique de nouveau « Non évaluée »

Un champ utile au solveur, une activité ou la matrice a changé. La faisabilité se réinitialise
plutôt que d'afficher une réponse périmée. Relancez l'évaluation. L'ordre de sélection et les
métadonnées propres à la réunion ne la réinitialisent plus.

## Les contrôles de séance sont désactivés

Lisez la raison affichée à côté. Le cas habituel est **Aucune séance de réunion ouverte** :
ouvrez-en une depuis le panneau **Séance de réunion**. La préparation du plan, son état ou la
propriété du tour peuvent aussi fermer un contrôle. Les cinq actions sont reliées ; un refus
serveur apparaît à côté au lieu d'être silencieux.

## Toujours bloqué ?

- Consultez la page **Audit** : elle enregistre ce qui s'est réellement passé, dans l'ordre, avec
  l'auteur de chaque action.
- Regardez l'état de connexion de la page : *Mises à jour en direct déconnectées* signifie que ce
  que vous voyez peut être périmé. Rechargez.
- Relisez [Comment fonctionne le plugin](/fr/docs/reparto/how-it-works/). Presque toutes les
  surprises viennent de l'une de ces dix règles.

---

**Précédent :** [← Limites et notes d'exploitation](/fr/docs/reparto/limitations/) ·
**Suivant :** [Référence →](/fr/docs/reparto/reference/)
