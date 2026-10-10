"""URL -> function tables for the HTTP handler.

Every route is a plain function taking the request handler `h` (see web/handler.py: h.send_json,
h.session, h.ip, h.redirect, h.headers) plus either the decoded JSON body (POST) or the parsed url (GET).
"""
from . import auth, combat, lobby, mod, players, snapshot, traps

# POST routes, matched against the full request path
POST_ROUTES = {
    "/api/pin": auth.pin,
    "/api/join": players.join,
    "/api/malice/buy": lobby.malice_buy,
    "/api/state": players.state_post,
    "/api/afk": players.afk,
    "/api/leave": players.leave,
    "/api/intro": lobby.intro,
    "/api/spike": traps.spike,
    "/api/bomb": traps.bomb,
    "/api/rocket": traps.rocket,
    "/api/hit": combat.hit,
    "/api/pick": lobby.pick,
    "/api/chat": lobby.chat,
    "/api/mod": mod.mod_action,
    "/api/heal": players.heal,
}

# GET routes that ignore the query string (formbar's login redirect carries ?token=...)
GET_PATH_ROUTES = {
    "/login": auth.login,
    "/logout": auth.logout,
}

# GET routes matched against the full request path
GET_ROUTES = {
    "/api/me": auth.me,
    "/api/players": snapshot.players_snapshot,
}
