/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text3D, Center } from '@react-three/drei';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from '../../store';
import { GameObject, ObjectType, LANE_WIDTH, SPAWN_DISTANCE, REMOVE_DISTANCE, GameStatus, GEMINI_COLORS, getLevelTheme, getLevelTargetWord, getLetterColor, GraphicsQuality, BossType } from '../../types';
import { audio } from '../System/Audio';

// Geometry Constants
const OBSTACLE_HEIGHT = 1.6;
const OBSTACLE_GEOMETRY = new THREE.ConeGeometry(0.9, OBSTACLE_HEIGHT, 6);
const OBSTACLE_GLOW_GEO = new THREE.ConeGeometry(0.9, OBSTACLE_HEIGHT, 6);
const OBSTACLE_RING_GEO = new THREE.RingGeometry(0.6, 0.9, 6);

// Level-Specific Obstacle Geometries
const LAVA_ROCK_GEO = new THREE.DodecahedronGeometry(0.95, 0);
const MATRIX_CUBE_GEO = new THREE.BoxGeometry(1.2, 1.8, 1.2);
const COSMIC_ASTEROID_GEO = new THREE.IcosahedronGeometry(0.95, 0);
const ICE_SPIRE_GEO = new THREE.ConeGeometry(0.8, 2.0, 5);
const QUANTUM_NODE_GEO = new THREE.OctahedronGeometry(0.95, 0);
const TITAN_PILLAR_GEO = new THREE.CylinderGeometry(0.7, 0.9, 2.2, 6);
const DIAMOND_PRISM_GEO = new THREE.OctahedronGeometry(1.1, 0);
const SOLAR_PYRAMID_GEO = new THREE.ConeGeometry(0.9, 1.8, 4);
const CYBER_ABYSS_CRYSTAL_GEO = new THREE.OctahedronGeometry(1.0, 0);
const ABYSS_RING_GEO = new THREE.TorusGeometry(1.3, 0.08, 16, 32);

const GEM_GEOMETRY = new THREE.IcosahedronGeometry(0.3, 0);

// Alien Geometries
const ALIEN_BODY_GEO = new THREE.CylinderGeometry(0.6, 0.3, 0.3, 8);
const ALIEN_DOME_GEO = new THREE.SphereGeometry(0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI/2);
const ALIEN_EYE_GEO = new THREE.SphereGeometry(0.1);

// Missile Geometries
const MISSILE_CORE_GEO = new THREE.CylinderGeometry(0.08, 0.08, 3.0, 8);
const MISSILE_RING_GEO = new THREE.TorusGeometry(0.15, 0.02, 16, 32);

// Laser Shot Geometries
const LASER_SHOT_GEO = new THREE.CylinderGeometry(0.06, 0.06, 4.0, 8);

// PowerUp Geometries
const MAGNET_GEO = new THREE.TorusGeometry(0.3, 0.1, 16, 32);
const BLASTER_BOX_GEO = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const BOOST_PAD_GEO = new THREE.PlaneGeometry(1.6, 2.0);
const SLIDING_BARRIER_GEO = new THREE.BoxGeometry(1.8, 1.2, 0.3);

// Shadow Geometries
const SHADOW_LETTER_GEO = new THREE.PlaneGeometry(2, 0.6);
const SHADOW_GEM_GEO = new THREE.CircleGeometry(0.6, 32);
const SHADOW_ALIEN_GEO = new THREE.CircleGeometry(0.8, 32);
const SHADOW_MISSILE_GEO = new THREE.PlaneGeometry(0.15, 3);
const SHADOW_DEFAULT_GEO = new THREE.CircleGeometry(0.8, 6);

// Shop Geometries
const SHOP_FRAME_GEO = new THREE.BoxGeometry(1, 7, 1);
const SHOP_BACK_GEO = new THREE.BoxGeometry(1, 5, 1.2);
const SHOP_OUTLINE_GEO = new THREE.BoxGeometry(1, 7.2, 0.8);
const SHOP_FLOOR_GEO = new THREE.PlaneGeometry(1, 4);

const PARTICLE_COUNT = 1200;
const BASE_LETTER_INTERVAL = 150; 

const getLetterInterval = (level: number) => {
    return BASE_LETTER_INTERVAL * Math.pow(1.5, Math.max(0, level - 1));
};

const MISSILE_SPEED = 30;
const LASER_SHOT_SPEED = 80;

const FONT_URL = "https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_bold.typeface.json";

