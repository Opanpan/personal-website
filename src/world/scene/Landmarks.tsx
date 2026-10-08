import React, { createContext, useContext, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { useTranslation } from 'react-i18next';
import { projects } from '@/lib/projects';
import {
  interactables,
  BAKSO_CART,
  BEACH_SPOTS,
  CANDI_GATE,
  CANDI_LEVEL_H,
  CANDI_LEVELS,
  CANDI_STAIR_HALF_WIDTH,
  CANDI_STEPS,
  CANDI_STUPAS,
  DWARAPALA,
  EXPERIENCE_ORDER,
  GAPURA,
  PENJOR,
  PIER,
  PRASASTI,
  stallSpot,
  stupaSpot,
  TORCHES,
  ZONES,
} from '../config';
import { batikTexture as batikPattern, C, mat, nonIndexed, texMat } from '../materials';
import { glowTexture, reliefTexture, roofTexture, stoneTexture, thatchTexture, woodTexture } from '../textures';
import { Label } from './Markers';
import { Fade } from './Fade';
import { runtime } from '../runtime';
import { getState, setState, useGame } from '../store';
import { now } from '../runtime';
import { activateProp, toggleTorch } from '../props';
import { propSpots } from '../config';

type V3 = [number, number, number];

const NightContext = createContext(false);

function Box({ args, position, color, rotation, cast = true, material }: { args: V3; position: V3; color: string; rotation?: V3; cast?: boolean; material?: THREE.Material }) {
  return (
    <mesh position={position} rotation={rotation} material={material ?? mat(color)} castShadow={cast} receiveShadow>
      <boxGeometry args={args} />
    </mesh>
  );
}

/**
 * Additive halo sprite around a light source. Cheap stand-in for real point lights:
 * big and bright at night, a faint shimmer by day.
 */
const glowMaterials = new Map<string, THREE.SpriteMaterial>();
function glowMat(color: string) {
  let m = glowMaterials.get(color);
  if (!m) {
    m = new THREE.SpriteMaterial({ map: glowTexture(), color, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
    glowMaterials.set(color, m);
  }
  return m;
}
export function Glow({ position, size = 1.6, color = '#ffb347' }: { position: V3; size?: number; color?: string }) {
  const night = useContext(NightContext);
  const ref = useRef<THREE.Sprite>(null);
  useFrame((s) => {
    if (!ref.current) return;
    const flicker = 1 + Math.sin(s.clock.elapsedTime * 9 + position[0] * 3) * 0.06;
    const sz = (night ? size : size * 0.45) * flicker;
    ref.current.scale.set(sz, sz, sz);
  });
  return <sprite ref={ref} position={position} material={glowMat(color)} renderOrder={5} />;
}

// ---------------------------------------------------------------------------
// Stupa — shared merged geometry so the candi can instance dozens of them
// ---------------------------------------------------------------------------
const stupaGeometry = (() => {
  const base = new THREE.CylinderGeometry(0.95, 1.05, 0.35, 8);
  base.translate(0, 0.175, 0);
  const bell = new THREE.LatheGeometry(
    [
      [0, 0],
      [0.85, 0],
      [0.95, 0.22],
      [0.9, 0.58],
      [0.72, 0.92],
      [0.42, 1.12],
      [0, 1.2],
    ].map(([x, y]) => new THREE.Vector2(x, y)),
    10
  );
  bell.translate(0, 0.35, 0);
  const harmika = new THREE.BoxGeometry(0.38, 0.28, 0.38);
  harmika.translate(0, 1.66, 0);
  const spire = new THREE.ConeGeometry(0.16, 0.8, 6);
  spire.translate(0, 2.2, 0);
  return mergeGeometries([nonIndexed(base), nonIndexed(bell), nonIndexed(harmika), nonIndexed(spire)])!;
})();

function Stupa({ position, scale = 1, color = '#bdb6a8' }: { position: V3; scale?: number; color?: string }) {
  return <mesh geometry={stupaGeometry} position={position} scale={scale} material={texMat(stoneTexture(), color)} castShadow receiveShadow />;
}

// ---------------------------------------------------------------------------
// Monas — national monument at the plaza
// ---------------------------------------------------------------------------
function Monas() {
  const flame = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (flame.current) {
      const t = s.clock.elapsedTime;
      flame.current.scale.set(1 + Math.sin(t * 5) * 0.05, 1 + Math.sin(t * 7) * 0.08, 1 + Math.cos(t * 5) * 0.05);
      flame.current.rotation.y = t * 0.6;
    }
  });
  return (
    <group>
      <Box args={[5.6, 0.7, 5.6]} position={[0, 0.35, 0]} color={C.stoneLight} material={texMat(stoneTexture(), '#d9d3c4', [2, 0.5])} />
      {/* corner posts + low fence */}
      {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => <Box key={`${sx}${sz}`} args={[0.35, 1.1, 0.35]} position={[sx * 2.65, 1.05, sz * 2.65]} color={C.white} />))}
      <Glow position={[0, 14.6, 0]} size={4.5} color="#ffcf4d" />
      <Box args={[4.2, 0.9, 4.2]} position={[0, 1.15, 0]} color={C.white} />
      <mesh position={[0, 7.1, 0]} rotation-y={Math.PI / 4} material={mat(C.white)} castShadow>
        <cylinderGeometry args={[0.55, 1.05, 11, 4]} />
      </mesh>
      <mesh position={[0, 12.9, 0]} rotation-y={Math.PI / 4} material={mat(C.white)} castShadow>
        <cylinderGeometry args={[1.5, 0.5, 0.7, 4]} />
      </mesh>
      <mesh position={[0, 13.5, 0]} material={mat(C.gold)} castShadow>
        <cylinderGeometry args={[0.35, 0.5, 0.5, 8]} />
      </mesh>
      <mesh ref={flame} position={[0, 14.4, 0]} material={mat(C.gold, { emissive: '#f59e0b', emissiveIntensity: 0.9 })} castShadow>
        <coneGeometry args={[0.55, 1.5, 6]} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Merah Putih flag — waving cloth
// ---------------------------------------------------------------------------
function Flag({ position }: { position: V3 }) {
  const cloth = useRef<THREE.Mesh>(null);
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(2.4, 1.6, 12, 4);
    g.translate(1.2, 0, 0);
    const colors: number[] = [];
    const pos = g.attributes.position;
    const red = new THREE.Color(C.red);
    const white = new THREE.Color(C.white);
    for (let i = 0; i < pos.count; i++) {
      const c = pos.getY(i) >= 0 ? red : white;
      colors.push(c.r, c.g, c.b);
    }
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return g;
  }, []);
  const base = useMemo(() => Float32Array.from(geo.attributes.position.array), [geo]);
  useFrame((s) => {
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const t = s.clock.elapsedTime;
    for (let i = 0; i < pos.count; i++) {
      const x = base[i * 3];
      pos.setZ(i, Math.sin(x * 2.2 - t * 4) * 0.18 * (x / 2.4));
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
  });
  return (
    <group position={position}>
      <mesh position={[0, 4, 0]} material={mat('#d4d4d4')} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 8, 6]} />
      </mesh>
      <mesh position={[0, 8.05, 0]} material={mat(C.gold)}>
        <sphereGeometry args={[0.15, 8, 6]} />
      </mesh>
      <mesh ref={cloth} geometry={geo} position={[0.08, 7.1, 0]} castShadow>
        <meshLambertMaterial vertexColors side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Lanterns / torches — glow brighter at night
