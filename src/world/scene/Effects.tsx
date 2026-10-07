import React from 'react';
import { EffectComposer, Bloom, Vignette, SMAA, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';

/**
 * High-quality tier only. Bloom makes emissive things (torches, lanterns, gold, moon) glow.
 * Rendering through the composer skips the renderer's own tone mapping, so it's re-applied here.
 */
export default function Effects({ night }: { night: boolean }) {
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={night ? 1.25 : 0.5} luminanceThreshold={night ? 0.55 : 0.9} luminanceSmoothing={0.25} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.3} darkness={night ? 0.65 : 0.45} />
      <SMAA />
    </EffectComposer>
  );
}
