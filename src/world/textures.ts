import * as THREE from 'three';
import { ISLAND_RADIUS, LAND_RADIUS, mulberry32, PATHS } from './config';

/**
 * Procedural canvas textures — no image files to download, generated once on load.
 */

function canvas(w: number, h = w) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')!] as const;
}

function toTexture(c: HTMLCanvasElement, repeat = true) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

const cache = new Map<string, THREE.Texture>();
function cached(key: string, make: () => THREE.Texture) {
  let t = cache.get(key);
  if (!t) {
    t = make();
    cache.set(key, t);
  }
  return t;
}

function blotch(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.globalAlpha = 1;
}

/** World extent covered by the ground textures (square, centred on the origin). */
export const GROUND_EXTENT = ISLAND_RADIUS + 4;

/** Give a disc in the XY plane (later rotated flat) UVs that match world x/z. */
export function applyGroundUV(geo: THREE.BufferGeometry) {
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  const S = GROUND_EXTENT;
  for (let i = 0; i < pos.count; i++) {
    uv.setXY(i, (pos.getX(i) + S) / (2 * S), (pos.getY(i) + S) / (2 * S));
  }
  uv.needsUpdate = true;
}

/** Grass with colour variation, soft dirt paths and a sandy rim, painted in world space. */
export function groundTexture(size = 2048) {
  return cached(`ground${size}`, () => {
    const [c, ctx] = canvas(size);
    const S = GROUND_EXTENT;
    const k = size / (2 * S);
    // world (x, z) → canvas (px, py); see applyGroundUV + flipY
    const px = (x: number) => (x + S) * k;
    const py = (z: number) => (z + S) * k;
    const rand = mulberry32(11);

    ctx.fillStyle = '#76bf55';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 420; i++) {
      const x = (rand() * 2 - 1) * S;
      const z = (rand() * 2 - 1) * S;
      const light = rand() > 0.5;
      blotch(ctx, px(x), py(z), (2 + rand() * 7) * k, light ? '#9bd66f' : '#4f9a3c', 0.22 + rand() * 0.2);
    }
    // fine grass speckle
    for (let i = 0; i < 26000; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const v = rand();
      ctx.fillStyle = v > 0.66 ? '#a3dc78' : v > 0.33 ? '#5aa645' : '#6db64f';
      ctx.fillRect(x, y, 1.6, 1.6);
    }
    // dirt paths: soft wide halo, then the packed core, then pebbles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const stroke = (width: number, style: string, alpha: number) => {
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = style;
      ctx.lineWidth = width * k;
      PATHS.forEach(([ax, az, bx, bz]) => {
        ctx.beginPath();
        ctx.moveTo(px(ax), py(az));
        ctx.lineTo(px(bx), py(bz));
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    };
    stroke(4.6, '#b99a62', 0.35);
    stroke(3.4, '#cfae78', 0.85);
    stroke(2.4, '#dcbd8a', 0.9);
    PATHS.forEach(([ax, az, bx, bz]) => {
      const len = Math.hypot(bx - ax, bz - az);
      for (let i = 0; i < len * 14; i++) {
        const t = rand();
        const off = (rand() - 0.5) * 3;
        const nx = -(bz - az) / len;
        const nz = (bx - ax) / len;
        ctx.fillStyle = rand() > 0.5 ? '#b89a6a' : '#ead2a5';
        ctx.beginPath();
        ctx.arc(px(ax + (bx - ax) * t + nx * off), py(az + (bz - az) * t + nz * off), (0.05 + rand() * 0.09) * k, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    // fade grass into sand towards the coast
    const rim = ctx.createRadialGradient(px(0), py(0), (LAND_RADIUS - 6) * k, px(0), py(0), (LAND_RADIUS + 0.5) * k);
    rim.addColorStop(0, 'rgba(241,220,164,0)');
    rim.addColorStop(1, 'rgba(241,220,164,1)');
    ctx.fillStyle = rim;
    ctx.fillRect(0, 0, size, size);
    return toTexture(c, false);
  });
}

export function sandTexture(size = 1024) {
  return cached(`sand${size}`, () => {
    const [c, ctx] = canvas(size);
    const S = GROUND_EXTENT;
    const k = size / (2 * S);
    const rand = mulberry32(3);
    ctx.fillStyle = '#f1dca4';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 30000; i++) {
      const v = rand();
      ctx.fillStyle = v > 0.5 ? '#e5cc8e' : v > 0.15 ? '#f8e8bd' : '#cdb07a';
      ctx.fillRect(rand() * size, rand() * size, 1.3, 1.3);
    }
    // darker wet sand at the waterline
    const wet = ctx.createRadialGradient(size / 2, size / 2, (ISLAND_RADIUS - 3.5) * k, size / 2, size / 2, (ISLAND_RADIUS + 1) * k);
    wet.addColorStop(0, 'rgba(176,150,98,0)');
    wet.addColorStop(1, 'rgba(176,150,98,0.75)');
    ctx.fillStyle = wet;
    ctx.fillRect(0, 0, size, size);
    return toTexture(c, false);
  });
}

/** Weathered andesite with moss — candi, stupas, monument base. */
export function stoneTexture() {
  return cached('stone', () => {
    const size = 256;
    const [c, ctx] = canvas(size);
    const rand = mulberry32(21);
    ctx.fillStyle = '#c9c3b6';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 60; i++) blotch(ctx, rand() * size, rand() * size, 10 + rand() * 30, rand() > 0.5 ? '#a8a194' : '#ddd8cc', 0.5);
    for (let i = 0; i < 5000; i++) {
      ctx.fillStyle = rand() > 0.5 ? 'rgba(80,74,64,0.35)' : 'rgba(255,255,255,0.25)';
      ctx.fillRect(rand() * size, rand() * size, 1.5, 1.5);
    }
    // block joints
    ctx.strokeStyle = 'rgba(70,64,56,0.55)';
    ctx.lineWidth = 2;
    for (let row = 0; row < 4; row++) {
      const y = row * 64;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
      for (let col = 0; col < 3; col++) {
        const x = col * 96 + (row % 2) * 48;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + 64);
        ctx.stroke();
      }
    }
    for (let i = 0; i < 14; i++) blotch(ctx, rand() * size, rand() * size, 8 + rand() * 18, '#5f7f3a', 0.45);
    return toTexture(c);
  });
}

/** Carved relief panels for the candi terraces. */
export function reliefTexture() {
  return cached('relief', () => {
    const [c, ctx] = canvas(512, 128);
    ctx.drawImage(stoneTexture().image as HTMLCanvasElement, 0, 0, 256, 128);
    ctx.drawImage(stoneTexture().image as HTMLCanvasElement, 256, 0, 256, 128);
    const dark = 'rgba(60,54,46,0.6)';
    const light = 'rgba(255,255,255,0.28)';
    ctx.fillStyle = dark;
    ctx.fillRect(0, 0, 512, 8);
    ctx.fillRect(0, 120, 512, 8);
    for (let p = 0; p < 4; p++) {
      const x0 = p * 128 + 8;
      ctx.strokeStyle = dark;
      ctx.lineWidth = 3;
      ctx.strokeRect(x0, 16, 112, 96);
      ctx.strokeStyle = light;
      ctx.lineWidth = 1;
      ctx.strokeRect(x0 + 2, 18, 112, 96);
      // little carved scene: figures and a tree
      ctx.fillStyle = dark;
      for (let f = 0; f < 3; f++) {
        const fx = x0 + 22 + f * 32;
        ctx.beginPath();
        ctx.arc(fx, 44, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(fx - 7, 52, 14, 30);
        ctx.fillRect(fx - 12, 56, 24, 5);
        ctx.fillRect(fx - 6, 82, 4, 20);
        ctx.fillRect(fx + 2, 82, 4, 20);
      }
      ctx.beginPath();
      ctx.arc(x0 + 100, 40, 9, 0, Math.PI * 2);
      ctx.fill();
    }
    return toTexture(c);
  });
}

/** Terracotta roof tiles in rows (v runs up the roof). */
export function roofTexture(base = '#b9562f') {
  return cached(`roof${base}`, () => {
    const size = 256;
    const [c, ctx] = canvas(size);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, size, size);
    const rows = 12;
    const h = size / rows;
    for (let r = 0; r < rows; r++) {
      const g = ctx.createLinearGradient(0, r * h, 0, (r + 1) * h);
      g.addColorStop(0, 'rgba(255,255,255,0.12)');
      g.addColorStop(1, 'rgba(0,0,0,0.35)');
      ctx.fillStyle = g;
      ctx.fillRect(0, r * h, size, h);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      for (let x = (r % 2) * 8; x < size; x += 16) ctx.fillRect(x, r * h, 1.5, h);
    }
    return toTexture(c);
  });
}

export function thatchTexture() {
  return cached('thatch', () => {
    const size = 256;
    const [c, ctx] = canvas(size);
    const rand = mulberry32(4);
    ctx.fillStyle = '#c9a35b';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 1600; i++) {
      ctx.strokeStyle = rand() > 0.5 ? 'rgba(120,88,40,0.5)' : 'rgba(240,214,150,0.5)';
      ctx.lineWidth = 1 + rand();
      const x = rand() * size;
      const y = rand() * size;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (rand() - 0.5) * 4, y + 14 + rand() * 16);
      ctx.stroke();
    }
    return toTexture(c);
  });
}

export function woodTexture() {
  return cached('wood', () => {
    const size = 256;
    const [c, ctx] = canvas(size);
    const rand = mulberry32(8);
    ctx.fillStyle = '#c99a62';
    ctx.fillRect(0, 0, size, size);
    for (let p = 0; p < 8; p++) {
      const y = p * 32;
      ctx.fillStyle = p % 2 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)';
      ctx.fillRect(0, y, size, 32);
      ctx.fillStyle = 'rgba(60,35,15,0.55)';
      ctx.fillRect(0, y, size, 2);
      for (let g = 0; g < 9; g++) {
        ctx.strokeStyle = 'rgba(90,55,25,0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const gy = y + 4 + rand() * 26;
        ctx.moveTo(0, gy);
        ctx.bezierCurveTo(size * 0.3, gy + (rand() - 0.5) * 6, size * 0.6, gy + (rand() - 0.5) * 6, size, gy);
        ctx.stroke();
      }
    }
    return toTexture(c);
  });
}

/** Soft radial glow used for lamp halos (additive sprites). */
export function glowTexture() {
  return cached('glow', () => {
    const size = 128;
    const [c, ctx] = canvas(size);
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.45)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  });
}
