import React, { useMemo } from 'react';
import * as THREE from 'three';
import { batikTexture, C, mat } from '../materials';

export type Hat = 'peci' | 'caping' | 'hijab' | 'none';

export interface Look {
  /** colour, or 'batik' for the kawung pattern */
  shirt: string;
  pants: string;
  skin: string;
  hat: Hat;
  /** hijab / caping colour */
  hatColor?: string;
  /** wrap-around sarung over the hips */
  sarung?: string;
  hair?: string;
  /** extra detail (face features, collar, belt) — the player gets it, background villagers don't */
  detailed?: boolean;
}

export const PLAYER_LOOK: Look = { shirt: 'batik', pants: '#2f3b55', skin: C.skin, hat: 'peci', sarung: '#2d6a4f', detailed: true };

/** Limb pivots in order: left leg, right leg, left arm, right arm, head */
export type Limbs = React.MutableRefObject<THREE.Object3D[]>;

const shirtMaterials = new Map<string, THREE.Material>();
function shirtMat(shirt: string) {
  let m = shirtMaterials.get(shirt);
  if (!m) {
    m = shirt === 'batik' ? new THREE.MeshLambertMaterial({ map: batikTexture(), flatShading: true }) : mat(shirt);
    shirtMaterials.set(shirt, m);
  }
  return m;
}

/**
 * Blocky low-poly villager. Limb groups pivot at the hip / shoulder / neck so they can be
 * swung by `animateLimbs`.
 */
