// the one vercel function that handles every api call
// it has to be a single function so all players share the same game state
const routes = require("../lib/routes");
const game = require("../lib/game");
const { sendJson, readJson } = require("../lib/http");
const { FORMBAR_MODE, FORMBAR_ADDRESS } = require("../lib/config");

console.log(`[CONFIG] FORMBAR_MODE is ${FORMBAR_MODE ? "ON" : "OFF"}`);
if (!FORMBAR_MODE) {
  console.log("!! FORMBAR_MODE is off - no formbar, no digipogs, everyone is a mod. local testing only!! (add ?name=bob to the page url to pick a name)");
} else if (!FORMBAR_ADDRESS) {
  console.log("!! FORMBAR_ADDRESS is not set, nobody can log in!!");
}

module.exports = async function handler(req, res) {
  try {
    const path = new URL(req.url, "http://localhost").pathname;
    const route = routes[`${req.method} ${path}`];
    if (!route) return sendJson(res, { error: "nope!!" }, 404);

    // there is no background loop on vercel, so check the round timers here
    await game.tick();
    const data = req.method === "POST" ? await readJson(req) : {};
    await route(req, res, data);
  } catch (err) {
    console.log("!! request oops:", err);
    if (!res.headersSent) sendJson(res, { error: "server error" }, 500);
  }
};
