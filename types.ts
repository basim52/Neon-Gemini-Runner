/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  SHOP = 'SHOP',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}

export enum GraphicsQuality {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
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
  LASER_SHOT = 'LASER_SHOT',
  WARP_PORTAL = 'WARP_PORTAL',
  BOSS_MISSILE = 'BOSS_MISSILE',
  BOSS_ENERGY_ORB = 'BOSS_ENERGY_ORB'
}

export enum PlayerSkin {
  ROBLOX_CLASSIC = 'ROBLOX_CLASSIC',
  ROBLOX_GOLD = 'ROBLOX_GOLD',
  ROBLOX_NEON = 'ROBLOX_NEON',
  ROBLOX_NINJA = 'ROBLOX_NINJA'
}

export interface HeroUltimate {
  id: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  duration: number; // in seconds
  color: string;
  iconName: string;
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
  ultimate: HeroUltimate;
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
    description: 'The iconic Roblox boy with black hoodie, spiky hair & sneakers!',
    ultimate: {
      id: 'EMP_SHOCKWAVE',
      nameAr: 'موجة الصدمة الكهرومغناطيسية',
      nameEn: 'EMP SHOCKWAVE JUMP',
      descAr: 'قفزة نفاثة عملاقة تمحو جميع العوائق في الأفق وتمنح درع حماية!',
      duration: 5,
      color: '#00ffff',
      iconName: 'Zap'
    }
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
    description: 'Pure 24K gold hoodie with glowing accessories.',
    ultimate: {
      id: 'MIDAS_GOLD_STORM',
      nameAr: 'عاصفة الذهب الخالص',
      nameEn: 'MIDAS GOLD RUSH',
      descAr: 'مضاعفة نقاط الجواهر 3x وسحب مغناطيسي فائق لجميع الجواهر!',
      duration: 7,
      color: '#ffd700',
      iconName: 'Sparkles'
    }
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
    description: 'Futuristic glowing cyber-suit Roblox runner.',
    ultimate: {
      id: 'PLASMA_OVERLOAD',
      nameAr: 'شعاع البلازما الفائق',
      nameEn: 'HYPER PLASMA BEAM',
      descAr: 'إطلاق وابل ليزري مستمر يدمّر العوائق والزعماء تلقائياً!',
      duration: 6,
      color: '#ff00aa',
      iconName: 'Crosshair'
    }
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
    description: 'Stealthy purple shadow ninja Roblox skin.',
    ultimate: {
      id: 'SHADOW_PHASE',
      nameAr: 'الانتقال الشبحي اللامرئي',
      nameEn: 'SHADOW PHASE SHIFT',
      descAr: 'اختفاء شبحي كامل واختراق لجميع الأجسام بحصانة تامة!',
      duration: 6,
      color: '#a855f7',
      iconName: 'Ghost'
    }
  }
};

// Cyber Boss Types & Data
export enum BossType {
  CYBER_TITAN_CORE = 'CYBER_TITAN_CORE',
  PLASMA_DRAGON = 'PLASMA_DRAGON',
  QUANTUM_OVERLORD = 'QUANTUM_OVERLORD'
}

export interface BossData {
  type: BossType;
  nameAr: string;
  nameEn: string;
  maxHealth: number;
  color: string;
  accentColor: string;
  rewardScore: number;
  rewardGems: number;
}

export const BOSS_ROSTER: Record<BossType, BossData> = {
  [BossType.CYBER_TITAN_CORE]: {
    type: BossType.CYBER_TITAN_CORE,
    nameAr: 'نواة التيتان السيبراني',
    nameEn: 'CYBER TITAN CORE',
    maxHealth: 100,
    color: '#00ffff',
    accentColor: '#ff00aa',
    rewardScore: 5000,
    rewardGems: 300
  },
  [BossType.PLASMA_DRAGON]: {
    type: BossType.PLASMA_DRAGON,
    nameAr: 'تنين البلازما الفضائي',
    nameEn: 'PLASMA DRAGON MK-X',
    maxHealth: 140,
    color: '#ff3300',
    accentColor: '#ffd700',
    rewardScore: 7500,
    rewardGems: 450
  },
  [BossType.QUANTUM_OVERLORD]: {
    type: BossType.QUANTUM_OVERLORD,
    nameAr: 'سيد البعد الكمومي',
    nameEn: 'QUANTUM OVERLORD',
    maxHealth: 180,
    color: '#e000ff',
    accentColor: '#39ff14',
    rewardScore: 10000,
    rewardGems: 600
  }
};

