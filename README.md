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
- **In-game chat:** with a profanity and word filter that handles leetspeak and other bypasses, a spam cooldown, and temporary mutes.
- **AFK handling:**, spectating and a built-in **mod menu** for admins.
- **Dynamic music & sfx:** chase and terror radius themes.

## Requirements
todo: add this when on more stable build

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
