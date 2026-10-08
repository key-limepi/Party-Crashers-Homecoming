// helpers for reading requests and sending replies
const { APP_URL } = require("./config");

function sendJson(res, obj, code = 200) {
  res.statusCode = code;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(obj));
}

function redirect(res, url, cookie) {
  res.statusCode = 302;
  res.setHeader("Location", url);
  if (cookie) res.setHeader("Set-Cookie", cookie);
  res.end();
}

// read a single cookie value, or undefined
function getCookie(req, name) {
  for (const part of (req.headers.cookie || "").split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return undefined;
}

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = forwarded ? forwarded.split(",")[0].trim() : req.socket.remoteAddress || "";
  return ip.replace(/^::ffff:/, "");
}

// the public address of this app, from the url env var or the request itself
function appUrl(req) {
  if (APP_URL) return APP_URL;
  const proto = (req.headers["x-forwarded-proto"] || "http").split(",")[0].trim();
  return `${proto}://${req.headers.host || "localhost"}`;
}

// read the raw body text, ignoring anything huge
async function readText(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 100000) break;
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

// read a json body, always returns an object
async function readJson(req) {
  let body;
  try {
    body = req.body; // vercel may have parsed it already
  } catch (err) {
    return {};
  }
  if (body === undefined) body = await readText(req);
  if (Buffer.isBuffer(body)) body = body.toString("utf8");
  if (typeof body === "string") {
    try {
      body = JSON.parse(body || "{}");
    } catch (err) {
      return {};
    }
  }
  return body && typeof body === "object" && !Array.isArray(body) ? body : {};
}

module.exports = { sendJson, redirect, getCookie, clientIp, appUrl, readJson };
