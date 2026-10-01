function loadImg(src) {
      const img = new Image();
      img.src = src;
      return img;
    }
    const LUX = "./Assets/Images/Characters/Survivors/Lux/";

    const canvas = document.getElementById('game');
    const game = new PlatformerEngine(canvas, { width: 800, height: 450, background: '#bfe9ff' });

    // small hitbox
    const lux = game.addPlayer(60, 100, 36, 78);
    lux.drawW = 64; lux.drawH = 90;
    // lux sprites
    const luxSprites = {
      idle: [loadImg(LUX + "idle1.png"), loadImg(LUX + "idle2.png")],
      walk: [loadImg(LUX + "walk1.png"), loadImg(LUX + "walksmear.png"), loadImg(LUX + "walksmear2.png"), loadImg(LUX + "walksmear.png")],
      run: [loadImg(LUX + "run1.png"), loadImg(LUX + "run2.png")], // run cycle
      jump: loadImg(LUX + "jump1.png"),
      stun: loadImg(LUX + "hit.png"),
      struggle: [loadImg(LUX + "struggle1.png"), loadImg(LUX + "struggle2.png")],
      cower: loadImg(LUX + "cower.png"),
    };
    const luxDash = loadImg(LUX + "dash.png");
    // pick roster
    const CS = "./Assets/Images/UI/CharacterSelect/";
    const ROSTER = [
      { id: 'lux', name: 'LUX', nameImg: CS + 'luxname.png' },
      { id: 'toko', name: 'TOKO', nameImg: CS + 'tokoname.png' },
    ];
    const TOKO = "./Assets/Images/Characters/Survivors/Toko/";
    const tokoSprites = {
      idle: [loadImg(TOKO + "idle1.png"), loadImg(TOKO + "idle2.png")],
      walk: [loadImg(TOKO + "walk1.png"), loadImg(TOKO + "walk2.png")],
      run: [loadImg(TOKO + "run1.png"), loadImg(TOKO + "run2.png")],
      jump: loadImg(TOKO + "jump1.png"),
      stun: loadImg(TOKO + "jab.png"),
      struggle: [loadImg(TOKO + "walk1.png"), loadImg(TOKO + "walk2.png")],
      cower: loadImg(TOKO + "idle1.png"),
      dash: loadImg(TOKO + "run1.png"),
      kick: [loadImg(TOKO + "kick.png"), loadImg(TOKO + "kick2.png")],
      jab: [loadImg(TOKO + "jab.png"), loadImg(TOKO + "jab2.png")],
    };
    const charSprites = { lux: luxSprites, toko: tokoSprites, evil: null }; // evil later
    game.setPlayerSprites(luxSprites);

    // evil stats
    const EVIL = "./Assets/Images/Characters/Killers/Evil Lux/";
    const evilSprites = {
      idle: [loadImg(EVIL + "idle1.png"), loadImg(EVIL + "idle2.png")],
      walk: [loadImg(EVIL + "walk1.png"), loadImg(EVIL + "walk2.png")],
      run: [loadImg(EVIL + "run1.png"), loadImg(EVIL + "run2.png")],
      jump: loadImg(EVIL + "run1.png"),
      stun: loadImg(EVIL + "stun.png"),
      pull: loadImg(EVIL + "pull1.png"),
    };
    const evilM1 = [loadImg(EVIL + "m1walk.png"), loadImg(EVIL + "m1walk2.png"), loadImg(EVIL + "m1walk3.png")];
    charSprites.evil = evilSprites;
    const evilWindup = [loadImg(EVIL + "m1idle.png"), loadImg(EVIL + "m1idle2.png"), loadImg(EVIL + "m1idle3.png")];
    const evilAct = {
      spike: loadImg(EVIL + "spikeplace1.png"),
      windup: loadImg(EVIL + "m1idle.png"),
      pull: loadImg(EVIL + "pull1.png"),
      m1: null, // random swing
    };

    // exit door
    game.exitZone = { x: 4300, y: 280, w: 60, h: 100 };
    const EXIT_X = 4330, EXIT_SAFE = 150;
    game.chatBubbleImg = loadImg("./Assets/Images/UI/chatbub.png");
    game.alertArrow = loadImg("./Assets/Images/UI/CharacterSelect/left.png"); // ping arrow
    game.spikeImg = loadImg("./Assets/Images/Characters/Killers/Evil Lux/spikes.png");

    // big map
    game.addPlatform(-200, 380, 1000, 80, '#8ac926'); // west floor
    game.addPlatform(900, 380, 900, 80, '#8ac926'); // gap floor
    game.addPlatform(1920, 380, 1200, 80, '#8ac926'); // mid floor
    game.addPlatform(3240, 380, 1160, 80, '#8ac926'); // east floor
    const P = '#ff9f1c';
    game.addPlatform(180, 300, 140, 22, P);
    game.addPlatform(380, 240, 140, 22, P);
    game.addPlatform(580, 300, 140, 22, P);
    game.addPlatform(800, 220, 160, 22, P);
    game.addPlatform(1020, 280, 140, 22, P);
    game.addPlatform(1220, 200, 160, 22, P);
    game.addPlatform(1440, 280, 140, 22, P);
    game.addPlatform(1660, 190, 180, 22, P);
    game.addPlatform(1900, 270, 140, 22, P);
    game.addPlatform(2100, 200, 140, 22, P);
    game.addPlatform(2300, 280, 160, 22, P);
    game.addPlatform(2520, 180, 180, 22, P);
    game.addPlatform(2760, 260, 140, 22, P);
    game.addPlatform(2960, 190, 160, 22, P);
    game.addPlatform(3180, 270, 140, 22, P);
    game.addPlatform(3380, 200, 200, 22, P);
    game.addPlatform(3640, 280, 160, 22, P);
    // climb towers
    game.addPlatform(1300, 120, 60, 260, '#c084fc');
    game.addPlatform(2600, 100, 60, 280, '#c084fc');

    // rest island
    game.addPlatform(6000, 380, 800, 80, '#8ac926', 'inter'); // island floor
    game.addPlatform(5960, 100, 40, 360, '#c084fc', 'inter'); // left wall
    game.addPlatform(6800, 100, 40, 360, '#c084fc', 'inter'); // right wall
    game.addPlatform(6200, 280, 140, 22, '#ff9f1c', 'inter');
    game.addPlatform(6480, 200, 140, 22, '#ff9f1c', 'inter');
    game.addPlatform(6340, 120, 120, 22, '#ff9f1c', 'inter');

    game.start();

    // fullscreen button
    const fsBtn = document.getElementById('fsBtn');
    fsBtn.addEventListener('click', () => {
      const el = document.getElementById('wrap');
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (el.requestFullscreen) {
        el.requestFullscreen();
      }
    });
    document.addEventListener('fullscreenchange', () => {
      fsBtn.textContent = document.fullscreenElement ? 'un-fullscreen!!' : 'go fullscreen!! :D';
    });

    // mod menu
    const debugBox = document.getElementById('debug');
    const readout = document.getElementById('readout');
    const wantDebug = new URLSearchParams(location.search).has('debug');
    function openModMenu() {
      game.debug = true;
      debugBox.style.display = 'block';
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'F12') {
        e.preventDefault();
        if (net.id && net.mod) {
          game.debug = !game.debug;
          debugBox.style.display = game.debug ? 'block' : 'none';
        } else {
          sayStatus(`mods only!! click 'show my id' below, paste it in admins.txt!!`, 5);
        }
      }
    });
    function mod(action, extra) {
      if (!net.id) return;
      fetch('/api/mod', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: net.id, action, ...(extra || {}) }),
      }).catch(() => {});
    }
    document.getElementById('hurtBtn').addEventListener('click', () => game.hurtPlayer(10));
    document.getElementById('healBtn').addEventListener('click', () => game.healPlayer(10));
    document.getElementById('spawnBtn').addEventListener('click', () => game.respawn());
    document.getElementById('killMeBtn').addEventListener('click', () => mod('killme'));
    document.getElementById('killAllBtn').addEventListener('click', () => mod('killall'));
    document.getElementById('healAllBtn').addEventListener('click', () => mod('healall'));
    document.getElementById('endSurvBtn').addEventListener('click', () => mod('endround', { winner: 'survivors' }));
    document.getElementById('endKillBtn').addEventListener('click', () => mod('endround', { winner: 'killer' }));
    document.getElementById('skipBtn').addEventListener('click', () => mod('skipwait'));
    document.getElementById('forceBtn').addEventListener('click', () => mod('forcestart'));
    document.getElementById('meEvilBtn').addEventListener('click', () => mod('makekiller', { target: net.id }));
    document.getElementById('randEvilBtn').addEventListener('click', () => mod('makekiller', { target: 'random' }));
    document.getElementById('clearSpikesBtn').addEventListener('click', () => mod('clearspikes'));
    if (new URLSearchParams(location.search).has('debug')) {
      // mod check
      window.__wantDebug = true;
    }
    setInterval(() => {
      if (!game.debug || !game.player) return;
      const p = game.player;
      readout.textContent =
        `hp: ${Math.ceil(p.hp)}/${p.maxHp}\n` +
        `pos: ${Math.round(p.pos.x)}, ${Math.round(p.pos.y)}\n` +
        `vel: ${Math.round(p.vel.x)}, ${Math.round(p.vel.y)}\n` +
        `ground: ${p.onGround ? 'yep!!' : 'nope!!'}\n` +
        `phase: ${net.phase}\n` +
        `mus: map=${beds.map.volume.toFixed(2)} wait=${beds.wait.volume.toFixed(2)} inter=${beds.inter.volume.toFixed(2)} lms=${beds.lms.volume.toFixed(2)} lmslux=${beds.lmslux.volume.toFixed(2)} chase=${beds.chase.volume.toFixed(2)} terror=${beds.terror.volume.toFixed(2)} cs=${beds.charselect.volume.toFixed(2)}`;
    }, 100);

    // needs server
    // die to spectate
    const net = { id: null, timer: null, round: null, phase: null, ping: null, wasEvil: false, retry: null, mod: false, everOnline: false, wasElect: false, fail: 0 };
    // machine id
    function myMID() {
      let mid = null;
      try { mid = sessionStorage.getItem('pch_mid'); } catch (e) { /* private mode!! */ }
      if (!mid) {
        mid = '';
        try {
          if (window.crypto && crypto.randomUUID) mid = crypto.randomUUID().replace(/-/g, '');
        } catch (e) { /* old browser!! */ }
        if (!mid) {
          for (let i = 0; i < 32; i++) mid += '0123456789abcdef'[Math.floor(Math.random() * 16)];
        }
        try { sessionStorage.setItem('pch_mid', mid); } catch (e) { /* oh well!! */ }
      }
      return mid;
    }
    // unique tabs
    let tabId = '';
    for (let i = 0; i < 16; i++) tabId += '0123456789abcdef'[Math.floor(Math.random() * 16)];
    const netStatus = document.getElementById('netStatus');
    let statusUntil = 0; // passing messages
    function sayStatus(text, secs) {
      netStatus.textContent = text;
      netStatus.style.color = ''; // normal color
      statusUntil = secs ? Date.now() + secs * 1000 : 0;
    }
    // loud errors
    const errScreen = document.getElementById('errScreen');
    const errText = document.getElementById('errText');
    function showFatal(text) {
      if (!errScreen) return;
      errText.textContent = text;
      errScreen.classList.add('show');
    }
    function hideFatal() {
      if (!errScreen) return;
      errScreen.classList.remove('show');
    }
    if (errScreen) errScreen.addEventListener('click', hideFatal); // click dismisses
    // warning splash
    (function splash() {
      const el = document.getElementById('splash');
      const title = document.getElementById('titleScreen');
      if (!el) return;
      let gone = false;
      const dismiss = () => {
        if (gone) return;
        gone = true;
        el.classList.add('hide');
        setTimeout(() => { el.style.display = 'none'; }, 1100);
        if (title) title.style.display = 'flex'; // show title
      };
      el.addEventListener('click', dismiss);
      setTimeout(dismiss, 4000);
      // click connects
      let titleClicked = false;
      if (title) title.addEventListener('click', () => {
        if (titleClicked) return;
        titleClicked = true;
        net.titleT0 = Date.now(); // hold loading
        const label = title.querySelector('span');
        if (label) label.innerHTML = 'LOADING!!';
        joinOnline(net.pendingName || (nameBox.value.trim() || 'friend').slice(0, 16));
      });
    })();
    function netError(text, secs) {
      netStatus.textContent = text;
      netStatus.style.color = '#ff4757';
      statusUntil = Date.now() + (secs || 10) * 1000;
      showFatal(text);
    }
    window.addEventListener('error', (e) => {
      try { netError(`uh oh!! ${String((e && e.message) || 'something broke').slice(0, 80)}`, 10); } catch (_) { /* too broken!! */ }
    });
    window.addEventListener('unhandledrejection', () => {
      try { netError('uh oh!! a request failed — refresh if stuck!!', 10); } catch (_) { /* too broken!! */ }
    });
    const nameBox = document.getElementById('nameBox');
    const midBox = document.getElementById('midBox');
    let midShown = false;
    midBox.addEventListener('click', () => {
      midShown = !midShown;
      midBox.textContent = midShown ? myMID() : 'show my id';
    });
    // afk button
    // canvas corner
    const afkBtn = document.getElementById('afkImgBtn');
    net.afk = false;
    function setAFK(on) {
      net.afk = on;
      afkBtn.classList.toggle('on', on); // away tint
      if (on) game.input.left = game.input.right = game.input.jump = false;
      if (net.id) {
        const id = net.id;
        net.afkSync = (net.afkSync || Promise.resolve()).then(() => fetch('/api/afk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, away: on }),
        })).catch(() => {});
      }
    }
    afkBtn.addEventListener('click', () => setAFK(!net.afk));
    const specBox = document.getElementById('spectate');
    const specHint = document.getElementById('specHint');
    const phaseLine = document.getElementById('phaseLine');
    const roleBox = document.getElementById('roleBox');
    let lastPhaseText = '';
    let roleTimer = null;
    const statsBox = document.getElementById('stats');
    const vignette = document.getElementById('vignette');
    const chatLog = document.getElementById('chatLog');
    let specId = null; // spectate target
    // pick lobby
    // slide and run
    const csBox = document.getElementById('charSelect');
    const csName = document.getElementById('csName');
    const csCount = document.getElementById('csCount');
    const csSlotEls = {
      killer: document.getElementById('csKiller'),
      surv: [document.getElementById('csSurv0'),
             document.getElementById('csSurv1'),
             document.getElementById('csSurv2')],
    };
    const EVIL_RUN = ['./Assets/Images/Characters/Killers/Evil Lux/run1.png',
                      './Assets/Images/Characters/Killers/Evil Lux/run2.png'];
    let selIdx = 0, selectOpen = false, takenMap = {}, csFrame = 0;
    let revealUntil = 0; // reveal timer
    let selectClosedAt = 0, closeToken = 0;
    let openStreak = 0, closeStreak = 0, revealedRound = null;
    const csFade = document.getElementById('csFade');
    function showSelect(open, why, handoff) {
      if (open === selectOpen) return;
      if (open && Date.now() - selectClosedAt < 3000) return; // no flicker
      selectOpen = open;
      game.moveLock = open;
      const mine = ++closeToken; // dead fade
      console.log(`[select] ${open ? 'OPEN' : 'CLOSE'} (${why || '?'})`);
      if (open) {
        // sync fade
        csFade.style.opacity = '0';
        csBox.style.display = 'block';
        csBox.classList.remove('cs-hide');
      } else {
        // fade style
        selectClosedAt = Date.now();
        const mine = closeToken;
        const black = handoff === true;
        if (black) csFade.style.opacity = '1';
        setTimeout(() => {
          if (mine !== closeToken) return; // newest wins
          csBox.style.display = 'none';
          csBox.classList.add('cs-hide');
          if (black) csFade.style.opacity = '0';
        }, black ? 600 : 1000);
      }
    }
    // slot cache
    const slotCache = { killer: null, s0: null, s1: null, s2: null };
    // keep spots
    const slotAssign = []; // survivor ids
    function fillSlot(el, key, charId, name) {
      // empty slots
      const sig = charId ? `${charId}:${name}` : '';
      if (slotCache[key] === sig) return false; // skip same
      slotCache[key] = sig;
      el.innerHTML = '';
      if (!charId) return true;
      const img = document.createElement('img');
      img.className = 'cs-run cs-enter'; // slide in
      img.alt = name;
      const tag = document.createElement('span');
      tag.className = 'cs-tag';
      tag.textContent = name;
      el.appendChild(img);
      el.appendChild(tag);
      el._runChar = charId;
      el._runImg = img;
      return true;
    }
    function runFrameFor(charId, evil) {
      // char art
      if (evil) return EVIL_RUN[csFrame % EVIL_RUN.length];
      const set = charSprites[charId];
      const run = set && set.run && set.run[csFrame % set.run.length];
      return run && run.complete && run.naturalWidth ? run.src : null;
    }
    function renderLobby(players, killerId) {
      // pick order
      for (let i = slotAssign.length - 1; i >= 0; i--) {
        if (!players[slotAssign[i]]) slotAssign.splice(i, 1);
      }
      for (const id of Object.keys(players || {})) {
        if (id === killerId) continue;
        const ch = players[id].char;
        if (!ch || ch === 'evil') continue; // killer slot
        if (!slotAssign.includes(id)) slotAssign.push(id);
      }
      let si = 0;
      for (const id of slotAssign) {
        if (si >= 3) break;
        if (id === killerId) continue;
        const pl = players[id];
        if (!pl || !pl.char || pl.char === 'evil') continue;
        fillSlot(csSlotEls.surv[si], `s${si}`, pl.char, pl.name);
        si++;
      }
      // overflow count
      const extra = slotAssign.filter((id) => {
        const pl = players[id];
        return id !== killerId && pl && pl.char && pl.char !== 'evil';
      }).length - 3;
      const lastTag = csSlotEls.surv[2].querySelector('.cs-tag');
      if (lastTag) {
        lastTag.textContent = lastTag.textContent.replace(/ \+\d+!!$/, '');
        if (extra > 0) lastTag.textContent += ` +${extra}!!`;
      }
      for (; si < 3; si++) fillSlot(csSlotEls.surv[si], `s${si}`, null);
      // killer only
      const kp = killerId && players[killerId];
      if (kp) fillSlot(csSlotEls.killer, 'killer', 'evil', kp.name);
      else fillSlot(csSlotEls.killer, 'killer', null);
    }
    function renderSelect() {
      // pick bar
      const cur = ROSTER[selIdx];
      const csNameText = document.getElementById('csNameText');
      csName.style.display = '';
      csNameText.style.display = 'none';
      if (csName.dataset.char !== cur.id) {
        csName.dataset.char = cur.id;
        csName.src = cur.nameImg;
        csName.alt = cur.name;
      }
      // no buttons
      const evilLocked = !!(game.player && game.player.evil) || net.phase === 'round' || !!net.amKillerElect;
      document.getElementById('csLeft').style.display = evilLocked ? 'none' : '';
      document.getElementById('csRight').style.display = evilLocked ? 'none' : '';
      csName.style.visibility = evilLocked ? 'hidden' : '';
    }
    function browseSelect(dir) {
      selIdx = (selIdx + dir + ROSTER.length) % ROSTER.length;
      renderSelect();
    }
    function lockPick() {
      if (net.phase !== 'select') return; // select only
      if (game.player && game.player.evil) return; // killers skip
      if (net.amKillerElect) return; // evil skips
      const cur = ROSTER[selIdx];
      fetch('/api/pick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: net.id, char: cur.id }),
      }).then((r) => r.json()).then((d) => {
        if (d && d.ok) {
          net.pick = cur.id;
          if (!game.player.evil) game.setPlayerSprites(charSprites[cur.id] || luxSprites);
        }
      }).catch(() => {});
    }
    document.getElementById('csLeft').addEventListener('click', () => { if (selectOpen) browseSelect(-1); });
    document.getElementById('csRight').addEventListener('click', () => { if (selectOpen) browseSelect(1); });
    window.addEventListener('keydown', (e) => {
      if (!selectOpen || e.repeat) return;
      const tag = document.activeElement && document.activeElement.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return; // typing guard
      if (e.key === 'ArrowLeft') { e.preventDefault(); browseSelect(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); browseSelect(1); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lockPick(); }
    });
    // lobby runners
    setInterval(() => {
      if (!selectOpen) return;
      csFrame = (csFrame + 1) % 2;
      const paint = (el) => {
        if (!el || !el._runImg) return;
        const src = runFrameFor(el._runChar, el === csSlotEls.killer);
        if (src && el._runImg.src !== src) el._runImg.src = src;
      };
      paint(csSlotEls.killer);
      for (const el of csSlotEls.surv) paint(el);
    }, 180);
    // chat box
    const chatBox = document.getElementById('chatBox');
    const seenChat = new Set();
    let muteTimer = null;
    function applyMute(secs) {
      // mute lock
      chatBox.disabled = true;
      clearInterval(muteTimer);
      let left = secs;
      const show = () => {
        chatBox.placeholder = `muted!! ${Math.ceil(left / 60)} min left!!`;
      };
      show();
      muteTimer = setInterval(() => {
        left -= 5;
        if (left <= 0) {
          clearInterval(muteTimer);
          chatBox.disabled = false;
          chatBox.placeholder = 'say something!! (enter)';
        } else show();
      }, 5000);
    }
    function sendChat() {
      const text = chatBox.value.trim().slice(0, 60);
      chatBox.value = '';
      chatBox.blur();
      if (!text) return;
      // chat filter
      if (typeof isMessageClean === 'function' && !isMessageClean(text)) {
        chatBox.placeholder = 'yikes!! blocked!!';
        fileSfx(SFX + 'denied.wav', {});
        setTimeout(() => { chatBox.placeholder = 'say something!! (enter)'; }, 2000);
        return;
      }
      if (!net.id) {
        chatBox.placeholder = 'not connected!!';
        fileSfx(SFX + 'denied.wav', {});
        setTimeout(() => { chatBox.placeholder = 'say something!! (enter)'; }, 2000);
        return;
      }
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: net.id, text }),
      }).then((r) => r.json()).then((d) => {
        if (d && d.ok === false && d.reason === 'blocked') {
          chatBox.placeholder = 'yikes!! blocked!!';
          fileSfx(SFX + 'denied.wav', {});
          setTimeout(() => { chatBox.placeholder = 'say something!! (enter)'; }, 2000);
        } else if (d && d.ok === false && d.reason === 'muted') {
          applyMute(d.left || 600);
        }
      }).catch(() => {});
    }
    window.addEventListener('keydown', (e) => {
      if (selectOpen) return; // select eats keys
      const typing = document.activeElement === chatBox || document.activeElement === nameBox;
      if (e.key === 'Enter' && !typing) {
        e.preventDefault();
        game.input.left = game.input.right = game.input.jump = false; // stop moving
        chatBox.focus();
      } else if (e.key === 'Enter' && document.activeElement === chatBox) {
        sendChat();
      } else if (e.key === 'Escape' && document.activeElement === chatBox) {
        chatBox.value = '';
        chatBox.blur();
      }
    });
    setInterval(() => {
      // old bubbles
      const now = Date.now();
      for (const k of Object.keys(game.bubbles)) {
        if (now >= (game.bubbles[k].until || 0)) delete game.bubbles[k];
      }
      if (seenChat.size > 200) seenChat.clear();
    }, 500);
    // music beds
    function loopTrack(src) {
      const a = new Audio(src);
      a.loop = true;
      a.volume = 0;
      // loop backup
      a.addEventListener('ended', () => { a.currentTime = 0; a.play().catch(() => {}); });
      return a;
    }
    const MUS = './Assets/Musics/';
    const beds = {
      map: loopTrack(MUS + 'map_musicV2.mp3'),
      wait: loopTrack(MUS + 'waiting4players.mp3'),
      inter: loopTrack(MUS + 'intermission.mp3'),
      lms: loopTrack(MUS + 'last_man_standing.mp3'),
      lmslux: loopTrack(MUS + 'lux_lms.mp3'), // lux anthem
      chase: loopTrack(MUS + 'chase_elux.mp3'),
      terror: loopTrack(MUS + 'terror_radius_elux.mp3'),
      charselect: loopTrack(MUS + 'charselect.mp3'),
    };
    const chaseAudio = beds.chase, terrorAudio = beds.terror;
    let audioStarted = false;
    let titleLive = true; // locked audio
    // debug solo
    let soloIdx = -1;
    // lms rules
    let lmsTrack = null; // track ids
    let lmsStartT = null; // lms clock
    const soloOrder = ['map', 'wait', 'inter', 'lms', 'lmslux', 'chase', 'terror', 'charselect'];
    window.addEventListener('keydown', (e) => {
      if (e.repeat || e.key.toLowerCase() !== 'm') return;
      soloIdx = soloIdx >= soloOrder.length - 1 ? -1 : soloIdx + 1;
    });
    function kickAudio() {
      // audio unlock
      if (audioStarted) return;
      audioStarted = true;
      for (const a of Object.values(beds)) {
        a.play().then(() => a.pause()).catch(() => {});
      }
    }
    window.addEventListener('keydown', kickAudio);
    window.addEventListener('pointerdown', kickAudio);

    // real sounds
    const SFX = './Assets/Sounds/';
    game.onJump = (dbl) => fileSfx(SFX + 'jump.wav', { rate: dbl ? 1.3 : 1 });
    game.onHeal = (n) => {
      // sync heal
      if (!net.id || !game.player) return;
      fetch('/api/heal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: net.id, amount: n || 10, max: game.player.maxHp }),
      }).catch(() => {});
    };
    // sound files
    function fileSfx(src, o) {
      if (!audioStarted || titleLive) return; // title mutes
      try {
        const a = new Audio(src);
        a.playbackRate = (o && o.rate) || 1;
        a.volume = (o && o.v) || 0.5;
        a.play().catch(() => {});
      } catch (e) { /* silent!! */ }
    }
    // loop sounds
    function loopSfx(src, v) {
      const a = new Audio(src);
      a.loop = true;
      a.volume = v || 0.4;
      let on = false;
      return {
        start() {
          if (!on && audioStarted && !titleLive) {
            on = true;
            a.play().catch(() => { on = false; });
          }
        },
        stop() {
          if (!on) return;
          on = false;
          try { a.pause(); } catch (e) { /* silent!! */ }
        },
      };
    }
    const cowerLoop = loopSfx(SFX + 'cower_loop.wav', 0.35);
    const pullLoop = loopSfx(SFX + 'pull_loop.wav', 0.35);
    // evil kit
    // weak pull
    const PULL_RANGE = 450;
    // lms buffs
    const LMS_HP = 150; // more health
    const LMS_CD = 0.6; // faster cds
    const K = {
      spikeCD: 0, sneakCD: 0, pullCD: 0, rushCD: 0, m1CD: 0, m1ok: true,
      invisUntil: 0, penaltyUntil: 0, pullUntil: 0, pullHit: false,
      windupUntil: 0, chargeUntil: 0, charging: false,
    };
    const trippedIds = new Set(); // used spikes
    const abilBar = document.getElementById('abilities');
    // spike pips
    const spikeBar = document.getElementById('spikeBar');
    const spikePips = document.getElementById('spikePips');
    const PIP_FULL = './Assets/Images/UI/spikepip_full.png';
    const PIP_EMPTY = './Assets/Images/UI/spikepip_empty.png';
    for (let i = 0; i < 5; i++) {
      const im = document.createElement('img');
      im.src = PIP_FULL;
      im.alt = '';
      spikePips.appendChild(im);
    }
    // blank slots
    const AB = './Assets/Images/UI/Abillities/';
    const ABIL_ICONS = {
      hit: null,
      spikes: AB + 'ability_spikes.png',
      sneak: AB + 'ability_sneak.png',
      pull: AB + 'abillity_pull.png',
      rush: AB + 'ability_rushdown.png',
      dash: AB + 'abillity_dash.png',
      cower: AB + 'abillity_cower.png',
      roundhouse: AB + 'ability_roundhouse.png',
      jab: AB + 'ability_jab.png',
    };
    let abilDefs = [];
    function buildAbilities() {
      // role icons
      const p = game.player;
      if (!p) return;
      if (p.evil) {
        abilDefs = [
          { key: 'X', name: 'SPIKES', icon: ABIL_ICONS.spikes, cd: () => K.spikeCD },
          { key: 'C', name: p.invis ? 'CANCEL' : 'SNEAK', icon: ABIL_ICONS.sneak, cd: () => K.sneakCD },
          { key: 'V', name: 'PULL', icon: ABIL_ICONS.pull, cd: () => K.pullCD },
          { key: 'B', name: 'RUSH', icon: ABIL_ICONS.rush, cd: () => K.rushCD },
        ];
      } else if (isToko()) {
        abilDefs = [
          { key: 'Z', name: 'ROUNDHOUSE', icon: ABIL_ICONS.roundhouse, cd: () => T.kickCD },
          { key: 'X', name: 'JAB', icon: ABIL_ICONS.jab, cd: () => T.jabCD },
        ];
      } else {
        abilDefs = [
          { key: 'Z', name: 'DASH', icon: ABIL_ICONS.dash, cd: () => S.dashCD },
          { key: 'X', name: 'COWER', icon: ABIL_ICONS.cower, cd: () => S.cowerCD },
        ];
      }
      abilBar.innerHTML = '';
      for (const d of abilDefs) {
        const slot = document.createElement('div');
        slot.className = 'abSlot';
        if (d.icon) {
          const img = document.createElement('img');
          img.src = d.icon;
          img.alt = d.name;
          slot.appendChild(img);
        } else {
          const blank = document.createElement('div');
          blank.className = 'abBlank';
          slot.appendChild(blank);
        }
        const cd = document.createElement('span');
        cd.className = 'abCd';
        slot.appendChild(cd);
        const label = document.createElement('span');
        label.className = 'abName';
        label.textContent = `${d.key} ${d.name}`;
        slot.appendChild(label);
        d.el = slot;
        d.cdEl = cd;
        abilBar.appendChild(slot);
      }
    }
    // evil form
    function applyRole(evil) {
      const p = game.player;
      p.evil = evil;
      if (evil) {
        game.setPlayerSprites(evilSprites);
        p.maxHp = 250; p.hp = 250;
        p.maxJumps = 2; // double jump
        game.moveSpeed = 300; // evil speed
        game.spawn = { x: 4300, y: 100 }; // far spawn
      } else {
        game.setPlayerSprites(charSprites[net.pick] || luxSprites);
        p.maxHp = 100; p.hp = Math.min(p.hp, 100);
        p.maxJumps = 1;
        game.moveSpeed = 240;
        game.spawn = { x: 60, y: 100 };
        p.invis = false; p.rooted = false; p.chargeDir = 0;
        K.charging = false;
        game.pullSrc = null;
      }
      abilBar.style.display = 'none'; // phase icons
    }
    let abilRole = '';
    function abilTick() {
      // cooldown overlay
      const now = Date.now();
      const p = game.player;
      if (!p || !net.id) return;
      const role = p.evil ? 'evil' : (isToko() ? 'toko' : 'lux');
      if (role !== abilRole) {
        abilRole = role;
        buildAbilities();
      }
      for (const d of abilDefs) {
        const left = Math.ceil((d.cd() - now) / 1000);
        const cooling = left > 0;
        d.el.classList.toggle('cd', cooling);
        d.cdEl.textContent = cooling ? `${left}` : '';
        if (d.key === 'C' && p.evil) {
          d.el.querySelector('.abName').textContent = `C ${p.invis ? 'CANCEL' : 'SNEAK'}`;
        }
      }
      // trap count
      const showSpikes = !!(p.evil && p.alive !== false && net.phase === 'round');
      spikeBar.style.display = showSpikes ? 'flex' : 'none';
      if (showSpikes) {
        const trapsLeft = Math.max(0, 5 - (game.spikes ? game.spikes.length : 0));
        [...spikePips.children].forEach((el, i) => {
          const src = i < trapsLeft ? PIP_FULL : PIP_EMPTY;
          if (el.getAttribute('src') !== src) el.src = src;
        });
      }
      // afk button
      afkBtn.style.display = (net.id && net.phase !== 'round') || net.afk ? 'block' : 'none';
    }
    setInterval(() => { if (game.player && net.id) abilTick(); }, 250);
    // pose flashes
    let poseName = null, poseUntil = 0;
    function setPose(name, ms) { poseName = name; poseUntil = Date.now() + ms; }
    function poseImage(isEvil, char, pose) {
      if (isEvil) {
        if (pose === 'swing') return evilM1[0];
        if (pose === 'spike') return evilAct.spike;
      } else if (char === 'toko') {
        if (pose === 'kick') return tokoSprites.kick[0];
        if (pose === 'jab') return tokoSprites.jab[0];
      } else {
        if (pose === 'dash') return luxDash;
      }
      return null;
    }
    // clear evil
    function clearEvil(p) {
      p.invis = false; p.rooted = false; p.chargeDir = 0;
      p.cowerT = 0; p.cowering = false; p.stunT = 0;
      K.charging = false; K.pullUntil = 0; K.windupUntil = 0;
      S.windupUntil = 0; S.dashing = false;
      T.kickUntil = 0; T.jabUntil = 0;
      game.pullSrc = null;
    }
    // survivor kit
    // hit or whiff
    const S = {
      dashCD: 0, cowerCD: 0, windupUntil: 0,
      dashUntil: 0, dashing: false, dashHit: false,
      countered: false, wasCowering: false,
    };
    const T = {
      kickCD: 0, jabCD: 0, kickUntil: 0, kickHit: false,
      jabUntil: 0, jabHit: false,
    };
    const isToko = () => (net.pick || 'lux') === 'toko';
    game.onCounter = () => {
      // eat hits
      S.countered = true;
      fileSfx(SFX + 'basic_hit.wav', {}); // counter sting
      if (net.ekid) {
        fetch('/api/hit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: net.id, victim: net.ekid, dmg: 0, stun: 2 }),
        }).catch(() => {});
      }
    };
    // blocked sight
    function losClear(x1, y1, x2, y2) {
      for (let i = 1; i < 12; i++) {
        const sx = x1 + (x2 - x1) * i / 12, sy = y1 + (y2 - y1) * i / 12;
        for (const s of game.statics) {
          if (sx > s.pos.x && sx < s.pos.x + s.w && sy > s.pos.y && sy < s.pos.y + s.h) return false;
        }
      }
      return true;
    }
    window.addEventListener('keydown', (e) => {
      if (e.repeat || !net.id || !game.player || game.player.alive !== false) return;
      const alive = game.remotes.filter((r) => r.alive && r.hp > 0);
      if (!alive.length) return;
      let i = alive.findIndex((r) => r.id === specId);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') i = (i + 1) % alive.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') i = (i - 1 + alive.length) % alive.length;
      else return;
      specId = alive[i < 0 ? 0 : i].id;
      game.cameraTarget = alive[i < 0 ? 0 : i];
    });
    setInterval(() => {
      const ping = net.id && net.ping != null ? `${net.ping}ms` : '--';
      const solo = soloIdx >= 0 ? ` | mus: ${soloOrder[soloIdx]} (M)` : '';
      statsBox.textContent = `fps: ${game.fps || '--'} | ping: ${ping}${solo}`;
      // tired overlay
      vignette.style.opacity = game.player ? Math.min(1, game.player.fatigue || 0).toFixed(2) : 0;
    }, 100);
    game.onDeath = () => {
      const p = game.player;
      clearEvil(p);
      if (!net.id) { // dead respawn
        netError('not connected!! start the server and refresh!!', 30);
        p.hp = p.maxHp;
        game.respawn();
        return;
      }
      sayStatus('you died!! spectating the survivors...', 5);
    };
    game.onSpikeTrip = (sp) => {
      trippedIds.add(sp.id); // one trip
      fileSfx(SFX + 'basic_hit.wav', {}); // trap sound
      if (net.id) {
        fetch('/api/spike', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: net.id, action: 'trip', spike: sp.id }),
        }).catch(() => {});
      }
    };
    async function joinOnline(name) {
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
          body: JSON.stringify({ name, mid: myMID(), tab: tabId }),
        });
        if (res.status === 403) {
          // still knocking
          let msg = 'match running — waiting to sneak in!!';
          try {
            const e = await res.json();
            if (e && /locked/.test(e.error || '')) msg = 'match locked — waiting for next one!!';
          } catch (e2) { /* plain 403!! */ }
          netStatus.textContent = msg;
          clearTimeout(net.retry);
          net.retry = setTimeout(() => joinOnline(name), 3000);
          return;
        }
        if (!res.ok) throw new Error('nope');
        const joined = await res.json();
        net.id = joined.id;
        setAFK(false); // fresh joins always enter as active players
        hideFatal(); // error clear
        // fake loading
        const held = Date.now() - (net.titleT0 || Date.now());
        setTimeout(() => {
          const titleEl = document.getElementById('titleScreen');
          if (titleEl) titleEl.style.display = 'none';
          titleLive = false;
        }, Math.max(0, 3000 - held));
        clearTimeout(net.retry);
        net.mod = !!joined.mod;
        net.everOnline = true; // stay joined
        sayStatus(`online as ${joined.name || name}!! friends can see you!! :D`, 4);
        if (window.__wantDebug && joined.mod) openModMenu();
        if (joined.mid) {
          try { sessionStorage.setItem('pch_mid', joined.mid); } catch (e) { /* oh well!! */ }
        }
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
        net.retry = setTimeout(() => joinOnline(name), 3000);
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
        netError('open this page through the server, not as a file!! (http://127.0.0.1:8000)', 3600);
        return;
      }
      const params = new URLSearchParams(location.search);
      const name = (params.get('name') || `lux${Math.floor(1000 + Math.random() * 9000)}`).slice(0, 16);
      nameBox.value = name;
      net.pendingName = name;
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
            invis: p.invis === true, m1: K.m1ok !== false,
            stunned: (p.stunT || 0) > 0, pull: Date.now() < K.pullUntil,
            cower: (p.cowerT || 0) > 0, windup: !!S.windupUntil || !!K.windupUntil,
            dashing: !!S.dashing,
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
          joinOnline((nameBox.value.trim() || 'friend').slice(0, 16));
          return;
        }
        const prevPhase = net.phase;
        const you = others[net.id];
        let justRevived = false;
        // phase reset
        if (data.phase && data.phase !== net.phase) {
          net.phase = data.phase;
          soloIdx = -1; // reset ears
          lmsTrack = null; lmsStartT = null; // reset lms
          beds.lms.pause(); beds.lmslux.pause(); beds.chase.pause(); beds.terror.pause();
          clearEvil(p);
          trippedIds.clear();
          if (data.phase !== 'round' || you?.in_round) {
            if (data.phase === 'round') game.switchMap('main', 60, 100);
            else game.switchMap('inter', 6120, 100); // island map
            if (!p.evil) { p.maxHp = 100; } // drop buffs
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
        // evil incoming
        // far exile
        if (net.amKillerElect && !net.wasElect) {
          clearTimeout(roleTimer);
          roleBox.textContent = 'YOU WILL BE EVIL!!';
          roleBox.style.color = '#ff4757';
          roleBox.style.display = 'block';
          roleTimer = setTimeout(() => { roleBox.style.display = 'none'; }, 3000);
          sayStatus('you will be evil — no picking!!', 5);
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
          roleBox.textContent = amEvil
            ? (fresh ? 'YOU ARE EVIL LUX!!' : 'YOU ARE EVIL NOW!!')
            : (fresh ? 'SURVIVE!!' : 'BACK TO NORMAL!!');
          roleBox.style.color = amEvil ? '#ff4757' : '#2ed573';
          roleBox.style.display = 'block';
          roleTimer = setTimeout(() => { roleBox.style.display = 'none'; }, 3000);
        }
        // phase text
        let phaseText = 'lobby!!';
        if (data.phase === 'lobby') {
          // head count
          const here = Object.entries(others)
            .filter(([id, o]) => id !== net.id && !o.away && (o.idle || 0) < 10).length
            + (net.afk ? 0 : 1);
          phaseText = `lobby — waiting for players (${here}/2)!!`;
        } else if (data.phase === 'intermission') {
          const t = Math.max(0, data.time_left || 0);
          const r = data.result;
          const who = r && r.winner === 'killer' ? `EVIL ${r.killer_name} WINS!!` : 'SURVIVORS WIN!!';
          phaseText = `${who} picks open in ${t}s!!`;
        } else if (data.phase === 'select') {
          const t = Math.max(0, data.time_left || 0);
          phaseText = `PICK YOUR CHARACTER!! (${t}s)`;
        } else if (data.phase === 'round') {
          const t = Math.max(0, data.time_left || 0);
          // count up
          const sl = (you?.in_round && p.alive !== false && !p.evil ? 1 : 0) +
            game.remotes.filter((r) => r.inRound && r.alive && r.hp > 0 && !r.evil).length;
          let mm;
          if (sl === 1) {
            const up = lmsStartT ? Math.max(0, Math.floor((Date.now() - lmsStartT) / 1000)) : 0;
            mm = `${Math.floor(up / 60)}:${String(up % 60).padStart(2, '0')}`;
          } else {
            mm = `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
          }
          phaseText = !you?.in_round ? 'AFK — spectating this round!!'
            : data.notice
            ? `${data.notice} (${data.notice_left || 0}s)`
            : data.grace
            ? `GRACE — RUN!! (${mm})`
            : (p.evil ? `${mm} — YOU ARE EVIL!! Z = hit!!` : `${mm} — run!! evil: ${data.killer_name || '???'}`);
        }
        if (phaseText !== lastPhaseText) { phaseLine.textContent = phaseText; lastPhaseText = phaseText; }
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
              w: 36, h: 78, drawW: 64, drawH: 90, facing: 1,
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
          r.char = d.char || 'lux';
          r.onGround = d.onGround ?? true;
          r.alive = d.alive ?? d.hp > 0;
          r.evil = id === data.killer_id;
          r.maxHp = d.maxhp || (r.evil ? 250 : 100); // true bars
          r.sprites = r.evil ? evilSprites : (charSprites[r.char] || luxSprites); // see all
          r.invis = !!d.invis;
          r.stunned = !!d.stunned;
          r.pull = !!d.pull;
          r.dashing = !!d.dashing;
          r.away = !!d.away;
          r.inRound = !!d.in_round;
          r.redFlash = !!d.windup && !!r.evil; // red warning
          r.cyanFlash = !!d.windup && !r.evil; // cyan windup
          r.cowering = !!d.cower;
          // pose frames
          if (d.windup) {
            r.poseImg = r.evil ? evilWindup[0] : luxSprites.run[0];
            r.poseUntil = Date.now() + 150;
          } else if (d.pose && d.pose !== r.pose) {
            r.pose = d.pose;
            r.poseUntil = Date.now() + 350;
            r.poseImg = poseImage(r.evil, r.char, d.pose);
          } else if (!d.pose) {
            r.pose = null;
          }
          if (p.evil && r._lastHp !== undefined && r.hp < r._lastHp) {
            fileSfx(SFX + 'm1_hit.wav', {}); // hit sound
          }
          r._lastHp = r.hp;
        }
        game.remotes = game.remotes.filter((r) => seen.has(r.id));
        // learn picks
        const mePick = (data.players || {})[net.id];
        if (mePick && mePick.char && mePick.char !== net.pick) {
          net.pick = mePick.char;
          if (!p.evil) game.setPlayerSprites(charSprites[mePick.char] || luxSprites);
        } else if (mePick && !mePick.char && net.pick) {
          net.pick = null;
          if (!p.evil) game.setPlayerSprites(luxSprites);
        }
        // server truth
        if (!statusUntil || Date.now() > statusUntil) {
          netStatus.style.color = ''; // no error
          const mc = (mePick && mePick.char) || net.pick;
          netStatus.textContent = p.evil ? 'YOU ARE EVIL LUX!!'
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
          for (const c of (data.chars || [])) takenMap[c.id] = !!c.taken;
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
        const lmsKey = luxLMS ? 'lmslux' : 'lms';
        if (isLMS && lmsTrack !== lmsKey) {
          // start anthem
          for (const k of ['chase', 'terror', 'map', 'lms', 'lmslux']) {
            beds[k].pause();
            try { beds[k].currentTime = 0; } catch (_) { /* hush!! */ }
          }
          if (!document.hidden) beds[lmsKey].play().catch(() => {});
          lmsTrack = lmsKey;
          lmsStartT = Date.now(); // start clock
          if (!p.evil && p.alive !== false) {
            // heal up
            p.maxHp = LMS_HP; p.hp = LMS_HP;
            S.dashCD = 0; S.cowerCD = 0; T.kickCD = 0; T.jabCD = 0;
            fetch('/api/heal', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: net.id, amount: 999, max: LMS_HP }),
            }).catch(() => {});
          }
        } else if (!isLMS && lmsTrack) {
          // lms over
          beds.lms.pause(); beds.lmslux.pause();
          lmsTrack = null; lmsStartT = null;
          if (!p.evil) { p.maxHp = 100; p.hp = Math.min(p.hp, 100); } // drop buffs
        }
        // block chase
        if (isLMS) { chaseT = 0; terrorT = 0; }
        // lms first
        const cands = [
          ['lmslux', luxLMS ? 1 : 0, 0.25],
          ['lms', isLMS && !luxLMS ? 1 : 0, 0.25],
          ['chase', chaseT, 0.5],
          ['terror', terrorT, 0.5],
          ['inter', data.phase === 'intermission' ? 1 : 0, 0.3],
          ['charselect', selectOpen && data.phase === 'select' ? 1 : 0, 0.4],
          ['map', data.phase === 'round' ? 1 : 0, 0.12],
          ['wait', data.phase === 'lobby' ? 1 : 0, 0.3],
        ];
        const bedT = { map: 0, wait: 0, inter: 0, lms: 0, lmslux: 0, chase: 0, terror: 0, charselect: 0 };
        const win = cands.find((c) => c[1] > 0.05);
        if (win) bedT[win[0]] = win[2] * (win[0] === 'chase' || win[0] === 'terror' ? win[1] : 1);
        if (document.hidden) for (const k in bedT) bedT[k] = 0; // mute hidden
        for (const [key, a] of Object.entries(beds)) {
          // pause means silent
          // title mutes
          let target = soloIdx >= 0 ? (key === soloOrder[soloIdx] ? 0.8 : 0) : (bedT[key] || 0);
          if (titleLive) target = 0;
          if (target > 0.01) {
            if (a.paused) a.play().catch(() => {});
            a.volume += (target - a.volume) * 0.15; // fade in
          } else if (!a.paused) {
            a.volume += (0 - a.volume) * 0.3; // fade out
            if (a.volume < 0.02) a.pause();
          }
        }
        // feel stuns
        if (you && (you.stun || 0) > (p.stunT || 0)) p.stunT = you.stun;
        // stun sting
        if (p.evil && (p.stunT || 0) > (p._lastStun || 0)) {
          fileSfx(SFX + 'basic_hit.wav', {});
        }
        p._lastStun = p.stunT || 0;
        // ate hits
        if (you && you.countered && !p.evil) {
          S.countered = true; // shorter wait
          p.cowerT = 0; p.cowering = false;
          fileSfx(SFX + 'basic_hit.wav', {}); // got em
        }
        // shove killers
        if (p.evil && you && you.kb && you.kb.at !== p._lastKb) {
          p._lastKb = you.kb.at;
          p.vel.x = (you.kb.x || 0) * Math.min(1100, 375 * (you.kb.s || 2));
          if (p.onGround) p.vel.y = Math.min(p.vel.y || 0, -220); // hop up
        }
        // traps pings
        for (const sp of (data.spikes || [])) if (trippedIds.has(sp.id)) sp.tripped = true;
        game.spikes = data.spikes || [];
        game.alerts = data.alerts || [];
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
        game.seeInvis = !!p.evil || p.alive === false;
        game.damageOn = !!net.id && (!net.phase || net.phase === 'round');
        game.lmsResist = !!(isLMS && !p.evil && p.alive !== false);
        abilBar.style.display = net.id && p.alive !== false ? 'flex' : 'none';
        // evil keys
        const now = Date.now();
        // abilities locked while picking
        const canCast = p.alive !== false && (p.stunT || 0) <= 0 && !selectOpen;
        if (!canCast) while (game.input.consumeAbility()) {} // clear queue
        const m1Muted = now < K.penaltyUntil; // sneak mute
        let ab;
        while (canCast && (ab = game.input.consumeAbility())) {
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
                body: JSON.stringify({ id: net.id, victim: victim.id, dmg: 25, stun: 0 }),
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
            // no exit traps
            const sx = Math.round(p.pos.x + p.w / 2), sy = Math.round(p.pos.y + p.h);
            if (Math.abs(sx - EXIT_X) < EXIT_SAFE) {
              sayStatus('too close to exit!!', 2);
              fileSfx(SFX + 'denied.wav', {});
            } else {
              K.spikeCD = now + 10000;
              p.actionImg = evilAct.spike; p.actionT = 0.5;
              setPose('spike', 500);
              fileSfx(SFX + 'spike_place.wav', {});
              fetch('/api/spike', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: net.id, action: 'place', x: sx, y: sy }),
              }).catch(() => {});
            }
          } else if (ab === 'C' && now >= K.sneakCD) {
            // ghost mode
            p.invis = true;
            K.invisUntil = now + 10000; K.sneakCD = now + 20000;
          } else if (ab === 'V' && now >= K.pullCD) {
            K.pullUntil = now + 5000;
            // empty pull
            const kx = p.pos.x + p.w / 2, ky = p.pos.y + p.h / 2;
            const anyone = game.remotes.some((r) => {
              if (r.evil || !r.alive || r.hp <= 0) return false;
              const rx = r.pos.x + r.w / 2, ry = r.pos.y + r.h / 2;
              return Math.hypot(kx - rx, ky - ry) < PULL_RANGE && losClear(kx, ky, rx, ry);
            });
            K.pullCD = now + (anyone ? 22000 : 8000);
            K.pullHit = false;
            if (!anyone) {
              // drop ropes
              K.pullUntil = 0;
              p.stunT = Math.max(p.stunT || 0, 3);
              fileSfx(SFX + 'denied.wav', {});
              sayStatus('nobody around!!', 2);
            }
          } else if (ab === 'B' && now >= K.rushCD && !K.charging && !K.windupUntil) {
            K.windupUntil = now + 3000; // rooted windup
            K.rushCD = now + 15000;
            p.rooted = true;
            p.actionImg = evilAct.windup; p.actionT = 3.1;
            fileSfx(SFX + 'dash_charge.wav', {});
          }
        }
        // mute over
        if (p.invis && now >= K.invisUntil) {
          p.invis = false;
          K.penaltyUntil = now + 5000;
        }
        // loud reveal
        if (K.wasInvis && !p.invis) fileSfx(SFX + 'sneak_reveal.mp3', {});
        K.wasInvis = !!p.invis;
        if (p.evil && p.alive !== false && now < K.pullUntil) { p.actionImg = evilAct.pull; p.actionT = 0.15; pullLoop.start(); }
        else pullLoop.stop();
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
                  body: JSON.stringify({ id: net.id, victim: r.id, dmg: 50, stun: 3 }),
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
          else if (!K.windupUntil && !K.charging) p.rooted = false;
        }
        // weak grab
        if (p.evil && p.alive !== false && data.phase === 'round' && now < K.pullUntil) {
          const kx = p.pos.x + p.w / 2, ky = p.pos.y + p.h / 2;
          for (const r of game.remotes) {
            if (r.evil || !r.alive || r.hp <= 0) continue;
            const rx = r.pos.x + r.w / 2, ry = r.pos.y + r.h / 2;
            if (Math.hypot(kx - rx, ky - ry) >= 640) continue;
            if (!losClear(kx, ky, rx, ry)) continue; // caught here
            if (Math.abs(r.pos.x - p.pos.x) < 55 &&
                Math.abs((r.pos.y + r.h / 2) - (p.pos.y + p.h / 2)) < 70) {
              fetch('/api/hit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: net.id, victim: r.id, dmg: 10, stun: 0 }),
              }).catch(() => {});
              K.pullHit = true; // caught one
              fileSfx(SFX + 'basic_hit.wav', {}); // grab sound
            }
          }
        }
        // fast ghost
        if (p.evil) game.moveSpeed = p.invis ? 430 : 300;
        // lux dash
        if (!p.evil && !isToko()) {
          if (S.windupUntil && now >= S.windupUntil) {
            S.windupUntil = 0;
            S.dashing = true; S.dashUntil = now + 2000; S.dashHit = false;
            S.dashTouching = false;
            p.chargeDir = p.facing || 1;
            p.rooted = false;
            fileSfx(SFX + 'dash_release.wav', {});
          }
          if (S.dashing) {
            // steer dash
            if (game.input.left) { p.facing = -1; p.chargeDir = -1; }
            else if (game.input.right) { p.facing = 1; p.chargeDir = 1; }
            if (now >= S.dashUntil || p.alive === false) {
              S.dashing = false; p.chargeDir = 0; S.dashTouching = false;
              S.dashCD = now + (S.dashHit ? 15000 : 25000) * (isLMS ? LMS_CD : 1); // dash waits
            } else {
              game.afterimages.push({
                x: p.pos.x, y: p.pos.y, w: p.w, h: p.h,
                drawW: p.drawW, drawH: p.drawH, facing: p.facing,
                img: game._spriteFor(p), age: 0,
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
        // toko ticks
        if (!p.evil && isToko()) {
          const ek = game.remotes.find((r) => r.id === net.ekid && r.alive && r.hp > 0);
          const ekClose = (dx, dy) => ek &&
            Math.abs(ek.pos.x - p.pos.x) < dx &&
            Math.abs((ek.pos.y + ek.h / 2) - (p.pos.y + p.h / 2)) < dy;
          // bounce kick
          if (T.kickUntil) {
            p.actionImg = tokoSprites.kick[Math.floor(now / 120) % 2]; p.actionT = 0.15;
            // ground ends
            const landed = p.onGround && now > (T.kickStart || 0) + 100;
            if (now >= T.kickUntil || landed) {
              T.kickUntil = 0;
              p.chargeDir = 0; p.chargeSpeed = 0;
              T.kickCD = now + (T.kickHit ? 20000 : 30000) * (isLMS ? LMS_CD : 1); // kick waits
              if (!T.kickHit) fileSfx(SFX + 'denied.wav', {}); // missed kick
            } else if (!T.kickHit && ekClose(60, 80)) {
              T.kickHit = true;
              T.kickUntil = 0; // start bounce
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
          }
          // fast jab
          if (T.jabUntil) {
            p.actionImg = tokoSprites.jab[Math.floor(now / 100) % 2]; p.actionT = 0.15;
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
              p.rooted = false;
              if (T.jabHit) {
                T.jabCD = now + 15000 * (isLMS ? LMS_CD : 1); // fast recharge
              } else {
                T.jabCD = now + 25000 * (isLMS ? LMS_CD : 1); // slow whiff
                p.stunT = Math.max(p.stunT || 0, 2);
                fileSfx(SFX + 'denied.wav', {}); // missed jab
              }
            }
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
              if (Math.hypot(kx - mx, ky - my) < 640 && losClear(mx, my, kx, ky)) {
                game.pullLinks.push({ x1: mx, y1: my, x2: kx, y2: ky });
                if (vc === p) game.pullSrc = { x: kx, y: ky };
              }
            }
          }
        }
        // dead spec
        if (p.alive === false && net.id) {
          const alive = game.remotes.filter((r) => r.alive && r.hp > 0);
          if (!alive.find((r) => r.id === specId)) specId = alive.length ? alive[0].id : null;
          game.cameraTarget = alive.find((r) => r.id === specId) || null;
          const t = game.cameraTarget;
          specBox.textContent = t ? `SPECTATING ${t.name}!!` : 'SPECTATING!!';
          specBox.style.display = 'block';
          specHint.style.display = 'block';
        } else {
          specBox.style.display = 'none';
          specHint.style.display = 'none';
        }
        if (net.fail > 0) { netStatus.style.color = ''; hideFatal(); } // error clear
        net.fail = 0;
      } catch (e) {
        // count fails
        net.fail = (net.fail || 0) + 1;
        if (net.fail === 75) netError('connection lost!! retrying...', 30);
      }
    }
