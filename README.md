# PARTY CRASHERS HOMECOMING

A revival of **Party Crashers**: a browser-based, multiplayer 2D platformer asym-horror inspired game 
where one player becomes the killer ("Evil Lux") and everyone else has to survive long enough to escape.

Sad about the death of hit game Party Crashers in uh... 2025 (You don't exist by the way. Party Crashers had NO fans.
I know because I was a dev) Wish it had a revival project that was 500 times better? **YOU ARE IN THE RIGHT PLACE!**

We are remaking the whole game from the ground up in Javascript.

> **Status:** early development. Expect bugs and placeholder art.
> **Photosensitivity warning:** this game will contain flashing lights.

---

## Features

- **Asymmetric multiplayer:** one killer versus a team of survivors, with the killer chosen each round.
- **Round system:** lobby, intermission, character select, then the match itself, with short grace period at the start.
- **Playable charaters:** surviors **Lux** and **Toko**, and the killer **Evil Lux**. each has their own abilities.
- **Dynamic timer:** 120s base plus 30s per player, capped at 10 minutes.
- **Escape zone:** survivors can reach the safe exit to win. similar to the ring exit in Outcome Memories and The Disaster.
- **Formbar login:** names come from your Formbar account, no more typing a username.
- **Digipogs:** every round costs 25 digipogs (set `ROUND_COST` in `.env`), paid into a Formbar pool.
- **Killer malice:** everyone who plays a round gains malice, and the player with the most malice becomes the killer next round (the killer's malice resets). Malice can be bought with digipogs during intermission.
- **In-game chat:** with a profanity and word filter that handles leetspeak and other bypasses, a spam cooldown, and temporary mutes.
- **AFK handling:**, spectating and a built-in **mod menu** for admins.
- **Dynamic music & sfx:** chase and terror radius themes.

## Requirements
* **RAM**: One Billion Gazillion Gigabytes DDR8
* **CPU**: Intel i99 700000 MT/s
* dude its just a web browser game

## Setup

1. Copy `.env-template` to `.env` and fill in `FORMBAR_ADDRESS`, `URL` and `POOL_ID`.
2. Add your Formbar user ID to `admins.txt` if you want the mod menu.
3. Players log in with Formbar and enter their digipog PIN once. The PIN is kept in server memory only.

**Local testing:** set `FORMBAR_MODE=false` in `.env` to skip Formbar login and digipogs. There is no login at all: click the title screen and you're in as a guest (or open `http://localhost:8000/?name=bob` to pick a name). Every browser tab is its own player and everyone counts as a mod, so you can test dev characters like Nyan Cyat with a couple of tabs. Leave it `true` when hosting for real.

Costs and malice settings (all in `.env`): `ROUND_COST` (25), `MALICE_PRICE` (10), `MALICE_PER_BUY` (1), `MALICE_PER_ROUND` (1). Set `ROUND_COST=0` for free rounds.

## Quick start

### Windows
Double click **`start-server.bat`**. Keep the window open while you play.

### macOS / Linux
```bash
./start-server.sh
```
(You may need `chmod +x start-server.sh` first.)

### Or run it directly
```bash
python3 server.py          # http://localhost:8000
python3 server.py 8080     # custom port
```
 
Then open **http://localhost:8000** in your browser.
