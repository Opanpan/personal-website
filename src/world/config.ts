import { projects } from '@/lib/projects';

/**
 * World layout. North is -z, the camera looks north from the south.
 * All gameplay happens on the y=0 plane; landmarks are purely visual on top of it.
 */

export const LAND_RADIUS = 53; // walkable grass/sand radius
export const ISLAND_RADIUS = 58; // visible sand edge
export const PLAYER_RADIUS = 0.45;
export const SPAWN = { x: 0, z: 11 };

export const PIER = { halfWidth: 1.5, start: 50, end: 72, deck: 0.35 };

export const ZONES = {
  plaza: { x: 0, z: 0 },
  joglo: { x: -22, z: -6 },
  candi: { x: 0, z: -34 },
  pasar: { x: 26, z: -6 },
  sawah: { x: -28, z: 25 },
  saung: { x: -17, z: 23 },
  beringin: { x: 18, z: 20 },
  pier: { x: 0, z: 62 },
} as const;

export type InteractKind =
  | 'welcome'
  | 'about'
  | 'experience'
  | 'education'
  | 'project'
  | 'skills'
  | 'quote'
  | 'contact';

export type QuestGroup = 'welcome' | 'about' | 'experience' | 'projects' | 'skills' | 'quote' | 'contact';

export interface Interactable {
  id: string;
  kind: InteractKind;
  group: QuestGroup;
  /** experience position key / project id */
  ref?: string;
  x: number;
  z: number;
  radius: number;
  /** height of the floating marker */
  markerY: number;
}

export const EXPERIENCE_ORDER = ['jojonomic', 'lawencon', 'pcs'] as const;

const STUPA_SPOTS: Record<(typeof EXPERIENCE_ORDER)[number], { x: number; z: number }> = {
  jojonomic: { x: -5.5, z: -13 },
  lawencon: { x: 5.5, z: -17 },
  pcs: { x: -5.5, z: -21 },
};
export const stupaSpot = (key: (typeof EXPERIENCE_ORDER)[number]) => STUPA_SPOTS[key];

export const PASAR_RING = 9;
export const stallAngle = (i: number) => (i / projects.length) * Math.PI * 2 + Math.PI / projects.length;
export const stallSpot = (i: number, r = PASAR_RING) => ({
  x: ZONES.pasar.x + Math.cos(stallAngle(i)) * r,
  z: ZONES.pasar.z + Math.sin(stallAngle(i)) * r,
});

export const interactables: Interactable[] = [
  { id: 'welcome', kind: 'welcome', group: 'welcome', x: 0, z: 5, radius: 3, markerY: 3.2 },
  { id: 'about', kind: 'about', group: 'about', x: ZONES.joglo.x, z: 0.6, radius: 3, markerY: 3.4 },
  ...EXPERIENCE_ORDER.map((key) => {
    const s = STUPA_SPOTS[key];
    const side = s.x < 0 ? 1 : -1;
    return {
      id: `exp_${key}`,
      kind: 'experience' as const,
      group: 'experience' as const,
      ref: key,
      x: s.x + side * 3.1, // clear of the stupa base so the marker ring doesn't run into it
      z: s.z,
      radius: 2.6,
      markerY: 5.2,
    };
  }),
  { id: 'education', kind: 'education', group: 'experience', x: 0, z: -21.5, radius: 3, markerY: 3.2 },
  ...projects.map((p, i) => {
    const s = stallSpot(i, PASAR_RING - 3.6);
    return {
      id: `project_${p.id}`,
      kind: 'project' as const,
      group: 'projects' as const,
      ref: p.id,
      x: s.x,
      z: s.z,
      radius: 2.2,
      markerY: 3.6,
    };
  }),
  { id: 'skills', kind: 'skills', group: 'skills', x: ZONES.saung.x, z: ZONES.saung.z - 4, radius: 3, markerY: 4.6 },
  { id: 'quote', kind: 'quote', group: 'quote', x: ZONES.beringin.x, z: ZONES.beringin.z - 5.4, radius: 3, markerY: 3 },
  { id: 'contact', kind: 'contact', group: 'contact', x: 0, z: PIER.end - 1.5, radius: 3, markerY: 3.4 },
];

export const QUEST_GROUPS: QuestGroup[] = ['welcome', 'about', 'experience', 'projects', 'skills', 'quote', 'contact'];

