// Server-authoritative NPC simulation: security, medics and visitors.
const GATE = { x: 0, z: 30 };
const LANDMARKS = [
  { name: 'Ferris wheel', x: -20, z: -9 },
  { name: 'carousel', x: 20, z: -6 },
  { name: 'ring toss', x: -11, z: 13 },
  { name: 'balloon darts', x: 3, z: 13 },
  { name: 'food stalls', x: 14, z: 13 },
];
const POSTS = [
  { name: 'gate', x: 0, z: 26, greeting: 'Welcome to Virtual Funfair, {name}! Please follow the park rules.' },
  { name: 'Ferris wheel', x: -14, z: -4, greeting: 'Keep clear of the ride machinery, {name}.' },
  { name: 'carousel', x: 14, z: -2, greeting: 'Enjoy the carousel, {name}!' },
  { name: 'booths', x: 0, z: 16, greeting: 'Games are open, {name}. Have fun!' },
];
// Areas players must stay out of (the Ferris wheel and carousel machinery).
const RESTRICTED = [
  { name: 'Ferris wheel machinery', x: -20, z: -15, r: 3 },
  { name: 'carousel motor', x: 20, z: -12, r: 2.2 },
];
const DAY_LENGTH = 240; // seconds per full day cycle
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const NAMES = ['Sam', 'Alex', 'Jo', 'Riley', 'Casey', 'Morgan', 'Jamie', 'Taylor', 'Robin', 'Avery', 'Kai', 'Noor'];
const SKINS = [0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524, 0xffdbac];
const HAIRS = [0x2c1b0e, 0x6b4423, 0xd9a441, 0x111111, 0xa0522d];

class NpcWorld {
  constructor(players, broadcast, sendTo) {
    this.players = players; // Map id -> { id, name, pos, status, ... }
    this.broadcast = broadcast;
    this.sendTo = sendTo;
    this.npcs = [];
    this.incidents = [];
    this.heat = LANDMARKS.map(() => 0); // trouble hot-spots drive security patrols
    this.clock = 0;
    this.nextId = 1;
    for (let i = 0; i < 5; i++) this.spawn('security', i);
    for (let i = 0; i < 2; i++) this.spawn('medic', i);
    for (let i = 0; i < 6; i++) this.spawn('visitor');
  }

  get time() { return (this.clock % DAY_LENGTH) / DAY_LENGTH; } // 0=dawn .. 1
  get isNight() { return this.time > 0.6; }

  spawn(role, i = 0) {
    const looks = {
      security: { shirt: 0x1f3a93, pants: 0x1b1b2f, hair: pick(HAIRS) },
      medic: { shirt: 0xffffff, pants: 0x2ecc71, hair: pick(HAIRS) },
      visitor: { shirt: Math.floor(Math.random() * 0xffffff), pants: pick([0x34495e, 0x7f8c8d, 0x2c3e50, 0x6d4c41]), hair: pick(HAIRS) },
    }[role];
    const npc = {
      id: this.nextId++, role, name: role === 'visitor' ? pick(NAMES) : (role === 'security' ? 'Officer ' : 'Medic ') + pick(NAMES),
      x: GATE.x + rnd(-3, 3), z: GATE.z + rnd(-1, 1) - i, rot: 0, say: '', sayUntil: 0,
      state: 'idle', timer: 0, target: null, cooldown: 0, skin: pick(SKINS), ...looks,
      speed: role === 'visitor' ? rnd(1.4, 2.2) : 2.4,
    };
    this.npcs.push(npc);
    if (role === 'security') {
      // Fill every post first; extra hires patrol.
      const taken = new Set(this.npcs.filter((g) => g.duty === 'post').map((g) => g.post));
      const free = POSTS.findIndex((_, idx) => !taken.has(idx));
      npc.duty = free >= 0 ? 'post' : 'patrol';
      if (free >= 0) npc.post = free;
    }
    return npc;
  }

  speak(npc, text, secs = 3) { npc.say = text; npc.sayUntil = this.clock + secs; }

