import * as THREE from 'three';
import { analyzePhoto, buildAvatar } from './avatar.js';

const $ = (id) => document.getElementById(id);
let photoData = null;
let stream = null;

const loadImage = (src) => new Promise((res, rej) => {
  const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src;
});

async function setPhoto(src) {
  const img = await loadImage(src);
  photoData = analyzePhoto(img);
  const p = $('preview').getContext('2d');
  const s = Math.min(img.width, img.height);
  p.drawImage(img, (img.width - s) / 2, 0, s, s, 0, 0, 160, 160);
  $('enter').disabled = false;
  $('status').textContent = 'Photo ready!';
}

$('upload').onclick = () => $('file').click();
$('file').onchange = (e) => { const f = e.target.files[0]; if (f) setPhoto(URL.createObjectURL(f)); };
$('camera').onclick = async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    $('video').srcObject = stream; await $('video').play();
    $('snap').hidden = false;
  } catch { $('status').textContent = 'Camera unavailable — please upload a photo.'; }
};
$('snap').onclick = () => {
  const v = $('video'), c = document.createElement('canvas');
  c.width = v.videoWidth; c.height = v.videoHeight;
  c.getContext('2d').drawImage(v, 0, 0);
  stream.getTracks().forEach((t) => t.stop());
  $('snap').hidden = true;
  setPhoto(c.toDataURL('image/jpeg', 0.9));
};
$('enter').onclick = () => { $('setup').classList.add('hidden'); startGame($('name').value || 'Guest'); };

