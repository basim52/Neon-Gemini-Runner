/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { BossType } from '../../types';

export const BossEncounter: React.FC = () => {
  const bossState = useStore(state => state.bossState);
  const isWarpActive = useStore(state => state.isWarpActive);
  const bossRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const [hitFlash, setHitFlash] = useState(false);

  // Listen to boss damaged events for hit flash
  React.useEffect(() => {
    const onDamaged = () => {
      setHitFlash(true);
      setTimeout(() => setHitFlash(false), 120);
    };
    window.addEventListener('boss-hit', onDamaged);
    return () => window.removeEventListener('boss-hit', onDamaged);
  }, []);

  useFrame((state) => {
    if (!bossState || !bossState.active) return;
    const time = state.clock.elapsedTime;

    if (bossRef.current) {
      // Floating sinusoidal motion
      bossRef.current.position.y = 5.5 + Math.sin(time * 2.5) * 0.8;
      bossRef.current.position.x = Math.sin(time * 1.2) * 4;
      bossRef.current.position.z = -42 + Math.cos(time * 0.8) * 3;
    }

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = time * 1.5;
      ring1Ref.current.rotation.y = time * 2.0;
    }

    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = -time * 1.8;
      ring2Ref.current.rotation.z = time * 1.2;
    }

    if (coreRef.current) {
      coreRef.current.rotation.y = time * 3.0;
      const scale = 1 + Math.sin(time * 6) * 0.08;
      coreRef.current.scale.set(scale, scale, scale);
    }
  });

  if (!bossState || !bossState.active) {
    return null;
  }

  const healthPct = Math.max(0, Math.min(1, bossState.health / bossState.maxHealth));
  const mainColor = hitFlash ? '#ffffff' : bossState.color;
  const accentColor = hitFlash ? '#ffff00' : bossState.accentColor;

  return (
    <group ref={bossRef} position={[0, 6, -42]}>
      {/* 3D FLOATING HEALTH BAR */}
      <group position={[0, 6.5, 0]}>
        {/* Bar Background Frame */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[9.2, 0.9]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.8} />
        </mesh>
        
        {/* Bar Border */}
        <mesh position={[0, 0, 0.01]}>
          <planeGeometry args={[9.0, 0.7]} />
          <meshBasicMaterial color="#333344" />
        </mesh>

        {/* Dynamic Health Fill */}
        <mesh 
          position={[-4.4 + (healthPct * 8.8) / 2, 0, 0.02]} 
          scale={[Math.max(0.01, healthPct), 1, 1]}
        >
          <planeGeometry args={[8.8, 0.5]} />
          <meshBasicMaterial color={healthPct > 0.3 ? bossState.color : '#ff0044'} />
        </mesh>

        {/* Warning Skull / Boss Icon Plate */}
        <mesh position={[-4.7, 0, 0.05]}>
          <circleGeometry args={[0.6, 16]} />
          <meshBasicMaterial color={bossState.accentColor} />
        </mesh>
      </group>

      {/* BOSS 1: CYBER TITAN CORE */}
      {bossState.type === BossType.CYBER_TITAN_CORE && (
        <group>
          {/* Central Pulsing Energy Core */}
          <mesh ref={coreRef} castShadow>
            <octahedronGeometry args={[2.5, 0]} />
            <meshStandardMaterial 
              color={mainColor} 
              emissive={mainColor} 
              emissiveIntensity={hitFlash ? 4 : 2} 
              roughness={0.1}
              metalness={0.9}
            />
          </mesh>

          {/* Outer Orbital Gyro Ring 1 */}
          <mesh ref={ring1Ref}>
            <torusGeometry args={[4.2, 0.25, 16, 32]} />
            <meshStandardMaterial 
              color={accentColor} 
              emissive={accentColor} 
              emissiveIntensity={1.8} 
              roughness={0.2} 
            />
          </mesh>

          {/* Outer Orbital Gyro Ring 2 */}
          <mesh ref={ring2Ref}>
            <torusGeometry args={[5.2, 0.2, 16, 32]} />
            <meshStandardMaterial 
              color={mainColor} 
              emissive={mainColor} 
              emissiveIntensity={1.5} 
              wireframe
            />
          </mesh>

          {/* 4 Orbital Plasma Defense Cannons */}
          {[0, 1, 2, 3].map((i) => {
            const angle = (i * Math.PI) / 2;
            const x = Math.cos(angle) * 3.8;
            const y = Math.sin(angle) * 3.8;
            return (
              <group key={i} position={[x, y, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[0.8, 0.8, 2.5]} />
                  <meshStandardMaterial color="#0a0a14" metalness={0.9} roughness={0.2} />
                </mesh>
                <mesh position={[0, 0, 1.4]}>
                  <sphereGeometry args={[0.4, 16, 16]} />
                  <meshBasicMaterial color={accentColor} />
                </mesh>
              </group>
            );
          })}
        </group>
      )}

      {/* BOSS 2: PLASMA DRAGON MK-X */}
      {bossState.type === BossType.PLASMA_DRAGON && (
        <group>
          {/* Dragon Head Core */}
          <mesh ref={coreRef} castShadow rotation={[0.2, 0, 0]}>
            <coneGeometry args={[2.6, 5.0, 6]} />
            <meshStandardMaterial 
              color="#220000" 
              emissive={mainColor} 
              emissiveIntensity={hitFlash ? 4 : 2}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>

          {/* Cyber Horns */}
          <mesh position={[-1.6, 2.2, -1.0]} rotation={[-0.4, -0.3, -0.4]}>
            <coneGeometry args={[0.6, 3.2, 5]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={2} />
          </mesh>
          <mesh position={[1.6, 2.2, -1.0]} rotation={[-0.4, 0.3, 0.4]}>
            <coneGeometry args={[0.6, 3.2, 5]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={2} />
          </mesh>

          {/* Dragon Eyes */}
          <mesh position={[-0.9, 0.8, 1.6]}>
            <sphereGeometry args={[0.35, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.9, 0.8, 1.6]}>
            <sphereGeometry args={[0.35, 16, 16]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>

          {/* Plasma Breath Core Ring */}
          <mesh ref={ring1Ref} position={[0, -2.2, 1.0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.0, 0.3, 16, 32]} />
            <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={2.5} />
          </mesh>
        </group>
      )}

      {/* BOSS 3: QUANTUM OVERLORD */}
      {bossState.type === BossType.QUANTUM_OVERLORD && (
        <group>
          {/* Reality Hyper-Prism */}
          <mesh ref={coreRef} castShadow>
            <dodecahedronGeometry args={[2.8, 0]} />
            <meshStandardMaterial 
              color="#0d001a" 
              emissive={mainColor} 
              emissiveIntensity={hitFlash ? 4 : 2.5}
              roughness={0.1}
              metalness={0.95}
              wireframe
            />
          </mesh>

          {/* Nested Quantum Icosahedron */}
          <mesh position={[0, 0, 0]}>
            <icosahedronGeometry args={[1.6, 0]} />
            <meshStandardMaterial 
              color={accentColor} 
              emissive={accentColor} 
              emissiveIntensity={2.0} 
            />
          </mesh>

          {/* Multi-tier Quantum Event Horizon Rings */}
          <mesh ref={ring1Ref}>
            <torusGeometry args={[4.8, 0.2, 16, 32]} />
            <meshBasicMaterial color={mainColor} wireframe />
          </mesh>
          <mesh ref={ring2Ref} rotation={[Math.PI / 4, Math.PI / 3, 0]}>
            <torusGeometry args={[6.0, 0.2, 16, 32]} />
            <meshBasicMaterial color={accentColor} />
          </mesh>
        </group>
      )}

      {/* Boss Ambient Lighting Glow */}
      <pointLight 
        position={[0, 0, 2]} 
        color={bossState.color} 
        intensity={hitFlash ? 8 : 4} 
        distance={25} 
      />
    </group>
  );
};
