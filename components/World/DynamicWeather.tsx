/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { LevelTheme, GraphicsQuality, GameStatus } from '../../types';

export const DynamicWeather: React.FC<{ theme: LevelTheme }> = ({ theme }) => {
  const speed = useStore(state => state.speed);
  const status = useStore(state => state.status);
  const isWarpActive = useStore(state => state.isWarpActive);
  const graphicsQuality = useStore(state => state.graphicsQuality);

  const particlesRef = useRef<THREE.Points>(null);
  const warpTunnelRef = useRef<THREE.Group>(null);
  const isPlaying = status === GameStatus.PLAYING;

  const count = graphicsQuality === GraphicsQuality.HIGH ? 600 : graphicsQuality === GraphicsQuality.MEDIUM ? 300 : 120;

  // Generate initial particle coordinates and velocities
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = Math.random() * 30;
      pos[i * 3 + 2] = -120 + Math.random() * 140;

      // Velocities
      vel[i * 3] = (Math.random() - 0.5) * 2;
      vel[i * 3 + 1] = -4 - Math.random() * 8; // Falling down by default
      vel[i * 3 + 2] = 0;
    }
    return [pos, vel];
  }, [count]);

  useFrame((state, delta) => {
    if (!particlesRef.current) return;
    const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;
    const activeSpeed = speed > 0 ? speed : 4;

    const isMatrix = theme.sceneryType === 'MATRIX_JUNGLE';
    const isSolar = theme.sceneryType === 'SOLAR_DESERT' || theme.sceneryType === 'VOLCANIC_INFERNO';
    const isFrost = theme.sceneryType === 'FROST_REALM';

    for (let i = 0; i < count; i++) {
      // Y movement (Digital rain falls, embers float up, snow drifts)
      if (isSolar) {
        pos[i * 3 + 1] += (2 + Math.random() * 4) * delta;
        if (pos[i * 3 + 1] > 35) pos[i * 3 + 1] = 0;
      } else if (isFrost) {
        pos[i * 3 + 1] -= (3 + Math.sin(state.clock.elapsedTime + i) * 2) * delta;
        pos[i * 3] += Math.sin(state.clock.elapsedTime * 2 + i) * 2 * delta;
        if (pos[i * 3 + 1] < 0) pos[i * 3 + 1] = 30;
      } else {
        // Digital Rain or Standard Cyber Motes
        pos[i * 3 + 1] -= (isMatrix ? 18 : 6) * delta;
        if (pos[i * 3 + 1] < 0) pos[i * 3 + 1] = 32;
      }

      // Z movement toward player
      pos[i * 3 + 2] += (activeSpeed * 1.5) * delta;
      if (pos[i * 3 + 2] > 15) {
        pos[i * 3 + 2] = -120 - Math.random() * 20;
        pos[i * 3] = (Math.random() - 0.5) * 60;
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;

    // Warp Hyper Drive tunnel spinning animation
    if (warpTunnelRef.current && isWarpActive) {
      warpTunnelRef.current.rotation.z = state.clock.elapsedTime * 6;
    }
  });

  const weatherColor = useMemo(() => {
    switch (theme.sceneryType) {
      case 'MATRIX_JUNGLE': return '#00ff66';
      case 'SOLAR_DESERT': return '#ffd700';
      case 'VOLCANIC_INFERNO': return '#ff3300';
      case 'FROST_REALM': return '#00f7ff';
      case 'CYBER_ABYSS': return '#ff00ea';
      default: return theme.directionalColor;
    }
  }, [theme]);

  return (
    <group>
      {/* WEATHER / AMBIENT GLOW PARTICLES */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={theme.sceneryType === 'MATRIX_JUNGLE' ? 0.9 : 0.6}
          color={weatherColor}
          transparent
          opacity={0.85}
          sizeAttenuation
        />
      </points>

      {/* WARP HYPER-DIMENSION TUNNEL */}
      {isWarpActive && (
        <group ref={warpTunnelRef} position={[0, 5, -25]}>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} position={[0, 0, -i * 15]} rotation={[0, 0, (i * Math.PI) / 5]}>
              <torusGeometry args={[8 + i * 1.5, 0.25, 8, 24]} />
              <meshBasicMaterial 
                color={i % 2 === 0 ? '#00ffff' : '#ff00aa'} 
                wireframe 
                transparent 
                opacity={0.8} 
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};
