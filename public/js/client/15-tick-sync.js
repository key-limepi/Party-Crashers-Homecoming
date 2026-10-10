    function syncPhase(t) {
      let { p, data, prevRound, others } = t;
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
      Object.assign(t, { prevPhase, you });
    }

    function syncEvilState(t) {
      let { data, others, prevPhase } = t;
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
    }

    function updatePhaseText(t) {
      let { p, data, others, you } = t;
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
    }

    function syncRemotes(t) {
      let { p, data, others } = t;
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
    }

    function syncCharSelect(t) {
      let { p, data, prevPhase, you } = t;
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
    }

    function updateMusic(t) {
      let { p, data, you } = t;
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
      Object.assign(t, { isLMS });
    }

    function syncStunFeel(t) {
      let { p, data, you } = t;
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
    }

    function syncTraps(t) {
      let { p, data } = t;
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
    }

    function syncAnnouncesAndChat(t) {
      let { p, data, isLMS } = t;
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
    }
