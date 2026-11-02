import * as THREE from 'three';

const hex = (r, g, b) => (r << 16) | (g << 8) | b;

// Sample photo regions for a face texture and skin/hair/shirt/pants colors.
export function analyzePhoto(img) {
  const full = document.createElement('canvas');
  full.width = img.width; full.height = img.height;
  const g = full.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0);

  const region = (fx, fy, fw, fh) => {
    const w = Math.max(1, Math.round(img.width * fw)), h = Math.max(1, Math.round(img.height * fh));
    const d = g.getImageData(Math.round(img.width * fx), Math.round(img.height * fy), w, h).data;
    let r = 0, gr = 0, b = 0; const n = d.length / 4;
    for (let i = 0; i < d.length; i += 4) { r += d[i]; gr += d[i + 1]; b += d[i + 2]; }
    return hex(Math.round(r / n), Math.round(gr / n), Math.round(b / n));
  };

  const tall = img.height > img.width * 1.2;
  const size = 128, c = document.createElement('canvas');
  c.width = c.height = size;
  const s = Math.min(img.width, tall ? img.width : img.height);
  c.getContext('2d').drawImage(img, (img.width - s) / 2, tall ? img.height * 0.02 : (img.height - s) / 2, s, s, 0, 0, size, size);

  return {
    face: c.toDataURL('image/jpeg', 0.7),
    skin: region(0.42, tall ? 0.1 : 0.4, 0.16, 0.04),
    hair: region(0.42, tall ? 0.03 : 0.1, 0.16, 0.03),
    shirt: region(0.35, tall ? 0.35 : 0.8, 0.3, 0.06),
    pants: region(0.35, tall ? 0.62 : 0.9, 0.3, 0.06),
  };
}

const mat = (color, rough = 0.7) => new THREE.MeshStandardMaterial({ color, roughness: rough });

// Build a full-body colored 3-D avatar (about 1.75 units tall) from the analysis.
export function buildAvatar(a) {
  const root = new THREE.Group();
  const part = (geo, m, x, y, z) => {
    const mesh = new THREE.Mesh(geo, m);
    mesh.position.set(x, y, z); mesh.castShadow = true; root.add(mesh);
  };
  const skin = mat(a.skin), shirt = mat(a.shirt), pants = mat(a.pants), hair = mat(a.hair);

  if (a.face) {
    const faceTex = new THREE.TextureLoader().load(a.face);
    faceTex.colorSpace = THREE.SRGBColorSpace;
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.14, 32), new THREE.MeshStandardMaterial({ map: faceTex, roughness: 0.6 }));
    face.position.set(0, 1.62, 0.152); root.add(face);
  } else {
    for (const s of [-1, 1]) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), mat(0x111111));
      eye.position.set(s * 0.06, 1.64, 0.145); root.add(eye);
    }
  }

  part(new THREE.SphereGeometry(0.16, 32, 24), skin, 0, 1.62, 0);
  part(new THREE.SphereGeometry(0.17, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.2), hair, 0, 1.64, -0.01);
  part(new THREE.CylinderGeometry(0.06, 0.07, 0.1, 16), skin, 0, 1.45, 0);
  part(new THREE.CapsuleGeometry(0.17, 0.35, 8, 16), shirt, 0, 1.18, 0);
  for (const s of [-1, 1]) {
    part(new THREE.CapsuleGeometry(0.05, 0.4, 6, 12), shirt, s * 0.25, 1.15, 0);
    part(new THREE.SphereGeometry(0.05, 12, 12), skin, s * 0.25, 0.85, 0);
    part(new THREE.CapsuleGeometry(0.075, 0.55, 6, 12), pants, s * 0.09, 0.55, 0);
    part(new THREE.BoxGeometry(0.11, 0.07, 0.2), mat(0x222222), s * 0.09, 0.2, 0.04);
  }
  return root;
}
