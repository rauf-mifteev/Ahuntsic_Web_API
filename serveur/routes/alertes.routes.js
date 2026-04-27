// routes/alertes.routes.js
// Ce fichier contient les routes de l'API pour les alertes.

const express = require('express');
const router  = express.Router();
const alertes = require('../data/alertes');

// Valeurs autorisées pour le champ "niveau".
const NIVEAUX_VALIDES = ['info', 'avertissement', 'critique'];

/* ------------------------------------------------------------
   GET /api/alertes
   Retourne toutes les alertes, ou seulement celles d'un niveau
   si le paramètre de requête ?niveau=... est présent.

   Exemples :
     GET /api/alertes              -> toutes les alertes
     GET /api/alertes?niveau=critique -> seulement les critiques
   ------------------------------------------------------------ */
router.get('/', (req, res) => {
  // req.query contient les paramètres de la chaîne de requête.
  // Pour /api/alertes?niveau=critique, req.query.niveau vaut "critique".
  // Pour /api/alertes, req.query.niveau vaut undefined.
  const { niveau } = req.query;

  // Si le paramètre niveau n'est pas fourni, on retourne tout.
  if (niveau === undefined) {
    console.log(`GET /api/alertes — ${alertes.length} alerte(s) envoyée(s)`);
    return res.json(alertes);
  }

  // Si niveau est fourni mais n'est pas une valeur autorisée, on
  // répond 400 pour signaler l'erreur au client.
  if (!NIVEAUX_VALIDES.includes(niveau)) {
    console.error(`GET /api/alertes — niveau invalide : "${niveau}"`);
    return res.status(400).json({
      message: `Le paramètre niveau doit etre: info, avertissement ou critique. Valeur reçue : "${niveau}".`
    });
  }

  // On filtre le tableau pour ne garder que les alertes du niveau demandé.
  const resultat = alertes.filter(a => a.niveau === niveau);

  console.log(`GET /api/alertes?niveau=${niveau} — ${resultat.length} alerte(s) trouvée(s)`);
  res.json(resultat);
});


/* ------------------------------------------------------------
   GET /api/alertes/:id
   Retourne une seule alerte identifiée par son id.
   - 400 Bad Request si :id n'est pas un nombre entier positif.
   - 404 Not Found si aucune alerte ne correspond.
   - 200 OK + l'alerte si elle existe.
   ------------------------------------------------------------ */
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  // Number.isNaN() est vrai si la conversion a échoué (ex. "abc").
  // La deuxième condition rejette les nombres négatifs ou zéro.
  if (Number.isNaN(id) || id <= 0) {
    console.error(`GET /api/alertes/:id — id invalide : "${req.params.id}"`);
    return res.status(400).json({
      message: 'Le paramètre id doit être un nombre entier positif.'
    });
  }

  // find() parcourt le tableau et retourne le premier élément
  // dont la propriété id correspond, ou undefined si absent.
  const alerte = alertes.find(a => a.id === id);

  if (!alerte) {
    console.error(`GET /api/alertes/:id — alerte introuvable (id = ${id})`);
    return res.status(404).json({ message: 'Alerte introuvable.' });
  }

  console.log(`GET /api/alertes/:id — alerte trouvée (id = ${id})`);
  res.json(alerte);
});

/* ------------------------------------------------------------
   POST /api/alertes
   Crée une nouvelle alerte.

   Corps attendu du client :
     { source, type, niveau, message }

   Le serveur génère lui-même : id, horodatage, resolue.
   Tout id / horodatage / resolue envoyé par le client est ignoré.
   ------------------------------------------------------------ */
