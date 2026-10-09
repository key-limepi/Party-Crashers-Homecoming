

// bomb collider half-size
const BOMB_R = 20;
// bomb draw height
const BOMB_DH = 30;

// realistic bomb physics
const BOMB_DRAG = 0.0008; // lighter air resistance

// nyan rocket tuning
const ROCKET_UP = 1.1; // climb time
const ROCKET_CLIMB = 1500; // climb speed
const ROCKET_SPEED = 1250; // dive speed
const ROCKET_SCALE = 0.7; // art size
const ROCKET_NOSE = 40; // nose reach
const ROCKET_LIFE = 8; // give up time
const TRAIL_STEP = 4; // px between rainbow points
const TRAIL_LIFE = 0.42; // secs a stripe lives
const FX_MAX = 700; // particle cap

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
    this.left = false; this.right = false; this.jump = false; this.down = false;
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
        case 'ArrowDown': this.down = true; break;
        case 'ArrowUp': case ' ':
          if (!this.jump) this._jumpPressed = true;
          this.jump = true; break;
        case 'z': case 'Z': case 'x': case 'X': case 'c': case 'C':
        case 'v': case 'V': case 'b': case 'B':
        case 'n': case 'N':
          // evil keys
          if (!e.repeat) this._abilityPressed.push(e.key.toUpperCase());
          break;
      }
    };
    const up = (e) => {
      switch (e.key) {
        case 'ArrowLeft': this.left = false; break;
        case 'ArrowRight': this.right = false; break;
        case 'ArrowDown': this.down = false; break;
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
    this.flyGravity = opts.flyGravity ?? 700; // wings are floaty
    this.moveSpeed = opts.moveSpeed ?? 260; // walk speed
    this.jumpSpeed = opts.jumpSpeed ?? 825; // jump speed
    this.airControl = opts.airControl ?? 0.7;
    this.tossGravity = opts.tossGravity ?? 2300; // clearer bomb arcs

    this.bodies = [];
    this.statics = [];
    this.maps = { main: this.statics, inter: [] }; // two maps
    this.activeMap = 'main';
    this.remotes = []; // draw only
    this.player = null;
    this.camera = { x: 0, y: 0 };
    this.shakeT = 0; // screen shake timer
    this.shakeMag = 0; // shake size
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
    this.fly = false; // mod fly
    this.noclip = false; // mod ghost
    this.onHurt = null; // hurt hook
    this.onHeal = null; // heal hook
    this.onJump = null; // jump hook
    this.onDeath = null; // death hook
    this.onCounter = null; // counter hook
    this.onSpikeTrip = null; // trip hook
    this.cameraTarget = null; // watch target
    this.spikes = []; // trap list
    this.spikeImg = null; // spike art
    this.bombs = []; // tails traps
    this.onBombTrip = null; // bomb hook
    this.tosses = []; // bomb arcs
    this.onTossLand = null; // land hook
    this.onFlyLand = null; // touchdown hook
    this.booms = []; // boom pops
    this.boomImg = null; // boom art
    this.rockets = []; // nyan rockets
    this.rocketDone = new Set(); // ended ids, never respawn them from a late poll
    this.rocketImgs = []; // rocket frames
    this.onRocketBoom = null; // rocket hook
    this.onRocketHome = null; // homing hook
    this.myId = null; // my net id
    this.fx = []; // blast particles
    this.bombImg = null; // bomb art
    this.springs = []; // bounce pads
    this.onSpring = null; // bounce hook
    this.alertArrow = null; // ping arrow
    this.alerts = []; // ping list
    this.afterimages = []; // ghosts
    this.bubbles = {}; // chat bubbles
    this.chatBubbleImg = null; // bubble art
    this.showAlerts = false;
    this.sneakArrows = false; // ghost tracks
    this.seeInvis = false; // see ghosts
    this.damageOn = true; // safe rounds
    
    this.pullSrc = null; // drag point
    this.peelSrc = null; // ride point
    this.liftSrc = null; // tails carry point
    this.pullLinks = []; // rope lines
    this.debug = false; // debug view
    this.levelArt = null; // level art
    this.levelBounds = null; // level size
    this.levelBackdrop = null; // level backdrop
    this.mapFall = { main: this.fallY, inter: this.fallY }; // fall lines
    this.mapBg = { main: this.background, inter: this.background }; // sky colors
  }

  // traced level
  loadLevel(level, art, opts = {}) {
    for (const [x, y, w, h] of level.rects) this.addPlatform(x, y, w, h, '#000');
    // stay inside
    this.addPlatform(-200, -1500, 200, level.h + 3000, '#000'); // left wall
    this.addPlatform(level.w, -1500, 200, level.h + 3000, '#000'); // right wall
    this.addPlatform(-200, -1700, level.w + 400, 200, '#000'); // ceiling
    this.levelArt = art;
    this.levelBackdrop = opts.backdrop || null;
    this.levelBounds = { w: level.w, h: level.h };
    this.mapFall.main = level.h + 600;
    if (opts.background) this.mapBg.main = opts.background;
    if (this.activeMap === 'main') { this.fallY = this.mapFall.main; this.background = this.mapBg.main; }
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
    if (p.rocketing) return; // rocket form can't be hurt
    // soften hits
    if (source !== 'killer' && this.lmsResist && !p.evil) n = Math.ceil(n * 0.75);
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
    p._justJumped = false;
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

  // bounce pads
  addSpring(x, y, power, img, map = 'main') {
    const sp = { x, y, w: 46, h: 26, power, img, cd: 0, map };
    this.springs.push(sp);
    return sp;
  }

  // bomb toss arc
  addToss(x, y, vx, vy, img, id = null, throwerId = null) {
    // collides with walls
    const b = new Body(x - BOMB_R, y - BOMB_R, BOMB_R * 2, BOMB_R * 2, { color: '#333' });
    b.vel.x = vx; b.vel.y = vy;
    const t = { 
      body: b, 
      x, y, 
      age: 0, 
      landed: false, 
      img, 
      id,
      throwerId, // thrower sync id
      // for arc visualization
      startX: x,
      startY: y,
      startVx: vx,
      startVy: vy,
      arcPoints: [], // precomputed arc for rendering
    };
    this.tosses.push(t);
    if (this.tosses.length > 8) this.tosses.shift();
    return t;
  }

  // toss physics with drag
  stepTosses(dt) {
    for (const t of this.tosses) {
      t.age += dt;
      if (t.landed) continue;
      const b = t.body;
      
      // Apply gravity
      b.vel.y += this.tossGravity * dt;
      
      // Air drag reduces velocity
      const speed = Math.hypot(b.vel.x, b.vel.y);
      if (speed > 0) {
        const dragForce = BOMB_DRAG * speed * speed;
        const dragX = -dragForce * (b.vel.x / speed);
        const dragY = -dragForce * (b.vel.y / speed);
        b.vel.x += dragX * dt;
        b.vel.y += dragY * dt;
      }
      
      b.onGround = false;
      this.moveBody(b, dt, this.statics); // walls and floors
      t.x = b.pos.x + b.w / 2;
      t.y = b.pos.y + b.h / 2;
      // spring bounce, keeps its speed
      if (b.vel.y > 0 && !b.onGround) {
        const bcx = b.pos.x + b.w / 2, feet = b.pos.y + b.h;
        for (const sp of this.springs) {
          if (sp.map !== this.activeMap || sp.cd > this.time) continue;
          if (Math.abs(bcx - (sp.x + sp.w / 2)) < (b.w + sp.w) / 2 &&
              feet > sp.y + 4 && feet < sp.y + sp.h + 14) {
            sp.cd = this.time + 6;
            b.vel.y = -sp.power;
            t.x = b.pos.x + b.w / 2;
            t.y = b.pos.y + b.h / 2;
            if (this.onTossBounce) this.onTossBounce(t);
            break;
          }
        }
      }
      if (b.onGround) {
        t.landed = true;
        t.groundY = b.pos.y + b.h; // surface under it
        if (this.onTossLand) this.onTossLand(t);
      } else if (b.pos.y > this.fallY) {
        t.landed = true;
        t.dead = true; // sailed off
      }
    }
    // midair hits
    const flying = this.tosses.filter((t) => !t.landed && !t.dead);
    for (let i = 0; i < flying.length; i++) {
      for (let j = i + 1; j < flying.length; j++) {
        const a = flying[i], c = flying[j];
        if (Math.abs(a.x - c.x) < 30 && Math.abs(a.y - c.y) < 30) {
          a.landed = true; a.dead = true;
          c.landed = true; c.dead = true;
          this.addBoom((a.x + c.x) / 2, (a.y + c.y) / 2);
          if (this.onTossBoom) this.onTossBoom(a, c);
        }
      }
    }
    this.tosses = this.tosses.filter((t) => !(t.landed && t.age > 0.6));
  }

  // compute arc for drawing
  computeArc(t, maxTime = 3.0, step = 0.05) {
    if (t.arcPoints && t.arcPoints.length > 0) return t.arcPoints;
    
    const points = [];
    let x = t.startX;
    let y = t.startY;
    let vx = t.startVx;
    let vy = t.startVy;
    
    for (let time = 0; time < maxTime; time += step) {
      points.push({ x, y });
      
      // Apply gravity
      vy += this.tossGravity * step;
      
      // Apply drag
      const speed = Math.hypot(vx, vy);
      if (speed > 0) {
        const dragForce = BOMB_DRAG * speed * speed;
        vx -= dragForce * (vx / speed) * step;
        vy -= dragForce * (vy / speed) * step;
      }
      
      x += vx * step;
      y += vy * step;
      
      // Stop if hit ground
      if (y > this.fallY) break;
    }
    
    t.arcPoints = points;
    return points;
  }

  // bomb pop
  addBoom(x, y, scale = 1) {
    // fresh img per boom
    let img = null;
    const b = { x, y, age: 0, scale, img, loaded: false };
    if (this.boomImg && this.boomImg.src) {
      img = new Image();
      img.src = this.boomImg.src;
      img.style.position = 'fixed'; img.style.visibility = 'hidden'; img.style.left = '-9999px';
      document.body.appendChild(img); // needs DOM attachment
      img.onload = () => { b.loaded = true; b.age = 0; }; // starts on first paint
      b.img = img;
      b.node = img; // for later removal
    }
    this.booms.push(b);
    if (this.booms.length > 12) this.booms.shift(); // trim spares
    return this.booms[this.booms.length - 1];
  }

  // screen shake, bigger wins
  shake(mag, dur) {
    const cur = this.shakeT > 0 ? this.shakeMag * Math.min(1, this.shakeT * 3) : 0;
    if (mag < cur) return;
    this.shakeMag = mag;
    this.shakeT = Math.max(this.shakeT, dur);
  }

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
  }
  removeRocket(id) {
    this.rockets = this.rockets.filter((rk) => rk.id !== id);
  }
  // who the rocket chases
  _rocketTarget(rk) {
    if (!rk.target) return null;
    const t = rk.target === this.myId ? this.player : this.remotes.find((r) => r.id === rk.target);
    if (!t || t.alive === false || (t.hp ?? 1) <= 0) return null;
    return t;
  }
  // the cat that is wearing this rocket
  _rocketCarrier(rk) {
    if (rk.mine) return this.player || null;
    return this.remotes.find((r) => r.id === rk.owner) || null;
  }
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
  }
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
  }
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
  }

  // big blast, all drawn in code
  addBlast(x, y, scale = 1) {
    const add = (o) => this.fx.push(Object.assign({ x, y, vx: 0, vy: 0, age: 0, life: 1, size: 10, grow: 0, drag: 0, grav: 0 }, o));
    add({ kind: 'flash', life: 0.35, size: 260 * scale });
    add({ kind: 'ring', life: 0.55, size: 20, grow: 700 * scale });
    add({ kind: 'ring', life: 0.8, size: 10, grow: 480 * scale, color: '#ffd23f' });
    for (let i = 0; i < 16; i++) {
      // fireball core
      const a = Math.random() * Math.PI * 2, s = Math.random() * 190 * scale;
      add({ kind: 'fire', vx: Math.cos(a) * s, vy: Math.sin(a) * s - 40, life: 0.5 + Math.random() * 0.45, size: (26 + Math.random() * 26) * scale, grow: 70 * scale, drag: 2.2 });
    }
    for (let i = 0; i < 34; i++) {
      const a = Math.random() * Math.PI * 2, s = (60 + Math.random() * 360) * scale;
      add({ kind: 'fire', vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.35 + Math.random() * 0.5, size: (8 + Math.random() * 14) * scale, grow: 25, drag: 2.6 });
    }
    for (let i = 0; i < 28; i++) {
      // dark smoke, drifts up
      const a = Math.random() * Math.PI * 2, s = Math.random() * 150 * scale;
      add({ kind: 'smoke', vx: Math.cos(a) * s, vy: Math.sin(a) * s - 90, life: 1.1 + Math.random() * 0.9, size: (18 + Math.random() * 20) * scale, grow: 36 * scale, drag: 1.6, grav: -40 });
    }
    for (let i = 0; i < 80; i++) {
      // flying sparks
      const a = Math.random() * Math.PI * 2, s = (250 + Math.random() * 850) * scale;
      add({ kind: 'spark', vx: Math.cos(a) * s, vy: Math.sin(a) * s - 120, life: 0.4 + Math.random() * 0.7, size: 2 + Math.random() * 2, drag: 1.4, grav: 900 });
    }
    for (let i = 0; i < 44; i++) {
      // nyan confetti
      const a = Math.random() * Math.PI * 2, s = (120 + Math.random() * 520) * scale;
      add({ kind: 'confetti', vx: Math.cos(a) * s, vy: Math.sin(a) * s - 200, life: 0.9 + Math.random() * 0.9, size: 4 + Math.random() * 4, drag: 1.2, grav: 700, hue: Math.floor(Math.random() * 6) * 60, spin: Math.random() * 6.28 });
    }
    if (this.fx.length > FX_MAX) this.fx.splice(0, this.fx.length - FX_MAX);
  }
  stepFx(dt) {
    for (const f of this.fx) {
      f.age += dt;
      if (f.drag) { const k = Math.exp(-f.drag * dt); f.vx *= k; f.vy *= k; }
      if (f.grav) f.vy += f.grav * dt;
      f.x += f.vx * dt; f.y += f.vy * dt;
      if (f.grow) f.size += f.grow * dt;
    }
    this.fx = this.fx.filter((f) => f.age < f.life);
  }
  renderFx(ctx) {
    for (const f of this.fx) {
      const t = f.age / f.life;
      ctx.save();
      if (f.kind === 'flash') {
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size);
        g.addColorStop(0, 'rgba(255,255,240,1)');
        g.addColorStop(0.35, 'rgba(255,220,120,0.7)');
        g.addColorStop(1, 'rgba(255,120,0,0)');
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 1 - t;
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.size, 0, 6.2832); ctx.fill();
      } else if (f.kind === 'ring') {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = (1 - t) * 0.9;
        ctx.strokeStyle = f.color || '#ffffff';
        ctx.lineWidth = 8 * (1 - t) + 1;
        ctx.beginPath(); ctx.arc(f.x, f.y, f.size, 0, 6.2832); ctx.stroke();
      } else if (f.kind === 'fire') {
        // white hot, then yellow, orange, red
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = Math.max(0, 1 - t) * 0.85;
        const fireColor = f.color || (t < 0.2 ? '#fff6c8' : t < 0.45 ? '#ffd23f' : t < 0.75 ? '#ff7a1a' : '#c2260c');
        ctx.fillStyle = fireColor;
        ctx.beginPath(); ctx.arc(f.x, f.y, Math.max(1, f.size * (1 - t * 0.35)), 0, 6.2832); ctx.fill();
      } else if (f.kind === 'splat') {
        const radius = Math.max(1, f.size * (1 - t * 0.3));
        ctx.globalAlpha = Math.max(0, 1 - t);
        ctx.translate(f.x, f.y);
        ctx.rotate((f.spin || 0) * f.age);
        const points = Array.from({ length: 12 }, (_, i) => {
          const angle = i / 12 * 6.2832;
          const lobe = i % 2 ? 0.62 : 1;
          const wobble = 0.88 + 0.12 * Math.sin(i * 3.7 + (f.seed || 0));
          return { x: Math.cos(angle) * radius * lobe * wobble, y: Math.sin(angle) * radius * lobe * wobble };
        });
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
        ctx.closePath();
        ctx.fillStyle = f.color || '#249bff';
        ctx.strokeStyle = f.outline || '#12324f';
        ctx.lineWidth = Math.max(1.5, radius * 0.2);
        ctx.lineJoin = 'round';
        ctx.fill(); ctx.stroke();
      } else if (f.kind === 'smoke') {
        ctx.globalAlpha = Math.max(0, (1 - t)) * 0.55;
        ctx.fillStyle = t < 0.3 ? '#4a4a52' : '#2b2b31';
        ctx.beginPath(); ctx.arc(f.x, f.y, f.size, 0, 6.2832); ctx.fill();
      } else if (f.kind === 'spark') {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 1 - t;
        ctx.strokeStyle = t < 0.4 ? '#fff2a8' : '#ff9a2a';
        ctx.lineWidth = f.size;
        ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x - f.vx * 0.035, f.y - f.vy * 0.035); ctx.stroke();
      } else if (f.kind === 'confetti') {
        ctx.globalAlpha = Math.min(1, (1 - t) * 2);
        ctx.translate(f.x, f.y);
        ctx.rotate(f.spin + f.age * 9);
        ctx.fillStyle = `hsl(${f.hue}, 100%, 55%)`;
        ctx.fillRect(-f.size / 2, -f.size / 2, f.size, f.size * 0.6);
      }
      ctx.restore();
    }
  }
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
  }

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
  }

  // swap maps
  switchMap(name, spawnX, spawnY) {
    this.activeMap = name;
    this.statics = this.maps[name];
    this.fallY = this.mapFall[name] ?? this.fallY;
    this.background = this.mapBg[name] ?? this.background;
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
    if (this.noclip && b === this.player) {
      b.pos.x += b.vel.x * dt;
      b.pos.y += b.vel.y * dt;
      b.onGround = false;
      return;
    }
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
        // small steps
        const rise = b.bottom - s.top;
        if (b.vel.y >= 0 && (b.wasGround || b.onGround) && rise > 0 && rise <= 12) {
          const oy = b.pos.y;
          b.pos.y = s.pos.y - b.h;
          let clear = true;
          for (const o of statics) { if (o !== s && aabbOverlap(b, o)) { clear = false; break; } }
          if (clear) { b.onGround = true; continue; }
          b.pos.y = oy;
        }
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
    if (p && p.rocketing) {
      // the cat is the rocket, stepRockets drives the body
      p.vel.x = 0; p.vel.y = 0;
      p.onGround = false; p.wasGround = false;
      p.stunT = 0; p.chargeDir = 0; p.cowerT = 0; p.cowering = false;
      p.pulled = false;
      p.animTime += dt;
      this.input.consumeJumpPressed(); // drop inputs
    }
    if (p && !p.rocketing) {
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

      // mod fly
      const canFly = this.fly && p.alive !== false;
      if (canFly) {
        const fs = this.moveSpeed * 1.6;
        p.vel.x = ax * fs;
        p.vel.y = this.input.jump ? -fs : this.input.down ? fs : 0;
        p.onGround = false;
        p.jumps = p.maxJumps ?? 1;
      } else if (p.taxiFly && p.alive !== false) {
        // tap to flap
        const fs = this.moveSpeed * 1.6;
        const flap = fs * 1.05; // one tap of lift
        const sinkMax = fs * 1.25;
        p.vel.x = ax * fs;
        if (this.input.consumeJumpPressed()) p.vel.y = -flap; // single flap
        else {
          p.vel.y += this.flyGravity * dt; // floaty sink
          if (p.vel.y > sinkMax) p.vel.y = sinkMax;
        }
        p.onGround = false;
        p.jumps = p.maxJumps ?? 1;
      } else if (p.superFly && p.alive !== false) {
        // tap climbs, steer otherwise
        if (this.input.consumeJumpPressed()) p.vel.y = -620; // flap up
        else p.vel.y += this.gravity * dt; // normal sink
        p.jumps = p.maxJumps ?? 1;
      } else {
        p.vel.y += this.gravity * dt;
      }

      if (p.onGround) p.jumps = p.maxJumps ?? 1; // feet reset
      if (!noJump && !this.fly && !p.taxiFly && !p.superFly && this.input.consumeJumpPressed()) {
        // weak jumps
        const hop = this.jumpSpeed * (1 - 0.5 * fat);
        if (p.onGround) {
          p.vel.y = -hop;
          p.onGround = false;
          p.jumps = (p.maxJumps ?? 1) - 1;
          if (!p.evil) p.fatigue = Math.min(1, (p.fatigue || 0) + 0.15);
          p.lastJumpT = this.time;
          p._justJumped = true;
          if (this.onJump) this.onJump(false);
        } else if ((p.jumps ?? 0) > 0) {
          p.jumps--; // use jump
          p.vel.y = -hop;
          if (!p.evil) p.fatigue = Math.min(1, (p.fatigue || 0) + 0.15);
          p.lastJumpT = this.time;
          p._justJumped = true;
          if (this.onJump) this.onJump(true);
        }
      } else {
        this.input.consumeJumpPressed(); // drop inputs
      }
      // cap short hops
      if (!p.taxiFly && !p.superFly && !this.input.jump && p.vel.y < -260 && this.time > (p.noCutUntil || 0)) p.vel.y = -260;
    }

    // move bodies
    for (const b of this.bodies) {
      if (b.isStatic) continue;
      if (b === p && p.rocketing) continue; // rocket flies through everything
      b.wasGround = b.onGround;
      b.onGround = false;
      this.moveBody(b, dt, this.statics); // tunnel-safe push
      // clear justJumped on landing
      if (!b.wasGround && b.onGround) b._justJumped = false;
      // wings end on touchdown
      if (b === p && p.taxiFly && b.onGround) {
        p.taxiFly = false;
        if (this.onFlyLand) this.onFlyLand(p);
      }
    }

    // drag close
    p.pulled = false;
    if (p && !p.rocketing && this.pullSrc && p.alive !== false && !p.evil) {
      const dx = this.pullSrc.x - (p.pos.x + p.w / 2);
      const dy = this.pullSrc.y - (p.pos.y + p.h / 2);
      const d = Math.hypot(dx, dy) || 1;
      const pull = 450 * dt;
      p.pos.x += (dx / d) * pull;
      p.pos.y += (dy / d) * pull;
      p.pulled = true; // dragged pose
    }
    // ride sonic
    if (p && !p.rocketing && this.peelSrc && p.alive !== false && !p.evil) {
      p.pos.x = this.peelSrc.x - p.w / 2;
      p.pos.y = this.peelSrc.y - p.h / 2;
      p.pulled = true; // dragged pose
    }
    // ride tails
    if (p && !p.rocketing && this.liftSrc && p.alive !== false && !p.evil) {
      p.pos.x = this.liftSrc.x - p.w / 2;
      p.pos.y = this.liftSrc.y - p.h / 2;
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
    if (p && !p.rocketing && p.alive !== false && !p.evil && p.onGround && this.damageOn !== false) {
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

    // bomb bites
    if (p && p.alive !== false && p.evil && p.onGround && this.damageOn !== false) {
      const cx = p.pos.x + p.w / 2, feet = p.pos.y + p.h;
      for (const bb of this.bombs) {
        if (bb.used) continue;
        if (Math.abs(cx - bb.x) < 34 && feet > bb.y - 40 && feet < bb.y + 8) {
          bb.used = true;
          if (this.onBombTrip) this.onBombTrip(bb);
          break;
        }
      }
    }

    // spring pads
    if (p && !p.rocketing && p.alive !== false && (p.vel.y >= 0 || p.onGround)) {
      const cx = p.pos.x + p.w / 2, feet = p.pos.y + p.h;
      for (const sp of this.springs) {
        if (sp.map !== this.activeMap) continue;
        if (sp.cd > this.time) continue;
        if (Math.abs(cx - (sp.x + sp.w / 2)) < (p.w + sp.w) / 2 &&
            feet > sp.y + 6 && feet < sp.y + sp.h + 14) {
          sp.cd = this.time + 6;
          p.pos.y = sp.y + 6 - p.h;
          p.vel.y = -sp.power;
          p.noCutUntil = this.time + 0.6;
          p.onGround = false;
          p.jumps = p.maxJumps ?? 1;
          if (this.onSpring) this.onSpring(sp);
          break;
        }
      }
    }

    // ground math
    if (p && p.onGround) p.walkDist += Math.abs(p.vel.x) * dt;

    // fade ghosts
    for (const g of this.afterimages) g.age += dt;
    this.afterimages = this.afterimages.filter((g) => g.age < 0.4);

    // boom pops
    for (const b of this.booms) b.age += dt;
    this.booms = this.booms.filter((b) => {
        const keep = b.age < 1.8;
        if (!keep && b.node) { b.node.remove(); b.node = null; }
        return keep;
      });

    // toss arcs
    this.stepTosses(dt);

    // nyan rockets and blast bits
    this.stepRockets(dt);
    this.stepFx(dt);

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
    if (p && !p.rocketing && p.pos.y > this.fallY && this.damageOn !== false) {
      this.hurtPlayer(this.fallDamage);
      if (p.hp > 0) this.respawn(); // spawn back
    }

    if (this.followPlayer && p) {
      const t = this.cameraTarget || p; // watch who
      this.camera.x = t.pos.x + t.w / 2 - this.width / 2;
      this.camera.y = t.pos.y + t.h / 2 - this.height / 2;      if (this.levelBounds && this.activeMap === 'main') { // stay inside
        this.camera.x = Math.max(0, Math.min(this.levelBounds.w - this.width, this.camera.x));
        this.camera.y = Math.max(0, Math.min(this.levelBounds.h - this.height, this.camera.y));
      }
    }
    if (this.shakeT > 0) this.shakeT -= dt; // shake decays

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
    if (this.shakeT > 0) {
      // rumble
      const m = this.shakeMag * Math.min(1, this.shakeT * 3);
      ctx.translate((Math.random() * 2 - 1) * m, (Math.random() * 2 - 1) * m);
    }

    if (this.levelArt && this.levelArt.complete && this.activeMap === 'main') {
      const cx = Math.max(0, Math.round(this.camera.x)), cy = Math.max(0, Math.round(this.camera.y));
      const sw = Math.min(this.width + 2, this.levelArt.width - cx), sh = Math.min(this.height + 2, this.levelArt.height - cy);
      if (sw > 0 && sh > 0) {
        const bd = this.levelBackdrop;
        const lb = this.levelBounds;
        if (bd && bd.complete && bd.naturalWidth && lb) ctx.drawImage(bd, 0, 0, bd.naturalWidth, bd.naturalHeight, 0, 0, lb.w, lb.h);
        ctx.drawImage(this.levelArt, cx, cy, sw, sh, cx, cy, sw, sh);
      }
    } else {
      for (const s of this.statics) {
        ctx.fillStyle = s.color;
        ctx.fillRect(s.pos.x, s.pos.y, s.w, s.h);
      }
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
    // bomb art
    for (const bb of this.bombs) {
      if (bb.used) continue;
      const bi = bb.img || this.bombImg;
      if (bi && bi.complete && bi.naturalWidth) {
        this.drawContent(ctx, bi, bb.x, bb.y, BOMB_DH);
      } else {
        ctx.fillStyle = '#333';
        ctx.fillRect(bb.x - BOMB_DH / 2, bb.y - BOMB_DH, BOMB_DH, BOMB_DH);
      }
    }
    // toss arcs
    for (const t of this.tosses) {
      if (t.dead) continue;
      const ti = t.img || this.bombImg;
      if (ti && ti.complete && ti.naturalWidth) this.drawContent(ctx, ti, Math.round(t.x), Math.round(t.y + BOMB_R), BOMB_DH);
      else { ctx.fillStyle = '#333'; ctx.fillRect(Math.round(t.x) - BOMB_R, Math.round(t.y) - BOMB_R, BOMB_R * 2, BOMB_R * 2); }
    }
    // boom pops
    for (const b of this.booms) {
      const img = b.img || this.boomImg;
      ctx.save();
      if (img && img.complete && img.naturalWidth) {
        const dw = Math.round(img.naturalWidth * 0.5), dh = Math.round(img.naturalHeight * 0.5);
        ctx.drawImage(img, Math.round(b.x - dw / 2), Math.round(b.y - dh / 2), dw, dh);
      } // no fallback needed
      ctx.restore();
    }
    // spring art
    for (const sp of this.springs) {
      if (sp.map !== this.activeMap) continue;
      const dim = sp.cd > this.time;
      if (sp.img && sp.img.complete && sp.img.naturalWidth) {
        ctx.save();
        if (dim) ctx.globalAlpha = 0.4;
        ctx.drawImage(sp.img, Math.round(sp.x), Math.round(sp.y), sp.w, sp.h);
        ctx.restore();
      } else {
        ctx.fillStyle = dim ? '#555' : '#0f0';
        ctx.fillRect(sp.x, sp.y, sp.w, sp.h);
      }
    }
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
      if (b.visible === false) continue;
      if (b.isRemote && b.alive === false) continue;
      if (b.isRemote && b.invis && !this.seeInvis) continue;
      const img = this._spriteFor(b);
      if (img && img.complete && img.naturalWidth) {
        // cower shake
        const scare = (b.cowering || b.tremble) ? Math.floor(Math.random() * 3) - 1 : 0;
        const fs = this.frameSize(b, img);
        const scaleX = b.char === 'bear5' ? (b.bearDrawScaleX || 1) : 1;
        const scaleY = b.char === 'bear5' ? (b.bearDrawScaleY || 1) : 1;
        const dw = Math.max(1, Math.round(fs.dw * scaleX));
        const dh = Math.max(1, Math.round(fs.dh * scaleY));
        // use visual center
        const box = this.contentBox(img);
        let offsetX = 0;
        if (box) {
          const base = this.baseFrame(b);
          const scale = (base ? (b.drawH || b.h) / base.h : 1) * scaleX;
          // content box center
          const contentCenterX = box.x + box.w / 2;
          // full image center
          const fullCenterX = img.naturalWidth / 2;
          offsetX = Math.round((contentCenterX - fullCenterX) * scale);
        }
        const dx = Math.round(b.pos.x + (b.w - dw) / 2) + offsetX + scare;
        const dy = Math.round(b.pos.y + (b.h - dh)); // align feet
        const cx = Math.round(b.pos.x + b.w / 2) + offsetX;
        // rainbow, tied to where the cat really moves
        const trail = b.sprites && b.sprites.trail;
        if (trail && trail.complete && trail.naturalWidth) {
          if (b.rocketing && b._rk) {
            // rocket form, rainbow streams from the tail
            const rk = b._rk;
            this.drawTrail(ctx, b, trail, rk.x - Math.cos(rk.ang) * 40, rk.y - Math.sin(rk.ang) * 40, 0.8);
          } else if (!b.rocketing) {
            const s = dw / img.naturalWidth; // frame scale
            const x0 = dx + 15 * s; // starts inside the pop tart
            const ax = b.facing < 0 ? 2 * cx - x0 : x0; // flip with the cat
            this.drawTrail(ctx, b, trail, ax, dy + 3 * s + trail.naturalHeight * s / 2, s);
          }
        } else if (b._tr) {
          b._tr.pts.length = 0;
        }
        // the cat is the rocket right now, renderRockets draws that
        if (!b.rocketing) {
          ctx.save();
          if (b === this.player && b.invis) ctx.globalAlpha = 0.45;
          else if (b.isRemote && b.away) ctx.globalAlpha = 0.5;
          if (b.facing < 0) {
            ctx.translate(cx, 0);
            ctx.scale(-1, 1);
            ctx.translate(-cx, 0);
          }
          // windup strobes
          const strobe = Math.floor(this.time * 10) % 2 === 0;
          const tinted = (b.whiteFlash && strobe) ? this._whiteTint(img)
            : (b.redFlash && strobe) ? this._redTint(img)
            : (b.cyanFlash && strobe) ? this._cyanTint(img) : img;
          if (b.char === 'bear5' && b.bearFold > 0.02) {
            this.drawBearFold(ctx, tinted, img, dx, dy, dw, dh, b.bearFold, b.bearFoldX, b.bearFoldY, b.bearFoldReach);
          } else if (b.char === 'bear5' && b.bearDrawAngle) {
            ctx.save();
            ctx.translate(cx, dy + dh);
            ctx.rotate(b.bearDrawAngle);
            ctx.translate(-cx, -(dy + dh));
            this.blit(ctx, tinted, img, dx, dy, dw, dh);
            ctx.restore();
          } else {
            this.blit(ctx, tinted, img, dx, dy, dw, dh);
          }
          if (b.pulseWhite) {
            // stepped white pulse
            const levels = [0.08, 0.24, 0.42, 0.6];
            ctx.save();
            ctx.globalAlpha = levels[Math.floor(this.time * 8) % levels.length];
            this.blit(ctx, this._whiteTint(img), img, dx, dy, dw, dh);
            ctx.restore();
          }
          ctx.restore();
        }
        // held bomb, carry frames miss it
        if (b.holdingBomb && !b.rocketing) {
          const bi = this.bombImg;
          if (bi && bi.complete && bi.naturalWidth) {
            const hx = cx + (b.facing || 1) * dw * 0.35;
            this.drawContent(ctx, bi, Math.round(hx), Math.round(dy + dh * 0.55), BOMB_DH);
          }
        }
      } else {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.pos.x, b.pos.y, b.w, b.h);
        // fallback char initial
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const initial = (b.name || '?')[0].toUpperCase();
        ctx.fillText(initial, b.pos.x + b.w / 2, b.pos.y + b.h / 2);
      }
      // ghost meter
      if (b === this.player && (b.sneakFrac || 0) > 0) {
        const frac = Math.min(1, b.sneakFrac);
        const bx0 = Math.round(b.pos.x) - 10, by0 = Math.round(b.pos.y);
        const bh = Math.round(40 * frac);
        ctx.fillStyle = '#000';
        ctx.fillRect(bx0 - 1, by0 - 1, 6, 42);
        ctx.fillStyle = b.sneakColor || '#c084fc';
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
        if (b.rainbow) {
          // super bar
          const segs = 6, base = Math.floor(this.time * 200) % 360;
          for (let i = 0; i < segs; i++) {
            ctx.fillStyle = `hsl(${(base + i * 60) % 360}, 100%, 55%)`;
            ctx.fillRect(bx + (bw * frac * i) / segs, by, (bw * frac) / segs + 0.5, bh);
          }
        } else ctx.fillStyle = (b.hp ?? 100) <= 30 ? '#8e0000' // low health
          : frac > 0.5 ? '#2ed573' : frac > 0.25 ? '#ffa502' : '#8e0000';
        if (!b.rainbow) ctx.fillRect(bx, by, bw * frac, bh);
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
      // use visual center
      const box = this.contentBox(g.img);
      let offsetX = 0;
      if (box) {
        const baseH = g.drawH || g.h;
        const scale = baseH / g.img.naturalHeight;
        const contentCenterX = box.x + box.w / 2;
        const fullCenterX = g.img.naturalWidth / 2;
        offsetX = Math.round((contentCenterX - fullCenterX) * scale);
      }
      const cx = Math.round(g.x + g.w / 2) + offsetX;
      if (g.facing < 0) {
        ctx.translate(cx, 0);
        ctx.scale(-1, 1);
        ctx.translate(-cx, 0);
      }
      const dw = g.drawW || g.w, dh = g.drawH || g.h;
      const gx = Math.round(g.x + (g.w - dw) / 2) + offsetX;
      const gy = Math.round(g.y + (g.h - dh));
      this.blit(ctx, g.plain ? g.img : this._cyanTint(g.img), g.img, gx, gy, dw, dh);
      ctx.restore();
    }
    // rockets, then the blast over everything
    this.renderRockets(ctx);
    this.renderFx(ctx);
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
  // hero tint
  _whiteTint(img) {
    if (!img._whiteTint) {
      const t = document.createElement('canvas');
      t.width = img.naturalWidth || img.width;
      t.height = img.naturalHeight || img.height;
      const c = t.getContext('2d');
      c.drawImage(img, 0, 0);
      c.globalCompositeOperation = 'source-atop';
      c.fillStyle = 'rgba(255, 255, 255, 0.9)';
      c.fillRect(0, 0, t.width, t.height);
      img._whiteTint = t;
    }
    return img._whiteTint;
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

  // steady center
  anchorW(b) {
    const s = b.sprites;
    if (!s) return b.drawW || b.w;
    const base = this.baseFrame(b);
    const dh = b.drawH || b.h;
    const scale = base ? dh / base.h : 1;
    let mw = 0;
    for (const k of ['idle', 'walk', 'run', 'jump']) {
      const v = s[k];
      const arr = Array.isArray(v) ? v : (v ? [v] : []);
      for (const im of arr) {
        if (im && im.naturalWidth) mw = Math.max(mw, im.naturalWidth * scale);
      }
    }
    return Math.max(1, Math.round(mw)) || (b.drawW || b.w);
  }

  // crop feet
  blit(ctx, tinted, img, dx, dy, dw, dh) {
    const nw = img.naturalWidth || img.width, nh = img.naturalHeight || img.height;
    if (!nw || !nh || dw <= 0 || dh <= 0) return;
    const sh = Math.max(1, nh - this.trimB(img));
    ctx.drawImage(tinted, 0, 0, nw, sh, dx, dy, dw, dh);
  }

  drawBearFold(ctx, tinted, img, dx, dy, dw, dh, fold, towardX, towardY, reach) {
    const nw = img.naturalWidth || img.width, nh = img.naturalHeight || img.height;
    const sourceHeight = Math.max(1, nh - this.trimB(img));
    const strips = 12;
    for (let i = 0; i < strips; i++) {
      const top = i / strips, bottom = (i + 1) / strips;
      const sourceTop = Math.floor(sourceHeight * top);
      const sourceBottom = Math.min(sourceHeight, Math.ceil(sourceHeight * bottom));
      const centerFromFeet = 1 - (top + bottom) / 2;
      const angle = fold * (0.7 + centerFromFeet * 2.5) * Math.PI;
      const cosine = Math.cos(angle);
      const widthScale = 0.14 + 0.86 * Math.abs(cosine);
      const stripWidth = dw * widthScale;
      const bend = (towardX * 58 + towardY * 24) * (reach || 0) * centerFromFeet ** 1.35 * fold;
      const centerX = dx + dw / 2 + bend;
      const stripTop = dy + dh * top;
      const stripHeight = dh * (bottom - top) + 1;
      ctx.save();
      ctx.translate(centerX, stripTop);
      if (cosine < 0) ctx.scale(-1, 1);
      ctx.drawImage(tinted, 0, sourceTop, nw, sourceBottom - sourceTop, -stripWidth / 2, 0, stripWidth, stripHeight);
      ctx.restore();
    }
  }

  // content feet
  trimB(img) {
    if (img._trimB === undefined) {
      let t = 0;
      try {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth; c.height = img.naturalHeight;
        const g = c.getContext('2d', { willReadFrequently: true });
        g.drawImage(img, 0, 0);
        const d = g.getImageData(0, 0, c.width, c.height).data;
        outer:
        for (let y = c.height - 1; y >= 0; y--) {
          for (let x = 0; x < c.width; x++) {
            if (d[(y * c.width + x) * 4 + 3] > 8) break outer;
          }
          t++;
        }
      } catch (e) { t = 0; }
      img._trimB = t;
    }
    return img._trimB;
  }

  // get opaque box
  contentBox(img) {
    if (img._cbox !== undefined) return img._cbox;
    let box = null;
    const nw = img.naturalWidth || img.width, nh = img.naturalHeight || img.height;
    try {
      const c = document.createElement('canvas');
      c.width = nw; c.height = nh;
      const g = c.getContext('2d', { willReadFrequently: true });
      g.drawImage(img, 0, 0);
      const d = g.getImageData(0, 0, nw, nh).data;
      let top = nh, bot = -1, left = nw, right = -1;
      for (let y = 0; y < nh; y++) {
        for (let x = 0; x < nw; x++) {
          if (d[(y * nw + x) * 4 + 3] > 8) {
            if (y < top) top = y;
            if (y > bot) bot = y;
            if (x < left) left = x;
            if (x > right) right = x;
          }
        }
      }
      if (bot >= top) box = { x: left, y: top, w: right - left + 1, h: bot - top + 1 };
    } catch (e) { box = null; }
    img._cbox = box;
    return box;
  }

  // draw opaque pixels bottom-aligned
  drawContent(ctx, img, cx, bottomY, h) {
    const box = this.contentBox(img);
    if (!box) {
      ctx.drawImage(img, Math.round(cx - h / 2), Math.round(bottomY - h), h, h);
      return;
    }
    const dw = Math.max(1, Math.round(h * box.w / box.h));
    ctx.drawImage(img, box.x, box.y, box.w, box.h,
      Math.round(cx - dw / 2), Math.round(bottomY - h), dw, h);
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
    const trim = this.trimB(img);
    return {
      dw: Math.max(1, Math.round(img.naturalWidth * scale)),
      dh: Math.max(1, Math.round((img.naturalHeight - trim) * scale)),
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
    // peelout animation
    if ((b.peeling || (b.isRemote && b.peeling)) && s.peel && s.peel.length) {
      return s.peel[Math.floor(b.animTime * 16) % s.peel.length];
    }
    // spindash roll animation
    if ((b.spinning || (b.isRemote && b.spinning)) && s.jump && Array.isArray(s.jump)) {
      return s.jump[Math.floor(b.animTime * 12) % s.jump.length];
    }
    // spindash windup animation
    if ((b.spinWindup || (b.isRemote && b.spinwindup)) && s.spin && s.spin.length) {
      return s.spin[Math.floor(b.animTime * 10) % s.spin.length];
    }
    // tails fly animation
    if ((b.lift || (b.isRemote && b.lift)) && s.fly && s.fly.length) {
      return s.fly[Math.floor(b.animTime * 8) % s.fly.length];
    }
    // tailwhip animation
    if ((b.whipUntil || (b.isRemote && b.whipUntil)) && s.whip && s.whip.length) {
      return s.whip[Math.floor(b.animTime * 15) % s.whip.length];
    }
    // kick animation
    if ((b.kickUntil || (b.isRemote && b.kickUntil)) && s.kick && s.kick.length) {
      return s.kick[Math.floor(b.animTime * 8) % s.kick.length];
    }
    // jab animation
    if ((b.jabUntil || (b.isRemote && b.jabUntil)) && s.jab && s.jab.length) {
      return s.jab[Math.floor(b.animTime * 10) % s.jab.length];
    }
    // throw animation
    if ((b.throwUntil || (b.isRemote && b.throwUntil)) && s.throw && s.throw.length) {
      return s.throw[Math.floor(b.animTime * 8) % s.throw.length];
    }
    // air throw animation
    if ((b.throwUntil || (b.isRemote && b.throwUntil)) && !b.onGround && s.airthrow && s.airthrow.length) {
      return s.airthrow[Math.floor(b.animTime * 8) % s.airthrow.length];
    }
    // peelout windup animation
    if ((b.windupUntil && !b.peeling && !b.spinning) || (b.isRemote && b.windup && !b.peeling && !b.spinning)) {
      if (s.charge && s.charge.length) return s.charge[Math.floor(b.animTime * 8) % s.charge.length];
      if (s.charge) return s.charge;
    }
    if (!b.onGround && s.jump) {
      if (b.vel.y > 300 && s.fall) return s.fall;
      // hold jump, then roll
      if (Array.isArray(s.jump)) {
        const justJumped = b._justJumped && b.animTime < 0.15;
        if (justJumped) return s.jump[0];
        b._justJumped = false;
        return s.jump[Math.floor(b.animTime * 10) % s.jump.length];
      }
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
      const stride = b.animRunning ? (s.runStride || 65) : (s.walkStride || (tired ? 70 : 40));
      const i = Math.floor(b.walkDist / stride) % frames.length;
      return frames[i];
    }
    if (s.idle && s.idle.length) {
      const i = Math.floor(b.animTime * (s.idleFps || (tired ? 1 : 2))) % s.idle.length;
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
