// the round flow: lobby, intermission, character select and the match itself
const state = require("./state");
const { now, newDict } = require("./util");
const { isAdmin } = require("./admins");
const { transfer } = require("./formbar");
const { getMalice, setMalice, addMalice, pickKiller } = require("./malice");
const {
  ROUND_COST, MALICE_PER_ROUND, TIMEOUT, ROUND_BASE, ROUND_PER_PLAYER, ROUND_MAX,
  INTER_TIME, SELECT_TIME, GRACE_TIME, LMS_DURATIONS, LMS_DEFAULT, SPIKE_LIFE,
  ROCKET_UP, ROCKET_LIFE, BLAST_LIFE, CHAT_LIFE,
} = require("./config");

// players who are in this round and still alive
function alivePlayers() {
  const out = newDict();
  for (const [pid, pl] of Object.entries(state.players)) {
    if (state.roundPlayers.has(pid) && pl.alive !== false && (pl.hp ?? 100) > 0) out[pid] = pl;
  }
  return out;
}

// players who are not away and have not timed out
function herePlayers() {
  const t = now();
  const out = newDict();
  for (const [pid, pl] of Object.entries(state.players)) {
    if (!pl.away && t - (pl.last ?? 0) < TIMEOUT) out[pid] = pl;
  }
  return out;
}

// short afk and timeout summary for the logs
function playerActivity() {
  const t = now();
  const lines = Object.entries(state.players).map(([pid, pl]) => {
    const idle = Math.max(0, t - (pl.last ?? t)).toFixed(1);
    return `${pid}:${pl.name ?? "?"} away=${Boolean(pl.away)} idle=${idle}s`;
  });
  return lines.join(", ") || "none";
}

// alive players on the other side, killer against survivors
function enemiesOf(pid) {
  const evil = pid === state.killerId;
  const out = newDict();
  for (const [p, pl] of Object.entries(alivePlayers())) {
    if ((p === state.killerId) !== evil) out[p] = pl;
  }
  return out;
}

// a nyan riding its own rocket can't be hurt
function isRocketing(pid) {
  return Object.values(state.rockets).some((rocket) => rocket.by === pid);
}

function graceOver(t) {
  return t >= state.roundStart + GRACE_TIME;
}

// pick who each rocket chases and drop old rockets and blasts
function updateRockets(t) {
  for (const rid of Object.keys(state.rockets)) {
    const rocket = state.rockets[rid];
    if (!(rocket.by in state.players) || state.phase !== "round" || t - rocket.at > ROCKET_LIFE) {
      delete state.rockets[rid];
      continue;
    }
    if (t - rocket.at >= ROCKET_UP) {
      const foes = enemiesOf(rocket.by);
      if (!(rocket.target in foes)) {
        // chase whoever is nearest to the launch spot
        let nearest = null;
        let nearestDist = Infinity;
        for (const [p, foe] of Object.entries(foes)) {
          const dist = ((foe.x ?? 0) - rocket.x) ** 2 + ((foe.y ?? 0) - rocket.y) ** 2;
          if (dist < nearestDist) {
            nearest = p;
            nearestDist = dist;
          }
        }
        rocket.target = nearest;
      }
    }
  }
  while (state.blasts.length && t - state.blasts[0].at > BLAST_LIFE) state.blasts.shift();
}

// wipe traps, rockets and hit guards between rounds
function clearRoundObjects() {
  state.spikes = newDict();
  state.bombs = newDict();
  state.rockets = newDict();
  state.blasts = [];
  state.alerts = [];
  state.lastHit = newDict();
}

function startIntermission() {
  state.phase = "intermission";
  state.phaseEnd = now() + INTER_TIME;
  console.log("[GAME] State: INTERMISSION (30s)");
}

// take the round fee from one player
async function chargePlayer(pid) {
  const player = state.players[pid];
  if (!player) return;
  const fid = player.fid;
  const pin = state.sessions[player.sid]?.pin;
  const roundNo = state.currentRound + 1;
  let ok = false;
  let message = "no pin set";
  if (pin) {
    ({ ok, message } = await transfer(fid, pin, ROUND_COST, `party crashers round ${roundNo}`));
  }
  const after = state.players[pid]; // they may have left while we waited
  if (after) {
    after.paid = ok;
    after.payMsg = ok ? "" : message || "payment failed";
  }
  console.log(`[PAY] ${fid} round fee ${ok ? "paid" : "failed: " + message}`);
}