// ---------------------------------------------------------------------------
/** Click a prop: use it if standing at it, otherwise walk over first. */
export function clickProp(id: string) {
  return (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    const s = getState();
    if (!s.started || s.panel || runtime.dragged) return;
    if (s.nearbyProp === id) return activateProp(id);
    const spot = propSpots.find((p) => p.id === id);
    if (spot) runtime.target = { x: spot.x, z: spot.z };
  };
}

const pointer = {
  onPointerOver: () => (document.body.style.cursor = 'pointer'),
  onPointerOut: () => (document.body.style.cursor = ''),
};

function Torch({ position, night, index }: { position: V3; night: boolean; index?: number }) {
  const unlit = useGame((s) => index !== undefined && s.unlitTorches.includes(index));
  return (
    <group position={position}>
      {index !== undefined && (
        // generous invisible hit area so the thin torch is easy to click
        <mesh
          position={[0, 1.1, 0]}
          visible={false}
          onClick={(e) => {
            e.stopPropagation();
            toggleTorch(index);
          }}
          {...pointer}
        >
          <cylinderGeometry args={[0.45, 0.45, 2.3, 6]} />
        </mesh>
      )}
      <mesh position={[0, 0.8, 0]} material={mat(C.woodDark)} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 1.6, 5]} />
      </mesh>
      <mesh position={[0, 1.7, 0]} material={mat(C.thatch)}>
        <cylinderGeometry args={[0.18, 0.1, 0.25, 6]} />
      </mesh>
      {!unlit && (
        <>
          <mesh position={[0, 1.95, 0]} material={mat('#ffb347', { emissive: '#ff8c1a', emissiveIntensity: night ? 2.4 : 0.8 })}>
            <coneGeometry args={[0.13, 0.34, 5]} />
          </mesh>
          <Glow position={[0, 2, 0]} size={1.8} />
        </>
      )}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Rumah Joglo — Javanese house (About)