// High-Performance Dynamic Particle System
const ParticleSystem: React.FC = () => {
    const graphicsQuality = useStore((s) => s.graphicsQuality);
    const mesh = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    
    const particles = useMemo(() => new Array(PARTICLE_COUNT).fill(0).map(() => ({
        life: 0,
        maxLife: 1.0,
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        rot: new THREE.Vector3(),
        rotVel: new THREE.Vector3(),
        color: new THREE.Color(),
        size: 0.3,
        pType: 'spark' // 'spark' | 'debris' | 'pickup' | 'boost'
    })), []);

    useEffect(() => {
        const handleExplosion = (e: CustomEvent) => {
            const { position, color, type = 'spark', count = 50 } = e.detail;
            let spawned = 0;
            const qualityMult = graphicsQuality === GraphicsQuality.LOW ? 0.25 : graphicsQuality === GraphicsQuality.MEDIUM ? 0.6 : 1.0;
            const burstAmount = Math.max(5, Math.floor(count * qualityMult)); 

            for(let i = 0; i < PARTICLE_COUNT; i++) {
                const p = particles[i];
                if (p.life <= 0) {
                    p.pType = type;
                    p.pos.set(position[0], position[1] ?? 0.5, position[2]);
                    
                    if (type === 'pickup') {
                        // Upward fountain starburst for gems and letters
                        p.life = 0.8 + Math.random() * 0.6;
                        p.maxLife = p.life;
                        const angle = Math.random() * Math.PI * 2;
                        const speed = 3 + Math.random() * 8;
                        p.vel.set(
                            Math.cos(angle) * speed,
                            4 + Math.random() * 8, // Upward launch
                            Math.sin(angle) * speed
                        );
                        p.size = 0.2 + Math.random() * 0.3;
                    } else if (type === 'boost') {
                        // Forward energy stream for boost pads
                        p.life = 0.6 + Math.random() * 0.4;
                        p.maxLife = p.life;
                        p.vel.set(
                            (Math.random() - 0.5) * 6,
                            2 + Math.random() * 6,
                            8 + Math.random() * 12 // Forward velocity
                        );
                        p.size = 0.3 + Math.random() * 0.3;
                    } else {
                        // Radial explosion debris
                        p.life = 1.0 + Math.random() * 0.6;
                        p.maxLife = p.life;
                        const theta = Math.random() * Math.PI * 2;
                        const phi = Math.acos(2 * Math.random() - 1);
                        const speed = 4 + Math.random() * 14;
                        p.vel.set(
                            Math.sin(phi) * Math.cos(theta),
                            Math.sin(phi) * Math.sin(theta),
                            Math.cos(phi)
                        ).multiplyScalar(speed);
                        p.size = 0.35 + Math.random() * 0.4;
                    }

                    p.rot.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                    p.rotVel.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
                    
                    // Boost color intensity for glowing post-processing bloom!
                    const col = new THREE.Color(color);
                    p.color.setRGB(col.r * 2.5, col.g * 2.5, col.b * 2.5);
                    
                    spawned++;
                    if (spawned >= burstAmount) break;
                }
            }
        };
        
        window.addEventListener('particle-burst', handleExplosion as any);
        return () => window.removeEventListener('particle-burst', handleExplosion as any);
    }, [particles]);

    useFrame((state, delta) => {
        if (!mesh.current) return;
        const safeDelta = Math.min(delta, 0.1);

        particles.forEach((p, i) => {
            if (p.life > 0) {
                p.life -= safeDelta * 1.6;
                p.pos.addScaledVector(p.vel, safeDelta);

                if (p.pType === 'pickup') {
                    p.vel.y -= safeDelta * 12; // Gravity
                    p.vel.multiplyScalar(0.95);
                } else if (p.pType === 'boost') {
                    p.vel.multiplyScalar(0.92);
                } else {
                    p.vel.y -= safeDelta * 16; // Heavy gravity for debris
                    p.vel.multiplyScalar(0.96);
                }

                p.rot.x += p.rotVel.x * safeDelta;
                p.rot.y += p.rotVel.y * safeDelta;
                
                dummy.position.copy(p.pos);
                
                // Smooth scale fade based on remaining life
                const lifeProgress = Math.max(0, p.life / p.maxLife);
                const scale = lifeProgress * p.size;
                dummy.scale.set(scale, scale, scale);
                
                dummy.rotation.set(p.rot.x, p.rot.y, p.rot.z);
                dummy.updateMatrix();
                
                mesh.current!.setMatrixAt(i, dummy.matrix);
                mesh.current!.setColorAt(i, p.color);
            } else {
                dummy.scale.set(0,0,0);
                dummy.updateMatrix();
                mesh.current!.setMatrixAt(i, dummy.matrix);
            }
        });
        
        mesh.current.instanceMatrix.needsUpdate = true;
        if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, PARTICLE_COUNT]}>
            <octahedronGeometry args={[0.5, 0]} />
            <meshBasicMaterial toneMapped={false} transparent opacity={0.95} />
        </instancedMesh>
    );
};

const getRandomLane = (laneCount: number) => {
    const max = Math.floor(laneCount / 2);
    return Math.floor(Math.random() * (max * 2 + 1)) - max;
};