/** Where fast travel drops the player for each quest group */
export const TRAVEL_POINTS: Record<QuestGroup, { x: number; z: number }> = {
  welcome: { x: 0, z: 9 },
  about: { x: ZONES.joglo.x, z: 4 },
  experience: { x: 0, z: -9 },
  projects: { x: ZONES.pasar.x - 3, z: ZONES.pasar.z + 2 },
  skills: { x: ZONES.saung.x + 1, z: ZONES.saung.z - 6.5 },
  quote: { x: ZONES.beringin.x, z: ZONES.beringin.z - 8 },
  contact: { x: 0, z: PIER.end - 5 },
};

// ---------------------------------------------------------------------------
// Paths between the plaza and each landmark (rendered as dirt strips)
// ---------------------------------------------------------------------------
export type Segment = [number, number, number, number];
export const PATHS: Segment[] = [
  [0, 0, ZONES.joglo.x, 1.5],
  [0, 0, 0, -22],
  [0, 0, ZONES.pasar.x - 6, ZONES.pasar.z + 1],
  [0, 0, ZONES.saung.x + 2, ZONES.saung.z - 4],
  [0, 0, ZONES.beringin.x - 2, ZONES.beringin.z - 5],
  [0, 0, 0, PIER.start + 1],
];

export function distToSegment(px: number, pz: number, [ax, az, bx, bz]: Segment) {
  const dx = bx - ax;
  const dz = bz - az;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz));
}

// ---------------------------------------------------------------------------
// Candi (Borobudur-style temple) shape, shared by the mesh and its colliders. Local to ZONES.candi.
// ---------------------------------------------------------------------------
/** square level sizes, bottom to top */
export const CANDI_LEVELS = [17, 14.4, 11.8, 9.2, 6.6];
export const CANDI_LEVEL_H = 1.5;
export const CANDI_STAIR_HALF_WIDTH = 1.3;
/**
 * Stairway up the south face: four low steps per level, each within STEP_UP so it can be walked.
 * Each level is 1.3 smaller on every side, so four steps of 0.325 land exactly on the next level.
 */
export const CANDI_STEPS = Array.from({ length: CANDI_LEVELS.length * 4 }, (_, i) => {
  const depth = (CANDI_LEVELS[0] - CANDI_LEVELS[1]) / 2 / 4;
  const outer = CANDI_LEVELS[0] / 2 + 4 * depth - i * depth;
  return { top: ((i + 1) * CANDI_LEVEL_H) / 4, z0: outer - depth, z1: outer };
});
/** gateway (kori) with the kala head over the foot of the stairway */
export const CANDI_GATE = { z: CANDI_LEVELS[0] / 2 + 1.3 + 0.35, halfSpan: 1.75 };
/** small stupas lining the upper three terraces (local x, top-of-level y, z) */
export const CANDI_STUPAS = [2, 3, 4].flatMap((lvl) => {
  const size = CANDI_LEVELS[lvl] - 1.4;
  const y = (lvl + 1) * CANDI_LEVEL_H;
  const n = Math.max(2, Math.floor(size / 2.4));
  const out: { x: number; y: number; z: number }[] = [];
  for (let i = 0; i <= n; i++) {
    const u = -size / 2 + (size * i) / n;
    for (const [x, z] of [
      [u, -size / 2],
      [u, size / 2],
      [-size / 2, u],
      [size / 2, u],
    ]) {
      if (z === size / 2 && Math.abs(x) < 1.6) continue; // leave the stairway clear
      out.push({ x, y, z });
    }
  }
  return out;
});

// ---------------------------------------------------------------------------
// Collision
// ---------------------------------------------------------------------------
// `h` is the height of an obstacle's top surface. Obstacles with `h` can be jumped over and
// stood on; obstacles without it (walls, trunks, poles) block at any height.
interface Circle {
  x: number;
  z: number;
  r: number;
  h?: number;
}
interface Box {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  h?: number;
}
/** ledges up to this high are stepped onto without jumping */
const STEP_UP = 0.4;
const passable = (h: number | undefined, feet: number) => h !== undefined && h <= feet + STEP_UP;

