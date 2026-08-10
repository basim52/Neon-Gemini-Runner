/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React from 'react';
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { useStore } from '../../store';
import { GraphicsQuality } from '../../types';

export const Effects: React.FC = () => {
  const graphicsQuality = useStore((s) => s.graphicsQuality);

  // In Low quality mode, disable postprocessing entirely for peak 60FPS performance
  if (graphicsQuality === GraphicsQuality.LOW) {
    return null;
  }

  // Medium quality: lightweight single-pass bloom and vignette
  if (graphicsQuality === GraphicsQuality.MEDIUM) {
    return (
      <EffectComposer multisampling={0}>
        <Bloom 
          luminanceThreshold={0.65} 
          luminanceSmoothing={0.7}
          mipmapBlur 
          intensity={0.85} 
          radius={0.5}
        />
        <Vignette eskil={false} offset={0.12} darkness={0.4} />
      </EffectComposer>
    );
  }

  // High quality: full cyber neon visual suite
  return (
    <EffectComposer multisampling={4}>
      {/* High-quality vibrant neon bloom effect */}
      <Bloom 
        luminanceThreshold={0.55} 
        luminanceSmoothing={0.85}
        mipmapBlur 
        intensity={1.35} 
        radius={0.7}
        levels={8}
      />
      {/* Subtle chromatic aberration for cyber edge distortion */}
      <ChromaticAberration 
        offset={new THREE.Vector2(0.0012, 0.0012)} 
        radialModulation={true}
        modulationOffset={0.5}
      />
      {/* Subtle cinematic film noise */}
      <Noise opacity={0.035} blendFunction={BlendFunction.OVERLAY} />
      {/* Vignette for focusing player attention on center runway */}
      <Vignette eskil={false} offset={0.15} darkness={0.6} />
    </EffectComposer>
  );
};