// ---------------------------------------------------------------------------
function Joglo({ night }: { night: boolean }) {
  const { x, z } = ZONES.joglo;
  const glow = mat('#ffd27a', { emissive: '#ffb347', emissiveIntensity: night ? 1.6 : 0.15 });
  return (
    <group position={[x, 0, z]}>
      <Box args={[11, 0.6, 10]} position={[0, 0.3, 0]} color={C.stone} material={texMat(stoneTexture(), '#a9a294', [3, 0.4])} />
      <Box args={[10.4, 0.1, 9.4]} position={[0, 0.65, 0]} color={C.woodLight} material={texMat(woodTexture(), '#e0b98a', [3, 3])} />
      {/* steps */}
      <Box args={[3, 0.3, 0.8]} position={[0, 0.15, 5.3]} color={C.stoneLight} />
      {/* walls */}
      <Box args={[8.2, 2.6, 6.2]} position={[0, 2, -0.6]} color={C.cream} />
      {/* wooden frame bands */}
      <Box args={[8.4, 0.25, 6.4]} position={[0, 0.85, -0.6]} color={C.wood} />
      <Box args={[8.4, 0.25, 6.4]} position={[0, 3.2, -0.6]} color={C.wood} />
      {/* door + windows */}
      <Box args={[1.5, 2.1, 0.12]} position={[0, 1.75, 2.55]} color={C.woodDark} />
      <Box args={[0.08, 2.1, 0.14]} position={[0, 1.75, 2.6]} color={C.gold} cast={false} />
      {[-2.6, 2.6].map((wx) => (
        <group key={wx}>
          <mesh position={[wx, 2.1, 2.56]} material={glow}>
            <boxGeometry args={[1.3, 1, 0.1]} />
          </mesh>
          <Box args={[1.5, 0.12, 0.16]} position={[wx, 2.66, 2.6]} color={C.wood} cast={false} />
          <Box args={[1.5, 0.12, 0.16]} position={[wx, 1.54, 2.6]} color={C.wood} cast={false} />
        </group>
      ))}
      {/* soko guru pillars on the veranda */}
      {[-4.6, -1.6, 1.6, 4.6].map((px) => (
        <Box key={px} args={[0.32, 3, 0.32]} position={[px, 2.1, 4.2]} color={C.wood} />
      ))}
      {/* roof: wide hip skirt + steep central brunjung */}
      <mesh position={[0, 4.2, 0]} rotation-y={Math.PI / 4} material={texMat(roofTexture('#6b3a26'), '#ffffff', [4, 1])} castShadow>
        <cylinderGeometry args={[4.6, 8.4, 1.6, 4]} />
      </mesh>
      <mesh position={[0, 6.4, 0]} rotation-y={Math.PI / 4} material={texMat(roofTexture(), '#ffffff', [3, 2])} castShadow>
        <cylinderGeometry args={[0.5, 4.6, 2.8, 4]} />
      </mesh>
      <Box args={[2.6, 0.25, 0.25]} position={[0, 7.85, 0]} color={C.woodDark} />
      <mesh position={[0, 8.2, 0]} material={mat(C.gold)}>
        <octahedronGeometry args={[0.35, 0]} />
      </mesh>
      {/* hanging lanterns */}
      {[-3, 3].map((lx) => (
        <group key={lx}>
          <mesh position={[lx, 3, 4.2]} material={glow}>
            <cylinderGeometry args={[0.2, 0.2, 0.45, 6]} />
          </mesh>
          <Glow position={[lx, 3, 4.2]} size={2.4} />
        </group>
      ))}
      {/* carved door panels + batik cloth hung on the veranda rail */}
      {[-0.38, 0.38].map((dx) => (
        <Box key={dx} args={[0.55, 1.7, 0.04]} position={[dx, 1.75, 2.63]} color="#7a4a24" cast={false} />
      ))}
      <mesh position={[3.1, 1.6, 4.35]} material={new THREE.MeshLambertMaterial({ map: batikPattern(), side: THREE.DoubleSide })}>
        <planeGeometry args={[1.8, 1.1]} />
      </mesh>
      <Box args={[3.4, 0.08, 0.08]} position={[3.1, 2.17, 4.35]} color={C.woodDark} cast={false} />
      {/* potted plants */}
      {[-1.9, 1.9].map((px) => (
        <group key={px} position={[px, 0.65, 5.4]}>
          <mesh position={[0, 0.25, 0]} material={mat(C.terracotta)} castShadow>
            <cylinderGeometry args={[0.3, 0.22, 0.5, 8]} />
          </mesh>
          <mesh position={[0, 0.75, 0]} material={mat(C.leafLight)} castShadow>
            <icosahedronGeometry args={[0.45, 0]} />
          </mesh>
        </group>
      ))}
      {/* always mounted: adding/removing lights forces every shader to recompile */}
      <pointLight position={[0, 2.6, 5.5]} color="#ffb347" intensity={night ? 18 : 0} distance={12} decay={2} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Candi — Borobudur-style temple (Education) + journey stupas (Experience)
// ---------------------------------------------------------------------------
const LEVEL_H = CANDI_LEVEL_H;

function Candi() {
  const { x, z } = ZONES.candi;
  const small = useMemo(
    () => CANDI_STUPAS.map((st) => new THREE.Matrix4().compose(new THREE.Vector3(st.x, st.y, st.z), new THREE.Quaternion(), new THREE.Vector3(0.5, 0.5, 0.5))),
    []
  );
  const instRef = useRef<THREE.InstancedMesh>(null);
  React.useLayoutEffect(() => {
    small.forEach((m, i) => instRef.current?.setMatrixAt(i, m));
    if (instRef.current) instRef.current.instanceMatrix.needsUpdate = true;
  }, [small]);

  const topY = CANDI_LEVELS.length * LEVEL_H;
  return (
    <group position={[x, 0, z]}>
      {CANDI_LEVELS.map((size, i) => (
        <group key={size}>
          <Box
            args={[size, LEVEL_H, size]}
            position={[0, i * LEVEL_H + LEVEL_H / 2, 0]}
            color={C.stone}
            material={texMat(reliefTexture(), i % 2 ? '#b3ac9e' : '#9d9688', [Math.max(1, Math.round(size / 4)), 1])}
          />
          {/* relief band */}
          <Box args={[size + 0.2, 0.22, size + 0.2]} position={[0, i * LEVEL_H + LEVEL_H - 0.12, 0]} color={C.stoneLight} cast={false} />
        </group>
      ))}
      <instancedMesh ref={instRef} args={[stupaGeometry, texMat(stoneTexture(), '#cfc8ba'), small.length]} castShadow receiveShadow />
      <Stupa position={[0, topY, 0]} scale={2.3} color={C.stoneLight} />
      {/* stairway running up the south face — same steps as the colliders, so it can be climbed */}
      {CANDI_STEPS.map((st) => (
        <Box
          key={st.z1}
          args={[CANDI_STAIR_HALF_WIDTH * 2, st.top, st.z1 - st.z0]}
          position={[0, st.top / 2, (st.z0 + st.z1) / 2]}
          color={C.stoneLight}
          material={texMat(stoneTexture(), '#c4bdaf', [1, 0.5])}
        />
      ))}
      {/* kori gateway at the foot of the stairs, kala head watching from the lintel */}
      <group position={[0, 0, CANDI_GATE.z]}>
        {[-1, 1].map((sx) => (
          <Box key={sx} args={[0.6, 2.9, 0.6]} position={[sx * CANDI_GATE.halfSpan, 1.45, 0]} color={C.stone} />
        ))}
        <Box args={[CANDI_GATE.halfSpan * 2 + 0.8, 0.3, 0.7]} position={[0, 3.05, 0]} color={C.stoneDark} />
        <group position={[0, 3.75, 0]}>
          <Box args={[2.4, 1.1, 0.5]} position={[0, 0, 0]} color={C.stoneDark} />
          {[-0.5, 0.5].map((ex) => (
            <mesh key={ex} position={[ex, 0.15, 0.27]} material={mat('#3f3a33')}>
              <sphereGeometry args={[0.2, 6, 4]} />
            </mesh>
          ))}
          <Box args={[1.2, 0.25, 0.1]} position={[0, -0.3, 0.27]} color="#3f3a33" cast={false} />
        </group>
      </group>
      {/* stone guardians (dwarapala) */}
      {DWARAPALA.map((d) => (
        <group key={d.x} position={[d.x - x, 0, d.z - z]}>
          <Box args={[0.9, 0.5, 0.9]} position={[0, 0.25, 0]} color={C.stoneDark} />
          <Box args={[0.7, 0.9, 0.6]} position={[0, 0.95, 0]} color={C.stone} />
          <mesh position={[0, 1.7, 0]} material={mat(C.stone)} castShadow>
            <icosahedronGeometry args={[0.38, 0]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

const COMPANY_COLORS: Record<string, string> = { jojonomic: '#f59e0b', lawencon: '#8b5cf6', pcs: '#06b6d4' };

function JourneyStupas() {
  const { t } = useTranslation('common');
  return (
    <>
      {EXPERIENCE_ORDER.map((key, i) => {
        const s = stupaSpot(key);
        return (
          <Fade key={key}>
            <group position={[s.x, 0, s.z]}>
              <Box args={[2.6, 0.7, 2.6]} position={[0, 0.35, 0]} color={C.stoneDark} />
              <Box args={[2.2, 0.4, 2.2]} position={[0, 0.9, 0]} color={C.stone} />
              <Stupa position={[0, 1.1, 0]} scale={1.15} color={C.stoneLight} />
              {/* sash tied around the bell, coloured per company */}
              <mesh position={[0, 1.95, 0]} material={mat(COMPANY_COLORS[key])}>
                <torusGeometry args={[0.98, 0.07, 6, 16]} />
              </mesh>
              {/* numbered step stone */}
              <Box args={[0.7, 0.7, 0.12]} position={[s.x < 0 ? 1.36 : -1.36, 0.6, 0]} rotation={[0, Math.PI / 2, 0]} color={COMPANY_COLORS[key]} cast={false} />
              <Label position={[0, 6.4, 0]} range={16}>
                <span className="world-label-place">
                  {i + 1}. {t(`experience.positions.${key}.company`)}
                </span>
                <span className="world-label-sub">{t(`experience.positions.${key}.period`)}</span>
              </Label>
            </group>
          </Fade>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Candi bentar — Balinese split gate on the way to the temple
// ---------------------------------------------------------------------------
function Gapura() {
  const half = (side: number) => (
    <group position={[side * (GAPURA.halfGap + 1.1), 0, GAPURA.z]}>
      {[2.2, 1.9, 1.6, 1.25, 0.9, 0.55].map((w, i) => (
        <Box key={i} args={[w, 1.05, w]} position={[0, i * 1.05 + 0.52, 0]} color={i % 2 ? C.terracotta : '#a24a28'} />
      ))}
      <mesh position={[0, 6.6, 0]} material={mat(C.stoneLight)} castShadow>
        <coneGeometry args={[0.3, 0.6, 4]} />
      </mesh>
    </group>
  );
  return (
    <>
      {half(-1)}
      {half(1)}
    </>
  );
}

// ---------------------------------------------------------------------------
// Pasar — market stalls (Projects)
// ---------------------------------------------------------------------------
const AWNING = ['#e63946', '#2a9d8f', '#f4a261', '#457b9d', '#e76f51', '#8ab17d', '#9b5de5', '#ef476f'];
const GOODS = ['#ff9f1c', '#e63946', '#ffd166', '#06d6a0', '#8338ec', '#f77f00'];

function Stall({ index }: { index: number }) {
  const { t } = useTranslation('common');
  const project = projects[index];
  const s = stallSpot(index);
  const face = Math.atan2(ZONES.pasar.x - s.x, ZONES.pasar.z - s.z);
  const color = AWNING[index % AWNING.length];
  return (
    <group position={[s.x, 0, s.z]} rotation-y={face}>
      {/* counter */}
      <Box args={[2.8, 1, 1.1]} position={[0, 0.5, 0.45]} color={C.woodLight} material={texMat(woodTexture(), '#e2b47c', [2, 1])} />
      <Box args={[2.9, 0.1, 1.2]} position={[0, 1.02, 0.45]} color={C.wood} />
      {/* posts */}
      {[
        [-1.35, 0.95],
        [1.35, 0.95],
        [-1.35, -0.9],
        [1.35, -0.9],
      ].map(([px, pz]) => (
        <Box key={`${px}${pz}`} args={[0.14, 2.8, 0.14]} position={[px, 1.4, pz]} color={C.woodDark} />
      ))}
      {/* striped awning */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Box
          key={i}
          args={[0.5, 0.08, 2.5]}
          position={[-1.25 + i * 0.5, 2.9, 0.05]}
          rotation={[0.22, 0, 0]}
          color={i % 2 ? C.white : color}
        />
      ))}
      {/* goods on the counter */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[-1 + i * 0.5, 1.22, 0.45]} material={mat(GOODS[(i + index) % GOODS.length])} castShadow>
          {i % 2 ? <icosahedronGeometry args={[0.18, 0]} /> : <boxGeometry args={[0.3, 0.3, 0.3]} />}
        </mesh>
      ))}
      {/* back shelf */}
      <Box args={[2.6, 1.6, 0.4]} position={[0, 0.8, -0.75]} color={C.wood} material={texMat(woodTexture(), '#a8743f', [2, 1])} />
      {/* jars + bunches on the shelf */}
      {[-0.9, -0.3, 0.3, 0.9].map((x, i) => (
        <mesh key={x} position={[x, 1.75, -0.75]} material={mat(GOODS[(i + index + 2) % GOODS.length])} castShadow>
          <cylinderGeometry args={[0.13, 0.15, 0.3, 7]} />
        </mesh>
      ))}
      {/* hanging lamp */}
      <mesh position={[0, 2.45, 0.6]} material={mat('#ffd27a', { emissive: '#ffb347', emissiveIntensity: 0.9 })}>
        <sphereGeometry args={[0.14, 8, 6]} />
      </mesh>
      <Glow position={[0, 2.45, 0.6]} size={1.4} />
      {/* rice sacks + woven basket out front */}
      <mesh position={[1.6, 0.35, -1.25]} scale={[1, 1.2, 1]} material={mat('#e8dcc0')} castShadow>
        <sphereGeometry args={[0.32, 7, 5]} />
      </mesh>
      <mesh position={[-1.75, 0.22, 0.9]} material={texMat(thatchTexture(), '#d8b26a')} castShadow>
        <cylinderGeometry args={[0.38, 0.28, 0.44, 10]} />
      </mesh>
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} position={[-1.75 + (i % 2) * 0.16 - 0.08, 0.5, 0.9 + (i > 1 ? 0.12 : -0.12)]} material={mat(GOODS[(i + index) % GOODS.length])}>
          <icosahedronGeometry args={[0.12, 0]} />
        </mesh>
      ))}
      <ProjectBoard index={index} />
      <Label position={[0, BOARD_BOTTOM + PIC_H + 0.75, 0.3]} range={13} className="world-label-small">
        <span className="world-label-place">{t(`projects.items.${project.id}.title`)}</span>
      </Label>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Papan proyek — a framed signboard showing the project's screenshot
// ---------------------------------------------------------------------------
const PIC_W = 2.8;
const PIC_H = 1.55;
/** sits on top of the awning (awning top ≈ y 3.0), tilted back towards the camera */
const BOARD_BOTTOM = 3.15;
const BOARD_TILT = -0.22;

function useProjectTexture(url: string) {
  const [tex, setTex] = React.useState<THREE.Texture | null>(null);
  React.useEffect(() => {
    let alive = true;
    new THREE.TextureLoader().load(url, (t) => {
      if (!alive) return;
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
      // "object-fit: cover" — crop instead of stretching
      const img = t.image as { width: number; height: number };
      const imgAspect = img.width / img.height;
      const planeAspect = PIC_W / PIC_H;
      if (imgAspect > planeAspect) {
        t.repeat.set(planeAspect / imgAspect, 1);
        t.offset.set((1 - t.repeat.x) / 2, 0);
      } else {
        t.repeat.set(1, imgAspect / planeAspect);
        t.offset.set(0, (1 - t.repeat.y) / 2);
      }
      setTex(t);
    });
    return () => {
      alive = false;
    };
  }, [url]);
  React.useEffect(() => () => tex?.dispose(), [tex]);
  return tex;
}

function ProjectBoard({ index }: { index: number }) {
  const project = projects[index];
  const tex = useProjectTexture(project.image);
  const color = AWNING[index % AWNING.length];
  const it = interactables.find((i) => i.ref === project.id);

  const open = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    const s = getState();
    if (!it || !s.started || s.panel || runtime.dragged) return;
    if (s.nearby === it.id) {
      setState({ panel: it.id });
      return;
    }
    runtime.target = { x: it.x, z: it.z };
    runtime.pendingOpen = it.id;
  };

  const frameMat = texMat(woodTexture(), '#8a5a2b');
  return (
    <group position={[0, 0, 0.15]}>
      {/* support posts rising from the stall's front posts */}
      {[-1.35, 1.35].map((x) => (
        <mesh key={x} position={[x, BOARD_BOTTOM + 0.1, -0.05]} material={frameMat} castShadow>
          <boxGeometry args={[0.1, 0.5, 0.1]} />
        </mesh>
      ))}
      <group position={[0, BOARD_BOTTOM + PIC_H / 2 + 0.12, 0]} rotation-x={BOARD_TILT}>
        {/* backing board + frame */}
        <mesh position={[0, 0, -0.03]} material={frameMat} castShadow>
          <boxGeometry args={[PIC_W + 0.24, PIC_H + 0.24, 0.07]} />
        </mesh>
        {/* coloured trim matching the stall's awning */}
        {[
          [0, PIC_H / 2 + 0.09, PIC_W + 0.24, 0.06],
          [0, -PIC_H / 2 - 0.09, PIC_W + 0.24, 0.06],
        ].map(([x, y, w, h]) => (
          <mesh key={y} position={[x, y, 0.015]} material={mat(color)}>
            <boxGeometry args={[w, h, 0.02]} />
          </mesh>
        ))}
        {/* the screenshot on both faces — unlit-ish so it stays readable, gently glowing at night */}
        {[
          [0.012, 0],
          [-0.072, Math.PI],
        ].map(([z, ry]) => (
          <mesh
            key={z}
            position={[0, 0, z]}
            rotation-y={ry}
            onClick={open}
            onPointerOver={() => (document.body.style.cursor = 'pointer')}
            onPointerOut={() => (document.body.style.cursor = '')}
          >
            <planeGeometry args={[PIC_W, PIC_H]} />
            {tex ? <meshBasicMaterial map={tex} toneMapped={false} color="#e8e8e8" /> : <meshLambertMaterial color="#f3e6c8" />}
          </mesh>
        ))}
        {/* little roof to keep the rain off */}
        <mesh position={[0, PIC_H / 2 + 0.24, 0.02]} rotation-x={0.35} material={mat(color)} castShadow>
          <boxGeometry args={[PIC_W + 0.45, 0.06, 0.38]} />
        </mesh>
      </group>
    </group>
  );
}

function Pasar() {
  return (
    <>
      {projects.map((p, i) => (
        <Fade key={p.id}>
          <Stall index={i} />
        </Fade>
      ))}
      {/* shade tree in the middle of the market */}
      <group position={[ZONES.pasar.x, 0, ZONES.pasar.z]}>
        <mesh position={[0, 0.25, 0]} material={mat(C.stone)} receiveShadow castShadow>
          <cylinderGeometry args={[1.7, 1.8, 0.5, 10]} />
        </mesh>
        <mesh position={[0, 2, 0]} material={mat(C.trunk)} castShadow>
          <cylinderGeometry args={[0.3, 0.45, 3.5, 6]} />
        </mesh>
        {[
          [0, 4.4, 0, 2.2],
          [1.2, 4, 0.6, 1.5],
          [-1.1, 4.1, -0.5, 1.6],
          [0.2, 5.3, -0.3, 1.5],
        ].map(([px, py, pz, r], i) => (
          <mesh key={i} position={[px, py, pz]} material={mat(i % 2 ? C.leaf : C.leafLight)} castShadow>
            <icosahedronGeometry args={[r, 0]} />
          </mesh>
        ))}
      </group>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sawah + saung — rice terraces & hut (Skills)
// ---------------------------------------------------------------------------
const TERRACES = [
  { x: -29, w: 16, h: 0.35 },
  { x: -31.5, w: 11, h: 0.8 },
  { x: -34, w: 6, h: 1.25 },
];

function Sawah() {
  const rice = useRef<THREE.InstancedMesh>(null);
  const spots = useMemo(() => {
    const out: { x: number; y: number; z: number; s: number }[] = [];
    TERRACES.forEach((tr, li) => {
      const next = TERRACES[li + 1];
      const minX = tr.x - tr.w / 2 + 0.6;
      const maxX = next ? next.x - next.w / 2 - 0.4 : tr.x + tr.w / 2 - 0.6;
      for (let x = minX; x <= maxX; x += 0.9) {
        for (let z = 17.8; z <= 32.2; z += 0.9) {
          out.push({ x, y: tr.h, z, s: 0.8 + ((x * 7 + z * 13) % 1) * 0.4 });
        }
      }
    });
    return out;
  }, []);
  const geo = useMemo(() => {
    const g = new THREE.ConeGeometry(0.12, 0.7, 4);
    g.translate(0, 0.35, 0);
    return g;
  }, []);
  React.useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    spots.forEach((p, i) => {
      m.compose(new THREE.Vector3(p.x, p.y, p.z), new THREE.Quaternion(), new THREE.Vector3(p.s, p.s, p.s));
      rice.current?.setMatrixAt(i, m);
    });
    if (rice.current) rice.current.instanceMatrix.needsUpdate = true;
  }, [spots]);
  useFrame((s) => {
    if (rice.current) rice.current.rotation.z = Math.sin(s.clock.elapsedTime * 1.2) * 0.004;
  });

  return (
    <group>
      {TERRACES.map((tr) => (
        <group key={tr.x}>
          <Box args={[tr.w, tr.h, 16]} position={[tr.x, tr.h / 2, 25]} color="#8a6a3d" />
          <mesh rotation-x={-Math.PI / 2} position={[tr.x, tr.h + 0.01, 25]} material={mat('#7fb8a4')} receiveShadow>
            <planeGeometry args={[tr.w - 0.3, 15.7]} />
          </mesh>
        </group>
      ))}
      <instancedMesh ref={rice} args={[geo, mat('#9ccc3d'), spots.length]} castShadow />
      {/* orang-orangan sawah (scarecrow) with caping hat */}
      <group position={[-26, 0.35, 27]}>
        <Box args={[0.12, 2.2, 0.12]} position={[0, 1.1, 0]} color={C.woodDark} />
        <Box args={[1.8, 0.1, 0.1]} position={[0, 1.6, 0]} color={C.woodDark} />
        <Box args={[0.7, 0.8, 0.35]} position={[0, 1.45, 0]} color="#c0392b" />
        <mesh position={[0, 2.25, 0]} material={mat(C.thatch)} castShadow>
          <sphereGeometry args={[0.24, 6, 5]} />
        </mesh>
        <mesh position={[0, 2.5, 0]} material={mat('#e3c27a')} castShadow>
          <coneGeometry args={[0.65, 0.35, 10]} />
        </mesh>
      </group>
    </group>
  );
}

function Saung() {
  const { x, z } = ZONES.saung;
  return (
    <group position={[x, 0, z]}>
      {[
        [-1.6, -1.6],
        [1.6, -1.6],
        [-1.6, 1.6],
        [1.6, 1.6],
      ].map(([px, pz]) => (
        <Box key={`${px}${pz}`} args={[0.2, 2.6, 0.2]} position={[px, 1.3, pz]} color={C.wood} />
      ))}
      <Box args={[3.8, 0.2, 3.8]} position={[0, 0.85, 0]} color={C.woodLight} />
      {/* bamboo floor slats */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Box key={i} args={[3.8, 0.06, 0.08]} position={[0, 0.98, -1.6 + i * 0.64]} color="#d6b36a" cast={false} />
      ))}
      <mesh position={[0, 3.4, 0]} rotation-y={Math.PI / 4} material={texMat(thatchTexture(), '#ffffff', [3, 1])} castShadow>
        <coneGeometry args={[3.7, 2, 4]} />
      </mesh>
      {/* laptop on the floor — where the skills live */}
      <Box args={[0.7, 0.04, 0.5]} position={[0, 1.02, -0.6]} color="#3a3a3a" />
      <mesh position={[0, 1.24, -0.84]} rotation-x={-0.25} material={mat('#5eead4', { emissive: '#22d3ee', emissiveIntensity: 0.6 })}>
        <boxGeometry args={[0.7, 0.45, 0.03]} />
      </mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Pohon beringin — banyan tree (Quote)
// ---------------------------------------------------------------------------
function Beringin() {
  const { x, z } = ZONES.beringin;
  const roots = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const r = 2.4 + (i % 3) * 0.7;
        return [Math.cos(a) * r, Math.sin(a) * r] as const;
      }),
    []
  );
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 2.6, 0]} material={mat(C.trunk)} castShadow>
        <cylinderGeometry args={[1, 1.7, 5.2, 8]} />
      </mesh>
      {roots.map(([rx, rz], i) => (
        <mesh key={i} position={[rx, 2.9, rz]} material={mat('#6b4a2c')} castShadow>
          <cylinderGeometry args={[0.06, 0.1, 5.8, 4]} />
        </mesh>
      ))}
      {[
        [0, 7.2, 0, 4.2],
        [3, 6.2, 1, 3],
        [-3, 6.4, -0.6, 3.1],
        [0.6, 6, 3, 2.8],
        [-0.8, 6.1, -3, 2.9],
        [0, 9, 0, 2.6],
      ].map(([px, py, pz, r], i) => (
        <mesh key={i} position={[px, py, pz]} material={mat(i % 2 ? '#2f6f35' : '#3a7f3a')} castShadow>
          <icosahedronGeometry args={[r, 0]} />
        </mesh>
      ))}
      {/* prasasti — carved stone tablet */}
      <group position={[PRASASTI.x - x, 0, PRASASTI.z - z]}>
        <Box args={[1.5, 0.3, 0.8]} position={[0, 0.15, 0]} color={C.stoneDark} />
        <Box args={[1.1, 1.5, 0.3]} position={[0, 1, 0]} rotation={[-0.08, 0, 0]} color={C.stone} />
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Pier + Phinisi schooner (Contact)
// ---------------------------------------------------------------------------
function Pier({ night }: { night: boolean }) {
  const len = PIER.end - PIER.start;
  const posts = useMemo(() => {
    const out: [number, number][] = [];
    for (let z = PIER.start + 1; z <= PIER.end; z += 3) out.push([-PIER.halfWidth, z], [PIER.halfWidth, z]);
    return out;
  }, []);
  return (
    <group>
      <Box
        args={[PIER.halfWidth * 2 + 0.4, 0.2, len]}
        position={[0, PIER.deck - 0.1, PIER.start + len / 2]}
        color={C.woodLight}
        material={texMat(woodTexture(), '#d9b080', [1, len / 2])}
      />
      {/* barrels, crate and a drying fishing net */}
      {[PIER.end - 6, PIER.end - 6.9].map((z) => (
        <group key={z} position={[-1.1, PIER.deck, z]}>
          <mesh position={[0, 0.45, 0]} material={texMat(woodTexture(), '#9a6a3a')} castShadow>
            <cylinderGeometry args={[0.36, 0.4, 0.9, 10]} />
          </mesh>
          {[0.15, 0.75].map((y) => (
            <mesh key={y} position={[0, y, 0]} material={mat('#4b4b4b')}>
              <cylinderGeometry args={[0.41, 0.41, 0.06, 10]} />
            </mesh>
          ))}
        </group>
      ))}
      <Box args={[0.7, 0.55, 0.7]} position={[1.05, PIER.deck + 0.28, PIER.start + 6]} color={C.wood} material={texMat(woodTexture(), '#b8844e')} />
      <Box args={[0.06, 1.3, 0.06]} position={[-1.75, PIER.deck + 0.65, PIER.start + 8.3]} color={C.woodDark} />
      <Box args={[0.06, 1.3, 0.06]} position={[-1.75, PIER.deck + 0.65, PIER.start + 9.9]} color={C.woodDark} />
      <mesh position={[-1.75, PIER.deck + 0.75, PIER.start + 9.1]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[1.6, 1, 10, 6]} />
        <meshBasicMaterial color="#2f5d58" wireframe />
      </mesh>
      {Array.from({ length: Math.floor(len / 1.2) }).map((_, i) => (
        <Box key={i} args={[PIER.halfWidth * 2 + 0.4, 0.02, 0.06]} position={[0, PIER.deck + 0.005, PIER.start + 0.6 + i * 1.2]} color={C.wood} cast={false} />
      ))}
      {posts.map(([px, pz]) => (
        <mesh key={`${px}${pz}`} position={[px * 1.12, -0.4, pz]} material={mat(C.woodDark)} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 2, 6]} />
        </mesh>
      ))}
      <Torch position={[-PIER.halfWidth, PIER.deck, PIER.end - 0.4]} night={night} />
      <Torch position={[PIER.halfWidth, PIER.deck, PIER.end - 0.4]} night={night} />
      <pointLight position={[0, 2.5, PIER.end - 1]} color="#ffb347" intensity={night ? 14 : 0} distance={10} decay={2} />
    </group>
  );
}

