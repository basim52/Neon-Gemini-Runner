/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { LANE_WIDTH, getLevelTheme, LevelTheme, GraphicsQuality, GameStatus, LEVEL_THEMES } from '../../types';
import { DynamicWeather } from './DynamicWeather';
import { BossEncounter } from './BossEncounter';
import { GhostRunner } from './GhostRunner';

const StarField: React.FC<{ theme: LevelTheme }> = ({ theme }) => {
  const speed = useStore(state => state.speed);
  const graphicsQuality = useStore(state => state.graphicsQuality);
  
  const count = graphicsQuality === GraphicsQuality.HIGH ? 2000 : graphicsQuality === GraphicsQuality.MEDIUM ? 1000 : 350;
  const meshRef = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      let x = (Math.random() - 0.5) * 400;
      let y = (Math.random() - 0.5) * 200 + 50;
      let z = -550 + Math.random() * 650;

      if (Math.abs(x) < 15 && y > -5 && y < 20) {
          if (x < 0) x -= 15;
          else x += 15;
      }

      pos[i * 3] = x;     
      pos[i * 3 + 1] = y; 
      pos[i * 3 + 2] = z; 
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const positions = meshRef.current.geometry.attributes.position.array as Float32Array;
    const activeSpeed = speed > 0 ? speed : 2;

    for (let i = 0; i < count; i++) {
        let z = positions[i * 3 + 2];
        z += activeSpeed * delta * 2.0;
        
        if (z > 100) {
            z = -550 - Math.random() * 50; 
            let x = (Math.random() - 0.5) * 400;
            let y = (Math.random() - 0.5) * 200 + 50;
            
            if (Math.abs(x) < 15 && y > -5 && y < 20) {
                if (x < 0) x -= 15;
                else x += 15;
            }

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
        }
        positions[i * 3 + 2] = z;
    }
    meshRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.6}
        color={theme.directionalColor}
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

const LaneGuides: React.FC<{ theme: LevelTheme }> = ({ theme }) => {
    const { laneCount } = useStore();
    const lightStripsRef = useRef<THREE.Group>(null);
    
    const separators = useMemo(() => {
        const lines: number[] = [];
        const startX = -(laneCount * LANE_WIDTH) / 2;
        
        for (let i = 0; i <= laneCount; i++) {
            lines.push(startX + (i * LANE_WIDTH));
        }
        return lines;
    }, [laneCount]);

    const totalWidth = laneCount * LANE_WIDTH;

    useFrame((state) => {
        if (lightStripsRef.current) {
            const pulse = 0.6 + Math.sin(state.clock.elapsedTime * 6) * 0.4;
            lightStripsRef.current.children.forEach((child) => {
                const mesh = child as THREE.Mesh;
                if (mesh.material) {
                    (mesh.material as THREE.MeshBasicMaterial).opacity = 0.7 * pulse;
                }
            });
        }
    });

    return (
        <group position={[0, 0.02, 0]}>
            {/* Lane Floor */}
            <mesh position={[0, -0.02, -20]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[totalWidth, 220]} />
                <meshStandardMaterial 
                    color={theme.floorColor} 
                    roughness={0.2}
                    metalness={0.8}
                />
            </mesh>

            {/* Outer Glowing Neon Borders */}
            <group ref={lightStripsRef}>
                <mesh position={[-totalWidth / 2 - 0.1, 0.03, -20]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.2, 220]} />
                    <meshBasicMaterial color={theme.directionalColor} transparent opacity={0.85} />
                </mesh>
                <mesh position={[totalWidth / 2 + 0.1, 0.03, -20]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.2, 220]} />
                    <meshBasicMaterial color={theme.directionalColor} transparent opacity={0.85} />
                </mesh>
            </group>

            {/* Lane Separators */}
            {separators.map((x, i) => (
                <mesh key={`sep-${i}`} position={[x, 0, -20]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.07, 220]} /> 
                    <meshBasicMaterial 
                        color={theme.laneColor} 
                        transparent 
                        opacity={0.6} 
                    />
                </mesh>
            ))}
        </group>
    );
};

