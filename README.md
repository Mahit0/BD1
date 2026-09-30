# Bot Discord de veille techno

Publie automatiquement dans vos salons Discord les nouveaux articles de :
- **Statuts OVHcloud** (les 6 pages de statut de https://www.status-ovhcloud.com/)
- **CERT-FR – Avis** (https://www.cert.ssi.gouv.fr/avis/feed/)
- **FrenchBreaches** (https://frenchbreaches.com/feed.xml)

## Installation

1. `npm install`
2. Mettre le token du bot dans `.env` : `TOKEN=xxxxx`
3. Renseigner les ID des salons dans `src/config.js` (plusieurs ID séparés par des virgules)
4. `npm start`

Invitez le bot avec le scope `bot` et les permissions **Voir le salon**, **Envoyer des messages** et **Intégrer des liens**.

## Anti-doublon

Les identifiants des articles déjà publiés sont enregistrés dans `data/seen.json`.
Un article n'est donc publié qu'une seule fois, même après un redémarrage.
Au premier lancement, les articles déjà présents sont publiés une fois
(réglable avec `postOnFirstRun` dans `src/config.js`).
Pour tout republier depuis zéro, supprimez `data/seen.json`.