  moveToward(npc, tx, tz, dt, speedMul = 1) {
    const dx = tx - npc.x, dz = tz - npc.z, d = Math.hypot(dx, dz);
    if (d < 0.05) return true;
    const step = Math.min(d, npc.speed * speedMul * dt);
    npc.x += (dx / d) * step; npc.z += (dz / d) * step;
    npc.rot = Math.atan2(dx, dz);
    return d - step < 0.3;
  }

  face(npc, p) { npc.rot = Math.atan2(p.pos[0] - npc.x, p.pos[2] - npc.z); }

  // ---- reactions to player actions ----
  onAction(player, kind) {
    const p = { x: player.pos[0], z: player.pos[2] };
    if (kind === 'collapse' && player.status !== 'collapsed') {
      player.status = 'collapsed';
      this.incidents.push({ type: 'collapse', playerId: player.id, x: p.x, z: p.z, medic: null, guard: null });
      this.broadcast({ type: 'status', id: player.id, status: 'collapsed' });
      // Nearby visitors notice and some call for help.
      for (const n of this.npcs) if (n.role === 'visitor' && dist(n, p) < 12 && Math.random() < 0.6) this.speak(n, pick(['Someone call a medic!', 'Are they okay?!', 'Over here, help!']));
    } else if (kind === 'ruckus' && player.status === 'normal') {
      player.status = 'ruckus';
      player.ruckusUntil = this.clock + 8;
      this.incidents.push({ type: 'ruckus', playerId: player.id, x: p.x, z: p.z, guard: null });
      this.heatAt(p, 1);
      this.broadcast({ type: 'status', id: player.id, status: 'ruckus' });
      for (const n of this.npcs) if (n.role === 'visitor' && dist(n, p) < 10) { n.state = 'flee'; n.timer = 4; this.speak(n, pick(['Whoa, calm down!', 'Let\'s get away from here.', 'Security!'])); }
    } else if (kind === 'help' && !this.incidents.some((i) => i.playerId === player.id)) {
      this.incidents.push({ type: 'help', playerId: player.id, x: p.x, z: p.z, guard: null, detected: true });
      this.radio('Park management', `${player.name} is asking security for help.`);
    } else if (kind === 'report') {
      this.playerReport(player);
    } else if (kind === 'wave') {
      for (const n of this.npcs) if (dist(n, p) < 8 && n.state !== 'flee' && !n.busy) {
        this.face(n, player);
        this.speak(n, n.role === 'visitor' ? pick(['Hi there!', 'Love your avatar!', 'Having fun?']) : pick(['Enjoy the park!', 'Stay safe out there.']));
      }
    }
  }

  heatAt(p, amount) {
    let best = 0, bd = Infinity;
    LANDMARKS.forEach((l, i) => { const d = dist(l, p); if (d < bd) { bd = d; best = i; } });
    this.heat[best] += amount;
  }

  // ---- per-tick behavior ----
  tick(dt) {
    this.clock += dt;
    this.adaptCrowd();
    this.heat = this.heat.map((h) => Math.max(0, h - dt * 0.05));
    const online = [...this.players.values()];

    for (const pl of online) {
      if (pl.status === 'ruckus' && this.clock > pl.ruckusUntil) pl.status = 'normal', this.broadcast({ type: 'status', id: pl.id, status: 'normal' });
    }
    this.incidents = this.incidents.filter((inc) => {
      const pl = this.players.get(inc.playerId);
      if (!pl || inc.done) return false;
      if (inc.type === 'collapse') return pl.status === 'collapsed';
      if (inc.type === 'ruckus') return pl.status === 'ruckus';
      return true;
    });
    this.checkRules(online);
    this.detect();
    this.updateAlert();

    for (const n of this.npcs) {
      n.busy = false;
      if (n.sayUntil && this.clock > n.sayUntil) { n.say = ''; n.sayUntil = 0; }
      n.cooldown = Math.max(0, n.cooldown - dt);
      if (n.role === 'medic') this.medic(n, dt);
      else if (n.role === 'security') this.security(n, dt, online);
      else this.visitor(n, dt, online);
    }
  }

