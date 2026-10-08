// malice decides who becomes the killer next round
const fs = require("fs");
const path = require("path");
const state = require("./state");
const { ROOT, FORMBAR_MODE } = require("./config");

const MALICE_FILE = path.join(ROOT, "malice.json");

// load saved totals once when the server starts
try {
  Object.assign(state.malice, JSON.parse(fs.readFileSync(MALICE_FILE, "utf8")));
} catch (err) {
  // no file yet, start fresh
}

function getMalice(fid) {
  return state.malice[fid] ?? 0;
}

function setMalice(fid, amount) {
  state.malice[fid] = Math.max(0, amount);
  if (!FORMBAR_MODE) return; // local testing stays off disk
  if (process.env.VERCEL) return; // vercel disks are read only, so totals stay in memory
  try {
    fs.writeFileSync(MALICE_FILE, JSON.stringify(state.malice));
  } catch (err) {
    console.log("!! could not save malice.json");
  }
}

function addMalice(fid, amount) {
  setMalice(fid, getMalice(fid) + amount);
}

// the player with the most malice becomes the killer, ties are random
function pickKiller(candidates) {
  const ids = Object.keys(candidates);
  const best = Math.max(...ids.map((pid) => getMalice(candidates[pid].fid)));
  const top = ids.filter((pid) => getMalice(candidates[pid].fid) === best);
  return top[Math.floor(Math.random() * top.length)];
}

module.exports = { getMalice, setMalice, addMalice, pickKiller };