// Permanent Tech Lab Upgrades
export interface TechUpgrade {
  id: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  maxLevel: number;
  baseCost: number;
  costMultiplier: number;
  iconName: string;
  icon?: string;
  bonusPerLevel?: number;
  color: string;
}

export const TECH_UPGRADES: TechUpgrade[] = [
  {
    id: 'MAGNET_BOOST',
    nameAr: 'تطوير المغناطيس',
    nameEn: 'MAGNET DURATION & RANGE',
    descAr: 'زيادة مدة وقوة سحب المغناطيس للجواهر والحروف.',
    maxLevel: 5,
    baseCost: 200,
    costMultiplier: 1.8,
    iconName: 'Magnet',
    icon: '🧲',
    bonusPerLevel: 25,
    color: '#00ffff'
  },
  {
    id: 'SHIELD_REGEN',
    nameAr: 'إعادة شحن الدرع',
    nameEn: 'DRONE AUTO RECHARGE',
    descAr: 'درع الحماية يعيد شحن نفسه تلقائياً كل 40 ثانية أثناء الجري.',
    maxLevel: 5,
    baseCost: 350,
    costMultiplier: 2.0,
    iconName: 'Shield',
    icon: '🛡️',
    bonusPerLevel: 20,
    color: '#00ffcc'
  },
  {
    id: 'BLASTER_SURGE',
    nameAr: 'سعة مدفع الليزر',
    nameEn: 'LASER BLASTER CAPACITY',
    descAr: 'زيادة الذخيرة القصوى وتوليد طلقة إضافية كل 15 ثانية.',
    maxLevel: 5,
    baseCost: 250,
    costMultiplier: 1.7,
    iconName: 'Crosshair',
    icon: '🎯',
    bonusPerLevel: 30,
    color: '#ffaa00'
  },
  {
    id: 'ULTIMATE_MASTERY',
    nameAr: 'شحن القدرة الخارقة',
    nameEn: 'ULTIMATE CHARGE RATE',
    descAr: 'تسريع شحن مقياس القدرة الخارقة بنسبة 20% لكل ترقية.',
    maxLevel: 5,
    baseCost: 400,
    costMultiplier: 2.2,
    iconName: 'Zap',
    icon: '⚡',
    bonusPerLevel: 20,
    color: '#ff00aa'
  },
  {
    id: 'GEM_HARVESTER',
    nameAr: 'مضاعفة حصاد الجواهر',
    nameEn: 'GEM VALUE HARVESTER',
    descAr: 'زيادة قيمة ونقاط كل جوهرة يتم جمعها في المسار.',
    maxLevel: 5,
    baseCost: 300,
    costMultiplier: 1.9,
    iconName: 'Coins',
    icon: '💎',
    bonusPerLevel: 35,
    color: '#ffd700'
  }
];

// Cyber Badges & Titles
export interface CyberBadge {
  id: string;
  titleAr: string;
  descAr: string;
  rewardTitle: string;
  iconName: string;
  icon?: string;
  color: string;
}

export const CYBER_BADGES: CyberBadge[] = [
  {
    id: 'BADGE_BOSS_SLAYER',
    titleAr: 'قاهر الزعماء',
    descAr: 'اهزم أول زعيم سيبراني في اللعبة',
    rewardTitle: '👑 قاهر الزعماء',
    iconName: 'Crown',
    icon: '👑',
    color: '#ffd700'
  },
  {
    id: 'BADGE_SPEED_DEMON',
    titleAr: 'شبح السرعة',
    descAr: 'اقطع مسافة 1500 متر في جولة واحدة',
    rewardTitle: '⚡ شبح السرعة',
    iconName: 'Flame',
    icon: '⚡',
    color: '#ff3300'
  },
  {
    id: 'BADGE_COMBO_MASTER',
    titleAr: 'سيد الكومبو الأسطوري',
    descAr: 'حقق كومبو 25x متتالي',
    rewardTitle: '🎯 سيد الكومبو',
    iconName: 'Target',
    icon: '🎯',
    color: '#00ffff'
  },
  {
    id: 'BADGE_TECH_GENIUS',
    titleAr: 'خبير المختبر',
    descAr: 'قم بترقية 5 مهارات في شجرة التطوير',
    rewardTitle: '🔬 خبير التكنولوجيا',
    iconName: 'Cpu',
    icon: '🔬',
    color: '#00ffaa'
  },
  {
    id: 'BADGE_WARP_EXPLORER',
    titleAr: 'مستكشف الأبعاد',
    descAr: 'ادخل بوابة البُعد الفائق Warp Portal',
    rewardTitle: '🌌 مسافر الأبعاد',
    iconName: 'Compass',
    icon: '🌌',
    color: '#e000ff'
  }
];

