# Virtual Funfair

3-D multiplayer funfair that runs in any modern browser (desktop, iOS, Android) using Three.js and WebSockets.

```
npm install
npm start   # http://localhost:3000
```

Upload or take a photo, and the app builds a full-color 3-D full-body avatar: your face is mapped onto the head, and skin, hair, shirt and trouser colors are sampled from the photo. Walk around with WASD/arrows or the on-screen joystick, chat, and see other players in real time.

## NPCs
Simulated server-side in `npcs.js` (10 Hz) and shared by all players:
- **Security** has defined roles (`npcs.js`):
  - *Stationed guards* hold posts at the gate, Ferris wheel, carousel and booths, scan the area, and greet and advise nearby players.
  - *Patrol guards* walk the park, weighted toward recent trouble spots, and check in on players.
  - *Responders*: the nearest free guard takes each incident. Stationed guards only take incidents near their post, then return to it.
  - Incidents handled: ruckus (warnings, then escort to the gate), restricted-area violations (ride machinery), medical emergencies (guard secures the scene and pushes the crowd back while the medic treats), and player help requests (H) where a guard leads you to an attraction.
  - Guards coordinate with medics and **Park management** over a radio feed shown in the log (spotted/responding/resolved calls, periodic post check-ins).
  - **Situational awareness:** guards and medics only learn of incidents by seeing them (forward vision cone, shorter at night, plus close-range hearing), from a visitor witness report, from a player report (R), or a help request (H). An incident far from everyone goes unnoticed until someone reports it.
  - **Management alert levels:** code green/yellow/red depends on open incidents; at yellow/red, stationed guards leave their posts to assist, then return at green.
- **Medics** respond to a collapsed player (F): the nearest free medic runs over, treats them, and gets them back on their feet.
- **Visitors** go to the least crowded attraction, linger, chat, greet nearby players (or wave back at G), flee ruckuses, gather around collapsed players, and leave at night.
- **Environment:** a day/night cycle changes lighting; crowd size scales with player count and time of day.

## Limits / next steps
- Avatars are stylized-parametric, not photoreal. For realistic avatars, replace `analyzePhoto`/`buildAvatar` in `public/avatar.js` with a call to an image-to-3D service (a body-mesh reconstruction model) that returns a glTF.
- Only a small face thumbnail and sampled colors are sent to the server so other players can see you.
- Camera capture needs HTTPS (or localhost).
- For app stores, wrap with Capacitor or Tauri.
