// who gets the mod menu and the dev characters
const fs = require("fs");
const path = require("path");
const { ROOT, FORMBAR_MODE } = require("./config");

// admins.txt holds one formbar id per line, lines starting with # are ignored
function loadAdmins() {
  try {
    const text = fs.readFileSync(path.join(ROOT, "admins.txt"), "utf8");
    const lines = text.split("\n").map((line) => line.trim());
    return new Set(lines.filter((line) => line && !line.startsWith("#")));
  } catch (err) {
    return new Set();
  }
}

// everyone is a mod in local testing
function isAdmin(fid) {
  return !FORMBAR_MODE || loadAdmins().has(fid);
}

module.exports = { isAdmin };
