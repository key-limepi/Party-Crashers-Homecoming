"""generated from the old do_POST; module: players"""

import secrets
import time

from .. import state
from ..admins import is_admin
from ..config import DIGIPOGS_ON, FORMBAR_MODE, STATE_KEYS


def join(h, data):
    """POST /api/join"""
    sess = h.session()
    if not sess:
        h.send_json({"error": "log in with formbar!!", "login": True}, 401)
        return
    if DIGIPOGS_ON and not sess.get("pin"):
        h.send_json({"error": "enter your digipog pin!!", "pin": True}, 401)
        return
    with state.lock:
        if state.phase == "round":
            # locked match
            h.send_json({"error": "match running!!"}, 403)
            return
        pid = secrets.token_hex(4)
        # fid identity, mods/mutes follow
        fid = sess["fid"]
        tab = str(data.get("tab") or "")[:16]
        name = sess["name"]
        if FORMBAR_MODE:
            # one tab per account
            for pl in state.players.values():
                if pl.get("fid") == fid and pl.get("tab") != tab and time.time() - pl.get("last", 0) <= 10:
                    h.send_json({"error": "already online in another tab!!"}, 403)
                    return
            for _old in [p for p, pl in state.players.items() if pl.get("fid") == fid]:
                if state.killer_id == _old:
                    state.killer_id = pid
                del state.players[_old]
        else:
            # local testing: every tab is its own player, ?name=bob picks a name
            fid = f"{fid}:{tab}"
            name = str(data.get("name") or "").strip()[:20] or f"guest {tab[:3]}"
            taken = {pl["name"] for pl in state.players.values()}
            base, n = name, 1
            while name in taken:
                n += 1
                name = f"{base} {n}"
        state.players[pid] = {
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
    print(f"!! {state.players[pid]['name']} joined ({pid})", flush=True)
    h.send_json({"id": pid, "fid": fid, "name": state.players[pid]["name"],
                     "mod": is_admin(fid),
                     "muted": max(0, int(state.muted_fids.get(fid, 0) - time.time()))})
    return


def state_post(h, data):
    """POST /api/state"""
    with state.lock:
        pl = state.players.get(data.get("id"))
        if pl:
            for key in STATE_KEYS:
                if key in data:
                    pl[key] = data[key]
            # fresh posts
            if data.get("r") == state.current_round:
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
    h.send_json({"ok": True})
    return


def afk(h, data):
    """POST /api/afk"""
    with state.lock:
        pl = state.players.get(data.get("id"))
        if pl:
            was_away = bool(pl.get("away", False))
            pl["away"] = bool(data.get("away", False))
            pl["last"] = time.time()
            if was_away != pl["away"]:
                print(f"[AFK] {pl['name']} ({data.get('id')}) {was_away} -> {pl['away']}", flush=True)
    h.send_json({"ok": bool(pl)})
    return


def leave(h, data):
    """POST /api/leave"""
    pid = data.get("id")
    with state.lock:
        gone = state.players.pop(pid, None)
        state.last_hit.pop(pid, None)
    if gone:
        print(f"!! {gone['name']} left", flush=True)
    h.send_json({"ok": True})
    return


def heal(h, data):
    """POST /api/heal"""
    # heals rise
    with state.lock:
        pl = state.players.get(data.get("id"))
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
            h.send_json({"ok": True, "hp": pl["hp"]})
        else:
            h.send_json({"ok": False})
    return

