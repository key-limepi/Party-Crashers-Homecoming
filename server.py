#!/usr/bin/env python3
"""tiny multiplayer host
python server.py -> http://localhost:8000
python server.py 8080 -> http://localhost:8080
"""
import hashlib
import hmac
import json
import os
import random
import re
import secrets
import socket
import sys
import time
import threading
import base64
import urllib.error
import urllib.request
import urllib.parse
from http.cookies import SimpleCookie
from fnmatch import fnmatchcase
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

HERE = os.path.dirname(os.path.abspath(__file__))


def load_env():
    """read .env into os.environ (real env vars win)"""
    try:
        with open(os.path.join(HERE, ".env"), encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    os.environ.setdefault(key.strip(), val.strip().strip('"\''))
    except OSError:
        pass


load_env()
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get("PORT", 8000))

# formbar/digipog config via .env
FORMBAR_ADDRESS = os.environ.get("FORMBAR_ADDRESS", "").rstrip("/")
FORMBAR_CLIENT_URL = os.environ.get("FORMBAR_CLIENT_URL", FORMBAR_ADDRESS).rstrip("/")
APP_URL = os.environ.get("URL", "").rstrip("/")


def app_url(headers):
    """Return the public application URL for a request, or its Host header."""
    if APP_URL:
        return APP_URL
    protocol = headers.get("X-Forwarded-Proto", "http")
    if "," in protocol:
        protocol = protocol.split(",", 1)[0].strip()
    host = headers.get("Host", "localhost")
    return f"{protocol}://{host}"


_fm = (os.environ.get("FORMBAR_MODE", "true").split("#")[0].split() or ["true"])[0].strip("\"'").lower() # tolerates a trailing comment
FORMBAR_MODE = _fm not in ("0", "false", "off", "no", "n", "disabled", "disable") # off = local testing
POOL_ID = int(os.environ.get("POOL_ID", 0) or 0) # digipog destination pool
ROUND_COST = int(os.environ.get("ROUND_COST", 25)) # round cost, 0=free
if not FORMBAR_MODE:
    ROUND_COST = 0 # local testing is free
MALICE_PER_ROUND = int(os.environ.get("MALICE_PER_ROUND", 1)) # malice per round played
MALICE_PRICE = int(os.environ.get("MALICE_PRICE", 10)) # digipogs per malice purchase
MALICE_PER_BUY = int(os.environ.get("MALICE_PER_BUY", 1)) # malice gained per purchase
DIGIPOGS_ON = FORMBAR_MODE and (ROUND_COST > 0 or MALICE_PRICE > 0) # pin needed if paid
TIMEOUT = 25 # patient timeouts
ROUND_BASE = 120 # base time
ROUND_PER_PLAYER = 30 # per player
ROUND_MAX = 600
ROUND_TIME = 300 # backup time
INTER_TIME = 30 # break time
SELECT_TIME = 30 # pick time
INTRO_TIME = 12 # killer intro video
GRACE_TIME = 5 # safe start
LMS_DURATIONS = {"lux": 209.736, "sonic": 266.928, "supersonic": 266.928, "tails": 166.872, "nyan": 181.656} # anthem lengths; default 105s
TOUCH_DIST = 55 # touch range
TOUCH_DMG = 25 # hit damage
TOUCH_COOLDOWN = 1.0
SPIKE_MAX = 5 # trap cap
SPIKE_LIFE = 45 # trap rot
SPIKE_DMG = 30
ROCKET_DMG = 50 # rocket hit
ROCKET_RADIUS = 170 # blast reach
ROCKET_UP = 1.1 # climb time, same as the client
ROCKET_LIFE = 12 # stale rockets drop
ROCKET_GAP = 3.0 # launch spam guard
BLAST_LIFE = 4 # blasts linger so everyone sees them


players = {} # player list
spikes = {} # trap list
bombs = {} # tails traps
bomb_tosses = {} # airborne tails bomb throws
rockets = {} # nyan rockets in the air
blasts = [] # fresh rocket blasts, everyone shakes
last_rocket = {} # launch guard
alerts = [] # ping list
announces = [] # mod shouts
# pick pair
CHARACTERS = [
    {"id": "evil", "name": "EVIL LUX", "killer": True},
    {"id": "lux", "name": "LUX"},
    {"id": "toko", "name": "TOKO"},
    {"id": "sonic", "name": "SONIC"},
    {"id": "tails", "name": "TAILS"},
    {"id": "supersonic", "name": "SUPER SONIC", "dev": True},
    {"id": "nyan", "name": "NYAN CYAT", "dev": True},
    {"id": "bear5", "name": "BEAR5", "dev": True, "killer": True},
]
chat_log = [] # chat list
last_chat = {} # spam guard
last_hit = {} # hit guard
last_stun = {} # stun guard
STUN_IFRAMES = 3.0 # stun gap
chat_seq = 0
CHAT_LIFE = 12 # chat life
CHAT_COOLDOWN = 1.5
MUTE_TIME = 600 # mute time
QUICK_CHAT = (
    "OK!", "what a save!", "run away!!!", "help me!!",
    "thanks!!", "sorry!!", "nice!!", "wow!!",
    "good luck!!", "killer here!!", "split up!!", "gg!!",
) # only these may post
muted_fids = {} # mute list
formbar_cache = {} # formbar's public key
LOCAL_SESSION = {"sid": "local", "fid": "local", "name": "guest", "pin": None} # stands in for a login when FORMBAR_MODE is off
sessions = {} # cookie -> session data
MALICE_FILE = os.path.join(HERE, "malice.json")
malice = {} # fid -> malice totals


def load_admins():
    """mod menu ids"""
    try:
        with open(os.path.join(HERE, "admins.txt"), encoding="utf-8") as f:
            return {l.strip() for l in f if l.strip() and not l.strip().startswith("#")}
    except OSError:
        return set()

def is_admin(fid):
    """mod menu + dev characters, everyone is a mod in local testing"""
    return not FORMBAR_MODE or fid in load_admins()


# word filter
EXTRA_FILTER = [
    {"id": "shit", "match": "shit|shits|shitty|shite",
     "tags": ["general"], "severity": 2, "exceptions": ["shiitake", "shiitakes"]},
    {"id": "bitch", "match": "bitch|bitches|bitchy",
     "tags": ["general"], "severity": 2},
    {"id": "poop", "match": "poop|poopy|pooped|pooping|pooper",
     "tags": ["general"], "severity": 1},
]
SEP = r"[\W_]*" # split letters
# list files
FILTER_WORDS = set()
FILTER_BLOBS = set()
LEET = str.maketrans({"@": "a", "4": "a", "8": "b", "3": "e", "1": "i",
                      "!": "i", "0": "o", "$": "s", "5": "s", "7": "t", "+": "t"})


def _norm_words(text):
    s = str(text).lower().translate(LEET)
    s = re.sub(r"(.)\1{2,}", r"\1", s) # squash repeats
    return [w for w in re.split(r"[^a-z0-9]+", s) if w]


try:
    for _fn in ("slurs.txt", "family-friendly.txt", "l33t-speak.txt"):
        with open(os.path.join(HERE, "blacklist", _fn), encoding="utf-8", errors="replace") as _f:
            for _line in _f:
                _sq = "".join(_norm_words(_line))
                if not _sq:
                    continue
                (FILTER_BLOBS if len(_sq) >= 5 else FILTER_WORDS).add(_sq)
    print(f"folder lists loaded!! {len(FILTER_WORDS)} words + {len(FILTER_BLOBS)} phrases!!", flush=True)
except OSError as _err:
    print(f"!! folder lists missing ({_err})!!", flush=True)


