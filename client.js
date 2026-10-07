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
      idle: evilSprites.idle,
      walk: evilSprites.walk,
      run: evilSprites.run,
      jump: evilSprites.run[0],
      fall: evilSprites.run[0],
      stun: evilSprites.run[0],
      struggle: evilSprites.run,
      cower: evilSprites.run[0],
      dash: evilSprites.run[0],
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
    const maliceTarget = document.getElementById('maliceTarget');
    const maliceAmountBox = document.getElementById('maliceAmountBox');
    function refreshMaliceTargets(players) {
      if (!net.mod) return;
      const entries = Object.entries(players || {}).map(([id, player]) => [id, player.name || id]);
      const signature = JSON.stringify(entries);
      if (maliceTarget.dataset.signature === signature) return;
      const selected = maliceTarget.value || net.id;
      maliceTarget.replaceChildren(...entries.map(([id, name]) => {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = name;
        return option;
      }));
      maliceTarget.dataset.signature = signature;
      if (entries.some(([id]) => id === selected)) maliceTarget.value = selected;
    }
    document.getElementById('giveMaliceBtn').addEventListener('click', async () => {
      const amount = Number(maliceAmountBox.value);
      const target = maliceTarget.value;
      if (!net.id || !net.mod || !target || !Number.isSafeInteger(amount) || amount < 0) {
        sayStatus('choose a player and valid malice amount!!', 4);
        return;
      }
      try {
        const res = await fetch('/api/mod', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: net.id, action: 'givemalice', target, amount }),
        });
        const result = await res.json();
        const name = maliceTarget.selectedOptions[0]?.textContent || 'player';
        sayStatus(result.ok ? `gave ${amount} malice to ${name}!!` : (result.reason || 'could not give malice!!'), 5);
      } catch (_) {
        sayStatus('could not reach the server!!', 5);
      }
    });
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
        `mus: map=${beds.map.volume.toFixed(2)} wait=${beds.wait.volume.toFixed(2)} inter=${beds.inter.volume.toFixed(2)} lms=${beds.lms.volume.toFixed(2)} lmslux=${beds.lmslux.volume.toFixed(2)} lmssonic=${beds.lmssonic.volume.toFixed(2)} lmstails=${beds.lmstails.volume.toFixed(2)} hero=${beds.hero.volume.toFixed(2)} chase=${beds.chase.volume.toFixed(2)} terror=${beds.terror.volume.toFixed(2)} cs=${beds.charselect.volume.toFixed(2)}`;
    }, 100);

    // needs server
    // die to spectate
    const net = { id: null, timer: null, round: null, phase: null, ping: null, wasEvil: false, retry: null, mod: false, everOnline: false, wasElect: false, fail: 0 };
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
          pinRow.style.display = 'block';
          pinBanner.style.display = 'flex';
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
      const res = await fetch('/api/malice/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: net.id }),
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
    const killerPicks = () => false;
    function visRoster() {
      const list = ROSTER.filter((c) => (net.mod || !devChars[c.id]));
      return list.length ? list : ROSTER.slice(0, 1);
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
      if (evil) return EVIL_RUN[csFrame % EVIL_RUN.length];
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
      if (kp) fillSlot(csSlotEls.killer, 'killer', 'evil', kp.name);
      else fillSlot(csSlotEls.killer, 'killer', null);
    }
    function renderSelect() {
      // pick bar
      const vis = visRoster();
      selIdx = ((selIdx % vis.length) + vis.length) % vis.length;
      const cur = vis[selIdx];
      const csNameText = document.getElementById('csNameText');
      csName.style.display = '';
      csNameText.style.display = 'none';
      if (csName.dataset.char !== cur.id) {
        csName.dataset.char = cur.id;
        csName.src = cur.nameImg;
        csName.alt = cur.name;
      }
      // no buttons
      const evilLocked = !killerPicks() && (!!(game.player && game.player.evil) || net.phase === 'round' || !!net.amKillerElect);
      document.getElementById('csLeft').style.display = evilLocked ? 'none' : '';
      document.getElementById('csRight').style.display = evilLocked ? 'none' : '';
      csName.style.visibility = evilLocked ? 'hidden' : '';
    }
    function browseSelect(dir) {
      const vis = visRoster();
      selIdx = (selIdx + dir + vis.length) % vis.length;
      renderSelect();
    }
    function lockPick() {
      if (net.phase !== 'select') return; // select only
      if (net.amKillerElect) return; // killers are locked to the evil role
      if (game.player && game.player.evil) return; // killers skip
      const vis = visRoster();
      const cur = vis[((selIdx % vis.length) + vis.length) % vis.length];
      fetch('/api/pick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: net.id, char: cur.id }),
      }).then((r) => r.json()).then((d) => {
        if (d && d.ok) {
          net.pick = cur.id;
          if (!game.player.evil) wearChar(cur.id === 'supersonic' && !SS.transformed ? 'sonic' : cur.id);
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
      e.preventDefault();
      if (net.mod) {
        game.input.left = game.input.right = game.input.jump = false;
        chatBox.focus();
        return;
      }
      chatBox.blur();
      if (selectOpen) return;
      if (chatBox.disabled) {
        sayStatus('muted!!', 3);
        fileSfx(SFX + 'denied.wav', {});
        return;
      }
      game.input.left = game.input.right = game.input.jump = false; // stop moving
      openQuick();
    };
    chatBox.addEventListener('click', openFromBox);
    chatBox.addEventListener('focus', openFromBox);
    chatBox.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || !net.mod) return;
      e.preventDefault();
      const text = chatBox.value.trim();
      chatBox.value = '';
      sendQuick(text);
    });
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
      b.addEventListener('click', () => { sendQuick(text); closeQuick(); });
      quickPanel.appendChild(b);
    });
    function openQuick() { quickOpen = true; quickPanel.style.display = 'grid'; }
    function closeQuick() { quickOpen = false; quickPanel.style.display = 'none'; }
    function sendQuick(text) {
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
          chatBox.placeholder = 'say something!! (enter)';
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
            sendQuick(QUICK[i]);
            closeQuick();
          }
        }
        return;
      }
      if (e.key === 'Enter' && !typing) {
        e.preventDefault();
        game.input.left = game.input.right = game.input.jump = false; // stop moving
        openQuick();
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
    const beds = {
      map: loopTrack(MUS + 'map_musicV2.mp3'),
      wait: loopTrack(MUS + 'waiting4players.mp3'),
      inter: loopTrack(MUS + 'intermission.mp3'),
      lms: loopTrack(MUS + 'last_man_standing.mp3', false),
      lmslux: loopTrack(MUS + 'lux_lms.mp3', false), // lux anthem
      lmssonic: loopTrack(MUS + 'sonic_lms.mp3', false), // sonic anthem
      lmstails: loopTrack(MUS + 'tails_lms.mp3', false), // tails anthem
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
    for (const key of ['lms', 'lmslux', 'lmssonic', 'lmstails']) {
      beds[key].addEventListener('ended', () => {
        if (lmsTrack === key) lmsEnded = true;
      });
    }
    const soloOrder = ['map', 'wait', 'inter', 'lms', 'lmslux', 'lmssonic', 'lmstails', 'hero', 'chase', 'terror', 'charselect'];
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
        row.className = 'pRow' + (alive ? '' : ' dead') + (me ? ' me' : '') + (!evil && alive && chasedAt(x, y) ? ' chased' : '');
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
        if (net.pick === 'bear5') {
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
        const bear = net.pick === 'bear5';
        p.char = bear ? 'bear5' : p.char;
        game.setPlayerSprites(bear ? bear5Sprites : evilSprites);
        p.drawW = bear ? 76 : 50; p.drawH = bear ? 94 : 70; // full size
        p.maxHp = bear ? 999 : 250; p.hp = bear ? 999 : 250;
        p.maxJumps = bear ? 20 : 2; // double jump
        game.moveSpeed = bear ? 520 : 300; // evil speed
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
      const role = p.evil ? 'evil' : (isNyan() ? 'nyan' : isToko() ? 'toko' : (isSonic() ? 'sonic' : (isSuper() ? (SS.transformed ? 'super' : 'super0') : (isTails() ? 'tails' : 'lux'))));
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
    game.onUpdate = (dt) => {
      const p = game.player;
      if (!p || !p.evil || !p.alive || p.alive === false) return;
      if (net.pick === 'bear5' || p.char === 'bear5') {
        const speed = Math.abs(p.vel.x) + Math.abs(p.vel.y);
        const squash = 1 - Math.min(0.35, speed / 1800);
        const stretch = 1 + Math.min(0.5, speed / 1400);
        p.drawW = 72 + Math.min(30, speed * 0.02);
        p.drawH = Math.max(48, 94 * squash);
        if (p.actionT > 0 && (p.actionImg || p.poseImg)) {
          p.drawW = 80 + Math.min(42, speed * 0.03);
          p.drawH = 72 + Math.min(22, speed * 0.012);
        }
      }
    };
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
      p.invis = false; p.rooted = false; p.chargeDir = 0;
      p.cowerT = 0; p.cowering = false; p.stunT = 0;
      K.charging = false; K.pullUntil = 0; K.pullWindup = 0; K.windupUntil = 0;
      S.windupUntil = 0; S.dashing = false;
      T.kickUntil = 0; T.jabUntil = 0;
      SN.windupUntil = 0; SN.peelUntil = 0; SN.peeling = false;
      SN.spinWindup = 0; SN.spinUntil = 0; SN.spinning = false;
      SS.transformed = false; SS.formUntil = 0;
      SS.boostCD = 0; SS.boostWindup = 0; SS.boostUntil = 0; SS.boosting = false;
      SS.blockCD = 0; SS.wasBlocking = false;
      SS.spinCD = 0; SS.spinWindup = 0; SS.spinUntil = 0; SS.spinning = false;
      SS.formUntil = 0; SS.focusUntil = 0;
      p.tremble = false; p.rainbow = false; p.whiteFlash = false;
      TW.flying = false; TW.flyLeft = 0; TW.whipUntil = 0; TW.holding = false;
      p.sneakColor = null;
      TW.bombCD = 0; TW.flyCD = 0; TW.whipCD = 0; TW.throwUntil = 0;
      NY.rocketCD = 0; NY.dashCD = 0; NY.dashUntil = 0; NY.dashing = false;
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
    const isToko = () => effChar() === 'toko';
    const isSonic = () => effChar() === 'sonic';
    const isSuper = () => effChar() === 'supersonic';
    const isTails = () => effChar() === 'tails';
    const isBear5 = () => !!(game.player && game.player.evil && (net.pick === 'bear5' || (game.player.char || '') === 'bear5'));
    // costume counts
    function effChar() {
      if (net.phase === 'intermission' && net.costume) return net.costume;
      return net.pick || 'lux';
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
    const SUPER_HP = 550; // juggernaut health
    const SUPER_SPEED = 360; // super run speed
    // tails kit
    const TW = {
      flyCD: 0, flyLeft: 0, flying: false,
      bombCD: 0, holding: false, throwUntil: 0,
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
    const FLY_CD = 25000; // after flight
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
      game.addBoom(bb.x, bb.y - 20);
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
      TW.flyCD = Date.now() + FLY_CD;
      if (game.player) game.player.taxiFly = false;
      sayStatus('landed - wings folded!!', 1.5);
    };
    // bomb stays landed
    game.onTossLand = (t) => {
      if (t.dead || !net.id) return;
      const bx = Math.round(t.x), by = Math.round(t.groundY ?? t.y);
      fetch('/api/bomb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: net.id, action: 'place', x: bx, y: by }),
      }).catch(() => {});
    };
    // spring boing
    game.onSpring = () => {
      if (net.phase === 'round') fileSfx(SFX + 'spring.wav', {});
    };
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
          pinRow.style.display = 'block';
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
        chatBox.placeholder = net.mod ? 'type message!! (enter)' : 'say something!! (enter)';
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
            lift: TW.flying === true, super: SS.transformed === true, forming: !!SS.formUntil, whipUntil: !!TW.whipUntil, kickUntil: !!T.kickUntil, jabUntil: !!T.jabUntil, throwUntil: !!TW.throwUntil,
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
          beds.lms.pause(); beds.lmslux.pause(); beds.lmssonic.pause(); beds.lmstails.pause(); beds.chase.pause(); beds.terror.pause();
          clearEvil(p);
          trippedIds.clear();
          if (data.phase !== 'round' || you?.in_round) {
            if (data.phase === 'round') game.switchMap('main', 100, 880);
            else {
              game.switchMap('inter', 6120, 100); // island map
              if (data.phase === 'intermission' && !p.evil) {
                // random look
                const ids = ['lux', 'toko', 'sonic', 'tails'];
                wearChar(ids[Math.floor(Math.random() * ids.length)]);
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
        // evil incoming
        // far exile
        if (net.amKillerElect && !net.wasElect) {
          clearTimeout(roleTimer);
          roleBox.textContent = 'YOU WILL BE EVIL!!';
          roleBox.style.color = '#ff4757';
          roleBox.style.display = 'block';
          roleTimer = setTimeout(() => { roleBox.style.display = 'none'; }, 3000);
          sayStatus('you will be evil - no picking!!', 5);
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
          phaseText = `lobby - waiting for players (${here}/2)!!`;
        } else if (data.phase === 'intermission') {
          const t = Math.max(0, data.time_left || 0);
          const r = data.result;
          const who = r && r.winner === 'killer' ? `EVIL ${r.killer_name} WINS!!` : 'SURVIVORS WIN!!';
          const fee = net.me && net.me.round_cost ? ` (${net.me.round_cost} digipogs a round)` : '';
          phaseText = `${who} picks open in ${t}s!!${fee}`;
        } else if (data.phase === 'select') {
          const t = Math.max(0, data.time_left || 0);
          phaseText = you && you.paid === null ? 'paying the round fee...'
            : you && you.paid === false && net.me && net.me.round_cost ? `NOT PLAYING: ${you.pay_msg || 'round fee failed'}!!`
            : `PICK YOUR CHARACTER!! (${t}s)`;
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
        refreshMaliceTargets(data.players);
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
          r.char = d.char || 'lux';
          r.onGround = d.onGround ?? true;
          r.alive = d.alive ?? d.hp > 0;
          r.evil = id === data.killer_id;
          r.maxHp = d.maxhp || (r.evil && r.char === 'bear5' ? 999 : (r.evil ? 250 : 100)); // true bars
          r.super = !!d.super; // glowing or not
          r.rainbow = !!d.super; // gold bar
          r.forming = !!d.forming; // mid glow up
          r.tremble = !!d.forming;
          r.whiteFlash = !!d.forming;
          r.sprites = r.evil ? (r.char === 'bear5' ? bear5Sprites : evilSprites) : (r.char === 'supersonic' && !r.super && !r.forming ? sonicSprites : (charSprites[r.char] || luxSprites)); // see all
          // true size
          const rkey = r.char + (r.evil ? '*' : '') + (r.super ? '!' : '') + (r.forming ? '?' : '');
          if (r._lastChar !== rkey) { r._baseFrame = null; r._lastChar = rkey; }
          r.drawW = r.char === 'bear5' ? 76 : 50;
          r.drawH = r.char === 'bear5' ? 94 : (r.char === 'nyan' ? NYAN_H : (!r.evil && (r.char === 'sonic' || r.char === 'supersonic' || r.char === 'tails')) ? 64 : 70);
          r.invis = !!d.invis;
          r.stunned = !!d.stunned;
          r.pull = !!d.pull;
          r.peeling = !!d.peeling;
          r.spinning = !!d.spinning;
          r.spinwindup = !!d.spinwindup;
          r.pullwindup = !!d.pullwindup;
          r.lift = !!d.lift;
          r.whipUntil = !!d.whipUntil;
          r.kickUntil = !!d.kickUntil;
          r.jabUntil = !!d.jabUntil;
          r.throwUntil = !!d.throwUntil;
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
              r.poseImg = r.pullwindup ? evilAct.pullwindup : evilWindup[0];
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
          if (p.evil && r._lastHp !== undefined && r.hp < r._lastHp) {
            fileSfx(SFX + 'm1_hit.wav', {}); // hit sound
          }
          if (r._wasAlive && !r.alive && data.phase === 'round') {
            fileSfx(SFX + 'death.mp3', {}); // they died
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
        const superLMS = isLMS && lmsChar === 'supersonic';
        const lmsKey = luxLMS ? 'lmslux' : (sonicLMS ? 'lmssonic' : (tailsLMS ? 'lmstails' : (superLMS ? 'lmssonic' : 'lms')));
        if (isLMS && lmsTrack !== lmsKey) {
          // start anthem
          for (const k of ['chase', 'terror', 'map', 'lms', 'lmslux', 'lmssonic', 'lmstails']) {
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
            S.dashCD = 0; S.cowerCD = 0; T.kickCD = 0; T.jabCD = 0; TW.flyCD = 0; TW.bombCD = 0; TW.whipCD = 0;
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
          beds.lms.pause(); beds.lmslux.pause(); beds.lmssonic.pause(); beds.lmstails.pause();
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
          ['lms', isLMS && !luxLMS && !sonicLMS && !tailsLMS && !superLMS ? 1 : 0, 0.25],
          ['chase', chaseT, 0.5],
          ['terror', terrorT, 0.5],
          ['inter', data.phase === 'intermission' ? 1 : 0, 0.3],
          ['charselect', selectOpen && data.phase === 'select' ? 1 : 0, 0.4],
          ['map', data.phase === 'round' ? 1 : 0, 0.12],
          ['wait', data.phase === 'lobby' ? 1 : 0, 0.3],
        ];
        const bedT = { map: 0, wait: 0, inter: 0, lms: 0, lmslux: 0, lmssonic: 0, lmstails: 0, hero: 0, chase: 0, terror: 0, charselect: 0 };
        const win = cands.find((c) => c[1] > 0.05);
        if (win) bedT[win[0]] = win[2] * (win[0] === 'chase' || win[0] === 'terror' ? win[1] : 1);
        if (document.hidden) for (const k in bedT) bedT[k] = 0; // mute hidden
        for (const [key, a] of Object.entries(beds)) {
          // pause means silent
          // title mutes
          let target = soloIdx >= 0 ? (key === soloOrder[soloIdx] ? 0.8 : 0) : (bedT[key] || 0);
          if (titleLive) target = 0;
          if (target > 0.01) {
            if (a.paused && !(key === lmsTrack && lmsEnded)) a.play().catch(() => {});
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
          const kbPow = you.kb.p || 1;
          p.vel.x = (you.kb.x || 0) * Math.min(kbPow > 1 ? 4000 : 1100, 375 * (you.kb.s || 2) * kbPow);
          if (p.onGround) p.vel.y = Math.min(p.vel.y || 0, -220); // hop up
        }
        // traps pings
        for (const sp of (data.spikes || [])) if (trippedIds.has(sp.id)) sp.tripped = true;
        game.spikes = data.spikes || [];
        // bomb sync
        for (const bb of (data.bombs || [])) bombPos[bb.id] = { x: bb.x, y: bb.y };
        for (const bid of Object.keys(bombPos)) {
          if (!(data.bombs || []).some((bb) => bb.id === bid)) {
            const bp = bombPos[bid];
            if (data.phase === 'round' && !boomedIds.has(bid)) {
              game.addBoom(bp.x - 28, bp.y - 28);
              fileSfx(SFX + 'explode.mp3', {});
            }
            boomedIds.delete(bid);
            delete bombPos[bid];
          }
        }
        game.bombs = data.bombs || [];
        for (const toss of (data.tosses || [])) {
          if (!seenTosses.has(toss.id)) {
            seenTosses.add(toss.id);
            // pass throwerId for arc
            game.addToss(toss.x, toss.y, toss.vx, toss.vy, game.bombImg, toss.id, toss.throwerId);
          }
        }
        game.alerts = data.alerts || [];
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
            const dir = victim ? (Math.sign(victim.pos.x + victim.w / 2 - (p.pos.x + p.w / 2)) || p.facing || 1) : (p.facing || 1);
            p.facing = dir;
            p.rooted = true;
            p.actionImg = evilM1[Math.floor(Math.random() * evilM1.length)]; p.actionT = 0.25;
            setPose('swing', 180);
            if (victim) {
              fetch('/api/hit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: net.id, victim: victim.id, dmg: 999, stun: 0, kb: 3.5, stack: true }),
              }).catch(() => {});
              const bloodX = victim.pos.x + victim.w / 2;
              const bloodY = victim.pos.y + victim.h / 2;
              for (let i = 0; i < 26; i++) {
                game.fx.push({
                  kind: 'fire', x: bloodX, y: bloodY,
                  vx: (Math.random() - 0.5) * 520, vy: (Math.random() - 0.9) * 320,
                  age: 0, life: 0.8 + Math.random() * 0.6, size: 6 + Math.random() * 12,
                  grow: 10, drag: 1.5, grav: 520, color: '#ff1a1a',
                });
              }
              fileSfx(SFX + 'jumpscare.mp3', {});
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
                  TW.flyCD = now + FLY_CD * (isLMS ? LMS_CD : 1);
                } else if (now >= TW.flyCD && !TW.whipUntil) {
                  TW.flying = true;
                  TW.flyLeft = FLY_MAX; // meter
                  fileSfx(SFX + 'dash_release.wav', {});
                }
              } else if (ab === 'X' && now >= TW.bombCD && !TW.flying && !TW.throwUntil) {
                // bomb toss
                const dir = p.facing || 1;
                if (!TW.holding) {
                  sayStatus('no bomb to place!!', 2);
                } else {
                  TW.holding = false;
                  TW.bombCD = now + BOMB_CD * (isLMS ? LMS_CD : 1);
                  TW.throwUntil = now + 300;
                  setPose('throw', 300);
                  // throw it far
                  const throwX = p.pos.x + p.w / 2 + dir * 16;
                  const throwY = p.pos.y + 8;
                  const throwVx = dir * 1100;
                  const throwVy = -350;
                  // add toss with throwerId
                  game.addToss(throwX, throwY, throwVx, throwVy, game.bombImg, null, net.id);
                  fetch('/api/bomb', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: net.id, action: 'throw', x: throwX, y: throwY, vx: throwVx, vy: throwVy }),
                  }).then((response) => response.json()).then((payload) => {
                    if (payload.toss?.id) seenTosses.add(payload.toss.id);
                  }).catch(() => {});
                  fileSfx(SFX + 'spike_place.wav', {});
                }
              } else if (ab === 'C' && now >= TW.whipCD && !TW.whipUntil && !TW.flying) {
                // tailwhip
                TW.whipUntil = now + 400; TW.whipHit = false;
                p.rooted = true;
                setPose('whip', 400);
                fileSfx(SFX + 'jab_hit.wav', {});
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
            p.actionImg = evilAct.spike; p.actionT = 0.5;
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
            if (!K.pullHit) fileSfx(SFX + 'basic_hit.wav', {}); // caught one
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
        if (p.evil) game.moveSpeed = p.invis ? 430 : 300;
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
          if (!SS.spinning) p.spinning = false;
          if (SS.spinning) {
            const spinOver = now >= SS.spinUntil || p.alive === false || now - (SS.spinStart || now) > 7000;
            if (spinOver) {
              SS.spinning = false; p.spinning = false;
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
                  SS.spinning = false; p.chargeDir = 0; p.chargeSpeed = 0;
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
            TW.flyCD = now + FLY_CD * (isLMS ? LMS_CD : 1);
          }
          // bomb in hand
          if (!TW.holding && now >= TW.bombCD) TW.holding = true;
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
            p.lift = false; // engine flag
            p.sneakColor = FLY_COLOR;
            if (!TW.holding && !TW.throwUntil) p.sneakFrac = Math.max(0, TW.flyLeft / FLY_MAX);
            if (!TW.holding && TW.flyLeft <= 0) p.sneakFrac = 0;
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
              TW.whipUntil = 0;
              p.whipUntil = false; // engine flag
              p.rooted = false;
              TW.whipCD = now + WHIP_CD * (isLMS ? LMS_CD : 1);
              const away = (p.pos.x + p.w / 2) >= (ek.pos.x + ek.w / 2) ? 1 : -1;
              p.vel.x = away * 500;
              fetch('/api/hit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: net.id, victim: ek.id, dmg: 0, stun: 1.5 }),
              }).catch(() => {});
            } else if (now >= TW.whipUntil) {
              TW.whipUntil = 0;
              p.whipUntil = false; // engine flag
              p.rooted = false;
              TW.whipCD = now + 25000 * (isLMS ? LMS_CD : 1); // slow whiff
              p.stunT = Math.max(p.stunT || 0, 1);
              fileSfx(SFX + 'denied.wav', {}); // missed whip
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