export const LevelManager: React.FC = () => {
  const { 
    status, 
    speed, 
    collectGem, 
    collectLetter, 
    collectedLetters,
    laneCount,
    setDistance,
    openShop,
    level,
    isMagnetActive,
    bossState,
    triggerBossEncounter,
    damageBoss,
    defeatBoss,
    isUltimateActive
  } = useStore();
  
  const objectsRef = useRef<GameObject[]>([]);
  const [, setRenderTrigger] = useState(0);
  const prevStatus = useRef(status);
  const prevLevel = useRef(level);
  const lastBossAttackTime = useRef(0);

  const playerObjRef = useRef<THREE.Object3D | null>(null);
  const distanceTraveled = useRef(0);
  const nextLetterDistance = useRef(BASE_LETTER_INTERVAL);

  // Handle laser shot event from player
  useEffect(() => {
    const handleFireLaser = (e: any) => {
      const { x, y } = e.detail;
      objectsRef.current.push({
        id: uuidv4(),
        type: ObjectType.LASER_SHOT,
        position: [x, y, 0], // Spawn at player
        active: true,
        color: '#00ffff'
      });
      setRenderTrigger(t => t + 1);
    };

    window.addEventListener('fire-laser-shot', handleFireLaser);
    return () => window.removeEventListener('fire-laser-shot', handleFireLaser);
  }, []);

  // Handle resets and transitions
  useEffect(() => {
    const isRestart = status === GameStatus.PLAYING && prevStatus.current === GameStatus.GAME_OVER;
    const isMenuReset = status === GameStatus.MENU;
    const isLevelUp = level !== prevLevel.current && status === GameStatus.PLAYING;
    const isVictoryReset = status === GameStatus.PLAYING && prevStatus.current === GameStatus.VICTORY;

    if (isMenuReset || isRestart || isVictoryReset) {
        objectsRef.current = [];
        setRenderTrigger(t => t + 1);
        distanceTraveled.current = 0;
        nextLetterDistance.current = getLetterInterval(1);
    } else if (isLevelUp && level > 1) {
        objectsRef.current = objectsRef.current.filter(obj => obj.position[2] > -80);
        objectsRef.current.push({
            id: uuidv4(),
            type: ObjectType.SHOP_PORTAL,
            position: [0, 0, -100], 
            active: true,
        });
        nextLetterDistance.current = distanceTraveled.current - SPAWN_DISTANCE + getLetterInterval(level);
        
        // Trigger Boss Battle based on level!
        if (level === 2) {
          triggerBossEncounter(BossType.CYBER_TITAN_CORE);
        } else if (level === 4) {
          triggerBossEncounter(BossType.PLASMA_DRAGON);
        } else if (level === 6) {
          triggerBossEncounter(BossType.QUANTUM_OVERLORD);
        } else if (level % 2 === 0) {
          const bosses = [BossType.CYBER_TITAN_CORE, BossType.PLASMA_DRAGON, BossType.QUANTUM_OVERLORD];
          triggerBossEncounter(bosses[Math.floor(Math.random() * bosses.length)]);
        }

        setRenderTrigger(t => t + 1);
    } else if (status === GameStatus.GAME_OVER || status === GameStatus.VICTORY) {
        setDistance(Math.floor(distanceTraveled.current));
    }
    
    prevStatus.current = status;
    prevLevel.current = level;
  }, [status, level, setDistance, triggerBossEncounter]);

  useFrame((state) => {
      if (!playerObjRef.current) {
          const group = state.scene.getObjectByName('PlayerGroup');
          if (group && group.children.length > 0) {
              playerObjRef.current = group.children[0];
          }
      }
  });

  useFrame((state, delta) => {
    if (status !== GameStatus.PLAYING) return;

    const safeDelta = Math.min(delta, 0.05); 
    const dist = speed * safeDelta;
    
    distanceTraveled.current += dist;

    let hasChanges = false;
    let playerPos = new THREE.Vector3(0, 0, 0);
    
    if (playerObjRef.current) {
        playerObjRef.current.getWorldPosition(playerPos);
    }

    const currentObjects = objectsRef.current;
    const keptObjects: GameObject[] = [];
    const newSpawns: GameObject[] = [];

    // Filter active laser shots and active hazard targets for destruction logic
    const laserShots = currentObjects.filter(o => o.type === ObjectType.LASER_SHOT && o.active);

    for (const obj of currentObjects) {
        let moveAmount = dist;
        
        if (obj.type === ObjectType.MISSILE) {
            moveAmount += MISSILE_SPEED * safeDelta;
        } else if (obj.type === ObjectType.LASER_SHOT) {
            // Laser shoots forward (-Z)
            moveAmount = -LASER_SHOT_SPEED * safeDelta;
        }

        const prevZ = obj.position[2];
        obj.position[2] += moveAmount;

        // Sliding Barrier Horizontal Motion
        if (obj.type === ObjectType.SLIDING_BARRIER && obj.active) {
          const slideSpd = obj.slideSpeed || 3;
          const dir = obj.slideDirection || 1;
          const minX = obj.minX || -3;
          const maxX = obj.maxX || 3;
          obj.position[0] += slideSpd * dir * safeDelta;
          if (obj.position[0] > maxX) {
            obj.position[0] = maxX;
            obj.slideDirection = -1;
          } else if (obj.position[0] < minX) {
            obj.position[0] = minX;
            obj.slideDirection = 1;
          }
        }
        
        // Magnet Pull Effect
        if (isMagnetActive && obj.active && (obj.type === ObjectType.GEM || obj.type === ObjectType.LETTER)) {
          const dx = playerPos.x - obj.position[0];
          const dz = playerPos.z - obj.position[2];
          const distToPlayer = Math.sqrt(dx * dx + dz * dz);
          if (distToPlayer < 25) { // Attract range
            obj.position[0] += dx * safeDelta * 8;
            obj.position[2] += dz * safeDelta * 8;
            obj.position[1] = THREE.MathUtils.lerp(obj.position[1], playerPos.y + 1, safeDelta * 10);
          }
        }

        // Alien Firing Logic
        if (obj.type === ObjectType.ALIEN && obj.active && !obj.hasFired) {
             if (obj.position[2] > -90) {
                 obj.hasFired = true;
                 newSpawns.push({
                     id: uuidv4(),
                     type: ObjectType.MISSILE,
                     position: [obj.position[0], 1.0, obj.position[2] + 2],
                     active: true,
                     color: '#ff0000'
                 });
                 hasChanges = true;
                 window.dispatchEvent(new CustomEvent('particle-burst', { 
                    detail: { position: obj.position, color: '#ff00ff' } 
                 }));
             }
        }

        // Laser Shot Collision against Obstacles / Aliens / Missiles / Sliding Barriers / BOSS
        if (obj.type === ObjectType.LASER_SHOT && obj.active) {
          // Check Boss Hit
          if (bossState && bossState.active && obj.position[2] < -35) {
            damageBoss(40);
            obj.active = false;
            hasChanges = true;
            audio.playExplosion();
            window.dispatchEvent(new Event('boss-hit'));
            window.dispatchEvent(new CustomEvent('particle-burst', { 
              detail: { position: [obj.position[0], 5, -40], color: bossState.color || '#ff0055', type: 'explosion', count: 80 } 
            }));
            useStore.getState().addScore(500);
          }

          for (const target of currentObjects) {
            if (target.active && (
              target.type === ObjectType.OBSTACLE || 
              target.type === ObjectType.ALIEN || 
              target.type === ObjectType.MISSILE ||
              target.type === ObjectType.SLIDING_BARRIER
            )) {
              const dx = Math.abs(obj.position[0] - target.position[0]);
              const dz = Math.abs(obj.position[2] - target.position[2]);
              if (dx < 1.2 && dz < 3.0) {
                target.active = false;
                obj.active = false;
                hasChanges = true;
                audio.playExplosion();
                window.dispatchEvent(new CustomEvent('particle-burst', { 
                  detail: { position: target.position, color: '#ffff00', type: 'explosion', count: 60 } 
                }));
                useStore.getState().addScore(150);
                break;
              }
            }
          }
        }

        let keep = true;
        if (obj.active) {
            const zThreshold = 2.0; 
            const inZZone = (prevZ < playerPos.z + zThreshold) && (obj.position[2] > playerPos.z - zThreshold);
            
            if (obj.type === ObjectType.SHOP_PORTAL) {
                const dz = Math.abs(obj.position[2] - playerPos.z);
                if (dz < 2) { 
                     openShop();
                     obj.active = false;
                     hasChanges = true;
                     keep = false; 
                }
            } else if (inZZone) {
                const dx = Math.abs(obj.position[0] - playerPos.x);
                if (dx < 1.0) {
                     const isDamageSource = obj.type === ObjectType.OBSTACLE || obj.type === ObjectType.ALIEN || obj.type === ObjectType.MISSILE || obj.type === ObjectType.SLIDING_BARRIER;
                     
                     if (isDamageSource) {
                         const playerBottom = playerPos.y;
                         const playerTop = playerPos.y + 1.8;
                         let objBottom = obj.position[1] - 0.5;
                         let objTop = obj.position[1] + 0.5;

                         if (obj.type === ObjectType.OBSTACLE) {
                             objBottom = 0;
                             objTop = OBSTACLE_HEIGHT;
                         } else if (obj.type === ObjectType.MISSILE) {
                             objBottom = 0.5;
                             objTop = 1.5;
                         } else if (obj.type === ObjectType.SLIDING_BARRIER) {
                             objBottom = 0;
                             objTop = 1.5;
                         }

                         const isHit = (playerBottom < objTop) && (playerTop > objBottom);

                         if (isHit) { 
                             window.dispatchEvent(new Event('player-hit'));
                             obj.active = false; 
                             hasChanges = true;
                             if (obj.type === ObjectType.MISSILE || obj.type === ObjectType.SLIDING_BARRIER) {
                                window.dispatchEvent(new CustomEvent('particle-burst', { 
                                    detail: { position: obj.position, color: '#ff4400', type: 'explosion', count: 70 } 
                                }));
                             }
                         }
                     } else if (obj.type === ObjectType.BOOST_PAD) {
                         // Player stepped on boost pad!
                         window.dispatchEvent(new Event('player-boost'));
                         useStore.getState().addScore(200);
                         obj.active = false;
                         hasChanges = true;
                         window.dispatchEvent(new CustomEvent('particle-burst', { 
                            detail: { position: obj.position, color: '#00ff88', type: 'boost', count: 45 } 
                         }));
                     } else {
                         // Items
                         const dy = Math.abs(obj.position[1] - playerPos.y);
                         if (dy < 2.5) {
                            if (obj.type === ObjectType.GEM) {
                                collectGem(obj.points || 50);
                                audio.playGemCollect();
                            } else if (obj.type === ObjectType.LETTER && obj.targetIndex !== undefined) {
                                collectLetter(obj.targetIndex);
                                audio.playLetterCollect();
                            } else if (obj.type === ObjectType.POWERUP_MAGNET) {
                                useStore.getState().buyItem('MAGNET', 0);
                                audio.playBoost();
                            } else if (obj.type === ObjectType.POWERUP_BLASTER) {
                                useStore.getState().buyItem('BLASTER', 0);
                                audio.playBoost();
                            }
                            
                            window.dispatchEvent(new CustomEvent('particle-burst', { 
                                detail: { 
                                    position: obj.position, 
                                    color: obj.color || '#00ffff',
                                    type: 'pickup',
                                    count: 45 
                                } 
                            }));

                            obj.active = false;
                            hasChanges = true;
                         }
                     }
                }
            }
        }

        if (obj.position[2] > REMOVE_DISTANCE || obj.position[2] < -SPAWN_DISTANCE - 50) {
            keep = false;
            hasChanges = true;
        }

        if (keep) {
            keptObjects.push(obj);
        }
    }

    if (newSpawns.length > 0) {
        keptObjects.push(...newSpawns);
    }

    // Boss Attack Barrage Spawning
    if (bossState && bossState.active && Date.now() - lastBossAttackTime.current > 3500) {
      lastBossAttackTime.current = Date.now();
      const maxL = Math.floor(laneCount / 2);
      const randomLane1 = getRandomLane(laneCount);
      const randomLane2 = (randomLane1 + 1) > maxL ? randomLane1 - 1 : randomLane1 + 1;
      
      keptObjects.push(
        {
          id: uuidv4(),
          type: ObjectType.MISSILE,
          position: [randomLane1 * LANE_WIDTH, 1.0, -38],
          active: true,
          color: bossState.accentColor || '#ff0055'
        },
        {
          id: uuidv4(),
          type: ObjectType.MISSILE,
          position: [randomLane2 * LANE_WIDTH, 1.0, -38],
          active: true,
          color: bossState.accentColor || '#ff0055'
        }
      );
      hasChanges = true;
      audio.playLaserShot();
    }

    // Spawning Logic
    let furthestZ = 0;
    const staticObjects = keptObjects.filter(o => o.type !== ObjectType.MISSILE && o.type !== ObjectType.LASER_SHOT);
    
    if (staticObjects.length > 0) {
        furthestZ = Math.min(...staticObjects.map(o => o.position[2]));
    } else {
        furthestZ = -20;
    }

    if (furthestZ > -SPAWN_DISTANCE) {
         const minGap = 12 + (speed * 0.4); 
         const spawnZ = Math.min(furthestZ - minGap, -SPAWN_DISTANCE);
         
         const isLetterDue = distanceTraveled.current >= nextLetterDistance.current;

         if (isLetterDue) {
             const lane = getRandomLane(laneCount);
             const target = getLevelTargetWord(level);
             const availableIndices = target.map((_, i) => i).filter(i => !collectedLetters.includes(i));

             if (availableIndices.length > 0) {
                 const chosenIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
                 const val = target[chosenIndex];
                 const color = getLetterColor(chosenIndex);

                 keptObjects.push({
                    id: uuidv4(),
                    type: ObjectType.LETTER,
                    position: [lane * LANE_WIDTH, 1.0, spawnZ], 
                    active: true,
                    color: color,
                    value: val,
                    targetIndex: chosenIndex
                 });
                 
                 nextLetterDistance.current += getLetterInterval(level);
                 hasChanges = true;
             } else {
                keptObjects.push({
                    id: uuidv4(),
                    type: ObjectType.GEM,
                    position: [lane * LANE_WIDTH, 1.2, spawnZ],
                    active: true,
                    color: '#00ffff',
                    points: 50
                });
                hasChanges = true;
             }

         } else if (Math.random() > 0.1) {
            const isObstacle = Math.random() > 0.20;
            const currentTheme = getLevelTheme(level);

            if (isObstacle) {
                const spawnTypeVal = Math.random();

                if (level >= 2 && spawnTypeVal < 0.2) {
                    // Alien / Enemy
                    const lane = getRandomLane(laneCount);
                    keptObjects.push({
                        id: uuidv4(),
                        type: ObjectType.ALIEN,
                        position: [lane * LANE_WIDTH, 1.5, spawnZ],
                        active: true,
                        color: currentTheme.alienColor,
                        hasFired: false
                    });
                } else if (level >= 2 && spawnTypeVal >= 0.2 && spawnTypeVal < 0.35) {
                    // Sliding Barrier
                    const maxLane = Math.floor(laneCount / 2);
                    keptObjects.push({
                        id: uuidv4(),
                        type: ObjectType.SLIDING_BARRIER,
                        position: [0, 0.6, spawnZ],
                        active: true,
                        color: currentTheme.obstacleGlow,
                        slideSpeed: 4 + Math.random() * 3,
                        slideDirection: Math.random() > 0.5 ? 1 : -1,
                        minX: -maxLane * LANE_WIDTH,
                        maxX: maxLane * LANE_WIDTH
                    });
                } else {
                    // Standard Obstacle Spikes / Crystals
                    const availableLanes = [];
                    const maxLane = Math.floor(laneCount / 2);
                    for (let i = -maxLane; i <= maxLane; i++) availableLanes.push(i);
                    availableLanes.sort(() => Math.random() - 0.5);
                    
                    let countToSpawn = 1;
                    const p = Math.random();

                    if (p > 0.80) {
                        countToSpawn = Math.min(3, availableLanes.length);
                    } else if (p > 0.50) {
                        countToSpawn = Math.min(2, availableLanes.length);
                    } else {
                        countToSpawn = 1;
                    }

                    for (let i = 0; i < countToSpawn; i++) {
                        const lane = availableLanes[i];
                        const laneX = lane * LANE_WIDTH;
                        
                        keptObjects.push({
                            id: uuidv4(),
                            type: ObjectType.OBSTACLE,
                            position: [laneX, OBSTACLE_HEIGHT / 2, spawnZ],
                            active: true,
                            color: currentTheme.obstacleColor
                        });

                        if (Math.random() < 0.3) {
                             keptObjects.push({
                                id: uuidv4(),
                                type: ObjectType.GEM,
                                position: [laneX, OBSTACLE_HEIGHT + 1.0, spawnZ],
                                active: true,
                                color: '#ffd700',
                                points: 100
                            });
                        }
                    }
                }

            } else {
                // Ground Items / Boost pads / Powerups
                const lane = getRandomLane(laneCount);
                const itemTypeVal = Math.random();

                if (itemTypeVal < 0.70) {
                  // Gem
                  keptObjects.push({
                      id: uuidv4(),
                      type: ObjectType.GEM,
                      position: [lane * LANE_WIDTH, 1.2, spawnZ],
                      active: true,
                      color: '#00ffff',
                      points: 50
                  });
                } else if (itemTypeVal < 0.85) {
                  // Boost Pad
                  keptObjects.push({
                      id: uuidv4(),
                      type: ObjectType.BOOST_PAD,
                      position: [lane * LANE_WIDTH, 0.05, spawnZ],
                      active: true,
                      color: '#00ff88'
                  });
                } else if (itemTypeVal < 0.93) {
                  // Magnet Powerup drop
                  keptObjects.push({
                      id: uuidv4(),
                      type: ObjectType.POWERUP_MAGNET,
                      position: [lane * LANE_WIDTH, 1.2, spawnZ],
                      active: true,
                      color: '#00ffff'
                  });
                } else {
                  // Blaster Powerup drop
                  keptObjects.push({
                      id: uuidv4(),
                      type: ObjectType.POWERUP_BLASTER,
                      position: [lane * LANE_WIDTH, 1.2, spawnZ],
                      active: true,
                      color: '#ffaa00'
                  });
                }
            }
            hasChanges = true;
         }
    }

    if (hasChanges) {
        objectsRef.current = keptObjects;
        setRenderTrigger(t => t + 1);
    }
  });

  return (
    <group>
      <ParticleSystem />
      {objectsRef.current.map(obj => {
        if (!obj.active) return null;
        return <GameEntity key={obj.id} data={obj} />;
      })}
    </group>
  );
};