function Phinisi() {
  const boat = useRef<THREE.Group>(null);
  const hull = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-4.4, 1.7);
    s.lineTo(-3.8, 0);
    s.lineTo(3.4, 0);
    s.quadraticCurveTo(5.2, 0.5, 6.4, 2.1);
    s.lineTo(-4.4, 1.7);
    const g = new THREE.ExtrudeGeometry(s, { depth: 2.6, bevelEnabled: false });
    g.translate(0, 0, -1.3);
    return g;
  }, []);
  const sail = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(3.4, 0.4);
    s.lineTo(2.6, 4.8);
    s.lineTo(0, 5.6);
    s.lineTo(0, 0);
    return new THREE.ShapeGeometry(s);
  }, []);
  const jib = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(3.3, 0);
    s.lineTo(0, 5.2);
    s.lineTo(0, 0);
    return new THREE.ShapeGeometry(s);
  }, []);
  useFrame((st) => {
    if (!boat.current) return;
    const t = st.clock.elapsedTime;
    boat.current.position.y = -0.9 + Math.sin(t * 1.1) * 0.12;
    boat.current.rotation.z = Math.sin(t * 0.8) * 0.03;
    boat.current.rotation.x = Math.sin(t * 0.6) * 0.02;
  });
  const sailMat = useMemo(() => new THREE.MeshLambertMaterial({ color: '#f4ead2', side: THREE.DoubleSide, flatShading: true }), []);
  return (
    <group position={[6.4, 0, 64]} rotation-y={-Math.PI / 2}>
      <group ref={boat}>
        <mesh geometry={hull} material={mat('#6e3b1f')} castShadow />
        <Box args={[10.4, 0.2, 2.8]} position={[0.6, 1.85, 0]} color={C.woodLight} />
        <Box args={[10.6, 0.18, 2.66]} position={[0.8, 1.2, 0]} color="#f2efe6" cast={false} />
        {/* cabin */}
        <Box args={[2.4, 1.1, 2]} position={[-3, 2.5, 0]} color={C.wood} />
        <Box args={[2.7, 0.15, 2.3]} position={[-3, 3.1, 0]} color={C.woodDark} />
        {/* masts */}
        {[
          [1.6, 8.4],
          [-1.4, 6.8],
        ].map(([mx, h]) => (
          <mesh key={mx} position={[mx, 1.9 + h / 2, 0]} material={mat(C.woodDark)} castShadow>
            <cylinderGeometry args={[0.08, 0.12, h, 6]} />
          </mesh>
        ))}
        <mesh geometry={sail} material={sailMat} position={[1.6, 2.6, 0.05]} rotation-y={Math.PI} castShadow />
        <mesh geometry={sail} material={sailMat} position={[-1.4, 2.5, 0.05]} rotation-y={Math.PI} scale={0.8} castShadow />
        {/* bowsprit + jib */}
        <mesh position={[7.2, 2.3, 0]} rotation-z={-1.25} material={mat(C.woodDark)}>
          <cylinderGeometry args={[0.06, 0.06, 3, 5]} />
        </mesh>
        <mesh geometry={jib} material={sailMat} position={[1.9, 2.3, 0]} castShadow />
        {/* pennant */}
        <mesh position={[1.9, 10.5, 0]} material={mat(C.red)}>
          <boxGeometry args={[0.7, 0.18, 0.02]} />
        </mesh>
        <mesh position={[1.9, 10.32, 0]} material={mat(C.white)}>
          <boxGeometry args={[0.7, 0.18, 0.02]} />
        </mesh>
      </group>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Penjor — curved Balinese bamboo poles lining the way to the pier
// ---------------------------------------------------------------------------
function Penjor({ x, z, side }: { x: number; z: number; side: number }) {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 3, 0),
      new THREE.Vector3(side * 0.4, 5.5, 0),
      new THREE.Vector3(side * 1.6, 7, 0),
      new THREE.Vector3(side * 2.6, 6.4, 0),
    ]);
    return { tube: new THREE.TubeGeometry(curve, 20, 0.07, 5, false), tip: curve.getPoint(1) };
  }, [side]);
  return (
    <group position={[x, 0, z]}>
      <mesh geometry={geo.tube} material={mat('#c9a35b')} castShadow />
      <mesh position={[geo.tip.x, geo.tip.y - 0.5, 0]} material={mat('#e9d8a6')} castShadow>
        <coneGeometry args={[0.25, 1, 6]} />
      </mesh>
      {/* sanggah offering box */}
      <Box args={[0.45, 0.45, 0.45]} position={[0, 1.4, 0]} color={C.woodLight} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Direction signpost at the plaza
// ---------------------------------------------------------------------------
function Signpost() {
  return (
    <group position={[-4.2, 0, 6.2]}>
      <Box args={[0.18, 2.6, 0.18]} position={[0, 1.3, 0]} color={C.woodDark} />
      <Box args={[1.6, 0.4, 0.08]} position={[-0.4, 2.3, 0]} rotation={[0, 0.3, 0]} color={C.woodLight} />
      <Box args={[1.6, 0.4, 0.08]} position={[0.4, 1.75, 0]} rotation={[0, -0.4, 0]} color={C.woodLight} />
      <Box args={[1.4, 0.4, 0.08]} position={[0, 1.2, 0]} rotation={[0, 1.4, 0]} color={C.woodLight} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Gerobak bakso — meatball soup cart by the plaza
// ---------------------------------------------------------------------------
function BaksoCart() {
  return (
    <group position={[BAKSO_CART.x, 0, BAKSO_CART.z]} rotation-y={-0.9}>
      <Box args={[1.8, 0.9, 0.9]} position={[0, 0.95, 0]} color={C.white} material={mat('#f8fafc')} />
      <Box args={[1.82, 0.22, 0.92]} position={[0, 0.6, 0]} color="#1d4ed8" />
      <Box args={[1.9, 0.06, 1]} position={[0, 1.42, 0]} color={C.woodLight} />
      {/* glass display + steaming pot */}
      <mesh position={[-0.4, 1.7, 0]} material={new THREE.MeshLambertMaterial({ color: '#bfe9ff', transparent: true, opacity: 0.45 })}>
        <boxGeometry args={[0.8, 0.5, 0.7]} />
      </mesh>
      <mesh position={[0.5, 1.65, 0]} material={mat('#9ca3af')} castShadow>
        <cylinderGeometry args={[0.3, 0.28, 0.4, 10]} />
      </mesh>
      <Steam position={[0.5, 1.9, 0]} />
      <mesh position={[0, 1.2, 0]} visible={false} onClick={clickProp('prop_bakso')} {...pointer}>
        <boxGeometry args={[2.2, 1.8, 1.4]} />
      </mesh>
      {[-0.7, 0.7].map((x) => (
        <mesh key={x} position={[x, 0.35, 0.5]} rotation-x={Math.PI / 2} material={mat('#374151')} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.1, 12]} />
        </mesh>
      ))}
      {/* umbrella */}
      <mesh position={[0, 2.4, 0]} material={mat(C.woodDark)}>
        <cylinderGeometry args={[0.04, 0.04, 2, 5]} />
      </mesh>
      <mesh position={[0, 3.3, 0]} material={mat('#ef4444')} castShadow>
        <coneGeometry args={[1.4, 0.6, 8, 1, true]} />
      </mesh>
      <Glow position={[0.9, 1.9, 0]} size={1.4} />
      {/* plastic stools */}
      {[
        [-1.2, 1.1],
        [0.2, 1.3],
      ].map(([x, z]) => (
        <mesh key={x} position={[x, 0.22, z]} material={mat('#f97316')} castShadow>
          <cylinderGeometry args={[0.2, 0.24, 0.44, 8]} />
        </mesh>
      ))}
    </group>
  );
}

function Steam({ position }: { position: V3 }) {
  const g = useRef<THREE.Group>(null);
  const puffMat = useMemo(() => new THREE.MeshLambertMaterial({ color: '#ffffff', transparent: true, opacity: 0.5, depthWrite: false }), []);
  useFrame((s) => {
    g.current?.children.forEach((c, i) => {
      const k = (s.clock.elapsedTime * 0.5 + i / 3) % 1;
      const burst = Math.exp(-(now() - runtime.baksoAt) / 1.2);
      c.position.set(Math.sin(k * 6 + i) * 0.08, k * 0.9 * (1 + burst), 0);
      c.scale.setScalar((0.08 + k * 0.18) * (1 + burst * 2.2));
    });
  });
  return (
    <group ref={g} position={position}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} material={puffMat}>
          <icosahedronGeometry args={[1, 0]} />
        </mesh>
      ))}
    </group>
  );
}

