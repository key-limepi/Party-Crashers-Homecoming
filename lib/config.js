// settings for the whole server, read from env vars
const path = require("path");
const { toInt } = require("./util");

// the project folder, one level above lib
const ROOT = path.join(__dirname, "..");

// read .env when running locally, real env vars win
try {
  process.loadEnvFile(path.join(ROOT, ".env"));
} catch (err) {
  // no .env file, vercel uses its own env vars
}

const env = process.env;

// formbar and digipog settings
const FORMBAR_ADDRESS = (env.FORMBAR_ADDRESS || "").replace(/\/+$/, "");
const FORMBAR_CLIENT_URL = (env.FORMBAR_CLIENT_URL || FORMBAR_ADDRESS).replace(/\/+$/, "");
const APP_URL = (env.URL || "").replace(/\/+$/, "");

// off means local testing, no login and no digipogs
const modeText = String(env.FORMBAR_MODE ?? "true").split("#")[0].trim().split(/\s+/)[0] || "true";
const modeWord = modeText.replace(/^["']+|["']+$/g, "").toLowerCase();
const FORMBAR_MODE = !["0", "false", "off", "no", "n", "disabled", "disable"].includes(modeWord);

const POOL_ID = toInt(env.POOL_ID, 0);
const ROUND_COST = FORMBAR_MODE ? toInt(env.ROUND_COST, 25) : 0;
const MALICE_PER_ROUND = toInt(env.MALICE_PER_ROUND, 1);
const MALICE_PRICE = toInt(env.MALICE_PRICE, 10);
const MALICE_PER_BUY = toInt(env.MALICE_PER_BUY, 1);
const DIGIPOGS_ON = FORMBAR_MODE && (ROUND_COST > 0 || MALICE_PRICE > 0);

// all times are in seconds
const TIMEOUT = 25; // drop players who stop sending updates
const ROUND_BASE = 120;
const ROUND_PER_PLAYER = 30;
const ROUND_MAX = 600;
const INTER_TIME = 30;
const SELECT_TIME = 30;
const GRACE_TIME = 5;

// how long each last man standing song lasts, other characters use the default
const LMS_DURATIONS = { lux: 209.712, sonic: 266.904, supersonic: 266.904 };
const LMS_DEFAULT = 105.091;

// traps, rockets and bombs
const SPIKE_MAX = 5;
const SPIKE_LIFE = 45;
const BOMB_MAX = 5;
const TOSS_MAX = 50;
const ROCKET_DMG = 50;
const ROCKET_RADIUS = 170;
const ROCKET_UP = 1.1; // climb time, same as the client
const ROCKET_LIFE = 12;
const ROCKET_GAP = 3.0;
const ROCKET_MAX = 8;
const BLAST_LIFE = 4;

// hits and stuns
const TOUCH_COOLDOWN = 1.0;
const STUN_IFRAMES = 3.0;

// chat
const CHAT_LIFE = 12;
const CHAT_COOLDOWN = 1.5;
const MUTE_TIME = 600;
const QUICK_CHAT = [
  "OK!", "what a save!", "run away!!!", "help me!!",
  "thanks!!", "sorry!!", "nice!!", "wow!!",
  "good luck!!", "killer here!!", "split up!!", "gg!!",
];

// the player fields a client is allowed to send us
const STATE_KEYS = [
  "x", "y", "facing", "moving", "onGround",
  "invis", "m1", "stunned", "pull", "cower", "windup", "pose", "dashing",
  "peeling", "spinning", "spinwindup", "pullwindup", "lift", "super", "forming",
];

// stands in for a login when formbar mode is off
const LOCAL_SESSION = { sid: "local", fid: "local", name: "guest", pin: null };

module.exports = {
  ROOT, FORMBAR_ADDRESS, FORMBAR_CLIENT_URL, APP_URL, FORMBAR_MODE, POOL_ID,
  ROUND_COST, MALICE_PER_ROUND, MALICE_PRICE, MALICE_PER_BUY, DIGIPOGS_ON,
  TIMEOUT, ROUND_BASE, ROUND_PER_PLAYER, ROUND_MAX, INTER_TIME, SELECT_TIME, GRACE_TIME,
  LMS_DURATIONS, LMS_DEFAULT, SPIKE_MAX, SPIKE_LIFE, BOMB_MAX, TOSS_MAX,
  ROCKET_DMG, ROCKET_RADIUS, ROCKET_UP, ROCKET_LIFE, ROCKET_GAP, ROCKET_MAX, BLAST_LIFE,
  TOUCH_COOLDOWN, STUN_IFRAMES, CHAT_LIFE, CHAT_COOLDOWN, MUTE_TIME, QUICK_CHAT,
  STATE_KEYS, LOCAL_SESSION,
};
