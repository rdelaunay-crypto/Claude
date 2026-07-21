# Tutos Numériques Hôpital — Prototype

Prototype de plateforme intranet permettant de partager des capsules vidéo
tutorielles pour aider l'ensemble des professionnels de l'hôpital à
maîtriser les outils numériques métiers de leur écosystème.

## Ce que contient ce prototype

- **Catalogue** de 200 outils numériques, organisés en 20 familles
  (Dossier Patient Informatisé, Pharmacie, Imagerie, Biologie, Bloc
  opératoire, Urgences, RH, Finances, Qualité, Bureautique, Sécurité,
  Biomédical, Recherche clinique, PMSI, Formation…), avec recherche et
  filtres (catégorie, "avec tutoriel disponible").
- **Lecteur vidéo** avec suivi de progression par utilisateur (position de
  lecture, marquage "vu"/"à voir" automatique et manuel).
- **Espace contributeur** : les référents métiers peuvent publier un
  tutoriel (URL vidéo, ou import de fichier pour aperçu) sans passer par
  l'IT, et gérer leurs propres publications.
- **Comptes et rôles** simulés : Lecteur / Contributeur / Administrateur.
- **Administration** : gestion des rôles utilisateurs, statistiques de
  couverture par catégorie et tutoriels les plus vus.

## Pourquoi un prototype statique

Ce premier jet est **100 % front-end** (HTML/CSS/JS, aucune dépendance
externe, aucun build) afin de valider rapidement l'ergonomie, l'arborescence
du catalogue et les parcours utilisateurs avant d'investir dans un
développement back-end complet. Il fonctionne hors-ligne sur un simple
navigateur, ce qui facilite les démonstrations sur le réseau intranet.

L'état (utilisateurs, tutoriels, progression) est stocké dans le
`localStorage` du navigateur : il persiste entre les visites sur un même
poste, mais n'est pas partagé entre utilisateurs ou appareils.

## Lancer le prototype

Aucune installation n'est nécessaire :

```bash
# Depuis la racine du projet
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

(Ouvrir directement `index.html` dans un navigateur fonctionne aussi dans
la plupart des cas.)

À la connexion, choisissez un compte de démonstration :

| Compte | Rôle | Service |
|---|---|---|
| Camille Laurent | Administrateur | DSI |
| Marc Dubois | Contributeur | Cardiologie |
| Sophie Nguyen | Contributeur | Pharmacie |
| Julie Bernard | Lecteur | Urgences |
| Ahmed El Fassi | Lecteur | Direction des soins |

## Limites connues (prototype)

- Pas d'authentification réelle : à remplacer par le SSO/LDAP de l'hôpital.
- Les fichiers vidéo importés via le formulaire "Contribuer" ne sont
  prévisualisables que pendant la session de navigation en cours (pas de
  serveur de stockage) — privilégier une URL vidéo pointant vers un
  serveur média pour une publication persistante.
- Les vidéos de démonstration pré-chargées sont des fichiers d'exemple
  publics, à remplacer par les tutoriels réels de l'établissement.
- Aucune donnée n'est partagée entre utilisateurs/postes (localStorage
  local au navigateur).

## Pistes pour une version de production

- Back-end (API + base de données) pour partager catalogue, tutoriels et
  progression entre tous les utilisateurs.
- Authentification via l'annuaire de l'hôpital (SSO/LDAP/Active Directory).
- Stockage vidéo sur un serveur média interne (avec transcodage, sous-titres,
  contrôle d'accès).
- Notifications (nouveaux tutoriels, mises à jour d'un outil).
- Export de statistiques d'usage pour le pilotage de la conduite du
  changement numérique.

## Structure du code

```
index.html          Page unique, structure de l'application
css/styles.css       Feuille de style (aucune dépendance externe)
js/data.js           Référentiel des 200 outils, comptes de démo, tutoriels d'exemple
js/store.js          Couche de persistance (localStorage)
js/app.js            Routage (hash) et rendu des vues
```