/** Beach umbrella with a towel and a coconut drink */
function BeachSpot({ x, z, color }: { x: number; z: number; color: string }) {
  const face = Math.atan2(x, z);
  return (
    <group position={[x, 0, z]} rotation-y={face}>
      <mesh position={[0, 1.3, 0]} rotation-z={0.12} material={mat(C.white)}>
        <cylinderGeometry args={[0.04, 0.04, 2.6, 5]} />
      </mesh>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[0.15, 2.55, 0]} rotation={[0, (i * Math.PI) / 4, 0]} material={mat(i % 2 ? C.white : color)} castShadow>
          <coneGeometry args={[1.5, 0.5, 2, 1, true, 0, Math.PI / 4]} />
        </mesh>
      ))}
      <Box args={[0.9, 0.03, 1.8]} position={[0.9, 0.03, 0.6]} color={color} cast={false} />
      <mesh position={[-0.7, 0.18, 0.9]} material={mat('#6b8e23')} castShadow>
        <sphereGeometry args={[0.2, 7, 5]} />
      </mesh>
      {/* starfish + shells */}
      <mesh position={[1.8, 0.03, -0.6]} rotation-x={-Math.PI / 2} material={mat('#fb923c')}>
        <circleGeometry args={[0.18, 5]} />
      </mesh>
      <mesh position={[-1.5, 0.05, -1]} material={mat('#fde4cf')}>
        <sphereGeometry args={[0.1, 5, 3, 0, Math.PI * 2, 0, Math.PI / 2]} />
      </mesh>
    </group>
  );
}

