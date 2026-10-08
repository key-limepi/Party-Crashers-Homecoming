// one function for every api route, each takes (req, res, data)
const { randomBytes } = require("crypto");
const state = require("./state");
const game = require("./game");
const { isClean } = require("./filter");
const { isAdmin } = require("./admins");
const { formbarUser, transfer } = require("./formbar");
const { getMalice, setMalice, addMalice } = require("./malice");
const { sendJson, redirect, getCookie, clientIp, appUrl } = require("./http");
const { now, toNumber, toInt, clamp, newDict, oldestKey } = require("./util");
const {
  FORMBAR_MODE, FORMBAR_CLIENT_URL, DIGIPOGS_ON, ROUND_COST, MALICE_PRICE, MALICE_PER_BUY,
  GRACE_TIME, SPIKE_MAX, BOMB_MAX, TOSS_MAX, ROCKET_DMG, ROCKET_RADIUS, ROCKET_UP,
  ROCKET_GAP, ROCKET_MAX, TOUCH_COOLDOWN, STUN_IFRAMES, CHAT_COOLDOWN, MUTE_TIME,
  QUICK_CHAT, STATE_KEYS, LOCAL_SESSION,
} = require("./config");

// shortcuts for the shared state
const { players } = state;

// the logged in formbar user for this browser, or null
function getSession(req) {
  if (!FORMBAR_MODE) return LOCAL_SESSION; // no login at all in local testing
  return state.sessions[getCookie(req, "pch_sid")] || null;
}

function isAlive(pl) {
  return pl.alive !== false;
}

// distance between two players
function distance(a, b) {
  return Math.hypot((a.x ?? 0) - (b.x ?? 0), (a.y ?? 0) - (b.y ?? 0));
}

// ---------- login ----------

async function login(req, res) {
  if (!FORMBAR_MODE) return redirect(res, "/"); // nothing to log into
  const token = new URL(req.url, "http://localhost").searchParams.get("token");
  if (!token) {
    // first visit, send them to formbar and ask it to come back with a token
    const back = encodeURIComponent(`${appUrl(req)}/login`);
    return redirect(res, `${FORMBAR_CLIENT_URL}/oauth?redirectURL=${back}`);
  }
  const user = await formbarUser(token);
  if (!user) return sendJson(res, { error: "formbar login failed!!" }, 401);
  const sid = randomBytes(16).toString("hex");
  state.sessions[sid] = { sid, fid: user.fid, name: user.name, pin: null };
  const secure = appUrl(req).startsWith("https") ? "; Secure" : "";
  redirect(res, "/", `pch_sid=${sid}; Path=/; HttpOnly; SameSite=Lax${secure}`);
}

async function logout(req, res) {
  if (!FORMBAR_MODE) return redirect(res, "/");
  const sess = getSession(req);
  if (sess) delete state.sessions[sess.sid];
  redirect(res, "/", "pch_sid=; Path=/; Max-Age=0");
}

async function me(req, res) {
  const sess = getSession(req);
  sendJson(res, {
    logged_in: Boolean(sess),
    formbar_mode: FORMBAR_MODE,
    name: sess ? sess.name : null,
    has_pin: Boolean(sess && sess.pin),
    needs_pin: DIGIPOGS_ON,
    round_cost: ROUND_COST,
    malice_price: MALICE_PRICE,
    malice_per_buy: MALICE_PER_BUY,
  });
}

// the pin stays on the server and is never sent back
async function pin(req, res, data) {
  const sess = getSession(req);
  const text = String(data.pin ?? "").trim();
  if (!sess) return sendJson(res, { ok: false, reason: "log in first!!" }, 401);
  if (!/^\d{4,8}$/.test(text)) {
    return sendJson(res, { ok: false, reason: "pin should be 4 to 8 digits!!" });
  }
  sess.pin = text;
  sendJson(res, { ok: true });
}

// ---------- joining and leaving ----------

