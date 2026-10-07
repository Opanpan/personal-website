import React, { useMemo, useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import { useTranslation } from 'react-i18next';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { projects } from '@/lib/projects';
import { BAKSO_CART, mulberry32, PIER, stallSpot, ZONES } from '../config';
import { getState } from '../store';
import { now } from '../runtime';
import { clickProp } from './Landmarks';
import { audio } from '../audio';
import { runtime } from '../runtime';
import { C, mat, useWarmup } from '../materials';
import { animateLimbs, Character, Look } from './Character';

const VISIBLE_RANGE = 60;

const SKINS = ['#c68a5a', '#b5784a', '#d9a273', '#a86b40'];
const SHIRTS = ['#e76f51', '#2a9d8f', '#e9c46a', '#264653', '#f4a261', '#8ab17d', '#d62828', '#457b9d'];

function look(i: number, extra: Partial<Look> = {}): Look {
  return {
    shirt: SHIRTS[i % SHIRTS.length],
    pants: i % 2 ? '#3d405b' : '#5c4033',
    skin: SKINS[i % SKINS.length],
    hat: (['none', 'peci', 'hijab', 'caping'] as const)[i % 4],
    hatColor: ['#7c3aed', '#db2777', '#0ea5e9', '#e3c27a'][i % 4],
    sarung: i % 3 === 0 ? '#6b2737' : undefined,
    ...extra,
  };
}

type Pose = 'idle' | 'sit' | 'bend' | 'wave';

/** Hip pivot height in Character space, and half the thigh thickness. A sitting villager's
 *  `position` is the seat surface; the body drops so the thighs rest exactly on it. */
const HIP_Y = 0.8;
const THIGH_HALF = 0.12;
const SIT_DROP = -(HIP_Y - THIGH_HALF);

// ---------------------------------------------------------------------------
// Talking — walk up to a villager and they say something (lines live in locales: world.npc.<id>)
// ---------------------------------------------------------------------------
const TALK_RANGE = 3.6;
const LINE_SECONDS = 4.5;

interface TalkProps {
  /** dialogue id in world.npc.<id>; omit for villagers who don't talk */
  npc?: string;
  /** voice pitch for the chatter blips */
  pitch?: number;
  talkRange?: number;
}

/** Shows/advances a speech bubble while the player is close. Only re-renders when the line changes. */
function useTalk(npc: string | undefined, pitch: number, range: number) {
  const [line, setLine] = useState<number | null>(null);
  const live = useRef({ talking: false, line: 0, timer: 0 });

  const update = (x: number, z: number, dt: number) => {
    if (!npc) return false;
    const s = getState();
    const near = s.started && !s.panel && !s.mapOpen && Math.hypot(x - runtime.player.x, z - runtime.player.z) < range;
    const r = live.current;
    if (near && !r.talking) {
      r.talking = true;
      r.timer = 0;
      setLine(r.line);
      audio.blip(pitch);
    } else if (!near && r.talking) {
      r.talking = false;
      r.line += 1; // next visit starts with a new line
      setLine(null);
    } else if (near) {
      r.timer += dt;
      if (r.timer > LINE_SECONDS) {
        r.timer = 0;
        r.line += 1;
        setLine(r.line);
        audio.blip(pitch);
      }
    }
    return r.talking;
  };

  const advance = () => {
    const r = live.current;
    if (!r.talking) return;
    r.timer = 0;
    r.line += 1;
    setLine(r.line);
    audio.blip(pitch);
  };

  return { line, update, advance };
}

function Bubble({ npc, line, y }: { npc: string; line: number; y: number }) {
  const { t } = useTranslation('common');
  const lines = t(`world.npc.${npc}.lines`, { returnObjects: true }) as string[];
  return (
    <Html position={[0, y, 0]} center zIndexRange={[20, 10]} style={{ pointerEvents: 'none' }}>
      <div key={line} className="npc-bubble" role="status">
        <span className="npc-bubble-name">{t(`world.npc.${npc}.name`)}</span>
        <span className="npc-bubble-text">{lines[line % lines.length]}</span>
      </div>
    </Html>
  );
}

const WAVE_BACK_RANGE = 10;
const WAVE_BACK_SECONDS = 2.6;

/** Someone waved (or rang the bakso bowl) nearby in the last couple of seconds? */
function waveNearby(x: number, z: number) {
  const w = runtime.wave;
  return !!w && now() - w.at < WAVE_BACK_SECONDS && Math.hypot(w.x - x, w.z - z) < WAVE_BACK_RANGE;
}

function faceTowards(g: THREE.Object3D, yaw: number, dt: number) {
  let diff = yaw - g.rotation.y;
  diff = Math.atan2(Math.sin(diff), Math.cos(diff));
  g.rotation.y += diff * Math.min(1, dt * 6);
}

/** A villager standing / sitting in place with a little idle animation. Hidden when far away. */
function Villager({
  position,
  rotation = 0,
  appearance,
  pose = 'idle',
  seed = 0,
  children,
  npc,
  pitch = 1,
  talkRange = TALK_RANGE,
}: { position: [number, number, number]; rotation?: number; appearance: Look; pose?: Pose; seed?: number; children?: React.ReactNode } & TalkProps) {
  const group = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const limbs = useRef<THREE.Object3D[]>([]);
  const talk = useTalk(npc, pitch, talkRange);

  useFrame((s, dt) => {
    const g = group.current;
    if (!g) return;
    g.visible = Math.hypot(position[0] - runtime.player.x, position[2] - runtime.player.z) < VISIBLE_RANGE;
    if (!g.visible) return;
    const talking = talk.update(position[0], position[2], dt);
    const wavedAt = waveNearby(position[0], position[2]);
    // turn to face the player while chatting or waving back (seated villagers stay put)
    if (pose !== 'sit') {
      const w = runtime.wave;
      const yaw = talking
        ? Math.atan2(runtime.player.x - position[0], runtime.player.z - position[2])
        : wavedAt && w
          ? Math.atan2(w.x - position[0], w.z - position[2])
          : rotation;
      faceTowards(g, yaw, dt);
    }
    const t = s.clock.elapsedTime + seed;
    animateLimbs(limbs.current, 0, false, t, seed);
    const [legL, legR, armL, armR, head] = limbs.current;
    // breathe around the pose's base height (seated villagers sit lower)
    if (body.current) body.current.position.y = (pose === 'sit' ? SIT_DROP : 0) + Math.sin(t * 2) * 0.015;
    if (pose === 'sit' && legL && legR) {
      legL.rotation.x = legR.rotation.x = -1.45;
    }
    if (pose === 'bend' && body.current && armL && armR) {
      // straighten up to chat
      body.current.rotation.x = THREE.MathUtils.lerp(body.current.rotation.x, talking ? 0 : 0.55 + Math.sin(t * 1.5) * 0.08, 0.1);
      if (!talking) armL.rotation.x = armR.rotation.x = -0.9 + Math.sin(t * 3) * 0.25;
    }
    if ((pose === 'wave' || talking || wavedAt) && armR) {
      // waves now and then, while greeting the player, and back at anyone who waves
      const waving = wavedAt || (talking ? Math.sin(t * 0.9) > 0 : Math.sin(t * 0.4) > 0.6);
      armR.rotation.z = waving ? 2.4 + Math.sin(t * 7) * 0.3 : THREE.MathUtils.lerp(armR.rotation.z, 0, 0.1);
      if (!waving && armL && pose === 'wave') armL.rotation.x = -0.5 + Math.sin(t * 1.3) * 0.15;
    }
    if (talking && head) head.rotation.y = 0;
  });

  return (
    <group
      ref={group}
      position={position}
      rotation-y={rotation}
      onClick={(e) => {
        if (talk.line === null) return;
        e.stopPropagation();
        talk.advance();
      }}
    >
      <group ref={body} position-y={pose === 'sit' ? SIT_DROP : 0}>
        <Character look={appearance} limbs={limbs} />
        {children}
      </group>
      {npc && talk.line !== null && <Bubble npc={npc} line={talk.line} y={pose === 'sit' ? 2.15 : 2.75} />}
    </group>
  );
}

/** A villager strolling along a polyline, back and forth. Stops to chat when the player is near. */
function Walker({
  points,
  appearance,
  speed = 1.6,
  seed = 0,
  npc,
  pitch = 1,
  talkRange = TALK_RANGE,
}: { points: [number, number][]; appearance: Look; speed?: number; seed?: number } & TalkProps) {
  const group = useRef<THREE.Group>(null);
  const limbs = useRef<THREE.Object3D[]>([]);
  const lengths = useMemo(() => points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1])), [points]);
  const total = lengths.reduce((a, b) => a + b, 0);
  const state = useRef({ d: (seed * 7) % total, dir: 1, heading: 0, pause: 0 });
  const talk = useTalk(npc, pitch, talkRange);

  useFrame((s, dt) => {
    const g = group.current;
    if (!g) return;
    const st = state.current;
    const talking = talk.update(g.position.x, g.position.z, dt);
    const wavedAt = waveNearby(g.position.x, g.position.z);
    if (talking || wavedAt) {
      // stand still and face the player
    } else if (st.pause > 0) {
      st.pause -= dt;
    } else {
      st.d += speed * dt * st.dir;
      if (st.d > total || st.d < 0) {
        st.d = THREE.MathUtils.clamp(st.d, 0, total);
        st.dir *= -1;
        st.pause = 1.5 + (seed % 3);
      }
    }
    let d = st.d;
    let i = 0;
    while (i < lengths.length - 1 && d > lengths[i]) d -= lengths[i++];
    const [ax, az] = points[i];
    const [bx, bz] = points[i + 1];
    const k = lengths[i] ? d / lengths[i] : 0;
    const x = ax + (bx - ax) * k;
    const z = az + (bz - az) * k;
    g.position.set(x, 0, z);
    g.visible = Math.hypot(x - runtime.player.x, z - runtime.player.z) < VISIBLE_RANGE;
    const target =
      talking || wavedAt ? Math.atan2(runtime.player.x - x, runtime.player.z - z) : Math.atan2((bx - ax) * st.dir, (bz - az) * st.dir);
    let diff = target - st.heading;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff));
    st.heading += diff * Math.min(1, dt * 6);
    g.rotation.y = st.heading;
    const moving = !talking && !wavedAt && st.pause <= 0;
    animateLimbs(limbs.current, s.clock.elapsedTime * 8 + seed, moving, s.clock.elapsedTime, seed);
    const armR = limbs.current[3];
    if (armR) armR.rotation.z = wavedAt || (talking && Math.sin(s.clock.elapsedTime * 0.9) > 0) ? 2.4 + Math.sin(s.clock.elapsedTime * 7) * 0.3 : THREE.MathUtils.lerp(armR.rotation.z, 0, 0.1);
  });

  return (
    <group
      ref={group}
      onClick={(e) => {
        if (talk.line === null) return;
        e.stopPropagation();
        talk.advance();
      }}
    >
      <Character look={appearance} limbs={limbs} />
      {npc && talk.line !== null && <Bubble npc={npc} line={talk.line} y={2.75} />}
    </group>
  );
}