function startGame(name) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87ceeb);
  scene.fog = new THREE.Fog(0x87ceeb, 40, 120);
  const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 300);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  document.body.prepend(renderer.domElement);
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });

  scene.add(new THREE.HemisphereLight(0xffffff, 0x446644, 1.1));
  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.position.set(30, 50, 20); sun.castShadow = true;
  sun.shadow.camera.left = sun.shadow.camera.bottom = -50;
  sun.shadow.camera.right = sun.shadow.camera.top = 50;
  sun.shadow.mapSize.set(2048, 2048);
  scene.add(sun);

  const std = (color) => new THREE.MeshStandardMaterial({ color });
  const ground = new THREE.Mesh(new THREE.CircleGeometry(80, 64), std(0x5bb450));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

  // Ferris wheel
  const wheel = new THREE.Group();
  const R = 10, N = 12;
  wheel.add(new THREE.Mesh(new THREE.TorusGeometry(R, 0.2, 8, 64), std(0xff4757)));
  const cabins = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(R, 0.1, 0.1), std(0xdddddd));
    spoke.position.set(Math.cos(a) * R / 2, Math.sin(a) * R / 2, 0); spoke.rotation.z = a; wheel.add(spoke);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.2, 1.4), std(new THREE.Color().setHSL(i / N, 0.8, 0.55)));
    cab.castShadow = true; cab.userData.a = a; wheel.add(cab); cabins.push(cab);
  }
  wheel.position.set(-20, R + 1.5, -15); scene.add(wheel);
  for (const s of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.4, R + 2, 8), std(0x555555));
    leg.position.set(-20, (R + 2) / 2, -15 + s * 1.5); leg.rotation.x = s * 0.15; scene.add(leg);
  }

  // Carousel
  const carousel = new THREE.Group();
  carousel.add(new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 0.4, 32), std(0xffd43b)));
  const roof = new THREE.Mesh(new THREE.ConeGeometry(7, 3, 32), std(0xe84393));
  roof.position.y = 6; carousel.add(roof);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const horse = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, 1.4), std(0xffffff));
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 5, 6), std(0xcccccc));
    horse.position.set(Math.cos(a) * 4.2, 1.2, Math.sin(a) * 4.2); horse.rotation.y = -a;
    pole.position.set(horse.position.x, 2.7, horse.position.z);
    carousel.add(horse, pole);
  }
  carousel.position.set(20, 0.2, -12); scene.add(carousel);

  // Game booths
  for (let i = 0; i < 6; i++) {
    const x = -18 + i * 7.2;
    const t = new THREE.Mesh(new THREE.ConeGeometry(3, 2.5, 4), std(i % 2 ? 0xffffff : 0x3742fa));
    t.position.set(x, 3.8, 18); t.rotation.y = Math.PI / 4; t.castShadow = true;
    const b = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.6, 3.6), std(0xc8a165));
    b.position.set(x, 1.3, 18); b.castShadow = true;
    scene.add(t, b);
  }

  const drawLabel = (c, text, bg = '#0008') => {
    const g = c.getContext('2d'); g.clearRect(0, 0, 256, 64); g.fillStyle = bg; g.fillRect(0, 0, 256, 64);
    g.fillStyle = '#fff'; g.font = '26px sans-serif'; g.textAlign = 'center'; g.fillText(text.slice(0, 22), 128, 42);
  };
  const label = (text, y = 1.95, bg) => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 64; drawLabel(c, text, bg);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), depthTest: false }));
    s.scale.set(1, 0.25, 1); s.position.y = y; s.userData = { c, text }; return s;
  };
  const setLabel = (s, text, bg) => {
    if (s.userData.text === text) return;
    s.userData.text = text; drawLabel(s.userData.c, text, bg); s.material.map.needsUpdate = true; s.visible = !!text;
  };
  const makePlayer = (p) => {
    const g = new THREE.Group();
    const body = buildAvatar(p.avatar);
    g.add(body, label(p.name));
    g.position.set(p.pos[0], 0, p.pos[2]); g.rotation.y = p.rot || 0;
    g.userData = { target: new THREE.Vector3(p.pos[0], 0, p.pos[2]), rot: p.rot || 0, name: p.name, body };
    scene.add(g); if (p.status) setStatus(g, p.status); return g;
  };
  const setStatus = (g, status) => {
    g.userData.status = status;
    g.userData.body.rotation.z = status === 'collapsed' ? Math.PI / 2 : 0;
    g.userData.body.position.y = status === 'collapsed' ? 0.2 : 0;
  };
  const others = new Map();
  const me = makePlayer({ name, avatar: photoData, pos: [0, 0, 8], rot: 0 });

  // NPCs
  const npcMeshes = new Map();
  const roleBg = { security: '#1f3a93cc', medic: '#c0392bcc', visitor: '#0008' };
  const syncNpcs = (list) => {
    const seen = new Set();
    for (const n of list) {
      seen.add(n.id);
      let g = npcMeshes.get(n.id);
      if (!g) {
        g = new THREE.Group();
        const bubble = label('', 2.3, '#fffd');
        g.add(buildAvatar(n.look), label(n.name, 1.95, roleBg[n.role]), bubble);
        if (n.role === 'medic') { const cross = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.02), std(0xe74c3c)); cross.position.set(0, 1.25, 0.2); g.add(cross); }
        g.position.set(n.x, 0, n.z);
        g.userData = { bubble, target: new THREE.Vector3(), rot: 0 };
        bubble.visible = false; scene.add(g); npcMeshes.set(n.id, g);
      }
      g.userData.target.set(n.x, 0, n.z); g.userData.rot = n.rot; g.userData.state = n.state;
      setLabel(g.userData.bubble, n.say, '#7a5cffdd');
    }
    for (const [id, g] of npcMeshes) if (!seen.has(id)) { scene.remove(g); npcMeshes.delete(id); }
  };
  const hemi = scene.children.find((o) => o.isHemisphereLight);
  const dayColor = new THREE.Color(0x87ceeb), nightColor = new THREE.Color(0x0b1026);
  const applyTime = (t) => {
    const night = THREE.MathUtils.smoothstep(t, 0.55, 0.7) * (1 - THREE.MathUtils.smoothstep(t, 0.92, 1));
    scene.background.copy(dayColor).lerp(nightColor, night); scene.fog.color.copy(scene.background);
    hemi.intensity = 1.1 - 0.8 * night; sun.intensity = 2 - 1.8 * night;
  };

  const logEl = $('log');
  const say = (t) => {
    const d = document.createElement('div'); d.textContent = t; logEl.append(d);
    while (logEl.children.length > 5) logEl.firstChild.remove();
  };
  const count = () => ($('count').textContent = others.size + 1);

  const ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host);
  const idMap = new Map(); // player id -> group (others and me)
  let myId = null;
  ws.onopen = () => ws.send(JSON.stringify({ type: 'join', name, avatar: photoData }));
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.type === 'welcome') { myId = m.id; idMap.set(m.id, me); m.players.forEach((p) => { others.set(p.id, makePlayer(p)); idMap.set(p.id, others.get(p.id)); }); count(); }
    else if (m.type === 'join') { others.set(m.player.id, makePlayer(m.player)); idMap.set(m.player.id, others.get(m.player.id)); say(m.player.name + ' joined'); count(); }
    else if (m.type === 'move') { const o = others.get(m.id); if (o) { o.userData.target.set(m.pos[0], 0, m.pos[2]); o.userData.rot = m.rot; } }
    else if (m.type === 'leave') { const o = others.get(m.id); if (o) scene.remove(o); others.delete(m.id); idMap.delete(m.id); count(); }
    else if (m.type === 'chat') say((others.get(m.id)?.userData.name || 'Player') + ': ' + m.text);
    else if (m.type === 'alert') $('alert').textContent = { green: '🟢 Code green', yellow: '🟡 Code yellow', red: '🔴 Code red' }[m.level];
    else if (m.type === 'radio') say('📻 ' + m.from + ': ' + m.text);
    else if (m.type === 'npcs') { syncNpcs(m.npcs); applyTime(m.time); }
    else if (m.type === 'status') {
      const g = idMap.get(m.id); if (g) setStatus(g, m.status);
      if (m.id === myId) say(m.status === 'collapsed' ? '🚑 You collapsed — a medic is coming.' : m.status === 'ruckus' ? '🚨 Security has noticed you!' : 'You are back to normal.');
    }
    else if (m.type === 'teleport') { me.position.set(m.pos[0], 0, m.pos[2]); say('Security escorted you out to the gate.'); }
  };
  const act = (kind) => ws.readyState === 1 && ws.send(JSON.stringify({ type: 'action', kind }));
  document.querySelectorAll('[data-act]').forEach((b) => (b.onclick = () => act(b.dataset.act)));
  addEventListener('keydown', (e) => {
    if (e.target.id === 'msg') return;
    const k = { f: 'collapse', t: 'ruckus', g: 'wave', h: 'help', r: 'report' }[e.key.toLowerCase()]; if (k) act(k);
  });
  $('chat').onsubmit = (e) => {
    e.preventDefault();
    const t = $('msg').value.trim(); if (!t) return;
    ws.send(JSON.stringify({ type: 'chat', text: t })); say('You: ' + t); $('msg').value = '';
  };

  const keys = {};
  addEventListener('keydown', (e) => { if (e.target.id !== 'msg') keys[e.key.toLowerCase()] = true; });
  addEventListener('keyup', (e) => (keys[e.key.toLowerCase()] = false));
  const joy = { x: 0, y: 0 };
  const pad = $('pad'), knob = $('knob');
  const joyMove = (e) => {
    const r = pad.getBoundingClientRect();
    let x = (e.clientX - r.left - 60) / 60, y = (e.clientY - r.top - 60) / 60;
    const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; }
    joy.x = x; joy.y = y; knob.style.left = 40 + x * 40 + 'px'; knob.style.top = 40 + y * 40 + 'px';
  };
  pad.onpointerdown = (e) => { pad.setPointerCapture(e.pointerId); joyMove(e); pad.onpointermove = joyMove; };
  pad.onpointerup = () => { pad.onpointermove = null; joy.x = joy.y = 0; knob.style.left = knob.style.top = '40px'; };

  let lastSent = 0;
  const clock = new THREE.Clock();
  const camTarget = new THREE.Vector3();
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.1), t = clock.elapsedTime;
    let dx = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0) + joy.x;
    let dz = (keys.s || keys.arrowdown ? 1 : 0) - (keys.w || keys.arrowup ? 1 : 0) + joy.y;
    const l = Math.hypot(dx, dz);
    if (l > 0.05 && me.userData.status !== 'collapsed') {
      dx /= Math.max(1, l); dz /= Math.max(1, l);
      me.position.x = THREE.MathUtils.clamp(me.position.x + dx * 5 * dt, -75, 75);
      me.position.z = THREE.MathUtils.clamp(me.position.z + dz * 5 * dt, -75, 75);
      me.rotation.y = Math.atan2(dx, dz);
      me.position.y = Math.abs(Math.sin(t * 10)) * 0.05;
      if (t - lastSent > 0.05 && ws.readyState === 1) {
        lastSent = t;
        ws.send(JSON.stringify({ type: 'move', pos: [me.position.x, 0, me.position.z], rot: me.rotation.y }));
      }
    }
    others.forEach((o) => { o.position.lerp(o.userData.target, 0.2); o.rotation.y = o.userData.rot; });
    npcMeshes.forEach((o) => {
      const moving = o.position.distanceTo(o.userData.target) > 0.05;
      o.position.lerp(o.userData.target, 0.25); o.rotation.y = o.userData.rot;
      o.position.y = moving ? Math.abs(Math.sin(t * 9 + o.id)) * 0.05 : 0;
    });
    wheel.rotation.z = t * 0.2;
    cabins.forEach((c) => {
      const a = c.userData.a + wheel.rotation.z;
      c.position.set(Math.cos(a) * R, Math.sin(a) * R, 0); c.rotation.z = -wheel.rotation.z;
    });
    carousel.rotation.y = t * 0.5;
    camTarget.set(me.position.x, 6, me.position.z + 9);
    camera.position.lerp(camTarget, 0.1);
    camera.lookAt(me.position.x, 1.2, me.position.z);
    renderer.render(scene, camera);
  });
}