async function join(req, res, data) {
  const sess = getSession(req);
  if (!sess) return sendJson(res, { error: "log in with formbar!!", login: true }, 401);
  if (DIGIPOGS_ON && !sess.pin) {
    return sendJson(res, { error: "enter your digipog pin!!", pin: true }, 401);
  }
  if (state.phase === "round") return sendJson(res, { error: "match running!!" }, 403);

  const pid = randomBytes(4).toString("hex");
  const tab = String(data.tab || "").slice(0, 16);
  let fid = sess.fid;
  let name = sess.name;

  if (FORMBAR_MODE) {
    // only one tab per account
    for (const pl of Object.values(players)) {
      if (pl.fid === fid && pl.tab !== tab && now() - (pl.last ?? 0) <= 10) {
        return sendJson(res, { error: "already online in another tab!!" }, 403);
      }
    }
    // a rejoin replaces the old player and keeps the killer role
    for (const oldId of Object.keys(players)) {
      if (players[oldId].fid !== fid) continue;
      if (state.killerId === oldId) state.killerId = pid;
      delete players[oldId];
    }
  } else {
    // local testing: every tab is its own player, ?name=bob picks a name
    fid = `${fid}:${tab}`;
    name = String(data.name || "").trim().slice(0, 20) || `guest ${tab.slice(0, 3)}`;
    const taken = new Set(Object.values(players).map((pl) => pl.name));
    const base = name;
    let n = 1;
    while (taken.has(name)) {
      n += 1;
      name = `${base} ${n}`;
    }
  }

  players[pid] = {
    fid, sid: sess.sid, tab, name,
    char: null, maxhp: 100, hp: 100, alive: true,
    paid: false, payMsg: "",
    x: 60, y: 100, facing: 1,
    moving: false, onGround: false, invis: false, m1: true, stunned: false,
    pull: false, away: false, cower: false, windup: false, pose: null, dashing: false,
    stunUntil: 0,
    last: now(),
  };
  console.log(`!! ${name} joined (${pid})`);
  sendJson(res, {
    id: pid, fid, name,
    mod: isAdmin(fid),
    muted: Math.max(0, Math.trunc((state.mutedFids[fid] ?? 0) - now())),
  });
}

async function leave(req, res, data) {
  const gone = players[data.id];
  delete players[data.id];
  delete state.lastHit[data.id];
  if (gone) console.log(`!! ${gone.name} left`);
  sendJson(res, { ok: true });
}

async function afk(req, res, data) {
  const pl = players[data.id];
  if (pl) {
    const wasAway = Boolean(pl.away);
    pl.away = Boolean(data.away);
    pl.last = now();
    if (wasAway !== pl.away) console.log(`[AFK] ${pl.name} (${data.id}) ${wasAway} -> ${pl.away}`);
  }
  sendJson(res, { ok: Boolean(pl) });
}

// ---------- state updates ----------

// every client posts its own position and status here
async function postState(req, res, data) {
  const pl = players[data.id];
  if (pl) {
    for (const key of STATE_KEYS) {
      if (key in data) pl[key] = data[key];
    }
    // only trust hp and alive from the current round
    if (data.r === state.currentRound) {
      const maxhp = clamp(toInt(data.maxhp, 0) || 100, 1, 1000);
      const oldMax = pl.maxhp ?? 100;
      pl.maxhp = maxhp;
      const posted = toInt(data.hp, pl.hp);
      if (maxhp > oldMax) {
        pl.hp = clamp(posted, 0, maxhp); // a fresh max means a fresh hp
      } else if ("hp" in data) {
        pl.hp = Math.max(0, Math.min(pl.hp, posted)); // clients can only lower hp
      }
      if ("alive" in data) pl.alive = Boolean(data.alive);
    }
    pl.last = now();
  }
  sendJson(res, { ok: true });
}

async function heal(req, res, data) {
  const pl = players[data.id];
  if (!pl || !isAlive(pl)) return sendJson(res, { ok: false });
  const amount = Math.max(0, toInt(data.amount, 0));
  const cap = Math.max(1, toInt(data.max, 100));
  pl.hp = clamp((pl.hp ?? 100) + amount, 0, cap);
  pl.last = now();
  sendJson(res, { ok: true, hp: pl.hp });
}

// ---------- traps ----------

