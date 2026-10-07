import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { techStack } from '@/lib/techStack';
import { runtime } from '../runtime';
import { getState } from '../store';

/** Tech icons floating like lanterns above the rice terraces. */
export default function SkillOrbs() {
  const group = useRef<THREE.Group>(null);
  const wrap = useRef<HTMLDivElement[]>([]);
  const cols = 5;

  useFrame((s) => {
    const t = s.clock.elapsedTime;
    const near = getState().started ? Math.hypot(runtime.player.x + 26, runtime.player.z - 24) : 99;
    const opacity = THREE.MathUtils.clamp((30 - near) / 8, 0, 1);
    group.current?.children.forEach((c, i) => {
      c.position.y = 4.2 + Math.floor(i / cols) * 1.9 + Math.sin(t * 1.4 + i) * 0.3;
    });
    wrap.current.forEach((el) => el && (el.style.opacity = String(opacity)));
  });

  return (
    <group ref={group}>
      {techStack.map((tech, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        return (
          <group key={tech.name} position={[-35 + col * 3 + (row % 2) * 1.5, 4.2 + row * 1.9, 21 + row * 2.2]}>
            <Html center zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
              <div
                ref={(el) => {
                  if (el) wrap.current[i] = el;
                }}
                className="world-orb"
                style={{ opacity: 0 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tech.icon} alt={tech.name} width={34} height={34} loading="lazy" />
                <span>{tech.name}</span>
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
}
