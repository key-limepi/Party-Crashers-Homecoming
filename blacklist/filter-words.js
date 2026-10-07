// wordlists sourced from The_Ultimate_Filter (github.com/Arbitrium-Studios/The_Ultimate_Filter),
// combined with chat/api/filter.php which does the same check server-side
// as a backstop. this file only ships the small slurs+scam lists for an
// instant client-side check (no network round trip); the much bigger
// general profanity/leetspeak lists live server-side only, so we're not
// shipping ~600kb of wordlist to every visitor's browser. see
// chat/filters/ for the raw source lists.

const FILTER_WORDS = [
  '.gg/fairplay', '<script', 'curry queen', 'datnigga', 'dinge queen',
  'discord.gg/aquacheats', 'discord.gg/justchill',
  'every join .gg/fairplay today', 'fag', 'faggot', 'goo.su/nitro-drop',
  'goo.su/yqr0wz', 'gym queen', 'harry hoofter', 'heil hitler', 'jap',
  'japcrap', 'japie', 'japies', 'japs', 'jobby jabber', 'knob jockey',
  'marmite miner', 'myp4yiuc0kw', 'negres', 'negress', 'negro', 'nig',
  'niga', 'nigar', 'nigars', 'nigas', 'niger', 'nigerian', 'nigerians',
  'nigers', 'nigette', 'nigettes', 'nigg', 'nigg3r', 'nigg4h', 'nigga',
  'niggah', 'niggahs', 'niggar', 'niggaracci', 'niggard', 'niggarded',
  'niggarding', 'niggardliness', 'niggardlinesss', 'niggardly', 'niggards',
  'niggars', 'niggas', 'niggaz', 'nigger', 'niggerhead', 'niggerhole',
  'niggers', 'niggle', 'niggled', 'niggles', 'niggling', 'nigglings',
  'niggor', 'niggress', 'niggresses', 'nigguh', 'nigguhs', 'niggur',
  'niggurs', 'niglet', 'nignog', 'nigor', 'nigors', 'nigr', 'nigra',
  'nigras', 'nigre', 'nigres', 'nigress', 'nigs', 'nigur', 'niiger', 'niigr',
  'nimphomania', 'nimrod', 'ninny', 'nip', 'nipple', 'nipplering', 'nipples',
  'nips', 'nittit', 'nlgger', 'nlggor', 'owned by brylan', 'pissy queen',
  'poove', 'rard', 'retard', 'retarded', 'sandnigger', 'scat queen',
  'schizo', 'snownigger', 'spaghettinigger', 'steamcommunity.com/gift',
  'steamcomumnity.com/', 'stenmcommnunnity.com', 't-me-verifigirl.ru/',
  'the best mc bedrock anticheat around', 'timbernigger', 'todger dodger',
  'toosa', 'trannie', 'tranny', 'trans race', 'transgendered',
  'transgenderism', 'transrace', 'transsexual', 'transvestite',
  'turd burglar', 'u.to/i1ytlq', 'whitenigger', 'wigger',
  'www.roblox.com.kg',
];

const LEET_MAP = {
  '@': 'a', '4': 'a', '8': 'b', '3': 'e', '1': 'i', '!': 'i',
  '0': 'o', '$': 's', '5': 's', '7': 't', '+': 't',
};

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function filterNormalize(text) {
  let out = text.toLowerCase();
  out = out.replace(/[@483107!$+]/g, ch => LEET_MAP[ch] || ch);
  out = out.replace(/(.)\1{2,}/g, '$1'); // "fuuuuck" -> "fuck"
  return out;
}

function buildWordPattern(word) {
  const chars = word.split('').map(escapeRegex);
  const joined = chars.join('[\\W_]{0,3}');
  return new RegExp('(?:^|[^a-z0-9])' + joined + '(?:[^a-z0-9]|$)', 'i');
}

const FILTER_PATTERNS = FILTER_WORDS.map(buildWordPattern);

// true if message clean
function isMessageClean(text) {
  const normalized = filterNormalize(text);
  return !FILTER_PATTERNS.some(re => re.test(normalized));
}
