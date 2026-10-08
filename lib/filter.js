// chat word filter, catches leetspeak, spacing and repeated letters
const fs = require("fs");
const path = require("path");
const { ROOT } = require("./config");

// extra words on top of blacklist.json
const EXTRA_FILTER = [
  { match: "shit|shits|shitty|shite", exceptions: ["shiitake", "shiitakes"] },
  { match: "bitch|bitches|bitchy" },
  { match: "poop|poopy|pooped|pooping|pooper" },
];

const LEET = {
  "@": "a", "4": "a", "8": "b", "3": "e", "1": "i",
  "!": "i", "0": "o", "$": "s", "5": "s", "7": "t", "+": "t",
};

// letters in a bad word can have symbols between them
const SEPARATOR = "[\\W_]*";

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// lowercase, undo leetspeak, squash repeats and split into plain words
function normalizeWords(text) {
  let s = [...String(text).toLowerCase()].map((ch) => LEET[ch] || ch).join("");
  s = s.replace(/(.)\1{2,}/g, "$1");
  return s.split(/[^a-z0-9]+/).filter(Boolean);
}

// the txt lists, short entries match whole words and long ones match inside text
const listWords = new Set();
const listBlobs = new Set();

try {
  for (const file of ["slurs.txt", "family-friendly.txt", "l33t-speak.txt"]) {
    const text = fs.readFileSync(path.join(ROOT, "blacklist", file), "utf8");
    for (const line of text.split("\n")) {
      const squashed = normalizeWords(line).join("");
      if (!squashed) continue;
      (squashed.length >= 5 ? listBlobs : listWords).add(squashed);
    }
  }
  console.log(`folder lists loaded!! ${listWords.size} words + ${listBlobs.size} phrases!!`);
} catch (err) {
  console.log(`!! folder lists missing (${err.message})!!`);
}

function matchesList(text) {
  const words = normalizeWords(text);
  if (words.some((w) => listWords.has(w))) return true;
  const blob = words.join("");
  const longest = Math.min(blob.length, 32);
  for (let len = 5; len <= longest; len++) {
    for (let i = 0; i + len <= blob.length; i++) {
      if (listBlobs.has(blob.slice(i, i + len))) return true;
    }
  }
  return false;
}

// each pattern is paired with its list of allowed exceptions
const patterns = [];

function addPattern(alt, exceptions) {
  const bare = alt.replaceAll("*", "").replaceAll(" ", "");
  const bounded = !alt.includes(" ") && bare.length < 6 && !alt.startsWith("*") && !alt.endsWith("*");
  const parts = [...alt].map((ch) => (ch === "*" ? ".*" : escapeRegex(ch)));
  let body = parts.join(SEPARATOR);
  if (bounded) {
    // short words must sit on a word edge
    const first = escapeRegex(alt[0]);
    const last = escapeRegex(alt[alt.length - 1]);
    body = `(?:\\b(?=${first})|(?<=${first}))${body}(?:(?<=${last})\\b|(?=${last}))`;
  }
  patterns.push({ regex: new RegExp(body), exceptions });
}

try {
  const entries = [...JSON.parse(fs.readFileSync(path.join(ROOT, "blacklist.json"), "utf8")), ...EXTRA_FILTER];
  for (const entry of entries) {
    const alts = String(entry.match || "").split("|").map((a) => a.trim().toLowerCase()).filter(Boolean);
    const exceptions = (entry.exceptions || []).map((e) => String(e).trim().toLowerCase()).filter(Boolean);
    for (const alt of alts) addPattern(alt, exceptions);
  }
  console.log(`blacklist loaded!! ${patterns.length} patterns!!`);
} catch (err) {
  console.log(`!! blacklist broken (${err.message}) - chat unfiltered!!`);
}

// a simple glob match where * means anything and ? means one letter
function globMatch(word, glob) {
  const regex = escapeRegex(glob).replaceAll("\\*", ".*").replaceAll("\\?", ".");
  return new RegExp(`^${regex}$`).test(word);
}

// true if an exception covers the match
function isExcused(text, words, exceptions) {
  for (const exception of exceptions) {
    if (exception.includes(" ")) {
      if (new RegExp(escapeRegex(exception).replaceAll("\\*", ".*")).test(text)) return true;
    } else if (words.some((w) => w && globMatch(w, exception))) {
      return true;
    }
  }
  return false;
}

// true when the text has no bad words
function isClean(text) {
  if (matchesList(text)) return false;
  const lower = String(text).toLowerCase();
  const words = lower.split(/[^a-z0-9]+/);
  for (const { regex, exceptions } of patterns) {
    if (regex.test(lower) && !isExcused(lower, words, exceptions)) return false;
  }
  return true;
}

module.exports = { isClean };
