---
title: Limites et notes d'exploitation
description: Les frontières produit délibérées et les contraintes d'exploitation qui subsistent après la correction de la séance, de l'authentification et de la compilation de production.
sidebar:
  label: Limites et exploitation
  order: 11
---

Le code actuel ne comporte aucun blocage connu du parcours Reparto décrit ici. Les anciens
écarts de séance en direct, rattachement de compte, double rafraîchissement, route racine et
scripts CSP ont été corrigés avant la paire de versions `2.0.0`. Cette page décrit désormais
les frontières intentionnelles et les comportements qu'un administrateur doit prévoir.

**Sur cette page :** [écarts clos](#écarts-clos) · [intervention attendue](#intervention-attendue) ·
[limites délibérées](#limites-délibérées) · [limites opérationnelles](#limites-opérationnelles) ·
[premier démarrage](#premier-démarrage-et-révisions-de-schéma)

---

## Écarts clos

Les affirmations suivantes ne sont plus des limites :

- un Administrateur ouvre et ferme une séance et exécute les cinq actions de tour ;
- un enseignant rattache sa fiche avec un code à usage unique, prend un poste et passe son tour ;
- les contrôles restent fermés sans séance et affichent la raison ;
- les modifications propres à la réunion n'invalident pas la faisabilité ;
- l'écran partagé compte les participants équilibrés, en attente et en surcharge ;
- l'initialisation de l'authentification et les reprises API partagent un seul rafraîchissement ;
- la sortie statique contient la redirection racine et les hachages CSP de tous les scripts ;
- les messages de validation et de reprise nomment le participant concerné.

## Intervention attendue

### Une affectation peut demander de réévaluer la faisabilité

Le témoin déterministe peut parfois ne pas être réparable localement. Le service bloque
alors le prochain choix et demande explicitement de lancer l'évaluation administrative,
puis de réessayer. Ce n'est ni une perte de données ni une séance cassée : ouvrez
**Planification**, relancez la faisabilité et continuez. Le service refuse de deviner quand
il ne peut plus prouver que les postes indivisibles restants s'ajustent exactement.

## Limites délibérées

### Aucune qualification ni règle d'éligibilité

Tout participant actif peut prendre tout poste si les heures, l'unicité, le cycle de vie et
le tour le permettent. Diplômes, niveaux, bilinguisme et préférences ne sont pas modélisés.

### Aucun optimiseur automatique

L'application valide et prouve la faisabilité ; elle ne construit pas automatiquement le
plan préféré du département. Les activités secondaires et les choix finaux restent humains.

### Les postes générés sont indivisibles et non éditables à la main

Un besoin va intégralement à un enseignant. Il n'existe ni affectation partielle ou partagée,
ni éditeur manuel, ni dépassement forcé. Les changements passent par la génération ou la
réconciliation. Les heures supplémentaires sont une modification séparée, motivée et auditée.

### Le serveur possède le cycle de vie et l'historique

Il n'existe pas de sélecteur d'état arbitraire. Les actions documentées font avancer le
processus. **Final** peut être rouvert avec un motif ; **Archivé** est terminal. Les éléments
sont retirés, annulés, réaffectés ou remplacés, pas effacés de l'historique.

### Nommer le chef utilise l'annuaire de comptes protégé

Le champ **Chef de département** est descriptif et n'accorde aucun droit. Chercher un autre
compte exige Super administrateur ; un Administrateur peut donc normalement vider ce champ,
mais pas y choisir un collègue. Reparto n'élargit pas la politique du service d'identité.

### Le vidéoprojecteur utilise une session existante

Il n'existe pas d'habilitation dédiée. Un Administrateur voit tous les processus ; un
Lecteur ou Rédacteur les voit par sa participation. Un compte de projection non participant
n'a donc aucun processus. La réponse projetée reste agrégée, sans nom ni heures individuelles.

### Les anciennes bases de développement sont réinitialisées

Aucune couche ne migre une base de développement de l'ancien modèle à deux étapes vers le
domaine à trois étapes. Ces anciennes données de développement sont réinitialisées.

## Limites opérationnelles

Le problème d'affectation indivisible est difficile, donc le solveur est borné :

- **Inconnu** signifie que la limite d'effort a été atteinte sans preuve et bloque comme
  **Irréalisable** jusqu'à obtention d'un résultat réalisable ;
- la cible validée est d'environ **30 participants et 100 postes actifs** ;
- le solveur complet ne tourne que sur les parcours administratifs ; les choix enseignants
  utilisent des contrôles peu coûteux et le témoin conservé.

## Premier démarrage et révisions de schéma

Le service ne livre pas une révision Alembic écrite à la main et déconnectée des modèles. Au
premier démarrage Compose, il vérifie la dérive, génère la révision nécessaire puis met la
base à niveau. Un déploiement doit terminer ce premier démarrage avant d'être prêt.

Une installation neuve peut donc être plus longue. Sauvegardez les données persistantes,
inspectez la migration générée et attendez le contrôle de santé Reparto avant d'ouvrir l'UI.

---

**Précédent :** [← Versions, exports et audit](/fr/docs/reparto/versions-exports-audit/) ·
**Suivant :** [Dépannage →](/fr/docs/reparto/troubleshooting/)
