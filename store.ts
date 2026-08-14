/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { create } from 'zustand';
import { 
  GameStatus, 
  RUN_SPEED_BASE, 
  PlayerSkin, 
  GraphicsQuality, 
  getLevelTargetWord, 
  Mission, 
  INITIAL_MISSIONS,
  BossType,
  BOSS_ROSTER,
  TECH_UPGRADES,
  CYBER_BADGES,
  CURRENT_DAILY_CHALLENGE,
  DailyChallenge,
  SKINS_DATA
} from './types';

export interface ActiveBossState {
  active: boolean;
  type: BossType;
  health: number;
  maxHealth: number;
  nameAr: string;
  nameEn: string;
  color: string;
  accentColor: string;
  attackTimer: number;
  phase?: number;
}

export interface GhostFrame {
  x: number;
  y: number;
  z: number;
}

interface GameState {
  status: GameStatus;
  score: number;
  lives: number;
  maxLives: number;
  speed: number;
  collectedLetters: number[]; 
  level: number;
  laneCount: number;
  gemsCollected: number;
  distance: number;
  
  // Graphics Settings (High / Medium / Low)
  graphicsQuality: GraphicsQuality;

  // Combo & Fever Mode System
  comboCount: number;
  comboMultiplier: number;
  feverMeter: number; // 0 to 100
  isFeverMode: boolean;

  // Hero Ultimate Ability System
  ultimateMeter: number; // 0 to 100
  isUltimateActive: boolean;
  ultimateTimeRemaining: number;

  // Cyber Boss Encounter System
  bossState: ActiveBossState | null;
  bossDefeatedCount: number;

  // Warp Zone (Hyper Dimension Speed Drive)
  isWarpActive: boolean;
  warpTimer: number;

  // Tech Lab Tree Upgrades (Levels 0 to 5)
  techUpgrades: Record<string, number>;

  // Badges & Titles
  unlockedBadges: string[];
  activeTitle: string;

  // Daily AI Challenge
  dailyChallenge: DailyChallenge;

  // Ghost Runner (Holographic Racing Ghost)
  bestGhostFrames: GhostFrame[];
  currentRunFrames: GhostFrame[];

  // Daily Missions & Achievements
  missions: Mission[];

  // High Scores & Records
  highScore: number;
  bestDistance: number;
  totalGems: number;
  highestUnlockedLevel: number;
  selectedStartLevel: number;

  // Inventory / Abilities
  hasDoubleJump: boolean;
  hasImmortality: boolean;
  isImmortalityActive: boolean;
  hasMagnet: boolean;
  isMagnetActive: boolean;
  hasBlaster: boolean;
  blasterAmmo: number;
  hasShieldDrone: boolean;
  isShieldDroneActive: boolean;

  // Customization
  activeSkin: PlayerSkin;
  unlockedSkins: PlayerSkin[];
  activeShopTab: 'UPGRADES' | 'SKINS' | 'ACHIEVEMENTS' | 'TECH_LAB' | 'DAILY';

  // Sound & Music Toggles
  isMuted: boolean;
  isMusicPlaying: boolean;

  // Actions
  startGame: (startLvl?: number) => void;
  restartGame: () => void;
  takeDamage: () => void;
  addScore: (amount: number) => void;
  collectGem: (value: number) => void;
  collectLetter: (index: number) => void;
  setStatus: (status: GameStatus) => void;
  setDistance: (dist: number) => void;
  selectStartLevel: (lvl: number) => void;
  
  // Ultimates & Boss
  chargeUltimate: (amount: number) => void;
  activateUltimate: () => void;
  triggerBossEncounter: (type?: BossType) => void;
  damageBoss: (amount: number) => void;
  defeatBoss: () => void;
  activateWarpZone: () => void;

  // Tech Lab & Badges
  buyTechUpgrade: (upgradeId: string) => boolean;
  unlockBadge: (badgeId: string) => void;
  setActiveTitle: (title: string) => void;
  claimDailyChallenge: () => void;
  claimDailyChallengeReward: () => void;

  // Ghost Recording
  recordGhostFrame: (frame: GhostFrame) => void;