  // Environment adaptation: crowd grows with players, shrinks at night.
  adaptCrowd() {
    const visitors = this.npcs.filter((n) => n.role === 'visitor');
    const target = this.isNight ? 1 : 5 + this.players.size * 2;
    if (visitors.length < target && Math.random() < 0.02) this.spawn('visitor');
    if (visitors.length > target) {
      const leaver = visitors.find((v) => v.state !== 'leaving');
      if (leaver) { leaver.state = 'leaving'; this.speak(leaver, this.isNight ? 'Getting late, heading home!' : 'Time to go.'); }
    }
    const guards = this.npcs.filter((n) => n.role === 'security').length;
    if (this.isNight && !this.wasNight) { const g = this.npcs.find((n) => n.role === 'security'); if (g) this.radio(g, 'Night shift: park closing soon. Increasing patrols.'); }
    this.wasNight = this.isNight;
    const wantGuards = POSTS.length + 1 + (this.isNight ? 1 : 0) + Math.floor(this.heat.reduce((a, b) => a + b, 0) / 3);
    if (guards < Math.min(wantGuards, 8) && Math.random() < 0.02) this.spawn('security');
  }

  medic(n, dt) {
    const inc = this.incidents.find((i) => i.type === 'collapse' && i.detected && (i.medic === n.id || (i.medic === null)));
    if (inc && (inc.medic === null || inc.medic === n.id)) {
      const free = this.npcs.filter((m) => m.role === 'medic' && !this.incidents.some((i) => i.medic === m.id));
      if (inc.medic === null) {
        const nearest = free.sort((a, b) => dist(a, inc) - dist(b, inc))[0];
        if (nearest !== n) return this.wander(n, dt, 0.5);
        inc.medic = n.id; this.speak(n, 'On my way!'); this.radio(n, 'Medic responding to the emergency.');
      }
      n.busy = true;
      n.state = 'responding';
      if (this.moveToward(n, inc.x + 0.8, inc.z, dt, 2.2)) {
        n.state = 'treating'; n.timer += dt;
        n.rot = Math.atan2(inc.x - n.x, inc.z - n.z);
        if (n.timer > 1) this.speak(n, 'Stay with me, you\'ll be fine.', 1.5);
        if (n.timer > 4) {
          const pl = this.players.get(inc.playerId);
          if (pl) { pl.status = 'normal'; this.broadcast({ type: 'status', id: pl.id, status: 'normal' }); }
          this.speak(n, 'All better! Take it easy.'); n.timer = 0; n.state = 'idle';
        }
      } else n.timer = 0;
      return;
    }
    this.wander(n, dt, 0.5);
  }

  radio(n, text) { this.broadcast({ type: 'radio', from: typeof n === 'string' ? n : n.name, text }); }

  // ---- situational awareness ----
  // Sight is a forward cone (shorter at night); anything very close is also "heard".
  canSee(n, pt) {
    const d = dist(n, pt);
    if (d > (this.isNight ? 9 : 15)) return false;
    if (d < 4) return true;
    const diff = Math.atan2(pt.x - n.x, pt.z - n.z) - n.rot;
    return Math.abs(Math.atan2(Math.sin(diff), Math.cos(diff))) < Math.PI / 3;
  }

  describe(inc) {
    const who = this.players.get(inc.playerId)?.name || 'a guest';
    const near = LANDMARKS.slice().sort((a, b) => dist(a, inc) - dist(b, inc))[0].name;
    const what = { ruckus: 'a disturbance', violation: 'a restricted-area violation', collapse: 'a medical emergency', help: 'a request for help' }[inc.type];
    return `${what} involving ${who} near the ${near}`;
  }

  // Incidents only become known when a guard/medic sees them, a visitor reports
  // them, a player reports them, or the player asks for help directly.
  detect() {
    for (const inc of this.incidents) {
      if (inc.detected) continue;
      const pt = { x: inc.x, z: inc.z };
      const staff = this.npcs.find((n) => n.role !== 'visitor' && this.canSee(n, pt));
      if (staff) {
        inc.detected = true;
        this.radio(staff, `Spotted ${this.describe(inc)}.`);
        continue;
      }
      if (this.npcs.some((n) => n.role === 'visitor' && dist(n, pt) < 10)) inc.witnessAt = inc.witnessAt ?? this.clock;
      if (inc.witnessAt !== undefined && this.clock - inc.witnessAt > 2) {
        inc.detected = true;
        this.radio('Park management', `A visitor reported ${this.describe(inc)}. Dispatching the nearest unit.`);
      }
    }
  }