async function spike(req, res, data) {
  const t = now();
  const player = players[data.id];
  if (data.action === "place" && player && data.id === state.killerId) {
    const x = toNumber(data.x ?? 0);
    const y = toNumber(data.y ?? 0);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return sendJson(res, { ok: false, reason: "bad spot" });
    }
    // too many spikes means the oldest one goes
    while (Object.keys(state.spikes).length >= SPIKE_MAX) delete state.spikes[oldestKey(state.spikes)];
    state.spikeSeq += 1;
    const id = `s${state.spikeSeq}`;
    state.spikes[id] = { x, y, by: player.name, at: t };
    return sendJson(res, { ok: true, spike: { ...state.spikes[id], id } });
  }
  if (data.action === "trip" && data.spike in state.spikes) {
    const tripped = state.spikes[data.spike];
    delete state.spikes[data.spike];
    state.alerts.push({ x: tripped.x, y: tripped.y, at: t });
    console.log(`!! ${player ? player.name : "???"} tripped a spike!!`);
    return sendJson(res, { ok: true });
  }
  sendJson(res, { ok: false });
}

// tails bombs, thrown through the air or placed on the floor
async function bomb(req, res, data) {
  const t = now();
  const player = players[data.id];
  const isTails = player && state.phase === "round" && player.char === "tails";

  if (data.action === "throw" && isTails) {
    const x = toNumber(data.x ?? 0);
    const y = toNumber(data.y ?? 0);
    const vx = toNumber(data.vx ?? 0);
    const vy = toNumber(data.vy ?? 0);
    if (![x, y, vx, vy].every(Number.isFinite)) {
      return sendJson(res, { ok: false, reason: "bad throw" });
    }
    while (Object.keys(state.bombTosses).length >= TOSS_MAX) {
      delete state.bombTosses[oldestKey(state.bombTosses)];
    }
    state.bombTossSeq += 1;
    const id = `t${state.bombTossSeq}`;
    const toss = { id, x, y, vx, vy, by: player.name, at: t };
    state.bombTosses[id] = toss;
    return sendJson(res, { ok: true, toss });
  }

  if (data.action === "place" && isTails) {
    const x = toNumber(data.x ?? 0);
    const y = toNumber(data.y ?? 0);
    // nothing off the map
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < -400 || x > 3300 || y < -2000 || y > 2600) {
      return sendJson(res, { ok: false, reason: "bad spot" });
    }
    while (Object.keys(state.bombs).length >= BOMB_MAX) delete state.bombs[oldestKey(state.bombs)];
    state.bombSeq += 1;
    const id = `b${state.bombSeq}`;
    state.bombs[id] = { x, y, by: player.name, at: t };
    return sendJson(res, { ok: true, bomb: { ...state.bombs[id], id } });
  }

  if (data.action === "trip" && data.bomb in state.bombs) {
    delete state.bombs[data.bomb];
    // only the killer is hurt by bombs
    if (data.id === state.killerId && player) {
      player.hp = Math.max(0, (player.hp ?? 250) - 30);
      player.stunUntil = Math.max(player.stunUntil ?? 0, t + 5);
      const push = toNumber(data.dx ?? 0) || 0;
      player.kb = { x: -push, y: -0.4, at: t, s: 2 };
      if (player.hp <= 0) player.alive = false;
      console.log(`!! ${player.name} ate a bomb!!`);
    }
    return sendJson(res, { ok: true });
  }
  sendJson(res, { ok: false });
}