// starts character select and waits for the round fees to be paid
async function startSelect() {
  const here = herePlayers();
  if (Object.keys(here).length < 2) {
    state.phase = "lobby";
    state.killerId = null;
    console.log("!! not enough active players - character select cancelled!!");
    return;
  }
  for (const pl of Object.values(state.players)) {
    pl.char = null;
    pl.paid = false;
  }
  const charges = [];
  for (const [pid, pl] of Object.entries(here)) {
    // null means still waiting on formbar
    pl.paid = ROUND_COST > 0 ? null : true;
    pl.payMsg = "";
    if (ROUND_COST > 0) charges.push(chargePlayer(pid));
  }
  state.killerId = pickKiller(here);
  const killer = state.players[state.killerId];
  console.log(`[GAME] preselected evil: ${killer.name} (malice ${getMalice(killer.fid)})`);
  state.phase = "select";
  state.phaseEnd = now() + SELECT_TIME;
  console.log("[GAME] State: CHARACTER_SELECT (30s)");
  await Promise.all(charges);
}

function startRound() {
  state.pendingEnd = 0;
  state.lmsSet = false;
  state.lmsNoticeUntil = 0;

  // only players who paid can play
  const eligible = newDict();
  for (const [pid, pl] of Object.entries(herePlayers())) {
    if (pl.paid) eligible[pid] = pl;
  }
  if (Object.keys(eligible).length < 2) {
    state.roundPlayers.clear();
    state.killerId = null;
    state.phase = "lobby";
    console.log(`!! not enough active players - round cancelled!! [${playerActivity()}]`);
    return;
  }
  state.roundPlayers = new Set(Object.keys(eligible));
  const roster = Object.entries(eligible).map(([pid, pl]) => `${pid}:${pl.name ?? "?"}`).join(", ");
  console.log(`[ROUND] roster: ${roster} | all players: ${playerActivity()}`);

  // players who did not pick get a random character
  const ids = state.characters.map((c) => c.id);
  for (const pl of Object.values(eligible)) {
    if (!ids.includes(pl.char)) {
      const pool = state.characters.filter(
        (c) => !["nyan", "bear5"].includes(c.id) && (!c.dev || isAdmin(pl.fid))
      );
      const choices = pool.length ? pool : state.characters;
      pl.char = choices[Math.floor(Math.random() * choices.length)].id;
    }
  }
  for (const pl of Object.values(eligible)) {
    pl.alive = true;
    pl.hp = pl.maxhp ?? 100;
    pl.stunUntil = 0;
  }
  clearRoundObjects();

  // use a random killer if the preselected one is not playing
  if (!state.roundPlayers.has(state.killerId)) {
    const candidates = newDict();
    for (const pid of state.roundPlayers) candidates[pid] = state.players[pid];
    state.killerId = pickKiller(candidates);
    console.log(`!! fallback - ${state.players[state.killerId].name} is EVIL LUX!!`);
  }
  setMalice(state.players[state.killerId].fid, 0); // killer starts over
  state.currentRound += 1;
  state.phase = "round";
  state.roundStart = now();
  // more players means a longer round
  const length = Math.min(ROUND_MAX, ROUND_BASE + ROUND_PER_PLAYER * state.roundPlayers.size);
  state.phaseEnd = state.roundStart + length;
  state.result = null;
  console.log(`!! round ${state.currentRound} starts - ${state.players[state.killerId].name} is EVIL LUX!!`);
}

function endRound(winner) {
  if (state.phase !== "round") return;
  state.currentRound += 1;
  for (const pl of Object.values(state.players)) {
    pl.alive = true;
    pl.hp = pl.maxhp ?? 100;
    pl.stunUntil = 0;
    pl.char = null;
  }
  clearRoundObjects();
  const killer = state.killerId ? state.players[state.killerId] : null;
  state.result = { winner, killer_name: killer ? killer.name : "???" };
  // survivors gain malice
  for (const pid of state.roundPlayers) {
    if (state.players[pid] && pid !== state.killerId) {
      addMalice(state.players[pid].fid, MALICE_PER_ROUND);
    }
  }
  state.killerId = null;
  state.roundPlayers.clear();
  state.phase = "intermission";
  state.phaseEnd = now() + INTER_TIME;
  console.log(`!! round ${state.currentRound} over - ${winner} win!! intermission!!`);
}

