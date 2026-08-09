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

export interface LevelTheme {
  level: number;
  nameAr: string;
  nameEn: string;
  bgColor: string;
  fogColor: string;
  ambientColor: string;
  directionalColor: string;
  pointLightColor: string;
  sunTopColor: string;
  sunBottomColor: string;
  gridColor: string;
  floorColor: string;
  laneColor: string;
  sceneryType: 'CYBER_CITY' | 'VOLCANIC_INFERNO' | 'MATRIX_JUNGLE' | 'COSMIC_VOID' | 'FROST_REALM';
  obstacleColor: string;
  obstacleGlow: string;
  alienColor: string;
  missileColor: string;
}

export const LEVEL_THEMES: LevelTheme[] = [
  {
    level: 1,
    nameAr: "المرحلة 1: المدينة السيبرانية",
    nameEn: "STAGE 1: NEO CYBER CITY",
    bgColor: "#050011",
    fogColor: "#050011",
    ambientColor: "#400080",
    directionalColor: "#00ffff",
    pointLightColor: "#ff00aa",
    sunTopColor: "#ffe600",
    sunBottomColor: "#ff0077",
    gridColor: "#8800ff",
    floorColor: "#1a0b2e",
    laneColor: "#00ffff",
    sceneryType: "CYBER_CITY",
    obstacleColor: "#00ffff",
    obstacleGlow: "#ff00aa",
    alienColor: "#00ffaa",
    missileColor: "#ff0055",
  },
  {
    level: 2,
    nameAr: "المرحلة 2: عـالـم الـبـراكـيـن والـحـمـم",
    nameEn: "STAGE 2: LAVA INFERNO CANYON",
    bgColor: "#1a0200",
    fogColor: "#1a0200",
    ambientColor: "#661100",
    directionalColor: "#ff4400",
    pointLightColor: "#ffaa00",
    sunTopColor: "#ffff00",
    sunBottomColor: "#ff2200",
    gridColor: "#ff3300",
    floorColor: "#2a0800",
    laneColor: "#ffaa00",
    sceneryType: "VOLCANIC_INFERNO",
    obstacleColor: "#ff4400",
    obstacleGlow: "#ffaa00",
    alienColor: "#ff2200",
    missileColor: "#ff8800",
  },
  {
    level: 3,
    nameAr: "المرحلة 3: غـابـة الـمـاتـريـكـس الـرقـمـيـة",
    nameEn: "STAGE 3: CYBER MATRIX JUNGLE",
    bgColor: "#000d05",
    fogColor: "#000d05",
    ambientColor: "#003311",
    directionalColor: "#00ff66",
    pointLightColor: "#00ffcc",
    sunTopColor: "#aaff00",
    sunBottomColor: "#00aa44",
    gridColor: "#00ff44",
    floorColor: "#001f0a",
    laneColor: "#00ff88",
    sceneryType: "MATRIX_JUNGLE",
    obstacleColor: "#00ff66",
    obstacleGlow: "#00ffcc",
    alienColor: "#33ff00",
    missileColor: "#00ffaa",
  },
  {
    level: 4,
    nameAr: "المرحلة 4: الفـضـاء الـكـونـي والمـجـرات",
    nameEn: "STAGE 4: COSMIC NEBULA REALM",
    bgColor: "#0a001a",
    fogColor: "#0a001a",
    ambientColor: "#220044",
    directionalColor: "#ff00aa",
    pointLightColor: "#ffd700",
    sunTopColor: "#ffffff",
    sunBottomColor: "#aa00ff",
    gridColor: "#aa00ff",
    floorColor: "#150033",
    laneColor: "#ffd700",
    sceneryType: "COSMIC_VOID",
    obstacleColor: "#d8b4fe",
    obstacleGlow: "#ff00aa",
    alienColor: "#e0e7ff",
    missileColor: "#ffd700",
  },
  {
    level: 5,
    nameAr: "المرحلة 5: مـمـلـكـة الـجـلـيـد السيـبـراني",
    nameEn: "STAGE 5: GLACIAL FROST KINGDOM",
    bgColor: "#001020",
    fogColor: "#001020",
    ambientColor: "#002244",
    directionalColor: "#00d3ff",
    pointLightColor: "#0088ff",
    sunTopColor: "#e0ffff",
    sunBottomColor: "#0066cc",
    gridColor: "#00aaff",
    floorColor: "#00203a",
    laneColor: "#ffffff",
    sceneryType: "FROST_REALM",
    obstacleColor: "#00d3ff",
    obstacleGlow: "#ffffff",
    alienColor: "#80e5ff",
    missileColor: "#00aaff",
  }
];

export const getLevelTheme = (level: number): LevelTheme => {
  const index = Math.max(0, (level - 1) % LEVEL_THEMES.length);
  return LEVEL_THEMES[index];
};
