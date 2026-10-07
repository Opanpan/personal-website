import React, { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { addCircleCollider, boxColliders, isFreeForDecoration, LAND_RADIUS, mulberry32, PIER } from '../config';
import { runtime } from '../runtime';
import { C, mat, nonIndexed } from '../materials';

interface Placement {
  x: number;
  z: number;
  rot: number;
  scale: number;
}

/** Generated once per page load; also registers colliders. */
const layout = (() => {
  const rand = mulberry32(20240817);
  const palms: Placement[] = [];
  const trees: Placement[] = [];
  const bushes: Placement[] = [];
  const rocks: Placement[] = [];
  const bananas: Placement[] = [];
  const ferns: Placement[] = [];
  const flowers: (Placement & { color: number })[] = [];
  const taken: { x: number; z: number; r: number }[] = [];
  const free = (x: number, z: number, r: number) => taken.every((t) => Math.hypot(t.x - x, t.z - z) > t.r + r);
  const nearPier = (x: number, z: number) => z > 38 && Math.abs(x) < 6;

  // coconut palms along the beach
  for (let i = 0; i < 400 && palms.length < 46; i++) {
    const a = rand() * Math.PI * 2;
    const r = 44 + rand() * 9;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (nearPier(x, z) || !isFreeForDecoration(x, z) || !free(x, z, 2.2)) continue;
    palms.push({ x, z, rot: rand() * Math.PI * 2, scale: 0.85 + rand() * 0.4 });
    taken.push({ x, z, r: 2.2 });
  }
  // round tropical trees inland
  for (let i = 0; i < 600 && trees.length < 42; i++) {
    const a = rand() * Math.PI * 2;
    const r = 8 + rand() * 38;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (!isFreeForDecoration(x, z, 1.5) || !free(x, z, 2.6)) continue;
    trees.push({ x, z, rot: rand() * Math.PI * 2, scale: 0.8 + rand() * 0.6 });
    taken.push({ x, z, r: 2.6 });
  }
  // pohon pisang (banana plants) in little clumps
  for (let i = 0; i < 400 && bananas.length < 18; i++) {
    const a = rand() * Math.PI * 2;
    const r = 10 + rand() * 36;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (!isFreeForDecoration(x, z, 1) || !free(x, z, 1.8)) continue;
    bananas.push({ x, z, rot: rand() * Math.PI * 2, scale: 0.8 + rand() * 0.4 });
    taken.push({ x, z, r: 1.8 });
  }
  for (let i = 0; i < 600 && ferns.length < 70; i++) {
    const a = rand() * Math.PI * 2;
    const r = 6 + rand() * 42;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (!isFreeForDecoration(x, z, 0) || !free(x, z, 0.7)) continue;
    ferns.push({ x, z, rot: rand() * Math.PI * 2, scale: 0.7 + rand() * 0.6 });
    taken.push({ x, z, r: 0.7 });
  }
  for (let i = 0; i < 500 && bushes.length < 60; i++) {
    const a = rand() * Math.PI * 2;
    const r = 6 + rand() * 44;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (!isFreeForDecoration(x, z, 0.3) || !free(x, z, 1)) continue;
    bushes.push({ x, z, rot: rand() * Math.PI * 2, scale: 0.6 + rand() * 0.6 });
    taken.push({ x, z, r: 1 });
  }
  for (let i = 0; i < 300 && rocks.length < 26; i++) {
    const a = rand() * Math.PI * 2;
    const r = 20 + rand() * 36;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (nearPier(x, z) || !isFreeForDecoration(x, z) || !free(x, z, 1.2)) continue;
    rocks.push({ x, z, rot: rand() * Math.PI * 2, scale: 0.5 + rand() * 1.1 });
    taken.push({ x, z, r: 1.2 });
  }
  const flowerColors = [0xe63946, 0xff7eb6, 0xfff1a8, 0xffffff, 0xff9f1c];
  for (let i = 0; i < 1200 && flowers.length < 260; i++) {
    const a = rand() * Math.PI * 2;
    const r = 5 + rand() * 45;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r;
    if (r > LAND_RADIUS - 6 || !isFreeForDecoration(x, z, -1.2)) continue;
    flowers.push({ x, z, rot: rand() * Math.PI, scale: 0.7 + rand() * 0.6, color: flowerColors[Math.floor(rand() * flowerColors.length)] });
  }

  palms.forEach((p) => addCircleCollider(p.x, p.z, 0.4 * p.scale));
  trees.forEach((p) => addCircleCollider(p.x, p.z, 0.55 * p.scale));
  rocks.forEach((p) => addCircleCollider(p.x, p.z, 0.75 * p.scale));
  bananas.forEach((p) => addCircleCollider(p.x, p.z, 0.3 * p.scale));
  return { palms, trees, bushes, rocks, flowers, bananas, ferns };
})();

// ---------------------------------------------------------------------------
// Template geometries (merged so each kind is a single instanced draw call)
// ---------------------------------------------------------------------------
const palmTrunkGeo = (() => {
  const parts: THREE.BufferGeometry[] = [];
  let x = 0;
  let y = 0;
  for (let i = 0; i < 6; i++) {
    const seg = new THREE.CylinderGeometry(0.2 - i * 0.015, 0.24 - i * 0.015, 1.25, 6);
    const lean = i * 0.06;
    seg.rotateZ(-lean);
    seg.translate(x + Math.sin(lean) * 0.6, y + 0.62, 0);
    x += Math.sin(lean) * 1.25;
    y += Math.cos(lean) * 1.2;
    parts.push(nonIndexed(seg));
  }
  return { geo: mergeGeometries(parts)!, top: new THREE.Vector3(x, y, 0) };
})();

const palmLeavesGeo = (() => {
  const parts: THREE.BufferGeometry[] = [];
  const { top } = palmTrunkGeo;
  for (let i = 0; i < 8; i++) {
    const leaf = new THREE.ConeGeometry(0.42, 3, 3, 1);
    leaf.scale(1, 1, 0.25);
    leaf.rotateZ(-Math.PI / 2 - 0.35 - (i % 2) * 0.2);
    leaf.translate(1.4, -0.35, 0);
    leaf.rotateY((i / 8) * Math.PI * 2);
    leaf.translate(top.x, top.y, top.z);
    parts.push(nonIndexed(leaf));
  }
  return mergeGeometries(parts)!;
})();

const coconutGeo = (() => {
  const { top } = palmTrunkGeo;
  const parts = [0, 1, 2].map((i) => {
    const c = new THREE.IcosahedronGeometry(0.18, 0);
    const a = (i / 3) * Math.PI * 2;
    c.translate(top.x + Math.cos(a) * 0.25, top.y - 0.25, Math.sin(a) * 0.25);
    return nonIndexed(c);
  });
  return mergeGeometries(parts)!;
})();

const treeTrunkGeo = (() => {
  const g = new THREE.CylinderGeometry(0.25, 0.4, 2.6, 6);
  g.translate(0, 1.3, 0);
  return g;
})();

const treeCanopyGeo = (() => {
  const blobs = [
    [0, 3.3, 0, 1.7],
    [0.9, 2.9, 0.3, 1.2],
    [-0.8, 3, -0.4, 1.25],
    [0.1, 4.2, 0.1, 1.1],
  ].map(([x, y, z, r]) => {
    const g = new THREE.IcosahedronGeometry(r, 0);
    g.translate(x, y, z);
    return nonIndexed(g);
  });
  return mergeGeometries(blobs)!;
})();

const bushGeo = (() => {
  const blobs = [
    [0, 0.45, 0, 0.65],
    [0.5, 0.35, 0.2, 0.45],
    [-0.45, 0.35, -0.15, 0.5],
  ].map(([x, y, z, r]) => {
    const g = new THREE.IcosahedronGeometry(r, 0);
    g.translate(x, y, z);
    return nonIndexed(g);
  });
  return mergeGeometries(blobs)!;
})();

const rockGeo = new THREE.DodecahedronGeometry(0.8, 0);
rockGeo.scale(1, 0.6, 1);

const flowerGeo = (() => {
  const g = new THREE.OctahedronGeometry(0.16, 0);
  g.scale(1, 0.5, 1);
  g.translate(0, 0.18, 0);
  return g;
})();

const bananaTrunkGeo = (() => {
  const g = new THREE.CylinderGeometry(0.14, 0.22, 2.4, 7);
  g.translate(0, 1.2, 0);
  return g;
})();

const bananaLeavesGeo = (() => {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.BoxGeometry(1.9, 0.03, 0.55, 3, 1, 1);
    // droop: bend the far end of the leaf downwards
    const pos = leaf.attributes.position;
    for (let v = 0; v < pos.count; v++) {
      const x = pos.getX(v) + 0.95;
      pos.setY(v, pos.getY(v) - x * x * 0.22);
    }
    leaf.translate(0.95, 0, 0);
    leaf.rotateZ(0.55 - (i % 3) * 0.2);
    leaf.rotateY((i / 7) * Math.PI * 2);
    leaf.translate(0, 2.35, 0);
    parts.push(nonIndexed(leaf));
  }
  // hanging bunch of bananas
  const bunch = new THREE.ConeGeometry(0.2, 0.55, 6);
  bunch.rotateZ(Math.PI);
  bunch.translate(0.35, 1.9, 0);
  parts.push(nonIndexed(bunch));
  return mergeGeometries(parts)!;
})();