  // Players can report anything they can see: marks nearby unnoticed incidents as known.
  playerReport(player) {
    const p = { x: player.pos[0], z: player.pos[2] };
    let any = false;
    for (const inc of this.incidents) {
      if (!inc.detected && inc.playerId !== player.id && dist(inc, p) < 15) {
        inc.detected = true; any = true;
        this.radio('Park management', `${player.name} reported ${this.describe(inc)}. Thank you!`);
      }
    }
    if (!any) this.sendTo(player.id, { type: 'radio', from: 'Park management', text: 'Nothing new to report nearby, thanks.' });
  }

  // Management sets an alert level from open incidents and coordinates the response.
  updateAlert() {
    const open = this.incidents.filter((i) => i.detected && !i.done).length;
    const level = open >= 3 ? 'red' : open === 2 ? 'yellow' : 'green';
    if (level !== this.alert) {
      this.alert = level;
      this.broadcast({ type: 'alert', level });
      if (level !== 'green') this.radio('Park management', level === 'red' ? 'Code red: all units respond to the nearest incident.' : 'Code yellow: multiple incidents. Posts may leave to assist.');
      else this.radio('Park management', 'Code green: all incidents under control. Return to posts.');
    }
    if (this.clock > (this.nextCheckin || 0)) {
      this.nextCheckin = this.clock + 45;
      const g = this.npcs.filter((n) => n.role === 'security' && !n.engaged);
      if (g.length) {
        const n = pick(g);
        this.radio(n, n.duty === 'post' ? `${POSTS[n.post % POSTS.length].name} post: all clear.` : 'Patrol: all clear.');
      }
    }
  }

  // Rule enforcement: players inside a restricted zone get a violation incident.
  checkRules(online) {
    for (const pl of online) {
      if (pl.status !== 'normal' || (pl.vioCooldown || 0) > this.clock) continue;
      const zone = RESTRICTED.find((z) => dist(z, { x: pl.pos[0], z: pl.pos[2] }) < z.r);
      if (!zone || this.incidents.some((i) => i.playerId === pl.id)) continue;
      pl.vioCooldown = this.clock + 10;
      this.incidents.push({ type: 'violation', playerId: pl.id, x: pl.pos[0], z: pl.pos[2], guard: null, zone });
      this.heatAt({ x: zone.x, z: zone.z }, 0.3);
    }
  }

  // Closest free guard; stationed guards only take incidents near their post.
  claimIncident(n) {
    const busy = (g) => this.incidents.some((i) => i.guard === g.id);
    const free = this.npcs.filter((g) => g.role === 'security' && !busy(g));
    const mine = this.incidents.find((i) => i.guard === n.id);
    if (mine) return mine;
    if (busy(n)) return null;
    const open = this.incidents.filter((i) => i.detected && i.guard === null && ['ruckus', 'violation', 'help', 'collapse'].includes(i.type));
    for (const inc of open) {
      const ranked = free.filter((g) => g.duty !== 'post' || this.alert !== 'green' || dist(g, inc) < 22).sort((a, b) => dist(a, inc) - dist(b, inc));
      if (ranked[0] === n) { inc.guard = n.id; return inc; }
    }
    return null;
  }

  warn(n, pl, inc, text, escort) {
    pl.warnings = (pl.warnings || 0) + 1;
    if (pl.warnings >= 3) {
      this.speak(n, escort, 4);
      this.radio(n, `Escorting ${pl.name} to the gate.`);
      this.sendTo(pl.id, { type: 'teleport', pos: [GATE.x, 0, GATE.z - 4] });
      pl.pos = [GATE.x, 0, GATE.z - 4]; pl.warnings = 0;
    } else this.speak(n, `Warning ${pl.warnings}/3: ${text}`, 4);
  }

