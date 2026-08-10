/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { create } from 'zustand';
import { GameStatus, RUN_SPEED_BASE, PlayerSkin, GraphicsQuality, getLevelTargetWord, Mission, INITIAL_MISSIONS } from './types';

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

  // Daily Missions & Achievements
  missions: Mission[];

  // High Scores & Records
  highScore: number;
  bestDistance: number;
  totalGems: number;

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
  activeShopTab: 'UPGRADES' | 'SKINS' | 'ACHIEVEMENTS';

  // Sound & Music Toggles
  isMuted: boolean;
  isMusicPlaying: boolean;

  // Actions
  startGame: () => void;
  restartGame: () => void;
  takeDamage: () => void;
  addScore: (amount: number) => void;
  collectGem: (value: number) => void;
  collectLetter: (index: number) => void;
  setStatus: (status: GameStatus) => void;
  setDistance: (dist: number) => void;
  
  // Shop & Upgrades
  buyItem: (type: string, cost: number) => boolean;
  advanceLevel: () => void;
  openShop: (tab?: 'UPGRADES' | 'SKINS' | 'ACHIEVEMENTS') => void;
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

const MAX_LEVEL = 8;

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

  missions: getStoredJSON('gemini_runner_missions', INITIAL_MISSIONS),

  highScore: getStoredNum('gemini_runner_highscore', 0),
  bestDistance: getStoredNum('gemini_runner_best_distance', 0),
  totalGems: getStoredNum('gemini_runner_total_gems', 0),

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

  openShop: (tab: 'UPGRADES' | 'SKINS' | 'ACHIEVEMENTS' = 'UPGRADES') => set({ status: GameStatus.SHOP, activeShopTab: tab }),
  closeShop: () => set({ status: GameStatus.PLAYING }),

  isMuted: false,
  isMusicPlaying: true,

  startGame: () => set({ 
    status: GameStatus.PLAYING, 
    score: 0, 
    lives: 5, 
    maxLives: 5,
    speed: RUN_SPEED_BASE,
    collectedLetters: [],
    level: 1,
    laneCount: 3,
    gemsCollected: 0,
    distance: 0,
    comboCount: 0,
    comboMultiplier: 1,
    feverMeter: 0,
    isFeverMode: false,
    hasDoubleJump: true,
    hasImmortality: false,
    isImmortalityActive: false,
    hasMagnet: false,
    isMagnetActive: false,
    hasBlaster: true,
    blasterAmmo: 5,
    hasShieldDrone: true,
    isShieldDroneActive: true
  }),

  restartGame: () => set({ 
    status: GameStatus.PLAYING, 
    score: 0, 
    lives: 5, 
    maxLives: 5,
    speed: RUN_SPEED_BASE,
    collectedLetters: [],
    level: 1,
    laneCount: 3,
    gemsCollected: 0,
    distance: 0,
    comboCount: 0,
    comboMultiplier: 1,
    feverMeter: 0,
    isFeverMode: false,
    hasDoubleJump: true,
    hasImmortality: false,
    isImmortalityActive: false,
    hasMagnet: false,
    isMagnetActive: false,
    hasBlaster: true,
    blasterAmmo: 5,
    hasShieldDrone: true,
    isShieldDroneActive: true
  }),

  takeDamage: () => {
    const { lives, isImmortalityActive, isShieldDroneActive, feverMeter } = get();
    if (isImmortalityActive) return; // No damage if immortal

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
      const { highScore, bestDistance, totalGems, gemsCollected } = get();

      const newHigh = Math.max(highScore, finalScore);
      const newBestDist = Math.max(bestDistance, finalDistance);
      const newTotalGems = totalGems + gemsCollected;

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
        totalGems: newTotalGems
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
    const addedScore = value * mult;

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
    get().updateMissionProgress('DISTANCE', Math.floor(dist));
  },

  collectLetter: (index) => {
    const { collectedLetters, level, speed } = get();
    const targetWord = getLevelTargetWord(level);
    
    if (!collectedLetters.includes(index)) {
      const newLetters = [...collectedLetters, index];
      const speedIncrease = RUN_SPEED_BASE * 0.10;
      const nextSpeed = speed + speedIncrease;

      set({ 
        collectedLetters: newLetters,
        speed: nextSpeed
      });

      if (newLetters.length === targetWord.length) {
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
      const { level, laneCount, speed } = get();
      const nextLevel = level + 1;
      const speedIncrease = RUN_SPEED_BASE * 0.40;
      const newSpeed = speed + speedIncrease;

      set({
          level: nextLevel,
          laneCount: Math.min(laneCount + 2, 9),
          status: GameStatus.PLAYING,
          speed: newSpeed,
          collectedLetters: []
      });
      get().updateMissionProgress('LEVEL', nextLevel);
  },

  buyItem: (type, cost) => {
      const { score, maxLives, lives, blasterAmmo } = get();
      
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
              case 'MAGNET':
                  set({ hasMagnet: true, isMagnetActive: true });
                  // Active for 12 seconds
                  setTimeout(() => {
                    set({ isMagnetActive: false });
                  }, 12000);
                  break;
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
    const { hasMagnet, isMagnetActive } = get();
    if (hasMagnet && !isMagnetActive) {
      set({ isMagnetActive: true });
      setTimeout(() => {
        set({ isMagnetActive: false });
      }, 10000);
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
