
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