const fernGeo = (() => {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 6; i++) {
    const frond = new THREE.ConeGeometry(0.16, 1, 3);
    frond.scale(1, 1, 0.2);
    frond.rotateZ(-1.0);
    frond.translate(0.4, 0.32, 0);
    frond.rotateY((i / 6) * Math.PI * 2);
    parts.push(nonIndexed(frond));
  }
  return mergeGeometries(parts)!;
})();

// ---------------------------------------------------------------------------
// Grass tufts — thousands of instances, wind sway done in the vertex shader
// ---------------------------------------------------------------------------
const grassGeo = (() => {
  const positions: number[] = [];
  const colors: number[] = [];
  const base = new THREE.Color('#3f7d2c');
  const tip = new THREE.Color('#a6dc6c');
  for (let b = 0; b < 5; b++) {
    const a = (b / 5) * Math.PI * 2 + b * 0.7;
    const ox = Math.cos(a) * 0.08;
    const oz = Math.sin(a) * 0.08;
    const h = 0.32 + (b % 3) * 0.1;
    const w = 0.05;
    const px = Math.cos(a + Math.PI / 2) * w;
    const pz = Math.sin(a + Math.PI / 2) * w;
    const lean = 0.12;
    positions.push(ox - px, 0, oz - pz, ox + px, 0, oz + pz, ox + Math.cos(a) * lean, h, oz + Math.sin(a) * lean);
    colors.push(base.r, base.g, base.b, base.r, base.g, base.b, tip.r, tip.g, tip.b);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
})();

const windTime = { value: 0 };

const grassMaterial = (() => {
  const m = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = windTime;
    shader.vertexShader =
      'uniform float uTime;\n' +
      shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vec4 root = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
        float gust = sin(uTime * 1.7 + root.x * 0.35 + root.z * 0.27) * 0.6 + sin(uTime * 3.3 + root.x * 0.9) * 0.25;
        transformed.x += gust * position.y * 0.45;
        transformed.z += gust * position.y * 0.2;`
      );
  };
  m.customProgramCacheKey = () => 'grass-wind';
  return m;
})();

function Grass({ count }: { count: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const matrices = useMemo(() => {
    const rand = mulberry32(77);
    const out: THREE.Matrix4[] = [];
    const q = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i < count * 4 && out.length < count; i++) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * (LAND_RADIUS - 5);
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      if (!isFreeForDecoration(x, z, -1.3)) continue;
      if (boxColliders.some((b) => x > b.minX - 0.4 && x < b.maxX + 0.4 && z > b.minZ - 0.4 && z < b.maxZ + 0.4)) continue;
      const s = 0.7 + rand() * 0.8;
      q.setFromAxisAngle(up, rand() * Math.PI * 2);
      out.push(new THREE.Matrix4().compose(new THREE.Vector3(x, 0, z), q.clone(), new THREE.Vector3(s, s * (0.8 + rand() * 0.6), s)));
    }
    return out;
  }, [count]);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    mesh.count = matrices.length;
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [matrices]);
  useFrame((s) => {
    windTime.value = s.clock.elapsedTime;
  });
  return <instancedMesh key={count} ref={ref} args={[grassGeo, grassMaterial, count]} receiveShadow />;
}

const ZERO = new THREE.Matrix4().makeScale(0, 0, 0);

/** Is this placement between the orbit camera and the player? */
function occludes(p: Placement, reach: number) {
  const { x, z } = runtime.player;
  const rx = p.x - x;
  const rz = p.z - z;
  const sin = Math.sin(runtime.viewYaw);
  const cos = Math.cos(runtime.viewYaw);
  const along = rx * sin + rz * cos; // distance towards the camera
  const lateral = rx * cos - rz * sin;
  return along > 0.3 && along < 15 * runtime.zoom && Math.abs(lateral) < reach * p.scale + 0.6;
}

function Instanced({
  geometry,
  material,
  items,
  yOffset = 0,
  sway = 0,
  colors,
  fadeReach = 0,
}: {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
  items: Placement[];
  yOffset?: number;
  sway?: number;
  colors?: number[];
  /** when > 0, instances blocking the view of the player are drawn see-through */
  fadeReach?: number;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const ghost = useRef<THREE.InstancedMesh>(null);
  const ghostMaterial = useMemo(() => {
    if (!fadeReach) return null;
    const m = material.clone();
    m.transparent = true;
    m.opacity = 0.22;
    m.depthWrite = false;
    return m;
  }, [material, fadeReach]);
  const matrices = useMemo(() => {
    const q = new THREE.Quaternion();
    return items.map((p) => {
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), p.rot);
      return new THREE.Matrix4().compose(new THREE.Vector3(p.x, yOffset, p.z), q.clone(), new THREE.Vector3(p.scale, p.scale, p.scale));
    });
  }, [items, yOffset]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
    if (colors) colors.forEach((c, i) => mesh.setColorAt(i, new THREE.Color(c)));
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [matrices, colors]);

  const tmp = useMemo(() => new THREE.Matrix4(), []);
  const rot = useMemo(() => new THREE.Matrix4(), []);
  useFrame((s) => {
    const mesh = ref.current;
    if (!mesh || (!sway && !fadeReach)) return;
    const t = s.clock.elapsedTime;
    matrices.forEach((m, i) => {
      if (sway) {
        rot.makeRotationZ(Math.sin(t * 1.3 + i) * sway);
        tmp.multiplyMatrices(m, rot);
      } else {
        tmp.copy(m);
      }
      const hidden = fadeReach > 0 && occludes(items[i], fadeReach);
      mesh.setMatrixAt(i, hidden ? ZERO : tmp);
      ghost.current?.setMatrixAt(i, hidden ? tmp : ZERO);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (ghost.current) ghost.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={ref} args={[geometry, material, items.length]} castShadow receiveShadow />
      {ghostMaterial && <instancedMesh ref={ghost} args={[geometry, ghostMaterial, items.length]} frustumCulled={false} />}
    </>
  );
}

export default function Nature({ quality = 'high' }: { quality?: 'high' | 'low' }) {
  const flowerColors = useMemo(() => layout.flowers.map((f) => f.color), []);
  const flowerMat = useMemo(() => new THREE.MeshLambertMaterial({ flatShading: true }), []);
  return (
    <>
      <Instanced geometry={palmTrunkGeo.geo} material={mat(C.trunk)} items={layout.palms} fadeReach={1.2} />
      <Instanced geometry={palmLeavesGeo} material={mat(C.palmLeaf)} items={layout.palms} sway={0.025} fadeReach={2.6} />
      <Instanced geometry={coconutGeo} material={mat('#5b3b1a')} items={layout.palms} fadeReach={2.6} />
      <Instanced geometry={treeTrunkGeo} material={mat(C.trunk)} items={layout.trees} fadeReach={1.4} />
      <Instanced geometry={treeCanopyGeo} material={mat(C.leaf)} items={layout.trees} sway={0.012} fadeReach={2.2} />
      <Instanced geometry={bushGeo} material={mat(C.grassDark)} items={layout.bushes} />
      <Instanced geometry={bananaTrunkGeo} material={mat('#8a7a45')} items={layout.bananas} fadeReach={1} />
      <Instanced geometry={bananaLeavesGeo} material={mat('#6abf3a')} items={layout.bananas} sway={0.02} fadeReach={2} />
      <Instanced geometry={fernGeo} material={mat('#3f8f3a')} items={layout.ferns} />
      <Grass count={quality === 'high' ? 9000 : 3000} />
      <Instanced geometry={rockGeo} material={mat(C.stoneDark)} items={layout.rocks} yOffset={0.1} />
      <Instanced geometry={flowerGeo} material={flowerMat} items={layout.flowers} colors={flowerColors} />
      {/* driftwood + sea rocks around the pier foot */}
      <mesh position={[-4.5, 0, PIER.start + 1]} rotation={[0, 0.5, Math.PI / 2]} material={mat('#a68a64')} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 2.4, 5]} />
      </mesh>
    </>
  );
}
