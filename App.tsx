/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Environment } from './components/World/Environment';
import { Player } from './components/World/Player';
import { LevelManager } from './components/World/LevelManager';
import { Effects } from './components/World/Effects';
import { HUD } from './components/UI/HUD';
import { SpeedBlurOverlay } from './components/UI/SpeedBlurOverlay';
import { useStore } from './store';
import { GraphicsQuality, GameStatus, RUN_SPEED_BASE } from './types';

// Dynamic Camera Controller with Speed FOV Motion Warp
const CameraController = () => {
  const { camera, size } = useThree();
  const laneCount = useStore((s) => s.laneCount);
  const speed = useStore((s) => s.speed);
  const isFeverMode = useStore((s) => s.isFeverMode);
  const status = useStore((s) => s.status);
  
  useFrame((state, delta) => {
    // Determine if screen is narrow (mobile portrait)
    const aspect = size.width / size.height;
    const isMobile = aspect < 1.2;

    const heightFactor = isMobile ? 2.0 : 0.5;
    const distFactor = isMobile ? 4.5 : 1.0;

    const extraLanes = Math.max(0, laneCount - 3);

    const targetY = 5.5 + (extraLanes * heightFactor);
    const targetZ = 8.0 + (extraLanes * distFactor);

    const targetPos = new THREE.Vector3(0, targetY, targetZ);
    
    // Smoothly interpolate camera position
    camera.position.lerp(targetPos, delta * 2.0);
    
    // Calculate speed factor for FOV warp (60° up to 80° at high speeds)
    const isPlaying = status === GameStatus.PLAYING;
    const rawRatio = isPlaying ? Math.max(0, (speed - RUN_SPEED_BASE) / (RUN_SPEED_BASE * 1.8)) : 0;
    const speedRatio = Math.min(1.0, isFeverMode ? Math.max(0.7, rawRatio + 0.3) : rawRatio);

    const perspectiveCam = camera as THREE.PerspectiveCamera;
    if (perspectiveCam.isPerspectiveCamera) {
      const targetFov = 60 + speedRatio * 20; // 60° base FOV -> 80° hyper-speed FOV
      perspectiveCam.fov = THREE.MathUtils.lerp(perspectiveCam.fov, targetFov, delta * 3.0);
      perspectiveCam.updateProjectionMatrix();
    }
    
    camera.lookAt(0, 0, -30); 
  });
  
  return null;
};

function Scene() {
  return (
    <>
        <Environment />
        <group>
            {/* Attach a userData to identify player group for LevelManager collision logic */}
            <group userData={{ isPlayer: true }} name="PlayerGroup">
                 <Player />
            </group>
            <LevelManager />
        </group>
        <Effects />
    </>
  );
}

function App() {
  const graphicsQuality = useStore((s) => s.graphicsQuality);

  const dpr: [number, number] | number = 
    graphicsQuality === GraphicsQuality.HIGH ? [1, 2] :
    graphicsQuality === GraphicsQuality.MEDIUM ? [1, 1.5] : 1;

  const isShadows = graphicsQuality === GraphicsQuality.HIGH;
  const isAntialias = graphicsQuality !== GraphicsQuality.LOW;

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden select-none">
      <HUD />
      <SpeedBlurOverlay />
      <Canvas
        shadows={isShadows}
        dpr={dpr} 
        gl={{ 
          antialias: isAntialias, 
          stencil: false, 
          depth: true, 
          powerPreference: graphicsQuality === GraphicsQuality.LOW ? "low-power" : "high-performance" 
        }}
        // Initial camera, matches the controller base
        camera={{ position: [0, 5.5, 8], fov: 60 }}
      >
        <CameraController />
        <Suspense fallback={null}>
            <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default App;
