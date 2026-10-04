

class Vec {
  constructor(x = 0, y = 0) { this.x = x; this.y = y; }
}

class Body {
  constructor(x, y, w, h, opts = {}) {
    this.pos = new Vec(x, y);
    this.vel = new Vec(0, 0);
    this.w = w; this.h = h;
    this.isStatic = !!opts.isStatic;
    this.onGround = false;
    this.color = opts.color || '#fff';
    // sprite sets
    this.sprites = opts.sprites || null;
    this.facing = 1; // face right
    this.animTime = 0;
    this.walkDist = 0; // walk distance
    this.alive = true; // dead flag
    this.visible = true; // hide corpse
    this.maxJumps = 1; // extra jump
    this.jumps = 1;
    this.fatigue = 0; // jump tired
    this.lastJumpT = -99;
    this.stunT = 0; // stun timer
    this.rooted = false; // rooted flag
    this.chargeDir = 0; // charge way
    this.cowerT = 0; // cower timer
    this.cowering = false;
    this.invis = false; // ghost flag
    this.evil = false; // evil flag
    this.cyanFlash = false; // cyan strobe
    this.redFlash = false; // red strobe
    this.animMoving = false; // move latch
    this.animRunning = false; // run latch
    this.actionImg = null; // fight pose
    this.actionT = 0;
    // big sprites
    this.drawW = opts.drawW || w;
    this.drawH = opts.drawH || h;
  }
  get left() { return this.pos.x; }
  get right() { return this.pos.x + this.w; }
  get top() { return this.pos.y; }
  get bottom() { return this.pos.y + this.h; }
}

class Input {
  constructor() {
    this.left = false; this.right = false; this.jump = false;
    this._jumpPressed = false;
    this._abilityPressed = []; // ability taps
    this._bind();
  }
  _bind() {
    // typing guard
    const typing = () => {
      const el = document.activeElement;
      return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
    };
    const down = (e) => {
      if (typing()) return;
      if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key)) e.preventDefault();
      switch (e.key) {
        case 'ArrowLeft': this.left = true; break;
        case 'ArrowRight': this.right = true; break;
        case 'ArrowUp': case ' ':
          if (!this.jump) this._jumpPressed = true;
          this.jump = true; break;
        case 'z': case 'Z': case 'x': case 'X': case 'c': case 'C':
        case 'v': case 'V': case 'b': case 'B':
          // evil keys
          if (!e.repeat) this._abilityPressed.push(e.key.toUpperCase());
          break;
      }
    };
    const up = (e) => {
      switch (e.key) {
        case 'ArrowLeft': this.left = false; break;
        case 'ArrowRight': this.right = false; break;
        case 'ArrowUp': case ' ': this.jump = false; break;
      }
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
  }
  consumeJumpPressed() {
    const j = this._jumpPressed;
    this._jumpPressed = false;
    return j;
  }
  consumeAbility() {
    return this._abilityPressed.shift(); // key names
  }
}

