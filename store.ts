/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { create } from 'zustand';
import { GameStatus, RUN_SPEED_BASE, PlayerSkin, getLevelTargetWord } from './types';

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
  lives: 3,
  maxLives: 3,
  speed: 0,
  collectedLetters: [],
  level: 1,
  laneCount: 3,
  gemsCollected: 0,
  distance: 0,
  
  highScore: getStoredNum('gemini_runner_highscore', 0),
  bestDistance: getStoredNum('gemini_runner_best_distance', 0),
  totalGems: getStoredNum('gemini_runner_total_gems', 0),

  hasDoubleJump: false,
  hasImmortality: false,
  isImmortalityActive: false,
  hasMagnet: false,
  isMagnetActive: false,
  hasBlaster: false,
  blasterAmmo: 0,
  hasShieldDrone: false,
  isShieldDroneActive: false,

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
    lives: 3, 
    maxLives: 3,
    speed: RUN_SPEED_BASE,
    collectedLetters: [],
    level: 1,
    laneCount: 3,
    gemsCollected: 0,
    distance: 0,
    hasDoubleJump: false,
    hasImmortality: false,
    isImmortalityActive: false,
    hasMagnet: false,
    isMagnetActive: false,
    hasBlaster: false,
    blasterAmmo: 0,
    hasShieldDrone: false,
    isShieldDroneActive: false
  }),

  restartGame: () => set({ 
    status: GameStatus.PLAYING, 
    score: 0, 
    lives: 3, 
    maxLives: 3,
    speed: RUN_SPEED_BASE,
    collectedLetters: [],
    level: 1,
    laneCount: 3,
    gemsCollected: 0,
    distance: 0,
    hasDoubleJump: false,
    hasImmortality: false,
    isImmortalityActive: false,
    hasMagnet: false,
    isMagnetActive: false,
    hasBlaster: false,
    blasterAmmo: 0,
    hasShieldDrone: false,
    isShieldDroneActive: false
  }),

  takeDamage: () => {
    const { lives, isImmortalityActive, isShieldDroneActive } = get();
    if (isImmortalityActive) return; // No damage if immortal

    // Shield drone absorbs 1 hit!
    if (isShieldDroneActive) {
      set({ isShieldDroneActive: false });
      return;
    }

    if (lives > 1) {
      set({ lives: lives - 1 });
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
  
  collectGem: (value) => set((state) => ({ 
    score: state.score + value, 
    gemsCollected: state.gemsCollected + 1 
  })),

  setDistance: (dist) => {
    set({ distance: dist });
    const { bestDistance } = get();
    if (dist > bestDistance) {
      set({ bestDistance: Math.floor(dist) });
      try { localStorage.setItem('gemini_runner_best_distance', Math.floor(dist).toString()); } catch {}
    }
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

  setStatus: (status) => set({ status }),
}));
