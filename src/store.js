// Mémorise les articles déjà publiés dans data/seen.json pour qu'un article
// n'apparaisse qu'une seule fois, même après un redémarrage du bot.
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve(import.meta.dirname, '..', 'data');
const FILE = path.join(DATA_DIR, 'seen.json');

// Nombre max d'identifiants gardés par flux (largement au-dessus de la taille d'un flux)
const MAX_PER_FEED = 2000;

let state = {};

export function load() {
  try {
    state = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('[store] seen.json illisible, réinitialisation :', err.message);
    state = {};
  }
}

export function isKnownFeed(feedUrl) {
  return Array.isArray(state[feedUrl]);
}

export function has(feedUrl, id) {
  return state[feedUrl]?.includes(id) ?? false;
}

export function add(feedUrl, ids) {
  const list = state[feedUrl] ?? [];
  for (const id of ids) if (!list.includes(id)) list.push(id);
  state[feedUrl] = list.slice(-MAX_PER_FEED);
}

export function save() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  // Écriture atomique : on écrit dans un fichier temporaire puis on renomme
  const tmp = `${FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, FILE);
}
