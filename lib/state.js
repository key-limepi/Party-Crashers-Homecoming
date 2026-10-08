// all the shared game state lives in this one object
const { newDict } = require("./util");

const state = {
  // lists of things in the world, keyed by id
  players: newDict(),
  spikes: newDict(),
  bombs: newDict(),
  bombTosses: newDict(),
  rockets: newDict(),
  blasts: [],
  alerts: [],
  chatLog: [],

  // guards against spam
  lastRocket: newDict(),
  lastChat: newDict(),
  lastHit: newDict(),
  lastStun: newDict(),
  mutedFids: newDict(),

  // cookie id to login data, and formbar id to malice total
  sessions: newDict(),
  malice: newDict(),

  // counters used to make ids
  chatSeq: 0,
  spikeSeq: 0,
  bombSeq: 0,
  bombTossSeq: 0,
  rocketSeq: 0,
  blastSeq: 0,

  // round flow
  phase: "lobby", // lobby, intermission, select or round
  phaseEnd: 0,
  pendingEnd: 0, // set when the killer leaves
  lastKillerName: "EVIL",
  lmsSet: false, // the last man standing fight, once per round
  lmsNoticeUntil: 0,
  roundStart: 0,
  killerId: null,
  currentRound: 0,
  result: null,
  roundPlayers: new Set(),

  // the pick list, mods can flip the dev flag
  characters: [
    { id: "lux", name: "LUX" },
    { id: "toko", name: "TOKO" },
    { id: "sonic", name: "SONIC" },
    { id: "tails", name: "TAILS" },
    { id: "supersonic", name: "SUPER SONIC", dev: true },
    { id: "nyan", name: "NYAN CYAT", dev: true },
    { id: "bear5", name: "BEAR5", dev: true, killer: true },
  ],
};

module.exports = state;
