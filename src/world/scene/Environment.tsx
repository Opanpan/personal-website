import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Sky, Stars } from '@react-three/drei';
import { mulberry32 } from '../config';
import { runtime } from '../runtime';
import { C, mat, useWarmup } from '../materials';

const DAY = { fog: '#bfe6f2', hemiSky: '#dff4ff', hemiGround: '#6a8f4e', sun: '#fff1d6', sunI: 2.4, hemiI: 1.1 };
const NIGHT = { fog: '#0d1b33', hemiSky: '#6078bb', hemiGround: '#24352a', sun: '#a9c0ff', sunI: 0.95, hemiI: 0.7 };

function Lights({ night }: { night: boolean }) {
  const p = night ? NIGHT : DAY;
  const scene = useThree((s) => s.scene);
  React.useEffect(() => {
    scene.fog = new THREE.Fog(p.fog, 70, 210);
    scene.background = new THREE.Color(p.fog);
  }, [scene, p.fog]);
  return (
    <>
      <hemisphereLight args={[p.hemiSky, p.hemiGround, p.hemiI]} />
      <directionalLight
        name="sun"
        color={p.sun}
        intensity={p.sunI}
        position={[25, 40, 15]}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-34}
        shadow-camera-right={34}
        shadow-camera-top={34}
        shadow-camera-bottom={-34}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-bias={-0.0005}
        shadow-normalBias={0.04}
      />
    </>
  );
}

/** Gunung — a smoking volcano on the horizon + a ring of distant islands */
function Horizon() {
  const smoke = useRef<THREE.Group>(null);
  const puffs = useMemo(() => Array.from({ length: 7 }).map((_, i) => ({ offset: i / 7, x: (i % 3) - 1 })), []);
  useFrame((s) => {
    if (!smoke.current) return;
    const t = s.clock.elapsedTime;
    smoke.current.children.forEach((c, i) => {
      const k = (t * 0.05 + puffs[i].offset) % 1;
      c.position.set(puffs[i].x * 2 + k * 10, k * 26, -k * 4);
      c.scale.setScalar(2 + k * 7);
      ((c as THREE.Mesh).material as THREE.MeshLambertMaterial).opacity = 0.55 * (1 - k);
    });
  });
  const smokeMats = useMemo(() => puffs.map(() => new THREE.MeshLambertMaterial({ color: '#e8e8e8', transparent: true, depthWrite: false, flatShading: true })), [puffs]);
  const islands = useMemo(() => {
    const rand = mulberry32(7);
    return Array.from({ length: 7 }).map((_, i) => {
      const a = Math.PI * 0.15 + (i / 7) * Math.PI * 1.7 + rand() * 0.2;
      const r = 150 + rand() * 40;
      return { x: Math.cos(a) * r, z: Math.sin(a) * r, s: 8 + rand() * 14, h: 6 + rand() * 12 };
    });
  }, []);
  return (
    <>
      <group position={[-40, -1, -175]}>
        <mesh material={mat('#6b7a4a')} position={[0, 21, 0]}>
          <cylinderGeometry args={[8, 62, 44, 14]} />
        </mesh>
        <mesh material={mat('#4a4237')} position={[0, 43.5, 0]}>
          <cylinderGeometry args={[6, 8.4, 1.5, 14]} />
        </mesh>
        <mesh material={mat('#7e8f57')} position={[52, 12, 18]}>
          <cylinderGeometry args={[5, 36, 26, 12]} />
        </mesh>
        <group ref={smoke} position={[0, 45, 0]}>
          {puffs.map((p, i) => (
            <mesh key={i} material={smokeMats[i]}>
              <icosahedronGeometry args={[1, 0]} />
            </mesh>
          ))}
        </group>
      </group>
      {islands.map((isl, i) => (
        <group key={i} position={[isl.x, -1, isl.z]}>
          <mesh material={mat(C.sand)} position={[0, 0.5, 0]}>
            <cylinderGeometry args={[isl.s * 1.15, isl.s * 1.25, 1, 10]} />
          </mesh>
          <mesh material={mat(C.leaf)} position={[0, isl.h / 2 + 0.8, 0]}>
            <coneGeometry args={[isl.s, isl.h, 9]} />
          </mesh>
        </group>
      ))}
    </>
  );
}

