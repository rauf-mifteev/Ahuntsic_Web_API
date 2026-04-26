// routes/alertes.routes.js
// Ce fichier contient les routes de l'API pour les alertes.

const express = require('express');
const router  = express.Router();
const alertes = require('../data/alertes');

/* ------------------------------------------------------------
   GET /api/alertes
   Retourne toutes les alertes (200 OK).
   ------------------------------------------------------------ */
router.get('/', (req, res) => {
  console.log(`GET /api/alertes — ${alertes.length} alerte(s) envoyée(s)`);
  res.json(alertes);
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

module.exports = router;
