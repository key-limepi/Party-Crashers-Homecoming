"""generated from the old do_POST; module: combat"""

import time

from .. import state
from ..config import STUN_IFRAMES, TOUCH_COOLDOWN
from ..game import grace_over, is_rocketing


def hit(h, data):
    """POST /api/hit"""
    # both ways
    now = time.time()
    with state.lock:
        atk = state.players.get(data.get("id"))
        vic = state.players.get(data.get("victim"))
        atk_evil = data.get("id") == state.killer_id
        vic_evil = data.get("victim") == state.killer_id
        if (atk and vic and data.get("victim") != data.get("id")
            and data.get("id") in state.round_players and data.get("victim") in state.round_players
                and atk_evil != vic_evil and state.phase == "round"
                and atk.get("alive", True) and vic.get("alive", True)
                and grace_over(now)):
            k = atk
            try:
                dmg = max(0, min(100, int(data.get("dmg", 0))))
            except (ValueError, TypeError):
                dmg = 0
            if atk_evil:
                dmg = int(round(dmg * 1.08))
            # 25% damage reduction
            if state.lms_set and not vic_evil:
                dmg = (dmg * 3 + 3) // 4
            try:
                stun = max(0, min(5, float(data.get("stun", 0))))
            except (ValueError, TypeError):
                stun = 0
            # nyan mid rocket, nothing lands
            if is_rocketing(data["victim"]):
                h.send_json({"ok": True})
                return
            # wide swings
            reach = 140 if stun <= 0 else 95
            dx = vic.get("x", 0) - k.get("x", 0)
            dy = vic.get("y", 0) - k.get("y", 0)
            if dx * dx + dy * dy < reach * reach:
                # spared cower
                if atk_evil and vic.get("cower", False):
                    if now - state.last_stun.get(data.get("id"), 0) >= STUN_IFRAMES:
                        atk["stun_until"] = now + 2
                        state.last_stun[data.get("id")] = now
                    # shove back
                    _dx = atk.get("x", 0) - vic.get("x", 0)
                    _dy = atk.get("y", 0) - vic.get("y", 0)
                    _dist = (_dx * _dx + _dy * _dy) ** 0.5 or 1
                    atk["kb"] = {"x": _dx / _dist, "y": _dy / _dist, "at": now, "s": 2}
                    vic["countered"] = True
                    print(f"!! {vic['name']} COUNTERED {k['name']}!!", flush=True)
                    h.send_json({"ok": True})
                    return
                if stun > 0 or now - state.last_hit.get(data["victim"], 0) >= TOUCH_COOLDOWN:
                    state.last_hit[data["victim"]] = now
                    vic["hp"] = max(0, vic.get("hp", 100) - dmg)
                    stack = bool(data.get("stack", False))
                    try:
                        kbp = max(1, min(3, float(data.get("kb", 1))))
                    except (ValueError, TypeError):
                        kbp = 1
                    # stun gaps
                    if stun > 0 and data.get("victim") == state.killer_id and not stack:
                        if now - state.last_stun.get(data["victim"], 0) < STUN_IFRAMES:
                            stun = 0
                        else:
                            state.last_stun[data["victim"]] = now
                    # stack stuns
                    if stun > 0:
                        if stack:
                            vic["stun_until"] = min(max(vic.get("stun_until", 0), now) + stun, now + 6)
                        else:
                            vic["stun_until"] = now + stun
                        # shove back
                        # big shoves
                        if data.get("victim") == state.killer_id:
                            _dx = vic.get("x", 0) - k.get("x", 0)
                            _dy = vic.get("y", 0) - k.get("y", 0)
                            _dist = (_dx * _dx + _dy * _dy) ** 0.5 or 1
                            vic["kb"] = {"x": _dx / _dist, "y": _dy / _dist, "at": now, "s": stun, "p": kbp}
                    if vic["hp"] <= 0:
                        vic["alive"] = False
                    print(f"!! {k['name']} hit {vic['name']} for {dmg}!!", flush=True)
                    h.send_json({"ok": True})
                    return
    h.send_json({"ok": False})
    return

