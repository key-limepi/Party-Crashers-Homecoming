// PlatformerEngine mixin: nyan rocket lifecycle, stepping, rendering and rainbow trail. Expects constants.js and engine.js loaded before it.
Object.assign(PlatformerEngine.prototype, {
  // nyan rocket, the cat itself turns into it. late joiners fast forward the climb
  addRocket(x, y, opts = {}) {
    const rk = {
      id: opts.id || null, owner: opts.owner || null, mine: !!opts.mine,
      x, y, vx: 0, vy: -200, age: 0, target: opts.target || null,
      ang: -Math.PI / 2, boomed: false, puff: 0,
    };
    const skip = Math.min(opts.age || 0, ROCKET_UP);
    for (let t = 0; t < skip; t += 1 / 60) this.stepRocket(rk, 1 / 60);
    rk.age = opts.age || 0;
    this.rockets.push(rk);
    return rk;
  },

  removeRocket(id) {
    this.rockets = this.rockets.filter((rk) => rk.id !== id);
  },

  // who the rocket chases
  _rocketTarget(rk) {
    if (!rk.target) return null;
    const t = rk.target === this.myId ? this.player : this.remotes.find((r) => r.id === rk.target);
    if (!t || t.alive === false || (t.hp ?? 1) <= 0) return null;
    return t;
  },

  // the cat that is wearing this rocket
  _rocketCarrier(rk) {
    if (rk.mine) return this.player || null;
    return this.remotes.find((r) => r.id === rk.owner) || null;
  },

  stepRocket(rk, dt) {
    rk.age += dt;
    if (rk.age < ROCKET_UP) {
      // straight up, speeding up
      const k = Math.min(1, rk.age / 0.5);
      rk.vx = 0;
      rk.vy = -(200 + (ROCKET_CLIMB - 200) * k);
    } else {
      const t = this._rocketTarget(rk);
      if (t) {
        // glide onto them, no orbiting
        const sp = Math.min(ROCKET_SPEED, 500 + (rk.age - ROCKET_UP) * 1400);
        const dx = t.pos.x + t.w / 2 - rk.x, dy = t.pos.y + t.h / 2 - rk.y;
        const d = Math.hypot(dx, dy) || 1;
        const k = 1 - Math.exp(-6 * dt);
        rk.vx += (dx / d * sp - rk.vx) * k;
        rk.vy += (dy / d * sp - rk.vy) * k;
        // closer beeps faster and higher
        const prox = Math.max(0, Math.min(1, 1 - d / 500));
        if (this.time >= (rk.beepAt || 0)) {
          rk.beepAt = this.time + 0.45 - prox * 0.37;
          if (this.onRocketHome) this.onRocketHome(rk, 0.9 + prox * 1.1);
        }
      } else {
        rk.vy += 1800 * dt; // nobody left, drop
      }
    }
    rk.x += rk.vx * dt;
    rk.y += rk.vy * dt;
    if (Math.hypot(rk.vx, rk.vy) > 30) rk.ang = Math.atan2(rk.vy, rk.vx);
  },

  // rocket is done, cat pops back out where it blew up
  _rocketLand(b) {
    b.vel.x = 0; b.vel.y = 0;
    b.onGround = false;
    b.jumps = b.maxJumps ?? 1;
    // not inside a wall please
    const stuck = () => this.statics.some((st) => aabbOverlap(b, st));
    if (!stuck()) return;
    const ox = b.pos.x, oy = b.pos.y;
    for (let r = 4; r <= 400; r += 4) {
      for (const [dx, dy] of [[0, -r], [r, -r], [-r, -r], [r, 0], [-r, 0]]) {
        b.pos.x = ox + dx; b.pos.y = oy + dy;
        if (!stuck()) return;
      }
    }
    b.pos.x = ox; b.pos.y = oy; // nothing free, collision will sort it
  },

  stepRockets(dt) {
    const me = this.player;
    const wasRocket = !!(me && me.rocketing);
    // flags get rebuilt each frame, so a vanished rocket always frees its cat
    if (me) me.rocketing = false;
    for (const r of this.remotes) { r.rocketing = false; r._rk = null; }
    if (me) me._rk = null;
    for (const rk of this.rockets) {
      if (rk.boomed) continue;
      const c = this._rocketCarrier(rk);
      const alive = c && c.alive !== false && (c.hp ?? 1) > 0;
      if (c && !alive && rk.mine) {
        // cat died mid flight, rocket goes with it
        rk.boomed = true;
        if (rk.id) this.rocketDone.add(rk.id);
        continue;
      }
      if (c && c.isRemote && !alive) { c.rocketing = false; continue; }
      if (c) {
        c.rocketing = true;
        c._rk = rk;
      }
      if (c && !rk.mine) {
        // someone else's cat, the rocket rides their synced body
        const nx = c.pos.x + c.w / 2, ny = c.pos.y + c.h / 2;
        rk.age += dt;
        const mx = nx - rk.x, my = ny - rk.y;
        if (Math.hypot(mx, my) > 1.5) {
          const want = Math.atan2(my, mx);
          let da = want - rk.ang;
          da = Math.atan2(Math.sin(da), Math.cos(da));
          rk.ang += da * (1 - Math.exp(-20 * dt));
        } else if (rk.age < ROCKET_UP) {
          rk.ang = -Math.PI / 2;
        }
        rk.x = nx; rk.y = ny;
      } else {
        this.stepRocket(rk, dt);
        if (c) {
          // my cat is the rocket
          c.pos.x = rk.x - c.w / 2;
          c.pos.y = rk.y - c.h / 2;
          c.vel.x = 0; c.vel.y = 0;
        }
      }
      // fire and smoke out the back
      rk.puff += dt * 110;
      while (rk.puff >= 1) {
        rk.puff -= 1;
        const bx = rk.x - Math.cos(rk.ang) * 28, by = rk.y - Math.sin(rk.ang) * 28;
        this.fx.push({
          kind: Math.random() < 0.45 ? 'fire' : 'smoke', x: bx + (Math.random() - 0.5) * 8, y: by + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 50, vy: (Math.random() - 0.5) * 50, age: 0,
          life: 0.35 + Math.random() * 0.3, size: 5 + Math.random() * 5, grow: 14,
        });
      }
      // only the caster calls the hit
      if (!rk.mine || !rk.id || !this.onRocketBoom) continue;
      const t = this._rocketTarget(rk);
      let boom = rk.age > ROCKET_LIFE || (!t && rk.age > ROCKET_UP + 1.2);
      if (t && rk.age > ROCKET_UP + 0.15) {
        const nx = rk.x + Math.cos(rk.ang) * ROCKET_NOSE, ny = rk.y + Math.sin(rk.ang) * ROCKET_NOSE;
        if (nx > t.pos.x - 12 && nx < t.pos.x + t.w + 12 && ny > t.pos.y - 12 && ny < t.pos.y + t.h + 12) boom = true;
      }
      if (boom) {
        rk.boomed = true;
        this.rocketDone.add(rk.id);
        if (c) { c.rocketing = false; c._rk = null; }
        this.onRocketBoom(rk);
      }
    }
    // rocket over, my cat is back
    if (me && wasRocket && !me.rocketing) this._rocketLand(me);
    this.rockets = this.rockets.filter((rk) => rk.age < ROCKET_LIFE + 4);
  },

  // rockets and the red mark on whoever they chase
  renderRockets(ctx) {
    const frames = this.rocketImgs.filter((im) => im && im.complete && im.naturalWidth);
    for (const rk of this.rockets) {
      if (rk.boomed) continue;
      const t = rk.age >= ROCKET_UP ? this._rocketTarget(rk) : null;
      if (t) {
        const pulse = 1 + Math.sin(this.time * 14) * 0.15;
        const cx = t.pos.x + t.w / 2, cy = t.pos.y + t.h / 2;
        ctx.save();
        ctx.strokeStyle = '#ff2a2a';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(cx, cy, 38 * pulse, 0, 6.2832); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - 52 * pulse, cy); ctx.lineTo(cx - 24 * pulse, cy);
        ctx.moveTo(cx + 24 * pulse, cy); ctx.lineTo(cx + 52 * pulse, cy);
        ctx.moveTo(cx, cy - 52 * pulse); ctx.lineTo(cx, cy - 24 * pulse);
        ctx.moveTo(cx, cy + 24 * pulse); ctx.lineTo(cx, cy + 52 * pulse);
        ctx.stroke();
        ctx.restore();
      }
      if (!frames.length) {
        ctx.fillStyle = '#eee';
        ctx.fillRect(rk.x - 16, rk.y - 8, 32, 16);
        continue;
      }
      const img = frames[Math.floor(this.time * 14) % frames.length];
      const w = img.naturalWidth * ROCKET_SCALE, h = img.naturalHeight * ROCKET_SCALE;
      ctx.save();
      ctx.translate(Math.round(rk.x), Math.round(rk.y));
      ctx.rotate(rk.ang);
      if (Math.cos(rk.ang) < 0) ctx.scale(1, -1); // keep the cat upright
      ctx.drawImage(img, Math.round(ROCKET_NOSE - w), Math.round(-h / 2), Math.round(w), Math.round(h));
      ctx.restore();
    }
  },

  // nyan rainbow. laid down in the world behind wherever the cat actually goes,
  // so it only exists while moving and bends along jumps, falls and the rocket
  drawTrail(ctx, b, tr, ax, ay, s) {
    const T = b._tr || (b._tr = { pts: [], lx: ax, ly: ay, n: 0 });
    // teleport or respawn, start clean
    if (Math.hypot(ax - T.lx, ay - T.ly) > 260) { T.pts.length = 0; T.lx = ax; T.ly = ay; }
    // new point every few pixels moved, nothing while standing still
    if (Math.hypot(ax - T.lx, ay - T.ly) >= TRAIL_STEP) {
      T.pts.push({ x: T.lx, y: T.ly, t: this.time, n: T.n++ });
      T.lx = ax; T.ly = ay;
    }
    // old stripes fade off the end
    while (T.pts.length && this.time - T.pts[0].t > TRAIL_LIFE) T.pts.shift();
    if (!T.pts.length) return;
    const tw = tr.naturalWidth, th = tr.naturalHeight;
    const full = th * s;
    let nx = ax, ny = ay; // walk from the cat back along its path
    for (let i = T.pts.length - 1; i >= 0; i--) {
      const q = T.pts[i];
      const len = Math.hypot(nx - q.x, ny - q.y);
      if (len < 0.5) continue;
      const age = Math.min(1, (this.time - q.t) / TRAIL_LIFE);
      const h = full * (1 - 0.45 * age * age); // thins out toward the tail
      const wave = (Math.floor(q.n / 4 + this.time * 7) % 2 === 0 ? -2 : 2) * s;
      ctx.save();
      ctx.translate(q.x, q.y);
      ctx.rotate(Math.atan2(ny - q.y, nx - q.x));
      ctx.drawImage(tr, 0, 0, tw, th, 0, Math.round(-h / 2 + wave), Math.ceil(len) + 1, Math.round(h));
      ctx.restore();
      nx = q.x; ny = q.y;
    }
  },
});
