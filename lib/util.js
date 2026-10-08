// small helpers used all over the server

// current time in seconds
function now() {
  return Date.now() / 1000;
}

// turn a number or numeric text into a number, anything else becomes not a number
function toNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") return Number(value);
  return NaN;
}

// turn a value into a whole number, or use the fallback
function toInt(value, fallback) {
  const n = toNumber(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

// keep a number between a min and a max
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// an object with no prototype, so ids like "constructor" are safe keys
function newDict() {
  return Object.create(null);
}

// the key whose entry has the smallest "at" time
function oldestKey(dict) {
  let oldest = null;
  for (const key of Object.keys(dict)) {
    if (oldest === null || dict[key].at < dict[oldest].at) oldest = key;
  }
  return oldest;
}

module.exports = { now, toNumber, toInt, clamp, newDict, oldestKey };