function aabbOverlap(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

class PlatformerEngine {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width = opts.width || 800;
    this.height = canvas.height = opts.height || 450;

    this.gravity = opts.gravity ?? 2200; // fall speed
    this.moveSpeed = opts.moveSpeed ?? 260; // walk speed
    this.jumpSpeed = opts.jumpSpeed ?? 780; // jump speed
    this.airControl = opts.airControl ?? 0.7;

    this.bodies = [];
    this.statics = [];
    this.maps = { main: this.statics, inter: [] }; // two maps
    this.activeMap = 'main';
    this.remotes = []; // draw only
    this.player = null;
    this.camera = { x: 0, y: 0 };
    this.followPlayer = opts.followPlayer ?? true;
    this.background = opts.background || '#1a1b26';
    this.spawn = { x: 60, y: 100 };
    this.evilSpawn = { x: 4300, y: 100 }; // far spawn
    this.fallY = opts.fallY ?? 800; // fall line
    this.fallDamage = opts.fallDamage ?? 50;

    this.input = new Input();
    this.time = 0;
    this.onUpdate = null; // tick hook
    this.moveLock = false; // select lock
    this.onHurt = null; // hurt hook
    this.onHeal = null; // heal hook
    this.onJump = null; // jump hook
    this.onDeath = null; // death hook
    this.onCounter = null; // counter hook
    this.onSpikeTrip = null; // trip hook
    this.cameraTarget = null; // watch target
    this.spikes = []; // trap list
    this.spikeImg = null; // spike art
    this.alertArrow = null; // ping arrow
    this.alerts = []; // ping list
    this.afterimages = []; // ghosts
    this.bubbles = {}; // chat bubbles
    this.chatBubbleImg = null; // bubble art
    this.showAlerts = false;
    this.sneakArrows = false; // ghost tracks
    this.seeInvis = false; // see ghosts
    this.damageOn = true; // safe rounds
    this.exitZone = null; // exit door
    this.pullSrc = null; // drag point
    this.peelSrc = null; // ride point
    this.pullLinks = []; // rope lines
    this.debug = false; // debug view
  }

  addPlayer(x, y, w = 36, h = 52, color = '#7aa2f7') {
    const p = new Body(x, y, w, h, { color });
    p.hp = 100;
    p.maxHp = 100;
    this.spawn = { x, y };
    this.player = p;
    this.bodies.push(p);
    return p;
  }

  // deal damage
  hurtPlayer(n, source) {
    const p = this.player;
    if (!p || p.alive === false) return;
    // soften hits
    if (source !== 'killer' && this.lmsResist && !p.evil) n = Math.ceil(n / 2);
    if (source === 'killer' && (p.cowerT ?? 0) > 0) {
      p.cowerT = 0;
      p.cowering = false;
      if (this.onCounter) this.onCounter();
      return;
    }
    p.hp = Math.max(0, p.hp - n);
    if (this.onHurt) this.onHurt(p.hp);
    if (p.hp <= 0) {
      p.alive = false;
      p.visible = false;
      if (this.onDeath) this.onDeath();
      else { p.hp = p.maxHp; this.respawn(); }
    }
  }

  respawn() {
    const p = this.player;
    if (!p) return;
    // far respawn
    const s = (p.evil && this.activeMap === 'main') ? this.evilSpawn : this.spawn;
    p.pos.x = s.x;
    p.pos.y = s.y;
    p.vel.x = 0; p.vel.y = 0;
    p.runTime = 0;
    p.alive = true;
    p.visible = true;
    p.fatigue = 0; // fresh legs
    p.lastJumpT = -99;
    p.rooted = false; p.chargeDir = 0; // clear locks
    p.cowerT = 0; p.cowering = false; p.stunT = 0; p.actionT = 0;
  }

  // debug heal
  healPlayer(n) {
    const p = this.player;
    if (!p) return;
    p.hp = Math.min(p.maxHp, p.hp + n);
    if (this.onHeal) this.onHeal(n);
  }

  // set sprites
  setPlayerSprites(sprites) {
    if (this.player) {
      if (this.player.sprites !== sprites) this.player._baseFrame = null;
      this.player.sprites = sprites;
    }
  }

  addPlatform(x, y, w, h, color = '#9ece6a', map = 'main') {
    const p = new Body(x, y, w, h, { isStatic: true, color });
    this.maps[map].push(p);
    return p;
  }

  // swap maps
  switchMap(name, spawnX, spawnY) {
    this.activeMap = name;
    this.statics = this.maps[name];
    this.spawn = { x: spawnX, y: spawnY };
  }

  // load tiles
  loadTilemap(rows, tile = 32, color = '#9ece6a') {
    rows.forEach((row, ry) => {
      [...row].forEach((ch, rx) => {
        if (ch === '#') this.addPlatform(rx * tile, ry * tile, tile, tile, color);
      });
    });
  }

  // split motion
  moveBody(b, dt, statics) {
    const dist = Math.hypot(b.vel.x, b.vel.y) * dt; // frame distance
    const maxStep = Math.max(4, Math.min(b.w, b.h) / 2); // step cap
    const steps = Math.max(1, Math.min(8, Math.ceil(dist / maxStep))); // cap substeps
    const stepDt = dt / steps;
    for (let i = 0; i < steps; i++) {
      b.pos.x += b.vel.x * stepDt;
      this.resolveAxis(b, statics, 'x');
      b.pos.y += b.vel.y * stepDt;
      this.resolveAxis(b, statics, 'y');
    }
  }

  // pop out
  resolveAxis(b, statics, axis) {
    for (const s of statics) {
      if (!aabbOverlap(b, s)) continue;
      if (axis === 'x') {
        const fromLeft = b.right - s.left; // left depth
        const fromRight = s.right - b.left; // right depth
        if (b.vel.x > 0 || (b.vel.x === 0 && fromLeft <= fromRight)) b.pos.x = s.pos.x - b.w;
        else b.pos.x = s.pos.x + s.w;
        b.vel.x = 0;
      } else {
        const fromAbove = b.bottom - s.top; // top depth
        const fromBelow = s.bottom - b.top; // bottom depth
        if (b.vel.y > 0 || (b.vel.y === 0 && fromAbove <= fromBelow)) {
          b.pos.y = s.pos.y - b.h;
          b.onGround = true; // feet landed
        } else {
          b.pos.y = s.pos.y + s.h; // bonked head
        }
        b.vel.y = 0;
      }
    }
  }

  update(dt) {
    const p = this.player;
    if (p) {
      const stunned = (p.stunT ?? 0) > 0;
      if (stunned) p.stunT -= dt;
      if (p.actionT > 0) p.actionT -= dt;
      if ((p.cowerT ?? 0) > 0) p.cowerT -= dt; // cower ticks
      p.cowering = (p.cowerT ?? 0) > 0;
      const locked = stunned || p.rooted || p.chargeDir || this.moveLock; // still check
      const noJump = stunned || p.rooted || this.moveLock; // jump lock
      let ax = 0;
      if (!locked) {
        if (this.input.left) ax -= 1;
        if (this.input.right) ax += 1;
      }

      // run faster
      if (ax !== 0 && Math.sign(ax) === Math.sign(p.runDir || ax)) {
        p.runTime = (p.runTime || 0) + dt;
      } else if (ax !== 0) {
        p.runTime = 0; // turn reset
      } else {
        p.runTime = 0; // stop reset
      }
      p.runDir = ax !== 0 ? ax : 0;
      // tired jumps
      const fat = p.evil ? 0 : (p.fatigue || 0);
      p.fatigue = Math.max(0, (p.fatigue || 0) - dt * 0.2);
      const boost = 1 + Math.min(p.runTime / 2, 1) * 0.8;
      const target = ax * this.moveSpeed * boost * (1 - 0.3 * fat);

      // soft accel
      const accel = p.onGround ? 14 : 8;
      p.vel.x += (target - p.vel.x) * Math.min(accel * dt, 1);
      if (p.chargeDir && (p.stunT || 0) <= 0) p.vel.x = p.chargeDir * (p.chargeSpeed || 700); // dash speed

      if (ax !== 0) p.facing = ax > 0 ? 1 : -1;
      p.animTime += dt;

      p.vel.y += this.gravity * dt;

      if (p.onGround) p.jumps = p.maxJumps ?? 1; // feet reset
      if (!noJump && this.input.consumeJumpPressed()) {
        // weak jumps
        const hop = this.jumpSpeed * (1 - 0.5 * fat);
        if (p.onGround) {
          p.vel.y = -hop;
          p.onGround = false;
          p.jumps = (p.maxJumps ?? 1) - 1;
          if (!p.evil) p.fatigue = Math.min(1, (p.fatigue || 0) + 0.15);
          p.lastJumpT = this.time;
          if (this.onJump) this.onJump(false);
        } else if ((p.jumps ?? 0) > 0) {
          p.jumps--; // use jump
          p.vel.y = -hop;
          if (!p.evil) p.fatigue = Math.min(1, (p.fatigue || 0) + 0.15);
          p.lastJumpT = this.time;
          if (this.onJump) this.onJump(true);
        }
      } else {
        this.input.consumeJumpPressed(); // drop inputs
      }
      // short hops
      if (!this.input.jump && p.vel.y < -260) p.vel.y = -260;
    }

    // move bodies
    for (const b of this.bodies) {
      if (b.isStatic) continue;
      b.onGround = false;
      this.moveBody(b, dt, this.statics); // tunnel-safe push
    }

    // drag close
    p.pulled = false;
    if (p && this.pullSrc && p.alive !== false && !p.evil) {
      const dx = this.pullSrc.x - (p.pos.x + p.w / 2);
      const dy = this.pullSrc.y - (p.pos.y + p.h / 2);
      const d = Math.hypot(dx, dy) || 1;
      const pull = 240 * dt;
      p.pos.x += (dx / d) * pull;
      p.pos.y += (dy / d) * pull;
      p.pulled = true; // dragged pose
    }
    // ride sonic
    if (p && this.peelSrc && p.alive !== false && !p.evil) {
      p.pos.x = this.peelSrc.x - p.w / 2;
      p.pos.y = this.peelSrc.y - p.h / 2;
      p.pulled = true; // dragged pose
    }
    // mark caught
    for (const r of this.remotes) {
      r.pulled = false;
      if (r.alive !== false && !r.evil) {
        const ex = r.pos.x + r.w / 2, ey = r.pos.y + r.h / 2;
        for (const l of this.pullLinks) {
          if (Math.hypot(l.x1 - ex, l.y1 - ey) < 50 || Math.hypot(l.x2 - ex, l.y2 - ey) < 50) {
            r.pulled = true;
            break;
          }
        }
      }
    }

    // trap bites
    if (p && p.alive !== false && !p.evil && p.onGround && this.damageOn !== false) {
      const cx = p.pos.x + p.w / 2, feet = p.pos.y + p.h;
      for (const sp of this.spikes) {
        if (sp.tripped) continue;
        if (Math.abs(cx - sp.x) < 30 && feet > sp.y - 24 && feet < sp.y + 10) {
          sp.tripped = true;
          this.hurtPlayer(30);
          p.stunT = Math.max(p.stunT || 0, 3);
          if (this.onSpikeTrip) this.onSpikeTrip(sp);
          break;
        }
      }
    }

    // ground math
    if (p && p.onGround) p.walkDist += Math.abs(p.vel.x) * dt;

    // fade ghosts
    for (const g of this.afterimages) g.age += dt;
    this.afterimages = this.afterimages.filter((g) => g.age < 0.4);

    // glide friends
    for (const r of this.remotes) {
      if (r.tx === undefined) { r.tx = r.pos.x; r.ty = r.pos.y; }
      const dx = r.tx - r.pos.x, dy = r.ty - r.pos.y;
      if (Math.abs(dx) > 300 || Math.abs(dy) > 300) {
        r.pos.x = r.tx; r.pos.y = r.ty; // snap far
        r.vel.x = 0;
        const now0 = performance.now();
        r.hist = [{ x: r.pos.x, y: r.pos.y, t: now0 }, { x: r.pos.x, y: r.pos.y, t: now0 }];
      } else {
        const rt = performance.now() - 100;
        const h = (r.hist && r.hist.length >= 2) ? r.hist : null;
        let nx = r.tx, ny = r.ty;
        if (h) {
          let i = h.length - 1;
          while (i > 0 && h[i].t > rt) i--;
          const a = h[i], b = h[Math.min(i + 1, h.length - 1)];
          if (b.t > a.t) {
            const f = Math.min(1, Math.max(0, (rt - a.t) / (b.t - a.t)));
            nx = a.x + (b.x - a.x) * f;
            ny = a.y + (b.y - a.y) * f;
          } else {
            nx = b.x; ny = b.y;
          }
        } else {
          const t = Math.min(16 * dt, 1);
          nx = r.pos.x + dx * t;
          ny = r.pos.y + dy * t;
        }
        const moved = Math.abs(nx - r.pos.x);
        r.walkDist += moved; // glide steps
        // safe speed
        const hh = r.hist;
        if (hh && hh.length >= 2) {
          const ha = hh[0], hb = hh[hh.length - 1];
          const span = Math.max(0.05, (hb.t - ha.t) / 1000);
          const raw = Math.abs(hb.x - ha.x) / span;
          r.vel.x = (r.vel.x || 0) + (raw - (r.vel.x || 0)) * Math.min(1, 5 * dt);
        } else {
          r.vel.x = moved / Math.max(dt, 0.001); // rough speed
        }
        r.pos.x = nx; r.pos.y = ny;
        // dash ghosts
        if ((r.dashing || r.peeling || r.spinning) && moved > 1) {
          r.ghostDist = (r.ghostDist || 0) + moved;
          if (r.ghostDist > 14) {
            r.ghostDist = 0;
            const gi = this._spriteFor(r);
            if (gi && gi.complete && gi.naturalWidth) {
              const fs = this.frameSize(r, gi);
              this.afterimages.push({
                x: r.pos.x, y: r.pos.y, w: r.w, h: r.h,
                drawW: fs.dw, drawH: fs.dh, facing: r.facing,
                img: gi, age: 0, plain: !!(r.peeling || r.spinning),
              });
            }
          }
        } else {
          r.ghostDist = 0;
        }
      }
      r.animTime += dt; // blink all
    }

    // fell far
    if (p && p.pos.y > this.fallY && this.damageOn !== false) {
      this.hurtPlayer(this.fallDamage);
      if (p.hp > 0) this.respawn(); // spawn back
    }

    if (this.followPlayer && p) {
      const t = this.cameraTarget || p; // watch who
      this.camera.x = t.pos.x + t.w / 2 - this.width / 2;
      this.camera.y = t.pos.y + t.h / 2 - this.height / 2;
    }

    if (this.onUpdate) this.onUpdate(dt);
    this.time += dt;
  }

  render() {
    const { ctx, width, height } = this;
    ctx.imageSmoothingEnabled = false; // sharp pixels
    ctx.fillStyle = this.background;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(-Math.round(this.camera.x), -Math.round(this.camera.y));

    for (const s of this.statics) {
      ctx.fillStyle = s.color;
      ctx.fillRect(s.pos.x, s.pos.y, s.w, s.h);
    }
    // exit door
    if (this.exitZone && this.activeMap === 'main') {
      const e = this.exitZone;
      ctx.fillStyle = '#2ed573';
      ctx.fillRect(e.x, e.y, e.w, e.h);
      ctx.fillStyle = '#0a3d1f';
      ctx.fillRect(e.x + 6, e.y + 6, e.w - 12, e.h - 6);
      ctx.fillStyle = '#fff';
      ctx.font = '16px "Comic Sans MS", "Comic Sans", cursive';
      ctx.textAlign = 'center';
      ctx.fillText('EXIT', e.x + e.w / 2, e.y + 30);
    }
    // spike art
    // dim spikes
    const spk = this.spikeImg;
    const spkOk = spk && spk.complete && spk.naturalWidth;
    ctx.save();
    if (this.player && !this.player.evil) ctx.globalAlpha = 0.2;
    for (const sp of this.spikes) {
      if (sp.tripped) continue;
      const x = sp.x, y = sp.y;
      if (spkOk) {
        ctx.drawImage(spk, Math.round(x - 20), Math.round(y - 24), 40, 24);
        continue;
      }
      ctx.fillStyle = '#3a3a5a';
      ctx.beginPath();
      ctx.moveTo(x - 18, y); ctx.lineTo(x - 12, y - 22); ctx.lineTo(x - 6, y);
      ctx.moveTo(x - 6, y); ctx.lineTo(x, y - 28); ctx.lineTo(x + 6, y);
      ctx.moveTo(x + 6, y); ctx.lineTo(x + 12, y - 22); ctx.lineTo(x + 18, y);
      ctx.fill();
    }
    ctx.restore();
    // trip pings
    const arrow = this.alertArrow && this.alertArrow.complete && this.alertArrow.naturalWidth
      ? this._redTint(this.alertArrow) : null;
    // edge arrow
    const edgeArrow = (sx, sy) => {
      const m = 34; // edge space
      const cx = Math.min(Math.max(sx, m), this.width - m);
      const cy = Math.min(Math.max(sy, m), this.height - m);
      const ang = Math.atan2(sy - this.height / 2, sx - this.width / 2);
      const px = cx + this.camera.x, py = cy + this.camera.y;
      if (arrow) {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(ang - Math.PI); // spin arrow
        ctx.drawImage(arrow, -14, -14, 28, 28);
        ctx.restore();
      } else {
        // backup triangle
        ctx.fillStyle = '#ff4757';
        ctx.beginPath();
        ctx.moveTo(px + Math.cos(ang) * 14, py + Math.sin(ang) * 14);
        ctx.lineTo(px + Math.cos(ang + 2.5) * 12, py + Math.sin(ang + 2.5) * 12);
        ctx.lineTo(px + Math.cos(ang - 2.5) * 12, py + Math.sin(ang - 2.5) * 12);
        ctx.fill();
      }
    };
    if (this.showAlerts) {
      const pulse = 1 + Math.sin(this.time * 10) * 0.2;
      ctx.fillStyle = '#ff4757';
      ctx.font = `${Math.round(20 * pulse)}px "Comic Sans MS", "Comic Sans", cursive`;
      ctx.textAlign = 'center';
      for (const a of this.alerts) {
        const sx = a.x - this.camera.x, sy = (a.y - 30) - this.camera.y;
        if (sx > -20 && sx < this.width + 20 && sy > -20 && sy < this.height + 20) {
          ctx.fillText('!!', a.x, a.y - 30);
          continue;
        }
        edgeArrow(sx, sy);
      }
    }
    // ghost tracks
    if (this.sneakArrows) {
      for (const r of this.remotes) {
        if (r.evil || !r.alive || r.hp <= 0) continue;
        const sx = (r.pos.x + r.w / 2) - this.camera.x, sy = (r.pos.y + r.h / 2) - this.camera.y;
        if (sx > -20 && sx < this.width + 20 && sy > -20 && sy < this.height + 20) continue;
        edgeArrow(sx, sy);
      }
    }
    const bars = []; // bar list
    // rope art
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (const l of this.pullLinks) {
      ctx.moveTo(l.x1, l.y1);
      ctx.lineTo(l.x2, l.y2);
    }
    ctx.stroke();
    for (const b of [...this.bodies, ...(this.remotes || [])]) {
      if (b.visible === false) continue; // dead camera
      if (b.isRemote && b.alive === false) continue; // hide dead
      if (b.isRemote && b.invis && !this.seeInvis) continue; // hidden evil
      const img = this._spriteFor(b);
      if (img && img.complete && img.naturalWidth) {
        // big sprites
        // cower shake
        const scare = b.cowering ? Math.floor(Math.random() * 3) - 1 : 0;
        const fs = this.frameSize(b, img);
        const dw = fs.dw, dh = fs.dh;
        const dx = Math.round(b.pos.x + (b.w - dw) / 2) + scare;
        const dy = Math.round(b.pos.y + (b.h - dh)); // align feet
        const cx = Math.round(b.pos.x + b.w / 2);
        ctx.save();
        if (b === this.player && b.invis) ctx.globalAlpha = 0.45; // ghost evil
        else if (b.isRemote && b.away) ctx.globalAlpha = 0.5; // ghost afk
        if (b.facing < 0) {
          ctx.translate(cx, 0);
          ctx.scale(-1, 1);
          ctx.translate(-cx, 0);
        }
        // windup strobes
        const strobe = Math.floor(this.time * 10) % 2 === 0;
        const tinted = (b.redFlash && strobe) ? this._redTint(img)
          : (b.cyanFlash && strobe) ? this._cyanTint(img) : img;
        ctx.drawImage(tinted, dx, dy, dw, dh);
        ctx.restore();
      } else {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.pos.x, b.pos.y, b.w, b.h);
      }
      // ghost meter
      if (b === this.player && b.evil && (b.sneakFrac || 0) > 0) {
        const frac = Math.min(1, b.sneakFrac);
        const bx0 = Math.round(b.pos.x) - 10, by0 = Math.round(b.pos.y);
        const bh = Math.round(40 * frac);
        ctx.fillStyle = '#000';
        ctx.fillRect(bx0 - 1, by0 - 1, 6, 42);
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(bx0, by0 + 40 - bh, 4, bh);
      }
      // stack bars
      if (b === this.player || b.isRemote) {
        const dw = b.drawW || b.w, dh = b.drawH || b.h;
        bars.push({
          b,
          bw: Math.max(dw, 50), bh: 8,
          bx: b.pos.x + (b.w - Math.max(dw, 50)) / 2,
          by: Math.round(b.pos.y + (b.h - dh)) - 20,
        });
      }
    }
    // spread bars
    bars.sort((m, n) => m.bx - n.bx);
    let stackX1 = -Infinity, stackY = 0;
    for (const bar of bars) {
      const { b, bw, bh } = bar;
      let { bx, by } = bar;
      if (bx < stackX1 && Math.abs(by - stackY) < 16) by = stackY - 16;
      stackX1 = bx + bw; stackY = by;
      {
        const frac = Math.max(0, (b.hp ?? 100) / (b.maxHp ?? 100));
        ctx.fillStyle = '#000';
        ctx.fillRect(bx - 1, by - 1, bw + 2, bh + 2);
        ctx.fillStyle = '#000';
        ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = (b.hp ?? 100) <= 30 ? '#8e0000' // low health
          : frac > 0.5 ? '#2ed573' : frac > 0.25 ? '#ffa502' : '#8e0000';
        ctx.fillRect(bx, by, bw * frac, bh);
        // evil name
        // afk tag
        const evilTag = b.isRemote && b.evil;
        const afkTag = b.isRemote && b.away;
        ctx.fillStyle = evilTag ? '#ff4757' : '#fff';
        ctx.font = `${evilTag ? 'bold 13px' : '11px'} "Comic Sans MS", "Comic Sans", cursive`;
        ctx.textAlign = 'center';
        // dark outline
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#1a1b26';
        const label = evilTag ? `EVIL ${String(b.name || 'friend')}` :
          b.isRemote ? String(b.name || 'friend') : `${Math.ceil(frac * (b.maxHp ?? 100))}`;
        const labelText = afkTag ? `${label} [AFK]` : label;
        ctx.strokeText(labelText, bx + bw / 2, by - 4);
        ctx.fillText(labelText, bx + bw / 2, by - 4);
        // chat art
        const bub = this.bubbles[b.isRemote ? b.id : 'me'];
        if (bub && bub.text && Date.now() < bub.until) {
          const bimg = this.chatBubbleImg;
          if (bimg && bimg.complete && bimg.naturalWidth) {
            const bw3 = 92, bh3 = 44;
            const px = Math.round(bx + bw / 2 - bw3 * 0.4); // bubble tail
            const py = Math.round(by - bh3 - 4);
            ctx.drawImage(bimg, px, py, bw3, bh3);
            // fit text
            const L = bub.text.length;
            let size = L <= 8 ? 16 : L <= 20 ? 13 : 12, txt = bub.text;
            const maxW = bw3 - 20;
            const setF = () => { ctx.font = `${size}px "Comic Sans MS", "Comic Sans", cursive`; };
            setF();
            while (ctx.measureText(txt).width > maxW && size > 8) { size--; setF(); }
            while (txt.length > 1 && ctx.measureText(txt + '…').width > maxW) txt = txt.slice(0, -1);
            if (txt !== bub.text) txt += '…';
            ctx.fillStyle = '#000';
            ctx.textAlign = 'center';
            ctx.fillText(txt, px + bw3 / 2, py + bh3 / 2 + size * 0.35);
          } else {
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = '#5b4b8a';
            ctx.lineWidth = 2;
            ctx.font = '12px "Comic Sans MS", "Comic Sans", cursive';
            const tw = ctx.measureText(bub.text).width;
            const pw = tw + 16, ph = 22;
            const px = bx + bw / 2 - pw / 2, py = by - ph - 12;
            ctx.fillRect(px, py, pw, ph);
            ctx.strokeRect(px, py, pw, ph);
            ctx.fillStyle = '#5b4b8a';
            ctx.textAlign = 'center';
            ctx.fillText(bub.text.slice(0, 20), bx + bw / 2, py + 15);
          }
        }
      }
    }
    // fade ghosts
    for (const g of this.afterimages) {
      if (!g.img || !g.img.complete || !g.img.naturalWidth) continue;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 0.5 * (1 - g.age / 0.4));
      if (g.facing < 0) {
        ctx.translate(Math.round(g.x + g.w / 2), 0);
        ctx.scale(-1, 1);
        ctx.translate(-Math.round(g.x + g.w / 2), 0);
      }
      const dw = g.drawW || g.w, dh = g.drawH || g.h;
      ctx.drawImage(g.plain ? g.img : this._cyanTint(g.img), Math.round(g.x + (g.w - dw) / 2), Math.round(g.y + (g.h - dh)), dw, dh);
      ctx.restore();
    }
    // debug boxes
    if (this.debug) {
      ctx.strokeStyle = '#ff00ff';
      ctx.lineWidth = 1;
      for (const s of this.statics) ctx.strokeRect(s.pos.x, s.pos.y, s.w, s.h);
      for (const b of this.bodies) ctx.strokeRect(b.pos.x, b.pos.y, b.w, b.h);
      for (const r of this.remotes) ctx.strokeRect(r.pos.x, r.pos.y, r.w, r.h);
    }
    ctx.restore();
  }

  // hot tint
  _redTint(img) {
    if (!img._redTint) {
      const t = document.createElement('canvas');
      t.width = img.naturalWidth || img.width;
      t.height = img.naturalHeight || img.height;
      const c = t.getContext('2d');
      c.drawImage(img, 0, 0);
      c.globalCompositeOperation = 'source-atop';
      c.fillStyle = 'rgba(255, 30, 30, 0.85)';
      c.fillRect(0, 0, t.width, t.height);
      img._redTint = t;
    }
    return img._redTint;
  }
  // cold tint
  _cyanTint(img) {
    if (!img._cyanTint) {
      const t = document.createElement('canvas');
      t.width = img.naturalWidth || img.width;
      t.height = img.naturalHeight || img.height;
      const c = t.getContext('2d');
      c.drawImage(img, 0, 0);
      c.globalCompositeOperation = 'source-atop';
      c.fillStyle = 'rgba(0, 229, 255, 0.85)';
      c.fillRect(0, 0, t.width, t.height);
      img._cyanTint = t;
    }
    return img._cyanTint;
  }

  // idle scale
  baseFrame(b) {
    if (b._baseFrame) return b._baseFrame;
    const idle = b.sprites && b.sprites.idle;
    const ref = Array.isArray(idle) ? idle[0] : idle;
    if (ref && ref.complete && ref.naturalWidth && ref.naturalHeight) {
      b._baseFrame = { w: ref.naturalWidth, h: ref.naturalHeight };
    }
    return b._baseFrame || null; // idle loading
  }

  frameSize(b, img) {
    const boxH = b.drawH || b.h;
    if (!(img && img.complete && img.naturalWidth && img.naturalHeight)) {
      return { dw: b.drawW || b.w, dh: boxH };
    }
    const base = this.baseFrame(b);
    let scale = base ? boxH / base.h : boxH / img.naturalHeight;
    const s = b.sprites;
    if (s && Array.isArray(s.jump) && s.jump.includes(img)) scale *= (s.jumpScale || 1);
    return {
      dw: Math.max(1, Math.round(img.naturalWidth * scale)),
      dh: Math.max(1, Math.round(img.naturalHeight * scale)),
    };
  }
  // sprite order
  // pick sprite
  _spriteFor(b) {
    const pick = this._spritePick(b);
    if (pick && pick.complete && pick.naturalWidth) return pick;
    // no hitbox
    const idle = b.sprites && b.sprites.idle;
    const fb = Array.isArray(idle) ? idle[0] : idle;
    if (fb && fb.complete && fb.naturalWidth) return fb;
    return null;
  }
  // raw pick
  _spritePick(b) {
    if (!b.sprites) return null;
    const s = b.sprites;
    if (b.actionImg && b.actionT > 0) return b.actionImg;
    if ((b.stunT ?? 0) > 0 && s.stun) return s.stun;
    if (b.isRemote && b.stunned && s.stun) return s.stun;
    // enemy moves
    if (b.isRemote && b.poseImg && Date.now() < (b.poseUntil || 0)) return b.poseImg;
    if (b.isRemote && b.pull && s.pull) return s.pull;
    if (b.cowering && s.cower) return s.cower;
    const tired = (b.hp ?? 100) / (b.maxHp ?? 100) < 0.5;
    // dragged pose
    if (b.pulled && s.struggle && s.struggle.length) {
      const i = Math.floor(b.animTime * 6) % s.struggle.length;
      return s.struggle[i];
    }
    if (!b.onGround && s.jump) {
      if (Array.isArray(s.jump)) return s.jump[Math.floor(b.animTime * 10) % s.jump.length];
      return s.jump;
    }
    const speed = Math.abs(b.vel.x);
    // move gate
    if (!b.animMoving && speed > 25) b.animMoving = true;
    else if (b.animMoving && speed < 8) b.animMoving = false;
    if (b.animMoving && s.walk && s.walk.length) {
      // run gate
      if (!b.animRunning && speed > 340) b.animRunning = true;
      else if (b.animRunning && speed < 260) b.animRunning = false;
      const frames = (b.animRunning && s.run && s.run.length) ? s.run : s.walk;
      // slow run
      const stride = b.animRunning ? (s.runStride || 65) : (tired ? 70 : 40);
      const i = Math.floor(b.walkDist / stride) % frames.length;
      return frames[i];
    }
    if (s.idle && s.idle.length) {
      const i = Math.floor(b.animTime * (tired ? 1 : 2)) % s.idle.length;
      return s.idle[i];
    }
    return null;
  }

  start() {
    let last = performance.now();
    let frames = 0, fpsTime = last;
    this.fps = 0;
    const loop = (now) => {
      frames++;
      if (now - fpsTime >= 1000) { this.fps = frames; frames = 0; fpsTime = now; }
      let dt = (now - last) / 1000;
      last = now;
      dt = Math.min(dt, 1 / 30); // small steps
      this.update(dt);
      this.render();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

window.PlatformerEngine = PlatformerEngine;