const RetroSun: React.FC<{ theme: LevelTheme }> = ({ theme }) => {
    const matRef = useRef<THREE.ShaderMaterial>(null);
    const sunGroupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (matRef.current) {
            matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
            matRef.current.uniforms.uColorTop.value.set(theme.sunTopColor);
            matRef.current.uniforms.uColorBottom.value.set(theme.sunBottomColor);
        }
        if (sunGroupRef.current) {
            sunGroupRef.current.position.y = 30 + Math.sin(state.clock.elapsedTime * 0.2) * 1.0;
            sunGroupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
        }
    });

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uColorTop: { value: new THREE.Color(theme.sunTopColor) },
        uColorBottom: { value: new THREE.Color(theme.sunBottomColor) }
    }), [theme]);

    return (
        <group ref={sunGroupRef} position={[0, 30, -180]}>
            <mesh>
                <sphereGeometry args={[35, 32, 32]} />
                <shaderMaterial
                    ref={matRef}
                    uniforms={uniforms}
                    transparent
                    vertexShader={`
                        varying vec2 vUv;
                        void main() {
                            vUv = uv;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `}
                    fragmentShader={`
                        varying vec2 vUv;
                        uniform float uTime;
                        uniform vec3 uColorTop;
                        uniform vec3 uColorBottom;

                        void main() {
                            vec3 color = mix(uColorBottom, uColorTop, vUv.y);
                            float stripeFreq = 40.0;
                            float stripeSpeed = 1.0;
                            float stripes = sin((vUv.y * stripeFreq) - (uTime * stripeSpeed));
                            float stripeMask = smoothstep(0.2, 0.3, stripes);
                            float scanlineFade = smoothstep(0.7, 0.3, vUv.y); 
                            vec3 finalColor = mix(color, color * 0.1, (1.0 - stripeMask) * scanlineFade);
                            gl_FragColor = vec4(finalColor, 1.0);
                        }
                    `}
                />
            </mesh>
        </group>
    );
};

const MovingGrid: React.FC<{ theme: LevelTheme }> = ({ theme }) => {
    const speed = useStore(state => state.speed);
    const meshRef = useRef<THREE.Mesh>(null);
    const offsetRef = useRef(0);
    
    useFrame((state, delta) => {
        if (meshRef.current) {
             const activeSpeed = speed > 0 ? speed : 5;
             offsetRef.current += activeSpeed * delta;
             const cellSize = 10;
             const zPos = -100 + (offsetRef.current % cellSize);
             meshRef.current.position.z = zPos;
        }
    });

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, -100]}>
            <planeGeometry args={[300, 400, 30, 40]} />
            <meshBasicMaterial 
                color={theme.gridColor} 
                wireframe 
                transparent 
                opacity={0.25} 
            />
        </mesh>
    );
};

