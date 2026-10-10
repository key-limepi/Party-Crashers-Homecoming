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
