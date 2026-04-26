/* ============================================================
   app.js — Console de supervision d'alertes
   ------------------------------------------------------------
   Cette interface est FOURNIE. Vous N'AVEZ PAS à la modifier.

   Elle consomme les cinq routes attendues côté serveur :

     GET    /api/alertes                  -> liste des alertes
     GET    /api/alertes?niveau=critique  -> liste filtrée par niveau
     POST   /api/alertes                  -> créer une alerte
     PATCH  /api/alertes/:id/resolue      -> marquer comme résolue
     DELETE /api/alertes/:id              -> supprimer

   Modèle d'une alerte (tel que renvoyé par le serveur) :

     {
       id:          1,
       source:      "Serveur web-01",
       type:        "cpu",
       niveau:      "critique",
       message:     "Utilisation CPU à 95 %",
       horodatage:  "2026-05-01T10:30:00.000Z",
       resolue:     false
     }

   Règle clé : le client N'ENVOIE JAMAIS les champs
               id, horodatage, ni resolue.
               Le SERVEUR s'en charge.
   ============================================================ */


/* ------------------------------------------------------------
   1) Configuration
   ------------------------------------------------------------ */

const API_URL = "http://localhost:3000";


/* ------------------------------------------------------------
   2) Références vers les éléments de la page
   ------------------------------------------------------------ */

const listeAlertes    = document.getElementById("liste-alertes");
const btnRafraichir   = document.getElementById("btn-rafraichir");
const filtreNiveau    = document.getElementById("filtre-niveau");
const messageAlertes  = document.getElementById("message-alertes");

const formAjout       = document.getElementById("form-ajout");
const champSource     = document.getElementById("champ-source");
const champType       = document.getElementById("champ-type");
const champNiveau     = document.getElementById("champ-niveau");
const champMessage    = document.getElementById("champ-message");
const messageAjout    = document.getElementById("message-ajout");


/* ------------------------------------------------------------
   3) Utilitaires d'affichage
   ------------------------------------------------------------ */

function afficherMessage(element, texte, type) {
  element.textContent = texte;
  element.classList.remove("succes", "erreur", "info");
  if (type) {
    element.classList.add(type);
  }
}

function formaterHorodatage(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("fr-CA");
}

function afficherAlertes(alertes) {
  listeAlertes.innerHTML = "";

  if (!Array.isArray(alertes) || alertes.length === 0) {
    listeAlertes.innerHTML =
      "<p class='message info'>Aucune alerte à afficher.</p>";
    return;
  }

  alertes.forEach((alerte) => {
    const carte = document.createElement("article");
    carte.className = "carte-alerte niveau-" + (alerte.niveau ?? "info");
    if (alerte.resolue) carte.classList.add("resolue");
    carte.dataset.id = alerte.id;

    // Ligne 1 : source + étiquette niveau
    const ligne1 = document.createElement("div");
    ligne1.className = "carte-ligne";

    const source = document.createElement("h3");
    source.className = "carte-source";
    source.textContent = alerte.source ?? "—";

    const niveau = document.createElement("span");
    niveau.className = "etiquette niveau-" + (alerte.niveau ?? "info");
    niveau.textContent = alerte.niveau ?? "—";

    ligne1.appendChild(source);
    ligne1.appendChild(niveau);

    // Type
    const type = document.createElement("span");
    type.className = "carte-type";
    type.textContent = alerte.type ?? "—";

    // Message
    const msg = document.createElement("p");
    msg.className = "carte-message";
    msg.textContent = alerte.message ?? "—";

    // Horodatage
    const horo = document.createElement("span");
    horo.className = "carte-horodatage";
    horo.textContent = "Reçue le " + formaterHorodatage(alerte.horodatage);

    // Actions
    const actions = document.createElement("div");
    actions.className = "carte-actions";

    const btnResolue = document.createElement("button");
    btnResolue.className = "btn-secondaire";
    btnResolue.textContent = alerte.resolue
      ? "Déjà résolue"
      : "Marquer résolue";
    btnResolue.disabled = !!alerte.resolue;
    btnResolue.addEventListener("click", () => resoudreAlerte(alerte.id));

    const btnSuppr = document.createElement("button");
    btnSuppr.className = "btn-danger";
    btnSuppr.textContent = "Supprimer";
    btnSuppr.addEventListener("click", () => supprimerAlerte(alerte.id));

    actions.appendChild(btnResolue);
    actions.appendChild(btnSuppr);

    carte.appendChild(ligne1);
    carte.appendChild(type);
    carte.appendChild(msg);
    carte.appendChild(horo);
    carte.appendChild(actions);

    listeAlertes.appendChild(carte);
  });
}


/* ------------------------------------------------------------
   4) GET /api/alertes (avec filtre optionnel ?niveau=...)
   ------------------------------------------------------------ */

