# Serveur — Console de supervision d'alertes

Le lien vers le dépôt GitHub : **https://github.com/rauf-mifteev/Ahuntsic_Web_API**

## Description

Ce projet est réalisé dans le cadre du cours de Développement d'application de supervision et monitorage au Collège Ahuntsic (420-317-AH). Il consiste à écrire un serveur **Node.js + Express** qui expose une API REST complète pour gérer des alertes de supervision de serveurs informatiques.

L'interface web est fournie et n'a pas été modifiée. Le travail porte entièrement sur le serveur. Le projet est construit en **6 étapes successives** cumulatives :

| Étape | Fonctionnalité | Concepts appliqués |
|---|---|---|
| **Étape 1** | **Squelette + routes GET** : Mise en place du serveur Express, données en mémoire, et routes `GET /api/alertes` et `GET /api/alertes/:id`. | Express, routeur, codes HTTP 200 / 400 / 404 |
| **Étape 2** | **Route POST** : Création d'une nouvelle alerte avec validation des champs obligatoires. Le serveur génère l'id, l'horodatage et initialise `resolue` à false. | Validation, `req.body`, code 201 |
| **Étape 3** | **Filtre par niveau** : Le paramètre de requête `?niveau=` filtre la liste des alertes retournées. | `req.query`, `Array.filter()` |
| **Étape 4** | **Route PATCH** : Marquer une alerte comme résolue (`resolue` passe à true). Gestion du cas "déjà résolue". | Modification en mémoire, référence d'objet |
| **Étape 5** | **Route DELETE** : Suppression définitive d'une alerte par son id. | `Array.findIndex()`, `Array.splice()` |
| **Étape 6** | **Polissage** : Middleware de journalisation, gestionnaire d'erreurs 500, README et .gitignore. | Middleware Express, événement `finish` |

## Prérequis

- Node.js (version 18 ou plus récente)
- npm

## Installation

Dans le dossier `serveur/`, exécuter :

```
npm install
```

## Démarrage

```
node app.js
```

ou :

```
npm start
```

Le terminal affiche :

```
Serveur en écoute sur le port 3000
```

Ouvrir ensuite `interface/index.html` dans le navigateur.

## Routes disponibles

| Méthode | Route | Description | Codes retournés |
|---|---|---|---|
| GET | `/api/alertes` | Liste toutes les alertes | 200 |
| GET | `/api/alertes?niveau=critique` | Liste filtrée par niveau | 200, 400 |
| GET | `/api/alertes/:id` | Une seule alerte par id | 200, 400, 404 |
| POST | `/api/alertes` | Crée une nouvelle alerte | 201, 400 |
| PATCH | `/api/alertes/:id/resolue` | Marque une alerte résolue | 200, 400, 404 |
| DELETE | `/api/alertes/:id` | Supprime une alerte | 200, 404 |

## Modèle d'une alerte

```json
{
  "id":         1,
  "source":     "Serveur web-01",
  "type":       "cpu",
  "niveau":     "critique",
  "message":    "Utilisation CPU à 95 %",
  "horodatage": "2026-05-01T10:30:00.000Z",
  "resolue":    false
}
```

Champs envoyés par le client lors d'un POST : `source`, `type`, `niveau`, `message` uniquement.
Les champs `id`, `horodatage` et `resolue` sont toujours générés par le serveur.

Valeurs autorisées pour `niveau` : `info`, `avertissement`, `critique`.

## Structure des fichiers

```
TP_1/
├── interface/
│   ├── index.html             <- page de l'interface (fournie, non modifiée)
│   ├── styles.css             <- mise en page (fournie, non modifiée)
│   └── app.js                 <- appels fetch() vers l'API (fourni, non modifié)
└── serveur/
    ├── package.json           <- dépendances et scripts
    ├── app.js                 <- point d'entrée, middlewares, démarrage
    ├── data/
    │   └── alertes.js         <- tableau d'alertes en mémoire (données de départ)
    └── routes/
        └── alertes.routes.js  <- les 5 routes de l'API
```

## Journalisation

Chaque requête reçue est affichée dans le terminal avec l'heure, la méthode, l'URL, le code de statut et la durée :

```
Serveur en écoute sur le port 3000
[2026-05-01T10:30:00.000Z] GET /api/alertes -> 200 (12 ms)
[2026-05-01T10:30:01.000Z] POST /api/alertes -> 201 (3 ms)
[2026-05-01T10:30:02.000Z] PATCH /api/alertes/1/resolue -> 200 (1 ms)
[2026-05-01T10:30:03.000Z] DELETE /api/alertes/2 -> 200 (1 ms)
```
