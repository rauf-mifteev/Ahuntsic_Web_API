// data/alertes.js
// Ce fichier contient le tableau d'alertes stocké en mémoire.

const alertes = [
  {
    id: 1,
    source: 'Serveur web-01',
    type: 'cpu',
    niveau: 'critique',
    message: 'Utilisation CPU à 95 %',
    horodatage: '2026-05-01T10:30:00.000Z',
    resolue: false
  },
  {
    id: 2,
    source: 'Serveur db-01',
    type: 'disque',
    niveau: 'avertissement',
    message: 'Espace disque à 80 % de capacité',
    horodatage: '2026-05-01T11:00:00.000Z',
    resolue: false
  },
  {
    id: 3,
    source: 'Routeur réseau-01',
    type: 'reseau',
    niveau: 'info',
    message: 'Latence réseau légèrement élevée',
    horodatage: '2026-05-01T11:30:00.000Z',
    resolue: false
  }
];

// On exporte le tableau pour que les autres fichiers puissent y accéder.

module.exports = alertes;
