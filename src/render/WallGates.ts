// v5 (owner 2026-10-25, MOCK-UP for approval): Wall Run set piece — three solid barrier panels side by side
// across the road with ONE narrow slit against the side wall. Only a car running ON the wall (Wall Run)
// fits through it. Pure visuals; the gameplay rows stay fully blocked (ObstacleRules untouched).
import * as THREE from 'three';
import { SHOWCASE } from '../config.ts';

const H = 3.4; // panel height
const T = 0.4; // panel thickness
const EDGE = 4.5; // road side wall
const SLIT = 1.5; // slit width against the wall (the car on its side is ~1.3 m thick)

function stripeTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d')!;
  const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, '#1b2a5e');
  gr.addColorStop(1, '#0b1030');
  g.fillStyle = gr;
  g.fillRect(0, 0, 256, 256);
  // hazard band
  g.save();
  g.beginPath();
  g.rect(0, 150, 256, 46);
  g.clip();
  for (let x = -256; x < 512; x += 40) {
    g.fillStyle = '#ffb21a';
    g.beginPath();
    g.moveTo(x, 196);
    g.lineTo(x + 20, 196);
    g.lineTo(x + 66, 150);
    g.lineTo(x + 46, 150);
    g.fill();
  }
  g.restore();
  // panel grid
  g.strokeStyle = 'rgba(120,200,255,.35)';
  g.lineWidth = 3;
  g.strokeRect(10, 10, 236, 236);
  g.beginPath();
  g.moveTo(10, 100);
  g.lineTo(246, 100);
  g.stroke();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export class WallGates {
  group = new THREE.Group();
  private items: { g: THREE.Group; dist: number }[] = [];
  private tex: THREE.CanvasTexture | null = null;

  set(gates: { dist: number; side: 1 | -1 }[]) {
    for (const it of this.items) this.group.remove(it.g);
    this.items = [];
    this.tex ??= stripeTexture();
    const panelMat = new THREE.MeshBasicMaterial({ map: this.tex, color: 0xffffff, fog: true });
    const rimMat = new THREE.MeshBasicMaterial({ color: 0xff3b6b, toneMapped: false, fog: true });
    const slitMat = new THREE.MeshBasicMaterial({ color: 0x3fffa0, toneMapped: false, fog: true });
    for (const gate of gates) {
      const g = new THREE.Group();
      const s = gate.side;
      // the three panels fill the road from the far wall up to the slit
      const span = EDGE * 2 - SLIT;
      const pw = span / 3;
      for (let i = 0; i < 3; i++) {
        const cx = -s * EDGE + s * (pw * (i + 0.5));
        const box = new THREE.Mesh(new THREE.BoxGeometry(pw - 0.12, H, T), panelMat);
        box.position.set(cx, H / 2, 0);
        g.add(box);
        // glowing red rim on top + the panel edges
        const top = new THREE.Mesh(new THREE.BoxGeometry(pw - 0.12, 0.12, T + 0.04), rimMat);
        top.position.set(cx, H, 0);
        g.add(top);
        for (const e of [-1, 1]) {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, H, T + 0.06), rimMat);
          post.position.set(cx + e * (pw / 2 - 0.1), H / 2, 0);
          g.add(post);
        }
      }
      // the slit: green light strips on both sides of it + a green bar over it
      const sx0 = s * (EDGE - SLIT),
        sx1 = s * EDGE;
      for (const x of [sx0, sx1]) {
        const strip = new THREE.Mesh(new THREE.BoxGeometry(0.12, H, 0.2), slitMat);
        strip.position.set(x - s * 0.06, H / 2, 0.1);
        g.add(strip);
      }
      const bar = new THREE.Mesh(new THREE.BoxGeometry(SLIT, 0.14, 0.2), slitMat);
      bar.position.set((sx0 + sx1) / 2, H + 0.4, 0.1);
      g.add(bar);
      g.visible = false;
      this.group.add(g);
      this.items.push({ g, dist: gate.dist });
    }
  }

  update(dist: number) {
    for (const it of this.items) {
      const z = -(it.dist - dist);
      it.g.position.z = z;
      it.g.visible = z > -240 && z < 12;
    }
  }
}
export const WALL_SLIT = SLIT;
void SHOWCASE;