// nyan rockets, dev only
async function rocket(req, res, data) {
  const t = now();
  const pid = data.id;
  const player = players[pid];
  const allowed = player && state.phase === "round" && state.roundPlayers.has(pid)
    && isAlive(player) && (player.hp ?? 100) > 0
    && player.char === "nyan" && isAdmin(player.fid);
  if (!allowed) return sendJson(res, { ok: false });

  if (data.action === "launch") {
    const x = toNumber(data.x ?? 0);
    const y = toNumber(data.y ?? 0);
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < -600 || x > 3600 || y < -3000 || y > 3000) {
      return sendJson(res, { ok: false, reason: "bad launch" });
    }
    const tooSoon = !game.graceOver(t) || t - (state.lastRocket[pid] ?? 0) < ROCKET_GAP;
    if (tooSoon || Object.keys(state.rockets).length >= ROCKET_MAX) {
      return sendJson(res, { ok: false, reason: "not yet" });
    }
    state.lastRocket[pid] = t;
    state.rocketSeq += 1;
    const id = `r${state.rocketSeq}`;
    state.rockets[id] = { id, x, y, by: pid, name: player.name, at: t, target: null };
    console.log(`!! ${player.name} launched a rocket!!`);
    return sendJson(res, { ok: true, rocket: { ...state.rockets[id], age: 0 } });
  }

  if (data.action === "detonate") {
    const rocketData = state.rockets[data.rocket];
    const x = toNumber(data.x ?? 0);
    const y = toNumber(data.y ?? 0);
    const badRocket = !rocketData || rocketData.by !== pid || t - rocketData.at < ROCKET_UP * 0.8;
    const badSpot = !Number.isFinite(x) || !Number.isFinite(y) || Math.abs(x) > 6000 || Math.abs(y) > 6000;
    if (badRocket || badSpot) return sendJson(res, { ok: false });

    delete state.rockets[rocketData.id];
    const hitNames = [];
    for (const [victimId, victim] of Object.entries(game.enemiesOf(pid))) {
      if (game.isRocketing(victimId)) continue; // mid rocket, untouchable
      // player x and y are the top left corner, the hitbox is 28 by 60
      const dist = Math.hypot((victim.x ?? 0) + 14 - x, (victim.y ?? 0) + 30 - y);
      if (dist > ROCKET_RADIUS) continue;
      victim.hp = Math.max(0, (victim.hp ?? 100) - ROCKET_DMG);
      if (victim.hp <= 0) victim.alive = false;
      hitNames.push(victim.name);
    }
    state.blastSeq += 1;
    state.blasts.push({
      id: `x${state.blastSeq}`, x, y, r: ROCKET_RADIUS, rid: rocketData.id, by: player.name, at: t,
    });
    console.log(`!! ${player.name}'s rocket blew up, hit: ${hitNames.join(", ") || "nobody"}!!`);
    return sendJson(res, { ok: true, hit: hitNames.length });
  }
  sendJson(res, { ok: false });
}

// ---------- fighting ----------

