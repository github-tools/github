const path = require('path');
const http = require('http');
const express = require('express');
const { WebSocketServer } = require('ws');
const { NpcWorld } = require('./npcs');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
const server = http.createServer(app);
const wss = new WebSocketServer({ server, maxPayload: 2 * 1024 * 1024 });

let nextId = 1;
const players = new Map();

const send = (ws, msg) => ws.readyState === 1 && ws.send(JSON.stringify(msg));
const broadcast = (msg, exceptId) => {
  for (const p of players.values()) if (p.id !== exceptId) send(p.ws, msg);
};
const num = (v) => (Number.isFinite(v) ? Math.max(-100, Math.min(100, v)) : 0);
const pub = ({ ws, ruckusUntil, warnings, ...p }) => p;

const world = new NpcWorld(
  players,
  (msg) => broadcast(msg),
  (id, msg) => players.has(id) && send(players.get(id).ws, msg),
);
setInterval(() => {
  world.tick(0.1);
  broadcast({ type: 'npcs', time: world.time, npcs: world.snapshot() });
}, 100);

wss.on('connection', (ws) => {
  const id = nextId++;
  let me = null;
  ws.on('message', (raw) => {
    let m;
    try { m = JSON.parse(raw); } catch { return; }
    if (m.type === 'join' && !me) {
      me = { id, name: String(m.name || 'Guest').slice(0, 20), avatar: m.avatar, pos: [0, 0, 8], rot: 0, status: 'normal', ws };
      players.set(id, me);
      send(ws, { type: 'welcome', id, players: [...players.values()].filter((p) => p.id !== id).map(pub) });
      broadcast({ type: 'join', player: pub(me) }, id);
    } else if (m.type === 'action' && me && ['collapse', 'ruckus', 'wave', 'help', 'report'].includes(m.kind)) {
      world.onAction(me, m.kind);
    } else if (m.type === 'move' && me && me.status !== 'collapsed' && Array.isArray(m.pos)) {
      me.pos = [num(m.pos[0]), 0, num(m.pos[2])];
      me.rot = num(m.rot);
      broadcast({ type: 'move', id, pos: me.pos, rot: me.rot }, id);
    } else if (m.type === 'chat' && me) {
      broadcast({ type: 'chat', id, text: String(m.text || '').slice(0, 120) });
    }
  });
  ws.on('close', () => {
    if (players.delete(id)) broadcast({ type: 'leave', id });
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Virtual Funfair on http://localhost:${port}`));