def _folder_hit(text):
    words = _norm_words(text)
    if any(w in FILTER_WORDS for w in words):
        return True
    blob = "".join(words)
    n = len(blob)
    for L in range(5, min(n, 32) + 1):
        for i in range(n - L + 1):
            if blob[i:i + L] in FILTER_BLOBS:
                return True
    return False
BLACKLIST = []
try:
    with open(os.path.join(HERE, "blacklist.json"), encoding="utf-8") as _f:
        _entries = list(json.load(_f)) + EXTRA_FILTER
        for _entry in _entries:
            _alts = [a.strip().lower() for a in str(_entry.get("match", "")).split("|") if a.strip()]
            _exc = [e.strip().lower() for e in (_entry.get("exceptions") or []) if str(e).strip()]
            for _alt in _alts:
                _bare = _alt.replace("*", "").replace(" ", "")
                _bounded = (" " not in _alt and len(_bare) < 6
                            and not _alt.startswith("*") and not _alt.endswith("*"))
                _parts = []
                for _ch in _alt:
                    _parts.append(".*" if _ch == "*" else re.escape(_ch))
                _body = SEP.join(_parts)
                if _bounded:
                    # loose match
                    _f, _l = re.escape(_alt[0]), re.escape(_alt[-1])
                    _body = (r"(?:\b(?=" + _f + r")|(?<=" + _f + r"))" + _body +
                             r"(?:(?<=" + _l + r")\b|(?=" + _l + r"))")
                BLACKLIST.append((re.compile(_body), _exc))
    print(f"blacklist loaded!! {len(BLACKLIST)} patterns!!", flush=True)
except FileNotFoundError:
    print("!! no blacklist.json - chat unfiltered!!", flush=True)
except (ValueError, OSError) as _err:
    print(f"!! blacklist broken ({_err}) - chat unfiltered!!", flush=True)


def _excused(text, words, excs):
    for e in excs:
        if " " in e:
            if re.search(re.escape(e).replace(r"\*", ".*"), text):
                return True
        elif any(fnmatchcase(w, e) for w in words if w):
            return True
    return False


def is_clean(text):
    """word check"""
    if _folder_hit(text):
        return False
    low = str(text).lower()
    words = re.split(r"[^a-z0-9]+", low)
    for pat, excs in BLACKLIST:
        if pat.search(low) and not _excused(low, words, excs):
            return False
    return True
spike_seq = 0
bomb_seq = 0
bomb_toss_seq = 0
rocket_seq = 0
blast_seq = 0
lock = threading.Lock()

phase = "lobby" # phase flow
phase_end = 0.0
pending_end = 0.0 # killer gone
last_killer_name = "EVIL"
# death duel
lms_set = False # once only
lms_notice_until = 0.0 # duel banner
round_start = 0.0
intro_len = 120 # round length after intro
intro_start = 0.0 # video window opened
killer_id = None
current_round = 0
result = None # last result
round_players = set() # current round players

STATE_KEYS = ("x", "y", "facing", "moving", "onGround",
              "invis", "m1", "stunned", "pull", "cower", "windup", "pose", "dashing",
              "peeling", "spinning", "spinwindup", "pullwindup", "lift", "super", "forming", "holding", "whipuntil")
# fresh stamps


def _alive_players():
    return {pid: pl for pid, pl in players.items()
            if pid in round_players and pl.get("alive", True) and pl.get("hp", 100) > 0}


def _here_players():
    """Players who are not explicitly away and have not timed out."""
    now = time.time()
    return {pid: pl for pid, pl in players.items()
            if not pl.get("away", False) and now - pl.get("last", 0) < TIMEOUT}


def _player_activity():
    """Compact AFK/timeout snapshot for round-transition logs."""
    now = time.time()
    return ", ".join(
        f"{pid}:{pl.get('name', '?')} away={bool(pl.get('away', False))} "
        f"idle={max(0, now - pl.get('last', now)):.1f}s"
        for pid, pl in players.items()
    ) or "none"


# formbar login, digipogs, malice


def b64url(text):
    return base64.urlsafe_b64decode(text + "=" * (-len(text) % 4))


def der_item(data, pos=0):
    """read one der item, returns (content, position after it)"""
    length = data[pos + 1]
    pos += 2
    if length & 0x80:
        size = length & 0x7F
        length = int.from_bytes(data[pos:pos + size], "big")
        pos += size
    return data[pos:pos + length], pos + length


def rsa_numbers(pem):
    """pull the modulus and exponent out of a public key pem"""
    lines = [l for l in pem.splitlines() if not l.startswith("-----")]
    der = base64.b64decode("".join(lines))
    outer, _ = der_item(der)
    if "RSA PUBLIC KEY" in pem:
        key = outer # plain rsa key
    else:
        _, pos = der_item(outer) # skip the algorithm
        bits, _ = der_item(outer, pos)
        key, _ = der_item(bits[1:]) # skip unused bits
    n, pos = der_item(key)
    e, _ = der_item(key, pos)
    return int.from_bytes(n, "big"), int.from_bytes(e, "big")


def formbar_public_key():
    """fetch formbar's signing key once and remember it"""
    if "key" not in formbar_cache:
        for path in ("/api/v1/certs", "/api/certs", "/certs"):
            try:
                with urllib.request.urlopen(f"{FORMBAR_ADDRESS}{path}", timeout=10) as r:
                    body = json.load(r)
                pem = (body.get("data") or body).get("publicKey")
                if pem:
                    formbar_cache["key"] = rsa_numbers(pem)
                    break
            except (OSError, ValueError, IndexError) as err:
                print(f"!! could not get formbar key at {path}: {err}", flush=True)
    return formbar_cache.get("key")


def token_is_real(token):
    """check the rs256 signature against formbar's public key"""
    key = formbar_public_key()
    if not key:
        return False
    n, e = key
    head, body, sig = token.split(".")
    if json.loads(b64url(head)).get("alg") != "RS256":
        return False
    size = (n.bit_length() + 7) // 8
    got = pow(int.from_bytes(b64url(sig), "big"), e, n).to_bytes(size, "big")
    # sha256 pkcs1 padding
    info = bytes.fromhex("3031300d060960864801650304020105000420")
    info += hashlib.sha256(f"{head}.{body}".encode()).digest()
    want = b"\x00\x01" + b"\xff" * (size - len(info) - 3) + b"\x00" + info
    return hmac.compare_digest(got, want)


def formbar_user(token):
    """check a formbar token and return (id, display name), or (None, None)"""
    try:
        if not token_is_real(token):
            print("!! login token was not signed by formbar", flush=True)
            return None, None
        claims = json.loads(b64url(token.split(".")[1]))
    except (ValueError, IndexError) as err:
        print(f"!! login token is broken: {err}", flush=True)
        return None, None
    fid, name = claims.get("id"), claims.get("displayName")
    if not (fid and name):
        print(f"!! login token had no id or name, keys: {list(claims)}", flush=True)
        return None, None
    return str(fid), str(name)[:24]