function Clouds({ night }: { night: boolean }) {
  const group = useRef<THREE.Group>(null);
  const clouds = useMemo(() => {
    const rand = mulberry32(99);
    return Array.from({ length: 16 }).map(() => ({
      x: -120 + rand() * 240,
      z: -120 + rand() * 200,
      y: 62 + rand() * 16,
      s: 2 + rand() * 3,
      speed: 0.6 + rand() * 0.8,
    }));
  }, []);
  const material = useMemo(() => new THREE.MeshLambertMaterial({ color: '#ffffff', flatShading: true, transparent: true, opacity: 0.92 }), []);
  React.useEffect(() => {
    material.color.set(night ? '#56607a' : '#ffffff');
    material.opacity = night ? 0.5 : 0.92;
  }, [night, material]);
  useFrame((_, dt) => {
    group.current?.children.forEach((c, i) => {
      c.position.x += clouds[i].speed * dt;
      if (c.position.x > 140) c.position.x = -140;
    });
  });
  return (
    <group ref={group}>
      {clouds.map((c, i) => (
        <group key={i} position={[c.x, c.y, c.z]} scale={c.s}>
          {[
            [0, 0, 0, 1.6],
            [1.5, -0.3, 0.2, 1.1],
            [-1.4, -0.35, -0.1, 1.2],
            [0.4, 0.7, 0, 1],
            [-0.6, 0.55, 0.5, 0.9],
            [2.5, -0.6, -0.2, 0.75],
            [0.9, -0.1, 0.9, 0.95],
          ].map(([x, y, z, r], k) => (
            <mesh key={k} position={[x, y, z]} material={material}>
              <icosahedronGeometry args={[r, 0]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/** Layangan — diamond kites tethered over the beach */
function Kites() {
  const kites = useMemo(
    () => [
      { x: -30, z: 48, y: 20, color: '#e63946' },
      { x: 34, z: 42, y: 24, color: '#ffd166' },
      { x: 12, z: 58, y: 17, color: '#06d6a0' },
    ],
    []
  );
  const refs = useRef<THREE.Group[]>([]);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    refs.current.forEach((g, i) => {
      if (!g) return;
      g.position.x = kites[i].x + Math.sin(t * 0.5 + i) * 2;
      g.position.y = kites[i].y + Math.sin(t * 0.9 + i * 2) * 1.2;
      g.rotation.z = Math.sin(t * 1.2 + i) * 0.25;
    });
  });
  return (
    <>
      {kites.map((k, i) => (
        <group key={i} ref={(g) => {
            if (g) refs.current[i] = g;
          }} position={[k.x, k.y, k.z]}>
          <mesh rotation-z={Math.PI / 4} material={mat(k.color)} scale={[1, 1.4, 1]}>
            <boxGeometry args={[1.6, 1.6, 0.05]} />
          </mesh>
          <mesh position={[0, -2.6, 0]} material={mat(k.color)}>
            <boxGeometry args={[0.08, 3.4, 0.02]} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/** Kunang-kunang — fireflies drifting around the player at night */
function Fireflies() {
  const COUNT = 70;
  const points = useRef<THREE.Points>(null);
  const seeds = useMemo(() => {
    const rand = mulberry32(5);
    return Array.from({ length: COUNT }).map(() => ({ x: (rand() - 0.5) * 40, z: (rand() - 0.5) * 40, y: 0.6 + rand() * 2.5, p: rand() * 10 }));
  }, []);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(COUNT * 3), 3));
    return g;
  }, []);
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const px = runtime.player.x;
    const pz = runtime.player.z;
    seeds.forEach((f, i) => {
      // wrap around the player so there are always fireflies nearby
      const x = ((((f.x + Math.sin(t * 0.3 + f.p) * 2 - px) % 40) + 60) % 40) - 20 + px;
      const z = ((((f.z + Math.cos(t * 0.25 + f.p) * 2 - pz) % 40) + 60) % 40) - 20 + pz;
      pos.setXYZ(i, x, f.y + Math.sin(t + f.p) * 0.4, z);
    });
    pos.needsUpdate = true;
  });
  return (
    <points ref={points} geometry={geo} frustumCulled={false}>
      <pointsMaterial color="#d9ff7a" size={0.22} sizeAttenuation transparent opacity={0.95} depthWrite={false} />
    </points>
  );
}

export default function Environment({ night }: { night: boolean }) {
  const warm = useWarmup();
  return (
    <>
      <Lights night={night} />
      {/* both skies stay mounted; see useWarmup */}
      <group visible={night || warm}>
        <Stars radius={180} depth={40} count={2500} factor={5} fade speed={0.6} />
        <mesh position={[80, 70, -160]}>
          <sphereGeometry args={[7, 20, 16]} />
          <meshBasicMaterial color="#fff6d5" fog={false} />
        </mesh>
        <Fireflies />
      </group>
      <group visible={!night || warm}>
        <Sky distance={4500} sunPosition={[100, 60, -80]} turbidity={6} rayleigh={1.2} mieCoefficient={0.005} mieDirectionalG={0.8} />
      </group>
      <Horizon />
      <Clouds night={night} />
      <Kites />
    </>
  );
}
