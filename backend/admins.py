"""Mod menu ids (admins.txt) and the is_admin check."""
from .config import ADMINS_FILE, FORMBAR_MODE


def load_admins():
    """mod menu ids"""
    try:
        with open(ADMINS_FILE, encoding="utf-8") as f:
            return {l.strip() for l in f if l.strip() and not l.strip().startswith("#")}
    except OSError:
        return set()

def is_admin(fid):
    """mod menu + dev characters, everyone is a mod in local testing"""
    return not FORMBAR_MODE or fid in load_admins()