// the killer and survivors hit each other through this route
async function hit(req, res, data) {
  const t = now();
  const attacker = players[data.id];
  const victim = players[data.victim];
  const attackerIsEvil = data.id === state.killerId;
  const victimIsEvil = data.victim === state.killerId;

  const validHit = attacker && victim && data.victim !== data.id
    && state.roundPlayers.has(data.id) && state.roundPlayers.has(data.victim)
    && attackerIsEvil !== victimIsEvil && state.phase === "round"
    && isAlive(attacker) && isAlive(victim) && game.graceOver(t);
  if (!validHit) return sendJson(res, { ok: false });

  let dmg = clamp(toInt(data.dmg, 0), 0, 100);
  if (attackerIsEvil) dmg = Math.round(dmg * 1.08);
  // survivors take 25 percent less damage in the last man standing fight
  if (state.lmsSet && !victimIsEvil) dmg = Math.floor((dmg * 3 + 3) / 4);
  const stunNumber = toNumber(data.stun ?? 0);
  let stun = clamp(Number.isNaN(stunNumber) ? 0 : stunNumber, 0, 5);

  // nyan mid rocket, nothing lands
  if (game.isRocketing(data.victim)) return sendJson(res, { ok: true });

  // stun moves need to be closer than plain hits
  const reach = stun <= 0 ? 140 : 95;
  if (distance(victim, attacker) >= reach) return sendJson(res, { ok: false });

  // a cowering survivor counters the killer
  if (attackerIsEvil && victim.cower) {
    if (t - (state.lastStun[data.id] ?? 0) >= STUN_IFRAMES) {
      attacker.stunUntil = t + 2;
      state.lastStun[data.id] = t;
    }
    const dx = (attacker.x ?? 0) - (victim.x ?? 0);
    const dy = (attacker.y ?? 0) - (victim.y ?? 0);
    const dist = Math.hypot(dx, dy) || 1;
    attacker.kb = { x: dx / dist, y: dy / dist, at: t, s: 2 };
    victim.countered = true;
    console.log(`!! ${victim.name} COUNTERED ${attacker.name}!!`);
    return sendJson(res, { ok: true });
  }

  // plain hits have a cooldown, stun moves do not
  const cooledDown = t - (state.lastHit[data.victim] ?? 0) >= TOUCH_COOLDOWN;
  if (!(stun > 0 || cooledDown)) return sendJson(res, { ok: false });

  state.lastHit[data.victim] = t;
  victim.hp = Math.max(0, (victim.hp ?? 100) - dmg);
  const stack = Boolean(data.stack);
  const kbNumber = toNumber(data.kb ?? 1);
  const knockback = clamp(Number.isNaN(kbNumber) ? 1 : kbNumber, 1, 3);

  // the killer can only be stunned once every few seconds, unless it stacks
  if (stun > 0 && victimIsEvil && !stack) {
    if (t - (state.lastStun[data.victim] ?? 0) < STUN_IFRAMES) stun = 0;
    else state.lastStun[data.victim] = t;
  }
  if (stun > 0) {
    if (stack) victim.stunUntil = Math.min(Math.max(victim.stunUntil ?? 0, t) + stun, t + 6);
    else victim.stunUntil = t + stun;
    // shove the killer back
    if (victimIsEvil) {
      const dx = (victim.x ?? 0) - (attacker.x ?? 0);
      const dy = (victim.y ?? 0) - (attacker.y ?? 0);
      const dist = Math.hypot(dx, dy) || 1;
      victim.kb = { x: dx / dist, y: dy / dist, at: t, s: stun, p: knockback };
    }
  }
  if (victim.hp <= 0) victim.alive = false;
  console.log(`!! ${attacker.name} hit ${victim.name} for ${dmg}!!`);
  sendJson(res, { ok: true });
}

// ---------- picking, buying and chat ----------

async function pick(req, res, data) {
  const player = players[data.id];
  const want = data.char;
  const character = state.characters.find((c) => c.id === want);
  const isDev = Boolean(character && character.dev);
  if (want === "bear5" && (!player || !isAdmin(player.fid))) {
    return sendJson(res, { ok: false, reason: "bear5 is dev-only!!" });
  }
  const canPick = player && data.id in game.herePlayers() && state.phase === "select"
    && character && (!isDev || isAdmin(player.fid));
  if (!canPick) return sendJson(res, { ok: false, reason: "nope!!" });
  player.char = want;
  console.log(`!! ${player.name} picked ${want}!!`);
  sendJson(res, { ok: true, char: want });
}

// buy malice during intermission
async function maliceBuy(req, res, data) {
  const player = players[data.id];
  if (!player) return sendJson(res, { ok: false, reason: "no player!!" });
  if (state.phase !== "intermission") {
    return sendJson(res, { ok: false, reason: "malice is sold during intermission only!!" });
  }
  if (MALICE_PRICE <= 0) return sendJson(res, { ok: false, reason: "malice is not for sale!!" });

  const fid = player.fid;
  if (FORMBAR_MODE) {
    const pinCode = state.sessions[player.sid]?.pin;
    if (!pinCode) return sendJson(res, { ok: false, reason: "enter your digipog pin first!!" });
    const { ok, message } = await transfer(fid, pinCode, MALICE_PRICE, "party crashers malice");
    if (!ok) return sendJson(res, { ok: false, reason: message || "payment failed!!" });
  }
  addMalice(fid, MALICE_PER_BUY);
  const total = getMalice(fid);
  console.log(`!! ${player.name} bought malice (${total})`);
  sendJson(res, { ok: true, malice: total });
}