  // Shop & Upgrades
  buyItem: (type: string, cost: number) => boolean;
  advanceLevel: () => void;
  openShop: (tab?: 'UPGRADES' | 'SKINS' | 'ACHIEVEMENTS' | 'TECH_LAB' | 'DAILY') => void;
  closeShop: () => void;
  activateImmortality: () => void;
  activateMagnet: () => void;
  useBlasterAmmo: () => boolean;
  buySkin: (skin: PlayerSkin, cost: number) => boolean;
  selectSkin: (skin: PlayerSkin) => void;
  toggleMute: () => void;
  toggleMusic: () => void;
  setGraphicsQuality: (quality: GraphicsQuality) => void;
  claimMissionReward: (missionId: string) => void;
  updateMissionProgress: (type: 'GEMS' | 'DISTANCE' | 'COMBO' | 'LEVEL' | 'FEVER', amount: number) => void;
}

const MAX_LEVEL = 10;

// Helper to safely read localStorage
const getStoredNum = (key: string, fallback: number): number => {
  try {
    const val = localStorage.getItem(key);
    return val ? parseInt(val, 10) : fallback;
  } catch {
    return fallback;
  }
};

const getStoredJSON = <T>(key: string, fallback: T): T => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
};

export const useStore = create<GameState>((set, get) => ({
  status: GameStatus.MENU,
  score: 0,
  lives: 5,
  maxLives: 5,
  speed: 0,
  collectedLetters: [],
  level: 1,
  laneCount: 3,
  gemsCollected: 0,
  distance: 0,
  
  graphicsQuality: (localStorage.getItem('gemini_runner_graphics') as GraphicsQuality) || GraphicsQuality.HIGH,

  comboCount: 0,
  comboMultiplier: 1,
  feverMeter: 0,
  isFeverMode: false,

  // Ultimates
  ultimateMeter: 0,
  isUltimateActive: false,
  ultimateTimeRemaining: 0,

  // Boss state
  bossState: null,
  bossDefeatedCount: getStoredNum('gemini_runner_boss_count', 0),

  // Warp Drive
  isWarpActive: false,
  warpTimer: 0,

  // Tech Lab Upgrades
  techUpgrades: getStoredJSON('gemini_runner_tech_tree', {
    MAGNET_BOOST: 0,
    SHIELD_REGEN: 0,
    BLASTER_SURGE: 0,
    ULTIMATE_MASTERY: 0,
    GEM_HARVESTER: 0
  }),

  // Badges & Titles
  unlockedBadges: getStoredJSON('gemini_runner_badges', []),
  activeTitle: localStorage.getItem('gemini_runner_title') || '⚡ عداء النيون',

  // Daily Challenge
  dailyChallenge: getStoredJSON('gemini_runner_daily', CURRENT_DAILY_CHALLENGE),

  // Ghost Runner
  bestGhostFrames: getStoredJSON('gemini_runner_best_ghost', []),
  currentRunFrames: [],

  missions: getStoredJSON('gemini_runner_missions', INITIAL_MISSIONS),

  highScore: getStoredNum('gemini_runner_highscore', 0),
  bestDistance: getStoredNum('gemini_runner_best_distance', 0),
  totalGems: getStoredNum('gemini_runner_total_gems', 0),
  highestUnlockedLevel: getStoredNum('gemini_runner_max_level', 1),
  selectedStartLevel: getStoredNum('gemini_runner_start_level', 1),

  hasDoubleJump: true,
  hasImmortality: false,
  isImmortalityActive: false,
  hasMagnet: false,
  isMagnetActive: false,
  hasBlaster: true,
  blasterAmmo: 5,
  hasShieldDrone: true,
  isShieldDroneActive: true,

  activeSkin: (localStorage.getItem('gemini_runner_skin') as PlayerSkin) || PlayerSkin.ROBLOX_CLASSIC,
  unlockedSkins: getStoredJSON('gemini_runner_skins', [PlayerSkin.ROBLOX_CLASSIC]),
  activeShopTab: 'UPGRADES',

  openShop: (tab: 'UPGRADES' | 'SKINS' | 'ACHIEVEMENTS' | 'TECH_LAB' | 'DAILY' = 'UPGRADES') => set({ status: GameStatus.SHOP, activeShopTab: tab }),
  closeShop: () => set({ status: GameStatus.PLAYING }),

  isMuted: false,
  isMusicPlaying: true,

  selectStartLevel: (lvl) => {
    const maxL = get().highestUnlockedLevel;
    const validL = Math.max(1, Math.min(lvl, maxL));
    set({ selectedStartLevel: validL });
    try { localStorage.setItem('gemini_runner_start_level', validL.toString()); } catch {}
  },

  chargeUltimate: (amount) => {
    const { ultimateMeter, isUltimateActive, techUpgrades } = get();
    if (isUltimateActive) return;
    const masteryLvl = techUpgrades.ULTIMATE_MASTERY || 0;
    const boostMult = 1 + masteryLvl * 0.2;
    const newMeter = Math.min(100, ultimateMeter + amount * boostMult);
    set({ ultimateMeter: newMeter });
  },

  activateUltimate: () => {
    const { ultimateMeter, isUltimateActive, activeSkin } = get();
    if (ultimateMeter < 100 || isUltimateActive) return;

    const skinData = SKINS_DATA[activeSkin] || SKINS_DATA[PlayerSkin.ROBLOX_CLASSIC];
    const duration = skinData.ultimate.duration;

    set({
      isUltimateActive: true,
      ultimateMeter: 0,
      ultimateTimeRemaining: duration,
      isImmortalityActive: true,
      isMagnetActive: true
    });

    window.dispatchEvent(new CustomEvent('ultimate-activated', {
      detail: { skinData }
    }));

    // Timer countdown
    const interval = setInterval(() => {
      const cur = get().ultimateTimeRemaining;
      if (cur <= 1) {
        clearInterval(interval);
        set({ 
          isUltimateActive: false, 
          ultimateTimeRemaining: 0,
          isImmortalityActive: false,
          isMagnetActive: false
        });
      } else {
        set({ ultimateTimeRemaining: cur - 1 });
      }
    }, 1000);
  },

  triggerBossEncounter: (customType) => {
    const currentLvl = get().level;
    let chosenType = customType || BossType.CYBER_TITAN_CORE;
    if (!customType) {
      if (currentLvl >= 7) chosenType = BossType.QUANTUM_OVERLORD;
      else if (currentLvl >= 4) chosenType = BossType.PLASMA_DRAGON;
    }

    const bossInfo = BOSS_ROSTER[chosenType];
    set({
      bossState: {
        active: true,
        type: chosenType,
        health: bossInfo.maxHealth,
        maxHealth: bossInfo.maxHealth,
        nameAr: bossInfo.nameAr,
        nameEn: bossInfo.nameEn,
        color: bossInfo.color,
        accentColor: bossInfo.accentColor,
        attackTimer: 0,
        phase: 1
      }
    });

    window.dispatchEvent(new CustomEvent('boss-spawned', { detail: { bossInfo } }));
  },

  damageBoss: (amount) => {
    const { bossState } = get();
    if (!bossState || !bossState.active) return;
    const nextHealth = Math.max(0, bossState.health - amount);

    if (nextHealth <= 0) {
      get().defeatBoss();
    } else {
      set({
        bossState: {
          ...bossState,
          health: nextHealth,
          phase: nextHealth <= bossState.maxHealth / 2 ? 2 : 1
        }
      });
    }
  },

  defeatBoss: () => {
    const { bossState, score, gemsCollected, totalGems, bossDefeatedCount } = get();
    if (!bossState) return;

    const bossInfo = BOSS_ROSTER[bossState.type];
    const rewardScore = bossInfo.rewardScore;
    const rewardGems = bossInfo.rewardGems;
    const newBossCount = bossDefeatedCount + 1;

    try {
      localStorage.setItem('gemini_runner_boss_count', newBossCount.toString());
    } catch {}

    set({
      bossState: null,
      bossDefeatedCount: newBossCount,
      score: score + rewardScore,
      gemsCollected: gemsCollected + rewardGems,
      totalGems: totalGems + rewardGems
    });

    get().unlockBadge('BADGE_BOSS_SLAYER');
    window.dispatchEvent(new CustomEvent('boss-defeated', { detail: { bossInfo, rewardScore, rewardGems } }));
    
    // Trigger Warp Portal reward!
    setTimeout(() => {
      get().activateWarpZone();
    }, 1500);
  },

  activateWarpZone: () => {
    set({ isWarpActive: true, warpTimer: 8, isImmortalityActive: true, isMagnetActive: true });
    get().unlockBadge('BADGE_WARP_EXPLORER');
    
    const interval = setInterval(() => {
      const cur = get().warpTimer;
      if (cur <= 1) {
        clearInterval(interval);
        set({ isWarpActive: false, warpTimer: 0, isImmortalityActive: false, isMagnetActive: false });
      } else {
        set({ warpTimer: cur - 1 });
      }
    }, 1000);
  },

  buyTechUpgrade: (upgradeId: string) => {
    const { techUpgrades, score } = get();
    const upgrade = TECH_UPGRADES.find(u => u.id === upgradeId);
    if (!upgrade) return false;

    const currentLvl = techUpgrades[upgradeId] || 0;
    if (currentLvl >= upgrade.maxLevel) return false;

    const cost = Math.round(upgrade.baseCost * Math.pow(upgrade.costMultiplier, currentLvl));
    if (score < cost) return false;

    const nextUpgrades = {
      ...techUpgrades,
      [upgradeId]: currentLvl + 1
    };

    set({
      score: score - cost,
      techUpgrades: nextUpgrades
    });

    try {
      localStorage.setItem('gemini_runner_tech_tree', JSON.stringify(nextUpgrades));
    } catch {}

    const totalUpgraded = Object.values(nextUpgrades).reduce((a, b) => a + b, 0);
    if (totalUpgraded >= 5) {
      get().unlockBadge('BADGE_TECH_GENIUS');
    }

    return true;
  },

  unlockBadge: (badgeId: string) => {
    const { unlockedBadges } = get();
    if (!unlockedBadges.includes(badgeId)) {
      const nextBadges = [...unlockedBadges, badgeId];
      set({ unlockedBadges: nextBadges });
      try {
        localStorage.setItem('gemini_runner_badges', JSON.stringify(nextBadges));
      } catch {}

      const badge = CYBER_BADGES.find(b => b.id === badgeId);
      if (badge) {
        window.dispatchEvent(new CustomEvent('badge-unlocked', { detail: { badge } }));
      }
    }
  },

  setActiveTitle: (title: string) => {
    set({ activeTitle: title });
    try {
      localStorage.setItem('gemini_runner_title', title);
    } catch {}
  },

  claimDailyChallenge: () => {
    const { dailyChallenge, score, totalGems, blasterAmmo } = get();
    if (dailyChallenge.isCompleted) return;

    const updated: DailyChallenge = {
      ...dailyChallenge,
      isCompleted: true
    };

    set({
      dailyChallenge: updated,
      score: score + dailyChallenge.rewardGems,
      totalGems: totalGems + dailyChallenge.rewardGems,
      blasterAmmo: blasterAmmo + dailyChallenge.rewardAmmo
    });

    try {
      localStorage.setItem('gemini_runner_daily', JSON.stringify(updated));
    } catch {}
  },

  claimDailyChallengeReward: () => {
    get().claimDailyChallenge();
  },

  recordGhostFrame: (frame: GhostFrame) => {
    const { currentRunFrames } = get();
    // Record every 10th frame to keep memory small
    if (currentRunFrames.length < 1500) {
      currentRunFrames.push(frame);
    }
  },

  startGame: (startLvlParam) => {
    const targetLvl = startLvlParam || get().selectedStartLevel || 1;
    const startSpeed = RUN_SPEED_BASE + (targetLvl - 1) * (RUN_SPEED_BASE * 0.35);
    const startLanes = Math.min(3 + (targetLvl - 1) * 2, 9);
    const { techUpgrades } = get();
    
    // Tech upgrades applied
    const extraAmmo = (techUpgrades.BLASTER_SURGE || 0) * 3;

    set({ 
      status: GameStatus.PLAYING, 
      score: 0, 
      lives: 5, 
      maxLives: 5,
      speed: startSpeed,
      collectedLetters: [],
      level: targetLvl,
      laneCount: startLanes,
      gemsCollected: 0,
      distance: 0,
      comboCount: 0,
      comboMultiplier: 1,
      feverMeter: 0,
      isFeverMode: false,
      ultimateMeter: 0,
      isUltimateActive: false,
      ultimateTimeRemaining: 0,
      bossState: null,
      isWarpActive: false,
      warpTimer: 0,
      currentRunFrames: [],
      hasDoubleJump: true,
      hasImmortality: false,
      isImmortalityActive: false,
      hasMagnet: false,
      isMagnetActive: false,
      hasBlaster: true,
      blasterAmmo: 5 + extraAmmo,
      hasShieldDrone: true,
      isShieldDroneActive: true
    });
  },

  restartGame: () => {
    const targetLvl = get().level || get().selectedStartLevel || 1;
    const startSpeed = RUN_SPEED_BASE + (targetLvl - 1) * (RUN_SPEED_BASE * 0.35);
    const startLanes = Math.min(3 + (targetLvl - 1) * 2, 9);
    const { techUpgrades } = get();
    const extraAmmo = (techUpgrades.BLASTER_SURGE || 0) * 3;

    set({ 
      status: GameStatus.PLAYING, 
      score: 0, 
      lives: 5, 
      maxLives: 5,
      speed: startSpeed,
      collectedLetters: [],
      level: targetLvl,
      laneCount: startLanes,
      gemsCollected: 0,
      distance: 0,
      comboCount: 0,
      comboMultiplier: 1,
      feverMeter: 0,
      isFeverMode: false,
      ultimateMeter: 0,
      isUltimateActive: false,
      ultimateTimeRemaining: 0,
      bossState: null,
      isWarpActive: false,
      warpTimer: 0,
      currentRunFrames: [],
      hasDoubleJump: true,
      hasImmortality: false,
      isImmortalityActive: false,
      hasMagnet: false,
      isMagnetActive: false,
      hasBlaster: true,
      blasterAmmo: 5 + extraAmmo,
      hasShieldDrone: true,
      isShieldDroneActive: true
    });
  },

  takeDamage: () => {
    const { lives, isImmortalityActive, isShieldDroneActive, feverMeter, isUltimateActive } = get();
    if (isImmortalityActive || isUltimateActive) return; // No damage if immortal or ultimate

    // Shield drone absorbs 1 hit!
    if (isShieldDroneActive) {
      set({ 
        isShieldDroneActive: false,
        comboCount: 0,
        comboMultiplier: 1,
        feverMeter: Math.max(0, feverMeter - 30)
      });
      return;
    }

    if (lives > 1) {
      set({ 
        lives: lives - 1,
        comboCount: 0,
        comboMultiplier: 1,
        feverMeter: Math.max(0, feverMeter - 50),
        isFeverMode: false
      });
    } else {
      const finalScore = get().score;
      const finalDistance = Math.floor(get().distance);
      const { highScore, bestDistance, totalGems, gemsCollected, currentRunFrames, bestGhostFrames } = get();

      const newHigh = Math.max(highScore, finalScore);
      const newBestDist = Math.max(bestDistance, finalDistance);
      const newTotalGems = totalGems + gemsCollected;

      let nextGhost = bestGhostFrames;
      if (finalDistance > bestDistance && currentRunFrames.length > 0) {
        nextGhost = [...currentRunFrames];
        try {
          localStorage.setItem('gemini_runner_best_ghost', JSON.stringify(nextGhost));
        } catch {}
      }

      try {
        localStorage.setItem('gemini_runner_highscore', newHigh.toString());
        localStorage.setItem('gemini_runner_best_distance', newBestDist.toString());
        localStorage.setItem('gemini_runner_total_gems', newTotalGems.toString());
      } catch {}

      set({ 
        lives: 0, 
        status: GameStatus.GAME_OVER, 
        speed: 0,
        highScore: newHigh,
        bestDistance: newBestDist,
        totalGems: newTotalGems,
        bestGhostFrames: nextGhost
      });
    }
  },

  addScore: (amount) => set((state) => ({ score: state.score + amount })),
  
  collectGem: (value) => {
    const state = get();
    const newCombo = state.comboCount + 1;
    let baseMult = 1;
    if (newCombo >= 20) baseMult = 5;
    else if (newCombo >= 12) baseMult = 3;
    else if (newCombo >= 5) baseMult = 2;

    const mult = state.isFeverMode ? baseMult * 2 : baseMult;
    const harvesterLvl = state.techUpgrades.GEM_HARVESTER || 0;
    const harvesterBonus = 1 + harvesterLvl * 0.25;
    const addedScore = Math.round(value * mult * harvesterBonus);

    let newFeverMeter = state.feverMeter + (state.isFeverMode ? 0 : 8);
    let triggerFever = false;
    if (newFeverMeter >= 100 && !state.isFeverMode) {
      newFeverMeter = 100;
      triggerFever = true;
    }

    if (triggerFever) {
      setTimeout(() => {
        useStore.setState({ isFeverMode: false, feverMeter: 0, isMagnetActive: false });
      }, 7000);
      get().updateMissionProgress('FEVER', 1);
    }

    // Charge Ultimate
    get().chargeUltimate(3);

    // Badges check
    if (newCombo >= 25) {
      get().unlockBadge('BADGE_COMBO_MASTER');
    }

    set({
      score: state.score + addedScore,
      gemsCollected: state.gemsCollected + 1,
      comboCount: newCombo,
      comboMultiplier: mult,
      feverMeter: newFeverMeter,
      isFeverMode: state.isFeverMode || triggerFever,
      isMagnetActive: state.isMagnetActive || triggerFever
    });

    get().updateMissionProgress('GEMS', 1);
    get().updateMissionProgress('COMBO', newCombo);
  },

  setDistance: (dist) => {
    set({ distance: dist });
    const { bestDistance } = get();
    if (dist > bestDistance) {
      set({ bestDistance: Math.floor(dist) });
      try { localStorage.setItem('gemini_runner_best_distance', Math.floor(dist).toString()); } catch {}
    }
    if (dist >= 1500) {
      get().unlockBadge('BADGE_SPEED_DEMON');
    }
    get().updateMissionProgress('DISTANCE', Math.floor(dist));
  },

  collectLetter: (index) => {
    const { collectedLetters, level, speed } = get();
    const targetWord = getLevelTargetWord(level);
    
    if (!collectedLetters.includes(index)) {
      const newLetters = [...collectedLetters, index];
      const speedIncrease = RUN_SPEED_BASE * 0.10;
      const nextSpeed = speed + speedIncrease;

      // Charge ultimate on letter pickup
      get().chargeUltimate(15);

      set({ 
        collectedLetters: newLetters,
        speed: nextSpeed
      });

      if (newLetters.length === targetWord.length) {
        // Trigger Boss encounter every 3 levels or on level completion
        if (level % 2 === 0 && !get().bossState) {
          get().triggerBossEncounter();
        }

        if (level < MAX_LEVEL) {
            get().advanceLevel();
        } else {
            const finalScore = get().score + 10000;
            const { highScore } = get();
            const newHigh = Math.max(highScore, finalScore);
            try { localStorage.setItem('gemini_runner_highscore', newHigh.toString()); } catch {}

            set({
                status: GameStatus.VICTORY,
                score: finalScore,
                highScore: newHigh
            });
        }
      }
    }
  },

  advanceLevel: () => {
      const { level, laneCount, speed, highestUnlockedLevel } = get();
      const nextLevel = Math.min(level + 1, MAX_LEVEL);
      const newHighest = Math.max(highestUnlockedLevel, nextLevel);
      const speedIncrease = RUN_SPEED_BASE * 0.35;
      const newSpeed = speed + speedIncrease;

      try {
        localStorage.setItem('gemini_runner_max_level', newHighest.toString());
        localStorage.setItem('gemini_runner_start_level', nextLevel.toString());
      } catch {}

      set({
          level: nextLevel,
          highestUnlockedLevel: newHighest,
          selectedStartLevel: nextLevel,
          laneCount: Math.min(laneCount + 2, 9),
          status: GameStatus.PLAYING,
          speed: newSpeed,
          collectedLetters: []
      });
      get().updateMissionProgress('LEVEL', nextLevel);
  },

  buyItem: (type, cost) => {
      const { score, maxLives, lives, blasterAmmo, techUpgrades } = get();
      
      if (score >= cost) {
          set({ score: score - cost });
          
          switch (type) {
              case 'DOUBLE_JUMP':
                  set({ hasDoubleJump: true });
                  break;
              case 'MAX_LIFE':
                  set({ maxLives: maxLives + 1, lives: lives + 1 });
                  break;
              case 'HEAL':
                  set({ lives: Math.min(lives + 1, maxLives) });
                  break;
              case 'IMMORTAL':
                  set({ hasImmortality: true });
                  break;
              case 'MAGNET': {
                  const magBonus = (techUpgrades.MAGNET_BOOST || 0) * 3000;
                  set({ hasMagnet: true, isMagnetActive: true });
                  setTimeout(() => {
                    set({ isMagnetActive: false });
                  }, 12000 + magBonus);
                  break;
              }
              case 'BLASTER':
                  set({ hasBlaster: true, blasterAmmo: blasterAmmo + 5 });
                  break;
              case 'SHIELD_DRONE':
                  set({ hasShieldDrone: true, isShieldDroneActive: true });
                  break;
          }
          return true;
      }
      return false;
  },

  activateImmortality: () => {
      const { hasImmortality, isImmortalityActive } = get();
      if (hasImmortality && !isImmortalityActive) {
          set({ isImmortalityActive: true });
          setTimeout(() => {
              set({ isImmortalityActive: false });
          }, 5000);
      }
  },

  activateMagnet: () => {
    const { hasMagnet, isMagnetActive, techUpgrades } = get();
    if (hasMagnet && !isMagnetActive) {
      const magBonus = (techUpgrades.MAGNET_BOOST || 0) * 3000;
      set({ isMagnetActive: true });
      setTimeout(() => {
        set({ isMagnetActive: false });
      }, 10000 + magBonus);
    }
  },

  useBlasterAmmo: () => {
    const { blasterAmmo } = get();
    if (blasterAmmo > 0) {
      set({ blasterAmmo: blasterAmmo - 1 });
      return true;
    }
    return false;
  },

  buySkin: (skin, cost) => {
    const { score, unlockedSkins } = get();
    if (!unlockedSkins.includes(skin) && score >= cost) {
      const newUnlocked = [...unlockedSkins, skin];
      set({ 
        score: score - cost, 
        unlockedSkins: newUnlocked,
        activeSkin: skin
      });
      try {
        localStorage.setItem('gemini_runner_skins', JSON.stringify(newUnlocked));
        localStorage.setItem('gemini_runner_skin', skin);
      } catch {}
      return true;
    }
    return false;
  },

  selectSkin: (skin) => {
    const { unlockedSkins } = get();
    if (unlockedSkins.includes(skin)) {
      set({ activeSkin: skin });
      try { localStorage.setItem('gemini_runner_skin', skin); } catch {}
    }
  },

  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
  toggleMusic: () => set((s) => ({ isMusicPlaying: !s.isMusicPlaying })),
  setGraphicsQuality: (quality: GraphicsQuality) => {
    set({ graphicsQuality: quality });
    try { localStorage.setItem('gemini_runner_graphics', quality); } catch {}
  },

  updateMissionProgress: (type, amount) => {
    const { missions } = get();
    let updated = false;
    const newMissions = missions.map((m) => {
      if (m.type === type && !m.isCompleted) {
        const nextVal = Math.min(m.target, m.current + amount);
        if (nextVal !== m.current) {
          updated = true;
          return {
            ...m,
            current: nextVal,
            isCompleted: nextVal >= m.target
          };
        }
      }
      return m;
    });

    if (updated) {
      set({ missions: newMissions });
      try { localStorage.setItem('gemini_runner_missions', JSON.stringify(newMissions)); } catch {}
    }
  },

  claimMissionReward: (missionId) => {
    const { missions, score, totalGems } = get();
    const targetMission = missions.find(m => m.id === missionId);
    if (targetMission && targetMission.isCompleted && !targetMission.isClaimed) {
      const reward = targetMission.rewardGems;
      const updatedMissions = missions.map(m => m.id === missionId ? { ...m, isClaimed: true } : m);
      set({
        score: score + reward,
        totalGems: totalGems + reward,
        missions: updatedMissions
      });
      try { localStorage.setItem('gemini_runner_missions', JSON.stringify(updatedMissions)); } catch {}
    }
  },

  setStatus: (status) => set({ status }),
}));