function FishingRod() {
  return (
    <group position={[0.25, 1.05, 0.35]}>
      <mesh rotation-x={0.9} position={[0, 0.6, 0.9]} material={mat('#5c3a1e')}>
        <cylinderGeometry args={[0.02, 0.035, 2.4, 5]} />
      </mesh>
      <mesh position={[0, -0.25, 1.85]} material={mat('#e5e5e5')}>
        <cylinderGeometry args={[0.005, 0.005, 2.4, 3]} />
      </mesh>
      <mesh position={[0, -1.45, 1.85]} material={mat(C.red)}>
        <sphereGeometry args={[0.07, 6, 4]} />
      </mesh>
    </group>
  );
}

function Ducks() {
  const refs = useRef<THREE.Group[]>([]);
  useFrame((s) => {
    const t = s.clock.elapsedTime * 0.35;
    refs.current.forEach((g, i) => {
      if (!g) return;
      const a = t - i * 0.22;
      const x = -23.6 + Math.cos(a) * 1.5;
      const z = 26 + Math.sin(a) * 5;
      g.position.set(x, 0.35 + Math.abs(Math.sin(s.clock.elapsedTime * 6 + i)) * 0.03, z);
      g.rotation.y = Math.atan2(-Math.sin(a) * 1.5, Math.cos(a) * 5);
    });
  });
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={i} ref={(g) => {
          if (g) refs.current[i] = g;
        }} scale={i === 0 ? 1.15 : 0.85}>
          <mesh position={[0, 0.18, 0]} scale={[0.75, 0.6, 1]} material={mat('#fafafa')} castShadow>
            <sphereGeometry args={[0.28, 7, 5]} />
          </mesh>
          <mesh position={[0, 0.42, 0.2]} material={mat('#fafafa')} castShadow>
            <sphereGeometry args={[0.13, 6, 5]} />
          </mesh>
          <mesh position={[0, 0.4, 0.36]} rotation-x={Math.PI / 2} material={mat('#f59e0b')}>
            <coneGeometry args={[0.05, 0.14, 4]} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Birds() {
  const refs = useRef<THREE.Group[]>([]);
  const birds = useMemo(() => Array.from({ length: 7 }).map((_, i) => ({ r: 26 + (i % 3) * 5, y: 22 + (i % 4) * 2, phase: i * 0.6, speed: 0.12 + (i % 2) * 0.03 })), []);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    refs.current.forEach((g, i) => {
      if (!g) return;
      const b = birds[i];
      const a = t * b.speed + b.phase;
      g.position.set(Math.cos(a) * b.r + 5, b.y + Math.sin(t + i) * 0.8, Math.sin(a) * b.r + 10);
      g.rotation.y = -a;
      const flap = Math.sin(t * 9 + i) * 0.6;
      (g.children[0] as THREE.Object3D).rotation.z = flap;
      (g.children[1] as THREE.Object3D).rotation.z = -flap;
    });
  });
  return (
    <>
      {birds.map((_, i) => (
        <group key={i} ref={(g) => {
          if (g) refs.current[i] = g;
        }}>
          <mesh position={[-0.5, 0, 0]} material={mat('#f5f5f5')}>
            <boxGeometry args={[1, 0.04, 0.35]} />
          </mesh>
          <mesh position={[0.5, 0, 0]} material={mat('#f5f5f5')}>
            <boxGeometry args={[1, 0.04, 0.35]} />
          </mesh>
          <mesh material={mat('#d4d4d4')}>
            <boxGeometry args={[0.18, 0.15, 0.6]} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/** Kupu-kupu — butterflies fluttering around the player in daytime */
function Butterflies() {
  const COUNT = 12;
  const refs = useRef<THREE.Group[]>([]);
  const seeds = useMemo(() => {
    const rand = mulberry32(42);
    const colors = ['#f59e0b', '#ec4899', '#38bdf8', '#facc15', '#ffffff', '#a78bfa'];
    return Array.from({ length: COUNT }).map((_, i) => ({ x: (rand() - 0.5) * 30, z: (rand() - 0.5) * 30, p: rand() * 10, color: colors[i % colors.length] }));
  }, []);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    const px = runtime.player.x;
    const pz = runtime.player.z;
    refs.current.forEach((g, i) => {
      if (!g) return;
      const f = seeds[i];
      const x = ((((f.x + Math.sin(t * 0.4 + f.p) * 3 - px) % 30) + 45) % 30) - 15 + px;
      const z = ((((f.z + Math.cos(t * 0.33 + f.p) * 3 - pz) % 30) + 45) % 30) - 15 + pz;
      g.position.set(x, 0.8 + Math.sin(t * 1.7 + f.p) * 0.5 + 0.4, z);
      g.rotation.y = t * 0.8 + f.p;
      const flap = Math.sin(t * 18 + f.p) * 0.9;
      (g.children[0] as THREE.Object3D).rotation.z = flap;
      (g.children[1] as THREE.Object3D).rotation.z = -flap;
    });
  });
  const wing = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.22, 0.18);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const materials = useMemo(() => seeds.map((f) => new THREE.MeshLambertMaterial({ color: f.color, side: THREE.DoubleSide })), [seeds]);
  return (
    <>
      {seeds.map((f, i) => {
        const m = materials[i];
        return (
          <group key={i} ref={(g) => {
            if (g) refs.current[i] = g;
          }}>
            <group>
              <mesh geometry={wing} material={m} position={[-0.11, 0, 0]} />
            </group>
            <group>
              <mesh geometry={wing} material={m} position={[0.11, 0, 0]} />
            </group>
          </group>
        );
      })}
    </>
  );
}

/** Jukung — Balinese outrigger canoes out at sea */
function Jukung({ position, rotation, color, sail }: { position: [number, number, number]; rotation: number; color: string; sail: string }) {
  const g = useRef<THREE.Group>(null);
  const sailGeo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(2.2, 0.3);
    s.lineTo(0.2, 3.4);
    s.lineTo(0, 0);
    return new THREE.ShapeGeometry(s);
  }, []);
  useFrame((s) => {
    if (!g.current) return;
    const t = s.clock.elapsedTime + position[0];
    g.current.position.y = -0.35 + Math.sin(t * 1.3) * 0.12;
    g.current.rotation.z = Math.sin(t * 0.9) * 0.05;
  });
  return (
    <group position={position} rotation-y={rotation}>
      <group ref={g}>
        <mesh scale={[0.5, 0.45, 3.2]} material={mat(color)} castShadow>
          <sphereGeometry args={[1, 8, 6]} />
        </mesh>
        <mesh position={[0, 0.28, 0]} material={mat(C.white)}>
          <boxGeometry args={[0.7, 0.06, 5.2]} />
        </mesh>
        {/* outriggers */}
        {[-1, 1].map((side) => (
          <group key={side}>
            <mesh position={[side * 2.2, 0, 0]} rotation-x={Math.PI / 2} material={mat('#e7d7b0')}>
              <cylinderGeometry args={[0.1, 0.1, 4.6, 5]} />
            </mesh>
            {[-1.2, 1.2].map((z) => (
              <mesh key={z} position={[side * 1.1, 0.35, z]} rotation-z={side * 0.15} material={mat(C.woodDark)}>
                <boxGeometry args={[2.3, 0.07, 0.07]} />
              </mesh>
            ))}
          </group>
        ))}
        <mesh position={[0, 2, 0.4]} material={mat(C.woodDark)}>
          <cylinderGeometry args={[0.04, 0.05, 3.6, 5]} />
        </mesh>
        <mesh geometry={sailGeo} position={[0.05, 0.4, 0.4]} rotation-y={-Math.PI / 2}>
          <meshLambertMaterial color={sail} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

/** Small gamelan set (saron + gong) on the Joglo veranda */
function Gamelan({ position }: { position: [number, number, number] }) {
  const hanger = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!hanger.current) return;
    const age = now() - runtime.gongAt;
    const k = Math.exp(-age / 1.6);
    // swings from the bar and shimmers after a strike
    hanger.current.rotation.x = Math.sin(age * 7) * 0.35 * k;
    gongMat.emissiveIntensity = 0.25 + k * 1.4;
  });
  const gongMat = useMemo(() => new THREE.MeshLambertMaterial({ color: '#b8860b', emissive: '#7a5500', emissiveIntensity: 0.25, flatShading: true }), []);
  return (
    <group position={position}>
      <mesh position={[0, 0.15, 0]} material={mat('#7c2d12')} castShadow>
        <boxGeometry args={[1.1, 0.3, 0.45]} />
      </mesh>
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} position={[-0.45 + i * 0.15, 0.33, 0]} material={mat(C.gold, { emissive: '#7a5a10', emissiveIntensity: 0.2 })}>
          <boxGeometry args={[0.1, 0.04, 0.38]} />
        </mesh>
      ))}
      <group position={[1.1, 0, -0.1]}>
        {[-0.45, 0.45].map((x) => (
          <mesh key={x} position={[x, 0.7, 0]} material={mat('#7c2d12')}>
            <boxGeometry args={[0.1, 1.4, 0.1]} />
          </mesh>
        ))}
        <mesh position={[0, 1.35, 0]} material={mat('#7c2d12')}>
          <boxGeometry args={[1, 0.1, 0.1]} />
        </mesh>
        <group ref={hanger} position={[0, 1.3, 0]}>
          <mesh
            position={[0, -0.45, 0]}
            rotation-x={Math.PI / 2}
            material={gongMat}
            castShadow
            onClick={clickProp('prop_gong')}
            onPointerOver={() => (document.body.style.cursor = 'pointer')}
            onPointerOut={() => (document.body.style.cursor = '')}
          >
            <cylinderGeometry args={[0.36, 0.36, 0.12, 14]} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

