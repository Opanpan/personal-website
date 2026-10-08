import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { groundAt, insideSolid, interactables, isOnPier, PIER, resolvePosition } from '../config';
import { runtime } from '../runtime';
import { getState, setState } from '../store';
import { C } from '../materials';
import { audio } from '../audio';
import { now } from '../runtime';
import { propSpots } from '../config';
import { animateLimbs, Character, PLAYER_LOOK } from './Character';

const WALK_SPEED = 6.5;
const RUN_SPEED = 11;
const CAM_DISTANCE = 17.4;
const JUMP_SPEED = 7;
const GRAVITY = 22;
/** sitting on the ground: drop the body so the thighs rest on it (hip pivot 0.8, thigh half 0.12) */
const SIT_DROP = -0.68;
const WAVE_SECONDS = 2.2;
const DANCE_SECONDS = 9;
const tmpCam = new THREE.Vector3();
const tmpLook = new THREE.Vector3();
const tmpFollow = new THREE.Vector3();

export default function Player() {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const limbs = useRef<THREE.Object3D[]>([]);
  const targetRing = useRef<THREE.Mesh>(null);
  const sun = useRef<THREE.DirectionalLight | null>(null);
  const camera = useThree((s) => s.camera);
  const camPos = useRef(new THREE.Vector3());
  const lookAt = useRef(new THREE.Vector3());
  const intro = useRef(0);
  const walkPhase = useRef(0);
  /** smoothed height of the surface underfoot, so the camera follows onto terraces without bobbing */
  const standing = useRef(0);
  /** fraction of the full camera distance currently in use (shrinks when a wall is in the way) */
  const camReach = useRef(1);
  /** camera pitch actually used: the player's pitch, raised to see over walls */
  const camLift = useRef(runtime.camPitch);
  const initialised = useRef(false);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const p = runtime.player;
    const game = getState();
    const t = state.clock.elapsedTime;

    if (runtime.teleport) {
      p.x = runtime.teleport.x;
      p.z = runtime.teleport.z;
      p.heading = Math.PI;
      runtime.jumpY = 0;
      runtime.jumpV = 0;
      runtime.teleport = null;
      runtime.target = null;
    }

    // ---- smoothed camera yaw; keyboard/joystick input is relative to it
    let yawDiff = runtime.camYaw - runtime.viewYaw;
    yawDiff = Math.atan2(Math.sin(yawDiff), Math.cos(yawDiff));
    runtime.viewYaw += yawDiff * Math.min(1, dt * 14);
    const cosY = Math.cos(runtime.viewYaw);
    const sinY = Math.sin(runtime.viewYaw);

    // ---- input → desired direction in world space
    let dx = 0;
    let dz = 0;
    const canMove = game.started && !game.panel && !game.mapOpen;
    if (canMove) {
      const k = runtime.keys;
      // camera space: x = right, z = towards the camera
      const ix = (k.right ? 1 : 0) - (k.left ? 1 : 0) + runtime.joy.x;
      const iz = (k.down ? 1 : 0) - (k.up ? 1 : 0) - runtime.joy.y;
      dx = cosY * ix + sinY * iz;
      dz = -sinY * ix + cosY * iz;
      if (ix !== 0 || iz !== 0) {
        runtime.target = null;
        runtime.pendingOpen = null;
      } else if (runtime.target) {
        const tx = runtime.target.x - p.x;
        const tz = runtime.target.z - p.z;
        const d = Math.hypot(tx, tz);
        if (d < 0.25) {
          runtime.target = null;
        } else {
          dx = tx / d;
          dz = tz / d;
        }
      }
    }

    const len = Math.hypot(dx, dz);
    const moving = len > 0.05;
    runtime.moving = moving;
    if (moving) {
      const nx = dx / Math.max(1, len);
      const nz = dz / Math.max(1, len);
      const running = runtime.keys.run || Math.hypot(runtime.joy.x, runtime.joy.y) > 0.92 || !!runtime.target;
      const speed = running ? RUN_SPEED : WALK_SPEED;
      const [rx, rz] = resolvePosition(p.x + nx * speed * dt, p.z + nz * speed * dt, p.x, p.z, runtime.jumpY);
      // stuck against an obstacle while click-moving → give up
      if (runtime.target && Math.hypot(rx - p.x, rz - p.z) < speed * dt * 0.1) {
        runtime.target = null;
      }
      p.x = rx;
      p.z = rz;
      const desired = Math.atan2(nx, nz);
      let diff = desired - p.heading;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      p.heading += diff * Math.min(1, dt * 12);
      const before = Math.floor(walkPhase.current / Math.PI);
      walkPhase.current += dt * (running ? 14 : 10);
      // a footstep every half stride, sounding like whatever is underfoot
      if (Math.floor(walkPhase.current / Math.PI) !== before) {
        audio.footstep(isOnPier(p.x, p.z) ? 'wood' : Math.hypot(p.x, p.z) < 9 ? 'stone' : 'grass');
      }
    } else {
      walkPhase.current *= 0.85;
    }

    audio.update(p.x, p.z, t);

    // ---- jump / fall. jumpY is the feet height above the ground (or pier deck); `floor` is
    // the top of whatever is underfoot (a rock, barrel, terrace) so you can land on it.
    const floor = groundAt(p.x, p.z, runtime.jumpY);
    let grounded = runtime.jumpV <= 0 && runtime.jumpY <= floor + 0.001;
    if (grounded) {
      // step up onto low ledges quickly rather than teleporting
      runtime.jumpY = floor > runtime.jumpY ? Math.min(floor, runtime.jumpY + dt * 8) : floor;
    }
    if (runtime.jumpQueued) {
      runtime.jumpQueued = false;
      if (grounded && canMove) {
        runtime.jumpV = JUMP_SPEED;
        if (runtime.emote?.kind !== 'wave') runtime.emote = null;
        audio.hop();
        grounded = false;
      }
    }
    if (!grounded) {
      // stepped off a ledge, or mid-jump
      runtime.jumpV -= GRAVITY * dt;
      runtime.jumpY += runtime.jumpV * dt;
      if (runtime.jumpV <= 0 && runtime.jumpY <= floor) {
        runtime.jumpY = floor;
        runtime.jumpV = 0;
        audio.land();
      }
    }
    standing.current = THREE.MathUtils.lerp(standing.current, floor, Math.min(1, dt * 6));
    const airborne = runtime.jumpY > floor + 0.02;

    // ---- emotes: walking cancels sitting/dancing, waves and dances time out
    const em = runtime.emote;
    if (em) {
      const age = now() - em.since;
      if ((moving && em.kind !== 'wave') || (em.kind === 'wave' && age > WAVE_SECONDS) || (em.kind === 'dance' && age > DANCE_SECONDS) || !game.started) {
        runtime.emote = null;
      }
    }
    const emote = runtime.emote?.kind ?? null;

    // ---- character transform + procedural animation
    const onPier = isOnPier(p.x, p.z);
    p.y = THREE.MathUtils.lerp(p.y, onPier ? PIER.deck : 0, dt * 10);
    if (root.current) {
      root.current.position.set(p.x, p.y + runtime.jumpY, p.z);
      root.current.rotation.y = p.heading;
    }
    animateLimbs(limbs.current, walkPhase.current, moving && !airborne, t);
    const [legL, legR, armL, armR] = limbs.current;
    if (armR) {
      // wave at the camera on the title screen, or when the wave emote is on
      const waving = !game.started || emote === 'wave';
      armR.rotation.z = waving ? 2.6 + Math.sin(t * (game.started ? 11 : 6)) * 0.32 : THREE.MathUtils.lerp(armR.rotation.z, 0, 0.2);
    }
    if (body.current) {
      const b = body.current;
      b.position.y = moving ? Math.abs(Math.sin(walkPhase.current)) * 0.1 : Math.sin(t * 2) * 0.02;
      b.rotation.y = THREE.MathUtils.lerp(b.rotation.y, emote === 'dance' ? Math.sin(t * 4) * 0.55 : 0, 0.25);
      if (emote === 'dance' && armL && armR && legL && legR) {
        // joget: bounce, sway and pump the arms
        b.position.y = Math.abs(Math.sin(t * 8)) * 0.16;
        armL.rotation.z = -(1.3 + Math.sin(t * 8) * 0.7);
        armR.rotation.z = 1.3 + Math.sin(t * 8 + Math.PI) * 0.7;
        legL.rotation.x = Math.max(0, Math.sin(t * 8)) * -0.5;
        legR.rotation.x = Math.max(0, -Math.sin(t * 8)) * -0.5;
      } else if (armL) {
        armL.rotation.z = THREE.MathUtils.lerp(armL.rotation.z, 0, 0.2);
      }
      if (emote === 'sit' && legL && legR && armL && armR) {
        b.position.y = SIT_DROP + Math.sin(t * 2) * 0.01;
        legL.rotation.x = legR.rotation.x = -1.45;
        armL.rotation.x = armR.rotation.x = -0.75;
      }
      if (airborne && legL && legR && armL) {
        // tuck the legs, throw the arms up
        legL.rotation.x = -0.7;
        legR.rotation.x = -0.25;
        armL.rotation.z = -0.9;
        if (armR && emote !== 'wave') armR.rotation.z = 0.9;
      }
    }

    // ---- click-to-move target ring
    if (targetRing.current) {
      targetRing.current.visible = !!runtime.target;
      if (runtime.target) {
        targetRing.current.position.set(runtime.target.x, 0.06, runtime.target.z);
        const s = 1 + Math.sin(t * 8) * 0.12;
        targetRing.current.scale.set(s, s, s);
      }
    }

    // ---- nearest interactable
    let nearest: string | null = null;
    let best = Infinity;
    for (const it of interactables) {
      const d = Math.hypot(it.x - p.x, it.z - p.z);
      if (d < it.radius && d < best) {
        best = d;
        nearest = it.id;
      }
    }
    if (nearest !== game.nearby) setState({ nearby: nearest });
    // props only prompt when no story marker is in range
    let prop: string | null = null;
    if (!nearest) {
      let bestProp = Infinity;
      for (const sp of propSpots) {
        const d = Math.hypot(sp.x - p.x, sp.z - p.z);
        if (d < sp.radius && d < bestProp) {
          bestProp = d;
          prop = sp.id;
        }
      }
    }
    if (prop !== game.nearbyProp) setState({ nearbyProp: prop });
    if (runtime.pendingOpen && nearest === runtime.pendingOpen) {
      runtime.pendingOpen = null;
      runtime.target = null;
      setState({ panel: nearest });
    }

    // ---- camera: orbit the island on the title screen, then ease in behind the player
    intro.current = THREE.MathUtils.lerp(intro.current, game.started ? 1 : 0, dt * 1.6);
    // follow point trails the player slightly; the orbit offset is applied on top so
    // rotating the view swings around the player instead of cutting across
    if (!initialised.current) {
      lookAt.current.set(p.x, p.y + standing.current + 1.2, p.z);
      initialised.current = true;
    }
    lookAt.current.lerp(tmpLook.set(p.x, p.y + standing.current + 1.2, p.z), Math.min(1, dt * 8));
    const dist = CAM_DISTANCE * runtime.zoom;
    const placeCam = (pitch: number) =>
      camPos.current.set(
        lookAt.current.x + sinY * Math.cos(pitch) * dist,
        lookAt.current.y + Math.sin(pitch) * dist,
        lookAt.current.z + cosY * Math.cos(pitch) * dist
      );
    // how far along player → camera the view is clear of solid structures (1 = all the way)
    const clearReach = () => {
      const STEPS = 24;
      for (let i = 1; i <= STEPS; i++) {
        tmpCam.lerpVectors(lookAt.current, camPos.current, i / STEPS);
        if (insideSolid(tmpCam.x, tmpCam.y - p.y, tmpCam.z)) return (i - 1) / STEPS;
      }
      return 1;
    };
    // ---- camera collision: never enter a building. First crane up over whatever is in the
    // way; only if no angle clears it, slide in towards the player.
    let pitch = runtime.camPitch;
    placeCam(pitch);
    let reach = clearReach();
    for (let up = pitch + 0.1; reach < 0.85 && up <= 1.35; up += 0.1) {
      placeCam(up);
      const r = clearReach();
      if (r > reach) {
        pitch = up;
        reach = r;
      }
    }
    // pitch eases back down / reach eases back out, so the camera doesn't pump
    camLift.current = pitch > camLift.current ? THREE.MathUtils.lerp(camLift.current, pitch, Math.min(1, dt * 10)) : THREE.MathUtils.lerp(camLift.current, pitch, Math.min(1, dt * 2.5));
    placeCam(camLift.current);
    reach = Math.max(0.12, Math.min(reach, clearReach()));
    camReach.current = reach < camReach.current ? reach : THREE.MathUtils.lerp(camReach.current, reach, Math.min(1, dt * 3));
    camPos.current.lerpVectors(lookAt.current, camPos.current, camReach.current);
    const orbitA = t * 0.06;
    camera.position.copy(tmpCam.set(Math.sin(orbitA) * 70, 42, Math.cos(orbitA) * 70).lerp(camPos.current, intro.current));
    camera.lookAt(tmpFollow.set(0, 0, 0).lerp(lookAt.current, intro.current));

    // ---- keep the shadow frustum centred on the player
    if (!sun.current) sun.current = (state.scene.getObjectByName('sun') as THREE.DirectionalLight) ?? null;
    if (sun.current) {
      sun.current.position.set(p.x + 25, 40, p.z + 15);
      sun.current.target.position.set(p.x, 0, p.z);
      sun.current.target.updateMatrixWorld();
    }
  });

  return (
    <>
      <group ref={root}>
        <group ref={body}>
          <Character look={PLAYER_LOOK} limbs={limbs} />
        </group>
        {/* blob shadow keeps the character grounded even when far from the shadow camera */}
        <mesh rotation-x={-Math.PI / 2} position-y={0.03}>
          <circleGeometry args={[0.5, 16]} />
          <meshBasicMaterial color="#000" transparent opacity={0.18} depthWrite={false} />
        </mesh>
      </group>
      <mesh ref={targetRing} rotation-x={-Math.PI / 2} visible={false}>
        <ringGeometry args={[0.45, 0.65, 24]} />
        <meshBasicMaterial color={C.gold} transparent opacity={0.85} depthWrite={false} />
      </mesh>
    </>
  );
}