const SideScenery: React.FC<{ theme: LevelTheme }> = ({ theme }) => {
  const speed = useStore(state => state.speed);
  const count = 18;
  const groupRef = useRef<THREE.Group>(null);

  const sceneryItems = useMemo(() => {
    const items = [];
    for (let i = 0; i < count; i++) {
      const z = -320 + (i * (360 / count));
      const scaleY = 0.8 + Math.random() * 1.4;
      const variant = Math.floor(Math.random() * 3);
      items.push({ id: i, side: i % 2 === 0 ? -1 : 1, z, scaleY, variant });
    }
    return items;
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const activeSpeed = speed > 0 ? speed : 5;
    groupRef.current.children.forEach((child) => {
      child.position.z += activeSpeed * delta;
      if (child.position.z > 30) {
        child.position.z = -330 - Math.random() * 20;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {sceneryItems.map((item) => {
        const posX = item.side * (13 + item.variant * 3);
        return (
          <group key={item.id} position={[posX, 0, item.z]} scale={[1, item.scaleY, 1]}>
            {theme.sceneryType === 'CYBER_CITY' && (
              <group position={[0, 6, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[4, 12, 4]} />
                  <meshStandardMaterial color="#0a0520" roughness={0.3} metalness={0.8} />
                </mesh>
                {/* Glowing neon window strips */}
                <mesh position={[0, 0, 2.01]}>
                  <planeGeometry args={[2, 10]} />
                  <meshBasicMaterial color={theme.directionalColor} transparent opacity={0.7} />
                </mesh>
              </group>
            )}

            {theme.sceneryType === 'VOLCANIC_INFERNO' && (
              <group position={[0, 5, 0]}>
                <mesh castShadow>
                  <coneGeometry args={[5, 10, 5]} />
                  <meshStandardMaterial color="#1f0300" roughness={0.9} />
                </mesh>
                {/* Lava top cone */}
                <mesh position={[0, 3, 0]}>
                  <coneGeometry args={[2, 4, 5]} />
                  <meshBasicMaterial color="#ff3300" />
                </mesh>
              </group>
            )}

            {theme.sceneryType === 'MATRIX_JUNGLE' && (
              <group position={[0, 7, 0]}>
                <mesh castShadow>
                  <cylinderGeometry args={[1, 2.5, 14, 6]} />
                  <meshStandardMaterial color="#001a08" roughness={0.5} wireframe />
                </mesh>
                {/* Glowing Matrix Energy Core */}
                <mesh position={[0, 0, 0]}>
                  <cylinderGeometry args={[0.5, 0.5, 14, 6]} />
                  <meshBasicMaterial color="#00ff66" />
                </mesh>
              </group>
            )}

            {theme.sceneryType === 'COSMIC_VOID' && (
              <group position={[0, 5, 0]} rotation={[0.4, 0.5, 0.2]}>
                <mesh castShadow>
                  <dodecahedronGeometry args={[3.5, 0]} />
                  <meshStandardMaterial color="#1a0033" roughness={0.4} metalness={0.6} />
                </mesh>
                {/* Celestial Ring */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[5, 0.15, 16, 32]} />
                  <meshBasicMaterial color={theme.directionalColor} />
                </mesh>
              </group>
            )}

            {theme.sceneryType === 'FROST_REALM' && (
              <group position={[0, 6, 0]}>
                <mesh castShadow>
                  <octahedronGeometry args={[4, 0]} />
                  <meshStandardMaterial color="#002b47" roughness={0.1} metalness={0.9} />
                </mesh>
                {/* Frost Crystal Tip */}
                <mesh position={[0, 4, 0]}>
                  <octahedronGeometry args={[1.5, 0]} />
                  <meshBasicMaterial color="#00d3ff" />
                </mesh>
              </group>
            )}

            {theme.sceneryType === 'QUANTUM_VOID' && (
              <group position={[0, 6, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[3.5, 8, 3.5]} />
                  <meshStandardMaterial color="#1a0033" roughness={0.2} metalness={0.8} />
                </mesh>
                {/* Quantum Floating Polyhedron */}
                <mesh position={[0, 5, 0]} rotation={[0.5, 0.5, 0]}>
                  <icosahedronGeometry args={[2, 0]} />
                  <meshBasicMaterial color="#e000ff" wireframe />
                </mesh>
              </group>
            )}

            {theme.sceneryType === 'TITAN_REALM' && (
              <group position={[0, 7, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[3, 14, 3]} />
                  <meshStandardMaterial color="#3a2a00" roughness={0.7} metalness={0.5} />
                </mesh>
                {/* Golden Rune Crown */}
                <mesh position={[0, 7.5, 0]}>
                  <cylinderGeometry args={[2, 1.5, 1, 8]} />
                  <meshBasicMaterial color="#ffd700" />
                </mesh>
              </group>
            )}

            {theme.sceneryType === 'ULTIMATE_PEAK' && (
              <group position={[0, 8, 0]}>
                <mesh castShadow>
                  <coneGeometry args={[2.5, 16, 6]} />
                  <meshStandardMaterial color="#0f002b" roughness={0.1} metalness={0.9} />
                </mesh>
                {/* Radiant Rainbow Prism Ring */}
                <mesh position={[0, 2, 0]} rotation={[Math.PI / 3, 0, 0]}>
                  <torusGeometry args={[4, 0.2, 16, 32]} />
                  <meshBasicMaterial color={theme.directionalColor} />
                </mesh>
              </group>
            )}

            {theme.sceneryType === 'SOLAR_DESERT' && (
              <group position={[0, 6, 0]}>
                {/* Golden Cyber Pyramid */}
                <mesh castShadow rotation={[0, Math.PI / 4, 0]}>
                  <coneGeometry args={[3.8, 12, 4]} />
                  <meshStandardMaterial color="#3d2800" roughness={0.3} metalness={0.8} />
                </mesh>
                {/* Glowing Apex Crown */}
                <mesh position={[0, 6.2, 0]}>
                  <octahedronGeometry args={[1.2, 0]} />
                  <meshBasicMaterial color="#00ffaa" />
                </mesh>
                {/* Orbiting Solar Ring */}
                <mesh position={[0, 3, 0]} rotation={[Math.PI / 3, 0, 0]}>
                  <torusGeometry args={[4.5, 0.15, 16, 32]} />
                  <meshBasicMaterial color="#ffd700" />
                </mesh>
              </group>
            )}

            {theme.sceneryType === 'CYBER_ABYSS' && (
              <group position={[0, 7, 0]}>
                {/* Plasma Abyss Monolith */}
                <mesh castShadow>
                  <boxGeometry args={[2.8, 15, 2.8]} />
                  <meshStandardMaterial color="#120024" roughness={0.2} metalness={0.9} />
                </mesh>
                {/* Floating Spinning Plasma Ring */}
                <mesh position={[0, 4, 0]} rotation={[0.6, 0.8, 0]}>
                  <torusGeometry args={[4.2, 0.25, 16, 32]} />
                  <meshBasicMaterial color="#ff00ea" />
                </mesh>
                {/* Glowing Electric Core */}
                <mesh position={[0, 8, 0]}>
                  <sphereGeometry args={[1.5, 16, 16]} />
                  <meshBasicMaterial color="#39ff14" />
                </mesh>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
};

export const Environment: React.FC = () => {
  const level = useStore(state => state.level);
  const distance = useStore(state => state.distance);
  const status = useStore(state => state.status);
  const graphicsQuality = useStore(state => state.graphicsQuality);

  // Dynamically cycle through biomes every 350m based on distance traveled!
  const isPlaying = status === GameStatus.PLAYING;
  const distanceShift = isPlaying ? Math.floor(distance / 350) : 0;
  const effectiveLevel = ((level - 1 + distanceShift) % LEVEL_THEMES.length) + 1;
  const theme = getLevelTheme(effectiveLevel);

  const lastBiomeRef = useRef(effectiveLevel);
  useEffect(() => {
    if (isPlaying && lastBiomeRef.current !== effectiveLevel) {
      lastBiomeRef.current = effectiveLevel;
      window.dispatchEvent(new CustomEvent('biome-changed', {
        detail: { theme }
      }));
    }
  }, [effectiveLevel, isPlaying, theme]);

  const isHigh = graphicsQuality === GraphicsQuality.HIGH;
  const isLow = graphicsQuality === GraphicsQuality.LOW;

  return (
    <>
      <color attach="background" args={[theme.bgColor]} />
      <fog attach="fog" args={[theme.fogColor, isLow ? 25 : 35, isLow ? 120 : 170]} />
      
      <ambientLight intensity={isLow ? 0.6 : 0.45} color={theme.ambientColor} />
      
      {/* Dynamic Key Directional Light */}
      <directionalLight 
        position={[10, 30, -20]} 
        intensity={1.8} 
        color={theme.directionalColor} 
        castShadow={isHigh} 
      />
      
      {/* Rim Light for Cyber Backlighting */}
      {!isLow && (
        <directionalLight position={[-15, 10, 30]} intensity={1.2} color={theme.pointLightColor} />
      )}
      
      {/* Horizon Point Light */}
      <pointLight position={[0, 25, -160]} intensity={isLow ? 2.0 : 3.5} color={theme.pointLightColor} distance={250} decay={2} />
      
      {/* Player Runner Area Fill Light */}
      {!isLow && (
        <pointLight position={[0, 10, 0]} intensity={1.2} color={theme.laneColor} distance={30} decay={2} />
      )}
      
      <StarField theme={theme} />
      <MovingGrid theme={theme} />
      <LaneGuides theme={theme} />
      <SideScenery theme={theme} />
      <RetroSun theme={theme} />
      <DynamicWeather theme={theme} />
      <GhostRunner />
      <BossEncounter />
    </>
  );
};
