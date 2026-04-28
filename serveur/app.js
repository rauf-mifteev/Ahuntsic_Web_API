// app.js — Point d'entrée du serveur Express

const express     = require('express');
const cors        = require('cors');

// On importe le routeur 
const alertesRouter = require('./routes/alertes.routes');

const app  = express();
const PORT = 3000;

/* ------------------------------------------------------------
   Middlewares
   Une fonction qui s'exécute sur chaque
   requête avant qu'elle n'arrive à la route.
   
   req  -> objet requête (méthode, URL, en-têtes, corps, ...)
   res  -> objet réponse (code HTTP, corps, ...)
   next -> fonction qui passe le contrôle au middleware suivant

   Sans l'appel à next(), la requête reste bloquée ici.
   ------------------------------------------------------------ */

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  // On mémorise l'heure de début pour calculer la durée.
  const debut = Date.now();

  // res.on('finish', ...) déclenche le callback quand Express
  // a fini d'envoyer la réponse. C'est à ce moment qu'on connaît
  // le code de statut (res.statusCode).
  res.on('finish', () => {
    const duree = Date.now() - debut;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} -> ${res.statusCode} (${duree} ms)`);
  });

  // Passe au middleware suivant (ou à la route).
  next();
});


/* ------------------------------------------------------------
   Routes
   On délègue tout ce qui commence par /api/alertes au routeur.
   ------------------------------------------------------------ */
app.use('/api/alertes', alertesRouter);

/* ------------------------------------------------------------
   Gestion des erreurs inattendues (500)
   Ce middleware intercepte toute erreur non gérée qui remonte
   jusqu'ici via next(err). Il doit avoir 4 paramètres
   pour qu'Express le reconnaisse comme gestionnaire d'erreurs.
   ------------------------------------------------------------ */
app.use((err, req, res, next) => {
  console.error('Erreur inattendue :', err.message);
  res.status(500).json({ message: 'Une erreur interne est survenue.' });
});

/* ------------------------------------------------------------
   Démarrage
   ------------------------------------------------------------ */
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});