// Daily Challenge
export interface DailyChallenge {
  date: string;
  word: string;
  hintAr: string;
  titleAr?: string;
  descAr?: string;
  target?: number;
  current?: number;
  rewardGems: number;
  rewardAmmo: number;
  isCompleted: boolean;
  isClaimed?: boolean;
}

export const CURRENT_DAILY_CHALLENGE: DailyChallenge = {
  date: new Date().toISOString().split('T')[0],
  word: 'CYBER',
  hintAr: 'لغز اليوم: عالم التقنية النيونية والذكاء الاصطناعي (5 حروف)',
  titleAr: 'تحدي تجميع الكلمات السيبرانية',
  descAr: 'اجمع أحرف كلمة اليوم الكاملة وافتح مكافآت الجواهر والذخيرة!',
  target: 5,
  current: 0,
  rewardGems: 500,
  rewardAmmo: 10,
  isCompleted: false,
  isClaimed: false
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
  sceneryType: 'CYBER_CITY' | 'VOLCANIC_INFERNO' | 'MATRIX_JUNGLE' | 'COSMIC_VOID' | 'FROST_REALM' | 'QUANTUM_VOID' | 'TITAN_REALM' | 'ULTIMATE_PEAK' | 'SOLAR_DESERT' | 'CYBER_ABYSS';
  obstacleColor: string;
  obstacleGlow: string;
  alienColor: string;
  missileColor: string;
  targetWord: string[];
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
    targetWord: ['C', 'Y', 'B', 'E', 'R']
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
    targetWord: ['I', 'N', 'F', 'E', 'R', 'N', 'O']
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
    targetWord: ['M', 'A', 'T', 'R', 'I', 'X']
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
    targetWord: ['G', 'A', 'L', 'A', 'X', 'Y']
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
    targetWord: ['C', 'R', 'Y', 'S', 'T', 'A', 'L']
  },
  {
    level: 6,
    nameAr: "المرحلة 6: الـبـعـد الـكـمـومـي المـظـلـم",
    nameEn: "STAGE 6: QUANTUM VOID ZONE",
    bgColor: "#0f0022",
    fogColor: "#0f0022",
    ambientColor: "#330066",
    directionalColor: "#e000ff",
    pointLightColor: "#00ffff",
    sunTopColor: "#ff88ff",
    sunBottomColor: "#4400cc",
    gridColor: "#aa00ff",
    floorColor: "#1e0040",
    laneColor: "#e000ff",
    sceneryType: "QUANTUM_VOID",
    obstacleColor: "#e000ff",
    obstacleGlow: "#00ffff",
    alienColor: "#f066ff",
    missileColor: "#00ffff",
    targetWord: ['Q', 'U', 'A', 'N', 'T', 'U', 'M']
  },
  {
    level: 7,
    nameAr: "المرحلة 7: عـرش الـعـظـمـاء الأسطوري",
    nameEn: "STAGE 7: REALM OF ANCIENT TITANS",
    bgColor: "#1a1200",
    fogColor: "#1a1200",
    ambientColor: "#4a3500",
    directionalColor: "#ffd700",
    pointLightColor: "#ffaa00",
    sunTopColor: "#ffffff",
    sunBottomColor: "#b8860b",
    gridColor: "#ffd700",
    floorColor: "#2e2100",
    laneColor: "#ffe680",
    sceneryType: "TITAN_REALM",
    obstacleColor: "#ffd700",
    obstacleGlow: "#ffffff",
    alienColor: "#ffec8b",
    missileColor: "#ff9900",
    targetWord: ['T', 'I', 'T', 'A', 'N', 'S']
  },
  {
    level: 8,
    nameAr: "المرحلة 8: الـقـمـة المـطـلـقـة لـلـمـجـرة",
    nameEn: "STAGE 8: ULTIMATE VICTORY PEAK",
    bgColor: "#08001a",
    fogColor: "#08001a",
    ambientColor: "#2a0055",
    directionalColor: "#00ffcc",
    pointLightColor: "#ff0077",
    sunTopColor: "#ffffff",
    sunBottomColor: "#00ffaa",
    gridColor: "#00ffcc",
    floorColor: "#120033",
    laneColor: "#ffffff",
    sceneryType: "ULTIMATE_PEAK",
    obstacleColor: "#00ffcc",
    obstacleGlow: "#ff0077",
    alienColor: "#ffffff",
    missileColor: "#ff00aa",
    targetWord: ['V', 'I', 'C', 'T', 'O', 'R', 'Y']
  },
  {
    level: 9,
    nameAr: "المرحلة 9: واحـة الـشـمـس والـذهـب الـسـيـبـرانـي",
    nameEn: "STAGE 9: SOLAR PUNK GOLDEN DUNES",
    bgColor: "#120c00",
    fogColor: "#181000",
    ambientColor: "#553300",
    directionalColor: "#ffd700",
    pointLightColor: "#00ff99",
    sunTopColor: "#ffffff",
    sunBottomColor: "#ff6600",
    gridColor: "#ffaa00",
    floorColor: "#221400",
    laneColor: "#00ffaa",
    sceneryType: "SOLAR_DESERT",
    obstacleColor: "#ffd700",
    obstacleGlow: "#00ffaa",
    alienColor: "#ffff00",
    missileColor: "#ff6600",
    targetWord: ['S', 'O', 'L', 'A', 'R']
  },
  {
    level: 10,
    nameAr: "المرحلة 10: هـاويـة الـبـلازمـا الـمـتـوهـجـة",
    nameEn: "STAGE 10: CYBER PLASMA NEON ABYSS",
    bgColor: "#0a0014",
    fogColor: "#0d001a",
    ambientColor: "#3d0066",
    directionalColor: "#ff00ea",
    pointLightColor: "#39ff14",
    sunTopColor: "#ff00cc",
    sunBottomColor: "#00ffff",
    gridColor: "#ff00ea",
    floorColor: "#18002e",
    laneColor: "#39ff14",
    sceneryType: "CYBER_ABYSS",
    obstacleColor: "#ff00ea",
    obstacleGlow: "#39ff14",
    alienColor: "#ff00aa",
    missileColor: "#39ff14",
    targetWord: ['A', 'B', 'Y', 'S', 'S']
  }
];

