import 'dotenv/config';
import { Client, EmbedBuilder, Events, GatewayIntentBits } from 'discord.js';
import Parser from 'rss-parser';
import config from './config.js';
import * as store from './store.js';

const parser = new Parser({
  timeout: 20_000,
  headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VeilleTechnoBot/1.0)' },
});

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// "123, 456 ,789" -> ['123', '456', '789']
const parseChannelIds = (value) =>
  String(value ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter((id) => /^\d{17,20}$/.test(id));

// Identifiant unique d'un article (guid > lien > titre+date)
const itemId = (item) => item.guid || item.id || item.link || `${item.title}|${item.pubDate}`;

const itemDate = (item) => new Date(item.isoDate || item.pubDate || Date.now());

function cleanText(html, max = 400) {
  if (!html) return '';
  const text = html
    .replace(/<br\s*\/?>|<\/p>|<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function buildEmbed(feedConf, feedTitle, item) {
  const embed = new EmbedBuilder()
    .setColor(feedConf.color ?? 0x5865f2)
    .setTitle((item.title || 'Sans titre').slice(0, 256))
    .setFooter({ text: feedTitle ? `${feedConf.name} • ${feedTitle}`.slice(0, 2048) : feedConf.name })
    .setTimestamp(itemDate(item));

  if (item.link) embed.setURL(item.link);
  const desc = cleanText(item.contentSnippet || item.content || item.summary);
  if (desc) embed.setDescription(desc);
  return embed;
}

async function sendToChannels(channelIds, embed) {
  let sent = 0;
  for (const id of channelIds) {
    try {
      const channel = await client.channels.fetch(id);
      if (!channel?.isTextBased()) {
        console.warn(`[discord] Le salon ${id} n'est pas un salon textuel`);
        continue;
      }
      await channel.send({ embeds: [embed] });
      sent++;
    } catch (err) {
      console.error(`[discord] Envoi impossible dans le salon ${id} :`, err.message);
    }
  }
  return sent;
}

async function checkFeed(feedConf, url) {
  const channelIds = parseChannelIds(feedConf.channels);
  if (channelIds.length === 0) {
    console.warn(`[${feedConf.name}] Aucun ID de salon valide configuré, flux ignoré`);
    return;
  }

  let feed;
  try {
    feed = await parser.parseURL(url);
  } catch (err) {
    console.error(`[${feedConf.name}] Erreur de lecture de ${url} :`, err.message);
    return;
  }

  const items = feed.items ?? [];

  // Premier passage sur ce flux : seuls les articles choisis par postOnFirstRun seront publiés
  if (!store.isKnownFeed(url)) {
    const newestFirst = [...items].sort((a, b) => itemDate(b) - itemDate(a));
    const limit = config.postOnFirstRun === 'all' ? Infinity : Number(config.postOnFirstRun) || 0;
    const toPost = newestFirst.slice(0, limit);
    store.add(url, newestFirst.slice(toPost.length).map(itemId));
    store.save();
    console.log(`[${feedConf.name}] Initialisation de ${url} : ${items.length} article(s) mémorisé(s)`);
    if (toPost.length === 0) return;
  }

  // Nouveaux articles, publiés du plus ancien au plus récent
  const fresh = items
    .filter((item) => !store.has(url, itemId(item)))
    .sort((a, b) => itemDate(a) - itemDate(b));

  for (const item of fresh) {
    const sent = await sendToChannels(channelIds, buildEmbed(feedConf, feed.title, item));
    // Si aucun salon n'a reçu le message, on réessaiera au prochain passage
    if (sent > 0) {
      store.add(url, [itemId(item)]);
      store.save();
      console.log(`[${feedConf.name}] Publié : ${item.title}`);
    }
  }
}

let running = false;
async function checkAllFeeds() {
  if (running) return; // évite deux vérifications simultanées
  running = true;
  try {
    for (const feedConf of config.feeds) {
      for (const url of feedConf.urls) await checkFeed(feedConf, url);
    }
  } finally {
    running = false;
  }
}

client.once(Events.ClientReady, async (c) => {
  console.log(`Connecté en tant que ${c.user.tag}`);
  store.load();
  await checkAllFeeds();
  setInterval(checkAllFeeds, config.pollIntervalMinutes * 60_000);
});

if (!process.env.TOKEN) {
  console.error('TOKEN manquant : renseigne-le dans le fichier .env');
  process.exit(1);
}
client.login(process.env.TOKEN);
