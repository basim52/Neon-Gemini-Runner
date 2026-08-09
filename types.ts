/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  SHOP = 'SHOP',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export enum ObjectType {
  OBSTACLE = 'OBSTACLE',
  GEM = 'GEM',
  LETTER = 'LETTER',
  SHOP_PORTAL = 'SHOP_PORTAL',
  ALIEN = 'ALIEN',
  MISSILE = 'MISSILE',
  POWERUP_MAGNET = 'POWERUP_MAGNET',
  POWERUP_BLASTER = 'POWERUP_BLASTER',
  SLIDING_BARRIER = 'SLIDING_BARRIER',
  BOOST_PAD = 'BOOST_PAD',
  LASER_SHOT = 'LASER_SHOT'
}

export enum PlayerSkin {
  ROBLOX_CLASSIC = 'ROBLOX_CLASSIC',
  ROBLOX_GOLD = 'ROBLOX_GOLD',
  ROBLOX_NEON = 'ROBLOX_NEON',
  ROBLOX_NINJA = 'ROBLOX_NINJA'
}

export interface SkinInfo {
  id: PlayerSkin;
  name: string;
  color: string;
  glowColor: string;
  hairColor: string;
  skinTone: string;
  pantColor: string;
  cost: number;
  description: string;
}

export const SKINS_DATA: Record<PlayerSkin, SkinInfo> = {
  [PlayerSkin.ROBLOX_CLASSIC]: { 
    id: PlayerSkin.ROBLOX_CLASSIC, 
    name: 'ROBLOX BOY', 
    color: '#1a1a1b', 
    glowColor: '#ffffff', 
    hairColor: '#4a2e18', 
    skinTone: '#f3c299',
    pantColor: '#1a1a1b',
    cost: 0,
    description: 'The iconic Roblox boy with black hoodie, spiky hair & sneakers!'
  },
  [PlayerSkin.ROBLOX_GOLD]: { 
    id: PlayerSkin.ROBLOX_GOLD, 
    name: 'GOLD ROBLOX', 
    color: '#d4af37', 
    glowColor: '#ffd700', 
    hairColor: '#ffe066', 
    skinTone: '#fbe2b5',
    pantColor: '#332a00',
    cost: 1500,
    description: 'Pure 24K gold hoodie with glowing accessories.'
  },
  [PlayerSkin.ROBLOX_NEON]: { 
    id: PlayerSkin.ROBLOX_NEON, 
    name: 'NEON CYBER', 
    color: '#00aaff', 
    glowColor: '#00ffff', 
    hairColor: '#ff00aa', 
    skinTone: '#e6f7ff',
    pantColor: '#0a192f',
    cost: 2500,
    description: 'Futuristic glowing cyber-suit Roblox runner.'
  },
  [PlayerSkin.ROBLOX_NINJA]: { 
    id: PlayerSkin.ROBLOX_NINJA, 
    name: 'SHADOW NINJA', 
    color: '#2b1055', 
    glowColor: '#a855f7', 
    hairColor: '#111827', 
    skinTone: '#d1d5db',
    pantColor: '#1f1135',
    cost: 4000,
    description: 'Stealthy purple shadow ninja Roblox skin.'
  }
};

export interface GameObject {
  id: string;
  type: ObjectType;
  position: [number, number, number]; // x, y, z
  active: boolean;
  value?: string; // For letters (G, E, M...)
  color?: string;
  targetIndex?: number; // Index in the GEMINI target word
  points?: number; // Score value for gems
  hasFired?: boolean; // For Aliens
  slideSpeed?: number; // For SLIDING_BARRIER
  slideDirection?: number; // For SLIDING_BARRIER
  minX?: number;
  maxX?: number;
}

export const LANE_WIDTH = 2.2;
export const JUMP_HEIGHT = 2.5;
export const JUMP_DURATION = 0.6; // seconds
export const RUN_SPEED_BASE = 22.5;
export const SPAWN_DISTANCE = 120;
export const REMOVE_DISTANCE = 20; // Behind player

// Google-ish Neon Colors: Blue, Red, Yellow, Blue, Green, Red
export const GEMINI_COLORS = [
    '#2979ff', // G - Blue
    '#ff1744', // E - Red
    '#ffea00', // M - Yellow
    '#2979ff', // I - Blue
    '#00e676', // N - Green
    '#ff1744', // I - Red
];

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    icon: any; // Lucide icon component
    oneTime?: boolean; // If true, remove from pool after buying
}