export const circleColliders: Circle[] = [
  { x: 4.2, z: -3.5, r: 0.35 }, // flag pole
  // Monas corner posts: knee-high once you're on the plinth
  ...[-1, 1].flatMap((sx) => [-1, 1].map((sz) => ({ x: sx * 2.65, z: sz * 2.65, r: 0.2, h: 1.6 }))),
  // Candi: stupas on the terraces, the crowning stupa, and the gateway pillars
  // (stupa geometry is ~2.6 tall at scale 1: small ones are scale 0.5, the crowning one 2.3)
  ...CANDI_STUPAS.map((st) => ({ x: ZONES.candi.x + st.x, z: ZONES.candi.z + st.z, r: 0.5, h: st.y + 1.3 })),
  { x: ZONES.candi.x, z: ZONES.candi.z, r: 2.3, h: CANDI_LEVELS.length * CANDI_LEVEL_H + 6 },
  ...[-1, 1].map((sx) => ({ x: ZONES.candi.x + sx * CANDI_GATE.halfSpan, z: ZONES.candi.z + CANDI_GATE.z, r: 0.3 })),
  ...EXPERIENCE_ORDER.map((k) => ({ ...STUPA_SPOTS[k], r: 1.5 })),
  ...projects.map((_, i) => ({ ...stallSpot(i), r: 1.9 })),
  { x: ZONES.pasar.x, z: ZONES.pasar.z, r: 1.6 }, // pasar centre tree
  { x: ZONES.beringin.x, z: ZONES.beringin.z, r: 2.8 },
];

export const boxColliders: Box[] = [
  // Monas: plinth + upper plinth (hop up), the column itself blocks
  { minX: -2.8, maxX: 2.8, minZ: -2.8, maxZ: 2.8, h: 0.7 },
  { minX: -2.1, maxX: 2.1, minZ: -2.1, maxZ: 2.1, h: 1.6 },
  { minX: -0.75, maxX: 0.75, minZ: -0.75, maxZ: 0.75 },
  { minX: ZONES.joglo.x - 5.6, maxX: ZONES.joglo.x + 5.6, minZ: ZONES.joglo.z - 5.2, maxZ: ZONES.joglo.z + 5 }, // Joglo
  // Candi: each level is a platform, reached by the stairway on the south face
  ...CANDI_LEVELS.map((size, i) => ({
    minX: ZONES.candi.x - size / 2,
    maxX: ZONES.candi.x + size / 2,
    minZ: ZONES.candi.z - size / 2,
    maxZ: ZONES.candi.z + size / 2,
    h: (i + 1) * CANDI_LEVEL_H,
  })),
  ...CANDI_STEPS.map((st) => ({
    minX: ZONES.candi.x - CANDI_STAIR_HALF_WIDTH,
    maxX: ZONES.candi.x + CANDI_STAIR_HALF_WIDTH,
    minZ: ZONES.candi.z + st.z0,
    maxZ: ZONES.candi.z + st.z1,
    h: st.top,
  })),
  // Sawah terraces: three stepped paddies (matches TERRACES in Landmarks)
  { minX: -37, maxX: -21, minZ: 17, maxZ: 33, h: 0.35 },
  { minX: -37, maxX: -26, minZ: 17, maxZ: 33, h: 0.8 },
  { minX: -37, maxX: -31, minZ: 17, maxZ: 33, h: 1.25 },
  { minX: ZONES.saung.x - 2.3, maxX: ZONES.saung.x + 2.3, minZ: ZONES.saung.z - 2.3, maxZ: ZONES.saung.z + 2.3 }, // Saung
];

// Decorative props that still block movement
export const GAPURA = { z: -10, halfGap: 2.1 };
export const DWARAPALA = [
  { x: -3, z: -24.4 },
  { x: 3, z: -24.4 },
];
export const PRASASTI = { x: ZONES.beringin.x, z: ZONES.beringin.z - 3.1 };
export const PENJOR: { x: number; z: number; side: number }[] = [22, 30, 38, 46].flatMap((z) => [
  { x: -2.3, z, side: -1 },
  { x: 2.3, z, side: 1 },
]);
/** Torches every ~9m along each path, alternating sides */
export const TORCHES: { x: number; z: number }[] = PATHS.flatMap(([ax, az, bx, bz], pi) => {
  const len = Math.hypot(bx - ax, bz - az);
  const nx = -(bz - az) / len;
  const nz = (bx - ax) / len;
  const out: { x: number; z: number }[] = [];
  for (let d = 12, k = 0; d < len - 3; d += 9, k++) {
    if (pi === 5 && d > 18) break; // pier path has penjor instead
    const side = k % 2 === 0 ? 1 : -1;
    out.push({ x: ax + ((bx - ax) * d) / len + nx * 1.9 * side, z: az + ((bz - az) * d) / len + nz * 1.9 * side });
  }
  return out;
});

