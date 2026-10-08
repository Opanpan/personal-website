import React, { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { runtime } from '../runtime';
import { getState } from '../store';

/**
 * Buildings that turn see-through while they stand between the camera and the player — the same
 * ghosting the trees in Nature get, but for whole landmark groups (tested against their real meshes).
 */

const GHOST_OPACITY = 0.28;
/** keep a building faded briefly after it stops blocking, so it doesn't flicker at the edges */
const HOLD_SECONDS = 0.25;
/** frames at the start where everything is ghosted, so the ghost shaders compile with the initial load */
const WARMUP_FRAMES = 3;

const ghosts = new Map<THREE.Material, THREE.Material>();
function ghostOf(material: THREE.Material) {
  let g = ghosts.get(material);
  if (!g) {
    g = material.clone();
    g.transparent = true;
    g.opacity = GHOST_OPACITY;
    g.depthWrite = false;
    ghosts.set(material, g);
  }
  return g;
}

interface Entry {
  group: THREE.Group;
  box: THREE.Box3;
  boxReady: boolean;
  faded: boolean;
  until: number;
}
const entries = new Set<Entry>();

function setFaded(e: Entry, faded: boolean) {
  e.faded = faded;
  e.group.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || Array.isArray(mesh.material)) return;
    if (faded) {
      // already-transparent parts (glass, smoke) keep their own look
      if (mesh.userData.solidMaterial || mesh.material.transparent) return;
      mesh.userData.solidMaterial = mesh.material;
      mesh.material = ghostOf(mesh.material);
    } else if (mesh.userData.solidMaterial) {
      mesh.material = mesh.userData.solidMaterial;
      delete mesh.userData.solidMaterial;
    }
  });
}

/** Wrap a landmark so it ghosts when it hides the player. */
export function Fade({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useLayoutEffect(() => {
    const e: Entry = { group: ref.current!, box: new THREE.Box3(), boxReady: false, faded: false, until: 0 };
    entries.add(e);
    return () => {
      setFaded(e, false);
      entries.delete(e);
    };
  }, []);
  return <group ref={ref}>{children}</group>;
}

const isMeshHit = (i: THREE.Intersection) => (i.object as THREE.Mesh).isMesh;

/** One per scene: casts camera → player each frame and ghosts whichever <Fade> groups it passes through. */
export function FadeController() {
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const hit = useMemo(() => new THREE.Vector3(), []);
  const feet = useMemo(() => new THREE.Vector3(), []);
  const frame = useRef(0);

  useFrame((state) => {
    frame.current += 1;
    const warm = frame.current <= WARMUP_FRAMES;
    const active = getState().started;
    const now = state.clock.elapsedTime;
    const p = runtime.player;
    const cam = state.camera.position;
    target.set(p.x, p.y + runtime.jumpY + 1.1, p.z);
    feet.set(p.x, p.y + runtime.jumpY - 0.05, p.z);
    // only meaningful when the player is up on something (on the ground, every nearby box contains y≈0)
    const raised = runtime.jumpY > 0.2;
    const dist = cam.distanceTo(target);
    dir.subVectors(target, cam).normalize();
    raycaster.set(cam, dir);
    raycaster.near = 0;
    raycaster.far = Math.max(0, dist - 0.5);
    raycaster.camera = state.camera;

    entries.forEach((e) => {
      if (!e.boxReady) {
        e.box.setFromObject(e.group).expandByScalar(0.5);
        e.boxReady = !e.box.isEmpty();
      }
      let blocking = warm;
      // on a building, the floor and edges at the player's own level don't count — only parts
      // rising above them (upper levels, stupas) — so it never ghosts just for standing on it
      const standingOn = raised && e.boxReady && e.box.containsPoint(feet);
      if (!blocking && active && e.boxReady) {
        // cheap box test first, then the real meshes
        const enter = raycaster.ray.intersectBox(e.box, hit);
        if (enter && enter.distanceTo(cam) < raycaster.far) {
          blocking = raycaster.intersectObject(e.group, true).some((i) => isMeshHit(i) && (!standingOn || i.point.y > feet.y + 0.4));
        }
      }
      if (blocking) e.until = now + HOLD_SECONDS;
      const want = blocking || (active && now < e.until);
      if (want !== e.faded) setFaded(e, want);
    });
  });
  return null;
}
