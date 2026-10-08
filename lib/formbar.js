// formbar login checks and digipog payments
const crypto = require("crypto");
const { FORMBAR_ADDRESS, POOL_ID } = require("./config");

// formbar's signing key, fetched once and remembered
let publicKey = null;

async function getPublicKey() {
  if (publicKey) return publicKey;
  for (const route of ["/api/v1/certs", "/api/certs", "/certs"]) {
    try {
      const res = await fetch(`${FORMBAR_ADDRESS}${route}`, { signal: AbortSignal.timeout(10000) });
      const body = await res.json();
      const pem = (body.data || body).publicKey;
      if (pem) {
        publicKey = crypto.createPublicKey(pem);
        break;
      }
    } catch (err) {
      console.log(`!! could not get formbar key at ${route}: ${err.message}`);
    }
  }
  return publicKey;
}

function decodePart(text) {
  return Buffer.from(text, "base64url");
}

// check the rs256 signature against formbar's public key
async function tokenIsReal(token) {
  const key = await getPublicKey();
  if (!key) return false;
  const [head, body, signature] = token.split(".");
  if (JSON.parse(decodePart(head)).alg !== "RS256") return false;
  return crypto.verify("RSA-SHA256", Buffer.from(`${head}.${body}`), key, decodePart(signature));
}

// check a formbar token, returns { fid, name } or null
async function formbarUser(token) {
  let claims;
  try {
    if (!(await tokenIsReal(token))) {
      console.log("!! login token was not signed by formbar");
      return null;
    }
    claims = JSON.parse(decodePart(token.split(".")[1]));
  } catch (err) {
    console.log(`!! login token is broken: ${err.message}`);
    return null;
  }
  if (!(claims.id && claims.displayName)) {
    console.log(`!! login token had no id or name, keys: ${Object.keys(claims)}`);
    return null;
  }
  return { fid: String(claims.id), name: String(claims.displayName).slice(0, 24) };
}

// send digipogs from a player to the pool, returns { ok, message }
async function transfer(fid, pin, amount, reason) {
  const payload = {
    from: parseInt(fid, 10), to: POOL_ID, amount,
    pin: parseInt(pin, 10), reason, pool: true,
  };
  let body;
  try {
    const res = await fetch(`${FORMBAR_ADDRESS}/api/v1/digipogs/transfer`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
    body = await res.json().catch(() => ({}));
  } catch (err) {
    return { ok: false, message: "could not reach formbar" };
  }
  if (!body || typeof body !== "object") body = {};
  const inner = body.data && typeof body.data === "object" ? body.data : body;
  const ok = Boolean(body.success) && inner.success !== false;
  const message = inner.message || body.message || body.error || "";
  return { ok, message: String(message).slice(0, 80) };
}

module.exports = { formbarUser, transfer };
