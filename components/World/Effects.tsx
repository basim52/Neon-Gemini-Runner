/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React from 'react';
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { useStore } from '../../store';
import { GraphicsQuality, GameStatus, RUN_SPEED_BASE } from '../../types';

export const Effects: React.FC = () => {
  const graphicsQuality = useStore((s) => s.graphicsQuality);
  const speed = useStore((s) => s.speed);
  const isFeverMode = useStore((s) => s.isFeverMode);
  const status = useStore((s) => s.status);

  // In Low quality mode, disable postprocessing entirely for peak performance
  if (graphicsQuality === GraphicsQuality.LOW) {
    return null;
  }

  // Calculate speed factor (0 = base speed or idle, 1 = max speed / fever mode)
  const isPlaying = status === GameStatus.PLAYING;
  const rawRatio = isPlaying ? Math.max(0, (speed - RUN_SPEED_BASE) / (RUN_SPEED_BASE * 1.8)) : 0;
  const speedRatio = Math.min(1.0, isFeverMode ? Math.max(0.7, rawRatio + 0.3) : rawRatio);

  // Dynamic parameters calculated from speed
  const chromAberrationOffset = 0.0012 + speedRatio * 0.0088; // Scales from 0.0012 to 0.010 for speed streak distortion
  const vignetteDarkness = 0.45 + speedRatio * 0.35; // Vignette tightens on high speeds
  const bloomIntensity = graphicsQuality === GraphicsQuality.HIGH 
    ? 1.35 + speedRatio * 0.75 
    : 0.85 + speedRatio * 0.45;

  // Medium quality: lightweight single-pass bloom, dynamic vignette & chromatic aberration
  if (graphicsQuality === GraphicsQuality.MEDIUM) {
    return (
      <EffectComposer multisampling={0}>
        <Bloom 
          luminanceThreshold={0.6} 
          luminanceSmoothing={0.7}
          mipmapBlur 
          intensity={bloomIntensity} 
          radius={0.5}
        />
        <ChromaticAberration 
          offset={new THREE.Vector2(chromAberrationOffset, chromAberrationOffset)} 
          radialModulation={true}
          modulationOffset={0.4}
        />
        <Vignette eskil={false} offset={0.12} darkness={vignetteDarkness} />
      </EffectComposer>
    );
  }

  // High quality: full cyber neon visual suite with high-speed dynamic motion blur parameters
  return (
    <EffectComposer multisampling={4}>
      {/* Dynamic vibrant neon bloom effect */}
      <Bloom 
        luminanceThreshold={0.5} 
        luminanceSmoothing={0.85}
        mipmapBlur 
        intensity={bloomIntensity} 
        radius={0.75}
        levels={8}
      />
      {/* Speed-dependent chromatic aberration for hyper-velocity motion blur edges */}
      <ChromaticAberration 
        offset={new THREE.Vector2(chromAberrationOffset, chromAberrationOffset * 1.2)} 
        radialModulation={true}
        modulationOffset={0.3}
      />
      {/* Subtle cinematic film noise */}
      <Noise opacity={0.035} blendFunction={BlendFunction.OVERLAY} />
      {/* Dynamic vignette for focusing vision into the speed tunnel */}
      <Vignette eskil={false} offset={0.15} darkness={vignetteDarkness} />
    </EffectComposer>
  );
};