def formbar_transfer(fid, pin, amount, reason):
    """send digipogs from a player to the pool, returns (ok, message)"""
    payload = {"from": int(fid), "to": POOL_ID, "amount": amount,
               "pin": int(pin), "reason": reason, "pool": True}
    req = urllib.request.Request(f"{FORMBAR_ADDRESS}/api/v1/digipogs/transfer",
                                 data=json.dumps(payload).encode(),
                                 headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            body = json.load(r)
    except urllib.error.HTTPError as err:
        try:
            body = json.load(err)
        except ValueError:
            body = {}
    except (OSError, ValueError):
        return False, "could not reach formbar"
    inner = body.get("data") if isinstance(body.get("data"), dict) else body
    ok = bool(body.get("success")) and inner.get("success", True) is not False
    msg = inner.get("message") or body.get("message") or body.get("error") or ""
    return ok, str(msg)[:80]


def charge_player(pid):
    """take the round fee from one player, runs in its own thread so the game never waits"""
    with lock:
        pl = players.get(pid)
        if not pl:
            return
        fid = pl["fid"]
        pin = sessions.get(pl["sid"], {}).get("pin")
        round_no = current_round + 1
    if pin:
        ok, msg = formbar_transfer(fid, pin, ROUND_COST, f"party crashers round {round_no}")
    else:
        ok, msg = False, "no pin set"
    with lock:
        pl = players.get(pid)
        if pl:
            pl["paid"] = ok
            pl["pay_msg"] = "" if ok else (msg or "payment failed")
    print(f"[PAY] {fid} round fee {'paid' if ok else 'failed: ' + msg}", flush=True)


def load_malice():
    try:
        with open(MALICE_FILE, encoding="utf-8") as f:
            malice.update(json.load(f))
    except (OSError, ValueError):
        pass


def set_malice(fid, amount):
    malice[fid] = max(0, amount)
    if not FORMBAR_MODE:
        return # local testing stays off disk
    try:
        with open(MALICE_FILE, "w", encoding="utf-8") as f:
            json.dump(malice, f)
    except OSError:
        print("!! could not save malice.json", flush=True)


def add_malice(fid, amount):
    set_malice(fid, malice.get(fid, 0) + amount)


def pick_killer(candidates):
    """the player with the most malice becomes the killer, ties are random"""
    best = max(malice.get(pl["fid"], 0) for pl in candidates.values())
    top = [pid for pid, pl in candidates.items() if malice.get(pl["fid"], 0) == best]
    return random.choice(top)


def _enemies_of(pid):
    """alive round players on the other side, killer vs survivors"""
    evil = pid == killer_id
    return {p: pl for p, pl in _alive_players().items() if (p == killer_id) != evil}


def _rocketing(pid):
    """a nyan riding its own rocket can't be hurt"""
    return any(rk["by"] == pid for rk in rockets.values())


def update_rockets(now):
    """pick or swap who each rocket chases, drop stale ones"""
    for rid in list(rockets):
        rk = rockets[rid]
        if rk["by"] not in players or phase != "round" or now - rk["at"] > ROCKET_LIFE:
            del rockets[rid]
            continue
        if now - rk["at"] >= ROCKET_UP:
            foes = _enemies_of(rk["by"])
            if rk.get("target") not in foes:
                # nearest to where it launched
                rk["target"] = min(foes, key=lambda p: (foes[p].get("x", 0) - rk["x"]) ** 2
                                   + (foes[p].get("y", 0) - rk["y"]) ** 2) if foes else None
    while blasts and now - blasts[0]["at"] > BLAST_LIFE:
        blasts.pop(0)


def start_intermission():
    # break once
    global phase, phase_end
    phase = "intermission"
    phase_end = time.time() + INTER_TIME
    print("[GAME] State: INTERMISSION (30s)", flush=True)


def start_select(free=False):
    # pick phase
    global phase, phase_end, killer_id
    here = _here_players()
    if len(here) < 2:
        phase = "lobby"
        killer_id = None
        print("!! not enough active players - character select cancelled!!", flush=True)
        return
    for pl in players.values():
        pl["char"] = None # fresh picks
        pl["killer_char"] = None
        pl["paid"] = False
    for pid, pl in here.items():
        # awaiting formbar payment
        pl["paid"] = None if ROUND_COST > 0 and not free else True
        pl["pay_msg"] = ""
        if ROUND_COST > 0 and not free:
            threading.Thread(target=charge_player, args=(pid,), daemon=True).start()
    killer_id = pick_killer(here)
    print(f"[GAME] preselected evil: {players[killer_id]['name']} "
          f"(malice {malice.get(players[killer_id]['fid'], 0)})", flush=True)
    phase = "select"
    phase_end = time.time() + SELECT_TIME
    print("[GAME] State: CHARACTER_SELECT (30s)", flush=True)


def start_round():
    global phase, phase_end, round_start, killer_id, current_round, result, pending_end, intro_len, intro_start
    global lms_set, lms_notice_until
    global round_players
    pending_end = 0
    lms_set = False
    lms_notice_until = 0.0
    # paid players only
    eligible = {pid: pl for pid, pl in _here_players().items() if pl.get("paid")}
    if len(eligible) < 2:
        round_players.clear()
        killer_id = None
        phase = "lobby"
        print(f"!! not enough active players - round cancelled!! [{_player_activity()}]", flush=True)
        return
    round_players = set(eligible)
    roster = ", ".join(f"{pid}:{pl.get('name', '?')}" for pid, pl in eligible.items())
    print(f"[ROUND] roster: {roster} | all players: {_player_activity()}", flush=True)
    # random picks
    for pid, pl in eligible.items():
        survivor_ids = [c["id"] for c in CHARACTERS if not c.get("killer")]
        if pl.get("char") not in survivor_ids:
            pool = [c for c in CHARACTERS if not c.get("killer") and c["id"] != "nyan"
                    and (not c.get("dev") or is_admin(pl.get("fid")))]
            pl["char"] = random.choice(pool or CHARACTERS)["id"]
    for pl in eligible.values():
        pl["alive"] = True
        pl["hp"] = pl.get("maxhp", 100)
        pl["stun_until"] = 0
    spikes.clear()
    bombs.clear()
    rockets.clear()
    del blasts[:]
    del alerts[:]
    last_hit.clear()
    # find killer
    if killer_id not in round_players:
        killer_id = pick_killer({pid: players[pid] for pid in round_players})
        print(f"!! fallback - {players[killer_id]['name']} is EVIL LUX!!", flush=True)
    if not players[killer_id].get("killer_char"):
        players[killer_id]["killer_char"] = "evil"
    set_malice(players[killer_id]["fid"], 0) # killer starts over
    current_round += 1
    intro_len = min(ROUND_MAX, ROUND_BASE + ROUND_PER_PLAYER * len(round_players))
    phase = "intro"
    phase_end = time.time() + INTRO_TIME
    intro_start = time.time()
    result = None
    print(f"!! round {current_round} intro - {players[killer_id]['name']} is EVIL LUX!!", flush=True)


def begin_round():
    # intro over, fight
    global phase, phase_end, round_start, intro_len
    round_start = time.time()
    phase_end = round_start + intro_len
    phase = "round"
    print(f"!! round {current_round} starts!!", flush=True)


def end_round(winner):
    global phase, phase_end, result, killer_id, current_round, round_players
    if phase != "round":
        return
    current_round += 1 # fresh rounds
    for pl in players.values():
        pl["alive"] = True
        pl["hp"] = pl.get("maxhp", 100)
        pl["stun_until"] = 0
        pl["char"] = None # fresh picks
    spikes.clear()
    bombs.clear()
    rockets.clear()
    del blasts[:]
    del alerts[:]
    last_hit.clear()
    name = players.get(killer_id, {}).get("name", "???") if killer_id else "???"
    result = {"winner": winner, "killer_name": name}
    for pid in round_players:
        # survivors gain malice
        if pid in players and pid != killer_id:
            add_malice(players[pid]["fid"], MALICE_PER_ROUND)
    killer_id = None # drop evil
    round_players.clear()
    phase = "intermission"
    phase_end = time.time() + INTER_TIME
    print(f"!! round {current_round} over - {winner} win!! intermission!!", flush=True)


def _grace_over(now):
    return now >= round_start + GRACE_TIME


def game_tick():
    """round timers"""
    global phase, phase_end, killer_id, pending_end, last_killer_name
    global lms_set, lms_notice_until
    while True:
        time.sleep(0.5)
        try:
            with lock:
                now = time.time()
                for pid in [p for p in players if now - players[p]["last"] > TIMEOUT]:
                    print(f"!! {players[pid]['name']} timed out", flush=True)
                    del players[pid]
                    last_hit.pop(pid, None)
                # spikes never rot now
                
                while alerts and now - alerts[0]["at"] > 5:
                    alerts.pop(0)
                while announces and now - announces[0]["at"] > 8:
                    announces.pop(0)
                while chat_log and now - chat_log[0]["at"] > CHAT_LIFE:
                    chat_log.pop(0)
                if killer_id not in players:
                    killer_id = None

                if phase == "lobby":
                    # need players
                    if len(_here_players()) >= 2:
                        start_intermission()
                elif phase == "intermission":
                    # long break
                    if len(_here_players()) < 2:
                        phase = "lobby"
                        killer_id = None
                        print("!! not enough players - back to lobby!!", flush=True)
                    elif now >= phase_end:
                        if len(_here_players()) >= 2:
                            start_select()
                        else:
                            phase = "lobby"
                            killer_id = None
                elif phase == "select":
                    # pick phase
                    here = _here_players()
                    if len(here) < 2:
                        phase = "lobby"
                        killer_id = None
                        print("!! not enough players - back to lobby!!", flush=True)
                    elif (all(pl.get("char") for pid, pl in here.items()
                              if pid != killer_id and pl.get("paid") is not False)
                          and players.get(killer_id, {}).get("killer_char")
                          and not any(pl.get("paid") is None for pl in here.values())):
                        # quick start
                        print("[GAME] everyone picked - starting early!!", flush=True)
                        start_round()
                    elif now >= phase_end:
                        if len(_here_players()) >= 2:
                            start_round()
                        else:
                            phase = "lobby"
                            killer_id = None
                elif phase == "intro":
                    # killer intro video
                    if len(round_players.intersection(players)) < 2:
                        for pl in players.values():
                            pl["alive"] = True
                            pl["hp"] = pl.get("maxhp", 100)
                        killer_id = None
                        round_players.clear()
                        phase = "lobby"
                        print("!! not enough players - back to lobby!!", flush=True)
                    elif now >= phase_end:
                        begin_round()
                elif phase == "round":
                    if len(round_players.intersection(players)) < 2:
                        for pl in players.values():
                            pl["alive"] = True
                            pl["hp"] = pl.get("maxhp", 100)
                        killer_id = None
                        round_players.clear()
                        phase = "lobby"
                        print("!! not enough players - back to lobby!!", flush=True)
                    else:
                        k = players.get(killer_id)
                        # gone killer
                        if k is not None and now - k.get("last", 0) > 10:
                            print(f"!! {k.get('name', 'EVIL')} went stale... round ending!!", flush=True)
                            k = None
                        if k is not None:
                            pending_end = 0
                            last_killer_name = k.get("name", "EVIL")
                        if k is None:
                            # warn first
                            if not pending_end:
                                pending_end = now + 5
                                print(f"!! {last_killer_name} left... round ending!!", flush=True)
                            if now >= pending_end:
                                pending_end = 0
                                end_round("survivors")
                        elif not k.get("alive", True) or k.get("hp", 100) <= 0:
                            end_round("survivors") # killer died
                        elif now >= phase_end:
                            end_round("survivors") # slow survivors
                        else:
                            alive = _alive_players()
                            survs = [pid for pid in alive if pid != killer_id]
                            if not survs:
                                end_round("killer") # all dead
                            else:
                                if len(survs) == 1 and not lms_set:
                                    # death duel
                                    lms_set = True
                                    _lc = players.get(survs[0], {}).get("char")
                                    phase_end = now + LMS_DURATIONS.get(_lc, 105.117)
                                    lms_notice_until = now + 5
                                    print(f"!! LMS ({_lc} vs evil) - fight!!", flush=True)
                            # manual swings
                elif phase == "intermission":
                    if now >= phase_end:
                        if len(_here_players()) >= 2:
                            start_round()
                        else:
                            phase = "lobby"
                            killer_id = None
                            print("!! not enough players - back to lobby!!", flush=True)
        except Exception as err: # catch all
            print(f"!! tick oops: {err}", flush=True)


class DualStackServer(ThreadingHTTPServer):
    """dual stack"""
    address_family = socket.AF_INET6

    def server_bind(self):
        try:
            self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        except (AttributeError, OSError):
            pass
        super().server_bind()


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # fresh files
        if self.path.split("?")[0].endswith((".html", ".js", ".css")):
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def _ip(self):
        ip = self.client_address[0]
        if ip.startswith("::ffff:"):
            ip = ip[7:]
        return ip

    def _session(self):
        """the logged in formbar user for this browser, or None"""
        if not FORMBAR_MODE:
            return LOCAL_SESSION # no login at all in local testing
        cookie = SimpleCookie(self.headers.get("Cookie", ""))
        morsel = cookie.get("pch_sid")
        sess = sessions.get(morsel.value) if morsel else None
        return sess

    def _redirect(self, url, cookie=None):
        self.send_response(302)
        self.send_header("Location", url)
        if cookie:
            self.send_header("Set-Cookie", cookie)
        self.end_headers()

    def _send_json(self, obj, code=200):
        body = json.dumps(obj).encode()
        try:
            self.send_response(code)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionAbortedError):
            pass # dead tab

    def _read_json(self):
        try:
            n = int(self.headers.get("Content-Length", 0) or 0)
        except ValueError:
            n = 0
        if not n:
            return {}
        try:
            return json.loads(self.rfile.read(n) or b"{}")
        except (ValueError, UnicodeDecodeError):
            return {}

    def do_POST(self):
        global killer_id
        if self.path == "/api/pin":
            # pin stays server-side only
            sess = self._session()
            pin = str(self._read_json().get("pin", "")).strip()
            if not sess:
                self._send_json({"ok": False, "reason": "log in first!!"}, 401)
            elif not (pin.isdigit() and 4 <= len(pin) <= 8):
                self._send_json({"ok": False, "reason": "pin should be 4 to 8 digits!!"})
            else:
                sess["pin"] = pin
                self._send_json({"ok": True})
            return

        if self.path == "/api/join":
            data = self._read_json()
            sess = self._session()
            if not sess:
                self._send_json({"error": "log in with formbar!!", "login": True}, 401)
                return
            if DIGIPOGS_ON and not sess.get("pin"):
                self._send_json({"error": "enter your digipog pin!!", "pin": True}, 401)
                return
            with lock:
                if phase == "round":
                    # locked match
                    self._send_json({"error": "match running!!"}, 403)
                    return
                pid = secrets.token_hex(4)
                # fid identity, mods/mutes follow
                fid = sess["fid"]
                tab = str(data.get("tab") or "")[:16]
                name = sess["name"]
                if FORMBAR_MODE:
                    # one tab per account
                    for pl in players.values():
                        if pl.get("fid") == fid and pl.get("tab") != tab and time.time() - pl.get("last", 0) <= 10:
                            self._send_json({"error": "already online in another tab!!"}, 403)
                            return
                    for _old in [p for p, pl in players.items() if pl.get("fid") == fid]:
                        if killer_id == _old:
                            killer_id = pid
                        del players[_old]
                else:
                    # local testing: every tab is its own player, ?name=bob picks a name
                    fid = f"{fid}:{tab}"
                    name = str(data.get("name") or "").strip()[:20] or f"guest {tab[:3]}"
                    taken = {pl["name"] for pl in players.values()}
                    base, n = name, 1
                    while name in taken:
                        n += 1
                        name = f"{base} {n}"
                players[pid] = {
                    "fid": fid,
                    "sid": sess["sid"],
                    "tab": tab,
                    "char": None, # pick spot
                    "maxhp": 100, # told maxhp
                    "name": name,
                    "paid": False,
                    "pay_msg": "",
                    "x": 60, "y": 100, "facing": 1,
                    "hp": 100, "moving": False, "onGround": False,
                    "alive": True, "invis": False, "m1": True,
                    "stunned": False, "pull": False, "away": False, "cower": False,
                    "windup": False, "pose": None, "dashing": False, "stun_until": 0,
                    "last": time.time(),
                }
            print(f"!! {players[pid]['name']} joined ({pid})", flush=True)
            self._send_json({"id": pid, "fid": fid, "name": players[pid]["name"],
                             "mod": is_admin(fid),
                             "muted": max(0, int(muted_fids.get(fid, 0) - time.time()))})
            return

        if self.path == "/api/malice/buy":
            # intermission buys, outside lock
            data = self._read_json()
            with lock:
                me = players.get(data.get("id"))
                if not me:
                    self._send_json({"ok": False, "reason": "no player!!"})
                    return
                fid = me["fid"]
                if is_admin(fid):
                    try:
                        amount = max(0, int(data.get("amount", MALICE_PER_BUY)))
                    except (TypeError, ValueError):
                        amount = MALICE_PER_BUY
                    add_malice(fid, amount)
                    total = malice.get(fid, 0)
                    print(f"!! dev {me['name']} gave themselves {amount} malice ({total})!!", flush=True)
                    self._send_json({"ok": True, "malice": total})
                    return
                if phase != "intermission":
                    self._send_json({"ok": False, "reason": "malice is sold during intermission only!!"})
                    return
                if MALICE_PRICE <= 0:
                    self._send_json({"ok": False, "reason": "malice is not for sale!!"})
                    return
                pin = sessions.get(me["sid"], {}).get("pin")
            if FORMBAR_MODE:
                if not pin:
                    self._send_json({"ok": False, "reason": "enter your digipog pin first!!"})
                    return
                ok, msg = formbar_transfer(fid, pin, MALICE_PRICE, "party crashers malice")
                if not ok:
                    self._send_json({"ok": False, "reason": msg or "payment failed!!"})
                    return
            with lock:
                add_malice(fid, MALICE_PER_BUY)
                total = malice.get(fid, 0)
            print(f"!! {me['name']} bought malice ({total})", flush=True)
            self._send_json({"ok": True, "malice": total})
            return

        if self.path == "/api/state":
            data = self._read_json()
            with lock:
                pl = players.get(data.get("id"))
                if pl:
                    for key in STATE_KEYS:
                        if key in data:
                            pl[key] = data[key]
                    # fresh posts
                    if data.get("r") == current_round:
                        try:
                            maxhp = int(data.get("maxhp", 0)) or 100
                            maxhp = max(1, min(1000, maxhp))
                        except (ValueError, TypeError):
                            maxhp = 100
                        old_max = pl.get("maxhp", 100)
                        pl["maxhp"] = maxhp
                        try:
                            posted = int(data.get("hp", pl["hp"]))
                        except (ValueError, TypeError):
                            posted = pl["hp"]
                        if maxhp > old_max:
                            # fresh hp
                            pl["hp"] = max(0, min(maxhp, posted))
                        elif "hp" in data:
                            pl["hp"] = max(0, min(pl["hp"], posted))
                        if "alive" in data:
                            pl["alive"] = bool(data["alive"])
                    pl["last"] = time.time()
            self._send_json({"ok": True})
            return

        if self.path == "/api/afk":
            data = self._read_json()
            with lock:
                pl = players.get(data.get("id"))
                if pl:
                    was_away = bool(pl.get("away", False))
                    pl["away"] = bool(data.get("away", False))
                    pl["last"] = time.time()
                    if was_away != pl["away"]:
                        print(f"[AFK] {pl['name']} ({data.get('id')}) {was_away} -> {pl['away']}", flush=True)
            self._send_json({"ok": bool(pl)})
            return

        if self.path == "/api/leave":
            pid = self._read_json().get("id")
            with lock:
                gone = players.pop(pid, None)
                last_hit.pop(pid, None)
            if gone:
                print(f"!! {gone['name']} left", flush=True)
            self._send_json({"ok": True})
            return

        if self.path == "/api/intro":
            # video over, roll early
            data = self._read_json()
            with lock:
                if (phase == "intro" and data.get("id") in round_players
                        and time.time() - intro_start > 4):
                    begin_round()
            self._send_json({"ok": True})
            return

        if self.path == "/api/spike":
            # trap or trip
            global spike_seq
            data = self._read_json()
            with lock:
                me = players.get(data.get("id"))
                if data.get("action") == "place" and me and data.get("id") == killer_id:
                    try:
                        x, y = float(data.get("x", 0)), float(data.get("y", 0))
                    except (ValueError, TypeError):
                        self._send_json({"ok": False, "reason": "bad spot"})
                        return
                    
                    while len(spikes) >= SPIKE_MAX:
                        oldest = min(spikes, key=lambda s: spikes[s]["at"])
                        del spikes[oldest]
                    spike_seq += 1
                    sid = f"s{spike_seq}"
                    spikes[sid] = {"x": x, "y": y, "by": me["name"], "at": time.time()}
                    self._send_json({"ok": True, "spike": dict(spikes[sid], id=sid)})
                    return
                if data.get("action") == "trip" and data.get("spike") in spikes:
                    sp = spikes.pop(data["spike"])
                    alerts.append({"x": sp["x"], "y": sp["y"], "at": time.time()})
                    print(f"!! {me['name'] if me else '???'} tripped a spike!!", flush=True)
                    self._send_json({"ok": True})
                    return
            self._send_json({"ok": False})
            return

        if self.path == "/api/bomb":
            # tails traps, airborne throws
            global bomb_seq, bomb_toss_seq
            data = self._read_json()
            with lock:
                me = players.get(data.get("id"))
                if (data.get("action") == "throw" and me and phase == "round"
                        and me.get("char") == "tails" and not me.get("evil")):
                    try:
                        x, y = float(data.get("x", 0)), float(data.get("y", 0))
                        vx, vy = float(data.get("vx", 0)), float(data.get("vy", 0))
                    except (ValueError, TypeError):
                        self._send_json({"ok": False, "reason": "bad throw"})
                        return
                    if not (x == x and y == y and vx == vx and vy == vy):
                        self._send_json({"ok": False, "reason": "bad throw"})
                        return
                    # nerfed toss, short lob only
                    vx = max(-600, min(600, vx))
                    vy = max(-400, min(200, vy))
                    while len(bomb_tosses) >= 50:
                        oldest = min(bomb_tosses, key=lambda s: bomb_tosses[s]["at"])
                        del bomb_tosses[oldest]
                    bomb_toss_seq += 1
                    tid = f"t{bomb_toss_seq}"
                    toss = {"id": tid, "x": x, "y": y, "vx": vx, "vy": vy,
                            "by": me["name"], "owner": data.get("id"), "at": time.time()}
                    bomb_tosses[tid] = toss
                    self._send_json({"ok": True, "toss": toss})
                    return
                if (data.get("action") == "place" and me and phase == "round"
                        and me.get("char") == "tails" and not me.get("evil")):
                    try:
                        x, y = float(data.get("x", 0)), float(data.get("y", 0))
                    except (ValueError, TypeError):
                        self._send_json({"ok": False, "reason": "bad spot"})
                        return
                    # off the map
                    if x < -400 or x > 3300 or y < -2000 or y > 2600:
                        self._send_json({"ok": False, "reason": "bad spot"})
                        return
                    # bombs need elbow room
                    for ob in bombs.values():
                        if (x - ob["x"]) ** 2 + (y - ob["y"]) ** 2 < 100 ** 2:
                            self._send_json({"ok": False, "reason": "too close!!"})
                            return
                    while len(bombs) >= 5:
                        oldest = min(bombs, key=lambda s: bombs[s]["at"])
                        del bombs[oldest]
                    bomb_seq += 1
                    bid = f"b{bomb_seq}"
                    bombs[bid] = {"x": x, "y": y, "by": me["name"], "owner": me["id"], "at": time.time()}
                    self._send_json({"ok": True, "bomb": dict(bombs[bid], id=bid)})
                    return
                if data.get("action") == "airburst" and me and phase == "round" \
                        and me.get("char") == "tails" and not me.get("evil"):
                    try:
                        x, y = float(data.get("x", 0)), float(data.get("y", 0))
                    except (ValueError, TypeError):
                        self._send_json({"ok": False, "reason": "bad burst"})
                        return
                    now = time.time()
                    k = players.get(killer_id)
                    if k and k.get("alive", True) and k.get("hp", 250) > 0 \
                            and (x - k.get("x", 0)) ** 2 + (y - k.get("y", 0)) ** 2 < 150 ** 2 \
                            and _grace_over(now):
                        for tid in [t for t, o in bomb_tosses.items()
                                    if (x - o["x"]) ** 2 + (y - o["y"]) ** 2 < 200 ** 2]:
                            del bomb_tosses[tid]
                        k["hp"] = max(0, k.get("hp", 250) - 30)
                        k["stun_until"] = max(k.get("stun_until", 0), now + 5)
                        _dx = k.get("x", 0) - x
                        _dy = k.get("y", 0) - y
                        _dist = (_dx * _dx + _dy * _dy) ** 0.5 or 1
                        k["kb"] = {"x": _dx / _dist, "y": _dy / _dist, "at": now, "s": 2}
                        if k["hp"] <= 0:
                            k["alive"] = False
                        print(f"!! {k['name']} ate a midair bomb!!", flush=True)
                        self._send_json({"ok": True})
                        return
                    self._send_json({"ok": False, "reason": "no hit"})
                    return
                if data.get("action") == "trip" and data.get("bomb") in bombs:
                    bb = bombs.pop(data["bomb"])
                    if data.get("id") == killer_id and me:
                        me["hp"] = max(0, me.get("hp", 250) - 30)
                        me["stun_until"] = max(me.get("stun_until", 0), time.time() + 5)
                        try:
                            push = float(data.get("dx", 0) or 0)
                        except (ValueError, TypeError):
                            push = 0
                        me["kb"] = {"x": -push, "y": -0.4,
                                    "at": time.time(), "s": 2}
                        if me["hp"] <= 0:
                            me["alive"] = False
                        print(f"!! {me['name']} ate a bomb!!", flush=True)
                    owner = bb.get("owner")
                    if owner and isinstance(owner, str):
                        owner_player = players.get(owner)
                        if owner_player and owner_player.get("char") == "tails" and not owner_player.get("evil"):
                            owner_player["bombs_left"] = min(5, owner_player.get("bombs_left", 5) + 1)
                    self._send_json({"ok": True})
                    return
            self._send_json({"ok": False})
            return

        if self.path == "/api/rocket":
            # nyan rockets, dev only, works for killer or survivor
            global rocket_seq, blast_seq
            data = self._read_json()
            now = time.time()
            with lock:
                pid = data.get("id")
                me = players.get(pid)
                if not (me and phase == "round" and pid in round_players
                        and me.get("alive", True) and me.get("hp", 100) > 0
                        and me.get("char") == "nyan" and is_admin(me.get("fid"))):
                    self._send_json({"ok": False})
                    return
                action = data.get("action")
                if action == "launch":
                    try:
                        x, y = float(data.get("x", 0)), float(data.get("y", 0))
                    except (ValueError, TypeError):
                        self._send_json({"ok": False, "reason": "bad launch"})
                        return
                    if not (x == x and y == y) or x < -600 or x > 3600 or y < -3000 or y > 3000:
                        self._send_json({"ok": False, "reason": "bad launch"})
                        return
                    if not _grace_over(now) or now - last_rocket.get(pid, 0) < ROCKET_GAP or len(rockets) >= 8:
                        self._send_json({"ok": False, "reason": "not yet"})
                        return
                    last_rocket[pid] = now
                    rocket_seq += 1
                    rid = f"r{rocket_seq}"
                    rockets[rid] = {"id": rid, "x": x, "y": y, "by": pid, "name": me["name"],
                                    "at": now, "target": None}
                    print(f"!! {me['name']} launched a rocket!!", flush=True)
                    self._send_json({"ok": True, "rocket": dict(rockets[rid], age=0)})
                    return
                if action == "detonate":
                    rk = rockets.get(data.get("rocket"))
                    try:
                        x, y = float(data.get("x", 0)), float(data.get("y", 0))
                    except (ValueError, TypeError):
                        rk = None
                    if (not rk or rk["by"] != pid or now - rk["at"] < ROCKET_UP * 0.8
                            or not (x == x and y == y) or abs(x) > 6000 or abs(y) > 6000):
                        self._send_json({"ok": False})
                        return
                    del rockets[rk["id"]]
                    hit = []
                    for vid, vic in _enemies_of(pid).items():
                        if _rocketing(vid):
                            continue # mid rocket, untouchable
                        # player x and y are the top left, hitbox is 28 by 60
                        if ((vic.get("x", 0) + 14 - x) ** 2 + (vic.get("y", 0) + 30 - y) ** 2) ** 0.5 > ROCKET_RADIUS:
                            continue
                        vic["hp"] = max(0, vic.get("hp", 100) - ROCKET_DMG) # always the full 50
                        if vic["hp"] <= 0:
                            vic["alive"] = False
                        hit.append(vic["name"])
                    blast_seq += 1
                    blasts.append({"id": f"x{blast_seq}", "x": x, "y": y, "r": ROCKET_RADIUS,
                                   "rid": rk["id"], "by": me["name"], "at": now})
                    print(f"!! {me['name']}'s rocket blew up, hit: {', '.join(hit) or 'nobody'}!!", flush=True)
                    self._send_json({"ok": True, "hit": len(hit)})
                    return
            self._send_json({"ok": False})
            return

        if self.path == "/api/hit":
            # both ways
            data = self._read_json()
            now = time.time()
            with lock:
                atk = players.get(data.get("id"))
                vic = players.get(data.get("victim"))
                atk_evil = data.get("id") == killer_id
                vic_evil = data.get("victim") == killer_id
                if (atk and vic and data.get("victim") != data.get("id")
                    and data.get("id") in round_players and data.get("victim") in round_players
                        and atk_evil != vic_evil and phase == "round"
                        and atk.get("alive", True) and vic.get("alive", True)
                        and _grace_over(now)):
                    k = atk
                    try:
                        dmg = max(0, min(100, int(data.get("dmg", 0))))
                    except (ValueError, TypeError):
                        dmg = 0
                    if atk_evil:
                        dmg = int(round(dmg * 1.08))
                    # 25% damage reduction
                    if lms_set and not vic_evil:
                        dmg = (dmg * 3 + 3) // 4
                    try:
                        stun = max(0, min(5, float(data.get("stun", 0))))
                    except (ValueError, TypeError):
                        stun = 0
                    # nyan mid rocket, nothing lands
                    if _rocketing(data["victim"]):
                        self._send_json({"ok": True})
                        return
                    # wide swings
                    reach = 140 if stun <= 0 else 95
                    dx = vic.get("x", 0) - k.get("x", 0)
                    dy = vic.get("y", 0) - k.get("y", 0)
                    if dx * dx + dy * dy < reach * reach:
                        # spared cower
                        if atk_evil and vic.get("cower", False):
                            if now - last_stun.get(data.get("id"), 0) >= STUN_IFRAMES:
                                atk["stun_until"] = now + 2
                                last_stun[data.get("id")] = now
                            # shove back
                            _dx = atk.get("x", 0) - vic.get("x", 0)
                            _dy = atk.get("y", 0) - vic.get("y", 0)
                            _dist = (_dx * _dx + _dy * _dy) ** 0.5 or 1
                            atk["kb"] = {"x": _dx / _dist, "y": _dy / _dist, "at": now, "s": 2}
                            vic["countered"] = True
                            print(f"!! {vic['name']} COUNTERED {k['name']}!!", flush=True)
                            self._send_json({"ok": True})
                            return
                        if stun > 0 or now - last_hit.get(data["victim"], 0) >= TOUCH_COOLDOWN:
                            last_hit[data["victim"]] = now
                            vic["hp"] = max(0, vic.get("hp", 100) - dmg)
                            stack = bool(data.get("stack", False))
                            try:
                                kbp = max(1, min(3, float(data.get("kb", 1))))
                            except (ValueError, TypeError):
                                kbp = 1
                            # stun gaps
                            if stun > 0 and data.get("victim") == killer_id and not stack:
                                if now - last_stun.get(data["victim"], 0) < STUN_IFRAMES:
                                    stun = 0
                                else:
                                    last_stun[data["victim"]] = now
                            # stack stuns
                            if stun > 0:
                                if stack:
                                    vic["stun_until"] = min(max(vic.get("stun_until", 0), now) + stun, now + 6)
                                else:
                                    vic["stun_until"] = now + stun
                                # shove back
                                # big shoves
                                if data.get("victim") == killer_id:
                                    _dx = vic.get("x", 0) - k.get("x", 0)
                                    _dy = vic.get("y", 0) - k.get("y", 0)
                                    _dist = (_dx * _dx + _dy * _dy) ** 0.5 or 1
                                    vic["kb"] = {"x": _dx / _dist, "y": _dy / _dist, "at": now, "s": stun, "p": kbp}
                            if vic["hp"] <= 0:
                                vic["alive"] = False
                            print(f"!! {k['name']} hit {vic['name']} for {dmg}!!", flush=True)
                            self._send_json({"ok": True})
                            return
            self._send_json({"ok": False})
            return

        if self.path == "/api/pick":
            # free picks
            data = self._read_json()
            with lock:
                me = players.get(data.get("id"))
                want = data.get("char")
                character = next((c for c in CHARACTERS if c["id"] == want), None)
                killer_pick = data.get("role") == "killer"
                is_elected = data.get("id") == killer_id
                allowed_role = character and bool(character.get("killer")) == killer_pick
                allowed_dev = bool(character and (not character.get("dev") or (me and is_admin(me.get("fid")))))
                if (me and data.get("id") in _here_players() and phase == "select"
                        and allowed_role and allowed_dev and is_elected == killer_pick):
                    if killer_pick:
                        me["killer_char"] = want
                    else:
                        me["char"] = want
                    print(f"!! {me['name']} picked {want}!!", flush=True)
                    self._send_json({"ok": True, "char": want})
                else:
                    self._send_json({"ok": False, "reason": "nope!!"})
            return

        if self.path == "/api/chat":
            # chat bubbles
            # mute hammer
            global chat_seq
            data = self._read_json()
            ip = self._ip()
            now = time.time()
            me_preview = players.get(data.get("id"))
            mkey = (me_preview.get("fid") if me_preview else None) or ip
            if now < muted_fids.get(mkey, 0):
                self._send_json({"ok": False, "reason": "muted",
                                 "left": int(muted_fids[mkey] - now)})
                return
            with lock:
                me = players.get(data.get("id"))
                text = str(data.get("text", ""))[:60].strip()
                now = time.time()
                dev_chat = bool(me and is_admin(me.get("fid")))
                if me and text and (dev_chat or now - last_chat.get(data.get("id"), 0) >= CHAT_COOLDOWN):
                    if not dev_chat and text not in QUICK_CHAT:
                        self._send_json({"ok": False, "reason": "blocked"})
                    elif not dev_chat and not is_clean(text):
                        muted_fids[me.get("fid") or ip] = now + MUTE_TIME
                        print(f"!! {me['name']} muted 10 min!!", flush=True)
                        self._send_json({"ok": False, "reason": "muted", "left": MUTE_TIME})
                    else:
                        last_chat[data["id"]] = now
                        chat_seq += 1
                        chat_log.append({
                            "mid": chat_seq, "pid": data["id"],
                            "name": me["name"], "text": text, "at": now,
                        })
                        while len(chat_log) > 20:
                            chat_log.pop(0)
                        self._send_json({"ok": True})
                else:
                    self._send_json({"ok": False})
            return

        if self.path == "/api/mod":
            # mod list
            data = self._read_json()
            with lock:
                me = players.get(data.get("id"))
                if not me or not is_admin(me.get("fid")):
                    self._send_json({"ok": False, "reason": "mods only!!"})
                    return
                action = data.get("action")
                if action == "killall":
                    for pid, pl in players.items():
                        if pid in round_players and pid != killer_id and pl.get("alive", True):
                            pl["hp"] = 0
                            pl["alive"] = False
                    print(f"!! mod {me['name']} killed everyone!!", flush=True)
                elif action == "killme":
                    me["hp"] = 0
                    me["alive"] = False
                elif action == "healall":
                    for pl in players.values():
                        pl["hp"] = pl.get("maxhp", 100)
                elif action == "endround":
                    end_round(data.get("winner") or "survivors")
                elif action == "skipwait":
                    # skip ahead
                    if phase == "lobby" and len(_here_players()) >= 2:
                        start_intermission()
                    elif phase == "intermission" and len(_here_players()) >= 2:
                        start_select()
                    elif phase == "select" and len(_here_players()) >= 2:
                        if players.get(killer_id, {}).get("killer_char"):
                            start_round()
                        else:
                            print("!! skip wait is waiting for the killer pick!!", flush=True)
                    print(f"!! mod skipped the wait!!", flush=True)
                elif action == "forcestart":
                    if len(_here_players()) >= 2:
                        start_select(free=True)
                        print(f"!! mod forced character select!!", flush=True)
                    else:
                        self._send_json({"ok": False, "reason": "need two active players!!"})
                        return
                elif action == "makekiller":
                    target = data.get("target")
                    here = _here_players()
                    if target == "random":
                        candidates = [pid for pid, pl in here.items() if pl.get("alive", True)]
                        target = random.choice(candidates) if candidates else None
                    if target not in here:
                        self._send_json({"ok": False, "reason": "bad target"})
                        return
                    set_malice(here[target]["fid"], 9999)
                    if phase == "select" and len(here) >= 2:
                        killer_id = pick_killer(here)
                        for pl in here.values():
                            pl["killer_char"] = None
                    print(f"!! mod gave {here[target]['name']} 9999 malice!!", flush=True)
                elif action == "clearspikes":
                    spikes.clear()
                    bombs.clear()
                elif action == "announce":
                    text = str(data.get("text", ""))[:120].strip()
                    if text and me:
                        announces.append({"text": text, "by": me["name"], "at": time.time()})
                        del announces[:-5]
                        print(f"!! mod {me['name']} announced: {text}!!", flush=True)
                elif action == "givemalice":
                    try:
                        amount = max(0, int(data.get("amount", 0)))
                    except (ValueError, TypeError):
                        amount = 0
                    target = data.get("target")
                    if target == "me" and me:
                        set_malice(me["fid"], malice.get(me["fid"], 0) + amount)
                    elif target in players:
                        set_malice(players[target]["fid"], malice.get(players[target]["fid"], 0) + amount)
                    else:
                        self._send_json({"ok": False, "reason": "bad target"})
                        return
                    print(f"!! mod {me['name']} granted {amount} malice to {target}!!", flush=True)
                elif action == "setmalice":
                    try:
                        amount = max(0, int(data.get("amount", 0)))
                    except (ValueError, TypeError):
                        amount = 0
                    target = data.get("target")
                    if target == "me" and me:
                        set_malice(me["fid"], amount)
                    elif target in players:
                        set_malice(players[target]["fid"], amount)
                    else:
                        self._send_json({"ok": False, "reason": "bad target"})
                        return
                    print(f"!! mod {me['name']} set malice for {target} to {amount}!!", flush=True)
                elif action == "sethealth":
                    try:
                        hp = max(0, min(1000, int(data.get("hp", 100))))
                    except (ValueError, TypeError):
                        hp = 100
                    targets = []
                    if data.get("target") == "all":
                        targets = list(players.values())
                    elif me:
                        targets = [me]
                    for pl in targets:
                        if hp > pl.get("maxhp", 100):
                            pl["maxhp"] = hp
                        pl["hp"] = hp
                        if hp > 0:
                            pl["alive"] = True
                    print(f"!! mod set hp to {hp}!!", flush=True)
                elif action == "makedev":
                    for c in CHARACTERS:
                        if c["id"] == data.get("char"):
                            c["dev"] = True
                            print(f"!! {c['id']} is dev now!!", flush=True)
                elif action == "unmakedev":
                    for c in CHARACTERS:
                        if c["id"] == data.get("char"):
                            c["dev"] = False
                            print(f"!! {c['id']} is public now!!", flush=True)
                else:
                    self._send_json({"ok": False, "reason": "huh?"})
                    return
                self._send_json({"ok": True})
            return

        if self.path == "/api/heal":
            # heals rise
            data = self._read_json()
            with lock:
                pl = players.get(data.get("id"))
                if pl and pl.get("alive", True):
                    try:
                        amount = max(0, int(data.get("amount", 0)))
                    except (ValueError, TypeError):
                        amount = 0
                    try:
                        cap = max(1, int(data.get("max", 100)))
                    except (ValueError, TypeError):
                        cap = 100
                    pl["hp"] = max(0, min(cap, pl.get("hp", 100) + amount))
                    pl["last"] = time.time()
                    self._send_json({"ok": True, "hp": pl["hp"]})
                else:
                    self._send_json({"ok": False})
            return

        self._send_json({"error": "nope!!"}, 404)

    def do_GET(self):
        url = urllib.parse.urlparse(self.path)
        if url.path in ("/login", "/logout") and not FORMBAR_MODE:
            self._redirect("/") # nothing to log into
            return
        if url.path == "/login":
            # formbar return with token
            token = urllib.parse.parse_qs(url.query).get("token", [""])[0]
            if not token:
                current_url = app_url(self.headers)
                back = urllib.parse.quote(f"{current_url}/login", safe="")
                self._redirect(f"{FORMBAR_CLIENT_URL}/oauth?redirectURL={back}")
                return
            fid, name = formbar_user(token)
            if not fid:
                self._send_json({"error": "formbar login failed!!"}, 401)
                return
            sid = secrets.token_hex(16)
            sessions[sid] = {"sid": sid, "fid": fid, "name": name, "pin": None}
            secure = "; Secure" if app_url(self.headers).startswith("https") else ""
            self._redirect("/", f"pch_sid={sid}; Path=/; HttpOnly; SameSite=Lax{secure}")
            return
        if url.path == "/logout":
            sess = self._session()
            if sess:
                sessions.pop(sess["sid"], None)
            self._redirect("/", "pch_sid=; Path=/; Max-Age=0")
            return
        if self.path == "/api/me":
            sess = self._session()
            self._send_json({
                "logged_in": bool(sess),
                "formbar_mode": FORMBAR_MODE,
                "name": sess["name"] if sess else None,
                "has_pin": bool(sess and sess.get("pin")),
                "needs_pin": DIGIPOGS_ON,
                "round_cost": ROUND_COST,
                "malice_price": MALICE_PRICE,
                "malice_per_buy": MALICE_PER_BUY,
            })
            return
        if self.path == "/api/players":
            now = time.time()
            with lock:
                stale = [pid for pid, pl in players.items() if now - pl["last"] > TIMEOUT]
                for pid in stale:
                    print(f"!! {players[pid]['name']} timed out", flush=True)
                    del players[pid]
                    last_hit.pop(pid, None)
                update_rockets(now)
                snapshot = {}
                for pid, pl in players.items():
                    # safe keys
                    d = {k: pl.get(k) for k in ("name", "hp", "alive", "away") + STATE_KEYS}
                    d["in_round"] = phase == "round" and pid in round_players
                    d["stun"] = round(max(0, pl.get("stun_until", 0) - now), 2)
                    d["maxhp"] = pl.get("maxhp", 100) # true bars
                    d["countered"] = bool(pl.pop("countered", False)) # once flag
                    # fresh shoves
                    _kb = pl.get("kb")
                    if _kb and now - _kb.get("at", 0) < 0.5:
                        d["kb"] = _kb
                    else:
                        if _kb:
                            pl.pop("kb", None)
                        d["kb"] = None
                    d["idle"] = round(now - pl.get("last", now), 1)
                    d["char"] = pl.get("char")
                    d["killer_char"] = pl.get("killer_char")
                    d["malice"] = malice.get(pl["fid"], 0)
                    d["paid"] = pl.get("paid")
                    d["pay_msg"] = pl.get("pay_msg", "")
                    snapshot[pid] = d
                taken = {pl.get("char") for pl in players.values() if pl.get("char")}
                self._send_json({
                    "round": current_round,
                    "phase": phase,
                    "time_left": max(0, int(phase_end - now)) if phase != "lobby" else 0,
                    "grace": phase == "round" and now < round_start + GRACE_TIME,
                    "killer_id": killer_id,
                    "killer_name": players[killer_id]["name"] if killer_id in players else None,
                    "notice": (f"EVIL {last_killer_name} left... round ending!!" if pending_end and phase == "round"
                               else ("LAST MAN STANDING!!" if lms_notice_until > now and phase == "round" else None)),
                    "notice_left": (max(0, int(pending_end - now)) if pending_end and phase == "round"
                                    else (max(0, int(lms_notice_until - now)) if lms_notice_until > now and phase == "round" else 0)),
                    "result": result,
                    "spikes": [dict(s, id=sid) for sid, s in spikes.items()],
                    "bombs": [dict(s, id=bid) for bid, s in bombs.items()],
                    "tosses": [dict(s) for s in bomb_tosses.values()],
                    "rockets": [dict(r, age=round(now - r["at"], 2)) for r in rockets.values()],
                    "blasts": [dict(b, age=round(now - b["at"], 2)) for b in blasts],
                    "alerts": list(alerts),
                    "announces": [{"text": a["text"], "by": a.get("by", "?"), "age": round(now - a["at"], 2)} for a in announces],
                    "chat": [dict(m) for m in chat_log],
                    "chars": [dict(c, taken=c["id"] in taken) for c in CHARACTERS],
                    "players": snapshot,
                })
            return
        return super().do_GET()

    def log_message(self, *args):
        pass # stay quiet


if __name__ == "__main__":
    load_malice()
    print(f"[CONFIG] FORMBAR_MODE is {'ON' if FORMBAR_MODE else 'OFF'} (read {os.environ.get('FORMBAR_MODE', '<unset, default on>')!r})", flush=True)
    if not FORMBAR_MODE:
        print("!! FORMBAR_MODE is off - no formbar, no digipogs, everyone is a mod. local testing only!! (add ?name=bob to the page url to pick a name)", flush=True)
    elif not FORMBAR_ADDRESS:
        print("!! FORMBAR_ADDRESS is not set in .env, nobody can log in!!", flush=True)
    threading.Thread(target=game_tick, daemon=True).start()
    try:
        server = DualStackServer(("::", PORT, 0, 0), Handler)
        print("dual-stack!! ipv4 + ipv6!!", flush=True)
    except Exception:
        server = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)
    print(f"party crashers homecoming is LIVE at http://localhost:{PORT} !! ({os.path.abspath(__file__)})", flush=True)
    print("friends on your wifi: use your computer's IP instead of localhost!!", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nbye!! :D", flush=True)
