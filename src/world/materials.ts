import * as THREE from 'three';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';

const cache = new Map<string, THREE.MeshLambertMaterial>();

/**
 * Shared flat-shaded low-poly material, cached by colour + options.
 * Lambert rather than Standard: far cheaper to compile and shade on integrated GPUs,
 * and with flat shading the low-poly look is the same.
 */
export function mat(color: string, opts: { emissive?: string; emissiveIntensity?: number; flat?: boolean } = {}) {
  const key = `${color}|${opts.emissive ?? ''}|${opts.emissiveIntensity ?? 0}|${opts.flat ?? true}`;
  let m = cache.get(key);
  if (!m) {
    m = new THREE.MeshLambertMaterial({
      color,
      flatShading: opts.flat ?? true,
      emissive: opts.emissive ?? '#000000',
      emissiveIntensity: opts.emissiveIntensity ?? 0,
    });
    cache.set(key, m);
  }
  return m;
}

export const C = {
  grass: '#79c25a',
  grassDark: '#5ea546',
  sand: '#f1dca4',
  path: '#d8b685',
  stone: '#8d877c',
  stoneDark: '#6f6a61',
  stoneLight: '#aaa395',
  wood: '#8b5a2b',
  woodDark: '#5c3a1e',
  woodLight: '#b98550',
  roofJoglo: '#4a2e1f',
  terracotta: '#b9562f',
  thatch: '#c9a35b',
  cream: '#f3e6c8',
  gold: '#f2c94c',
  white: '#fbfaf5',
  red: '#d62828',
  leaf: '#3f8f3a',
  leafLight: '#5bb04a',
  palmLeaf: '#4f9d3a',
  trunk: '#7a5634',
  water: '#2bb3c0',
  skin: '#c68a5a',
  black: '#1f1b18',
};

let batik: THREE.CanvasTexture | null = null;

/** Procedural kawung-style batik pattern used on the player's shirt. */
export function batikTexture() {
  if (batik) return batik;
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#7a3b12';
  ctx.fillRect(0, 0, size, size);
  const cell = 32;
  for (let y = 0; y < size; y += cell) {
    for (let x = 0; x < size; x += cell) {
      const cx = x + cell / 2;
      const cy = y + cell / 2;
      ctx.fillStyle = '#e8b04a';
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2 + Math.PI / 4;
        ctx.beginPath();
        ctx.ellipse(cx + Math.cos(a) * 7, cy + Math.sin(a) * 7, 6, 3.6, a, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#3b1a07';
      ctx.beginPath();
      ctx.arc(cx, cy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  batik = new THREE.CanvasTexture(canvas);
  batik.colorSpace = THREE.SRGBColorSpace;
  batik.wrapS = batik.wrapT = THREE.RepeatWrapping;
  batik.magFilter = THREE.NearestFilter;
  return batik;
}

/** mergeGeometries needs every part to share the same index layout. */
export const nonIndexed = (g: THREE.BufferGeometry) => (g.index ? g.toNonIndexed() : g);

const texCache = new Map<string, THREE.MeshLambertMaterial>();

/** Cached flat-shaded material with a texture (tinted by `color`), optionally repeated. */
export function texMat(map: THREE.Texture, color = '#ffffff', repeat: [number, number] = [1, 1], opts: { emissive?: string; emissiveIntensity?: number } = {}) {
  const key = `${map.uuid}|${color}|${repeat.join('x')}|${opts.emissive ?? ''}|${opts.emissiveIntensity ?? 0}`;
  let m = texCache.get(key);
  if (!m) {
    let t = map;
    if (repeat[0] !== 1 || repeat[1] !== 1) {
      t = map.clone(); // shares the uploaded image, only the UV transform differs
      t.repeat.set(repeat[0], repeat[1]);
      t.needsUpdate = true;
    }
    m = new THREE.MeshLambertMaterial({
      map: t,
      color,
      flatShading: true,
      emissive: opts.emissive ?? '#000000',
      emissiveIntensity: opts.emissiveIntensity ?? 0,
    });
    texCache.set(key, m);
  }
  return m;
}

/**
 * True for the first few rendered frames. Day-only and night-only objects stay visible
 * during warm-up so their shaders compile with the initial load — otherwise toggling
 * day/night compiles them on the spot and freezes weaker GPUs for seconds.
 */
export function useWarmup(frames = 3) {
  const [warm, setWarm] = useState(true);
  const n = useRef(0);
  useFrame(() => {
    if (warm && ++n.current >= frames) setWarm(false);
  });
  return warm;
}