function backToLobby(message) {
  state.phase = "lobby";
  state.killerId = null;
  console.log(message);
}

// checks every timer, runs at the start of each request since vercel has no background loop
async function tick() {
  const t = now();

  // drop players who stopped sending updates
  for (const pid of Object.keys(state.players)) {
    if (t - state.players[pid].last > TIMEOUT) {
      console.log(`!! ${state.players[pid].name} timed out`);
      delete state.players[pid];
      delete state.lastHit[pid];
    }
  }
  for (const id of Object.keys(state.spikes)) {
    if (t - state.spikes[id].at > SPIKE_LIFE) delete state.spikes[id];
  }
  while (state.alerts.length && t - state.alerts[0].at > 5) state.alerts.shift();
  while (state.chatLog.length && t - state.chatLog[0].at > CHAT_LIFE) state.chatLog.shift();
  if (!state.players[state.killerId]) state.killerId = null;

  const here = herePlayers();
  const enoughPlayers = Object.keys(here).length >= 2;

  if (state.phase === "lobby") {
    if (enoughPlayers) startIntermission();
  } else if (state.phase === "intermission") {
    if (!enoughPlayers) backToLobby("!! not enough players - back to lobby!!");
    else if (t >= state.phaseEnd) await startSelect();
  } else if (state.phase === "select") {
    // start early once everyone picked and every payment came back
    const allPicked = Object.entries(here).every(
      ([pid, pl]) => pid === state.killerId || pl.paid === false || pl.char
    );
    const stillPaying = Object.values(here).some((pl) => pl.paid === null);
    if (!enoughPlayers) {
      backToLobby("!! not enough players - back to lobby!!");
    } else if (allPicked && !stillPaying) {
      console.log("[GAME] everyone picked - starting early!!");
      startRound();
    } else if (t >= state.phaseEnd) {
      startRound();
    }
  } else if (state.phase === "round") {
    tickRound(t);
  }
}

// timers while a match is running
function tickRound(t) {
  const stillHere = [...state.roundPlayers].filter((pid) => pid in state.players);
  if (stillHere.length < 2) {
    for (const pl of Object.values(state.players)) {
      pl.alive = true;
      pl.hp = pl.maxhp ?? 100;
    }
    state.roundPlayers.clear();
    backToLobby("!! not enough players - back to lobby!!");
    return;
  }

  let killer = state.players[state.killerId];
  // a killer who stopped sending updates counts as gone
  if (killer && t - (killer.last ?? 0) > 10) {
    console.log(`!! ${killer.name ?? "EVIL"} went stale... round ending!!`);
    killer = null;
  }
  if (killer) {
    state.pendingEnd = 0;
    state.lastKillerName = killer.name ?? "EVIL";
  } else {
    // warn first, then end the round
    if (!state.pendingEnd) {
      state.pendingEnd = t + 5;
      console.log(`!! ${state.lastKillerName} left... round ending!!`);
    }
    if (t >= state.pendingEnd) {
      state.pendingEnd = 0;
      endRound("survivors");
    }
    return;
  }

  if (killer.alive === false || (killer.hp ?? 100) <= 0) {
    endRound("survivors"); // killer died
  } else if (t >= state.phaseEnd) {
    endRound("survivors"); // time ran out
  } else {
    const survivors = Object.keys(alivePlayers()).filter((pid) => pid !== state.killerId);
    if (!survivors.length) {
      endRound("killer"); // everyone died
    } else if (survivors.length === 1 && !state.lmsSet) {
      // last man standing, a fight to the end
      state.lmsSet = true;
      const char = state.players[survivors[0]].char;
      state.phaseEnd = t + (LMS_DURATIONS[char] ?? LMS_DEFAULT);
      state.lmsNoticeUntil = t + 5;
      console.log(`!! LMS (${char} vs evil) - fight!!`);
    }
  }
}

module.exports = {
  tick, startIntermission, startSelect, startRound, endRound, herePlayers,
  enemiesOf, isRocketing, graceOver, updateRockets,
};
