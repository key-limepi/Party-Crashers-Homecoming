// logins are kept in a signed cookie so every vercel instance can read them
const crypto = require("crypto");
const state = require("./state");
const { getCookie } = require("./http");
const { now } = require("./util");

// logins last a week
const SESSION_SECONDS = 7 * 24 * 60 * 60;

// every instance needs the same secret, set SESSION_SECRET in your env vars
const SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
if (!process.env.SESSION_SECRET) {
  console.log("!! SESSION_SECRET is not set, logins will break on vercel!!");
}

function makeSignature(body) {
  return crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
}

// turn login data into a cookie value
function signSession(data) {
  const withExpiry = { ...data, exp: now() + SESSION_SECONDS };
  const body = Buffer.from(JSON.stringify(withExpiry)).toString("base64url");
  return `${body}.${makeSignature(body)}`;
}

// read a cookie value back into login data, or null if it was changed
function readSession(value) {
  const [body, signature] = String(value || "").split(".");
  if (!body || !signature) return null;
  const expected = Buffer.from(makeSignature(body));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString());
  } catch (err) {
    return null;
  }
}

// the logged in user for this request, or null
// the pin is never put in the cookie, it only lives in memory
function sessionFromRequest(req) {
  const data = readSession(getCookie(req, "pch_sid"));
  if (!data || !data.sid || !data.fid || !data.name) return null;
  if (!(data.exp > now())) return null; // expired
  if (!state.sessions[data.sid]) {
    state.sessions[data.sid] = { sid: data.sid, fid: data.fid, name: data.name, pin: null };
  }
  return state.sessions[data.sid];
}

module.exports = { signSession, sessionFromRequest, SESSION_SECONDS };