  security(n, dt, online) {
    const inc = this.claimIncident(n);
    if (!inc) { n.engaged = null; return n.duty === 'post' ? this.stand(n, dt, online) : this.patrol(n, dt, online); }
    const pl = this.players.get(inc.playerId);
    if (pl && inc.type !== 'collapse') { inc.x = pl.pos[0]; inc.z = pl.pos[2]; }
    n.busy = true;
    if (n.state !== 'responding' && n.state !== 'warning' && !n.engaged) {
      n.engaged = inc;
      const calls = {
        ruckus: 'Hey! Calm down over there!', violation: 'Excuse me, you can\'t be in there!',
        help: 'On my way to help!', collapse: 'Medical emergency! Clearing the area.',
      };
      this.speak(n, calls[inc.type]);
      this.radio(n, inc.type === 'collapse'
        ? `Responding. ${pl?.name} is down. Medics please respond.`
        : `Copy, responding to ${this.describe(inc)}.`);
    }
    const arrived = this.moveToward(n, inc.x, inc.z + (inc.type === 'collapse' ? -1.2 : 1), dt, 2.4);
    n.state = arrived ? 'warning' : 'responding';
    if (!arrived) { n.timer = 0; return; }
    n.timer += dt;

    if (inc.type === 'collapse') {
      // Hold the scene until the medic finishes; push the crowd back.
      n.rot = Math.atan2(inc.x - n.x, inc.z - n.z);
      if (n.timer > 2 && !inc.said) { inc.said = true; this.speak(n, 'Stand back, give them room. Medic is on the way.', 4); }
      for (const v of this.npcs) if (v.role === 'visitor' && dist(v, inc) < 2.5) this.moveToward(v, v.x + (v.x - inc.x), v.z + (v.z - inc.z), dt, 1.5);
    } else if (inc.type === 'help' && pl) {
      this.face(n, pl);
      if (!inc.dest) {
        const l = LANDMARKS.slice().sort((a, b) => dist(a, n) - dist(b, n))[Math.min(1, LANDMARKS.length - 1)];
        inc.dest = l; this.speak(n, `Looking for something? Follow me to the ${l.name}!`, 4); n.timer = 0;
      } else if (n.timer > 1.5) {
        inc.leading = true;
        if (this.moveToward(n, inc.dest.x, inc.dest.z, dt, 0.9)) { this.speak(n, 'Here you go. Enjoy!'); inc.done = true; }
      }
    } else if (inc.type === 'violation' && pl) {
      if (dist(inc.zone, { x: pl.pos[0], z: pl.pos[2] }) >= inc.zone.r) { this.speak(n, 'Thank you. Stay safe!'); inc.done = true; }
      else if (n.timer > 1.5) { this.warn(n, pl, inc, `please keep out of the ${inc.zone.name}.`, 'Restricted area. Please come with me.'); n.timer = 0; if (pl.warnings === 0) inc.done = true; }
    } else if (inc.type === 'ruckus' && pl) {
      if (n.timer > 1.5) {
        this.warn(n, pl, inc, 'please behave.', 'That\'s enough. Please leave the area.');
        pl.status = 'normal'; this.broadcast({ type: 'status', id: pl.id, status: 'normal' });
        inc.done = true;
      }
    }
    if (inc.done) { n.engaged = null; n.state = 'idle'; n.timer = 0; n.target = null; }
  }

  // Stationed guard: hold the post, watch the area, greet and advise players.
  stand(n, dt, online) {
    const post = POSTS[n.post % POSTS.length];
    if (!this.moveToward(n, post.x, post.z, dt)) { n.state = 'walking'; return; }
    n.state = 'on post';
    const near = online.find((p) => dist({ x: p.pos[0], z: p.pos[2] }, n) < 7);
    if (near) {
      this.face(n, near);
      if (n.cooldown === 0) { this.speak(n, post.greeting.replace('{name}', near.name)); n.cooldown = 25; }
    } else if (Math.floor(this.clock / 6) % 2) n.rot += dt * 0.6; // scan the area
  }

