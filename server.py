#!/usr/bin/env python3
"""tiny multiplayer host
python server.py -> http://localhost:8000
python server.py 8080 -> http://localhost:8080
"""
import hashlib
import json
import os
import random
import re
import secrets
import socket
import sys
import time
import threading
from fnmatch import fnmatchcase
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
TIMEOUT = 25 # patient timeouts
ROUND_BASE = 120 # base time
ROUND_PER_PLAYER = 30 # per player
ROUND_MAX = 600
ROUND_TIME = 300 # backup time
INTER_TIME = 30 # break time
SELECT_TIME = 30 # pick time
GRACE_TIME = 5 # safe start
LMS_DURATIONS = {"lux": 209.712, "sonic": 266.904} # anthem lengths; default track is 105.091s
TOUCH_DIST = 55 # touch range
TOUCH_DMG = 25 # hit damage
TOUCH_COOLDOWN = 1.0
SPIKE_MAX = 5 # trap cap
SPIKE_LIFE = 45 # trap rot
SPIKE_DMG = 30
EXIT_X = 2605 # safe exit
EXIT_SAFE_R = 150

players = {} # player list
spikes = {} # trap list
alerts = [] # ping list
# pick pair
CHARACTERS = [
    {"id": "lux", "name": "LUX"},
    {"id": "toko", "name": "TOKO"},
    {"id": "sonic", "name": "SONIC"},
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
muted_mids = {} # mute list


def load_admins():
    """mod menu ids"""
    try:
        with open(os.path.join(HERE, "admins.txt"), encoding="utf-8") as f:
            return {l.strip() for l in f if l.strip() and not l.strip().startswith("#")}
    except OSError:
        return set()

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
HERE = os.path.dirname(os.path.abspath(__file__))
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
lock = threading.Lock()

phase = "lobby" # phase flow
phase_end = 0.0
pending_end = 0.0 # killer gone
last_killer_name = "EVIL"
# death duel
lms_set = False # once only
lms_notice_until = 0.0 # duel banner
round_start = 0.0
killer_id = None
current_round = 0
result = None # last result
round_players = set() # players eligible for the current round

STATE_KEYS = ("x", "y", "facing", "moving", "onGround",
              "invis", "m1", "stunned", "pull", "cower", "windup", "pose", "dashing",
              "peeling", "spinning", "spinwindup", "pullwindup")
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


def start_intermission():
    # break once
    global phase, phase_end
    phase = "intermission"
    phase_end = time.time() + INTER_TIME
    print("[GAME] State: INTERMISSION (30s)", flush=True)


def start_select():
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
    killer_id = None
    killer_id = random.choice(list(here.keys()))
    print(f"[GAME] preselected evil: {players[killer_id]['name']}", flush=True)
    phase = "select"
    phase_end = time.time() + SELECT_TIME
    print("[GAME] State: CHARACTER_SELECT (30s)", flush=True)


def start_round():
    global phase, phase_end, round_start, killer_id, current_round, result, pending_end
    global lms_set, lms_notice_until
    global round_players
    pending_end = 0
    lms_set = False
    lms_notice_until = 0.0
    eligible = _here_players()
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
        if pl.get("char") not in [c["id"] for c in CHARACTERS]:
            pl["char"] = random.choice(CHARACTERS)["id"]
    for pl in eligible.values():
        pl["alive"] = True
        pl["hp"] = pl.get("maxhp", 100)
        pl["stun_until"] = 0
    spikes.clear()
    del alerts[:]
    last_hit.clear()
    # find killer
    if killer_id not in round_players:
        killer_id = random.choice(list(round_players))
        print(f"!! fallback - {players[killer_id]['name']} is EVIL LUX!!", flush=True)
    current_round += 1
    phase = "round"
    round_start = time.time()
    # flex time
    phase_end = round_start + min(ROUND_MAX, ROUND_BASE + ROUND_PER_PLAYER * len(round_players))
    result = None
    print(f"!! round {current_round} starts - {players[killer_id]['name']} is EVIL LUX!!", flush=True)


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
    del alerts[:]
    last_hit.clear()
    name = players.get(killer_id, {}).get("name", "???") if killer_id else "???"
    result = {"winner": winner, "killer_name": name}
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
                for sid in [s for s in spikes if now - spikes[s]["at"] > SPIKE_LIFE]:
                    del spikes[sid] # old traps
                while alerts and now - alerts[0]["at"] > 5:
                    alerts.pop(0)
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
                    elif all(pl.get("char") for pid, pl in here.items() if pid != killer_id):
                        # quick start
                        print("[GAME] everyone picked - starting early!!", flush=True)
                        start_round()
                    elif now >= phase_end:
                        if len(_here_players()) >= 2:
                            start_round()
                        else:
                            phase = "lobby"
                            killer_id = None
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
                                    phase_end = now + LMS_DURATIONS.get(_lc, 105.091)
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
        if self.path == "/api/join":
            data = self._read_json()
            with lock:
                if phase == "round":
                    # locked match
                    self._send_json({"error": "match running!!"}, 403)
                    return
                pid = secrets.token_hex(4)
                # stays forever
                # name numbers
                mid = str(data.get("mid") or "")[:32] or secrets.token_hex(8)
                # drop ghosts
                tab = str(data.get("tab") or "")[:16]
                for _old in [p for p, pl in players.items()
                             if tab and pl.get("tab") == tab]:
                    del players[_old]
                # take over
                for _old in [p for p, pl in players.items()
                             if pl.get("mid") == mid and time.time() - pl.get("last", 0) > 10]:
                    if killer_id == _old:
                        killer_id = pid
                    del players[_old]
                # tab numbers
                disc = int(hashlib.sha1(f"{mid}:{tab}".encode()).hexdigest(), 16) % 10000
                raw_name = str(data.get("name", "friend"))[:16] or "friend"
                if not is_clean(raw_name):
                    raw_name = "friend"
                players[pid] = {
                    "mid": mid,
                    "tab": tab,
                    "char": None, # pick spot
                    "maxhp": 100, # told maxhp
                    "name": f"{raw_name}#{disc:04d}",
                    "x": 60, "y": 100, "facing": 1,
                    "hp": 100, "moving": False, "onGround": False,
                    "alive": True, "invis": False, "m1": True,
                    "stunned": False, "pull": False, "away": False, "cower": False,
                    "windup": False, "pose": None, "dashing": False, "stun_until": 0,
                    "last": time.time(),
                }
            print(f"!! {players[pid]['name']} joined ({pid})", flush=True)
            self._send_json({"id": pid, "mid": mid, "name": players[pid]["name"],
                             "mod": mid in load_admins(),
                             "muted": max(0, int(muted_mids.get(mid, 0) - time.time()))})
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
                            maxhp = max(1, min(250, maxhp))
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
                    if abs(x - EXIT_X) < EXIT_SAFE_R:
                        self._send_json({"ok": False, "reason": "too close to exit!!"})
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
                    # 25% damage reduction
                    if lms_set and not vic_evil:
                        dmg = (dmg * 3 + 3) // 4
                    try:
                        stun = max(0, min(5, float(data.get("stun", 0))))
                    except (ValueError, TypeError):
                        stun = 0
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
                ids = [c["id"] for c in CHARACTERS]
                if me and data.get("id") in _here_players() and phase == "select" and want in ids:
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
            mkey = (me_preview.get("mid") if me_preview else None) or ip
            if now < muted_mids.get(mkey, 0):
                self._send_json({"ok": False, "reason": "muted",
                                 "left": int(muted_mids[mkey] - now)})
                return
            with lock:
                me = players.get(data.get("id"))
                text = str(data.get("text", ""))[:60].strip()
                now = time.time()
                if me and text and now - last_chat.get(data.get("id"), 0) >= CHAT_COOLDOWN:
                    if text not in QUICK_CHAT:
                        self._send_json({"ok": False, "reason": "blocked"})
                    elif not is_clean(text):
                        muted_mids[me.get("mid") or ip] = now + MUTE_TIME
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
                if not me or me.get("mid") not in load_admins():
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
                        start_round()
                    print(f"!! mod skipped the wait!!", flush=True)
                elif action == "forcestart":
                    if len(_here_players()) >= 2:
                        start_round()
                        print(f"!! mod forced a match!!", flush=True)
                    else:
                        self._send_json({"ok": False, "reason": "need two active players!!"})
                        return
                elif action == "makekiller":
                    target = data.get("target")
                    if target == "random" or target not in players:
                        cand = [pid for pid, pl in players.items() if pl.get("alive", True)]
                        if cand:
                            killer_id = random.choice(cand)
                    else:
                        killer_id = target
                    if killer_id in players:
                        print(f"!! mod made {players[killer_id]['name']} EVIL!!", flush=True)
                elif action == "clearspikes":
                    spikes.clear()
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
        if self.path == "/api/players":
            now = time.time()
            with lock:
                stale = [pid for pid, pl in players.items() if now - pl["last"] > TIMEOUT]
                for pid in stale:
                    print(f"!! {players[pid]['name']} timed out", flush=True)
                    del players[pid]
                    last_hit.pop(pid, None)
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
                    "alerts": list(alerts),
                    "chat": [dict(m) for m in chat_log],
                    "chars": [dict(c, taken=c["id"] in taken) for c in CHARACTERS],
                    "players": snapshot,
                })
            return
        return super().do_GET()

    def log_message(self, *args):
        pass # stay quiet


if __name__ == "__main__":
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
