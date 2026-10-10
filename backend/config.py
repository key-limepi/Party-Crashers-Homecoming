"""Paths, .env loading, environment config, tuning constants and static game tables."""
import os
import sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) # repo root
PUBLIC_DIR = os.path.join(HERE, "public") # the only folder served to browsers
DATA_DIR = os.path.join(HERE, "backend", "data")
MALICE_FILE = os.path.join(HERE, "malice.json")
ADMINS_FILE = os.path.join(HERE, "admins.txt")


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
STUN_IFRAMES = 3.0 # stun gap
CHAT_LIFE = 12 # chat life
CHAT_COOLDOWN = 1.5
MUTE_TIME = 600 # mute time

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
QUICK_CHAT = (
    "OK!", "what a save!", "run away!!!", "help me!!",
    "thanks!!", "sorry!!", "nice!!", "wow!!",
    "good luck!!", "killer here!!", "split up!!", "gg!!",
) # only these may post

# fresh stamps
STATE_KEYS = ("x", "y", "facing", "moving", "onGround",
              "invis", "m1", "stunned", "pull", "cower", "windup", "pose", "dashing",
              "peeling", "spinning", "spinwindup", "pullwindup", "lift", "super", "forming", "holding", "whipuntil")

LOCAL_SESSION = {"sid": "local", "fid": "local", "name": "guest", "pin": None} # stands in for a login when FORMBAR_MODE is off