export const BAKSO_CART = { x: 11, z: 4 };
export const BEACH_SPOTS = [
  { x: -23, z: 44.4 },
  { x: 29, z: 40.6 },
];

/**
 * Interactive props (not part of the quest). The gong, swing and bakso bowl get a proximity
 * prompt like the story markers; torches are click-to-toggle so walking a path isn't noisy.
 */
export type PropKind = 'gong' | 'swing' | 'bakso';
export interface PropSpot {
  id: string;
  kind: PropKind;
  x: number;
  z: number;
  radius: number;
}
export const propSpots: PropSpot[] = [
  // in front of the Joglo veranda, left of the door
  { id: 'prop_gong', kind: 'gong', x: ZONES.joglo.x - 3.4, z: -0.4, radius: 2 },
  { id: 'prop_swing', kind: 'swing', x: ZONES.beringin.x + 3.2, z: ZONES.beringin.z - 2.6, radius: 1.8 },
  { id: 'prop_bakso', kind: 'bakso', x: BAKSO_CART.x - 1.4, z: BAKSO_CART.z - 1.6, radius: 2 },
];
/** World position of the gamelan gong on the Joglo veranda (for the hit animation / sound). */
export const GONG_POS = { x: ZONES.joglo.x - 0.7, z: ZONES.joglo.z + 3.7 };

circleColliders.push(
  { ...BAKSO_CART, r: 1.2 },
  ...BEACH_SPOTS.map((b) => ({ ...b, r: 0.5 })),
  { x: -1.1, z: PIER.end - 6, r: 0.45, h: 0.9 }, // barrels on the pier
  { x: -1.1, z: PIER.end - 6.9, r: 0.45, h: 0.9 },
  { x: -26, z: 27, r: 0.2 }, // scarecrow pole on the terraces
  { x: -GAPURA.halfGap - 1.1, z: GAPURA.z, r: 1.2 },
  { x: GAPURA.halfGap + 1.1, z: GAPURA.z, r: 1.2 },
  ...DWARAPALA.map((d) => ({ ...d, r: 0.6 })),
  { ...PRASASTI, r: 0.7 },
  ...PENJOR.map((p) => ({ x: p.x, z: p.z, r: 0.25 })),
  ...TORCHES.map((t) => ({ ...t, r: 0.2 }))
);

/** Distance from (x, z) to the nearest obstacle edge (0 when inside one). */
export function obstacleClearance(x: number, z: number) {
  let d = Infinity;
  for (const c of circleColliders) d = Math.min(d, Math.hypot(x - c.x, z - c.z) - c.r);
  for (const b of boxColliders) d = Math.min(d, Math.hypot(Math.max(b.minX - x, 0, x - b.maxX), Math.max(b.minZ - z, 0, z - b.maxZ)));
  return Math.max(0, d);
}

export function addCircleCollider(x: number, z: number, r: number, h?: number) {
  circleColliders.push({ x, z, r, h });
}

/**
 * Height of the surface under (x, z) for feet currently at `feet` (relative to the ground / pier deck):
 * the top of the highest obstacle the player is above or can step onto, else 0.
 */
export function groundAt(x: number, z: number, feet: number) {
  // stay on a ledge until the body's centre is past its edge
  const edge = PLAYER_RADIUS * 0.5;
  let floor = 0;
  for (const c of circleColliders) {
    if (!passable(c.h, feet) || c.h! <= floor) continue;
    if (Math.hypot(x - c.x, z - c.z) < c.r + edge) floor = c.h!;
  }
  for (const b of boxColliders) {
    if (!passable(b.h, feet) || b.h! <= floor) continue;
    if (x > b.minX - edge && x < b.maxX + edge && z > b.minZ - edge && z < b.maxZ + edge) floor = b.h!;
  }
  return floor;
}

/** Height used for box obstacles with no `h` (walls, buildings) when keeping the camera out. */
const SOLID_BOX_HEIGHT = 8;

/**
 * Is this 3D point inside a solid structure? Used to stop the camera entering buildings, the candi
 * levels, terraces, plinths and rocks. Thin obstacles without a height (trunks, poles) are ignored —
 * those fade instead.
 */
