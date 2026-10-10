    async function joinOnline() {
      // rejoin first
      if (net.id) {
        try {
          await fetch('/api/leave', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: net.id }),
          });
        } catch (e) { /* bye anyway!! */ }
        net.id = null;
      }
      netStatus.textContent = 'knocking...';
      try {
        const res = await fetch('/api/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tab: tabId, name: new URLSearchParams(location.search).get('name') || '' }), // name only counts with FORMBAR_MODE=false
        });
        if (res.status === 401) {
          // no login
          const e = await res.json().catch(() => ({}));
          if (e.login) { location.href = '/login'; return; }
          showPinPrompt();
          sayStatus(e.error || 'enter your digipog pin!!', 8);
          return;
        }
        if (res.status === 403) {
          // still knocking
          let msg = 'match running - waiting to sneak in!!';
          try {
            const e = await res.json();
            if (e && /locked/.test(e.error || '')) msg = 'match locked - waiting for next one!!';
            if (e && /tab/.test(e.error || '')) msg = e.error;
          } catch (e2) { /* plain 403!! */ }
          netStatus.textContent = msg;
          clearTimeout(net.retry);
          net.retry = setTimeout(() => joinOnline(), 3000);
          return;
        }
        if (!res.ok) throw new Error('nope');
        const joined = await res.json();
        net.id = joined.id;
        setAFK(false); // fresh joins play
        hideFatal(); // error clear
        // fake loading
        const held = Date.now() - (net.titleT0 || Date.now());
        setTimeout(() => {
          const titleEl = document.getElementById('titleScreen');
          if (titleEl) titleEl.style.display = 'none';
          pinBanner.style.display = 'none';
          titleLive = false;
        }, Math.max(0, 3000 - held));
        clearTimeout(net.retry);
        net.mod = !!joined.mod;
        chatBox.readOnly = !net.mod;
        chatBox.placeholder = net.mod ? 'type a message!! (enter)' : 'say something!! (enter)';
        net.everOnline = true; // stay joined
        net.fid = joined.fid;
        sayStatus(`online as ${joined.name}!! friends can see you!! :D`, 4);
        if (window.__wantDebug && joined.mod) openModMenu();
        if (joined.muted > 0) applyMute(joined.muted); // muted stay
        if (!net.timer) {
          // chain ticks
          const loop = () => {
            net.timer = setTimeout(async () => {
              try { await netTick(); } catch (e) { /* next tick!! */ }
              loop();
            }, 40); // tick rate
          };
          loop();
          window.addEventListener('beforeunload', () => {
            navigator.sendBeacon && navigator.sendBeacon('/api/leave', JSON.stringify({ id: net.id }));
          });
        }
      } catch (e) {
        netError('cannot reach the server!! retrying...', 10);
        clearTimeout(net.retry);
        net.retry = setTimeout(() => joinOnline(), 3000);
      }
    }
    // catch up
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        game.input.left = game.input.right = game.input.jump = false;
        if (net.id) netTick();
      }
    });
    // deferred join
    (function autoJoin() {
      if (location.protocol === 'file:') {
        netError('open this page through the server, not as a file!!', 3600);
        return;
      }
      loadMe().then((me) => {
        if (me.logged_in) sayStatus(`logged in as ${me.name}!! click the title to play!!`, 0);
        if (me.logged_in && me.needs_pin && !me.has_pin) {
          showPinPrompt();
          sayStatus('enter your digipog pin!!', 0);
        }
      }).catch(() => {});
    })();
    async function netTick() {
      const p = game.player;
      if (!net.id || !p) return;
      if (document.hidden) {
        // dead tabs
        const now = performance.now();
        let missed = Math.min((now - (net.lastWall || now)) / 1000, 2);
        net.lastWall = now;
        let guard = 0;
        while (missed > 0.001 && guard++ < 120) {
          const step = Math.min(missed, 1 / 30);
          game.update(step);
          missed -= step;
        }
      } else {
        net.lastWall = performance.now();
      }
      try {
        const t0 = performance.now();
        await fetch('/api/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: net.id, r: net.round, maxhp: p.maxHp,
            x: Math.round(p.pos.x * 10) / 10, y: Math.round(p.pos.y * 10) / 10,
            facing: p.facing, hp: Math.ceil(p.hp),
            moving: Math.abs(p.vel.x) > 10, onGround: p.onGround,
            alive: p.alive !== false,
            invis: p.invis === true, m1: K.m1ok !== false, peeling: SN.peeling === true, spinning: SN.spinning === true, spinwindup: !!SN.spinWindup,
            lift: TW.flying === true, super: SS.transformed === true, forming: !!SS.formUntil, holding: TW.holding === true, whipuntil: !!TW.whipUntil, kickUntil: !!T.kickUntil, jabUntil: !!T.jabUntil, throwUntil: !!TW.throwUntil,
            stunned: (p.stunT || 0) > 0, pull: Date.now() < K.pullUntil,
            cower: (p.cowerT || 0) > 0, windup: !!S.windupUntil || !!K.windupUntil || !!SN.windupUntil || !!SN.spinWindup || !!K.pullWindup, pullwindup: !!K.pullWindup,
            dashing: !!S.dashing || NY.dashing,
            pose: (poseName && Date.now() < poseUntil) ? poseName : null,
          }),
        });
        const data = await (await fetch('/api/players')).json();
        net.ping = Math.round(performance.now() - t0); // trip time
        const prevRound = net.round;
        const others = data.players || {};
        // fresh id
        if (!others[net.id]) {
          net.id = null;
          game.remotes = [];
          joinOnline();
          return;
        }
        const prevPhase = net.phase;
        const you = others[net.id];
        let justRevived = false;
        // phase reset
        if (data.phase && data.phase !== net.phase) {
          net.phase = data.phase;
          soloIdx = -1; // reset ears
          lmsTrack = null; lmsEnded = false; // reset lms
          beds.lms.pause(); beds.lmslux.pause(); beds.lmssonic.pause(); beds.lmstails.pause(); beds.lmsnyan.pause(); beds.chase.pause(); beds.terror.pause();
          clearEvil(p);
          trippedIds.clear();
          if (data.phase === 'select' || data.phase === 'round') net.costume = null; // picks rule now
          if (data.phase !== 'round' || you?.in_round) {
            if (data.phase === 'round') game.switchMap('main', 100, 880);
            else {
              game.switchMap('inter', 6120, 100); // island map
              if ((data.phase === 'intermission' || data.phase === 'lobby') && !p.evil) {
                // random fighter, kit and all
                net.costume = lobbyCostume(net.id);
                wearChar(net.costume);
                game.moveSpeed = net.costume === 'sonic' ? 270 : 240;
              }
            }
            if (!p.evil) { p.maxHp = data.phase === 'round' ? survHp() : 100; } // drop buffs, nyan keeps its hp
            p.hp = p.maxHp;
            game.respawn();
            justRevived = true;
            game.cameraTarget = null;
            specId = null;
            roleBox.style.display = 'none';
            // fast revive
            fetch('/api/state', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: net.id, r: data.round, maxhp: p.maxHp,
                x: Math.round(p.pos.x * 10) / 10, y: Math.round(p.pos.y * 10) / 10,
                facing: p.facing, hp: Math.ceil(p.hp),
                moving: false, onGround: p.onGround, alive: true,
                invis: false, m1: true, stunned: false, pull: false,
              }),
            }).catch(() => {});
          }
        }
        net.round = data.round;
        // take hits
        if (!justRevived && you && data.round === prevRound && you.hp < p.hp && p.alive !== false) {
          game.hurtPlayer(Math.ceil(p.hp - you.hp), 'killer');
        }
        net.ekid = data.killer_id || null;
        net.amKillerElect = !!net.id && data.killer_id === net.id && data.phase !== 'round';
        net.killerPick = others[data.killer_id]?.killer_char || you?.killer_char || 'evil';
        // evil incoming
        // far exile
        if (net.amKillerElect && !net.wasElect) {
          clearTimeout(roleTimer);
          roleBox.textContent = 'YOU WILL BE EVIL!!';
          roleBox.style.color = '#ff4757';
          roleBox.style.display = 'block';
          roleTimer = setTimeout(() => { roleBox.style.display = 'none'; }, 3000);
          sayStatus('pick your killer!!', 5);
          game.spawn = { x: 6650, y: 100 };
          game.respawn();
        }
        net.wasElect = net.amKillerElect;
        // evil swap
        const amEvil = data.phase === 'round' && data.killer_id === net.id;
        const fresh = data.phase !== prevPhase;
        if (amEvil !== net.wasEvil) {
          net.wasEvil = amEvil;
          applyRole(amEvil);
          if (fresh && data.phase === 'round') game.respawn(); // evil spawn
          clearTimeout(roleTimer);
          if (fresh && data.phase === 'round') fileSfx(SFX + 'going_into_round.wav', {});
          if (fresh && data.phase === 'intro' && net.killerPick !== 'bear5') voiceSfx(vpick(VL_OPEN));
          roleBox.textContent = amEvil
            ? (net.killerPick === 'bear5' ? 'YOU ARE BEAR5!!' : fresh ? 'YOU ARE EVIL LUX!!' : 'YOU ARE EVIL NOW!!')
            : (fresh ? `you are ${(net.pick || 'lux').toUpperCase()}!! :D` : 'BACK TO NORMAL!!');
          roleBox.style.color = amEvil ? '#ff4757' : '#ffa502';
          roleBox.style.display = 'block';
          roleTimer = setTimeout(() => { roleBox.style.display = 'none'; }, 3000);
        }
        if (fresh && data.phase === 'round') {
          net.wasEvil = amEvil;
          applyRole(amEvil); // fresh stats even if role kept
          game.respawn(); // evil spawn
        }
        // black while map loads
        if (mapLoad) {
          const art = game.levelArt, bd = game.levelBackdrop;
          const loading = (game.activeMap === 'main' &&
            ((art && !art.complete) || (bd && !bd.complete))) ||
            data.phase === 'intro';
          mapLoad.style.display = loading ? 'block' : 'none';
        }
        // killer intro video
        if (introWrap) {
          if (data.phase === 'intro' && data.round !== net._introRound) {
            net._introRound = data.round;
            // 2s breather, then show
            setTimeout(() => {
              if (net._introRound === data.round && net.phase === 'intro' && introWrap.style.display !== 'block') {
                introWrap.style.display = 'block';
                const isBearIntro = others[data.killer_id]?.killer_char === 'bear5';
                introVid.style.display = isBearIntro ? 'none' : '';
                bearIntro.style.display = isBearIntro ? 'flex' : 'none';
                if (isBearIntro) {
                  introVid.pause();
                } else {
                  try { introVid.currentTime = 0; } catch (_) { /* hush!! */ }
                  introVid.play().catch(() => { introWrap.style.display = 'none'; });
                }
              }
            }, 2000);
          } else if (data.phase !== 'intro' && introWrap.style.display !== 'none') {
            introWrap.style.display = 'none';
            try { introVid.pause(); } catch (_) { /* hush!! */ }
            introVid.style.display = '';
            bearIntro.style.display = 'none';
          }
        }
        // phase text
        let phaseText = 'lobby!!';
        if (data.phase === 'lobby') {
          // head count
          const here = Object.entries(others)
            .filter(([id, o]) => id !== net.id && !o.away && (o.idle || 0) < 10).length
            + (net.afk ? 0 : 1);
          phaseText = `lobby - waiting for players (${here}/2)!!`;
        } else if (data.phase === 'intermission') {
          const t = Math.max(0, data.time_left || 0);
          const r = data.result;
          const who = r && r.winner === 'killer' ? `EVIL ${r.killer_name} WINS!!` : 'SURVIVORS WIN!!';
          const fee = net.me && net.me.round_cost ? ` (${net.me.round_cost} digipogs a round)` : '';
          phaseText = `${who} picks open in ${t}s!!${fee}`;
          // countdown tick, intermission only
          if (t <= 5 && t > 0 && t !== net._tickSec) {
            net._tickSec = t;
            fileSfx(SFX + 'timertick.wav', {});
          }
        } else if (data.phase === 'select') {
          const t = Math.max(0, data.time_left || 0);
          phaseText = you && you.paid === null ? 'paying the round fee...'
            : you && you.paid === false && net.me && net.me.round_cost ? `NOT PLAYING: ${you.pay_msg || 'round fee failed'}!!`
            : `PICK YOUR CHARACTER!! (${t}s)`;
        } else if (data.phase === 'intro') {
          phaseText = 'GET READY!!';
        } else if (data.phase === 'round') {
          const t = Math.max(0, data.time_left || 0);
          const mm = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
          phaseText = !you?.in_round
            ? (you?.away ? 'AFK - spectating this round!!' : 'NOT IN THIS ROUND - spectating!!')
            : data.notice
            ? `${data.notice} (${data.notice_left || 0}s)`
            : data.grace
            ? `GRACE - RUN!! (${mm})`
            : (p.evil ? `${mm} - YOU ARE EVIL!! Z = hit!!` : `${mm} - run!! evil: ${data.killer_name || '???'}`);
        }
        if (phaseText !== lastPhaseText) { phaseLine.textContent = phaseText; lastPhaseText = phaseText; }
        // malice shop
        malicePanel.style.display = 'block';
        maliceNum.textContent = you.malice || 0;
        buyMaliceBtn.disabled = data.phase !== 'intermission';
        buyMaliceBtn.textContent = net.me ? `buy ${net.me.malice_per_buy} malice (${net.me.malice_price} digipogs)` : 'buy malice';
        // party list
        const showParty = data.phase === 'round' && net.id;
        partyList.style.display = showParty ? 'flex' : 'none';
        if (showParty && Date.now() - (net._partyT || 0) > 250) {
          net._partyT = Date.now();
          renderParty((data.players || {})[net.id], p, data.players, data.killer_id);
        }
        const seen = new Set();
        for (const [id, d] of Object.entries(others)) {
          if (id === net.id) continue;
          seen.add(id);
          let r = game.remotes.find((r) => r.id === id);
          if (!r) {
            r = {
              id, isRemote: true, name: d.name,
              pos: { x: d.x, y: d.y }, vel: { x: 0, y: 0 },
              tx: d.x, ty: d.y,
              w: 28, h: 60, drawW: 50, drawH: 70, facing: 1,
              sprites: luxSprites, walkDist: 0, animTime: 0,
              onGround: true, hp: 100, maxHp: 100, alive: true,
            };
            game.remotes.push(r);
          }
          r.tx = d.x; r.ty = d.y; // glide targets
          // smooth history
          const nowHist = performance.now();
          r.hist = r.hist || [{ x: d.x, y: d.y, t: nowHist }, { x: d.x, y: d.y, t: nowHist }];
          r.hist.push({ x: d.x, y: d.y, t: nowHist });
          while (r.hist.length > 4) r.hist.shift();
          r.name = d.name; r.facing = d.facing; r.hp = d.hp;
          r.char = id === data.killer_id ? (d.killer_char || 'evil') : (d.char || 'lux');
          r.onGround = d.onGround ?? true;
          r.alive = d.alive ?? d.hp > 0;
          r.evil = id === data.killer_id;
          r.maxHp = d.maxhp || (r.evil && r.char === 'bear5' ? 999 : (r.evil ? 250 : 100)); // true bars
          r.super = !!d.super; // glowing or not
          r.rainbow = !!d.super; // gold bar
          r.pulseWhite = !!d.super; // glow pulse
          r.forming = !!d.forming; // mid glow up
          r.tremble = !!d.forming;
          r.whiteFlash = !!d.forming;
          // lobby face, matches all screens
          const rface = (!d.char && (net.phase === 'lobby' || net.phase === 'intermission')) ? lobbyCostume(id) : (r.char || 'lux');
          r.sprites = r.evil ? (r.char === 'bear5' ? bear5Sprites : evilSprites) : (r.char === 'supersonic' && !r.super && !r.forming ? sonicSprites : (r.char === 'tails' && r.holdingBomb ? tailsCarrySprites : (charSprites[rface] || luxSprites))); // see all
          // true size
          const rkey = rface + (r.evil ? '*' : '') + (r.super ? '!' : '') + (r.forming ? '?' : '') + (r.holdingBomb ? 'h' : '');
          if (r._lastChar !== rkey) { r._baseFrame = null; r._lastChar = rkey; }
          r.drawW = r.char === 'bear5' ? 76 : 50;
          r.drawH = r.char === 'bear5' ? 94 : (r.char === 'nyan' ? NYAN_H : (!r.evil && (rface === 'sonic' || rface === 'supersonic' || rface === 'tails')) ? 64 : 70);
          r.invis = !!d.invis;
          r.stunned = !!d.stunned;
          r.pull = !!d.pull;
          r.peeling = !!d.peeling;
          r.spinning = !!d.spinning;
          r.spinwindup = !!d.spinwindup;
          r.pullwindup = !!d.pullwindup;
          r.lift = !!d.lift;
          r.whipUntil = !!d.whipuntil;
          r.kickUntil = !!d.kickUntil;
          r.jabUntil = !!d.jabUntil;
          r.throwUntil = !!d.throwUntil;
          r.holdingBomb = !!d.holding;
          r.dashing = !!d.dashing;
          r.away = !!d.away;
          r.inRound = !!d.in_round;
          r.redFlash = !!d.windup && !!r.evil; // red warning
          r.cyanFlash = !!d.windup && !r.evil; // cyan windup
          r.cowering = !!d.cower;
          // pose frames
          if (d.windup) {
            if (!r._wasWindup) r._windupStart = Date.now();
            if (r.evil) {
              r.poseImg = r.char === 'bear5' ? bear5Image : (r.pullwindup ? evilAct.pullwindup : evilWindup[0]);
            } else if (r.char === 'sonic') {
              // revving up
              if (r.spinwindup) {
                r.poseImg = sonicSprites.spin[Math.floor(Date.now() / 100) % 3];
              } else {
                const t = (Date.now() - (r._windupStart || Date.now())) / 3000;
                const w = sonicSprites.walk;
                r.poseImg = t < 0.3 ? sonicSprites.charge
                  : t < 0.7 ? w[Math.floor(Date.now() / 100) % w.length]
                  : sonicSprites.peel[Math.floor(Date.now() / 60) % 4];
              }
            } else {
              r.poseImg = luxSprites.run[0];
            }
            r.poseUntil = Date.now() + 150;
          } else if (d.pose && d.pose !== r.pose) {
            r.pose = d.pose;
            r.poseUntil = Date.now() + 350;
            r.poseImg = poseImage(r.evil, r.char, d.pose);
            if (r.char === 'bear5' && d.pose === 'bear-fold') {
              r._bearFoldStart = Date.now();
              r._bearFoldDuration = 440;
              r._bearFoldUntil = r._bearFoldStart + r._bearFoldDuration;
            }
          } else if (!d.pose) {
            r.pose = null;
          }
          r._wasWindup = !!d.windup;
          // sync sonic flags
          if (!r.evil) {
            r.peeling = !!r.peeling;
            r.spinning = !!r.spinning;
            r.spinWindup = !!r.spinwindup;
          }
          // fly for all
          if (!r.evil && r.lift) {
            r.poseImg = tailsSprites.fly[Math.floor(Date.now() / 120) % 3];
            r.poseUntil = Date.now() + 150;
          }
          // super glow for all
          if (!r.evil && r.char === 'supersonic' && r.forming) {
            r.poseImg = superSprites.transform[Math.floor(Date.now() / 200) % superSprites.transform.length];
            r.poseUntil = Date.now() + 150;
          }
          const lostHp = r._lastHp !== undefined && r.hp < r._lastHp;
          if (lostHp && !r.evil && data.phase === 'round' && others[data.killer_id]?.killer_char === 'bear5') {
            spawnBearHitFx(r.pos.x + r.w / 2, r.pos.y + r.h / 2);
          }
          if (p.evil && lostHp) {
            fileSfx(net.killerPick === 'bear5' ? SFX + 'jumpscare.mp3' : SFX + 'm1_hit.wav', {});
          }
          if (r._wasAlive && !r.alive && data.phase === 'round') {
            fileSfx(SFX + 'death.mp3', {}); // they died
            if (!r.evil) voiceSfx(vpick(VL_KILL)); // killer brags
          }
          r._wasAlive = !!r.alive;
          r._lastHp = r.hp;
          if (!r._wasSuper && r.super) {
            // watch new gold
            r._focusUntil = Date.now() + 1500;
          }
          r._wasSuper = !!r.super;
          if (r.forming) {
            // keep watching glow
            r._focusUntil = Date.now() + 2800;
          }
        }
        game.remotes = game.remotes.filter((r) => seen.has(r.id));
        // learn picks
        const mePick = (data.players || {})[net.id];
        if (mePick && mePick.char && mePick.char !== net.pick) {
          net.pick = mePick.char;
          if (!p.evil) wearChar(mePick.char === 'supersonic' && !SS.transformed ? 'sonic' : mePick.char);
        } else if (mePick && !mePick.char && net.pick) {
          net.pick = null;
          if (!p.evil) wearChar('lux');
        }
        // server truth
        if (!statusUntil || Date.now() > statusUntil) {
          netStatus.style.color = ''; // no error
          const mc = (mePick && mePick.char) || net.pick;
          netStatus.textContent = p.evil ? (net.killerPick === 'bear5' ? 'YOU ARE BEAR5!!' : 'YOU ARE EVIL LUX!!')
            : net.amKillerElect ? 'YOU WILL BE EVIL!!'
            : mc ? `you are ${mc.toUpperCase()}!! :D`
            : (net.id ? 'pick a character!!' : netStatus.textContent);
        }
        // back playing
        if (net.afk && (game.input.left || game.input.right || game.input.jump)) setAFK(false);
        // pick countdown
        if (data.phase === 'round' && prevPhase !== 'round') {
          revealUntil = Date.now() + 3000;
        }
        const picking = data.phase === 'select';
        // agree twice
        const inReveal = data.phase === 'round' && you?.in_round && Date.now() < revealUntil && data.round !== revealedRound;
        const wantOpen = (!!net.id || net.everOnline) && ((picking && !net.afk) || inReveal);
        if (wantOpen) {
          openStreak++; closeStreak = 0;
          if (openStreak >= 2) {
            if (inReveal) revealedRound = data.round;
            showSelect(true, `${data.phase} picking=${picking} reveal=${inReveal}`, false);
          }
        } else {
          closeStreak++; openStreak = 0;
          if (closeStreak >= 2) {
            showSelect(false, `${data.phase}`, data.phase === 'round');
          }
        }
        if (selectOpen) {
          takenMap = {};
          for (const c of (data.chars || [])) { takenMap[c.id] = !!c.taken; devChars[c.id] = !!c.dev; }
          renderSelect();
          const revealing = data.phase === 'round';
          renderLobby(data.players || {}, data.killer_id);
          // pick timer
          if (csCount) csCount.textContent = data.phase === 'select' && (data.time_left || 0) > 0 ? `${data.time_left}` : '';
        }
        // scary music
        let nearestEvil = Infinity;
        if (data.phase === 'round' && you?.in_round && !p.evil && p.alive !== false) {
          for (const r of game.remotes) {
            if (!r.inRound || !r.evil || !r.alive || r.hp <= 0 || r.invis) continue; // sneak hides
            const d = Math.hypot(r.pos.x - p.pos.x, r.pos.y - p.pos.y);
            if (d < nearestEvil) nearestEvil = d;
          }
        }
        const chaseT0 = nearestEvil === Infinity ? 0
          : Math.min(1, Math.max(0, 1 - (nearestEvil - 40) / 220));
        let chaseT = chaseT0;
        let terrorT = nearestEvil === Infinity ? 0
          : Math.min(1, Math.max(0, 1 - Math.abs(nearestEvil - 380) / 280));
        if (chaseT > 0.05) terrorT = 0; // chase wins
        // last survivor
        // lux anthem
        const survsLeft = (you?.in_round && p.alive !== false && !p.evil ? 1 : 0) +
          game.remotes.filter((r) => r.inRound && r.alive && r.hp > 0 && !r.evil).length;
        const isLMS = data.phase === 'round' && survsLeft === 1;
        let lmsChar = null;
        if (isLMS) {
          if (p.alive !== false && !p.evil) lmsChar = net.pick || null;
          else {
            const last = game.remotes.find((r) => r.alive && r.hp > 0 && !r.evil);
            lmsChar = (last && last.char) || null;
          }
        }
        const luxLMS = isLMS && lmsChar === 'lux';
        const sonicLMS = isLMS && lmsChar === 'sonic';
        const tailsLMS = isLMS && lmsChar === 'tails';
        const nyanLMS = isLMS && lmsChar === 'nyan';
        const superLMS = isLMS && lmsChar === 'supersonic';
        const lmsKey = luxLMS ? 'lmslux' : (sonicLMS ? 'lmssonic' : (tailsLMS ? 'lmstails' : (nyanLMS ? 'lmsnyan' : (superLMS ? 'lmssonic' : 'lms'))));
        if (isLMS && lmsTrack !== lmsKey) {
          // start anthem
          for (const k of ['chase', 'terror', 'map', 'lms', 'lmslux', 'lmssonic', 'lmstails', 'lmsnyan']) {
            beds[k].pause();
            try { beds[k].currentTime = 0; } catch (_) { /* hush!! */ }
          }
          if (!document.hidden) beds[lmsKey].play().catch(() => {});
          lmsTrack = lmsKey;
          lmsEnded = false;
          if (!p.evil && p.alive !== false) {
            // heal, keep super hp
            const superGlow = isSuper() && SS.transformed;
            const lmsHp = Math.max(LMS_HP, survHp());
            p.maxHp = superGlow ? SUPER_HP : lmsHp; p.hp = superGlow ? SUPER_HP : lmsHp;
            S.dashCD = 0; S.cowerCD = 0; T.kickCD = 0; T.jabCD = 0; TW.flyCD = 0; TW.bombCD = 0; TW.whipCD = 0; TW.bombsLeft = 5;
            NY.rocketCD = 0; NY.dashCD = 0;
            SS.boostCD = 0; SS.blockCD = 0; SS.spinCD = 0;
            fetch('/api/heal', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: net.id, amount: 999, max: superGlow ? SUPER_HP : lmsHp }),
            }).catch(() => {});
          }
        } else if (!isLMS && lmsTrack) {
          // lms over
          beds.lms.pause(); beds.lmslux.pause(); beds.lmssonic.pause(); beds.lmstails.pause(); beds.lmsnyan.pause();
          lmsTrack = null; lmsEnded = false;
          if (!p.evil) {
            // drop buffs except super
            if (!(isSuper() && SS.transformed)) { p.maxHp = survHp(); p.hp = Math.min(p.hp, p.maxHp); }
          } // drop buffs
        }
        // block chase
        if (isLMS) { chaseT = 0; terrorT = 0; }
        // super theme overpowers everything
        const heroOn = (!p.evil && SS.transformed && p.alive !== false) ||
          game.remotes.some((r) => !r.evil && r.super && r.alive && r.hp > 0);
        // lms first
        const cands = [
          ['hero', heroOn ? 1 : 0, 0.3],
          ['lmslux', luxLMS ? 1 : 0, 0.25],
          ['lmssonic', (sonicLMS || superLMS) ? 1 : 0, 0.25],
          ['lmstails', tailsLMS ? 1 : 0, 0.25],
          ['lmsnyan', nyanLMS ? 1 : 0, 0.25],
          ['lms', isLMS && !luxLMS && !sonicLMS && !tailsLMS && !nyanLMS && !superLMS ? 1 : 0, 0.25],
          ['chase', chaseT, 0.5],
          ['terror', terrorT, 0.5],
          ['inter', data.phase === 'intermission' ? 1 : 0, 0.3],
          ['charselect', selectOpen && data.phase === 'select' ? 1 : 0, 0.4],
          ['map', data.phase === 'round' ? 1 : 0, 0.12],
          ['wait', data.phase === 'lobby' ? 1 : 0, 0.3],
        ];
        const bedT = { map: 0, wait: 0, inter: 0, lms: 0, lmslux: 0, lmssonic: 0, lmstails: 0, lmsnyan: 0, hero: 0, chase: 0, terror: 0, charselect: 0 };
        const win = cands.find((c) => c[1] > 0.05);
        if (win) bedT[win[0]] = win[2] * (win[0] === 'chase' || win[0] === 'terror' ? win[1] : 1);
        if (document.hidden) for (const k in bedT) bedT[k] = 0; // mute hidden
        for (const [key, a] of Object.entries(beds)) {
          // pause means silent
          // title mutes
          let target = soloIdx >= 0 ? (key === soloOrder[soloIdx] ? 0.8 : 0) : (bedT[key] || 0);
          target *= MUSIC_VOLUME_SCALE;
          if (titleLive) target = 0;
          if (target > 0.01) {
            if (a.paused && !(key === lmsTrack && lmsEnded)) a.play().catch(() => {});
            a.volume += (target - a.volume) * 0.15; // fade in
          } else if (!a.paused) {
            a.volume += (0 - a.volume) * 0.3; // fade out
            if (a.volume < 0.02) a.pause();
          }
        }
        // hero lyrics
        {
          const hb = beds.hero;
          let line = '';
          if (hb && !hb.paused && hb.volume > 0.05 && hb.currentTime > 0) {
            const t = hb.currentTime;
            for (const [lt, lx] of HERO_LYRICS) {
              if (t < lt) break;
              line = lx;
            }
            const lastT = HERO_LYRICS[HERO_LYRICS.length - 1][0];
            if (t > lastT + 10) line = '';
          }
          if (line) {
            // rainbow super sonic
            const html = line.replace(/&/g, '&amp;').replace(/</g, '&lt;')
              .replace(/(super sonic)/gi, '<span class="lyr-rainbow">$1</span>');
            if (lyricBar._html !== html) { lyricBar.innerHTML = html; lyricBar._html = html; }
          } else {
            lyricBar._html = '';
          }
          lyricBar.style.display = line ? 'block' : 'none';        }
        // feel stuns
        if (you && (you.stun || 0) > (p.stunT || 0)) p.stunT = you.stun;
        // stun sting
        if (p.evil && (p.stunT || 0) > (p._lastStun || 0)) {
          fileSfx(SFX + 'basic_hit.wav', {});
        }
        p._lastStun = p.stunT || 0;
        // recovers with words, not whimpers
        if (p.evil && (p._wasStun || 0) > 0 && (p.stunT || 0) <= 0 && p.alive !== false && data.phase === 'round') {
          voiceSfx(vpick(VL_STUN));
        }
        p._wasStun = p.stunT || 0;
        // ate hits
        if (you && you.countered && !p.evil) {
          S.countered = true; // shorter wait
          p.cowerT = 0; p.cowering = false;
          fileSfx(SFX + 'basic_hit.wav', {}); // got em
        }
        // shove killers
        if (p.evil && you && you.kb && you.kb.at !== p._lastKb) {
          p._lastKb = you.kb.at;
          const kbPow = you.kb.p || 1;
          p.vel.x = (you.kb.x || 0) * Math.min(kbPow > 1 ? 4000 : 1100, 375 * (you.kb.s || 2) * kbPow);
          if (p.onGround) p.vel.y = Math.min(p.vel.y || 0, -220); // hop up
        }
        // traps pings
        for (const sp of (data.spikes || [])) if (trippedIds.has(sp.id)) sp.tripped = true;
        game.spikes = data.spikes || [];
        // bomb sync
        for (const bb of (data.bombs || [])) bombPos[bb.id] = { x: bb.x, y: bb.y, owner: bb.owner || null, refunded: !!bombPos[bb.id]?.refunded };
        for (const bid of Object.keys(bombPos)) {
          if (!(data.bombs || []).some((bb) => bb.id === bid)) {
            const bp = bombPos[bid];
            if (!bp.refunded && data.phase === 'round' && bp.owner === net.id && isTails() && !p.evil && p.alive !== false) {
              TW.bombsLeft = Math.min(5, TW.bombsLeft + 1);
              bp.refunded = true;
            }
            boomedIds.delete(bid);
            delete bombPos[bid];
          }
        }
        game.bombs = data.bombs || [];
        for (const toss of (data.tosses || [])) {
          if (!seenTosses.has(toss.id)) {
            seenTosses.add(toss.id);
            // my own throws are already flying locally (added the moment I threw).
            // spawning the server's copy too made a duplicate that "collided" with
            // the original in midair and popped the bomb, whenever the throw reply was slow
            if (toss.owner === net.id) continue;
            // pass throwerId for arc
            game.addToss(toss.x, toss.y, toss.vx, toss.vy, game.bombImg, toss.id, toss.owner);
          }
        }
        // midair bombs burst on evil
        if (data.phase === 'round') {
          const foes = game.remotes.filter((r) => r.evil && r.alive && r.hp > 0);
          if (p.evil && p.alive !== false) foes.push(p);
          for (const t of (game.tosses || [])) {
            if (t.landed || t.dead || t.boomed) continue;
            for (const f of foes) {
              const fx = f.pos.x + f.w / 2, fy = f.pos.y + f.h / 2;
              if (Math.abs(t.x - fx) < 40 && Math.abs(t.y - fy) < 50) {
                t.boomed = true; t.landed = true; t.dead = true;
                game.addBoom(t.x, t.y);
                fileSfx(SFX + 'explode.mp3', {});
                if (t.throwerId && t.throwerId === net.id) {
                  fetch('/api/bomb', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: net.id, action: 'airburst', x: Math.round(t.x), y: Math.round(t.y) }),
                  }).then((r) => r.json()).then((d) => {
                    if (d && d.ok) TW.bombsLeft = Math.min(5, TW.bombsLeft + 1); // midair refund
                  }).catch(() => {});
                }
                break;
              }
            }
          }
        }
        game.alerts = data.alerts || [];
        // mod announcement
        {
          const fresh = (data.announces || []).filter((a) => (a.age || 99) < 8);
          const top = fresh.length ? fresh[fresh.length - 1].text : '';
          if (top && announceEl.textContent !== top) announceEl.textContent = top;
          announceEl.style.display = top ? 'block' : 'none';
        }
        syncRockets(data);
        // chat log
        for (const m of (data.chat || [])) {
          if (!seenChat.has(m.mid)) {
            seenChat.add(m.mid);
            game.bubbles[m.pid === net.id ? 'me' : m.pid] = { text: String(m.text).slice(0, 60), until: Date.now() + 5000 };
            const line = document.createElement('div');
            line.textContent = `${m.name}: ${String(m.text).slice(0, 60)}`;
            chatLog.appendChild(line);
            while (chatLog.children.length > 30) chatLog.removeChild(chatLog.firstChild);
            chatLog.scrollTop = chatLog.scrollHeight;
          }
        }
        game.showAlerts = !!p.evil;
        game.sneakArrows = !!(p.evil && p.invis);
        game.seeInvis = !!p.evil || p.alive === false;
        game.damageOn = !!net.id && (!net.phase || net.phase === 'round');
        game.lmsResist = !!(isLMS && !p.evil && p.alive !== false);
        abilBar.style.display = net.id && p.alive !== false ? 'flex' : 'none';
        // evil keys
        const now = Date.now();
        // picking locks abilities
        const canCast = p.alive !== false && (p.stunT || 0) <= 0 && !selectOpen && !p.rocketing; // a rocket can't do anything else
        if (!canCast) while (game.input.consumeAbility()) {} // clear queue
        const m1Muted = now < K.penaltyUntil; // sneak mute
        let ab;
        while (canCast && (ab = game.input.consumeAbility())) {
          if (p.evil && isBear5() && ab === 'Z') {
            const victim = game.remotes
              .filter((r) => !r.evil && r.alive && r.hp > 0 &&
                Math.abs(r.pos.x - p.pos.x) < 120 &&
                Math.abs((r.pos.y + r.h / 2) - (p.pos.y + p.h / 2)) < 110)
              .sort((a, b) => Math.abs(a.pos.x - p.pos.x) - Math.abs(b.pos.x - p.pos.x))[0];
            const oldFacing = p.facing || 1;
            const dir = victim ? (Math.sign(victim.pos.x + victim.w / 2 - (p.pos.x + p.w / 2)) || oldFacing) : oldFacing;
            const foldedTurn = !!victim && dir !== oldFacing;
            p.facing = dir;
            p.rooted = true;
            p.actionImg = bear5Image; p.actionT = 0.44;
            if (foldedTurn) {
              p._bearFoldStart = Date.now();
              p._bearFoldDuration = 440;
              p._bearFoldUntil = p._bearFoldStart + p._bearFoldDuration;
            }
            setPose(foldedTurn ? 'bear-fold' : 'swing', 440);
            if (victim) {
              fetch('/api/hit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: net.id, victim: victim.id, dmg: 999, stun: 0, kb: 3.5, stack: true }),
              }).catch(() => {});
            }
            continue;
          }
          if (!p.evil) {
            if (isToko()) {
              // toko kit
              if (ab === 'Z' && now >= T.kickCD && !T.kickUntil) {
                // high kick
                p.chargeDir = p.facing || 1;
                p.chargeSpeed = 450;
                p.vel.y = -990;
                T.kickUntil = now + 1200;
                T.kickStart = now;
                T.kickHit = false;
                setPose('kick', 600);
                // quiet kick
              } else if (ab === 'X' && now >= T.jabCD && !T.jabUntil) {
                p.rooted = true; // planted jab
                T.jabUntil = now + 400;
                T.jabHit = false;
                setPose('jab', 400);
              }
              continue;
            }
            if (isSonic()) {
              // peelout
              if (ab === 'Z' && now >= SN.peelCD && !SN.windupUntil && !SN.peeling && !SN.spinning && !SN.spinWindup) {
                // long zoom
                SN.windupUntil = now + 3000;
                p.rooted = true;
                p.actionImg = sonicSprites.charge; p.actionT = 3.1;
                fileSfx(SFX + 'dash_charge.wav', {});
              } else if (ab === 'X' && now >= SN.spinCD && !SN.spinWindup && !SN.spinning && !SN.peeling && !SN.windupUntil) {
                // spindash
                SN.spinWindup = now + 1000;
                p.rooted = true;
                p.actionImg = sonicSprites.spin[0]; p.actionT = 1.1;
                fileSfx(SFX + 'dash_charge.wav', {});
              }
              continue;
            }
            if (isSuper()) {
              // super sonic dev kit
              if (!SS.transformed) {
                // plain sonic one move
                if (ab === 'Z' && !SS.formUntil && p.alive !== false) {
                  // glow up
                  SS.formUntil = now + 1600;
                  SS.focusUntil = now + 2800; // all eyes here
                  game.cameraTarget = p;
                  p.rooted = true;
                  wearChar('supersonic'); p._wore = 'super'; // scale the seq right
                  setPose('transform', 1600);
                  fileSfx(SFX + 'dash_charge.wav', {});
                }
              } else if (ab === 'Z' && now >= SS.boostCD && !SS.boostWindup && !SS.boosting && !SS.spinning && !SS.spinWindup && (p.cowerT || 0) <= 0) {
                // boost
                SS.boostWindup = now + 400;
                p.rooted = true;
                p.actionImg = superSprites.skid[0]; p.actionT = 0.5;
                setPose('boost', 400);
                fileSfx(SFX + 'dash_charge.wav', {});
              } else if (ab === 'X' && now >= SS.blockCD && !SS.boosting && !SS.spinning && !SS.spinWindup && (p.cowerT || 0) <= 0) {
                // block spares server hit
                p.cowerT = 2.5;
                p.rooted = true;
                SS.wasBlocking = true;
                setPose('block', 2500);
                fileSfx(SFX + 'basic_hit.wav', {});
              } else if (ab === 'C' && now >= SS.spinCD && !SS.spinWindup && !SS.spinning && !SS.boosting && !SS.boostWindup && (p.cowerT || 0) <= 0) {
                // super spindash
                SS.spinWindup = now + 800;
                p.rooted = true;
                p.actionImg = superSprites.spin[0]; p.actionT = 0.9;
                fileSfx(SFX + 'dash_charge.wav', {});
              }
              continue;
            }
            if (isNyan()) {
              if (ab === 'Z' && now >= NY.rocketCD && data.phase === 'round' && !data.grace) {
                // rocket goes for the killer
                NY.rocketCD = now + ROCKET_CD * (isLMS ? LMS_CD : 1);
                fireRocket();
              } else if (ab === 'X' && now >= NY.dashCD && !NY.dashing) {
                // rainbow dash
                NY.dashing = true; NY.dashUntil = now + NYAN_DASH_MS; NY.dashHit = false;
                p.chargeDir = game.input.left ? -1 : (game.input.right ? 1 : (p.facing || 1));
                p.facing = p.chargeDir;
                p.chargeSpeed = NYAN_DASH_SPEED;
                fileSfx(SFX + 'super_dash.wav', {});
              }
              continue;
            }
            if (isTails()) {
              // fly
              if (ab === 'Z') {
                if (TW.flying) {
                  TW.flying = false; // drop out
                  TW.flyCD = now + FLY_CD * (1 - TW.flyLeft / FLY_MAX) * (isLMS ? LMS_CD : 1);
                } else if (now >= TW.flyCD && !TW.whipUntil) {
                  TW.flying = true;
                  TW.flyLeft = FLY_MAX; // meter
                  if (p.onGround) {
                    // ground launch, costs a quarter tank
                    TW.flyLeft = FLY_MAX * 0.75;
                    p.vel.y = Math.min(p.vel.y || 0, -600);
                    p.onGround = false;
                  }
                  fileSfx(SFX + 'dash_release.wav', {});
                }
              } else if (ab === 'X' && !TW.flying && !TW.throwUntil) {
                // bomb arm, press again to toss
                const dir = p.facing || 1;
                if (!TW.holding) {
                  if (TW.bombsLeft <= 0) {
                    sayStatus('out of bombs!!', 2);
                    fileSfx(SFX + 'denied.wav', {});
                  } else if (now < TW.bombCD) {
                    fileSfx(SFX + 'denied.wav', {});
                  } else {
                    TW.holding = true;
                    fileSfx(SFX + 'bomb_grab.wav', {});
                    sayStatus('bomb out!!', 1.5);
                  }
                } else if (TW.bombsLeft <= 0) {
                  sayStatus('out of bombs!!', 2);
                  fileSfx(SFX + 'denied.wav', {});
                } else {
                  TW.holding = false;
                  TW.bombsLeft--;
                  TW.bombCD = now + BOMB_CD * (isLMS ? LMS_CD : 1);
                  TW.throwUntil = now + 300;
                  setPose('throw', 300);
                  // short lob now
                  const throwX = p.pos.x + p.w / 2 + dir * 16;
                  const throwY = p.pos.y + 8;
                  const throwVx = dir * 500;
                  const throwVy = -320;
                  // add toss with throwerId
                  game.addToss(throwX, throwY, throwVx, throwVy, game.bombImg, null, net.id);
                  fetch('/api/bomb', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: net.id, action: 'throw', x: throwX, y: throwY, vx: throwVx, vy: throwVy }),
                  }).then((response) => response.json()).then((payload) => {
                    if (payload.toss?.id) seenTosses.add(payload.toss.id);
                  }).catch(() => {});
                  fileSfx(SFX + 'bomb_grab.wav', {});
                }
              } else if (ab === 'C' && now >= TW.whipCD && !TW.whipUntil && !TW.flying) {
                // tailwhip
                TW.whipUntil = now + 400; TW.whipHit = false;
                p.rooted = true;
                setPose('whip', 400);
                fileSfx(SFX + 'tailwhip.wav', {});
              }
              continue;
            }
            if (ab === 'Z' && now >= S.dashCD && !S.windupUntil && !S.dashing) {
              // dash zoom
              S.windupUntil = now + 3000;
              p.rooted = true;
              p.actionImg = luxDash; p.actionT = 3.1;
              fileSfx(SFX + 'dash_charge.wav', {});
            } else if (ab === 'X' && now >= S.cowerCD && (p.cowerT || 0) <= 0) {
              // eat stuns
              p.cowerT = 1.5;
              p.rooted = true; // stay still
              S.countered = false;
            }
            continue;
          }
          if (ab === 'C' && p.invis) {
            // end sneak
            p.invis = false;
            K.penaltyUntil = now + 5000;
          } else if (p.invis) {
            continue; // stay quiet
          } else if (ab === 'Z' && m1Muted) {
            fileSfx(SFX + 'denied.wav', {}); // muted swing
          } else if (ab === 'Z' && !m1Muted && now >= K.m1CD) {
            // slow swing
            K.m1CD = now + 1000;
            const victim = game.remotes
              .filter((r) => !r.evil && r.alive && r.hp > 0 &&
                Math.abs(r.pos.x - p.pos.x) < 120 &&
                Math.abs((r.pos.y + r.h / 2) - (p.pos.y + p.h / 2)) < 110)
              .sort((a, b) => Math.abs(a.pos.x - p.pos.x) - Math.abs(b.pos.x - p.pos.x))[0];
            p.actionImg = evilM1[Math.floor(Math.random() * evilM1.length)]; p.actionT = 0.25; // swing frame
            setPose('swing', 300);
            if (victim) {
              fetch('/api/hit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: net.id, victim: victim.id, dmg: 40, stun: 0 }),
              }).catch(() => {});
              // bit back
              fileSfx(SFX + (victim.cowering ? 'basic_hit.wav' : 'm1_hit.wav'), {});
            }
          } else if (ab === 'X' && now >= K.spikeCD) {
            // stay grounded
            if (!p.onGround) {
              sayStatus('land first!!', 2);
              fileSfx(SFX + 'denied.wav', {});
              continue;
            }
            const sx = Math.round(p.pos.x + p.w / 2), sy = Math.round(p.pos.y + p.h);
            K.spikeCD = now + 10000;
            p.actionImg = isBear5() ? bear5Image : evilAct.spike; p.actionT = 0.5;
            setPose('spike', 500);
            fileSfx(SFX + 'spike_place.wav', {});
            fetch('/api/spike', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: net.id, action: 'place', x: sx, y: sy }),
            }).catch(() => {});
          } else if (ab === 'C' && now >= K.sneakCD) {
            // ghost mode
            p.invis = true;
            K.invisUntil = now + 10000; K.sneakCD = now + 20000;
            voiceSfx(vpick(VL_SNEAK));
            sneakLoop.start();
          } else if (ab === 'V' && now >= K.pullCD && !K.pullWindup) {
            // wound up ropes
            const kx = p.pos.x + p.w / 2, ky = p.pos.y + p.h / 2;
            const anyone = game.remotes.some((r) => {
              if (r.evil || !r.alive || r.hp <= 0) return false;
              const rx = r.pos.x + r.w / 2, ry = r.pos.y + r.h / 2;
              return Math.hypot(kx - rx, ky - ry) < PULL_RANGE;
            });
            K.pullCD = now + (anyone ? 22000 : 8000);
            K.pullHit = false;
            if (!anyone) {
              // drop ropes
              p.stunT = Math.max(p.stunT || 0, 3);
              fileSfx(SFX + 'denied.wav', {});
              sayStatus('nobody around!!', 2);
            } else {
              K.pullWindup = now + 1500;
              p.rooted = true;
              p.actionImg = evilAct.pullwindup; p.actionT = 1.6;
            }
          } else if (ab === 'B' && now >= K.rushCD && !K.charging && !K.windupUntil) {
            K.windupUntil = now + 3000; // rooted windup
            K.rushCD = now + 15000;
            p.rooted = true;
            voiceSfx(vpick(VL_RUSH));
            p.actionImg = evilAct.windup; p.actionT = 3.1;
            fileSfx(SFX + 'dash_charge.wav', {});
          } else if (ab === 'N' && isNyan() && now >= NY.rocketCD && data.phase === 'round' && !data.grace) {
            // killer rocket goes for the nearest survivor
            NY.rocketCD = now + ROCKET_CD * (isLMS ? LMS_CD : 1);
            fireRocket();
          }
        }
        // mute over
        if (p.invis && now >= K.invisUntil) {
          p.invis = false;
          K.penaltyUntil = now + 5000;
        }
        // loud reveal
        if (K.wasInvis && !p.invis) fileSfx(SFX + 'sneak_reveal.mp3', {});
        if (K.wasInvis && !p.invis) sneakLoop.stop();
        K.wasInvis = !!p.invis;
        if (p.evil && p.alive !== false && now < K.pullUntil) { p.actionImg = evilAct.pull; p.actionT = 0.15; pullLoop.start(); }
        else pullLoop.stop();
        // wound up
        if (p.evil && K.pullWindup && now >= K.pullWindup) {
          K.pullWindup = 0;
          p.rooted = false;
          if (p.alive !== false && (p.stunT || 0) <= 0 && data.phase === 'round') {
            K.pullUntil = now + 5000;
          }
        }
        // fizzled pull
        if (p.evil && K.pullUntil && now >= K.pullUntil && p.alive !== false) {
          K.pullUntil = 0;
          if (!K.pullHit) {
            p.stunT = Math.max(p.stunT || 0, 3);
            fileSfx(SFX + 'denied.wav', {});
          }
        }
        // rush charge
        if (p.evil && K.windupUntil) {
          // scary pose
          p.actionImg = evilWindup[Math.floor(now / 400) % evilWindup.length];
          p.actionT = 0.5;
        }
        if (p.evil && K.windupUntil && now >= K.windupUntil) {
          K.windupUntil = 0;
          K.charging = true; K.chargeUntil = now + 600;
          p.chargeDir = p.facing || 1;
          p.rooted = false;
          fileSfx(SFX + 'super_dash.wav', {});
        }
        if (p.evil && K.charging) {
          if (now >= K.chargeUntil || p.alive === false) { K.charging = false; p.chargeDir = 0; }
          else {
            // wide slam
            for (const r of game.remotes) {
              if (r.evil || !r.alive || r.hp <= 0) continue;
              if (Math.abs(r.pos.x - p.pos.x) < 55 &&
                  Math.abs((r.pos.y + r.h / 2) - (p.pos.y + p.h / 2)) < 70) {
                fetch('/api/hit', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: net.id, victim: r.id, dmg: 75, stun: 0 }),
                }).catch(() => {});
                fileSfx(SFX + 'm1_hit.wav', { rate: 0.7 }); // slam sound
                p.stunT = 3;
                K.charging = false; p.chargeDir = 0;
                break;
              }
            }
          }
        }
        K.m1ok = !(now < K.penaltyUntil) && !K.charging && data.phase === 'round';
        // red rush
        p.redFlash = !!(p.evil && K.windupUntil);
        // stop loops
        if (p.alive === false || data.phase !== 'round') { cowerLoop.stop(); pullLoop.stop(); }
        // ghost meter
        p.sneakFrac = p.invis ? Math.max(0, (K.invisUntil - now) / 10000) : 0;
        // evil waits
        if (p.evil) {
          if (data.grace) p.rooted = true;
          else if (!K.windupUntil && !K.charging && !K.pullWindup) p.rooted = false;
        }
        // rope ticks
        if (p.evil && p.alive !== false && data.phase === 'round' && now < K.pullUntil) {
          const kx = p.pos.x + p.w / 2, ky = p.pos.y + p.h / 2;
          for (const r of game.remotes) {
            if (r.evil || !r.alive || r.hp <= 0) continue;
            const rx = r.pos.x + r.w / 2, ry = r.pos.y + r.h / 2;
            const pullD = Math.hypot(kx - rx, ky - ry);
            if (pullD >= PULL_RANGE) continue;
            // through walls now
            if (!K.pullHit) { fileSfx(SFX + 'basic_hit.wav', {}); voiceSfx(vpick(VL_PULL)); } // caught one
            K.pullHit = true;
            // closer burns more
            const tickDmg = Math.round(2 + 8 * (1 - pullD / PULL_RANGE));
            fetch('/api/hit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: net.id, victim: r.id, dmg: tickDmg, stun: 0 }),
            }).catch(() => {});
          }
        }
        // fast ghost
        if (p.evil) game.moveSpeed = isBear5() ? 820 : p.invis ? 430 : 300;
        // lux dash
        if (!p.evil && !isToko() && !isSonic() && !isTails()) {
          if (S.windupUntil && now >= S.windupUntil) {
            S.windupUntil = 0;
            S.dashing = true; S.dashUntil = now + 2000; S.dashHit = false;
            S.dashTouching = false;
            S.lastX = p.pos.x;
            p.chargeDir = game.input.left ? -1 : (game.input.right ? 1 : (p.facing || 1));
            p.facing = p.chargeDir;
            p.rooted = false;
            fileSfx(SFX + 'dash_release.wav', {});
          }
          if (S.dashing) {
            // steer dash
            if (game.input.left) { p.facing = -1; p.chargeDir = -1; }
            else if (game.input.right) { p.facing = 1; p.chargeDir = 1; }
            // bonked a wall
            const dashAge = 2000 - (S.dashUntil - now);
            const stuck = dashAge > 300 && Math.abs(p.pos.x - (S.lastX ?? p.pos.x)) < 2 && p.alive !== false;
            S.lastX = p.pos.x;
            if (now >= S.dashUntil || p.alive === false || stuck) {
              if (stuck) {
                // bonk stun
                p.facing = -(p.chargeDir || p.facing || 1);
                p.vel.x = p.facing * 400;
                p.stunT = Math.max(p.stunT || 0, 2);
                fileSfx(SFX + 'basic_hit.wav', { v: 0.5 });
              }
              S.dashing = false; p.chargeDir = 0; S.dashTouching = false;
              S.dashCD = now + (S.dashHit ? 15000 : 25000) * (isLMS ? LMS_CD : 1); // dash waits
            } else {
              const gi = game._spriteFor(p);
              const fs = game.frameSize(p, gi);
              game.afterimages.push({
                x: p.pos.x, y: p.pos.y, w: p.w, h: p.h,
                drawW: fs.dw, drawH: fs.dh, facing: p.facing,
                img: gi, age: 0,
              });
              const ek = game.remotes.find((r) => r.id === net.ekid && r.alive && r.hp > 0);
              const touching = !!(ek &&
                  Math.abs(ek.pos.x - p.pos.x) < 55 &&
                  Math.abs((ek.pos.y + ek.h / 2) - (p.pos.y + p.h / 2)) < 70);
              if (touching && !S.dashTouching) {
                // stack tags
                S.dashTouching = true;
                S.dashHit = true;
                fileSfx(SFX + 'basic_hit.wav', {}); // tag sound
                fetch('/api/hit', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: net.id, victim: ek.id, dmg: isLMS ? 6 : 2, stun: 2, stack: true }),
                }).catch(() => {});
              } else if (!touching) {
                S.dashTouching = false; // next pass
              }
            }
          }
          // cower ends
          // dazed whiff
          if (S.wasCowering && (p.cowerT || 0) <= 0) {
            S.cowerCD = now + (S.countered ? 15000 : 25000) * (isLMS ? LMS_CD : 1);
            if (!S.countered) p.stunT = Math.max(p.stunT || 0, 1);
            cowerLoop.stop();
          }
          S.wasCowering = (p.cowerT || 0) > 0;
          if ((p.cowerT || 0) > 0 && p.alive !== false) cowerLoop.start();
          p.rooted = !!S.windupUntil || (p.cowerT || 0) > 0;
          // blurry legs
          if (S.windupUntil) {
            const run = luxSprites.run;
            p.actionImg = run[Math.floor(now / 90) % run.length];
            p.actionT = 0.15;
            p.cyanFlash = true;
          } else {
            p.cyanFlash = false;
          }
          // pose all
          p.cowering = (p.cowerT || 0) > 0;
        }
        // sonic taxi
        if (!p.evil && isSonic()) {
          if (SN.windupUntil && now < SN.windupUntil) {
            // revving for charge pose
            p.windupUntil = true;
            p.actionImg = null;
            p.actionT = 0;
          } else {
            p.windupUntil = false;
          }
          if (SN.windupUntil && now >= SN.windupUntil) {
            SN.windupUntil = 0;
            SN.peeling = true; SN.peelUntil = now + 6000;
            p.chargeDir = game.input.left ? -1 : (game.input.right ? 1 : (p.facing || 1));
            p.facing = p.chargeDir;
            p.chargeSpeed = 750;
            p.rooted = false;
            fileSfx(SFX + 'dash_release.wav', {});
          }
          if (SN.peeling) {
            if (now >= SN.peelUntil || p.alive === false) {
              SN.peeling = false; p.peeling = false; // engine flag
              p.chargeDir = 0; p.chargeSpeed = 0;
              p.actionImg = null;
              SN.peelCD = now + 20000;
            } else {
              // steer the zoom
              if (game.input.left) { p.facing = -1; p.chargeDir = -1; }
              else if (game.input.right) { p.facing = 1; p.chargeDir = 1; }
              // engine handles peel animation
              p.peeling = true; // engine flag
              const pgi = game._spriteFor(p);
              const pfs = game.frameSize(p, pgi);
              game.afterimages.push({
                x: p.pos.x, y: p.pos.y, w: p.w, h: p.h,
                drawW: pfs.dw, drawH: pfs.dh, facing: p.facing,
                img: pgi, age: 0, plain: true,
              });
            }
          }
          p.rooted = !!SN.windupUntil || !!SN.spinWindup;
        }
        // sonic spin
        if (!p.evil && isSonic()) {
          if (SN.spinWindup && now < SN.spinWindup) {
            p.spinWindup = true; // engine spin charge flag
            p.actionImg = null;
            p.actionT = 0;
          } else {
            p.spinWindup = false;
          }
          if (SN.spinWindup && now >= SN.spinWindup) {
            SN.spinWindup = 0;
            SN.spinning = true; SN.spinUntil = now + 4000; SN.spinStart = now; SN.spinHits = 0; SN.spinTouching = false;
            p.chargeDir = game.input.left ? -1 : (game.input.right ? 1 : (p.facing || 1));
            p.facing = p.chargeDir;
            SN.dir = p.chargeDir;
            SN.lastX = p.pos.x;
            p.chargeSpeed = 600;
            p.rooted = false;
            fileSfx(SFX + 'dash_release.wav', {});
          }
          // clear spin if stopped
          if (!SN.spinning) p.spinning = false;
          if (SN.spinning) {
            const spinOver = now >= SN.spinUntil || p.alive === false || now - (SN.spinStart || now) > 6000;
            if (spinOver) {
              SN.spinning = false; p.spinning = false; // engine flag
              p.chargeDir = 0; p.chargeSpeed = 0;
              p.actionImg = null;
              SN.spinCD = now + (SN.spinHits > 0 ? 18000 : 25000);
            } else {
              // slow steer
              const want = game.input.left ? -1 : (game.input.right ? 1 : (SN.dir || p.chargeDir));
              SN.dir = SN.dir ?? p.chargeDir;
              SN.dir += Math.max(-0.15, Math.min(0.15, want - SN.dir));
              if (Math.abs(SN.dir) > 0.2) {
                p.chargeDir = Math.sign(SN.dir);
                p.facing = Math.sign(SN.dir);
              }
              p.chargeSpeed = 600 * (0.4 + 0.6 * Math.min(1, Math.abs(SN.dir)));
              // locked line
              const spinAge = 4000 - (SN.spinUntil - now);
              if (spinAge > 300 && Math.abs(p.pos.x - (SN.lastX ?? p.pos.x)) < 2 && p.alive !== false) {
                // bonked a wall
                p.chargeDir = -(p.chargeDir || p.facing || 1);
                p.facing = p.chargeDir;
                SN.dir = p.chargeDir;
                fileSfx(SFX + 'basic_hit.wav', { v: 0.25 });
              }
              SN.lastX = p.pos.x;
              p.spinning = true; // engine flag
              const sgi = game._spriteFor(p);
              const sfs = game.frameSize(p, sgi);
              game.afterimages.push({
                x: p.pos.x, y: p.pos.y, w: p.w, h: p.h,
                drawW: sfs.dw, drawH: sfs.dh, facing: p.facing,
                img: sgi, age: 0, plain: true,
              });
              const ek = game.remotes.find((r) => r.id === net.ekid && r.alive && r.hp > 0);
              const touching = !!(ek &&
                  Math.abs(ek.pos.x - p.pos.x) < 55 &&
                  Math.abs((ek.pos.y + ek.h / 2) - (p.pos.y + p.h / 2)) < 70);
              if (touching && !SN.spinTouching && SN.spinHits < 3 && now >= (SN.spinHitCD || 0)) {
                SN.spinTouching = true;
                SN.spinHits++;
                SN.spinHitCD = now + 1000;
                fileSfx(SFX + 'basic_hit.wav', {});
                // both fly
                const away = (p.pos.x + p.w / 2) >= (ek.pos.x + ek.w / 2) ? 1 : -1;
                p.chargeDir = away; p.facing = away; SN.dir = away;
                p.vel.y = Math.min(p.vel.y || 0, -300);
                fetch('/api/hit', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: net.id, victim: ek.id, dmg: 2, stun: 3, stack: true, kb: 2.5 }),
                }).catch(() => {});
                if (SN.spinHits >= 3) {
                  SN.spinning = false; p.chargeDir = 0; p.chargeSpeed = 0;
                  p.actionImg = null;
                  SN.spinCD = now + 18000;
                }
              } else if (!touching) {
                SN.spinTouching = false;
              }
            }
          }
        }
        // super sonic ticks
        if (!p.evil && isSuper()) {
          // right look
          if (SS.transformed && p._wore !== 'super') { wearChar('supersonic'); p._wore = 'super'; }
          else if (!SS.transformed && !SS.formUntil && p._wore !== 'sonic') { wearChar('sonic'); p._wore = 'sonic'; }
          game.moveSpeed = SS.transformed ? SUPER_SPEED : 270;
          p.rainbow = SS.transformed === true;
          p.pulseWhite = SS.transformed === true;
          // glowing up
          if (SS.formUntil) {
            p.rooted = true;
            p.tremble = true; p.whiteFlash = true;
            if (now >= SS.formUntil) {
              SS.formUntil = 0; p.tremble = false; p.whiteFlash = false;
              if (p.alive === false) { p.rooted = false; p.actionImg = null; }
              else {
              SS.transformed = true;
              p.rooted = false; p.actionImg = null;
              p.maxHp = SUPER_HP; p.hp = SUPER_HP;
              wearChar('supersonic'); p._wore = 'super';
              fileSfx(SFX + 'dash_release.wav', {});
              sayStatus('super sonic!!', 3);
              fetch('/api/heal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: net.id, amount: 999, max: SUPER_HP }),
              }).catch(() => {});
              }
            } else {
              const seq = superSprites.transform;
              p.actionImg = seq[Math.min(seq.length - 1, Math.floor((now - (SS.formUntil - 1600)) / 200))];
              p.actionT = 0.15;
            }
          }
          // boost skid
          if (SS.boostWindup && now < SS.boostWindup) {
            p.actionImg = superSprites.skid[Math.floor(now / 90) % 2]; p.actionT = 0.15;
          }
          if (SS.boostWindup && now >= SS.boostWindup) {
            SS.boostWindup = 0;
            SS.boosting = true; SS.boostUntil = now + 4000; SS.boostTouching = false;
            p.chargeDir = game.input.left ? -1 : (game.input.right ? 1 : (p.facing || 1));
            p.facing = p.chargeDir;
            p.chargeSpeed = 950;
            p.rooted = false;
            setPose('boost', 4000);
            fileSfx(SFX + 'dash_release.wav', {});
          }
          if (SS.boosting) {
            if (now >= SS.boostUntil || p.alive === false) {
              SS.boosting = false;
              p.chargeDir = 0; p.chargeSpeed = 0;
              p.actionImg = null;
              SS.boostCD = now + 20000 * (isLMS ? LMS_CD : 1);
            } else {
              if (game.input.left) { p.facing = -1; p.chargeDir = -1; }
              else if (game.input.right) { p.facing = 1; p.chargeDir = 1; }
              p.actionImg = superSprites.boost[Math.floor(now / 80) % 2]; p.actionT = 0.15;
              const bgi = game._spriteFor(p);
              const bfs = game.frameSize(p, bgi);
              game.afterimages.push({
                x: p.pos.x, y: p.pos.y, w: p.w, h: p.h,
                drawW: bfs.dw, drawH: bfs.dh, facing: p.facing,
                img: bgi, age: 0, plain: true,
              });
              const ek = game.remotes.find((r) => r.id === net.ekid && r.alive && r.hp > 0);
              const touching = !!(ek &&
                  Math.abs(ek.pos.x - p.pos.x) < 55 &&
                  Math.abs((ek.pos.y + ek.h / 2) - (p.pos.y + p.h / 2)) < 70);
              if (touching && !SS.boostTouching && now >= (SS.boostHitCD || 0)) {
                SS.boostTouching = true;
                SS.boostHitCD = now + 1000;
                fileSfx(SFX + 'basic_hit.wav', {});
                fetch('/api/hit', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: net.id, victim: ek.id, dmg: 30, stun: 3, stack: true, kb: 2.5 }),
                }).catch(() => {});
              } else if (!touching) {
                SS.boostTouching = false;
              }
            }
          }
          // guard up
          const blocking = SS.wasBlocking && (p.cowerT || 0) > 0;
          if (blocking) {
            const age = 2.5 - (p.cowerT || 0);
            p.actionImg = age < 0.4 ? superSprites.duck[Math.floor(now / 130) % 3] : superSprites.guard;
            p.actionT = 0.15;
            p.rooted = true;
          }
          if (SS.wasBlocking && (p.cowerT || 0) <= 0) {
            SS.wasBlocking = false;
            SS.blockCD = now + 15000 * (isLMS ? LMS_CD : 1);
          }
          // super spin
          if (SS.spinWindup && now < SS.spinWindup) {
            p.spinWindup = true;
            p.actionImg = null; p.actionT = 0;
          } else {
            p.spinWindup = false;
          }
          if (SS.spinWindup && now >= SS.spinWindup) {
            SS.spinWindup = 0;
            SS.spinning = true; SS.spinUntil = now + 5000; SS.spinStart = now; SS.spinHits = 0; SS.spinTouching = false;
            p.superFly = true; // ball can fly now
            p.chargeDir = game.input.left ? -1 : (game.input.right ? 1 : (p.facing || 1));
            p.facing = p.chargeDir;
            SS.dir = p.chargeDir;
            SS.lastX = p.pos.x;
            p.chargeSpeed = 700;
            p.rooted = false;
            fileSfx(SFX + 'dash_release.wav', {});
          }
          if (!SS.spinning) { p.spinning = false; p.superFly = false; }
          if (SS.spinning) {
            const spinOver = now >= SS.spinUntil || p.alive === false || now - (SS.spinStart || now) > 7000;
            if (spinOver) {
              SS.spinning = false; p.spinning = false; p.superFly = false;
              p.chargeDir = 0; p.chargeSpeed = 0;
              p.actionImg = null;
              SS.spinCD = now + (SS.spinHits > 0 ? 18000 : 25000) * (isLMS ? LMS_CD : 1);
            } else {
              const want = game.input.left ? -1 : (game.input.right ? 1 : (SS.dir || p.chargeDir));
              SS.dir = SS.dir ?? p.chargeDir;
              SS.dir += Math.max(-0.15, Math.min(0.15, want - SS.dir));
              if (Math.abs(SS.dir) > 0.2) {
                p.chargeDir = Math.sign(SS.dir);
                p.facing = Math.sign(SS.dir);
              }
              p.chargeSpeed = 700 * (0.4 + 0.6 * Math.min(1, Math.abs(SS.dir)));
              const spinAge = 5000 - (SS.spinUntil - now);
              if (spinAge > 300 && Math.abs(p.pos.x - (SS.lastX ?? p.pos.x)) < 2 && p.alive !== false) {
                p.chargeDir = -(p.chargeDir || p.facing || 1);
                p.facing = p.chargeDir;
                SS.dir = p.chargeDir;
                fileSfx(SFX + 'basic_hit.wav', { v: 0.25 });
              }
              SS.lastX = p.pos.x;
              p.spinning = true;
              const sgi = game._spriteFor(p);
              const sfs = game.frameSize(p, sgi);
              game.afterimages.push({
                x: p.pos.x, y: p.pos.y, w: p.w, h: p.h,
                drawW: sfs.dw, drawH: sfs.dh, facing: p.facing,
                img: sgi, age: 0, plain: true,
              });
              const ek = game.remotes.find((r) => r.id === net.ekid && r.alive && r.hp > 0);
              const touching = !!(ek &&
                  Math.abs(ek.pos.x - p.pos.x) < 55 &&
                  Math.abs((ek.pos.y + ek.h / 2) - (p.pos.y + p.h / 2)) < 70);
              if (touching && !SS.spinTouching && SS.spinHits < 5 && now >= (SS.spinHitCD || 0)) {
                SS.spinTouching = true;
                SS.spinHits++;
                SS.spinHitCD = now + 1000;
                fileSfx(SFX + 'basic_hit.wav', {});
                const away = (p.pos.x + p.w / 2) >= (ek.pos.x + ek.w / 2) ? 1 : -1;
                p.chargeDir = away; p.facing = away; SS.dir = away;
                p.vel.y = Math.min(p.vel.y || 0, -300);
                fetch('/api/hit', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id: net.id, victim: ek.id, dmg: 25, stun: 3, stack: true, kb: 2.5 }),
                }).catch(() => {});
                if (SS.spinHits >= 5) {
                  SS.spinning = false; p.spinning = false; p.superFly = false;
                  p.chargeDir = 0; p.chargeSpeed = 0;
                  p.actionImg = null;
                  SS.spinCD = now + 18000 * (isLMS ? LMS_CD : 1);
                }
              } else if (!touching) {
                SS.spinTouching = false;
              }
            }
          }
          // dazed flicker
          if ((p.stunT || 0) > 0 && p.alive !== false && !SS.boosting && !SS.spinning) {
            p.actionImg = (Math.floor(now / 150) % 2) ? superSprites.stun2 : superSprites.stun;
            p.actionT = 0.15;
          }
          if (!SS.formUntil) p.rooted = !!SS.boostWindup || !!SS.spinWindup || blocking;
        }
        // toko ticks
        if (!p.evil && isToko()) {
          const ek = game.remotes.find((r) => r.id === net.ekid && r.alive && r.hp > 0);
          const ekClose = (dx, dy) => ek &&
            Math.abs(ek.pos.x - p.pos.x) < dx &&
            Math.abs((ek.pos.y + ek.h / 2) - (p.pos.y + p.h / 2)) < dy;
          // bounce kick
          if (T.kickUntil) {
            p.kickUntil = true; // engine flag
            // ground ends
            const landed = p.onGround && now > (T.kickStart || 0) + 100;
            if (now >= T.kickUntil || landed) {
              T.kickUntil = 0;
              p.kickUntil = false; // engine flag
              p.chargeDir = 0; p.chargeSpeed = 0;
              T.kickCD = now + (T.kickHit ? 20000 : 30000) * (isLMS ? LMS_CD : 1); // kick waits
              if (!T.kickHit) fileSfx(SFX + 'denied.wav', {}); // missed kick
            } else if (!T.kickHit && ekClose(60, 80)) {
              T.kickHit = true;
              T.kickUntil = 0; // start bounce
              p.kickUntil = false; // engine flag
              p.chargeDir = 0; p.chargeSpeed = 0;
              T.kickCD = now + 20000 * (isLMS ? LMS_CD : 1);
              setPose('kick', 400);
              fileSfx(SFX + 'roundhouse_hit.wav', {});
              const away = (p.pos.x + p.w / 2) >= (ek.pos.x + ek.w / 2) ? 1 : -1;
              p.vel.x = away * 1350; // huge bounce
              p.vel.y = -950;
              fetch('/api/hit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: net.id, victim: ek.id, dmg: isLMS ? 23 : 15, stun: 4 }),
              }).catch(() => {});
            }
          } else {
            p.kickUntil = false; // engine flag
          }
          // fast jab
          if (T.jabUntil) {
            p.jabUntil = true; // engine flag
            p.rooted = true;
            if (!T.jabHit && ekClose(55, 70)) {
              T.jabHit = true;
              fileSfx(SFX + 'jab_hit.wav', {});
              fetch('/api/hit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: net.id, victim: ek.id, dmg: 0, stun: 1.5 }),
              }).catch(() => {});
            }
            if (now >= T.jabUntil) {
              T.jabUntil = 0;
              p.jabUntil = false; // engine flag
              p.rooted = false;
              if (T.jabHit) {
                T.jabCD = now + 15000 * (isLMS ? LMS_CD : 1); // fast recharge
              } else {
                T.jabCD = now + 25000 * (isLMS ? LMS_CD : 1); // slow whiff
                p.stunT = Math.max(p.stunT || 0, 2);
                fileSfx(SFX + 'denied.wav', {}); // missed jab
              }
            }
          } else {
            p.jabUntil = false; // engine flag
          }
        }
        // nyan dash
        if (!p.evil && isNyan()) {
          p.dashing = NY.dashing; // engine flag, longer rainbow
          if (NY.dashing) {
            const gi = game._spriteFor(p);
            const fs = game.frameSize(p, gi);
            game.afterimages.push({
              x: p.pos.x, y: p.pos.y, w: p.w, h: p.h,
              drawW: fs.dw, drawH: fs.dh, facing: p.facing,
              img: gi, age: 0, plain: true,
            });
            const ek = game.remotes.find((r) => r.id === net.ekid && r.alive && r.hp > 0);
            if (!NY.dashHit && ek &&
                Math.abs(ek.pos.x - p.pos.x) < 60 &&
                Math.abs((ek.pos.y + ek.h / 2) - (p.pos.y + p.h / 2)) < 70) {
              NY.dashHit = true;
              fileSfx(SFX + 'basic_hit.wav', {});
              fetch('/api/hit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: net.id, victim: ek.id, dmg: isLMS ? 20 : 15, stun: 3 }),
              }).catch(() => {});
            }
            if (now >= NY.dashUntil || p.alive === false || (p.stunT || 0) > 0) {
              NY.dashing = false; p.dashing = false;
              p.chargeDir = 0; p.chargeSpeed = 0;
              NY.dashCD = now + NYAN_DASH_CD * (isLMS ? LMS_CD : 1);
            }
          }
        }
        // tails ticks
        if (!p.evil && isTails()) {
          // stunned drops the flight
          if (TW.flying && ((p.stunT || 0) > 0 || p.alive === false || data.phase !== 'round')) {
            TW.flying = false;
            TW.flyCD = now + FLY_CD * (1 - TW.flyLeft / FLY_MAX) * (isLMS ? LMS_CD : 1);
          }
          // bomb in hand
          game.moveSpeed = TW.holding ? 140 : 240; // heavy carry
          p.holdingBomb = TW.holding === true;
          // carry art
          if (TW.holding && p._wore !== 'carry') { game.setPlayerSprites(tailsCarrySprites); p._wore = 'carry'; }
          else if (!TW.holding && p._wore === 'carry') { wearChar('tails'); p._wore = 'tails'; }
          if (TW.throwUntil) {
            // winding the toss
            p.throwUntil = true; // engine flag
            if (now >= TW.throwUntil) {
              TW.throwUntil = 0;
              p.throwUntil = false; // engine flag
            }
          } else {
            p.throwUntil = false; // engine flag
          }
          // fly meter
          if (TW.flying) {
            TW.flyLeft -= FLY_DRAIN; // burns fast
            flyLoop.start();
            p.taxiFly = true;
            p.lift = true; // engine flag
            p.sneakFrac = Math.max(0, TW.flyLeft / FLY_MAX);
            p.sneakColor = FLY_COLOR;
            // engine handles fly animation
            if (TW.flyLeft <= 0) {
              TW.flying = false;
              TW.flyCD = now + FLY_CD * (isLMS ? LMS_CD : 1);
            }
          } else {
            p.taxiFly = false;
            flyLoop.stop();
            p.lift = false; // engine flag
            p.sneakColor = FLY_COLOR;
            p.sneakFrac = 0; // bar only mid flight
          }
          // tailwhip
          if (TW.whipUntil) {
            p.whipUntil = true; // engine flag
            p.rooted = true;
            const ek = game.remotes.find((r) => r.id === net.ekid && r.alive && r.hp > 0);
            if (!TW.whipHit && ek &&
                Math.abs((ek.pos.x + ek.w / 2) - (p.pos.x + p.w / 2)) < 90 &&
                Math.abs((ek.pos.y + ek.h / 2) - (p.pos.y + p.h / 2)) < 80) {
              TW.whipHit = true;
              TW.whipCD = now + WHIP_CD * (isLMS ? LMS_CD : 1);
              const away = (p.pos.x + p.w / 2) >= (ek.pos.x + ek.w / 2) ? 1 : -1;
              p.vel.x = away * 500;
              fetch('/api/hit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: net.id, victim: ek.id, dmg: 0, stun: 2.5 }),
              }).catch(() => {});
            }
            if (now >= TW.whipUntil) {
              TW.whipUntil = 0;
              p.whipUntil = false; // engine flag
              p.rooted = false;
              if (!TW.whipHit) {
                TW.whipCD = now + 25000 * (isLMS ? LMS_CD : 1); // slow whiff
                p.stunT = Math.max(p.stunT || 0, 1);
                fileSfx(SFX + 'denied.wav', {}); // missed whip
              }
            }
          } else {
            p.whipUntil = false; // engine flag
          }
        }
        // shared ropes
        game.pullSrc = null;
        game.pullLinks = [];
        if (data.phase === 'round') {
          const pullers = [];
          if (p.evil && p.alive !== false && now < K.pullUntil) pullers.push(p);
          for (const r of game.remotes) if (r.evil && r.pull && r.alive && r.hp > 0) pullers.push(r);
          const victims = [];
          if (!p.evil && p.alive !== false) victims.push(p);
          for (const r of game.remotes) if (!r.evil && r.alive && r.hp > 0) victims.push(r);
          for (const pl of pullers) {
            const kx = pl.pos.x + pl.w / 2, ky = pl.pos.y + pl.h / 2;
            for (const vc of victims) {
              if (vc === pl) continue;
              const mx = vc.pos.x + vc.w / 2, my = vc.pos.y + vc.h / 2;
              if (Math.hypot(kx - mx, ky - my) < PULL_RANGE) {
                game.pullLinks.push({ x1: mx, y1: my, x2: kx, y2: ky });
                if (vc === p) game.pullSrc = { x: kx, y: ky };
              }
            }
          }
        }
        // sonic taxi
        game.peelSrc = null;
        game.liftSrc = null;
        if (!p.evil && p.alive !== false && data.phase === 'round') {
          const jumpEdge = game.input.jump && !p._jumpPrev;
          if (p._rideId) {
            // latched on
            const ride = game.remotes.find((r) => r.id === p._rideId && (r.peeling || r.lift) && r.alive && r.hp > 0);
            const far = !ride || Math.hypot((ride.pos.x + ride.w / 2) - (p.pos.x + p.w / 2), (ride.pos.y) - (p.pos.y)) > 400;
            if (!ride || far || jumpEdge) {
              if (jumpEdge && ride) p._dropRideUntil = now + 1000;
              p._rideId = null;
            } else if (ride.lift) {
              game.liftSrc = { x: ride.pos.x + ride.w / 2, y: ride.pos.y - 10 };
            } else {
              game.peelSrc = { x: ride.pos.x + ride.w / 2, y: ride.pos.y - 10 };
            }
          } else if (!game.input.jump && !(now < (p._dropRideUntil || 0))) {
            // fresh board
            const ride = game.remotes.find((r) => (r.peeling || r.lift) && r.alive && r.hp > 0 && !r.evil &&
              Math.abs(r.pos.x - p.pos.x) < 70 &&
              Math.abs((r.pos.y + r.h / 2) - (p.pos.y + p.h / 2)) < 90);
            if (ride) {
              p._rideId = ride.id;
              if (ride.lift) game.liftSrc = { x: ride.pos.x + ride.w / 2, y: ride.pos.y - 10 };
              else game.peelSrc = { x: ride.pos.x + ride.w / 2, y: ride.pos.y - 10 };
            }
          }
        } else {
          p._rideId = null;
        }
        p._jumpPrev = !!game.input.jump;
        // dead spec
        if (p.alive === false && net.id) {
          const alive = game.remotes.filter((r) => r.alive && r.hp > 0);
          if (!alive.find((r) => r.id === specId)) specId = alive.length ? alive[0].id : null;
          game.cameraTarget = alive.find((r) => r.id === specId) || null;
          const t = game.cameraTarget;
          // delayed spec
          const showSpec = !net.diedAt || Date.now() - net.diedAt > 5100;
          specBox.textContent = t ? `SPECTATING ${t.name}!!` : 'SPECTATING!!';
          specBox.style.display = showSpec ? 'block' : 'none';
          specHint.style.display = showSpec ? 'block' : 'none';
        } else {
          specBox.style.display = 'none';
          specHint.style.display = 'none';
        }
        // focus super glow up
        {
          const nowF = Date.now();
          let focusBody = null;
          if (nowF < (SS.focusUntil || 0) && p.alive !== false) focusBody = p;
          if (!focusBody) focusBody = game.remotes.find((r) => r.alive && r.hp > 0 && (r.forming || nowF < (r._focusUntil || 0))) || null;
          if (focusBody) {
            if (game.cameraTarget !== focusBody && game.cameraTarget) game.cameraTarget._superFocus = false;
            focusBody._superFocus = true;
            game.cameraTarget = focusBody;
          } else if (game.cameraTarget && game.cameraTarget._superFocus) {
            // show over, restore camera
            game.cameraTarget._superFocus = false;
            game.cameraTarget = null;
            if (p.alive === false) {
              const alive = game.remotes.filter((r) => r.alive && r.hp > 0);
              if (!alive.find((r) => r.id === specId)) specId = alive.length ? alive[0].id : null;
              game.cameraTarget = alive.find((r) => r.id === specId) || null;
            }
          }
        }
        if (net.fail > 0) { netStatus.style.color = ''; hideFatal(); } // error clear
        net.fail = 0;
      } catch (e) {
        // count fails
        net.fail = (net.fail || 0) + 1;
        if (net.fail === 75) netError('connection lost!! retrying...', 30);
      }
    }
