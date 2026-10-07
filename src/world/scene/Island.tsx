import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ThreeEvent, useFrame } from '@react-three/fiber';
import { ISLAND_RADIUS, LAND_RADIUS, PIER } from '../config';
import { runtime } from '../runtime';
import { getState } from '../store';
import { C, mat } from '../materials';
import { applyGroundUV, groundTexture, sandTexture, stoneTexture } from '../textures';

/** Disc whose rim wobbles so the coastline looks organic. */
function wobblyDisc(radius: number, wobble: number, seed: number, segments = 96) {
  const geo = new THREE.CircleGeometry(radius, segments);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 1; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const a = Math.atan2(y, x);
    const k = 1 + (Math.sin(a * 3 + seed) * 0.5 + Math.sin(a * 7 + seed * 2) * 0.3 + Math.sin(a * 13 + seed) * 0.2) * (wobble / radius);
    pos.setXY(i, x * k, y * k);
  }
  geo.computeVertexNormals();
  return geo;
}

function Water({ night }: { night: boolean }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        fog: true,
        uniforms: THREE.UniformsUtils.merge([
          THREE.UniformsLib.fog,
          {
            uTime: { value: 0 },
            uDeep: { value: new THREE.Color('#1572a8') },
            uShallow: { value: new THREE.Color('#3fd0c9') },
            uFoam: { value: new THREE.Color('#ffffff') },
            uIsland: { value: ISLAND_RADIUS },
            uSparkle: { value: 1 },
          },
        ]),
        vertexShader: /* glsl */ `
          #include <fog_pars_vertex>
          uniform float uTime;
          varying float vWave;
          varying vec2 vXZ;
          void main() {
            vec4 world = modelMatrix * vec4(position, 1.0);
            float w = sin(world.x * 0.15 + uTime * 1.2) * 0.22 + cos(world.z * 0.12 + uTime * 0.9) * 0.22;
            world.y += w;
            vWave = w;
            vXZ = world.xz;
            vec4 mvPosition = viewMatrix * world;
            gl_Position = projectionMatrix * mvPosition;
            #include <fog_vertex>
          }
        `,
        fragmentShader: /* glsl */ `
          #include <fog_pars_fragment>
          uniform vec3 uDeep;
          uniform vec3 uShallow;
          uniform vec3 uFoam;
          uniform float uTime;
          uniform float uIsland;
          uniform float uSparkle;
          varying float vWave;
          varying vec2 vXZ;
          void main() {
            float r = length(vXZ);
            float shore = smoothstep(uIsland + 16.0, uIsland - 2.0, r);
            vec3 col = mix(uDeep, uShallow, shore);
            float ripple = smoothstep(0.82, 1.0, sin((r - uTime * 1.4) * 1.2) * 0.5 + 0.5);
            float foam = ripple * smoothstep(uIsland + 6.0, uIsland + 0.5, r);
            col = mix(col, uFoam, foam * 0.7 + smoothstep(0.3, 0.44, vWave) * 0.12);
            // glints of sun (or moon) on the wave crests
            float glint = pow(max(0.0, sin(vXZ.x * 2.3 + uTime * 1.9) * sin(vXZ.y * 2.9 - uTime * 1.4)), 30.0);
            col += vec3(1.0, 0.97, 0.88) * glint * uSparkle * smoothstep(0.0, 0.3, vWave + 0.2);
            gl_FragColor = vec4(col, 1.0);
            #include <colorspace_fragment>
            #include <fog_fragment>
          }
        `,
      }),
    []
  );

  useFrame((s) => {
    material.uniforms.uTime.value = s.clock.elapsedTime;
  });

  useEffect(() => {
    material.uniforms.uDeep.value.set(night ? '#0b2342' : '#1572a8');
    material.uniforms.uShallow.value.set(night ? '#1b5f73' : '#3fd0c9');
    material.uniforms.uFoam.value.set(night ? '#9fc4d8' : '#ffffff');
    material.uniforms.uSparkle.value = night ? 0.35 : 1.4;
  }, [night, material]);

  return (
    <mesh rotation-x={-Math.PI / 2} position-y={-0.45} material={material}>
      <planeGeometry args={[700, 700, 140, 140]} />
    </mesh>
  );
}

function Plaza() {
  const plazaMat = useMemo(() => {
    const t = stoneTexture().clone();
    t.repeat.set(5, 5);
    t.needsUpdate = true;
    return new THREE.MeshLambertMaterial({ map: t, color: '#e4ddcf' });
  }, []);
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={0.03} material={plazaMat} receiveShadow>
        <circleGeometry args={[9, 40]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.035} material={mat(C.stone)} receiveShadow>
        <ringGeometry args={[7.4, 8.1, 40]} />
      </mesh>
      {/* eight-point star inlay */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, (i * Math.PI) / 4]} position-y={0.04} material={mat(C.terracotta)}>
          <planeGeometry args={[0.5, 13]} />
        </mesh>
      ))}
    </group>
  );
}

export default function Island({ night }: { night: boolean }) {
  const grass = useMemo(() => {
    const g = wobblyDisc(LAND_RADIUS - 0.5, 1.6, 1.3);
    applyGroundUV(g);
    return g;
  }, []);
  const sand = useMemo(() => {
    const g = wobblyDisc(ISLAND_RADIUS, 2.2, 0.4);
    applyGroundUV(g);
    return g;
  }, []);
  const grassMat = useMemo(() => new THREE.MeshLambertMaterial({ map: groundTexture() }), []);
  const sandMat = useMemo(() => new THREE.MeshLambertMaterial({ map: sandTexture() }), []);
  const shelf = useMemo(() => {
    // underwater slope from the beach into the deep
    const geo = new THREE.CylinderGeometry(ISLAND_RADIUS + 1, ISLAND_RADIUS + 22, 6, 64, 1, true);
    geo.translate(0, -3.2, 0);
    return geo;
  }, []);
  const down = useRef<{ x: number; y: number } | null>(null);

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    down.current = { x: e.clientX, y: e.clientY };
  };
  const onUp = (e: ThreeEvent<PointerEvent>) => {
    const d = down.current;
    down.current = null;
    if (!d || runtime.dragged || Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8) return;
    const s = getState();
    if (!s.started || s.panel || s.mapOpen) return;
    e.stopPropagation();
    runtime.target = { x: e.point.x, z: e.point.z };
    runtime.pendingOpen = null;
  };

  return (
    <group>
      <group onPointerDown={onDown} onPointerUp={onUp}>
        <mesh geometry={grass} rotation-x={-Math.PI / 2} position-y={0} material={grassMat} receiveShadow />
        <mesh geometry={sand} rotation-x={-Math.PI / 2} position-y={-0.06} material={sandMat} receiveShadow />
        {/* pier deck is clickable too */}
        <mesh position={[0, PIER.deck - 0.08, (PIER.start + PIER.end) / 2]} visible={false}>
          <boxGeometry args={[PIER.halfWidth * 2 + 0.4, 0.1, PIER.end - PIER.start]} />
        </mesh>
      </group>
      <mesh geometry={shelf} material={mat('#d9c48c')} />
      <Plaza />
      <Water night={night} />
    </group>
  );
}