export function Character({ look, limbs }: { look: Look; limbs: Limbs }) {
  const shirt = useMemo(() => shirtMat(look.shirt), [look.shirt]);
  const set = (i: number) => (g: THREE.Object3D | null) => {
    if (g) limbs.current[i] = g;
  };
  const skin = mat(look.skin);
  const hair = mat(look.hair ?? C.black);
  const d = look.detailed;

  return (
    <group>
      {/* legs */}
      {[-0.15, 0.15].map((x, i) => (
        <group key={x} ref={set(i)} position={[x, 0.8, 0]}>
          <mesh position={[0, -0.36, 0]} material={mat(look.pants)} castShadow>
            <boxGeometry args={[0.22, 0.66, 0.24]} />
          </mesh>
          {/* sandals */}
          <mesh position={[0, -0.75, 0.05]} material={mat('#6b4423')} castShadow>
            <boxGeometry args={[0.24, 0.08, 0.36]} />
          </mesh>
          <mesh position={[0, -0.7, 0.03]} material={skin}>
            <boxGeometry args={[0.18, 0.06, 0.26]} />
          </mesh>
        </group>
      ))}

      {look.sarung && (
        <mesh position={[0, 0.78, 0]} material={mat(look.sarung)} castShadow>
          <boxGeometry args={[0.6, 0.34, 0.36]} />
        </mesh>
      )}

      {/* torso — slightly tapered */}
      <mesh position={[0, 1.2, 0]} rotation-y={Math.PI / 4} material={shirt} castShadow>
        <cylinderGeometry args={[0.41, 0.34, 0.68, 4, 1]} />
      </mesh>
      {/* shoulder yoke so the arms join the body */}
      <mesh position={[0, 1.47, 0]} material={shirt} castShadow>
        <boxGeometry args={[0.78, 0.14, 0.32]} />
      </mesh>
      {d && (
        <>
          {/* collar + belt */}
          <mesh position={[0, 1.54, 0]} rotation-y={Math.PI / 4} material={mat('#3b1a07')}>
            <cylinderGeometry args={[0.18, 0.24, 0.06, 4]} />
          </mesh>
          <mesh position={[0, 0.9, 0]} rotation-y={Math.PI / 4} material={mat('#3a2a1a')}>
            <cylinderGeometry args={[0.36, 0.36, 0.07, 4]} />
          </mesh>
          {/* sling bag */}
          <mesh position={[0.34, 0.98, 0.12]} rotation-z={0.2} material={mat('#a0522d')} castShadow>
            <boxGeometry args={[0.1, 0.26, 0.24]} />
          </mesh>
          <mesh position={[0.02, 1.22, 0.27]} rotation={[0, 0, -0.7]} material={mat('#a0522d')}>
            <boxGeometry args={[0.07, 0.8, 0.03]} />
          </mesh>
        </>
      )}

      {/* arms */}
      {[-0.38, 0.38].map((x, i) => (
        <group key={x} ref={set(i + 2)} position={[x, 1.48, 0]}>
          <mesh position={[0, -0.15, 0]} material={shirt} castShadow>
            <boxGeometry args={[0.19, 0.36, 0.22]} />
          </mesh>
          <mesh position={[0, -0.43, 0]} material={skin} castShadow>
            <boxGeometry args={[0.15, 0.26, 0.16]} />
          </mesh>
          {d && (
            <mesh position={[0, -0.6, 0.01]} material={skin}>
              <boxGeometry args={[0.16, 0.1, 0.17]} />
            </mesh>
          )}
        </group>
      ))}

      {/* head */}
      <group ref={set(4)} position={[0, 1.5, 0]}>
        <mesh position={[0, 0.1, 0]} material={skin} castShadow>
          <boxGeometry args={[0.18, 0.22, 0.18]} />
        </mesh>
        <group position={[0, 0.41, 0]}>
          <mesh material={skin} castShadow>
            <boxGeometry args={[0.46, 0.46, 0.42]} />
          </mesh>
          {look.hat !== 'hijab' && (
            <mesh position={[0, 0.08, -0.05]} material={hair}>
              <boxGeometry args={[0.49, 0.32, 0.36]} />
            </mesh>
          )}
          {/* eyes */}
          {[-0.1, 0.1].map((x) => (
            <mesh key={x} position={[x, 0.02, 0.215]} material={mat(C.black)}>
              <boxGeometry args={[0.06, 0.08, 0.02]} />
            </mesh>
          ))}
          {d && (
            <>
              {[-0.1, 0.1].map((x) => (
                <mesh key={`w${x}`} position={[x + 0.015, 0.04, 0.226]} material={mat('#ffffff')}>
                  <boxGeometry args={[0.02, 0.025, 0.01]} />
                </mesh>
              ))}
              {[-0.1, 0.1].map((x) => (
                <mesh key={`b${x}`} position={[x, 0.11, 0.215]} material={hair}>
                  <boxGeometry args={[0.1, 0.025, 0.02]} />
                </mesh>
              ))}
              <mesh position={[0, -0.04, 0.23]} material={mat('#b97a4c')}>
                <boxGeometry args={[0.06, 0.08, 0.05]} />
              </mesh>
              {[-0.24, 0.24].map((x) => (
                <mesh key={`e${x}`} position={[x, 0, 0]} material={skin}>
                  <boxGeometry args={[0.05, 0.12, 0.09]} />
                </mesh>
              ))}
              {/* blush */}
              {[-0.15, 0.15].map((x) => (
                <mesh key={`c${x}`} position={[x, -0.07, 0.212]} material={mat('#e08a6f')}>
                  <boxGeometry args={[0.07, 0.035, 0.01]} />
                </mesh>
              ))}
            </>
          )}
          <mesh position={[0, -0.12, 0.215]} material={mat('#7a3f22')}>
            <boxGeometry args={[0.12, 0.025, 0.02]} />
          </mesh>

          {look.hat === 'peci' && (
            <mesh position={[0, 0.3, 0]} material={mat(C.black)} castShadow>
              <cylinderGeometry args={[0.25, 0.27, 0.2, 10]} />
            </mesh>
          )}
          {look.hat === 'caping' && (
            <mesh position={[0, 0.34, 0]} material={mat(look.hatColor ?? '#e3c27a')} castShadow>
              <coneGeometry args={[0.62, 0.36, 12]} />
            </mesh>
          )}
          {look.hat === 'hijab' && (
            <>
              <mesh position={[0, 0.06, -0.03]} material={mat(look.hatColor ?? '#7c3aed')} castShadow>
                <boxGeometry args={[0.52, 0.56, 0.5]} />
              </mesh>
              <mesh position={[0, -0.32, 0]} material={mat(look.hatColor ?? '#7c3aed')} castShadow>
                <cylinderGeometry args={[0.28, 0.4, 0.26, 8]} />
              </mesh>
            </>
          )}
        </group>
      </group>
    </group>
  );
}

/** Walk cycle / idle sway shared by the player and villagers. */
export function animateLimbs(limbs: THREE.Object3D[], phase: number, moving: boolean, t: number, offset = 0) {
  const [legL, legR, armL, armR, head] = limbs;
  if (!legL || !legR || !armL || !armR) return;
  const swing = moving ? Math.sin(phase) * 0.7 : 0;
  legL.rotation.x = THREE.MathUtils.lerp(legL.rotation.x, swing, 0.4);
  legR.rotation.x = THREE.MathUtils.lerp(legR.rotation.x, -swing, 0.4);
  armL.rotation.x = THREE.MathUtils.lerp(armL.rotation.x, -swing * 0.8, 0.4);
  armR.rotation.x = THREE.MathUtils.lerp(armR.rotation.x, swing * 0.8, 0.4);
  if (head) head.rotation.y = moving ? 0 : Math.sin(t * 0.5 + offset) * 0.35;
}