  // Patrol weights landmarks by recent trouble ("heat") so guards adapt.
  patrol(n, dt, online = []) {
    n.state = 'patrolling';
    if (!n.target || this.moveToward(n, n.target.x, n.target.z, dt, 0.8)) {
      if (n.target) {
        n.timer = (n.timer || 0) + dt;
        const lost = online.find((p) => dist({ x: p.pos[0], z: p.pos[2] }, n) < 4);
        if (lost && n.cooldown === 0) { this.face(n, lost); this.speak(n, pick(['All good, ' + lost.name + '?', 'Need anything? Just ask.', 'Stay safe!'])); n.cooldown = 20; }
        if (n.timer < 2) return;
      }
      n.timer = 0;
      const weights = LANDMARKS.map((_, i) => 1 + this.heat[i] * 4);
      let r = Math.random() * weights.reduce((a, b) => a + b, 0), idx = 0;
      while (r > weights[idx]) { r -= weights[idx]; idx++; }
      const l = LANDMARKS[Math.min(idx, LANDMARKS.length - 1)];
      n.target = { x: l.x + rnd(-4, 4), z: l.z + rnd(-4, 4) };
    }
  }

  wander(n, dt, speedMul = 0.7) {
    n.state = 'idle';
    if (!n.target || this.moveToward(n, n.target.x, n.target.z, dt, speedMul)) {
      n.timer += dt;
      if (n.timer > rnd(2, 6) || !n.target) { n.timer = 0; n.target = { x: rnd(-30, 30), z: rnd(-20, 24) }; }
    }
  }

  visitor(n, dt, online) {
    if (n.state === 'leaving') {
      if (this.moveToward(n, GATE.x, GATE.z + 3, dt)) this.npcs.splice(this.npcs.indexOf(n), 1);
      return;
    }
    if (n.state === 'flee') {
      n.timer -= dt;
      const away = online.find((p) => p.status === 'ruckus');
      if (away) this.moveToward(n, n.x + (n.x - away.pos[0]), n.z + (n.z - away.pos[2]), dt, 1.8);
      if (n.timer <= 0) n.state = 'idle';
      return;
    }
    // React to nearby collapsed players by gathering.
    const hurt = online.find((p) => p.status === 'collapsed' && dist({ x: p.pos[0], z: p.pos[2] }, n) < 10);
    if (hurt) {
      this.moveToward(n, hurt.pos[0] + 2, hurt.pos[2] + 2, dt, 0.8);
      n.busy = true;
      if (n.cooldown === 0) { this.speak(n, pick(['Hang in there!', 'Medic is coming.', 'Give them space.'])); n.cooldown = 6; }
      return;
    }
    // Greet a close player now and then.
    const near = online.find((p) => dist({ x: p.pos[0], z: p.pos[2] }, n) < 3);
    if (near && n.cooldown === 0 && n.state !== 'riding') {
      this.face(n, near); this.speak(n, pick(['Hi, ' + near.name + '!', 'Great park, right?', 'Try the ' + pick(LANDMARKS).name + '!'])); n.cooldown = 15;
      return;
    }
    // Head to the least crowded attraction, linger, then move on.
    if (n.state === 'lingering') {
      n.timer -= dt;
      if (n.timer <= 0) { n.state = 'idle'; n.target = null; }
      return;
    }
    if (!n.target || n.state === 'idle') {
      const crowd = (l) => this.npcs.filter((o) => o !== n && dist(o, l) < 6).length;
      const choices = LANDMARKS.map((l) => ({ l, c: crowd(l) + Math.random() * 2 })).sort((a, b) => a.c - b.c);
      const l = choices[0].l;
      n.target = { x: l.x + rnd(-3, 3), z: l.z + rnd(-3, 3), name: l.name }; n.state = 'walking';
    }
    if (this.moveToward(n, n.target.x, n.target.z, dt)) {
      n.state = 'lingering'; n.timer = rnd(5, 10);
      if (n.target.name && Math.random() < 0.5) this.speak(n, pick(['Wheee!', 'This is fun!', 'Look at that view!']));
    }
  }

  snapshot() {
    return this.npcs.map((n) => ({
      id: n.id, role: n.role, name: n.name, x: +n.x.toFixed(2), z: +n.z.toFixed(2), rot: +n.rot.toFixed(2),
      state: n.state, say: n.say, look: { skin: n.skin, hair: n.hair, shirt: n.shirt, pants: n.pants },
    }));
  }
}

module.exports = { NpcWorld, DAY_LENGTH };