async function chat(req, res, data) {
  const t = now();
  const player = players[data.id];
  const muteKey = (player && player.fid) || clientIp(req);
  if (t < (state.mutedFids[muteKey] ?? 0)) {
    return sendJson(res, { ok: false, reason: "muted", left: Math.trunc(state.mutedFids[muteKey] - t) });
  }
  const text = String(data.text ?? "").slice(0, 60).trim();
  const isMod = Boolean(player && isAdmin(player.fid));
  const cooledDown = t - (state.lastChat[data.id] ?? 0) >= CHAT_COOLDOWN;
  if (!(player && text && (isMod || cooledDown))) return sendJson(res, { ok: false });

  // players can only send the quick chat lines
  if (!isMod && !QUICK_CHAT.includes(text)) return sendJson(res, { ok: false, reason: "blocked" });
  if (!isMod && !isClean(text)) {
    state.mutedFids[player.fid || clientIp(req)] = t + MUTE_TIME;
    console.log(`!! ${player.name} muted 10 min!!`);
    return sendJson(res, { ok: false, reason: "muted", left: MUTE_TIME });
  }
  state.lastChat[data.id] = t;
  state.chatSeq += 1;
  state.chatLog.push({ mid: state.chatSeq, pid: data.id, name: player.name, text, at: t });
  while (state.chatLog.length > 20) state.chatLog.shift();
  sendJson(res, { ok: true });
}

// ---------- mod menu ----------

// find who a malice change is for, "me" or a player id
function malicePlayer(target, player) {
  if (target === "me") return player;
  return players[target];
}

async function mod(req, res, data) {
  const player = players[data.id];
  if (!player || !isAdmin(player.fid)) return sendJson(res, { ok: false, reason: "mods only!!" });
  const enoughPlayers = Object.keys(game.herePlayers()).length >= 2;

  switch (data.action) {
    case "killall":
      for (const [pid, pl] of Object.entries(players)) {
        if (state.roundPlayers.has(pid) && pid !== state.killerId && isAlive(pl)) {
          pl.hp = 0;
          pl.alive = false;
        }
      }
      console.log(`!! mod ${player.name} killed everyone!!`);
      break;
    case "killme":
      player.hp = 0;
      player.alive = false;
      break;
    case "healall":
      for (const pl of Object.values(players)) pl.hp = pl.maxhp ?? 100;
      break;
    case "endround":
      game.endRound(data.winner || "survivors");
      break;
    case "skipwait":
      if (state.phase === "lobby" && enoughPlayers) game.startIntermission();
      else if (state.phase === "intermission" && enoughPlayers) await game.startSelect();
      else if (state.phase === "select" && enoughPlayers) game.startRound();
      console.log("!! mod skipped the wait!!");
      break;
    case "forcestart":
      if (!enoughPlayers) return sendJson(res, { ok: false, reason: "need two active players!!" });
      for (const pl of Object.values(game.herePlayers())) pl.paid = true; // mod matches are free
      game.startRound();
      console.log("!! mod forced a match!!");
      break;
    case "makekiller": {
      if (data.target === "random" || !(data.target in players)) {
        const candidates = Object.keys(players).filter((pid) => isAlive(players[pid]));
        if (candidates.length) state.killerId = candidates[Math.floor(Math.random() * candidates.length)];
      } else {
        state.killerId = data.target;
      }
      if (state.killerId && players[state.killerId]) {
        console.log(`!! mod made ${players[state.killerId].name} EVIL!!`);
      }
      break;
    }
    case "clearspikes":
      state.spikes = newDict();
      state.bombs = newDict();
      break;
    case "givemalice":
    case "setmalice": {
      const amount = Math.max(0, toInt(data.amount, 0));
      const target = malicePlayer(data.target, player);
      if (!target) return sendJson(res, { ok: false, reason: "bad target" });
      const total = data.action === "givemalice" ? getMalice(target.fid) + amount : amount;
      setMalice(target.fid, total);
      console.log(`!! mod ${player.name} changed malice for ${data.target} (${data.action} ${amount})!!`);
      break;
    }
    case "sethealth": {
      const hp = clamp(toInt(data.hp, 100), 0, 1000);
      const targets = data.target === "all" ? Object.values(players) : [player];
      for (const pl of targets) {
        if (hp > (pl.maxhp ?? 100)) pl.maxhp = hp;
        pl.hp = hp;
        if (hp > 0) pl.alive = true;
      }
      console.log(`!! mod set hp to ${hp}!!`);
      break;
    }
    case "makedev":
    case "unmakedev":
      for (const character of state.characters) {
        if (character.id !== data.char) continue;
        character.dev = data.action === "makedev";
        console.log(`!! ${character.id} is ${character.dev ? "dev" : "public"} now!!`);
      }
      break;
    default:
      return sendJson(res, { ok: false, reason: "huh?" });
  }
  sendJson(res, { ok: true });
}