async function chargerAlertes() {
  const niveau = filtreNiveau.value;
  const url = niveau
    ? `${API_URL}/api/alertes?niveau=${encodeURIComponent(niveau)}`
    : `${API_URL}/api/alertes`;

  try {
    afficherMessage(messageAlertes, "Chargement…", "info");

    const reponse = await fetch(url);
    if (!reponse.ok) {
      throw new Error(`Le serveur a répondu avec le code ${reponse.status}.`);
    }

    const alertes = await reponse.json();
    afficherAlertes(alertes);
    afficherMessage(
      messageAlertes,
      `${alertes.length} alerte(s) reçue(s) du serveur.`,
      "succes"
    );
  } catch (erreur) {
    console.error("Erreur pendant le chargement :", erreur);
    afficherMessage(
      messageAlertes,
      "Impossible de joindre le serveur. " + erreur.message,
      "erreur"
    );
    listeAlertes.innerHTML = "";
  }
}


/* ------------------------------------------------------------
   5) POST /api/alertes
   ------------------------------------------------------------ */

async function ajouterAlerte(source, type, niveau, message) {
  try {
    afficherMessage(messageAjout, "Envoi au serveur…", "info");

    const reponse = await fetch(`${API_URL}/api/alertes`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ source, type, niveau, message })
    });

    // On tente de lire le JSON même en cas d'erreur pour afficher
    // le message envoyé par le serveur.
    const donnees = await reponse.json().catch(() => ({}));

    if (!reponse.ok) {
      afficherMessage(
        messageAjout,
        donnees.message ||
          `Erreur serveur (${reponse.status}).`,
        "erreur"
      );
      return;
    }

    afficherMessage(
      messageAjout,
      `Alerte enregistrée (id ${donnees.id}).`,
      "succes"
    );
    formAjout.reset();
    await chargerAlertes();
  } catch (erreur) {
    console.error("Erreur pendant l'ajout :", erreur);
    afficherMessage(
      messageAjout,
      "Impossible de joindre le serveur. " + erreur.message,
      "erreur"
    );
  }
}


/* ------------------------------------------------------------
   6) PATCH /api/alertes/:id/resolue
   ------------------------------------------------------------ */

async function resoudreAlerte(id) {
  try {
    const reponse = await fetch(
      `${API_URL}/api/alertes/${id}/resolue`,
      { method: "PATCH" }
    );

    const donnees = await reponse.json().catch(() => ({}));

    if (!reponse.ok) {
      afficherMessage(
        messageAlertes,
        donnees.message ||
          `Échec de la résolution (code ${reponse.status}).`,
        "erreur"
      );
      return;
    }

    afficherMessage(messageAlertes, `Alerte ${id} marquée résolue.`, "succes");
    await chargerAlertes();
  } catch (erreur) {
    console.error("Erreur pendant la résolution :", erreur);
    afficherMessage(
      messageAlertes,
      "Impossible de joindre le serveur. " + erreur.message,
      "erreur"
    );
  }
}


/* ------------------------------------------------------------
   7) DELETE /api/alertes/:id
   ------------------------------------------------------------ */

async function supprimerAlerte(id) {
  const confirmer = confirm(`Supprimer définitivement l'alerte ${id} ?`);
  if (!confirmer) return;

  try {
    const reponse = await fetch(`${API_URL}/api/alertes/${id}`, {
      method: "DELETE"
    });

    const donnees = await reponse.json().catch(() => ({}));

    if (!reponse.ok) {
      afficherMessage(
        messageAlertes,
        donnees.message ||
          `Échec de la suppression (code ${reponse.status}).`,
        "erreur"
      );
      return;
    }

    afficherMessage(messageAlertes, `Alerte ${id} supprimée.`, "succes");
    await chargerAlertes();
  } catch (erreur) {
    console.error("Erreur pendant la suppression :", erreur);
    afficherMessage(
      messageAlertes,
      "Impossible de joindre le serveur. " + erreur.message,
      "erreur"
    );
  }
}


/* ------------------------------------------------------------
   8) Événements
   ------------------------------------------------------------ */

btnRafraichir.addEventListener("click", chargerAlertes);
filtreNiveau.addEventListener("change", chargerAlertes);

formAjout.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const source  = champSource.value.trim();
  const type    = champType.value.trim();
  const niveau  = champNiveau.value.trim();
  const message = champMessage.value.trim();

  // Validation minimale côté client — la vraie validation est côté SERVEUR.
  if (source === "" || type === "" || niveau === "" || message === "") {
    afficherMessage(
      messageAjout,
      "Veuillez remplir tous les champs.",
      "erreur"
    );
    return;
  }

  ajouterAlerte(source, type, niveau, message);
});


/* ------------------------------------------------------------
   9) Premier chargement
   ------------------------------------------------------------ */

chargerAlertes();
