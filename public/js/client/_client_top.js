function loadImg(src) {
      const img = new Image();
      img.src = src;
      return img;
    }
    const LUX = "./Assets/Images/Characters/Survivors/Lux/";

    const canvas = document.getElementById('game');
    const game = new PlatformerEngine(canvas, { width: 800, height: 450, background: '#bfe9ff' });

    // small hitbox
    const lux = game.addPlayer(60, 100, 28, 60);
    lux.drawW = 50; lux.drawH = 70;
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
      { id: 'sonic', name: 'SONIC', nameImg: CS + 'sonicname.png' },
      { id: 'supersonic', name: 'SUPER SONIC', nameImg: CS + 'supersonicname.png' },
      { id: 'tails', name: 'TAILS', nameImg: CS + 'tailsname.png' },
      { id: 'nyan', name: 'NYAN CYAT', nameImg: CS + 'nyanname.png' },
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
    const SONIC = "./Assets/Images/Characters/Survivors/Sonic/";
    const sonicSprites = {
      idle: [loadImg(SONIC + "idle (1).png"), loadImg(SONIC + "idlelong.png"), loadImg(SONIC + "idlelong2.png"), loadImg(SONIC + "idlelong3.png"), loadImg(SONIC + "idlelong4.png"), loadImg(SONIC + "idlelong5.png"), loadImg(SONIC + "idlelong6.png"), loadImg(SONIC + "idlelong7.png")],
      walk: [loadImg(SONIC + "walk.png"), loadImg(SONIC + "walk2.png"), loadImg(SONIC + "walk3.png"), loadImg(SONIC + "walk4.png"), loadImg(SONIC + "walk5.png"), loadImg(SONIC + "walk6.png"), loadImg(SONIC + "walk7.png"), loadImg(SONIC + "walk8.png")],
      run: [loadImg(SONIC + "run.png"), loadImg(SONIC + "run2.png"), loadImg(SONIC + "run3.png"), loadImg(SONIC + "run4.png"), loadImg(SONIC + "run5.png"), loadImg(SONIC + "run6.png"), loadImg(SONIC + "run7.png"), loadImg(SONIC + "run8.png")],
      runStride: 35,
      jump: [loadImg(SONIC + "jump.png"), loadImg(SONIC + "roll.png"), loadImg(SONIC + "roll2.png"), loadImg(SONIC + "roll3.png"), loadImg(SONIC + "roll4.png"), loadImg(SONIC + "roll5.png"), loadImg(SONIC + "roll6.png"), loadImg(SONIC + "roll7.png")],
      jumpScale: 0.87,
      stun: loadImg(SONIC + "stun.png"),
      struggle: [loadImg(SONIC + "struggle.png"), loadImg(SONIC + "struggle2.png")],
      cower: loadImg(SONIC + "idle (1).png"),
      dash: loadImg(SONIC + "run.png"),
      peel: [loadImg(SONIC + "peelout.png"), loadImg(SONIC + "peelout2.png"), loadImg(SONIC + "peelout3.png"), loadImg(SONIC + "peelout4.png")],
      spin: [loadImg(SONIC + "spindash.png"), loadImg(SONIC + "spindash2.png"), loadImg(SONIC + "spindash3.png")],
      charge: [loadImg(SONIC + "peeloutcharge1.png"), loadImg(SONIC + "peeloutcharge2.png"), loadImg(SONIC + "peeloutcharge3.png"), loadImg(SONIC + "peeloutcharge4.png")],
      fall: loadImg(SONIC + "fall.png"),
    };
    const TAILS = "./Assets/Images/Characters/Survivors/Tails/";
    const tailsSprites = {
      idle: [loadImg(TAILS + "idle.png"), loadImg(TAILS + "idle.png"), loadImg(TAILS + "idle.png"), loadImg(TAILS + "idle_blink1.png"), loadImg(TAILS + "idle_blink2.png")],
      walk: [loadImg(TAILS + "walk1.png"), loadImg(TAILS + "walk2.png"), loadImg(TAILS + "walk3.png"), loadImg(TAILS + "walk4.png"), loadImg(TAILS + "walk5.png"), loadImg(TAILS + "walk6.png")],
      run: [loadImg(TAILS + "run1.png"), loadImg(TAILS + "run2.png"), loadImg(TAILS + "run3.png"), loadImg(TAILS + "run4.png"), loadImg(TAILS + "run5.png"), loadImg(TAILS + "run6.png")],
      jump: loadImg(TAILS + "jump.png"),
      fall: loadImg(TAILS + "fall.png"),
      fly: [loadImg(TAILS + "fly.png"), loadImg(TAILS + "fly2.png"), loadImg(TAILS + "fly3.png")],
      stun: loadImg(TAILS + "fall.png"),
      struggle: [loadImg(TAILS + "fall.png")],
      cower: loadImg(TAILS + "idle_blink2.png"),
      dash: loadImg(TAILS + "run1.png"),
      whip: [loadImg(TAILS + "tailwhip.png"), loadImg(TAILS + "tailwhip2.png"), loadImg(TAILS + "tailwhip3.png"), loadImg(TAILS + "tailwhip4.png"), loadImg(TAILS + "tailwhip5.png"), loadImg(TAILS + "tailwhip6.png"), loadImg(TAILS + "tailwhip7.png")],
      throw: [loadImg(TAILS + "throw.png"), loadImg(TAILS + "throw2.png")],
      airthrow: [loadImg(TAILS + "airthrow.png"), loadImg(TAILS + "airthrow2.png")],
      bomb: loadImg(TAILS + "bomb.png"),
    };
    const tailsCarrySprites = { ...tailsSprites,
      idle: [loadImg(TAILS + "bombcarry.png")],
      walk: [loadImg(TAILS + "bombcarry.png"), loadImg(TAILS + "bombcarry2.png"), loadImg(TAILS + "bombcarry3.png"), loadImg(TAILS + "bombcarry4.png"), loadImg(TAILS + "bombcarry5.png"), loadImg(TAILS + "bombcarry6.png")],
      run: [loadImg(TAILS + "bombcarry.png"), loadImg(TAILS + "bombcarry2.png"), loadImg(TAILS + "bombcarry3.png"), loadImg(TAILS + "bombcarry4.png"), loadImg(TAILS + "bombcarry5.png"), loadImg(TAILS + "bombcarry6.png")],
      jump: loadImg(TAILS + "jumpcarry.png"),
    };
    const SSP = "./Assets/Images/Characters/Survivors/Super Sonic/";
    const superSprites = {
      idle: [loadImg(SSP + "idle1.png"), loadImg(SSP + "idle2.png"), loadImg(SSP + "idle3.png")],
      walk: [loadImg(SSP + "walk1.png"), loadImg(SSP + "walk2.png"), loadImg(SSP + "walk3.png"), loadImg(SSP + "walk4.png"), loadImg(SSP + "walk5.png"), loadImg(SSP + "walk6.png")],
      run: [loadImg(SSP + "run1.png"), loadImg(SSP + "run2.png")],
      runStride: 35,
      jump: [loadImg(SSP + "roll1.png"), loadImg(SSP + "roll2.png"), loadImg(SSP + "roll3.png"), loadImg(SSP + "roll4.png")],
      jumpScale: 0.87,
      stun: loadImg(SSP + "stun.png"),
      stun2: loadImg(SSP + "stun2.png"),
      struggle: [loadImg(SSP + "struggle1.png"), loadImg(SSP + "struggle2.png")],
      cower: loadImg(SSP + "duck2.png"),
      duck: [loadImg(SSP + "duck.png"), loadImg(SSP + "duck2.png"), loadImg(SSP + "duck3.png")],
      dash: loadImg(SSP + "run1.png"),
      skid: [loadImg(SSP + "skid1.png"), loadImg(SSP + "skid2.png")],
      boost: [loadImg(SSP + "boost.png"), loadImg(SSP + "boost2.png")],
      spin: [loadImg(SSP + "spindash1.png"), loadImg(SSP + "spindash2.png"), loadImg(SSP + "spindash3.png")],
      guard: loadImg(SSP + "guard.png"),
      // skip missing transform4
      transform: [loadImg(SSP + "transform.png"), loadImg(SSP + "transform2.png"), loadImg(SSP + "transform3.png"), loadImg(SSP + "transform5.png"), loadImg(SSP + "transform6.png"), loadImg(SSP + "transform7.png"), loadImg(SSP + "transform8.png"), loadImg(SSP + "rollflash.png")],
      fall: loadImg(SSP + "roll1.png"),
    };
    const NYAN = "./Assets/Images/Characters/Survivors/Nyan Cyat/";
    const nyanRun = [1, 2, 3, 4, 5, 6].map((n) => loadImg(NYAN + `main-${n}.png`)); // one loop does it all
    const nyanSprites = {
      idle: nyanRun,
      idleFps: 10,
      walk: nyanRun,
      walkStride: 16,
      run: nyanRun,
      runStride: 12,
      jump: nyanRun[2],
      fall: nyanRun[2],
      stun: nyanRun[0],
      struggle: [nyanRun[0], nyanRun[1]],
      cower: nyanRun[0],
      dash: nyanRun[0],
      trail: loadImg(NYAN + "rainbow.png"), // drawn behind the cat by the engine
    };
    game.rocketImgs = [1, 2, 3, 4].map((n) => loadImg(NYAN + `rocket-${n}.png`));
    const charSprites = { lux: luxSprites, toko: tokoSprites, sonic: sonicSprites, supersonic: superSprites, tails: tailsSprites, nyan: nyanSprites, evil: null }; // evil later
    const NYAN_H = 50; // the cat is wide and low
    function wearChar(id) {
      game.setPlayerSprites(charSprites[id] || luxSprites);
      // true size
      game.player.drawW = 50;
      game.player.drawH = id === 'nyan' ? NYAN_H : (id === 'sonic' || id === 'supersonic' || id === 'tails') ? 64 : 70;
      game.player.maxJumps = id === 'nyan' ? 2 : 1; // nyan double jumps
    }
    game.setPlayerSprites(luxSprites);

    // evil stats
    const EVIL = "./Assets/Images/Characters/Killers/Evil Lux/";
    const bear5Image = loadImg("./Assets/Images/Characters/bear5/Bear5.png");
    const evilSprites = {
      idle: [loadImg(EVIL + "idle1.png"), loadImg(EVIL + "idle2.png")],
      walk: [loadImg(EVIL + "walk1.png"), loadImg(EVIL + "walk2.png")],
      run: [loadImg(EVIL + "run1.png"), loadImg(EVIL + "run2.png")],
      jump: loadImg(EVIL + "run1.png"),
      stun: loadImg(EVIL + "stun.png"),
      pull: loadImg(EVIL + "pull1.png"),
    };
    const evilM1 = [loadImg(EVIL + "m1walk.png"), loadImg(EVIL + "m1walk2.png"), loadImg(EVIL + "m1walk3.png")];
    const bear5Sprites = {
      idle: bear5Image,
      walk: bear5Image,
      run: bear5Image,
      jump: bear5Image,
      fall: bear5Image,
      stun: bear5Image,
      struggle: bear5Image,
      cower: bear5Image,
      dash: bear5Image,
    };
    charSprites.evil = evilSprites;
    charSprites.bear5 = bear5Sprites;
    const evilWindup = [loadImg(EVIL + "m1idle.png"), loadImg(EVIL + "m1idle2.png"), loadImg(EVIL + "m1idle3.png")];
    const evilAct = {
      spike: loadImg(EVIL + "spikeplace1.png"),
      windup: loadImg(EVIL + "m1idle.png"),
      pull: loadImg(EVIL + "pull1.png"),
      pullwindup: loadImg(EVIL + "pullwindup.png"),
      m1: null, // random swing
    };

    game.chatBubbleImg = loadImg("./Assets/Images/UI/chatbub.png");
    game.alertArrow = loadImg("./Assets/Images/UI/CharacterSelect/left.png"); // ping arrow
    game.spikeImg = loadImg("./Assets/Images/Characters/Killers/Evil Lux/spikes.png");
    game.bombImg = loadImg(TAILS + "bomb.png");
    game.boomImg = loadImg("./Assets/Images/Objects/explosion.gif");

    // big map
    const LV_SPAWN = { x: 100, y: 880 }; // west pillar-side ground
    const LV_EAST = { x: 2575, y: 1787 }; // far east floor
    game.loadLevel(LEVEL_ROUGH_DRAFT, loadImg('./Assets/Images/Levels/RoughDraft.png'), { background: '#3b2a2a', backdrop: loadImg('./Assets/Images/Levels/RoughDraft_bg.jpg') }); // rough draft
    game.mapBg.inter = '#bfe9ff';
    game.spawn = { x: LV_SPAWN.x, y: LV_SPAWN.y };
    game.evilSpawn = { x: LV_EAST.x, y: LV_EAST.y - 120 };
    // spring pads
    const SPR = './Assets/Images/Objects/';
    game.addSpring(927, 652, 1200, loadImg(SPR + 'spring_orange.png'));
    game.addSpring(1245, 480, 1200, loadImg(SPR + 'spring_orange.png'));
    game.addSpring(18, 1244, 1200, loadImg(SPR + 'spring_orange.png'));
    game.addSpring(2506, 1545, 1500, loadImg(SPR + 'spring_red.png'));
    game.addSpring(2473, 1036, 950, loadImg(SPR + 'spring_yellow.png'));
    game.addSpring(1777, 1267, 1500, loadImg(SPR + 'spring_red.png'));
    game.addSpring(2633, 887, 950, loadImg(SPR + 'spring_yellow.png'));
    game.addSpring(1560, 757, 1500, loadImg(SPR + 'spring_red.png'));
    game.addSpring(305, 1089, 1500, loadImg(SPR + 'spring_red.png'));
    game.respawn();

    // rest island
    game.addPlatform(6000, 380, 800, 80, '#8ac926', 'inter'); // island floor
    game.addPlatform(5960, 100, 40, 360, '#c084fc', 'inter'); // left wall
    game.addPlatform(6800, 100, 40, 360, '#c084fc', 'inter'); // right wall
    game.addPlatform(6200, 280, 140, 22, '#ff9f1c', 'inter');
    game.addPlatform(6480, 200, 140, 22, '#ff9f1c', 'inter');
    game.addPlatform(6340, 120, 120, 22, '#ff9f1c', 'inter');
    // lobby springs
    game.addSpring(6080, 354, 1500, loadImg(SPR + 'spring_red.png'), 'inter');
    game.addSpring(6232, 254, 1200, loadImg(SPR + 'spring_orange.png'), 'inter');
    game.addSpring(6620, 354, 950, loadImg(SPR + 'spring_yellow.png'), 'inter');

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
          sayStatus(`mods only!! click 'show my id' below, paste the formbar id in admins.txt!!`, 5);
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
    const flyBtn = document.getElementById('flyBtn');
    const noclipBtn = document.getElementById('noclipBtn');
    const hpBox = document.getElementById('hpBox');
    const devBox = document.getElementById('devBox');
    flyBtn.addEventListener('click', () => {
      if (!net.mod) return;
      game.fly = !game.fly;
      flyBtn.textContent = game.fly ? 'fly: on' : 'fly: off';
    });
    noclipBtn.addEventListener('click', () => {
      if (!net.mod) return;
      game.noclip = !game.noclip;
      noclipBtn.textContent = game.noclip ? 'noclip: on' : 'noclip: off';
    });
    document.getElementById('hpMeBtn').addEventListener('click', () => mod('sethealth', { target: 'me', hp: hpBox.value }));
    document.getElementById('hpAllBtn').addEventListener('click', () => mod('sethealth', { target: 'all', hp: hpBox.value }));
    document.getElementById('devOnBtn').addEventListener('click', () => mod('makedev', { char: devBox.value.trim().toLowerCase() }));
    document.getElementById('devOffBtn').addEventListener('click', () => mod('unmakedev', { char: devBox.value.trim().toLowerCase() }));
    const announceBox = document.getElementById('announceBox');
    const announceEl = document.getElementById('announce');
    document.getElementById('announceBtn').addEventListener('click', () => {
      mod('announce', { text: announceBox.value.trim().slice(0, 120) });
      announceBox.value = '';
    });
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
        `mus: map=${beds.map.volume.toFixed(2)} wait=${beds.wait.volume.toFixed(2)} inter=${beds.inter.volume.toFixed(2)} lms=${beds.lms.volume.toFixed(2)} lmslux=${beds.lmslux.volume.toFixed(2)} lmssonic=${beds.lmssonic.volume.toFixed(2)} lmstails=${beds.lmstails.volume.toFixed(2)} lmsnyan=${beds.lmsnyan.volume.toFixed(2)} hero=${beds.hero.volume.toFixed(2)} chase=${beds.chase.volume.toFixed(2)} terror=${beds.terror.volume.toFixed(2)} cs=${beds.charselect.volume.toFixed(2)}`;
    }, 100);

    // needs server
    // die to spectate
    const net = { id: null, timer: null, round: null, phase: null, ping: null, wasEvil: false, retry: null, mod: false, everOnline: false, wasElect: false, fail: 0, killerPick: 'evil' };
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
      if (title) title.addEventListener('click', async () => {
        if (titleClicked) return;
        titleClicked = true;
        const me = await loadMe();
        if (!me.logged_in) { location.href = '/login'; return; } // formbar login
        if (me.needs_pin && !me.has_pin) {
          showPinPrompt();
          sayStatus('enter your digipog pin, then click again!!', 8);
          titleClicked = false;
          return;
        }
        net.titleT0 = Date.now(); // hold loading
        const label = title.querySelector('span');
        if (label) label.innerHTML = 'LOADING!!';
        joinOnline();
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
      try { netError('uh oh!! a request failed, refresh if stuck!!', 10); } catch (_) { /* too broken!! */ }
    });
    // account shop
    const pinRow = document.getElementById('pinRow');
    const pinBanner = document.getElementById('pinBanner');
    const pinBox = document.getElementById('pinBox');
    const malicePanel = document.getElementById('malicePanel');
    const maliceNum = document.getElementById('maliceNum');
    const buyMaliceBtn = document.getElementById('buyMaliceBtn');
    async function loadMe() {
      net.me = await (await fetch('/api/me')).json();
      return net.me;
    }
    function showPinPrompt() {
      pinRow.style.display = 'flex';
      pinBanner.style.display = 'flex';
      pinBox.focus();
    }
    async function savePin() {
      const res = await fetch('/api/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: pinBox.value.trim() }),
      });
      const out = await res.json();
      if (out.ok) {
        pinBox.value = '';
        pinRow.style.display = 'none';
        pinBanner.style.display = 'none';
        sayStatus('pin saved!! click the title to play!!', 6);
        if (net.id) { net.id = null; joinOnline(); } // retry join
      } else {
        sayStatus(out.reason || 'pin not saved!!', 5);
      }
    }
    document.getElementById('pinBtn').addEventListener('click', savePin);
    pinBox.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      pinBox.blur();
      savePin();
    });
    buyMaliceBtn.addEventListener('click', async () => {
      if (!net.id) return;
      buyMaliceBtn.disabled = true;
      let amount = undefined;
      if (net.mod) {
        const raw = window.prompt('free dev malice amount?', '1000');
        if (raw === null) {
          buyMaliceBtn.disabled = false;
          return;
        }
        const parsed = Number(raw);
        amount = Number.isFinite(parsed) && parsed > 0 ? parsed : 1000;
      }
      const res = await fetch('/api/malice/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: net.id, amount }),
      });
      const out = await res.json();
      sayStatus(out.ok ? `malice updated!! you have ${out.malice}!!` : (out.reason || 'could not buy!!'), 5);
      buyMaliceBtn.disabled = false;
    });
    const midBox = document.getElementById('midBox');
    let midShown = false;
    midBox.addEventListener('click', () => {
      midShown = !midShown;
      midBox.textContent = midShown ? (net.fid || '?') : 'show my id';
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
    const posdbg = document.getElementById('posdbg');
    // pos overlay
    window.addEventListener('keydown', (e) => {
      if (e.key === 'F11') {
        e.preventDefault();
        posdbg.style.display = posdbg.style.display === 'none' ? 'block' : 'none';
      }
    });
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
    // dev roster
    let devChars = {};
    // Nyan Cyat is a dev-only survivor
    const KILLER_ROSTER = [
      { id: 'evil', name: 'EVIL LUX' },
      { id: 'bear5', name: 'BEAR5', nameImg: CS + 'bear5name.jpeg', dev: true },
    ];
    function visRoster() {
      const list = ROSTER.filter((c) => (net.mod || !devChars[c.id]));
      return list.length ? list : ROSTER.slice(0, 1);
    }
    function visKillerRoster() {
      return KILLER_ROSTER.filter((c) => !c.dev || net.mod);
    }
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
      if (evil) return charId === 'bear5' ? bear5Image.src : EVIL_RUN[csFrame % EVIL_RUN.length];
      if (charId === 'supersonic') charId = 'sonic'; // disguised in select
      const set = charSprites[charId];
      let run = set && set.run && set.run[csFrame % set.run.length];
      if (!run || !run.complete || !run.naturalWidth) {
        run = set && set.idle && set.idle[0];
      }
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
      if (kp) fillSlot(csSlotEls.killer, 'killer', kp.killer_char || 'evil', kp.name);
      else fillSlot(csSlotEls.killer, 'killer', null);
    }
    function renderSelect() {
      // pick bar
      const killerPicker = !!net.amKillerElect;
      const vis = killerPicker ? visKillerRoster() : visRoster();
      selIdx = ((selIdx % vis.length) + vis.length) % vis.length;
      const cur = vis[selIdx];
      const csNameText = document.getElementById('csNameText');
      if (killerPicker && !cur.nameImg) {
        csName.style.display = 'none';
        csNameText.style.display = '';
        csNameText.textContent = cur.name;
      } else {
        csName.style.display = '';
        csNameText.style.display = 'none';
        if (csName.dataset.char !== cur.id) {
          csName.dataset.char = cur.id;
          csName.src = cur.nameImg;
          csName.alt = cur.name;
        }
      }
      const evilLocked = !!(game.player && game.player.evil) || net.phase === 'round';
      document.getElementById('csLeft').style.display = evilLocked ? 'none' : '';
      document.getElementById('csRight').style.display = evilLocked ? 'none' : '';
      csName.style.visibility = evilLocked ? 'hidden' : '';
      csNameText.style.visibility = evilLocked ? 'hidden' : '';
    }
    function browseSelect(dir) {
      const vis = net.amKillerElect ? visKillerRoster() : visRoster();
      selIdx = (selIdx + dir + vis.length) % vis.length;
      renderSelect();
      fileSfx(SFX + 'Character_advance.wav', {});
    }
    function lockPick() {
      if (net.phase !== 'select') return; // select only
      if (game.player && game.player.evil) return; // killers skip
      const killerPicker = !!net.amKillerElect;
      const vis = killerPicker ? visKillerRoster() : visRoster();
      const cur = vis[((selIdx % vis.length) + vis.length) % vis.length];
      fetch('/api/pick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: net.id, char: cur.id, role: killerPicker ? 'killer' : 'survivor' }),
      }).then((r) => r.json()).then((d) => {
        if (d && d.ok) {
          if (killerPicker) net.killerPick = cur.id;
          else net.pick = cur.id;
          fileSfx(SFX + 'character_selection.wav', {});
          if (!killerPicker && !game.player.evil) wearChar(cur.id === 'supersonic' && !SS.transformed ? 'sonic' : cur.id);
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
      csFrame = csFrame + 1; // full run cycles
      const paint = (el) => {
        if (!el || !el._runImg) return;
        const src = runFrameFor(el._runChar, el === csSlotEls.killer);
        if (src) {
          if (el._runImg.src !== src) el._runImg.src = src;
          el._runImg.style.display = '';
        } else {
          // fallback: colored placeholder
          el._runImg.style.display = 'none';
          if (!el._placeholder) {
            el._placeholder = document.createElement('div');
            el._placeholder.style.cssText = 'width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-weight:bold;color:#fff;font-size:24px;background:#444';
            el._placeholder.textContent = (el._runChar || '?')[0].toUpperCase();
            el.insertBefore(el._placeholder, el._runImg);
          }
          el._placeholder.style.display = 'flex';
        }
      };
      paint(csSlotEls.killer);
      for (const el of csSlotEls.surv) paint(el);
    }, 180);
    // chat box
    const chatBox = document.getElementById('chatBox');
    const openFromBox = (e) => {
      if (selectOpen) {
        if (e.type === 'focus') chatBox.blur();
        return;
      }
      if (chatBox.disabled) {
        e.preventDefault();
        chatBox.blur();
        sayStatus('muted!!', 3);
        fileSfx(SFX + 'denied.wav', {});
        return;
      }
      game.input.left = game.input.right = game.input.jump = false; // stop moving
      if (net.mod) {
        closeQuick();
      } else {
        e.preventDefault();
        chatBox.blur();
        openQuick();
      }
    };
    chatBox.addEventListener('click', openFromBox);
    chatBox.addEventListener('focus', openFromBox);
    // changelog
    const logBtn = document.getElementById('logBtn');
    const logModal = document.getElementById('logModal');
    logBtn.addEventListener('click', () => {
      if (logModal.style.display !== 'none') {
        logModal.style.display = 'none';
        return;
      }
      fetch('./changelog.md').then((r) => r.text()).then((t) => {
        logModal.textContent = t;
        logModal.style.display = 'block';
      }).catch(() => {});
    });
    // quick shouts
    const QUICK = [
      'OK!', 'what a save!', 'run away!!!', 'help me!!',
      'thanks!!', 'sorry!!', 'nice!!', 'wow!!',
      'good luck!!', 'killer here!!', 'split up!!', 'gg!!',
    ];
    const QUICK_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'q', 'w'];
    let quickOpen = false;
    const quickPanel = document.getElementById('quickPanel');
    QUICK.forEach((text, i) => {
      const b = document.createElement('button');
      b.className = 'quickBtn';
      b.textContent = `${QUICK_KEYS[i]} ${text}`;
      b.addEventListener('click', () => { sendChat(text); closeQuick(); });
      quickPanel.appendChild(b);
    });
    function openQuick() { quickOpen = true; quickPanel.style.display = 'grid'; }
    function closeQuick() { quickOpen = false; quickPanel.style.display = 'none'; }
    function sendChat(text) {
      if (!text) return;
      if (net.mutedUntil && Date.now() < net.mutedUntil) {
        sayStatus('muted!!', 3);
        fileSfx(SFX + 'denied.wav', {});
        return;
      }
      if (!net.id) {
        sayStatus('not connected!!', 2);
        fileSfx(SFX + 'denied.wav', {});
        return;
      }
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: net.id, text }),
      }).then((r) => r.json()).then((d) => {
        if (d && d.ok === false && d.reason === 'blocked') {
          sayStatus('yikes!! blocked!!', 2);
          fileSfx(SFX + 'denied.wav', {});
        } else if (d && d.ok === false && d.reason === 'muted') {
          applyMute(d.left || 600);
        }
      }).catch(() => {});
    }
    const seenChat = new Set();
    let muteTimer = null;
    function applyMute(secs) {
      // mute lock
      chatBox.disabled = true;
      net.mutedUntil = Date.now() + secs * 1000;
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
          net.mutedUntil = 0;
          chatBox.placeholder = net.mod ? 'type a message!! (enter)' : 'say something!! (enter)';
        } else show();
      }, 5000);
    }
    window.addEventListener('keydown', (e) => {
      if (selectOpen) return; // select eats keys
      const typing = document.activeElement === chatBox || document.activeElement === pinBox;
      if (quickOpen) {
        if (e.key === 'Escape' || e.key === 'Enter') {
          e.preventDefault();
          closeQuick();
        } else if (!typing && !e.repeat) {
          const i = QUICK_KEYS.indexOf(e.key.toLowerCase());
          if (i >= 0 && i < QUICK.length) {
            e.preventDefault();
            sendChat(QUICK[i]);
            closeQuick();
          }
        }
        return;
      }
      if (e.key === 'Enter' && !typing) {
        e.preventDefault();
        game.input.left = game.input.right = game.input.jump = false; // stop moving
        if (net.mod) chatBox.focus();
        else openQuick();
      }
    });
    chatBox.addEventListener('keydown', (e) => {
      if (!net.mod || selectOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        chatBox.blur();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        const text = chatBox.value.trim();
        if (text) sendChat(text);
        chatBox.value = '';
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
    function loopTrack(src, looped = true) {
      const a = new Audio(src);
      a.loop = looped;
      a.volume = 0;
      // loop backup
      if (looped) a.addEventListener('ended', () => { a.currentTime = 0; a.play().catch(() => {}); });
      return a;
    }
    const MUS = './Assets/Musics/';
    const HERO_LYRICS = [
      [21, "You can feel me"], [24, "You can see me clear"],
      [26, "I don't whisper, yes"], [28, "I shout!"], [29, "SHOUT!"],
      [32, "And in my dust"], [34, "I leave you doubt"],
      [37, "And you know me"], [40, "Yes you do!"],
      [42, "And you can hear me coming light years away..."],
      [47, "Faster than light"], [48, "In a world you wonder..."],
      [53, "You can feel"], [54, "A super sonic power over you"],
      [57, "Yes, I'm real"], [59, "I will speed my way right through you!"],
      [62, "Here I am!"], [64, "I'm the super sonic power that you fear"],
      [68, "Yes I am!"], [70, "I'm the super sonic hero that you know"],
      [74, "Ohhohh ohhh ohhhhh"], [80, "Super sonic hero!"],
      [89, "You know me, I'm a super sonic hero!"],
      [99, "I keep moving"], [101, "You know I'll never stop"],
      [104, "Blink once and I'm gone"], [108, "GONE!"],
      [109, "Through the dark"], [110, "Through the light"],
      [112, "Through the night you know..."],
      [115, "I keep rising"], [117, "Always striking"],
      [120, "And you can hear me coming light years away"],
      [124, "Faster than light"], [127, "In a world you wonder"],
      [130, "You can feel"], [132, "A super sonic power over you"],
      [135, "Yes, I'm real"], [138, "I will speed my way right through you!"],
      [140, "Here I am!"], [142, "I'm the super sonic power that you fear"],
      [146, "Yes I am!"], [148, "I'm the super sonic force you can't outrun!"],
      [152, "Ohhohh ohhh ohhhhh"], [158, "Super sonic hero!"],
      [166, "Super sonic, super sonic hero!"],
      [197, "I am the super sonic hero that you know"],
    ];
    const lyricBar = document.getElementById('lyricBar');
    const mapLoad = document.getElementById('mapLoad');
    const introWrap = document.getElementById('introWrap');
    const introVid = document.getElementById('introVid');
    const bearIntro = document.getElementById('bearIntro');
    if (introVid) {
      const introDone = () => {
        if (net.id) {
          fetch('/api/intro', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: net.id }),
          }).catch(() => {});
        }
      };
      introVid.addEventListener('ended', () => {
        introWrap.style.display = 'none';
        introDone();
      });
      introWrap.addEventListener('click', () => {
        introWrap.style.display = 'none';
        try { introVid.pause(); } catch (_) { /* hush!! */ }
        introDone();
      });
    }
    const MUSIC_VOLUME_SCALE = 0.68;
    const VOICE_VOLUME_SCALE = 1.35;
    const beds = {
      map: loopTrack(MUS + 'map_musicV2.mp3'),
      wait: loopTrack(MUS + 'waiting4players.mp3'),
      inter: loopTrack(MUS + 'intermission.mp3'),
      lms: loopTrack(MUS + 'last_man_standing.mp3', false),
      lmslux: loopTrack(MUS + 'lux_lms.mp3', false), // lux anthem
      lmssonic: loopTrack(MUS + 'sonic_lms.mp3', false), // sonic anthem
      lmstails: loopTrack(MUS + 'tails_lms.mp3', false), // tails anthem
      lmsnyan: loopTrack(MUS + 'nyanlms.mp3', false), // nyan anthem
      hero: loopTrack(MUS + 'supersonichero.mp3'), // super sonic theme
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
    let lmsEnded = false;
    for (const key of ['lms', 'lmslux', 'lmssonic', 'lmstails', 'lmsnyan']) {
      beds[key].addEventListener('ended', () => {
        if (lmsTrack === key) lmsEnded = true;
      });
    }
    const soloOrder = ['map', 'wait', 'inter', 'lms', 'lmslux', 'lmssonic', 'lmstails', 'lmsnyan', 'hero', 'chase', 'terror', 'charselect'];
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
    function voiceSfx(src, rate = 1) {
      if (!audioStarted || titleLive) return;
      try {
        const a = new Audio(src);
        a.playbackRate = rate;
        a.volume = 0.5 * VOICE_VOLUME_SCALE;
        a.play().catch(() => {});
      } catch (e) { /* silent!! */ }
    }
    function spawnBearHitFx(x, y) {
      const blues = ['#249bff', '#53bdff', '#1177dc'];
      for (let i = 0; i < 18; i++) {
        game.fx.push({
          kind: 'splat', x, y,
          vx: (Math.random() - 0.5) * 460, vy: (Math.random() - 0.75) * 360,
          age: 0, life: 0.45 + Math.random() * 0.35, size: 5 + Math.random() * 8,
          grow: 2, drag: 2.2, grav: 430, color: blues[Math.floor(Math.random() * blues.length)],
          seed: Math.random() * 6.2832, spin: (Math.random() - 0.5) * 2,
        });
      }
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
    const flyLoop = loopSfx(SFX + 'tailsflightloop.mp3', 0.35);
    // evil lux talks
    const VL = './Assets/Sounds/Evil Lux Voicelines/';
    const vpick = (a) => a[Math.floor(Math.random() * a.length)];
    const VL_KILL = [VL + 'elux_kill.mp3', VL + 'elux_kill2.mp3', VL + 'elux_kill3.mp3', VL + 'elux_kill4.mp3'];
    const VL_OPEN = [VL + 'elux_opener.mp3', VL + 'elux_opener2.mp3'];
    const VL_PULL = [VL + 'elux_pull.mp3', VL + 'elux_pull2.mp3', VL + 'elux_pull4.mp3', VL + 'elux_pull5.mp3', VL + 'elux_pull7.mp3'];
    const VL_RUSH = [VL + 'elux_rush.mp3', VL + 'elux_rush3.mp3', VL + 'elux_rush5.mp3'];
    const VL_SNEAK = [VL + 'elux_sneak.mp3', VL + 'elux_sneak2.mp3', VL + 'elux_sneak3.mp3'];
    const VL_STUN = [VL + 'elux_stunned.mp3', VL + 'elux_stunned2.mp3', VL + 'elux_stunned3.mp3', VL + 'elux_stunned4.mp3', VL + 'elux_stunned5.mp3', VL + 'elux_stunned6.mp3'];
    const sneakLoop = loopSfx(VL + 'elux_sneak_loop.mp3', 0.45);
    // evil kit
    // weak pull
    // wound ticking ropes
    const PULL_RANGE = 450;
    // lms buffs
    const LMS_HP = 150; // more health
    const LMS_CD = 0.6; // faster cds
    const K = {
      spikeCD: 0, sneakCD: 0, pullCD: 0, rushCD: 0, m1CD: 0, m1ok: true,
      invisUntil: 0, penaltyUntil: 0, pullUntil: 0, pullHit: false, pullWindup: 0,
      windupUntil: 0, chargeUntil: 0, charging: false,
    };
    const trippedIds = new Set(); // used spikes
    const bombPos = {}; // last seen spots
    const abilBar = document.getElementById('abilities');
    // party list
    const partyList = document.getElementById('partyList');
    const CHAR_ICON = {
      lux: './Assets/Images/UI/luxicon.png',
      toko: './Assets/Images/UI/tokoicon.png',
      sonic: './Assets/Images/UI/sonicicon.png',
      supersonic: './Assets/Images/UI/supersonicicon.jpg',
      tails: './Assets/Images/UI/tailsicon.png',
      nyan: './Assets/Images/UI/nyanicon.png',
    };
    function renderParty(self, p, others, killerId) {
      partyList.innerHTML = '';
      // killer spot
      let kx = null, ky = null;
      if (p.evil) {
        kx = p.pos.x + p.w / 2; ky = p.pos.y + p.h / 2;
      } else {
        const ek = game.remotes.find((r) => r.id === killerId && r.alive && r.hp > 0);
        if (ek && !ek.invis) { kx = ek.pos.x + ek.w / 2; ky = ek.pos.y + ek.h / 2; }
      }
      const chasedAt = (x, y) => kx !== null && Math.hypot(kx - x, ky - y) < 260;
      const add = (name, char, hp, maxhp, alive, me, evil, x, y) => {
        const row = document.createElement('div');
        row.className = 'pRow' + (alive ? '' : ' dead') + (me ? ' me' : '') + (!evil && alive && chasedAt(x, y) ? ' chased' : '') + (char === 'supersonic' ? ' super' : '');
        const img = document.createElement('img');
        img.src = evil ? EVIL + 'idle1.png' : (CHAR_ICON[char] || CHAR_ICON.lux);
        img.alt = '';
        const col = document.createElement('div');
        col.className = 'pCol';
        const tx = document.createElement('span');
        tx.textContent = `${name} ${Math.max(0, Math.ceil(hp || 0))}`;
        const bar = document.createElement('div');
        bar.className = 'pBar';
        const fill = document.createElement('div');
        fill.className = 'pFill';
        const frac = Math.max(0, Math.min(1, (hp || 0) / (maxhp || 100)));
        fill.style.width = `${Math.round(frac * 100)}%`;
        bar.appendChild(fill);
        col.appendChild(tx);
        col.appendChild(bar);
        row.appendChild(img);
        row.appendChild(col);
        partyList.appendChild(row);
      };
      if (self && !p.evil) add(self.name, self.char === 'supersonic' && !SS.transformed ? 'sonic' : self.char, p.hp, p.maxHp, p.alive !== false, true, false, p.pos.x + p.w / 2, p.pos.y + p.h / 2);
      for (const [id, d] of Object.entries(others || {})) {
        if (!d || id === net.id || id === killerId) continue;
        const r = game.remotes.find((r) => r.id === id);
        const rx = r ? r.pos.x + r.w / 2 : 1e9, ry = r ? r.pos.y + r.h / 2 : 1e9;
        add(d.name, d.char === 'supersonic' && !d.super ? 'sonic' : d.char, d.hp, d.maxhp || 100, (d.alive ?? d.hp > 0), false, false, rx, ry);
      }
    }
    // spike pips
    const spikeBar = document.getElementById('spikeBar');
    const spikePips = document.getElementById('spikePips');
    const bombBar = document.getElementById('bombBar');
    const bombPips = document.getElementById('bombPips');
    const PIP_FULL = './Assets/Images/UI/spikepip_full.png';
    const PIP_EMPTY = './Assets/Images/UI/spikepip_empty.png';
    for (let i = 0; i < 5; i++) {
      const im = document.createElement('img');
      im.src = PIP_FULL;
      im.alt = '';
      spikePips.appendChild(im);
      const bm = document.createElement('img');
      bm.src = PIP_FULL;
      bm.alt = '';
      bombPips.appendChild(bm);
    }
    // blank slots
    const AB = './Assets/Images/UI/Abillities/';
    const ABIL_ICONS = {
      hit: null,
      blank: AB + 'ability_blank.png',
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
        if (net.killerPick === 'bear5') {
          abilDefs = [{ key: 'Z', name: 'M1', icon: null, cd: () => 0 }];
        } else {
          abilDefs = [
            { key: 'X', name: 'SPIKES', icon: ABIL_ICONS.spikes, cd: () => K.spikeCD },
            { key: 'C', name: p.invis ? 'CANCEL' : 'SNEAK', icon: ABIL_ICONS.sneak, cd: () => K.sneakCD },
            { key: 'V', name: 'PULL', icon: ABIL_ICONS.pull, cd: () => K.pullCD },
            { key: 'B', name: 'RUSH', icon: ABIL_ICONS.rush, cd: () => K.rushCD },
          ];
          if (isNyan()) abilDefs.push({ key: 'N', name: 'ROCKET', icon: null, cd: () => NY.rocketCD });
        }
      } else if (isNyan()) {
        abilDefs = [
          { key: 'Z', name: 'ROCKET', icon: null, cd: () => NY.rocketCD },
          { key: 'X', name: 'RAINBOW DASH', icon: ABIL_ICONS.dash, cd: () => NY.dashCD },
        ];
      } else if (isToko()) {
        abilDefs = [
          { key: 'Z', name: 'ROUNDHOUSE', icon: ABIL_ICONS.roundhouse, cd: () => T.kickCD },
          { key: 'X', name: 'JAB', icon: ABIL_ICONS.jab, cd: () => T.jabCD },
        ];
      } else if (isSonic()) {
        abilDefs = [
          { key: 'Z', name: 'PEELOUT', icon: null, cd: () => SN.peelCD },
          { key: 'X', name: 'SPINDASH', icon: null, cd: () => SN.spinCD },
        ];
      } else if (isSuper()) {
        // pre-glow, only one move
        abilDefs = SS.transformed ? [
          { key: 'Z', name: 'BOOST', icon: ABIL_ICONS.rush, cd: () => SS.boostCD },
          { key: 'X', name: 'BLOCK', icon: ABIL_ICONS.cower, cd: () => SS.blockCD },
          { key: 'C', name: 'SPINDASH', icon: ABIL_ICONS.roundhouse, cd: () => SS.spinCD },
        ] : [
          { key: 'Z', name: 'TRANSFORM', icon: null, cd: () => 0 },
        ];
      } else if (isTails()) {
        abilDefs = [
          { key: 'Z', name: 'FLY', icon: null, cd: () => TW.flyCD },
          { key: 'X', name: 'BOMB', icon: null, cd: () => TW.bombCD },
          { key: 'C', name: 'WHIP', icon: null, cd: () => TW.whipCD },
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
        const img = document.createElement('img');
        img.src = d.icon || ABIL_ICONS.blank;
        img.alt = d.name;
        slot.appendChild(img);
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
        const bear = net.killerPick === 'bear5';
        p.char = bear ? 'bear5' : 'evil';
        game.setPlayerSprites(bear ? bear5Sprites : evilSprites);
        p.drawW = bear ? 76 : 50; p.drawH = bear ? 94 : 70; // full size
        p.maxHp = bear ? 999 : 250; p.hp = bear ? 999 : 250;
        p.maxJumps = 2;
        game.moveSpeed = bear ? 820 : 300; // evil speed
        game.fly = bear;
        game.noclip = bear;
        game.spawn = { x: game.evilSpawn.x, y: game.evilSpawn.y }; // far spawn
      } else {
        p.char = net.pick || 'lux';
        wearChar(net.pick === 'supersonic' ? 'sonic' : net.pick); // plain sonic until glow
        p.maxHp = survHp(); p.hp = Math.min(p.hp, p.maxHp);
        p.maxJumps = net.pick === 'nyan' ? 2 : 1;
        game.moveSpeed = (net.pick === 'sonic' || net.pick === 'supersonic') ? 270 : net.pick === 'nyan' ? 300 : 240;
        game.fly = false; game.noclip = false;
        game.spawn = { x: 100, y: 880 };
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
      const role = p.evil ? (net.killerPick === 'bear5' ? 'bear5' : 'evil') : (isNyan() ? 'nyan' : isToko() ? 'toko' : (isSonic() ? 'sonic' : (isSuper() ? (SS.transformed ? 'super' : 'super0') : (isTails() ? 'tails' : 'lux'))));
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
      // bomb stash
      const showBombs = !!(!p.evil && isTails() && p.alive !== false && net.phase === 'round');
      bombBar.style.display = showBombs ? 'flex' : 'none';
      if (showBombs) {
        const left = Math.max(0, Math.min(5, TW.bombsLeft));
        [...bombPips.children].forEach((el, i) => {
          const src = i < left ? PIP_FULL : PIP_EMPTY;
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
        if (char === 'bear5') return bear5Image;
        if (pose === 'swing') return evilM1[0];
        if (pose === 'spike') return evilAct.spike;
      } else if (char === 'toko') {
        if (pose === 'kick') return tokoSprites.kick[0];
        if (pose === 'jab') return tokoSprites.jab[0];
      } else if (char === 'tails') {
        if (pose === 'whip') return tailsSprites.whip[0];
        if (pose === 'throw') return tailsSprites.throw2;
      } else if (char === 'supersonic') {
        if (pose === 'transform') return superSprites.transform[0];
        if (pose === 'boost') return superSprites.boost[0];
        if (pose === 'block') return superSprites.guard;
      } else {
        if (pose === 'dash') return luxDash;
      }
      return null;
    }
    // clear evil
    function clearEvil(p) {
      p.invis = false; p.rooted = false; p.chargeDir = 0; p.chargeSpeed = 0;
      p.cowerT = 0; p.cowering = false; p.stunT = 0;
      p.peeling = false; p.spinning = false; p.spinWindup = false;
      p.lift = false; p.dashing = false; p.pull = false; p.pullwindup = false;
      p.windupUntil = false; p.kickUntil = false; p.jabUntil = false;
      p.whipUntil = false; p.throwUntil = false;
      p.fatigue = 0; p.actionT = 0; p._wore = null;
      game.moveSpeed = 240; // base speed
      K.charging = false; K.pullUntil = 0; K.pullWindup = 0; K.windupUntil = 0;
      K.spikeCD = 0; K.sneakCD = 0; K.pullCD = 0; K.rushCD = 0; K.m1CD = 0;
      K.penaltyUntil = 0; K.invisUntil = 0; K.pullHit = false;
      S.windupUntil = 0; S.dashing = false;
      S.dashCD = 0; S.cowerCD = 0; S.dashUntil = 0; S.dashHit = false;
      S.countered = false; S.wasCowering = false; S.dashTouching = false;
      T.kickUntil = 0; T.jabUntil = 0;
      T.kickCD = 0; T.jabCD = 0; T.kickHit = false; T.jabHit = false;
      SN.windupUntil = 0; SN.peelUntil = 0; SN.peeling = false;
      SN.spinWindup = 0; SN.spinUntil = 0; SN.spinning = false;
      SN.peelCD = 0; SN.spinCD = 0; SN.spinHits = 0; SN.spinTouching = false;
      SN.spinHitCD = 0; SN.dir = 0;
      SS.transformed = false; SS.formUntil = 0;
      SS.boostCD = 0; SS.boostWindup = 0; SS.boostUntil = 0; SS.boosting = false;
      SS.blockCD = 0; SS.wasBlocking = false;
      SS.spinCD = 0; SS.spinWindup = 0; SS.spinUntil = 0; SS.spinning = false;
      p.superFly = false;
      SS.formUntil = 0; SS.focusUntil = 0;
      p.tremble = false; p.rainbow = false; p.whiteFlash = false; p.pulseWhite = false;
      sneakLoop.stop();
      TW.flying = false; TW.flyLeft = 0; TW.whipUntil = 0; TW.holding = false; TW.whipHit = false;
      p.holdingBomb = false;
      p.sneakColor = null;
      TW.bombCD = 0; TW.flyCD = 0; TW.whipCD = 0; TW.throwUntil = 0; TW.bombsLeft = 5; flyLoop.stop();
      NY.rocketCD = 0; NY.dashCD = 0; NY.dashUntil = 0; NY.dashing = false; NY.dashHit = false;
      p.taxiFly = false;
      p.rooted = false;
      p.actionImg = null;
      game.pullSrc = null; game.peelSrc = null; game.liftSrc = null;
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
    game.onUpdate = () => {
      const player = game.player;
      const survivors = game.remotes.filter((b) => !b.evil && b.alive && b.hp > 0);
      if (player && !player.evil && player.alive !== false) survivors.push(player);
      const bears = game.remotes.filter((b) => b.evil && b.char === 'bear5');
      if (player && player.evil && player.char === 'bear5') bears.push(player);
      const now = performance.now();
      for (const bear of bears) {
        const vx = bear.vel?.x || 0;
        let vy = bear.vel?.y || 0;
        if (bear !== player) {
          const elapsed = Math.max(0.001, (now - (bear._bearMotionAt || now)) / 1000);
          vy = ((bear.pos.y || 0) - (bear._bearMotionY ?? bear.pos.y)) / elapsed;
          bear._bearMotionAt = now;
          bear._bearMotionY = bear.pos.y;
        }
        const speed = Math.hypot(vx, vy);
        const moving = Math.min(1, speed / 1050);
        const pulse = Math.sin((bear.animTime || 0) * 22);
        const rising = Math.min(1, Math.max(0, -vy / 1300));
        const falling = Math.min(1, Math.max(0, vy / 1300));
        bear.bearDrawScaleX = 1 + moving * (0.22 + pulse * 0.14) + falling * 0.16;
        bear.bearDrawScaleY = 1 - moving * (0.12 + pulse * 0.08) + rising * 0.22 - falling * 0.1;
        bear.bearDrawAngle = Math.max(-0.22, Math.min(0.22, vx / 1500 * 0.18 - vy / 2000 * 0.12));
        bear.bearFold = 0;
        if ((bear._bearFoldUntil || 0) > Date.now()) {
          let target = null, nearest = Infinity;
          for (const survivor of survivors) {
            const dx = survivor.pos.x + survivor.w / 2 - (bear.pos.x + bear.w / 2);
            const dy = survivor.pos.y + survivor.h / 2 - (bear.pos.y + bear.h / 2);
            const distance = Math.hypot(dx, dy);
            if (distance < nearest) { nearest = distance; target = { dx, dy }; }
          }
          if (target) {
            const progress = 1 - (bear._bearFoldUntil - Date.now()) / (bear._bearFoldDuration || 440);
            bear.bearFold = Math.sin(Math.max(0, Math.min(1, progress)) * Math.PI);
            bear.bearFoldX = Math.sign(target.dx || bear.facing || 1) * (bear.facing || 1);
            bear.bearFoldY = Math.max(-1, Math.min(1, target.dy / 120));
            bear.bearFoldReach = Math.min(1, nearest / 150);
          }
        }
        if (bear === player && game.fly && speed > 250 && now - (bear._bearTrailAt || 0) > 60) {
          const img = game._spriteFor(bear);
          if (img && img.complete && img.naturalWidth) {
            const frame = game.frameSize(bear, img);
            game.afterimages.push({
              x: bear.pos.x, y: bear.pos.y, w: bear.w, h: bear.h,
              drawW: frame.dw * (bear.bearDrawScaleX || 1), drawH: frame.dh * (bear.bearDrawScaleY || 1),
              facing: bear.facing, img, age: 0,
            });
            bear._bearTrailAt = now;
          }
        }
      }
    };
    const isToko = () => effChar() === 'toko';
    const isSonic = () => effChar() === 'sonic';
    const isSuper = () => effChar() === 'supersonic';
    const isTails = () => effChar() === 'tails';
    const isBear5 = () => !!(game.player && game.player.evil && (net.killerPick === 'bear5' || (game.player.char || '') === 'bear5'));
    // costume counts
    function effChar() {
      if ((net.phase === 'intermission' || net.phase === 'lobby') && net.costume) return net.costume;
      return net.pick || 'lux';
    }
    function lobbyCostume(id) {
      // same face on all screens
      const ids = ['lux', 'toko', 'sonic', 'tails'];
      let h = 0;
      for (const ch of String(id || '')) h = ((h * 31 + ch.charCodeAt(0)) >>> 0);
      return ids[h % ids.length];
    }
    // sonic peelout
    const SN = {
      peelCD: 0, windupUntil: 0, peelUntil: 0, peeling: false,
      spinCD: 0, spinWindup: 0, spinUntil: 0, spinning: false, spinHits: 0, spinTouching: false, spinHitCD: 0,
    };
    // super dev test kit
    const SS = {
      transformed: false, formUntil: 0,
      boostCD: 0, boostWindup: 0, boostUntil: 0, boosting: false, boostTouching: false, boostHitCD: 0,
      blockCD: 0, wasBlocking: false,
      spinCD: 0, spinWindup: 0, spinUntil: 0, spinning: false, spinStart: 0, spinHits: 0, spinTouching: false, spinHitCD: 0, dir: 0, lastX: 0,
    };
    const SUPER_HP = 550; // super health
    const SUPER_SPEED = 360; // super run speed
    // tails kit
    const TW = {
      flyCD: 0, flyLeft: 0, flying: false,
      bombCD: 0, holding: false, throwUntil: 0, bombsLeft: 5,
      whipCD: 0, whipUntil: 0, whipHit: false,
    };
    // nyan cyat dev kit, survivor only
    const NY = { rocketCD: 0, dashCD: 0, dashUntil: 0, dashing: false, dashHit: false };
    const isNyan = () => effChar() === 'nyan';
    const NYAN_HP = 200; // survivor nyan is tanky
    const ROCKET_CD = 8000; // rocket wait
    const NYAN_DASH_CD = 6000; // rainbow dash wait
    const NYAN_DASH_MS = 700; // dash length
    const NYAN_DASH_SPEED = 950;
    const BLAST_RANGE = 1800; // shake falls off over this far
    // lms and nyan both set max hp
    const survHp = () => (net.pick === 'nyan' ? NYAN_HP : 100);
    const seenBlasts = new Set();
    function fireRocket() {
      const p = game.player;
      // the cat becomes the rocket right now, the server just hands out the id
      const cx = Math.round(p.pos.x + p.w / 2), cy = Math.round(p.pos.y + p.h / 2);
      if (NY.dashing) { NY.dashing = false; p.dashing = false; p.chargeDir = 0; p.chargeSpeed = 0; }
      const local = game.addRocket(cx, cy, { owner: net.id, mine: true });
      p.rocketing = true;
      fetch('/api/rocket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: net.id, action: 'launch', x: cx, y: cy }),
      }).then((r) => r.json()).then((d) => {
        const rk = d && d.rocket;
        if (!rk) {
          // server said no, cat goes back to normal
          game.rockets = game.rockets.filter((g) => g !== local);
          NY.rocketCD = 0;
          return;
        }
        // the next poll may have claimed it already
        if (!local.id) local.id = rk.id;
        local.owner = rk.by;
        game.rockets = game.rockets.filter((g) => g === local || g.id !== rk.id);
      }).catch(() => { game.rockets = game.rockets.filter((g) => g !== local); });
      fileSfx(SFX + 'dash_release.wav', {});
    }
    // caster calls the hit, server does the damage
    game.onRocketHome = (rk, rate) => {
      fileSfx(SFX + 'nyan_homing.wav', { rate: rate || 1 });
    };
    game.onRocketBoom = (rk) => {
      fetch('/api/rocket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: net.id, action: 'detonate', rocket: rk.id, x: Math.round(rk.x), y: Math.round(rk.y) }),
      }).catch(() => {});
    };
    // rockets and blasts from the server, everyone sees both
    function syncRockets(data) {
      game.myId = net.id;
      const list = data.rockets || [];
      for (const r of list) {
        if (game.rocketDone.has(r.id)) continue; // already blew up here
        let rk = game.rockets.find((g) => g.id === r.id);
        // my own launch that is still waiting on its id
        if (!rk && r.by === net.id) {
          rk = game.rockets.find((g) => g.mine && !g.id);
          if (rk) rk.id = r.id;
        }
        if (!rk) {
          rk = game.addRocket(r.x, r.y, { id: r.id, owner: r.by, mine: r.by === net.id, age: r.age });
          fileSfx(SFX + 'dash_release.wav', { v: 0.6 });
        }
        rk.target = r.target || null;
      }
      game.rockets = game.rockets.filter((g) => !g.id || list.some((r) => r.id === g.id));
      for (const b of (data.blasts || [])) {
        if (seenBlasts.has(b.id)) continue;
        seenBlasts.add(b.id);
        if (b.age > 1.5) continue; // old news
        game.addBlast(b.x, b.y);
        // everyone shakes, closer is harder
        const cx = game.camera.x + game.width / 2, cy = game.camera.y + game.height / 2;
        const k = Math.max(0, 1 - Math.hypot(b.x - cx, b.y - cy) / BLAST_RANGE);
        game.shake(3 + 30 * k * k, 0.7 + 0.9 * k);
        fileSfx(SFX + 'explode.mp3', { v: 0.25 + 0.75 * k });
      }
      if (seenBlasts.size > 60) seenBlasts.delete(seenBlasts.values().next().value);
    }
    const FLY_MAX = 10000; // meter
    const FLY_DRAIN = 95; // meter burns fast
    const FLY_COLOR = '#ff8c1a'; // orange
    const FLY_CD = 30000; // after flight
    const BOMB_CD = 15000; // trap wait
    const WHIP_CD = 15000; // whip wait
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
      if (posdbg.style.display !== 'none' && game.player) {
        posdbg.textContent = `x: ${Math.round(game.player.pos.x)} y: ${Math.round(game.player.pos.y)}`;
      }
    }, 100);
    // death fx
    const deathStatic = document.getElementById('deathStatic');
    function deathFx() {
      fileSfx(SFX + 'death.mp3', {});
      if (!deathStatic) return;
      deathStatic.style.display = 'block';
      deathStatic.style.opacity = '1';
      clearTimeout(deathStatic._t);
      clearTimeout(deathStatic._t2);
      deathStatic._t = setTimeout(() => { deathStatic.style.opacity = '0'; }, 2500);
      deathStatic._t2 = setTimeout(() => { deathStatic.style.display = 'none'; }, 5100);
    }
    game.onDeath = () => {
      const p = game.player;
      clearEvil(p);
      deathFx();
      net.diedAt = Date.now(); // delayed spec
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
    // bomb boom
    const boomedIds = new Set(); // already popped
    const seenTosses = new Set(); // synchronized throws already rendered
    game.onBombTrip = (bb) => {
      const me = game.player;
      if (!me || !me.evil) return;
      boomedIds.add(bb.id);
      fileSfx(SFX + 'explode.mp3', {});
      // calculate stun strength from bomb age to scale explosion
      const bombAge = Math.max(0, Date.now() / 1000 - (bb.at || 0));
      const bombStun = Math.max(2.0, 5.0 - (bombAge / 15));
      const explosionScale = bombStun / 4.0; // 2.0 stun = 0.5 scale, 5.0 stun = 1.25 scale
      game.addBoom(bb.x, bb.y - 20, explosionScale);
      me.stunT = Math.max(me.stunT || 0, 5); // long stun
      me.rooted = true;
      if (net.id) {
        const pdx = Math.sign((me.pos.x + me.w / 2) - bb.x) || 1;
        fetch('/api/bomb', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: net.id, action: 'trip', bomb: bb.id, dx: pdx }),
        }).catch(() => {});
      }
    };
    // touchdown kills the wings
    game.onFlyLand = () => {
      TW.flying = false;
      TW.flyCD = Date.now() + FLY_CD * (1 - TW.flyLeft / FLY_MAX);
      if (game.player) game.player.taxiFly = false;
      sayStatus('landed - tails folded!!', 1.5);
    };
    // bomb stays landed
    game.onTossLand = (t) => {
      if (t.dead || !net.id) return;
      if (t.throwerId && t.throwerId !== net.id) return; // owner places only
      const bx = Math.round(t.x), by = Math.round(t.groundY ?? t.y);
      if (net.phase === 'round') fileSfx(SFX + 'bomb_land.wav', {});
      // bombs need elbow room
      for (const ob of (game.bombs || [])) {
        if ((bx - ob.x) ** 2 + (by - ob.y) ** 2 < 100 ** 2) {
          sayStatus('too close!!', 2);
          TW.holding = true; // take it back
          TW.bombsLeft = Math.min(5, TW.bombsLeft + 1); // refund
          TW.bombCD = Date.now() + 2000;
          return;
        }
      }
      fetch('/api/bomb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: net.id, action: 'place', x: bx, y: by }),
      }).then((r) => r.json()).then((d) => {
        if (d && !d.ok) {
          if (d.reason === 'bomb limit reached!!') sayStatus('max 5 bombs!!', 2);
          TW.bombsLeft = Math.min(5, TW.bombsLeft + 1); // refund
        }
      }).catch(() => {});
    };
    // spring boing
    game.onSpring = () => {
      if (net.phase === 'round') fileSfx(SFX + 'spring.wav', {});
    };
    game.onTossBounce = () => {
      if (net.phase === 'round') fileSfx(SFX + 'spring.wav', {});
    };
    game.onTossBoom = (a, c) => {
      if (game.player && !game.player.evil && isTails()) {
        for (const t of [a, c]) {
          if (t && t.throwerId === net.id) {
            TW.holding = true;
            TW.bombsLeft = Math.min(5, TW.bombsLeft + 1);
          }
        }
      }
      fileSfx(SFX + 'explode.mp3', {});
    };