export function insideSolid(x: number, y: number, z: number, pad = 0.3) {
  for (const b of boxColliders) {
    if (y < (b.h ?? SOLID_BOX_HEIGHT) + pad && x > b.minX - pad && x < b.maxX + pad && z > b.minZ - pad && z < b.maxZ + pad) return true;
  }
  for (const c of circleColliders) {
    if (c.h !== undefined && y < c.h + pad && Math.hypot(x - c.x, z - c.z) < c.r + pad) return true;
  }
  return false;
}

/**
 * Push a desired position out of obstacles and keep it on land / on the pier.
 * `feet` is how high the player is; obstacles whose top is within a step of it don't block.
 */
export function resolvePosition(x: number, z: number, prevX: number, prevZ: number, feet = 0): [number, number] {
  const pr = PLAYER_RADIUS;

  for (const c of circleColliders) {
    if (passable(c.h, feet)) continue;
    const dx = x - c.x;
    const dz = z - c.z;
    const min = c.r + pr;
    const d2 = dx * dx + dz * dz;
    if (d2 < min * min) {
      const d = Math.sqrt(d2) || 0.0001;
      x = c.x + (dx / d) * min;
      z = c.z + (dz / d) * min;
    }
  }

  for (const b of boxColliders) {
    if (passable(b.h, feet)) continue;
    const cx = Math.max(b.minX, Math.min(x, b.maxX));
    const cz = Math.max(b.minZ, Math.min(z, b.maxZ));
    const dx = x - cx;
    const dz = z - cz;
    const d2 = dx * dx + dz * dz;
    if (d2 < pr * pr) {
      if (d2 > 0.000001) {
        const d = Math.sqrt(d2);
        x = cx + (dx / d) * pr;
        z = cz + (dz / d) * pr;
      } else {
        // centre is inside the box: push out along the shallowest axis
        const pushes = [
          [b.minX - pr - x, 0],
          [b.maxX + pr - x, 0],
          [0, b.minZ - pr - z],
          [0, b.maxZ + pr - z],
        ];
        pushes.sort((a, b2) => Math.abs(a[0] + a[1]) - Math.abs(b2[0] + b2[1]));
        x += pushes[0][0];
        z += pushes[0][1];
      }
    }
  }

  const r = Math.hypot(x, z);
  if (r > LAND_RADIUS) {
    const wasOnPier = Math.hypot(prevX, prevZ) > LAND_RADIUS - 0.5 && Math.abs(prevX) <= PIER.halfWidth + 0.01 && prevZ > 0;
    const canEnterPier = z > 0 && Math.abs(x) <= PIER.halfWidth;
    if (wasOnPier || canEnterPier) {
      x = Math.max(-PIER.halfWidth, Math.min(PIER.halfWidth, x));
      z = Math.min(z, PIER.end - 0.6);
    } else {
      x = (x / r) * LAND_RADIUS;
      z = (z / r) * LAND_RADIUS;
    }
  }
  return [x, z];
}

export const isOnPier = (x: number, z: number) => z > PIER.start - 1 && Math.abs(x) <= PIER.halfWidth + 0.2 && Math.hypot(x, z) > LAND_RADIUS - 3;

/** Deterministic RNG so decoration is stable across renders */
export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Spots where decoration must not be placed */
const KEEP_OUT: Circle[] = [
  { x: 0, z: 0, r: 10 },
  { x: ZONES.joglo.x, z: ZONES.joglo.z, r: 9 },
  { x: 0, z: -30, r: 14 },
  { x: 0, z: -17, r: 9 },
  { x: ZONES.pasar.x, z: ZONES.pasar.z, r: 13 },
  { x: -28, z: 25, r: 11 },
  { x: ZONES.saung.x, z: ZONES.saung.z, r: 6 },
  { x: ZONES.beringin.x, z: ZONES.beringin.z, r: 8 },
  { x: 11, z: 4, r: 3 },
  { x: -23, z: 44.4, r: 4 },
  { x: 29, z: 40.6, r: 4 },
];

export function isFreeForDecoration(x: number, z: number, margin = 0) {
  if (KEEP_OUT.some((k) => Math.hypot(x - k.x, z - k.z) < k.r + margin)) return false;
  if (PATHS.some((s) => distToSegment(x, z, s) < 2.8 + margin)) return false;
  return true;
}