export default function Life({ quality, night }: { quality: 'high' | 'low'; night: boolean }) {
  const warm = useWarmup();
  const sellers = useMemo(
    () =>
      projects.map((_, i) => {
        const s = stallSpot(i);
        const face = Math.atan2(ZONES.pasar.x - s.x, ZONES.pasar.z - s.z);
        return { x: s.x - Math.sin(face) * 0.2, z: s.z - Math.cos(face) * 0.2, face };
      }),
    []
  );

  return (
    <>
      {sellers.map((s, i) => (
        <Villager
          key={i}
          position={[s.x, 0, s.z]}
          rotation={s.face}
          appearance={look(i + 1)}
          pose="wave"
          seed={i * 1.7}
          npc={`seller_${projects[i].id}`}
          pitch={0.85 + (i % 4) * 0.12}
          talkRange={4.4}
        />
      ))}
      {/* farmer bending over the rice */}
      <Villager position={[-31, 0.8, 27.5]} rotation={-0.6} appearance={look(3, { hat: 'caping', shirt: '#f1f5f9', pants: '#3f3f46' })} pose="bend" seed={2} />
      <Villager position={[-22.3, 0.35, 18.4]} rotation={2.6} appearance={look(7, { hat: 'caping', hatColor: '#d6b36a' })} pose="bend" seed={5} npc="farmer" pitch={0.8} />
      {/* fisherman on the end of the pier */}
      <Villager position={[1.05, PIER.deck, PIER.end - 3]} rotation={Math.PI / 2} appearance={look(5, { hat: 'caping' })} pose="sit" seed={1} npc="fisherman" pitch={0.7}>
        <FishingRod />
      </Villager>
      {/* gamelan player on the Joglo veranda */}
      <Villager position={[ZONES.joglo.x - 3, 0.7, ZONES.joglo.z + 3.8]} rotation={Math.PI / 2} appearance={look(2, { hat: 'hijab', hatColor: '#be185d', shirt: '#fde68a' })} pose="sit" seed={3} npc="gamelan" pitch={1.25} talkRange={4.6} />
      <Gamelan position={[ZONES.joglo.x - 1.8, 0.65, ZONES.joglo.z + 3.8]} />
      {/* people out for a stroll */}
      <Walker points={[[-1.2, 13], [-1.2, 47]]} appearance={look(4, { hat: 'hijab', hatColor: '#0ea5e9' })} speed={1.5} seed={1} npc="walker_pier" pitch={1.2} />
      {/* bakso seller minding the cart */}
      <Villager
        position={[BAKSO_CART.x + 0.7, 0, BAKSO_CART.z - 0.56]}
        rotation={-0.9}
        appearance={look(0, { hat: 'none', shirt: '#f8fafc', pants: '#1e3a8a' })}
        seed={6}
        npc="bakso"
        pitch={0.9}
      />
      {quality === 'high' && (
        <>
          <Walker points={[[3.5, 1.5], [10, -1.3], [18, -4.6]]} appearance={look(6)} speed={1.7} seed={2} npc="walker_pasar" pitch={1.15} />
          <Walker
            points={Array.from({ length: 17 }).map((_, i) => {
              const a = (i / 16) * Math.PI * 2;
              return [Math.cos(a) * 10.4, Math.sin(a) * 10.4] as [number, number];
            })}
            appearance={look(0, { hat: 'peci', sarung: '#1e3a8a' })}
            speed={1.3}
            seed={3}
            npc="walker_plaza"
            pitch={0.75}
          />
          <Walker points={[[-3, 2.5], [-12, 2], [-19, 3.5]]} appearance={look(9)} speed={1.4} seed={4} npc="walker_joglo" pitch={1.05} />
        </>
      )}
      <Ducks />
      <Birds />
      <group visible={!night || warm}>
        <Butterflies />
      </group>
      <Jukung position={[-38, 0, 74]} rotation={0.6} color="#0ea5e9" sail="#ef4444" />
      <Jukung position={[72, 0, 18]} rotation={-1.2} color="#facc15" sail="#f8fafc" />
      <Jukung position={[-78, 0, -18]} rotation={2.1} color="#16a34a" sail="#f97316" />
    </>
  );
}
