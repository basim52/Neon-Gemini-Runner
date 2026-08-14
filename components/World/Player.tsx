/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store';
import { LANE_WIDTH, GameStatus, SKINS_DATA } from '../../types';
import { audio } from '../System/Audio';

// Physics Constants
const GRAVITY = 50;
const JUMP_FORCE = 16; 

// Roblox Character Geometries
const HEAD_GEO = new THREE.BoxGeometry(0.46, 0.46, 0.46);
const EYE_GEO = new THREE.BoxGeometry(0.06, 0.1, 0.02);
const MOUTH_GEO = new THREE.BoxGeometry(0.16, 0.03, 0.02);

// Hair Geometries for Roblox Spiky Hair
const HAIR_BASE_GEO = new THREE.BoxGeometry(0.48, 0.16, 0.48);
const HAIR_SPIKE_GEO = new THREE.ConeGeometry(0.08, 0.22, 4);

// Torso & Hoodie
const TORSO_GEO = new THREE.BoxGeometry(0.5, 0.65, 0.28);
const ZIPPER_GEO = new THREE.PlaneGeometry(0.02, 0.62);
const LOGO_TAG_GEO = new THREE.PlaneGeometry(0.12, 0.05);

// Jetpack & Thruster Geometries
const JETPACK_BODY_GEO = new THREE.BoxGeometry(0.32, 0.38, 0.16);
const JETPACK_NOZZLE_GEO = new THREE.CylinderGeometry(0.06, 0.08, 0.18, 12);
const THRUSTER_FLAME_GEO = new THREE.ConeGeometry(0.07, 0.45, 12);
const IMMORTAL_HALO_GEO = new THREE.TorusGeometry(0.4, 0.03, 16, 32);

// Limbs
const ARM_GEO = new THREE.BoxGeometry(0.2, 0.42, 0.2);
const HAND_GEO = new THREE.BoxGeometry(0.19, 0.18, 0.19);
const LEG_GEO = new THREE.BoxGeometry(0.2, 0.46, 0.2);
const SHOE_GEO = new THREE.BoxGeometry(0.22, 0.16, 0.28);
const SHOE_SOLE_GEO = new THREE.BoxGeometry(0.22, 0.04, 0.28);

// Extra Powerup Visuals
const SHADOW_GEO = new THREE.CircleGeometry(0.5, 32);
const MAGNET_AURA_GEO = new THREE.RingGeometry(1.2, 1.35, 32);
const SHIELD_DRONE_GEO = new THREE.IcosahedronGeometry(0.15, 1);

