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
   ------------------------------------------------------------ */

app.use(cors());

app.use(express.json());

/* ------------------------------------------------------------
   Routes
   On délègue tout ce qui commence par /api/alertes au routeur.
   ------------------------------------------------------------ */
app.use('/api/alertes', alertesRouter);

/* ------------------------------------------------------------
   Démarrage
   ------------------------------------------------------------ */
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
});
