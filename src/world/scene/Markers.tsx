import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useTranslation } from 'react-i18next';
import { interactables, Interactable } from '../config';
import { runtime } from '../runtime';
import { getState, setState, useGame } from '../store';
import { C, mat } from '../materials';

/**
 * Screen-space label that fades in when the player is within `range`.
 */
export function Label({
  position,
  children,
  range = 22,
  className = '',
}: {
  position: [number, number, number];
  children: React.ReactNode;
  range?: number;
  className?: string;
}) {
  const el = useRef<HTMLDivElement>(null);
  useFrame(() => {
    if (!el.current) return;
    const p = runtime.player;
    const d = Math.hypot(position[0] - p.x, position[2] - p.z);
    const o = getState().started ? THREE.MathUtils.clamp((range - d) / 6, 0, 1) : 0;
    el.current.style.opacity = String(o);
  });
  return (
    <Html position={position} center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
      <div ref={el} className={`world-label ${className}`} style={{ opacity: 0 }}>
        {children}
      </div>
    </Html>
  );
}

const diamondGeo = new THREE.OctahedronGeometry(0.42, 0);
const ringGeo = new THREE.RingGeometry(0.9, 1.15, 32);

function Marker({ it }: { it: Interactable }) {
  const gem = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const visited = useGame((s) => s.visited.includes(it.id));
  const nearby = useGame((s) => s.nearby === it.id);

  useFrame((s) => {
    const t = s.clock.elapsedTime + it.x;
    if (gem.current) {
      gem.current.position.y = it.markerY + Math.sin(t * 2.2) * 0.18;
      gem.current.rotation.y = t * 1.5;
      const sc = nearby ? 1.35 : 1;
      gem.current.scale.lerp(new THREE.Vector3(sc, sc * 1.4, sc), 0.15);
    }
    if (ring.current) {
      const pulse = 1 + ((t * 0.8) % 1) * 0.35;
      ring.current.scale.setScalar(pulse);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = (nearby ? 0.9 : 0.5) * (1 - ((t * 0.8) % 1));
    }
  });

  const color = visited ? '#4ade80' : C.gold;

  const onClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    const s = getState();
    if (!s.started || s.panel || runtime.dragged) return;
    if (s.nearby === it.id) {
      setState({ panel: it.id });
      return;
    }
    runtime.target = { x: it.x, z: it.z };
    runtime.pendingOpen = it.id;
  };

  return (
    <group position={[it.x, 0, it.z]}>
      <mesh
        ref={gem}
        geometry={diamondGeo}
        material={mat(color, { emissive: color, emissiveIntensity: nearby ? 0.9 : 0.45 })}
        onClick={onClick}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = '')}
      />
      <mesh ref={ring} rotation-x={-Math.PI / 2} position-y={0.07} geometry={ringGeo}>
        <meshBasicMaterial color={color} transparent opacity={0.5} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function Markers() {
  return (
    <>
      {interactables.map((it) => (
        <Marker key={it.id} it={it} />
      ))}
    </>
  );
}

/** Zone signboards floating above each landmark */
export function ZoneLabels() {
  const { t } = useTranslation('common');
  const labels: { pos: [number, number, number]; key: string }[] = [
    { pos: [0, 18.5, 0], key: 'welcome' },
    { pos: [-22, 10.5, -6], key: 'about' },
    { pos: [0, 15, -34], key: 'experience' },
    { pos: [26, 7.5, -6], key: 'projects' },
    { pos: [-17, 7.5, 23], key: 'skills' },
    { pos: [18, 12, 20], key: 'quote' },
    { pos: [0, 5, 70], key: 'contact' },
  ];
  return (
    <>
      {labels.map((l) => (
        <Label key={l.key} position={l.pos} range={45}>
          <span className="world-label-place">{t(`world.places.${l.key}.name`)}</span>
          <span className="world-label-sub">{t(`world.places.${l.key}.sub`)}</span>
        </Label>
      ))}
    </>
  );
}