// ---------- the big poll everyone calls ----------

function round2(n) {
  return Math.round(n * 100) / 100;
}

// everything a client needs to draw the game
async function getPlayers(req, res) {
  const t = now();
  game.updateRockets(t);

  const snapshot = {};
  for (const [pid, pl] of Object.entries(players)) {
    // only send the safe fields
    const d = {};
    for (const key of ["name", "hp", "alive", "away", ...STATE_KEYS]) d[key] = pl[key] ?? null;
    d.in_round = state.phase === "round" && state.roundPlayers.has(pid);
    d.stun = round2(Math.max(0, (pl.stunUntil ?? 0) - t));
    d.maxhp = pl.maxhp ?? 100;
    d.countered = Boolean(pl.countered); // a one time flag
    delete pl.countered;
    // knockback only lasts a moment
    const kb = pl.kb;
    if (kb && t - (kb.at ?? 0) < 0.5) {
      d.kb = kb;
    } else {
      delete pl.kb;
      d.kb = null;
    }
    d.idle = Math.round((t - (pl.last ?? t)) * 10) / 10;
    d.char = pl.char ?? null;
    d.malice = getMalice(pl.fid);
    d.paid = pl.paid ?? null;
    d.pay_msg = pl.payMsg ?? "";
    snapshot[pid] = d;
  }

  const killer = state.killerId ? players[state.killerId] : null;
  const inRound = state.phase === "round";
  const killerLeft = Boolean(state.pendingEnd) && inRound;
  const lmsBanner = state.lmsNoticeUntil > t && inRound;
  const taken = new Set(Object.values(players).map((pl) => pl.char).filter(Boolean));

  sendJson(res, {
    round: state.currentRound,
    phase: state.phase,
    time_left: state.phase !== "lobby" ? Math.max(0, Math.trunc(state.phaseEnd - t)) : 0,
    grace: inRound && t < state.roundStart + GRACE_TIME,
    killer_id: state.killerId,
    killer_name: killer ? killer.name : null,
    notice: killerLeft
      ? `EVIL ${state.lastKillerName} left... round ending!!`
      : lmsBanner ? "LAST MAN STANDING!!" : null,
    notice_left: killerLeft
      ? Math.max(0, Math.trunc(state.pendingEnd - t))
      : lmsBanner ? Math.max(0, Math.trunc(state.lmsNoticeUntil - t)) : 0,
    result: state.result,
    spikes: Object.entries(state.spikes).map(([id, s]) => ({ ...s, id })),
    bombs: Object.entries(state.bombs).map(([id, b]) => ({ ...b, id })),
    tosses: Object.values(state.bombTosses).map((toss) => ({ ...toss })),
    rockets: Object.values(state.rockets).map((r) => ({ ...r, age: round2(t - r.at) })),
    blasts: state.blasts.map((b) => ({ ...b, age: round2(t - b.at) })),
    alerts: [...state.alerts],
    chat: state.chatLog.map((m) => ({ ...m })),
    chars: state.characters.map((c) => ({ ...c, taken: taken.has(c.id) })),
    players: snapshot,
  });
}

// the route table, "method /path" to its function
module.exports = {
  "GET /login": login,
  "GET /logout": logout,
  "GET /api/me": me,
  "GET /api/players": getPlayers,
  "POST /api/pin": pin,
  "POST /api/join": join,
  "POST /api/leave": leave,
  "POST /api/afk": afk,
  "POST /api/state": postState,
  "POST /api/heal": heal,
  "POST /api/spike": spike,
  "POST /api/bomb": bomb,
  "POST /api/rocket": rocket,
  "POST /api/hit": hit,
  "POST /api/pick": pick,
  "POST /api/malice/buy": maliceBuy,
  "POST /api/chat": chat,
  "POST /api/mod": mod,
};
