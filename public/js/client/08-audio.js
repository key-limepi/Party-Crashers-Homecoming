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