export const Player: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const droneRef = useRef<THREE.Group>(null);
  const magnetAuraRef = useRef<THREE.Mesh>(null);
  const thrusterFlame1Ref = useRef<THREE.Mesh>(null);
  const thrusterFlame2Ref = useRef<THREE.Mesh>(null);
  const immortalHaloRef = useRef<THREE.Mesh>(null);
  
  // Roblox Character Limb Refs for Animation
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);

  const { 
    status, 
    laneCount, 
    takeDamage, 
    hasDoubleJump, 
    activateImmortality, 
    isImmortalityActive,
    isMagnetActive,
    isShieldDroneActive,
    blasterAmmo,
    useBlasterAmmo,
    activeSkin,
    isUltimateActive,
    activateUltimate,
    ultimateMeter,
    recordGhostFrame,
    techUpgrades
  } = useStore();
  
  const [lane, setLane] = React.useState(0);
  const targetX = useRef(0);
  
  // Physics State
  const isJumping = useRef(false);
  const velocityY = useRef(0);
  const jumpsPerformed = useRef(0); 
  const spinRotation = useRef(0);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const isInvincible = useRef(false);
  const lastDamageTime = useRef(0);

  // Active Skin Colors
  const skinInfo = SKINS_DATA[activeSkin] || SKINS_DATA['ROBLOX_CLASSIC'];

  // Roblox Outfit Materials
  const { 
    skinMaterial, 
    jacketMaterial, 
    pantsMaterial, 
    hairMaterial, 
    shoeMaterial, 
    soleMaterial,
    faceDetailMaterial, 
    whiteDetailMaterial,
    shadowMaterial,
    jetpackMaterial,
    thrusterMaterial
  } = useMemo(() => {
      const isGolden = isImmortalityActive;
      const jacketColor = isGolden ? '#ffd700' : skinInfo.color;
      const glowColor = isGolden ? '#ffffff' : skinInfo.glowColor;
      const skinTone = isGolden ? '#ffe066' : skinInfo.skinTone;
      const hairColor = isGolden ? '#ffffff' : skinInfo.hairColor;
      const pantColor = isGolden ? '#332200' : skinInfo.pantColor;

      return {
          skinMaterial: new THREE.MeshStandardMaterial({ 
              color: skinTone, 
              roughness: 0.5, 
              metalness: isGolden ? 0.8 : 0.1,
              emissive: isGolden ? '#ffaa00' : '#000000',
              emissiveIntensity: isGolden ? 0.3 : 0
          }),
          jacketMaterial: new THREE.MeshStandardMaterial({ 
              color: jacketColor, 
              roughness: 0.3, 
              metalness: 0.3,
              emissive: glowColor,
              emissiveIntensity: isGolden ? 0.6 : 0.25
          }),
          pantsMaterial: new THREE.MeshStandardMaterial({ color: pantColor, roughness: 0.6, metalness: 0.1 }),
          hairMaterial: new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.7, metalness: 0.2 }),
          shoeMaterial: new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3, metalness: 0.1 }),
          soleMaterial: new THREE.MeshStandardMaterial({ color: '#222222', roughness: 0.8 }),
          faceDetailMaterial: new THREE.MeshBasicMaterial({ color: '#111111' }),
          whiteDetailMaterial: new THREE.MeshStandardMaterial({ color: glowColor, emissive: glowColor, emissiveIntensity: 0.8 }),
          shadowMaterial: new THREE.MeshBasicMaterial({ color: '#000000', opacity: 0.35, transparent: true }),
          jetpackMaterial: new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.2, metalness: 0.8 }),
          thrusterMaterial: new THREE.MeshBasicMaterial({ color: isGolden ? '#ffee00' : glowColor, transparent: true, opacity: 0.9 })
      };
  }, [isImmortalityActive, skinInfo]);

  // Reset State on Game Start
  useEffect(() => {
      if (status === GameStatus.PLAYING) {
          isJumping.current = false;
          jumpsPerformed.current = 0;
          velocityY.current = 0;
          spinRotation.current = 0;
          if (groupRef.current) groupRef.current.position.y = 0;
          if (bodyRef.current) bodyRef.current.rotation.x = 0;
      }
  }, [status]);
  
  // Safety: Clamp lane if laneCount changes
  useEffect(() => {
      const maxLane = Math.floor(laneCount / 2);
      if (Math.abs(lane) > maxLane) {
          setLane(l => Math.max(Math.min(l, maxLane), -maxLane));
      }
  }, [laneCount, lane]);

  // Trigger jump function
  const triggerJump = (forceMultiplier = 1.0) => {
    const maxJumps = hasDoubleJump ? 2 : 1;

    if (!isJumping.current) {
        audio.playJump(false);
        isJumping.current = true;
        jumpsPerformed.current = 1;
        velocityY.current = JUMP_FORCE * forceMultiplier;
    } else if (jumpsPerformed.current < maxJumps) {
        audio.playJump(true);
        jumpsPerformed.current += 1;
        velocityY.current = JUMP_FORCE * forceMultiplier;
        spinRotation.current = 0;
    }
  };

  // Trigger Laser Blaster
  const triggerBlaster = () => {
    if (blasterAmmo > 0) {
      if (useBlasterAmmo()) {
        audio.playLaserShot();
        const currentX = groupRef.current ? groupRef.current.position.x : 0;
        const currentY = groupRef.current ? groupRef.current.position.y + 1.2 : 1.2;
        window.dispatchEvent(new CustomEvent('fire-laser-shot', {
          detail: { x: currentX, y: currentY, lane }
        }));
      }
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== GameStatus.PLAYING) return;
      const maxLane = Math.floor(laneCount / 2);

      if (e.key === 'ArrowLeft' || e.key === 'a') setLane(l => Math.max(l - 1, -maxLane));
      else if (e.key === 'ArrowRight' || e.key === 'd') setLane(l => Math.min(l + 1, maxLane));
      else if (e.key === 'ArrowUp' || e.key === 'w') triggerJump();
      else if (e.key === ' ' || e.key === 'Enter') {
          activateImmortality();
      } else if (e.key === 'f' || e.key === 'c' || e.key === 'x') {
          triggerBlaster();
      } else if (e.key === 'q' || e.key === 'e' || e.key === 'r') {
          activateUltimate();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, laneCount, hasDoubleJump, activateImmortality, blasterAmmo]);

  // Touch controls
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
        if (status !== GameStatus.PLAYING) return;
        const deltaX = e.changedTouches[0].clientX - touchStartX.current;
        const deltaY = e.changedTouches[0].clientY - touchStartY.current;
        const maxLane = Math.floor(laneCount / 2);

        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
             if (deltaX > 0) setLane(l => Math.min(l + 1, maxLane));
             else setLane(l => Math.max(l - 1, -maxLane));
        } else if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY < -30) {
            triggerJump();
        } else if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
            if (blasterAmmo > 0) {
              triggerBlaster();
            } else {
              activateImmortality();
            }
        }
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
        window.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [status, laneCount, hasDoubleJump, activateImmortality, blasterAmmo]);

  // Listen for Boost Pad auto-bounce
  useEffect(() => {
    const handleBoost = () => {
      audio.playBoost();
      isJumping.current = true;
      jumpsPerformed.current = 1;
      velocityY.current = JUMP_FORCE * 1.4; 
    };
    window.addEventListener('player-boost', handleBoost);
    return () => window.removeEventListener('player-boost', handleBoost);
  }, []);

  // Animation Loop (Roblox Running Gait)
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    if (status !== GameStatus.PLAYING && status !== GameStatus.SHOP) return;

    // 1. Horizontal Position
    targetX.current = lane * LANE_WIDTH;
    groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x, 
        targetX.current, 
        delta * 16 
    );

    // 2. Physics (Jump)
    if (isJumping.current) {
        groupRef.current.position.y += velocityY.current * delta;
        velocityY.current -= GRAVITY * delta;

        if (groupRef.current.position.y <= 0) {
            groupRef.current.position.y = 0;
            isJumping.current = false;
            jumpsPerformed.current = 0;
            velocityY.current = 0;
            if (bodyRef.current) bodyRef.current.rotation.x = 0;
        }

        if (jumpsPerformed.current === 2 && bodyRef.current) {
             spinRotation.current -= delta * 15;
             if (spinRotation.current < -Math.PI * 2) spinRotation.current = -Math.PI * 2;
             bodyRef.current.rotation.x = spinRotation.current;
        }
    }

    // Banking Rotation
    const xDiff = targetX.current - groupRef.current.position.x;
    groupRef.current.rotation.z = -xDiff * 0.15; 
    groupRef.current.rotation.x = isJumping.current ? 0.08 : 0.04; 

    // 3. Classic Roblox Running Animation (Bouncing head & opposing arm/leg swings)
    const runFrequency = 24;
    const time = state.clock.elapsedTime * runFrequency; 
    
    if (!isJumping.current) {
        // Arm swings
        if (leftArmRef.current) leftArmRef.current.rotation.x = Math.sin(time) * 0.85;
        if (rightArmRef.current) rightArmRef.current.rotation.x = Math.sin(time + Math.PI) * 0.85;
        // Leg swings
        if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(time + Math.PI) * 0.95;
        if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(time) * 0.95;
        
        // Head subtle bop & body running bounce
        if (bodyRef.current) bodyRef.current.position.y = 1.05 + Math.abs(Math.sin(time)) * 0.08;
        if (headRef.current) headRef.current.rotation.z = Math.sin(time * 0.5) * 0.03;
    } else {
        const jumpPoseSpeed = delta * 12;
        // Roblox Jump Pose (Arms raised high, legs slightly bent)
        if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -2.8, jumpPoseSpeed);
        if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -2.8, jumpPoseSpeed);
        if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0.4, jumpPoseSpeed);
        if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, -0.4, jumpPoseSpeed);
        
        if (bodyRef.current && jumpsPerformed.current !== 2) bodyRef.current.position.y = 1.05; 
    }

    // 4. Orbiting Shield Drone
    if (droneRef.current && isShieldDroneActive) {
      const droneTime = state.clock.elapsedTime * 4;
      droneRef.current.position.x = Math.sin(droneTime) * 1.2;
      droneRef.current.position.z = Math.cos(droneTime) * 1.2;
      droneRef.current.position.y = 1.4 + Math.sin(droneTime * 2) * 0.2;
      droneRef.current.rotation.y += delta * 5;
    }

    // 5. Magnet Aura Rotation
    if (magnetAuraRef.current && isMagnetActive) {
      magnetAuraRef.current.rotation.z += delta * 4;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.1;
      magnetAuraRef.current.scale.setScalar(pulse);
    }

    // 6. Cyber Thrusters & Jetpack Flame Pulse
    const flameFlicker = 0.8 + Math.random() * 0.4 + (isJumping.current ? 0.6 : 0);
    if (thrusterFlame1Ref.current) {
        thrusterFlame1Ref.current.scale.set(flameFlicker, flameFlicker * 1.3, flameFlicker);
    }
    if (thrusterFlame2Ref.current) {
        thrusterFlame2Ref.current.scale.set(flameFlicker, flameFlicker * 1.3, flameFlicker);
    }

    // 7. Immortal Halo Torus Rotation
    if (immortalHaloRef.current) {
        immortalHaloRef.current.rotation.x += delta * 3;
        immortalHaloRef.current.rotation.y += delta * 2;
    }

    // Dynamic Shadow
    if (shadowRef.current) {
        const height = groupRef.current.position.y;
        const scale = Math.max(0.2, 1 - (height / 2.5) * 0.5);
        const runStretch = isJumping.current ? 1 : 1 + Math.abs(Math.sin(time)) * 0.3;

        shadowRef.current.scale.set(scale, scale, scale * runStretch);
        const material = shadowRef.current.material as THREE.MeshBasicMaterial;
        if (material && !Array.isArray(material)) {
            material.opacity = Math.max(0.1, 0.35 - (height / 2.5) * 0.2);
        }
    }

    // Invincibility / Immortality Effect
    const showFlicker = isInvincible.current || isImmortalityActive;
    if (showFlicker) {
        if (isInvincible.current) {
             if (Date.now() - lastDamageTime.current > 2200) {
                isInvincible.current = false;
                groupRef.current.visible = true;
             } else {
                groupRef.current.visible = Math.floor(Date.now() / 50) % 2 === 0;
             }
        } 
        if (isImmortalityActive) {
            groupRef.current.visible = true; 
        }
    } else {
        groupRef.current.visible = true;
    }
    // Ghost frame logging
    if (Math.random() < 0.25) {
      recordGhostFrame({
        x: groupRef.current.position.x,
        y: groupRef.current.position.y,
        z: groupRef.current.position.z
      });
    }
  });

  // Damage Handler
  useEffect(() => {
     const checkHit = () => {
        if (isInvincible.current || isImmortalityActive) return;
        audio.playDamage();
        takeDamage();
        isInvincible.current = true;
        lastDamageTime.current = Date.now();
     };
     window.addEventListener('player-hit', checkHit);
     return () => window.removeEventListener('player-hit', checkHit);
  }, [takeDamage, isImmortalityActive]);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Magnet Aura Field */}
      {isMagnetActive && (
        <mesh ref={magnetAuraRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} geometry={MAGNET_AURA_GEO}>
          <meshBasicMaterial color="#00ffff" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Hero Ultimate Supercharged Field */}
      {isUltimateActive && (
        <group position={[0, 1.2, 0]}>
          <mesh>
            <sphereGeometry args={[1.5, 16, 16]} />
            <meshBasicMaterial color="#ffff00" wireframe transparent opacity={0.4} />
          </mesh>
          <mesh rotation={[Math.PI / 3, 0, 0]}>
            <torusGeometry args={[1.8, 0.06, 16, 32]} />
            <meshBasicMaterial color="#00ffff" />
          </mesh>
          <pointLight color="#ffff00" intensity={4} distance={8} />
        </group>
      )}

      {/* Orbiting Shield Drone */}
      {isShieldDroneActive && (
        <group ref={droneRef}>
          <mesh geometry={SHIELD_DRONE_GEO}>
            <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={2} />
          </mesh>
        </group>
      )}

      {/* Roblox Character Assembly */}
      <group ref={bodyRef} position={[0, 1.05, 0]}> 
        {/* Roblox Torso (Black Hoodie) */}
        <mesh castShadow position={[0, 0.32, 0]} geometry={TORSO_GEO} material={jacketMaterial} />
        
        {/* Zipper details & ROBLOX chest logo tag */}
        <mesh position={[0, 0.32, 0.142]} geometry={ZIPPER_GEO} material={whiteDetailMaterial} />
        <mesh position={[-0.12, 0.42, 0.142]} geometry={LOGO_TAG_GEO} material={whiteDetailMaterial} />

        {/* Cyber Jetpack & Twin Thrusters */}
        <group position={[0, 0.32, -0.2]}>
            {/* Jetpack Main Box */}
            <mesh geometry={JETPACK_BODY_GEO} material={jetpackMaterial} />
            {/* Left Nozzle & Flame */}
            <group position={[-0.1, -0.2, 0]}>
                <mesh geometry={JETPACK_NOZZLE_GEO} material={jetpackMaterial} />
                <mesh ref={thrusterFlame1Ref} position={[0, -0.22, 0]} rotation={[Math.PI, 0, 0]} geometry={THRUSTER_FLAME_GEO} material={thrusterMaterial} />
            </group>
            {/* Right Nozzle & Flame */}
            <group position={[0.1, -0.2, 0]}>
                <mesh geometry={JETPACK_NOZZLE_GEO} material={jetpackMaterial} />
                <mesh ref={thrusterFlame2Ref} position={[0, -0.22, 0]} rotation={[Math.PI, 0, 0]} geometry={THRUSTER_FLAME_GEO} material={thrusterMaterial} />
            </group>
        </group>

        {/* Rotating Energy Halo Ring (Active when Immortality is on) */}
        {isImmortalityActive && (
            <mesh ref={immortalHaloRef} position={[0, 0.32, 0]} geometry={IMMORTAL_HALO_GEO}>
                <meshBasicMaterial color="#ffee00" transparent opacity={0.85} side={THREE.DoubleSide} />
            </mesh>
        )}

        {/* Roblox Head */}
        <group ref={headRef} position={[0, 0.82, 0]}>
            {/* Blocky Head Box */}
            <mesh castShadow geometry={HEAD_GEO} material={skinMaterial} />
            
            {/* Facial Features (Eyes & Mouth) */}
            <mesh position={[-0.1, 0.04, 0.232]} geometry={EYE_GEO} material={faceDetailMaterial} />
            <mesh position={[0.1, 0.04, 0.232]} geometry={EYE_GEO} material={faceDetailMaterial} />
            <mesh position={[0, -0.09, 0.232]} geometry={MOUTH_GEO} material={faceDetailMaterial} />

            {/* Roblox Spiky Brown Hair */}
            <group position={[0, 0.18, 0]}>
                <mesh geometry={HAIR_BASE_GEO} material={hairMaterial} />
                {/* Spiky hair cones pointing up */}
                <mesh position={[0, 0.14, 0]} rotation={[0, 0, 0]} geometry={HAIR_SPIKE_GEO} material={hairMaterial} />
                <mesh position={[-0.1, 0.12, 0.08]} rotation={[-0.2, 0, -0.3]} geometry={HAIR_SPIKE_GEO} material={hairMaterial} />
                <mesh position={[0.1, 0.12, 0.08]} rotation={[-0.2, 0, 0.3]} geometry={HAIR_SPIKE_GEO} material={hairMaterial} />
                <mesh position={[0, 0.12, -0.1]} rotation={[0.3, 0, 0]} geometry={HAIR_SPIKE_GEO} material={hairMaterial} />
                <mesh position={[-0.12, 0.1, -0.05]} rotation={[0.2, 0, -0.4]} geometry={HAIR_SPIKE_GEO} material={hairMaterial} />
                <mesh position={[0.12, 0.1, -0.05]} rotation={[0.2, 0, 0.4]} geometry={HAIR_SPIKE_GEO} material={hairMaterial} />
            </group>
        </group>

        {/* Roblox Arms (Jacket sleeves + skin-toned hands) */}
        <group position={[0.36, 0.5, 0]}>
            <group ref={rightArmRef}>
                <mesh position={[0, -0.21, 0]} castShadow geometry={ARM_GEO} material={jacketMaterial} />
                <mesh position={[0, -0.48, 0]} castShadow geometry={HAND_GEO} material={skinMaterial} />
            </group>
        </group>
        <group position={[-0.36, 0.5, 0]}>
            <group ref={leftArmRef}>
                 <mesh position={[0, -0.21, 0]} castShadow geometry={ARM_GEO} material={jacketMaterial} />
                 <mesh position={[0, -0.48, 0]} castShadow geometry={HAND_GEO} material={skinMaterial} />
            </group>
        </group>

        {/* Roblox Legs (Black Pants + White Sneakers) */}
        <group position={[0.13, 0, 0]}>
            <group ref={rightLegRef}>
                 <mesh position={[0, -0.23, 0]} castShadow geometry={LEG_GEO} material={pantsMaterial} />
                 <mesh position={[0, -0.48, 0.04]} castShadow geometry={SHOE_GEO} material={shoeMaterial} />
                 <mesh position={[0, -0.55, 0.04]} geometry={SHOE_SOLE_GEO} material={soleMaterial} />
            </group>
        </group>
        <group position={[-0.13, 0, 0]}>
            <group ref={leftLegRef}>
                 <mesh position={[0, -0.23, 0]} castShadow geometry={LEG_GEO} material={pantsMaterial} />
                 <mesh position={[0, -0.48, 0.04]} castShadow geometry={SHOE_GEO} material={shoeMaterial} />
                 <mesh position={[0, -0.55, 0.04]} geometry={SHOE_SOLE_GEO} material={soleMaterial} />
            </group>
        </group>
      </group>
      
      <mesh ref={shadowRef} position={[0, 0.02, 0]} rotation={[-Math.PI/2, 0, 0]} geometry={SHADOW_GEO} material={shadowMaterial} />
    </group>
  );
};