export const getLevelTheme = (level: number): LevelTheme => {
  const index = Math.max(0, (level - 1) % LEVEL_THEMES.length);
  return LEVEL_THEMES[index];
};

export const getLevelTargetWord = (level: number): string[] => {
  return getLevelTheme(level).targetWord;
};

const VIBRANT_PALETTE = ['#2979ff', '#ff1744', '#ffea00', '#00e676', '#ab47bc', '#ff9100', '#00e5ff'];

export const getLetterColor = (index: number): string => {
  return VIBRANT_PALETTE[index % VIBRANT_PALETTE.length];
};

export interface Mission {
  id: string;
  titleAr: string;
  descAr: string;
  target: number;
  current: number;
  rewardGems: number;
  isCompleted: boolean;
  isClaimed: boolean;
  type: 'GEMS' | 'DISTANCE' | 'COMBO' | 'LEVEL' | 'FEVER';
}

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm_gems_50',
    titleAr: 'صائد الجواهر',
    descAr: 'اجمع 50 جوهرة',
    target: 50,
    current: 0,
    rewardGems: 150,
    isCompleted: false,
    isClaimed: false,
    type: 'GEMS'
  },
  {
    id: 'm_dist_500',
    titleAr: 'العداء السريع',
    descAr: 'اقطع مسافة 500 متر',
    target: 500,
    current: 0,
    rewardGems: 200,
    isCompleted: false,
    isClaimed: false,
    type: 'DISTANCE'
  },
  {
    id: 'm_combo_10',
    titleAr: 'سيد الكومبو',
    descAr: 'حقّق كومبو 10x متتالي',
    target: 10,
    current: 0,
    rewardGems: 250,
    isCompleted: false,
    isClaimed: false,
    type: 'COMBO'
  },
  {
    id: 'm_level_2',
    titleAr: 'مستكشف العوالم',
    descAr: 'وصل إلى المرحلة 2',
    target: 2,
    current: 0,
    rewardGems: 300,
    isCompleted: false,
    isClaimed: false,
    type: 'LEVEL'
  },
  {
    id: 'm_fever_1',
    titleAr: 'اشتعل بالحماس!',
    descAr: 'فعّل وضع Fever Mode مرة واحدة',
    target: 1,
    current: 0,
    rewardGems: 350,
    isCompleted: false,
    isClaimed: false,
    type: 'FEVER'
  }
];

