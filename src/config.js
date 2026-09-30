// =============================================================================
//  CONFIGURATION DU BOT DE VEILLE
// =============================================================================
//
//  Pour chaque flux, renseigne le ou les ID de salons Discord dans `channels`.
//  Plusieurs salons ? Sépare simplement les ID par des virgules :
//      channels: '123456789012345678, 987654321098765432'
//
//  (Clic droit sur un salon > "Copier l'identifiant du salon", le mode
//   développeur doit être activé dans Paramètres > Avancés.)
// =============================================================================

export default {
  // Intervalle entre deux vérifications des flux (en minutes)
  pollIntervalMinutes: 5,

  // Articles déjà présents dans un flux lors de sa toute première lecture :
  //   'all' -> tous publiés une fois (puis plus jamais)
  //   N     -> seuls les N plus récents sont publiés, les autres juste mémorisés
  //   0     -> rien n'est publié, tout est juste mémorisé
  postOnFirstRun: 'all',

  feeds: [
    // ---------------------------------------------------------------------------
    // Statuts OVHcloud (https://www.status-ovhcloud.com/)
    // La page d'accueil regroupe 6 pages de statut, chacune avec son flux RSS.
    // Supprime/commente les lignes des catégories qui ne t'intéressent pas.
    // ---------------------------------------------------------------------------
    {
      name: 'OVHcloud Status - Bare Metal',
      channels: '1505882737163239494',
      color: 0x000e9c,
      urls: [
        'https://bare-metal-servers.status-ovhcloud.com/history.rss',
      ],
    },
    {
      name: 'OVHcloud Status - Hosted Private Cloud',
      channels: '1553121831471415307',
      color: 0x000e9c,
      urls: [
        'https://hosted-private-cloud.status-ovhcloud.com/history.rss',
      ],
    },
    {
      name: 'OVHcloud Status - Public Cloud',
      channels: '1553121907077816330',
      color: 0x000e9c,
      urls: [
        'https://public-cloud.status-ovhcloud.com/history.rss',
      ],
    },
    {
      name: 'OVHcloud Status - Web Cloud',
      channels: '1553121992725766214',
      color: 0x000e9c,
      urls: [
        'https://web-cloud.status-ovhcloud.com/history.rss',
      ],
    },
    {
      name: 'OVHcloud Status - Customer Service',
      channels: '1553122196824526979',
      color: 0x000e9c,
      urls: [
        'https://customer-service.status-ovhcloud.com/history.rss',
      ],
    },
    {
      name: 'OVHcloud Status - Network',
      channels: '1553122341125488661',
      color: 0x000e9c,
      urls: [
        'https://network.status-ovhcloud.com/history.rss',
      ],
    },

    // ---------------------------------------------------------------------------
    // CERT-FR — Avis de sécurité
    // ---------------------------------------------------------------------------
    {
      name: 'CERT-FR — Avis',
      channels: '1553119783510220872',
      color: 0xe1000f,
      urls: ['https://www.cert.ssi.gouv.fr/avis/feed/'],
    },

    // ---------------------------------------------------------------------------
    // FrenchBreaches — Fuites de données
    // ---------------------------------------------------------------------------
    {
      name: 'FrenchBreaches',
      channels: '1553119904020828242',
      color: 0xf39c12,
      urls: ['https://frenchbreaches.com/feed.xml'],
    },
  ],
};