router.post('/', (req, res) => {
  console.log('POST /api/alertes — corps reçu :', req.body);

  // On extrait uniquement les quatre champs attendus.
  // En nommant explicitement les champs, on ignore automatiquement
  // tout ce que le client enverrait en plus (id, resolue, etc.).
  const { source, type, niveau, message } = req.body;

  // --- Validation ---
  // On construit une liste de problèmes trouvés.
  const erreurs = [];

  if (typeof source !== 'string' || source.trim() === '') {
    erreurs.push('Le champ source est obligatoire et doit être une chaîne non vide.');
  }
  if (typeof type !== 'string' || type.trim() === '') {
    erreurs.push('Le champ type est obligatoire et doit être une chaîne non vide.');
  }
  if (typeof niveau !== 'string' || niveau.trim() === '') {
    erreurs.push('Le champ niveau est obligatoire.');
  } else if (!NIVEAUX_VALIDES.includes(niveau.trim())) {
    erreurs.push(`Le champ niveau doit valoir info, avertissement ou critique. Valeur reçue : "${niveau}".`);
  }
  if (typeof message !== 'string' || message.trim() === '') {
    erreurs.push('Le champ message est obligatoire et doit être une chaîne non vide.');
  }

  // S'il y a des erreurs, on répond 400 avec le premier message.
  if (erreurs.length > 0) {
    console.error('POST /api/alertes — validation échouée :', erreurs);
    return res.status(400).json({ message: erreurs[0] });
  }

  // --- Génération des champs côté serveur ---

  // L'id est calculé en prenant le plus grand id existant et en ajoutant 1.
  // Si le tableau est vide, on commence à 1.
  const nouvelId = alertes.length > 0
    ? Math.max(...alertes.map(a => a.id)) + 1
    : 1;

  const nouvelleAlerte = {
    id:         nouvelId,
    source:     source.trim(),
    type:       type.trim(),
    niveau:     niveau.trim(),
    message:    message.trim(),
    horodatage: new Date().toISOString(),  // format ISO 8601
    resolue:    false                      // toujours false à la création
  };

  // Ajout dans le tableau en mémoire.
  alertes.push(nouvelleAlerte);

  console.log('POST /api/alertes — alerte créée :', nouvelleAlerte);

  // 201 Created = une ressource a été créée avec succès.
  // On renvoie l'alerte complète pour que le client connaisse son id.
  res.status(201).json(nouvelleAlerte);
});

/* ------------------------------------------------------------
   PATCH /api/alertes/:id/resolue
   Marque l'alerte comme résolue (resolue = true).
   Aucun corps n'est requis dans la requête.

   - 400 si :id est invalide.
   - 404 si l'alerte n'existe pas.
   - 400 si l'alerte est déjà résolue.
   - 200 + alerte mise à jour si succès.
   ------------------------------------------------------------ */
router.patch('/:id/resolue', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (Number.isNaN(id) || id <= 0) {
    console.error(`PATCH /api/alertes/:id/resolue — id invalide : "${req.params.id}"`);
    return res.status(400).json({
      message: 'Le paramètre id doit être un nombre entier positif.'
    });
  }

  // On utilise find() pour obtenir une référence directe à l'objet
  // dans le tableau. Toute modification de cet objet modifie aussi
  // le tableau (même objet en mémoire, pas une copie).
  const alerte = alertes.find(a => a.id === id);

  if (!alerte) {
    console.error(`PATCH /api/alertes/:id/resolue — alerte introuvable (id = ${id})`);
    return res.status(404).json({ message: 'Alerte introuvable.' });
  }

  if (alerte.resolue) {
    console.error(`PATCH /api/alertes/:id/resolue — alerte déjà résolue (id = ${id})`);
    return res.status(400).json({ message: 'Cette alerte est déjà marquée comme résolue.' });
  }

  // Modification directe de la propriété dans le tableau.
  alerte.resolue = true;

  console.log(`PATCH /api/alertes/:id/resolue — alerte ${id} marquée résolue`);
  res.json(alerte);
});

/* ------------------------------------------------------------
   DELETE /api/alertes/:id
   Supprime une alerte du tableau en mémoire.

   - 400 si :id est invalide.
   - 404 si l'alerte n'existe pas.
   - 200 + confirmation JSON si succès.
   ------------------------------------------------------------ */
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (Number.isNaN(id) || id <= 0) {
    console.error(`DELETE /api/alertes/:id — id invalide : "${req.params.id}"`);
    return res.status(400).json({
      message: 'Le paramètre id doit être un nombre entier positif.'
    });
  }

  // findIndex() retourne la position (indice) de l'élément dans le tableau,
  // ou -1 si aucun élément ne correspond.
  const index = alertes.findIndex(a => a.id === id);

  if (index === -1) {
    console.error(`DELETE /api/alertes/:id — alerte introuvable (id = ${id})`);
    return res.status(404).json({ message: 'Alerte introuvable.' });
  }

  // splice(index, 1) retire 1 élément à la position "index" du tableau.
  alertes.splice(index, 1);

  console.log(`DELETE /api/alertes/:id — alerte ${id} supprimée`);
  res.json({ message: 'Alerte supprimée.', id: id });
});

module.exports = router;