/** Ayunan — a swing and hanging lanterns on the banyan */
function BanyanExtras() {
  const swing = useRef<THREE.Group>(null);
  const { x, z } = ZONES.beringin;
  useFrame((s) => {
    // gentle idle sway; a push swings it high, then it settles back
    const push = Math.exp(-(now() - runtime.swingAt) / 3.5);
    if (swing.current) swing.current.rotation.x = Math.sin(s.clock.elapsedTime * 1.3) * (0.18 + 0.75 * push);
  });
  return (
    <group position={[x, 0, z]}>
      <group ref={swing} position={[3.2, 5.2, -1.2]}>
        {[-0.45, 0.45].map((sx) => (
          <mesh key={sx} position={[sx, -2.1, 0]} material={mat('#d6b36a')}>
            <cylinderGeometry args={[0.02, 0.02, 4.2, 3]} />
          </mesh>
        ))}
        <Box args={[1.1, 0.08, 0.4]} position={[0, -4.2, 0]} color={C.wood} />
        <mesh position={[0, -4.1, 0]} visible={false} onClick={clickProp('prop_swing')} {...pointer}>
          <boxGeometry args={[1.4, 0.8, 0.9]} />
        </mesh>
      </group>
      {[
        [-2.4, 4.6, -1.8, '#ef4444'],
        [1.6, 4.9, -2.6, '#f59e0b'],
        [-1, 5.2, 2.6, '#ef4444'],
        [2.8, 4.5, 1.6, '#f59e0b'],
      ].map(([lx, ly, lz, color]) => (
        <group key={`${lx}`} position={[lx as number, ly as number, lz as number]}>
          <mesh material={mat(color as string, { emissive: color as string, emissiveIntensity: 0.8 })}>
            <sphereGeometry args={[0.22, 8, 6]} />
          </mesh>
          <Glow position={[0, 0, 0]} size={1.6} color={color as string} />
        </group>
      ))}
    </group>
  );
}

