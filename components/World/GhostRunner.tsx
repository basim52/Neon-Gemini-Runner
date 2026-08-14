/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { GameStatus } from '../../types';

export const GhostRunner: React.FC = () => {
  const bestGhostFrames = useStore(state => state.bestGhostFrames);
  const status = useStore(state => state.status);
  const distance = useStore(state => state.distance);
  const isPlaying = status === GameStatus.PLAYING;

  const ghostGroupRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!isPlaying || !bestGhostFrames || bestGhostFrames.length === 0 || !ghostGroupRef.current) {
      return;
    }

    // Find closest ghost frame based on distance / speed index
    const frameIndex = Math.min(
      Math.floor((distance / 2)), 
      bestGhostFrames.length - 1
    );

    const frame = bestGhostFrames[frameIndex];
    if (frame) {
      // Smooth interpolation to ghost frame position
      ghostGroupRef.current.position.x = THREE.MathUtils.lerp(ghostGroupRef.current.position.x, frame.x, 0.15);
      ghostGroupRef.current.position.y = THREE.MathUtils.lerp(ghostGroupRef.current.position.y, frame.y, 0.15);
      ghostGroupRef.current.position.z = THREE.MathUtils.lerp(ghostGroupRef.current.position.z, frame.z, 0.15);

      // Running animation for ghost limbs
      const runCycle = Math.sin(state.clock.elapsedTime * 14);
      if (leftArmRef.current) leftArmRef.current.rotation.x = runCycle * 0.8;
      if (rightArmRef.current) rightArmRef.current.rotation.x = -runCycle * 0.8;
      if (leftLegRef.current) leftLegRef.current.rotation.x = -runCycle * 0.9;
      if (rightLegRef.current) rightLegRef.current.rotation.x = runCycle * 0.9;
    }
  });

  if (!isPlaying || !bestGhostFrames || bestGhostFrames.length < 5) {
    return null;
  }

  return (
    <group ref={ghostGroupRef} position={[0, 0, 0]}>
      {/* Holographic Aura Light */}
      <pointLight color="#00ffff" intensity={1.5} distance={6} />

      {/* Head */}
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.5} />
      </mesh>

      {/* Torso */}
      <mesh ref={torsoRef} position={[0, 1.05, 0]}>
        <boxGeometry args={[0.9, 0.95, 0.55]} />
        <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.6} />
      </mesh>

      {/* Left Arm */}
      <mesh ref={leftArmRef} position={[-0.65, 1.0, 0]}>
        <boxGeometry args={[0.35, 0.9, 0.35]} />
        <meshBasicMaterial color="#00ffcc" wireframe transparent opacity={0.4} />
      </mesh>

      {/* Right Arm */}
      <mesh ref={rightArmRef} position={[0.65, 1.0, 0]}>
        <boxGeometry args={[0.35, 0.9, 0.35]} />
        <meshBasicMaterial color="#00ffcc" wireframe transparent opacity={0.4} />
      </mesh>

      {/* Left Leg */}
      <mesh ref={leftLegRef} position={[-0.25, 0.35, 0]}>
        <boxGeometry args={[0.4, 0.85, 0.4]} />
        <meshBasicMaterial color="#00d3ff" wireframe transparent opacity={0.5} />
      </mesh>

      {/* Right Leg */}
      <mesh ref={rightLegRef} position={[0.25, 0.35, 0]}>
        <boxGeometry args={[0.4, 0.85, 0.4]} />
        <meshBasicMaterial color="#00d3ff" wireframe transparent opacity={0.5} />
      </mesh>

      {/* Ghost Tag */}
      <mesh position={[0, 2.5, 0]}>
        <planeGeometry args={[1.5, 0.35]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.7} />
      </mesh>
    </group>
  );
};
