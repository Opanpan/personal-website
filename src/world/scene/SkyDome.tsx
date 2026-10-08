import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

/** Must stay inside the camera's far plane (700) or the dome gets clipped away. */
const RADIUS = 480;

// Sun sits north-east so it's in view of the default (north-facing) camera; the moon is in the
// same spot as the moon mesh in Environment.
const SUN_DIR = new THREE.Vector3(0.55, 0.3, -0.78).normalize();
const MOON_DIR = new THREE.Vector3(80, 70, -160).normalize();

// The horizon colours match the scene fog so distant islands melt into the sky.
const DAY = {
  zenith: '#1a62c4',
  mid: '#5aa8e6',
  horizon: '#bfe6f2',
  glow: '#ffe2a8',
  wisp: '#ffffff',
  sunSize: 1,
  wispAmount: 0.55,
};
const NIGHT = {
  zenith: '#03081a',
  mid: '#0b1638',
  horizon: '#0d1b33',
  glow: '#8fa6e6',
  wisp: '#3a4a78',
  sunSize: 0,
  wispAmount: 0.25,
};

/**
 * Gradient sky dome: zenith → horizon gradient, sun disc with a warm halo (or a cool moon halo
 * at night) and drifting high cirrus wisps. One shader for day and night — switching only changes
 * uniforms, so toggling the theme never compiles a new program.
 */
export default function SkyDome({ night }: { night: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          uTime: { value: 0 },
          uZenith: { value: new THREE.Color(DAY.zenith) },
          uMid: { value: new THREE.Color(DAY.mid) },
          uHorizon: { value: new THREE.Color(DAY.horizon) },
          uGlow: { value: new THREE.Color(DAY.glow) },
          uWisp: { value: new THREE.Color(DAY.wisp) },
          uLightDir: { value: SUN_DIR.clone() },
          uSunSize: { value: DAY.sunSize },
          uWispAmount: { value: DAY.wispAmount },
        },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main() {
            vDir = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime;
          uniform vec3 uZenith;
          uniform vec3 uMid;
          uniform vec3 uHorizon;
          uniform vec3 uGlow;
          uniform vec3 uWisp;
          uniform vec3 uLightDir;
          uniform float uSunSize;
          uniform float uWispAmount;
          varying vec3 vDir;

          float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          float noise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
          }
          float fbm(vec2 p) {
            float v = 0.0;
            float a = 0.5;
            for (int i = 0; i < 4; i++) {
              v += a * noise(p);
              p *= 2.03;
              a *= 0.5;
            }
            return v;
          }

          void main() {
            vec3 dir = normalize(vDir);
            float h = dir.y;

            // horizon → mid → zenith; below the horizon stays horizon colour (fades into the sea)
            // (the camera mostly sees the lowest few degrees, so the colour has to change fast there)
            vec3 col = mix(uHorizon, uMid, smoothstep(-0.01, 0.1, h));
            col = mix(col, uZenith, smoothstep(0.08, 0.6, h));

            // halo around the sun / moon, warmest down near the horizon
            float d = max(dot(dir, uLightDir), 0.0);
            float near = smoothstep(0.35, 0.0, abs(h - uLightDir.y));
            col = mix(col, uGlow, pow(d, 6.0) * 0.55 + pow(d, 2.0) * near * 0.25);

            // high cirrus wisps, projected onto a flat ceiling so they stretch toward the horizon
            if (h > 0.01) {
              vec2 uv = dir.xz / (h + 0.12) * 1.4 + vec2(uTime * 0.012, uTime * 0.004);
              float w = fbm(uv * vec2(1.0, 2.6));
              w = smoothstep(0.5, 0.82, w) * smoothstep(0.01, 0.12, h);
              vec3 wisp = mix(uWisp, uGlow, pow(d, 4.0) * 0.6);
              col = mix(col, wisp, w * uWispAmount);
            }

            // sun disc with a soft bright rim (blooms on the high tier)
            float disc = smoothstep(0.9993, 0.9997, d) * uSunSize;
            float corona = pow(d, 220.0) * 0.6 * uSunSize;
            col += vec3(1.0, 0.96, 0.85) * (disc * 1.4 + corona);

            // tiny dither so the gradient doesn't band on 8-bit displays
            col += (hash(gl_FragCoord.xy) - 0.5) / 255.0;

            gl_FragColor = vec4(col, 1.0);
            #include <colorspace_fragment>
          }
        `,
      }),
    []
  );

  useEffect(() => {
    const p = night ? NIGHT : DAY;
    const u = material.uniforms;
    u.uZenith.value.set(p.zenith);
    u.uMid.value.set(p.mid);
    u.uHorizon.value.set(p.horizon);
    u.uGlow.value.set(p.glow);
    u.uWisp.value.set(p.wisp);
    u.uLightDir.value.copy(night ? MOON_DIR : SUN_DIR);
    u.uSunSize.value = p.sunSize;
    u.uWispAmount.value = p.wispAmount;
  }, [night, material]);

  useFrame((s) => {
    material.uniforms.uTime.value = s.clock.elapsedTime;
    // the dome travels with the camera so it always reads as infinitely far away
    mesh.current?.position.copy(s.camera.position);
  });

  return (
    <mesh ref={mesh} material={material} renderOrder={-1} frustumCulled={false}>
      <sphereGeometry args={[RADIUS, 48, 24]} />
    </mesh>
  );
}