const GameEntity: React.FC<{ data: GameObject }> = React.memo(({ data }) => {
    const groupRef = useRef<THREE.Group>(null);
    const visualRef = useRef<THREE.Group>(null);
    const shadowRef = useRef<THREE.Mesh>(null);
    const { laneCount, level } = useStore();
    
    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.position.set(data.position[0], 0, data.position[2]);
        }

        if (visualRef.current) {
            const baseHeight = data.position[1];
            
            if (data.type === ObjectType.SHOP_PORTAL) {
                 visualRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.02);
            } else if (data.type === ObjectType.MISSILE) {
                 visualRef.current.rotation.z += delta * 20;
                 visualRef.current.position.y = baseHeight;
            } else if (data.type === ObjectType.LASER_SHOT) {
                 visualRef.current.position.y = baseHeight;
            } else if (data.type === ObjectType.ALIEN) {
                 visualRef.current.position.y = baseHeight + Math.sin(state.clock.elapsedTime * 3) * 0.2;
                 visualRef.current.rotation.y += delta;
            } else if (data.type === ObjectType.POWERUP_MAGNET || data.type === ObjectType.POWERUP_BLASTER) {
                 visualRef.current.rotation.y += delta * 4;
                 visualRef.current.position.y = baseHeight + Math.sin(state.clock.elapsedTime * 5) * 0.15;
            } else if (data.type !== ObjectType.OBSTACLE && data.type !== ObjectType.BOOST_PAD && data.type !== ObjectType.SLIDING_BARRIER) {
                visualRef.current.rotation.y += delta * 3;
                const bobOffset = Math.sin(state.clock.elapsedTime * 4 + data.position[0]) * 0.1;
                visualRef.current.position.y = baseHeight + bobOffset;
                
                if (shadowRef.current) {
                    const shadowScale = 1 - bobOffset; 
                    shadowRef.current.scale.setScalar(shadowScale);
                }
            } else {
                visualRef.current.position.y = baseHeight;
            }
        }
    });

    const shadowGeo = useMemo(() => {
        if (data.type === ObjectType.LETTER) return SHADOW_LETTER_GEO;
        if (data.type === ObjectType.GEM) return SHADOW_GEM_GEO;
        if (data.type === ObjectType.SHOP_PORTAL || data.type === ObjectType.LASER_SHOT || data.type === ObjectType.BOOST_PAD) return null;
        if (data.type === ObjectType.ALIEN) return SHADOW_ALIEN_GEO;
        if (data.type === ObjectType.MISSILE) return SHADOW_MISSILE_GEO;
        return SHADOW_DEFAULT_GEO; 
    }, [data.type]);

    return (
        <group ref={groupRef} position={[data.position[0], 0, data.position[2]]}>
            {data.type !== ObjectType.SHOP_PORTAL && shadowGeo && (
                <mesh ref={shadowRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} geometry={shadowGeo}>
                    <meshBasicMaterial color="#000000" opacity={0.3} transparent />
                </mesh>
            )}

            <group ref={visualRef} position={[0, data.position[1], 0]}>
                {/* SHOP PORTAL */}
                {data.type === ObjectType.SHOP_PORTAL && (
                    <group>
                         <mesh position={[0, 3, 0]} geometry={SHOP_FRAME_GEO} scale={[laneCount * LANE_WIDTH + 2, 1, 1]}>
                             <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.2} />
                         </mesh>
                         <mesh position={[0, 2, 0]} geometry={SHOP_BACK_GEO} scale={[laneCount * LANE_WIDTH, 1, 1]}>
                              <meshBasicMaterial color="#000000" />
                         </mesh>
                         <mesh position={[0, 3, 0]} geometry={SHOP_OUTLINE_GEO} scale={[laneCount * LANE_WIDTH + 2.2, 1, 1]}>
                             <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.3} />
                         </mesh>
                         <Center position={[0, 5, 0.6]}>
                             <Text3D font={FONT_URL} size={1.2} height={0.2}>
                                 CYBER SHOP
                                 <meshBasicMaterial color="#ffff00" />
                             </Text3D>
                         </Center>
                         <mesh position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]} geometry={SHOP_FLOOR_GEO} scale={[laneCount * LANE_WIDTH, 1, 1]}>
                             <meshBasicMaterial color="#00ffff" transparent opacity={0.3} />
                         </mesh>
                    </group>
                )}

                {/* OBSTACLE */}
                {data.type === ObjectType.OBSTACLE && (
                    <group>
                        {level === 1 && (
                          <>
                            <mesh geometry={OBSTACLE_GEOMETRY} castShadow receiveShadow>
                                 <meshStandardMaterial color="#110522" roughness={0.3} metalness={0.8} flatShading={true} />
                            </mesh>
                            <mesh scale={[1.02, 1.02, 1.02]} geometry={OBSTACLE_GLOW_GEO}>
                                 <meshBasicMaterial color={data.color} wireframe transparent opacity={0.35} />
                            </mesh>
                            <mesh position={[0, -OBSTACLE_HEIGHT/2 + 0.05, 0]} rotation={[-Math.PI/2,0,0]} geometry={OBSTACLE_RING_GEO}>
                                 <meshBasicMaterial color={data.color} transparent opacity={0.4} side={THREE.DoubleSide} />
                            </mesh>
                          </>
                        )}
                        {level === 2 && (
                          <>
                            {/* Volcanic Magma Rock */}
                            <mesh geometry={LAVA_ROCK_GEO} castShadow receiveShadow>
                                 <meshStandardMaterial color="#3a0800" roughness={0.8} metalness={0.2} emissive="#ff3300" emissiveIntensity={0.6} />
                            </mesh>
                            <mesh scale={[1.1, 1.1, 1.1]} geometry={LAVA_ROCK_GEO}>
                                 <meshBasicMaterial color="#ffcc00" wireframe transparent opacity={0.25} />
                            </mesh>
                          </>
                        )}
                        {level === 3 && (
                          <>
                            {/* Cyber Matrix Code Block */}
                            <mesh geometry={MATRIX_CUBE_GEO} castShadow receiveShadow>
                                 <meshStandardMaterial color="#00220a" roughness={0.4} metalness={0.6} emissive="#00ff66" emissiveIntensity={0.4} />
                            </mesh>
                            <mesh scale={[1.05, 1.05, 1.05]} geometry={MATRIX_CUBE_GEO}>
                                 <meshBasicMaterial color="#00ffcc" wireframe transparent opacity={0.4} />
                            </mesh>
                          </>
                        )}
                        {level === 4 && (
                          <>
                            {/* Cosmic Nebula Asteroid */}
                            <mesh geometry={COSMIC_ASTEROID_GEO} castShadow receiveShadow>
                                 <meshStandardMaterial color="#1a0033" roughness={0.5} metalness={0.7} emissive="#ff00aa" emissiveIntensity={0.5} />
                            </mesh>
                            <mesh rotation={[Math.PI/4, 0, 0]}>
                                 <torusGeometry args={[1.5, 0.05, 16, 32]} />
                                 <meshBasicMaterial color="#ffd700" />
                            </mesh>
                          </>
                        )}
                        {level === 5 && (
                          <>
                            {/* Glacial Frost Spire */}
                            <mesh geometry={ICE_SPIRE_GEO} castShadow receiveShadow>
                                 <meshStandardMaterial color="#003355" roughness={0.1} metalness={0.9} emissive="#00d3ff" emissiveIntensity={0.7} />
                            </mesh>
                            <mesh scale={[1.08, 1.08, 1.08]} geometry={ICE_SPIRE_GEO}>
                                 <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.4} />
                            </mesh>
                          </>
                        )}
                        {level === 6 && (
                          <>
                            {/* Quantum Distortion Node */}
                            <mesh geometry={QUANTUM_NODE_GEO} castShadow receiveShadow>
                                 <meshStandardMaterial color="#220044" roughness={0.2} metalness={0.8} emissive="#e000ff" emissiveIntensity={0.8} />
                            </mesh>
                            <mesh scale={[1.1, 1.1, 1.1]} geometry={QUANTUM_NODE_GEO}>
                                 <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.5} />
                            </mesh>
                          </>
                        )}
                        {level === 7 && (
                          <>
                            {/* Titan Pillar */}
                            <mesh geometry={TITAN_PILLAR_GEO} castShadow receiveShadow>
                                 <meshStandardMaterial color="#3a2a00" roughness={0.6} metalness={0.8} emissive="#ffd700" emissiveIntensity={0.6} />
                            </mesh>
                            <mesh scale={[1.05, 1.05, 1.05]} geometry={TITAN_PILLAR_GEO}>
                                 <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.3} />
                            </mesh>
                          </>
                        )}
                        {level === 8 && (
                          <>
                            {/* Diamond Prism */}
                            <mesh geometry={DIAMOND_PRISM_GEO} castShadow receiveShadow>
                                 <meshStandardMaterial color="#003344" roughness={0.1} metalness={0.9} emissive="#00ffcc" emissiveIntensity={0.9} />
                            </mesh>
                            <mesh scale={[1.12, 1.12, 1.12]} geometry={DIAMOND_PRISM_GEO}>
                                 <meshBasicMaterial color="#ff00aa" wireframe transparent opacity={0.5} />
                            </mesh>
                          </>
                        )}
                        {level === 9 && (
                          <>
                            {/* Solar Punk Golden Pyramid Spike */}
                            <mesh geometry={SOLAR_PYRAMID_GEO} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
                                 <meshStandardMaterial color="#3d2800" roughness={0.2} metalness={0.9} emissive="#ffd700" emissiveIntensity={0.8} />
                            </mesh>
                            <mesh scale={[1.08, 1.08, 1.08]} rotation={[0, Math.PI / 4, 0]} geometry={SOLAR_PYRAMID_GEO}>
                                 <meshBasicMaterial color="#00ffaa" wireframe transparent opacity={0.6} />
                            </mesh>
                          </>
                        )}
                        {(level >= 10) && (
                          <>
                            {/* Cyber Plasma Abyss Crystal & Ring */}
                            <mesh geometry={CYBER_ABYSS_CRYSTAL_GEO} castShadow receiveShadow>
                                 <meshStandardMaterial color="#1f0033" roughness={0.1} metalness={0.95} emissive="#ff00ea" emissiveIntensity={0.9} />
                            </mesh>
                            <mesh geometry={ABYSS_RING_GEO} rotation={[Math.PI / 3, 0, 0]}>
                                 <meshBasicMaterial color="#39ff14" />
                            </mesh>
                          </>
                        )}
                    </group>
                )}

                {/* SLIDING BARRIER */}
                {data.type === ObjectType.SLIDING_BARRIER && (
                    <group>
                        <mesh geometry={SLIDING_BARRIER_GEO} castShadow>
                             <meshStandardMaterial color={data.color || "#ff00aa"} emissive={data.color || "#ff00aa"} emissiveIntensity={0.8} metalness={0.9} />
                        </mesh>
                    </group>
                )}

                {/* ALIEN / ENEMY */}
                {data.type === ObjectType.ALIEN && (
                    <group>
                        <mesh castShadow geometry={ALIEN_BODY_GEO}>
                            <meshStandardMaterial color={data.color || "#4400cc"} metalness={0.8} roughness={0.2} />
                        </mesh>
                        <mesh position={[0, 0.2, 0]} geometry={ALIEN_DOME_GEO}>
                            <meshStandardMaterial color={data.color || "#00ff00"} emissive={data.color || "#00ff00"} emissiveIntensity={0.6} transparent opacity={0.85} />
                        </mesh>
                        <mesh position={[0.3, 0, 0.3]} geometry={ALIEN_EYE_GEO}>
                             <meshBasicMaterial color="#ff00ff" />
                        </mesh>
                        <mesh position={[-0.3, 0, 0.3]} geometry={ALIEN_EYE_GEO}>
                             <meshBasicMaterial color="#ff00ff" />
                        </mesh>
                    </group>
                )}

                {/* MISSILE */}
                {data.type === ObjectType.MISSILE && (
                    <group rotation={[Math.PI / 2, 0, 0]}>
                        <mesh geometry={MISSILE_CORE_GEO}>
                            <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={4} />
                        </mesh>
                        <mesh position={[0, 1.0, 0]} geometry={MISSILE_RING_GEO}>
                            <meshBasicMaterial color="#ffff00" />
                        </mesh>
                        <mesh position={[0, 0, 0]} geometry={MISSILE_RING_GEO}>
                            <meshBasicMaterial color="#ffff00" />
                        </mesh>
                        <mesh position={[0, -1.0, 0]} geometry={MISSILE_RING_GEO}>
                            <meshBasicMaterial color="#ffff00" />
                        </mesh>
                    </group>
                )}

                {/* LASER SHOT (Player Projectile) */}
                {data.type === ObjectType.LASER_SHOT && (
                    <group rotation={[Math.PI / 2, 0, 0]}>
                        <mesh geometry={LASER_SHOT_GEO}>
                            <meshBasicMaterial color="#00ffff" />
                        </mesh>
                    </group>
                )}

                {/* MAGNET POWERUP */}
                {data.type === ObjectType.POWERUP_MAGNET && (
                    <mesh geometry={MAGNET_GEO}>
                        <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} />
                    </mesh>
                )}

                {/* BLASTER POWERUP */}
                {data.type === ObjectType.POWERUP_BLASTER && (
                    <mesh geometry={BLASTER_BOX_GEO}>
                        <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={2} />
                    </mesh>
                )}

                {/* BOOST PAD */}
                {data.type === ObjectType.BOOST_PAD && (
                    <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={BOOST_PAD_GEO}>
                        <meshBasicMaterial color="#00ff88" transparent opacity={0.8} />
                    </mesh>
                )}

                {/* GEM */}
                {data.type === ObjectType.GEM && (
                    <mesh castShadow geometry={GEM_GEOMETRY}>
                        <meshStandardMaterial color={data.color} roughness={0} metalness={1} emissive={data.color} emissiveIntensity={2} />
                    </mesh>
                )}

                {/* LETTER */}
                {data.type === ObjectType.LETTER && (
                    <group scale={[1.5, 1.5, 1.5]}>
                         <Center>
                             <Text3D 
                                font={FONT_URL} 
                                size={0.8} 
                                height={0.5} 
                                bevelEnabled
                                bevelThickness={0.02}
                                bevelSize={0.02}
                                bevelSegments={5}
                             >
                                {data.value}
                                <meshStandardMaterial color={data.color} emissive={data.color} emissiveIntensity={1.5} />
                             </Text3D>
                         </Center>
                    </group>
                )}
            </group>
        </group>
    );
});