export default function Landmarks({ night }: { night: boolean }) {
  return (
    <NightContext.Provider value={night}>
      {/* big structures ghost while they hide the player (see Fade) */}
      <Fade>
        <Monas />
      </Fade>
      <Flag position={[4.2, 0, -3.5]} />
      <Signpost />
      <Fade>
        <Joglo night={night} />
      </Fade>
      <Fade>
        <Gapura />
      </Fade>
      <Fade>
        <Candi />
      </Fade>
      <JourneyStupas />
      <Pasar />
      <Sawah />
      <Fade>
        <Saung />
      </Fade>
      <Fade>
        <Beringin />
      </Fade>
      <Pier night={night} />
      <Fade>
        <Phinisi />
      </Fade>
      {PENJOR.map((p) => (
        <Penjor key={`${p.x}${p.z}`} {...p} />
      ))}
      {TORCHES.map((t, i) => (
        <Torch key={`${t.x}${t.z}`} position={[t.x, 0, t.z]} night={night} index={i} />
      ))}
      <Fade>
        <BaksoCart />
      </Fade>
      <BeachSpot {...BEACH_SPOTS[0]} color="#0ea5e9" />
      <BeachSpot {...BEACH_SPOTS[1]} color="#f43f5e" />
      <BanyanExtras />
    </NightContext.Provider>
  );
}
