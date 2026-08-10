/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { 
  Heart, Zap, Trophy, MapPin, Diamond, Rocket, ArrowUpCircle, 
  Shield, Activity, PlusCircle, Play, Magnet, Crosshair, 
  Volume2, VolumeX, Music, Sparkles, ChevronLeft, ChevronRight, ArrowUp, Home, RotateCcw,
  Gauge, Sliders, Cpu, Globe, Pause
} from 'lucide-react';
import { useStore } from '../../store';
import { GameStatus, GEMINI_COLORS, ShopItem, RUN_SPEED_BASE, PlayerSkin, SKINS_DATA, getLevelTheme, getLevelTargetWord, getLetterColor, GraphicsQuality } from '../../types';
import { audio } from '../System/Audio';

// Shop Items List
const SHOP_ITEMS: ShopItem[] = [
    {
        id: 'DOUBLE_JUMP',
        name: 'DOUBLE JUMP',
        description: 'Jump again in mid-air. Essential for high obstacles.',
        cost: 1000,
        icon: ArrowUpCircle,
        oneTime: true
    },
    {
        id: 'MAX_LIFE',
        name: 'MAX LIFE UP',
        description: 'Permanently adds a heart slot and heals you.',
        cost: 1500,
        icon: Activity
    },
    {
        id: 'HEAL',
        name: 'REPAIR KIT',
        description: 'Restores 1 Life point instantly.',
        cost: 1000,
        icon: PlusCircle
    },
    {
        id: 'IMMORTAL',
        name: 'IMMORTALITY',
        description: 'Unlock Ability: Press Space/Tap to be invincible for 5s.',
        cost: 3000,
        icon: Shield,
        oneTime: true
    },
    {
        id: 'MAGNET',
        name: 'CYBER MAGNET',
        description: 'Attracts all Gems and Letters to you for 12 seconds.',
        cost: 800,
        icon: Magnet
    },
    {
        id: 'BLASTER',
        name: 'LASER BLASTER',
        description: 'Grants +5 Laser shots. Press F/Tap Fire to blast obstacles.',
        cost: 1200,
        icon: Crosshair
    },
    {
        id: 'SHIELD_DRONE',
        name: 'SHIELD DRONE',
        description: 'Floating drone absorbs 1 collision hit for you.',
        cost: 2000,
        icon: Shield
    }
];

const ShopScreen: React.FC = () => {
    const { 
      score, buyItem, closeShop, hasDoubleJump, hasImmortality, 
      unlockedSkins, activeSkin, selectSkin, buySkin, totalGems, activeShopTab,
      missions, claimMissionReward
    } = useStore();
    
    const [tab, setTab] = useState<'UPGRADES' | 'SKINS' | 'ACHIEVEMENTS'>(activeShopTab || 'UPGRADES');

    useEffect(() => {
        if (activeShopTab) {
            setTab(activeShopTab);
        }
    }, [activeShopTab]);

    const hasClaimableMissions = missions.some(m => m.isCompleted && !m.isClaimed);

    const [claimedAchievements, setClaimedAchievements] = useState<string[]>(() => {
        try {
            const val = localStorage.getItem('gemini_runner_achievements');
            return val ? JSON.parse(val) : [];
        } catch {
            return [];
        }
    });

    const achievementsList = [
        { id: 'DIST_500', name: 'مبتدئ الفضاء 🚀', desc: 'قطع مسافة 500 متر في الجولة', reward: 500, isMet: totalGems >= 0 },
        { id: 'GEMS_100', name: 'جامع الجواهر 💎', desc: 'جمع 100 جوهرة إجمالاً', reward: 1000, isMet: totalGems >= 100 },
        { id: 'LEVEL_3', name: 'مستكشف العوالم 🌌', desc: 'الوصول إلى المرحلة الثالثة', reward: 1500, isMet: true },
        { id: 'SCORE_10K', name: 'البطل السيبراني 🏆', desc: 'تحقيق 5,000 نقطة أو أكثر', reward: 2000, isMet: score >= 5000 }
    ];

    const claimReward = (id: string, reward: number) => {
        if (!claimedAchievements.includes(id)) {
            useStore.setState(state => ({ score: state.score + reward }));
            const newClaimed = [...claimedAchievements, id];
            setClaimedAchievements(newClaimed);
            try { localStorage.setItem('gemini_runner_achievements', JSON.stringify(newClaimed)); } catch {}
        }
    };
    const [items, setItems] = useState<ShopItem[]>([]);

    useEffect(() => {
        let pool = SHOP_ITEMS.filter(item => {
            if (item.id === 'DOUBLE_JUMP' && hasDoubleJump) return false;
            if (item.id === 'IMMORTAL' && hasImmortality) return false;
            return true;
        });

        pool = pool.sort(() => 0.5 - Math.random());
        setItems(pool.slice(0, 4));
    }, [hasDoubleJump, hasImmortality]);

    return (
        <div className="absolute inset-0 bg-black/90 z-[100] text-white pointer-events-auto backdrop-blur-md overflow-y-auto">
             <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
                 
                 {/* Top Navigation Bar in Shop */}
                 <div className="w-full max-w-4xl flex justify-between items-center mb-4 dir-rtl">
                     <button 
                        onClick={() => useStore.setState({ status: GameStatus.MENU })}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-cyan-300 font-bold text-xs sm:text-sm rounded-xl border border-cyan-500/40 hover:border-cyan-300 transition-all shadow-[0_0_10px_rgba(0,255,255,0.2)]"
                     >
                        <Home className="w-4 h-4" />
                        <span>العودة للقائمة الرئيسية</span>
                     </button>
                     <div className="text-xs font-mono text-gray-400">CYBER SHOP</div>
                 </div>

                 <h2 className="text-3xl md:text-5xl font-black text-cyan-400 mb-2 font-cyber tracking-widest text-center drop-shadow-[0_0_15px_#00ffff]">متجر الشخصيات والتطويرات</h2>
                 
                 <div className="flex items-center text-yellow-400 mb-6 gap-2">
                     <span className="text-sm md:text-base tracking-wider font-bold">الجواهر المتوفرة:</span>
                     <span className="text-xl md:text-2xl font-bold font-mono">{score.toLocaleString()} 💎</span>
                 </div>

                 {/* Shop Tabs */}
                 <div className="flex space-x-2 sm:space-x-3 mb-6 bg-gray-900/80 p-1.5 rounded-xl border border-gray-700 dir-rtl">
                     <button 
                        onClick={() => setTab('UPGRADES')}
                        className={`px-4 py-2 rounded-lg font-bold text-xs md:text-base transition-all ${tab === 'UPGRADES' ? 'bg-cyan-500 text-black shadow-[0_0_10px_#00ffff]' : 'text-gray-400 hover:text-white'}`}
                     >
                        المقويات
                     </button>
                     <button 
                        onClick={() => setTab('SKINS')}
                        className={`px-4 py-2 rounded-lg font-bold text-xs md:text-base transition-all ${tab === 'SKINS' ? 'bg-pink-500 text-black shadow-[0_0_10px_#ff0077]' : 'text-gray-400 hover:text-white'}`}
                     >
                        الشخصيات
                     </button>
                     <button 
                        onClick={() => setTab('ACHIEVEMENTS')}
                        className={`relative px-4 py-2 rounded-lg font-bold text-xs md:text-base transition-all ${tab === 'ACHIEVEMENTS' ? 'bg-amber-400 text-black shadow-[0_0_10px_#ffcc00]' : 'text-gray-400 hover:text-white'}`}
                     >
                        <span>المهمات والإنجازات 🏆</span>
                        {hasClaimableMissions && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                        )}
                     </button>
                 </div>

                 {tab === 'UPGRADES' ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl w-full mb-8">
                       {items.map(item => {
                           const Icon = item.icon;
                           const canAfford = score >= item.cost;
                           return (
                               <div key={item.id} className="bg-gray-900/80 border border-gray-700 p-4 rounded-xl flex flex-col items-center text-center hover:border-cyan-500 transition-colors shadow-lg">
                                   <div className="bg-gray-800 p-3 rounded-full mb-3">
                                       <Icon className="w-6 h-6 text-cyan-400" />
                                   </div>
                                   <h3 className="text-base font-bold mb-1">{item.name}</h3>
                                   <p className="text-gray-400 text-xs mb-4 h-12 flex items-center justify-center">{item.description}</p>
                                   <button 
                                      onClick={() => buyItem(item.id as any, item.cost)}
                                      disabled={!canAfford}
                                      className={`px-4 py-2 rounded font-bold w-full text-xs md:text-sm transition-all ${canAfford ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 shadow-[0_0_10px_rgba(0,255,255,0.3)]' : 'bg-gray-700 cursor-not-allowed opacity-50'}`}
                                   >
                                       {item.cost} GEMS
                                   </button>
                               </div>
                           );
                       })}
                   </div>
                 ) : tab === 'SKINS' ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl w-full mb-8">
                      {(Object.keys(SKINS_DATA) as PlayerSkin[]).map((skinKey) => {
                          const skin = SKINS_DATA[skinKey];
                          const isUnlocked = unlockedSkins.includes(skinKey);
                          const isActive = activeSkin === skinKey;
                          const canAfford = score >= skin.cost;

                          return (
                            <div 
                              key={skinKey} 
                              className={`p-5 rounded-xl border flex flex-col items-center text-center transition-all bg-gray-900/80 ${isActive ? 'border-yellow-400 shadow-[0_0_15px_rgba(255,215,0,0.4)]' : 'border-gray-700 hover:border-gray-500'}`}
                            >
                                <div 
                                  className="w-12 h-12 rounded-full mb-3 border-2 flex items-center justify-center"
                                  style={{ backgroundColor: skin.color, borderColor: skin.glowColor }}
                                >
                                    <Sparkles className="w-6 h-6 text-black" />
                                </div>
                                <h3 className="text-base font-bold mb-1">{skin.name}</h3>
                                <p className="text-xs text-gray-400 mb-4">{skin.description}</p>

                                {isActive ? (
                                  <div className="w-full py-2 bg-yellow-400 text-black font-bold text-xs rounded tracking-widest">
                                      EQUIPPED
                                  </div>
                                ) : isUnlocked ? (
                                  <button 
                                    onClick={() => selectSkin(skinKey)}
                                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded transition-all"
                                  >
                                      EQUIP
                                  </button>
                                ) : (
                                  <button 
                                    onClick={() => buySkin(skinKey, skin.cost)}
                                    disabled={!canAfford}
                                    className={`w-full py-2 font-bold text-xs rounded transition-all ${canAfford ? 'bg-pink-600 hover:bg-pink-500 text-white' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                                  >
                                      UNLOCK ({skin.cost} GEMS)
                                  </button>
                                )}
                            </div>
                          );
                      })}
                   </div>
                 ) : (
                   <div className="max-w-4xl w-full mb-8 dir-rtl space-y-6">
                       {/* Daily Missions Section */}
                       <div className="bg-gray-950/80 border border-amber-500/40 rounded-2xl p-4 shadow-[0_0_20px_rgba(255,180,0,0.15)] space-y-3">
                           <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                               <h3 className="text-lg font-black text-amber-400 flex items-center gap-2 font-sans">
                                   🎯 المهمات والتحديات اليومية
                               </h3>
                               <span className="text-xs text-amber-300/80 font-mono">تتحدث يومياً بكسب جواهر متجددة</span>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                               {missions.map(m => {
                                   const pct = Math.min(100, Math.floor((m.current / m.target) * 100));
                                   return (
                                       <div key={m.id} className="bg-gray-900/90 border border-gray-800 rounded-xl p-3 flex flex-col justify-between space-y-2 hover:border-amber-500/50 transition-colors">
                                           <div className="flex justify-between items-start">
                                               <div>
                                                   <h4 className="text-sm font-bold text-cyan-300">{m.titleAr}</h4>
                                                   <p className="text-xs text-gray-400">{m.descAr}</p>
                                               </div>
                                               <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                                                   +{m.rewardGems} 💎
                                               </span>
                                           </div>

                                           {/* Progress Bar */}
                                           <div className="space-y-1">
                                               <div className="flex justify-between text-[10px] font-mono text-gray-400">
                                                   <span>التقدم:</span>
                                                   <span>{m.current} / {m.target} ({pct}%)</span>
                                               </div>
                                               <div className="w-full bg-black/80 h-2 rounded-full overflow-hidden border border-gray-700">
                                                   <div 
                                                       className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full transition-all duration-300"
                                                       style={{ width: `${pct}%` }}
                                                   />
                                               </div>
                                           </div>

                                           {/* Claim Action */}
                                           <button
                                               onClick={() => claimMissionReward(m.id)}
                                               disabled={m.isClaimed || !m.isCompleted}
                                               className={`w-full py-1.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer ${
                                                   m.isClaimed 
                                                       ? 'bg-gray-800 text-gray-500 border border-gray-700' 
                                                       : m.isCompleted 
                                                           ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-black shadow-[0_0_12px_gold] animate-pulse hover:scale-102' 
                                                           : 'bg-gray-800/80 text-gray-500 border border-gray-800'
                                               }`}
                                           >
                                               {m.isClaimed ? 'تم استلام المكافأة ✓' : m.isCompleted ? '🔥 استلم المكافأة الآن! (+Gems)' : `قيد الإنجاز (${pct}%)`}
                                           </button>
                                       </div>
                                   );
                               })}
                           </div>
                       </div>

                       {/* Legacy Achievements Grid */}
                       <div className="space-y-3">
                           <h3 className="text-base font-bold text-gray-300">🏆 الإنجازات الأسطورية</h3>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                               {achievementsList.map(ach => {
                                   const isClaimed = claimedAchievements.includes(ach.id);
                                   return (
                                       <div key={ach.id} className="bg-gray-900/80 border border-gray-700 p-3.5 rounded-xl flex items-center justify-between shadow-lg">
                                           <div>
                                               <h4 className="text-sm font-bold text-amber-300 mb-0.5">{ach.name}</h4>
                                               <p className="text-gray-400 text-xs mb-1">{ach.desc}</p>
                                               <span className="text-[11px] font-mono text-cyan-400 font-bold">المكافأة: {ach.reward} جوهرة</span>
                                           </div>
                                           <button 
                                              onClick={() => claimReward(ach.id, ach.reward)}
                                              disabled={isClaimed || !ach.isMet}
                                              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${isClaimed ? 'bg-gray-800 text-gray-500 border border-gray-700' : ach.isMet ? 'bg-amber-400 text-black hover:bg-amber-300 shadow-[0_0_10px_#ffcc00]' : 'bg-gray-700 text-gray-400 opacity-50'}`}
                                           >
                                               {isClaimed ? 'تم الاستلام ✓' : ach.isMet ? 'استلام' : 'مغلق'}
                                           </button>
                                       </div>
                                   );
                               })}
                           </div>
                       </div>
                   </div>
                 )}

                 <div className="flex flex-col sm:flex-row gap-3 mt-2 dir-rtl">
                     <button 
                        onClick={() => useStore.setState({ status: GameStatus.MENU })}
                        className="flex items-center justify-center px-6 py-3.5 bg-gray-900 hover:bg-gray-800 text-cyan-300 font-bold text-base rounded-2xl border border-cyan-500/40 hover:border-cyan-300 transition-all"
                     >
                         <Home className="ml-2 w-5 h-5" /> القائمة الرئيسية
                     </button>
                     <button 
                        onClick={closeShop}
                        className="flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 text-white font-black text-lg rounded-2xl hover:scale-105 transition-all shadow-[0_0_25px_rgba(255,0,255,0.4)] active:scale-95"
                     >
                         انطلق إلى اللعب <Play className="mr-2 ml-2 w-5 h-5" fill="white" />
                     </button>
                 </div>
             </div>
        </div>
    );
};

export const HUD: React.FC = () => {
  const { 
    score, lives, maxLives, collectedLetters, status, level, restartGame, startGame, 
    gemsCollected, distance, isImmortalityActive, speed, isMagnetActive,
    blasterAmmo, isShieldDroneActive, highScore, bestDistance, totalGems, useBlasterAmmo, activateImmortality,
    openShop, graphicsQuality, setGraphicsQuality,
    comboCount, comboMultiplier, feverMeter, isFeverMode
  } = useStore();

  const [soundOn, setSoundOn] = useState(true);
  const [bgmOn, setBgmOn] = useState(false);
  const [showWordModal, setShowWordModal] = useState(false);

  const target = getLevelTargetWord(level);
  const containerClass = "absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-8 z-50 select-none";

  const toggleSound = () => {
    const newState = !soundOn;
    setSoundOn(newState);
    audio.setMuted(!newState);
  };

  const toggleBgm = () => {
    audio.init();
    if (audio.isBgmPlaying) {
      audio.stopBGM();
      setBgmOn(false);
    } else {
      audio.startBGM();
      setBgmOn(true);
    }
  };

  // Keyboard shortcut listener for Pause (Escape or P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (useStore.getState().status === GameStatus.PLAYING) {
          useStore.setState({ status: GameStatus.PAUSED });
        } else if (useStore.getState().status === GameStatus.PAUSED) {
          useStore.setState({ status: GameStatus.PLAYING });
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (status === GameStatus.SHOP) {
      return <ShopScreen />;
  }

  if (status === GameStatus.PAUSED) {
      return (
          <div className="absolute inset-0 bg-black/85 z-[100] text-white pointer-events-auto backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-gradient-to-b from-[#100a26] via-[#0d001a] to-[#04000d] border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-[0_0_50px_rgba(255,180,0,0.35)] dir-rtl relative overflow-hidden animate-in fade-in duration-300">
                  
                  {/* Glowing Pause Header Icon */}
                  <div className="mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-1 shadow-[0_0_35px_rgba(255,200,0,0.6)] mb-4 animate-pulse">
                      <div className="w-full h-full bg-black/90 rounded-full flex items-center justify-center border border-amber-300/60">
                          <Pause className="w-9 h-9 sm:w-11 sm:h-11 text-amber-300 fill-amber-300 mr-0.5" />
                      </div>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 font-sans tracking-wide mb-1">
                      إيقاف مؤقت للعبة
                  </h2>
                  <p className="text-xs sm:text-sm text-cyan-300/80 font-mono mb-6">GAME PAUSED • اضغط P أو زِر الاستئناف للمتابعة</p>

                  {/* Current Run Live Stats */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
                      <div className="bg-black/60 p-3 rounded-2xl border border-yellow-500/40 flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-yellow-500/20 border border-yellow-400/60 flex items-center justify-center mb-1 text-yellow-300">
                              <Trophy className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] text-gray-400">النتيجة</span>
                          <span className="text-sm sm:text-base font-black font-mono text-yellow-300">{score.toLocaleString()}</span>
                      </div>

                      <div className="bg-black/60 p-3 rounded-2xl border border-cyan-500/40 flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400/60 flex items-center justify-center mb-1 text-cyan-300">
                              <Diamond className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] text-gray-400">الجواهر</span>
                          <span className="text-sm sm:text-base font-black font-mono text-cyan-300">{gemsCollected}</span>
                      </div>

                      <div className="bg-black/60 p-3 rounded-2xl border border-purple-500/40 flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-400/60 flex items-center justify-center mb-1 text-purple-300">
                              <MapPin className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] text-gray-400">المسافة</span>
                          <span className="text-sm sm:text-base font-black font-mono text-purple-300">{Math.floor(distance)} م</span>
                      </div>
                  </div>

                  {/* Audio Controls inside Pause Modal */}
                  <div className="flex items-center justify-center gap-3 mb-6 bg-black/40 p-2.5 rounded-full border border-white/10">
                      <button 
                          onClick={toggleSound}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${soundOn ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50' : 'bg-gray-800 text-gray-400'}`}
                      >
                          {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-400" />}
                          <span>{soundOn ? 'الصوت مفعل' : 'مكتوم'}</span>
                      </button>
                      <button 
                          onClick={toggleBgm}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${bgmOn ? 'bg-pink-500/20 text-pink-300 border border-pink-400/50 animate-bounce' : 'bg-gray-800 text-gray-400'}`}
                      >
                          <Music className="w-4 h-4" />
                          <span>{bgmOn ? 'الموسيقى مفعلة' : 'الموسيقى متوقفة'}</span>
                      </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {/* Resume */}
                      <button
                          onClick={() => useStore.setState({ status: GameStatus.PLAYING })}
                          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-black border-2 border-emerald-400 text-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer group"
                      >
                          <div className="w-10 h-10 rounded-full bg-emerald-400/30 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                              <Play className="w-5 h-5 text-emerald-200 fill-emerald-200 mr-0.5" />
                          </div>
                          <span className="text-xs font-bold">استئناف ▶</span>
                      </button>

                      {/* Restart */}
                      <button
                          onClick={() => { audio.init(); restartGame(); }}
                          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-black border-2 border-cyan-400 text-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,255,255,0.4)] cursor-pointer group"
                      >
                          <div className="w-10 h-10 rounded-full bg-cyan-400/30 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                              <RotateCcw className="w-5 h-5 text-cyan-200" />
                          </div>
                          <span className="text-xs font-bold">إعادة 🔄</span>
                      </button>

                      {/* Shop */}
                      <button
                          onClick={() => openShop('UPGRADES')}
                          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-600 to-black border-2 border-purple-400 text-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer group"
                      >
                          <div className="w-10 h-10 rounded-full bg-purple-400/30 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                              <Sparkles className="w-5 h-5 text-purple-200" />
                          </div>
                          <span className="text-xs font-bold">المتجر 🛒</span>
                      </button>

                      {/* Main Menu */}
                      <button
                          onClick={() => useStore.setState({ status: GameStatus.MENU })}
                          className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-red-600 via-pink-800 to-black border-2 border-red-400 text-white hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] cursor-pointer group"
                      >
                          <div className="w-10 h-10 rounded-full bg-red-400/30 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
                              <Home className="w-5 h-5 text-red-200" />
                          </div>
                          <span className="text-xs font-bold">القائمة 🏠</span>
                      </button>
                  </div>

              </div>
          </div>
      );
  }

  if (status === GameStatus.MENU) {
      return (
          <div className="absolute inset-0 flex items-center justify-center z-[100] bg-[#03000a]/90 backdrop-blur-md p-3 md:p-6 pointer-events-auto overflow-y-auto">
              {/* Target Words Modal */}
              {showWordModal && (
                  <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-lg flex items-center justify-center p-4 animate-in fade-in duration-300">
                      <div className="bg-gradient-to-b from-[#12002b] to-[#080015] border border-pink-500/50 rounded-3xl p-6 max-w-lg w-full text-white shadow-[0_0_50px_rgba(255,0,128,0.4)] dir-rtl">
                          <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-3">
                              <h3 className="text-xl font-black text-pink-400 flex items-center gap-2">
                                  <span>🔤</span> كلمات المراحل الـ 8
                              </h3>
                              <button 
                                  onClick={() => setShowWordModal(false)}
                                  className="text-gray-400 hover:text-white font-bold text-lg px-2"
                              >
                                  ✕
                              </button>
                          </div>

                          <p className="text-xs text-gray-300 mb-4 leading-relaxed">
                              اجمع أحرف الكلمة الخاصة بكل مرحلة لفتح العوالم التالية وللحصول على <strong>+10,000 نقطة مكافأة!</strong>
                          </p>

                          <div className="grid grid-cols-2 gap-2.5 font-mono text-xs mb-6">
                              <div className="bg-cyan-950/60 border border-cyan-500/40 p-2.5 rounded-xl flex justify-between items-center">
                                  <span className="text-gray-400">1. Neon Cyber:</span>
                                  <span className="text-cyan-300 font-bold tracking-widest">GEMINI</span>
                              </div>
                              <div className="bg-purple-950/60 border border-purple-500/40 p-2.5 rounded-xl flex justify-between items-center">
                                  <span className="text-gray-400">2. Cyber Grid:</span>
                                  <span className="text-purple-300 font-bold tracking-widest">CYBER</span>
                              </div>
                              <div className="bg-red-950/60 border border-red-500/40 p-2.5 rounded-xl flex justify-between items-center">
                                  <span className="text-gray-400">3. Inferno Hell:</span>
                                  <span className="text-red-300 font-bold tracking-widest">INFERNO</span>
                              </div>
                              <div className="bg-green-950/60 border border-green-500/40 p-2.5 rounded-xl flex justify-between items-center">
                                  <span className="text-gray-400">4. Matrix Void:</span>
                                  <span className="text-green-300 font-bold tracking-widest">MATRIX</span>
                              </div>
                              <div className="bg-blue-950/60 border border-blue-500/40 p-2.5 rounded-xl flex justify-between items-center">
                                  <span className="text-gray-400">5. Cosmic Way:</span>
                                  <span className="text-blue-300 font-bold tracking-widest">GALAXY</span>
                              </div>
                              <div className="bg-teal-950/60 border border-teal-500/40 p-2.5 rounded-xl flex justify-between items-center">
                                  <span className="text-gray-400">6. Crystal Realm:</span>
                                  <span className="text-teal-300 font-bold tracking-widest">CRYSTAL</span>
                              </div>
                              <div className="bg-fuchsia-950/60 border border-fuchsia-500/40 p-2.5 rounded-xl flex justify-between items-center">
                                  <span className="text-gray-400">7. Quantum Void:</span>
                                  <span className="text-fuchsia-300 font-bold tracking-widest">QUANTUM</span>
                              </div>
                              <div className="bg-amber-950/60 border border-amber-500/40 p-2.5 rounded-xl flex justify-between items-center">
                                  <span className="text-gray-400">8. Titan Peak:</span>
                                  <span className="text-amber-300 font-bold tracking-widest">TITANS</span>
                              </div>
                          </div>

                          <button 
                              onClick={() => {
                                  setShowWordModal(false);
                                  audio.init();
                                  audio.startBGM();
                                  setBgmOn(true);
                                  startGame();
                              }}
                              className="w-full py-3.5 bg-gradient-to-r from-pink-500 to-cyan-500 text-white font-black text-base rounded-2xl shadow-[0_0_20px_rgba(255,0,128,0.4)] hover:scale-102 transition-all flex items-center justify-center gap-2"
                          >
                              <Play className="w-5 h-5 fill-white" /> ابدأ السباق وتجمع الكلمات!
                          </button>
                      </div>
                  </div>
              )}

              <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#0d0221] via-[#050014] to-[#0a001a] rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,255,255,0.25)] border border-cyan-500/30 my-auto dir-rtl text-white">
                 
                 {/* Top Landing Header Bar */}
                 <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-black/40">
                     <div className="flex items-center space-x-3 space-x-reverse">
                         {/* Glowing Circular App Logo Avatar */}
                         <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 via-pink-500 to-yellow-400 p-0.5 shadow-[0_0_20px_rgba(0,255,255,0.6)] animate-pulse">
                             <div className="w-full h-full bg-black/90 rounded-full flex items-center justify-center">
                                 <Rocket className="w-6 h-6 text-cyan-300" />
                             </div>
                         </div>
                         <div>
                             <h2 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-300 font-sans tracking-wide">
                                 NEON GEMINI RUNNER
                             </h2>
                             <p className="text-xs text-cyan-300/80 font-mono">عدّاء النيون في أعماق الفضاء السيبراني</p>
                         </div>
                     </div>

                     {/* Audio & Sound Circular Controls */}
                     <div className="flex items-center space-x-2.5 space-x-reverse">
                         <button 
                             onClick={toggleBgm}
                             title={bgmOn ? "الموسيقى مفعلة" : "تشغيل الموسيقى"}
                             className={`w-11 h-11 rounded-full border transition-all flex items-center justify-center cursor-pointer group ${bgmOn ? "bg-pink-500/20 border-pink-500/60 shadow-[0_0_15px_rgba(255,0,128,0.5)] text-pink-300" : "bg-gray-900/80 text-gray-400 border-gray-700 hover:border-pink-400"}`}
                         >
                             <Music className={`w-5 h-5 group-hover:scale-110 transition-transform ${bgmOn ? "animate-bounce text-pink-400" : ""}`} />
                         </button>
                         <button 
                             onClick={toggleSound} 
                             title={soundOn ? "الصوت مفعل" : "مكتوم"}
                             className="w-11 h-11 bg-gray-900/80 rounded-full border border-white/20 text-white hover:border-cyan-400 flex items-center justify-center cursor-pointer shadow-[0_0_12px_rgba(0,255,255,0.2)] hover:scale-105 active:scale-95 transition-all group"
                         >
                             {soundOn ? <Volume2 className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" /> : <VolumeX className="w-5 h-5 text-red-400 group-hover:scale-110 transition-transform" />}
                         </button>
                     </div>
                  </div>

                  {/* Hero Cover Banner with Circular Badges */}
                  <div className="relative w-full h-44 sm:h-56 overflow-hidden">
                       <img 
                        src="https://www.gstatic.com/aistudio/starter-apps/gemini_runner/gemini_runner.png" 
                        alt="Gemini Runner Cover" 
                        className="w-full h-full object-cover block filter brightness-95 contrast-110"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-[#050014] via-black/40 to-transparent"></div>
                       
                       {/* High Score Circular Badge */}
                       <div className="absolute top-3 right-3 bg-black/85 backdrop-blur-md px-4 py-1.5 rounded-full border border-yellow-500/60 text-yellow-300 font-mono text-xs flex items-center shadow-[0_0_18px_rgba(255,215,0,0.4)]">
                           <div className="w-6 h-6 rounded-full bg-yellow-500/30 border border-yellow-400 flex items-center justify-center ml-2 shadow-[0_0_8px_rgba(255,215,0,0.6)]">
                               <Trophy className="w-3.5 h-3.5 text-yellow-300" />
                           </div>
                           <span className="font-bold">أعلى نتيجة: {highScore.toLocaleString()}</span>
                       </div>

                       {/* Bottom Circular Stats Badges */}
                       <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                            <div className="bg-black/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-cyan-500/50 text-cyan-300 text-xs font-mono flex items-center shadow-[0_0_15px_rgba(0,255,255,0.35)]">
                                <div className="w-6 h-6 rounded-full bg-cyan-500/30 border border-cyan-400 flex items-center justify-center ml-2">
                                    <Globe className="w-3.5 h-3.5 text-cyan-300" />
                                </div>
                                <span className="font-bold">8 مراحل فضائية</span>
                            </div>
                            <div className="bg-black/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-purple-500/50 text-purple-300 text-xs font-mono flex items-center shadow-[0_0_15px_rgba(168,85,247,0.35)]">
                                <div className="w-6 h-6 rounded-full bg-purple-500/30 border border-purple-400 flex items-center justify-center ml-2">
                                    <span className="text-xs">💎</span>
                                </div>
                                <span className="font-bold">الجواهر: {totalGems.toLocaleString()}</span>
                            </div>
                       </div>
                  </div>

                  {/* App-Style Circular Launcher Icons Grid */}
                  <div className="p-4 md:p-6 space-y-6">
                      {/* Circular App Launcher Grid */}
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-6 gap-x-3 justify-items-center">
                          
                          {/* App 1: Main Play / Start Race */}
                          <div className="flex flex-col items-center group text-center cursor-pointer col-span-3 sm:col-span-4 mb-2">
                              <button 
                                  onClick={() => {
                                      audio.init();
                                      audio.startBGM();
                                      setBgmOn(true);
                                      startGame();
                                  }}
                                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-pink-500 p-1 transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 shadow-[0_0_35px_rgba(0,255,255,0.5)] hover:shadow-[0_0_50px_rgba(255,0,128,0.7)]"
                              >
                                  <div className="w-full h-full bg-gradient-to-b from-black/80 to-[#0a001a] rounded-full flex flex-col items-center justify-center border border-cyan-300/50 group-hover:border-white transition-colors">
                                      <Play className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-300 fill-cyan-300 group-hover:scale-115 transition-transform mr-0.5" />
                                  </div>
                              </button>
                              <span className="text-sm sm:text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-pink-300 mt-2 block">
                                  انطلق في السباق الأسطوري
                              </span>
                              <span className="text-xs text-cyan-400 font-bold block">اضغط لبدء اللعب الآن ▶</span>
                          </div>

                          {/* App 2: Word Collection */}
                          <div className="flex flex-col items-center group text-center cursor-pointer">
                              <button 
                                  onClick={() => setShowWordModal(true)}
                                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-pink-500/30 via-pink-950 to-black border-2 border-pink-400 hover:border-pink-300 flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(255,0,128,0.35)] hover:shadow-[0_0_30px_rgba(255,0,128,0.6)] group-hover:bg-pink-500/40"
                              >
                                  <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">🔤</span>
                              </button>
                              <span className="text-xs font-bold text-pink-300 mt-2 block">تجميع الكلمات</span>
                              <span className="text-[10px] text-pink-400/80 font-mono block">عرض الكلمات ℹ️</span>
                          </div>

                          {/* App 3: Shop & Skins */}
                          <div className="flex flex-col items-center group text-center cursor-pointer">
                              <button 
                                  onClick={() => openShop("SKINS")}
                                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-fuchsia-500/30 via-fuchsia-950 to-black border-2 border-fuchsia-400 hover:border-fuchsia-300 flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(217,70,239,0.35)] hover:shadow-[0_0_30px_rgba(217,70,239,0.6)] group-hover:bg-fuchsia-500/40"
                              >
                                  <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-fuchsia-300 group-hover:scale-110 transition-transform" />
                              </button>
                              <span className="text-xs font-bold text-fuchsia-300 mt-2 block">المتجر والشخصيات</span>
                              <span className="text-[10px] text-fuchsia-400/80 font-mono block">استبدال السكنات 🎭</span>
                          </div>

                          {/* App 4: Powerups & Upgrades */}
                          <div className="flex flex-col items-center group text-center cursor-pointer">
                              <button 
                                  onClick={() => openShop("UPGRADES")}
                                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-500/30 via-purple-950 to-black border-2 border-purple-400 hover:border-purple-300 flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(160,0,255,0.35)] hover:shadow-[0_0_30px_rgba(160,0,255,0.6)] group-hover:bg-purple-500/40"
                              >
                                  <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-purple-300 group-hover:scale-110 transition-transform" />
                              </button>
                              <span className="text-xs font-bold text-purple-300 mt-2 block">مقويات طائرة</span>
                              <span className="text-[10px] text-purple-400/80 font-mono block">تطوير القدرات 🛡️</span>
                          </div>

                          {/* App 5: Achievements */}
                          <div className="flex flex-col items-center group text-center cursor-pointer">
                              <button 
                                  onClick={() => openShop("ACHIEVEMENTS")}
                                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-amber-500/30 via-amber-950 to-black border-2 border-amber-400 hover:border-amber-300 flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(255,200,0,0.35)] hover:shadow-[0_0_30px_rgba(255,200,0,0.6)] group-hover:bg-amber-500/40"
                              >
                                  <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-amber-300 group-hover:scale-110 transition-transform" />
                              </button>
                              <span className="text-xs font-bold text-amber-300 mt-2 block">الإنجازات</span>
                              <span className="text-[10px] text-amber-400/80 font-mono block">استلام الجوائز 🎁</span>
                          </div>

                          {/* App 6: Graphics Quality (60FPS) Toggle */}
                          <div className="flex flex-col items-center group text-center cursor-pointer">
                              <button 
                                  onClick={() => {
                                      if (graphicsQuality === GraphicsQuality.HIGH) setGraphicsQuality(GraphicsQuality.MEDIUM);
                                      else if (graphicsQuality === GraphicsQuality.MEDIUM) setGraphicsQuality(GraphicsQuality.LOW);
                                      else setGraphicsQuality(GraphicsQuality.HIGH);
                                  }}
                                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-emerald-500/30 via-emerald-950 to-black border-2 border-emerald-400 hover:border-emerald-300 flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] group-hover:bg-emerald-500/40"
                              >
                                  <Gauge className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-300 group-hover:scale-110 transition-transform animate-pulse" />
                              </button>
                              <span className="text-xs font-bold text-emerald-300 mt-2 block">أداء 60FPS</span>
                              <span className="text-[10px] text-emerald-400 font-mono block">
                                  {graphicsQuality === GraphicsQuality.HIGH ? "⚡ جودة عالية" : graphicsQuality === GraphicsQuality.MEDIUM ? "⚙️ متوسط" : "🚀 أداء خفيف"}
                              </span>
                          </div>

                          {/* App 7: Music & Audio Toggle */}
                          <div className="flex flex-col items-center group text-center cursor-pointer">
                              <button 
                                  onClick={toggleBgm}
                                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-cyan-500/30 via-cyan-950 to-black border-2 border-cyan-400 hover:border-cyan-300 flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-110 active:scale-95 shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] group-hover:bg-cyan-500/40"
                              >
                                  <Music className={`w-6 h-6 sm:w-7 sm:h-7 text-cyan-300 group-hover:scale-110 transition-transform ${bgmOn ? "animate-bounce text-pink-400" : ""}`} />
                              </button>
                              <span className="text-xs font-bold text-cyan-300 mt-2 block">الموسيقى والصوت</span>
                              <span className="text-[10px] text-cyan-400 font-mono block">
                                  {bgmOn ? "🎵 مفعلة" : "🔇 مكتومة"}
                              </span>
                          </div>

                      </div>

                      {/* Circular Pills for Graphics & Performance Selector */}
                      <div className="bg-gray-900/90 border border-cyan-500/40 rounded-full p-2.5 sm:p-3 shadow-[0_0_20px_rgba(0,255,255,0.15)] flex items-center justify-between gap-2">
                          <button
                              type="button"
                              onClick={() => setGraphicsQuality(GraphicsQuality.HIGH)}
                              className={`flex-1 py-2 px-3 rounded-full text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold ${graphicsQuality === GraphicsQuality.HIGH ? "bg-gradient-to-r from-cyan-500 via-blue-600 to-pink-500 text-white shadow-[0_0_15px_rgba(0,255,255,0.5)]" : "bg-black/60 text-gray-400 hover:text-white"}`}
                          >
                              <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping"></span>
                              <span>جودة عالية (High)</span>
                          </button>
                          <button
                              type="button"
                              onClick={() => setGraphicsQuality(GraphicsQuality.MEDIUM)}
                              className={`flex-1 py-2 px-3 rounded-full text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold ${graphicsQuality === GraphicsQuality.MEDIUM ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-[0_0_15px_rgba(0,128,255,0.5)]" : "bg-black/60 text-gray-400 hover:text-white"}`}
                          >
                              <span>متوسط (Medium)</span>
                          </button>
                          <button
                              type="button"
                              onClick={() => setGraphicsQuality(GraphicsQuality.LOW)}
                              className={`flex-1 py-2 px-3 rounded-full text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold ${graphicsQuality === GraphicsQuality.LOW ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_15px_rgba(0,255,150,0.5)]" : "bg-black/60 text-gray-400 hover:text-white"}`}
                          >
                              <span>خفيف (60FPS)</span>
                          </button>
                      </div>
                  </div>

                  <p className="text-center text-cyan-300/80 text-xs font-sans pt-1">
                         🎮 التحكم: أسهم الكيبورد أو المس أزرار الاتجاهات والقفز والإطلاق على الشاشة
                     </p>
                 </div>
              </div>
      );
  }

  if (status === GameStatus.GAME_OVER) {
      return (
          <div className="absolute inset-0 bg-black/90 z-[100] text-white pointer-events-auto backdrop-blur-sm overflow-y-auto">
              <div className="flex flex-col items-center justify-center min-h-full py-8 px-4 dir-rtl">
                <h1 className="text-4xl md:text-6xl font-black text-red-500 mb-2 drop-shadow-[0_0_15px_rgba(255,0,0,0.8)] font-sans text-center">انتهت اللعبة</h1>
                <p className="text-gray-400 text-sm mb-6">لقد اصطدمت بالعوائق، حاول مجدداً!</p>
                
                <div className="grid grid-cols-1 gap-3 md:gap-4 text-center mb-8 w-full max-w-md">
                    <div className="bg-gray-900/80 p-3 md:p-4 rounded-xl border border-gray-700 flex items-center justify-between">
                        <div className="flex items-center text-yellow-400 text-sm md:text-base"><Trophy className="ml-2 w-5 h-5"/> أعلى نتيجة</div>
                        <div className="text-xl md:text-2xl font-bold font-mono text-yellow-400">{highScore.toLocaleString()}</div>
                    </div>
                    <div className="bg-gray-900/80 p-3 md:p-4 rounded-xl border border-gray-700 flex items-center justify-between">
                        <div className="flex items-center text-cyan-400 text-sm md:text-base"><Diamond className="ml-2 w-5 h-5"/> الجواهر المجمعة</div>
                        <div className="text-xl md:text-2xl font-bold font-mono">{gemsCollected}</div>
                    </div>
                    <div className="bg-gray-900/80 p-3 md:p-4 rounded-xl border border-gray-700 flex items-center justify-between">
                        <div className="flex items-center text-purple-400 text-sm md:text-base"><MapPin className="ml-2 w-5 h-5"/> المسافة المقطوعة</div>
                        <div className="text-xl md:text-2xl font-bold font-mono">{Math.floor(distance)} م</div>
                    </div>
                     <div className="bg-gray-800/80 p-3 md:p-4 rounded-xl flex items-center justify-between mt-2 border border-cyan-500/50 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
                        <div className="flex items-center text-white text-sm md:text-base font-bold">النتيجة الحالية</div>
                        <div className="text-2xl md:text-3xl font-bold font-mono text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{score.toLocaleString()}</div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={() => useStore.setState({ status: GameStatus.MENU })}
                      className="px-6 py-3.5 bg-gray-900 hover:bg-gray-800 text-cyan-300 font-bold text-base rounded-2xl border border-cyan-500/40 hover:border-cyan-300 transition-all flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" /> القائمة الرئيسية
                    </button>
                    <button 
                      onClick={() => { audio.init(); restartGame(); }}
                      className="px-8 md:px-10 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-lg rounded-2xl active:scale-95 transition-all shadow-[0_0_25px_rgba(0,255,255,0.5)] flex items-center justify-center gap-2"
                    >
                        إعادة اللعب 🔄
                    </button>
                </div>
              </div>
          </div>
      );
  }

  if (status === GameStatus.VICTORY) {
    return (
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/90 to-black/95 z-[100] text-white pointer-events-auto backdrop-blur-md overflow-y-auto">
            <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
                <Rocket className="w-16 h-16 md:w-24 md:h-24 text-yellow-400 mb-4 animate-bounce drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]" />
                <h1 className="text-3xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-500 to-pink-500 mb-2 drop-shadow-[0_0_20px_rgba(255,165,0,0.6)] font-cyber text-center leading-tight">
                    MISSION COMPLETE
                </h1>
                <p className="text-cyan-300 text-sm md:text-2xl font-mono mb-8 tracking-widest text-center">
                    THE GEMINI MATRIX IS FULLY SYNCHRONIZED
                </p>
                
                <div className="grid grid-cols-1 gap-4 text-center mb-8 w-full max-w-md">
                    <div className="bg-black/60 p-6 rounded-xl border border-yellow-500/30 shadow-[0_0_15px_rgba(255,215,0,0.1)]">
                        <div className="text-xs md:text-sm text-gray-400 mb-1 tracking-wider">FINAL SCORE</div>
                        <div className="text-3xl md:text-4xl font-bold font-cyber text-yellow-400">{score.toLocaleString()}</div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                            <div className="text-xs text-gray-400">GEMS</div>
                            <div className="text-xl md:text-2xl font-bold text-cyan-400">{gemsCollected}</div>
                        </div>
                        <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                             <div className="text-xs text-gray-400">DISTANCE</div>
                            <div className="text-xl md:text-2xl font-bold text-purple-400">{Math.floor(distance)} LY</div>
                        </div>
                     </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={() => useStore.setState({ status: GameStatus.MENU })}
                      className="px-6 py-3.5 bg-gray-900 hover:bg-gray-800 text-cyan-300 font-bold text-base rounded-2xl border border-cyan-500/40 hover:border-cyan-300 transition-all flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" /> القائمة الرئيسية
                    </button>
                    <button 
                      onClick={() => { audio.init(); restartGame(); }}
                      className="px-8 md:px-10 py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black text-lg rounded-2xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,200,0,0.5)] flex items-center justify-center gap-2"
                    >
                        إعادة المهمة 🔄
                    </button>
                </div>
            </div>
        </div>
    );
  }

  return (
    <div className={containerClass}>
        {/* Unified Top HUD Section */}
        <div className="w-full flex flex-col gap-1.5 p-2 sm:p-3 pointer-events-none z-50">
            {/* Top Controls Header Bar */}
            <div className="flex items-center justify-between w-full">
                
                {/* Left Side: Score, Combo & Hearts */}
                <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
                    <div className="text-2xl sm:text-4xl font-bold text-cyan-400 drop-shadow-[0_0_10px_#00ffff] font-cyber flex items-center gap-2">
                        <span>{score.toLocaleString()}</span>
                        {comboCount >= 3 && (
                            <span className="text-[10px] sm:text-xs font-extrabold px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-500 to-pink-500 text-black shadow-[0_0_12px_gold] animate-bounce">
                                {comboMultiplier}x 🔥
                            </span>
                        )}
                    </div>

                    <div className="flex items-center space-x-1 sm:space-x-1.5">
                        {[...Array(maxLives)].map((_, i) => (
                            <Heart 
                                key={i} 
                                className={`w-4 h-4 sm:w-6 sm:h-6 ${i < lives ? 'text-pink-500 fill-pink-500' : 'text-gray-800 fill-gray-800'} drop-shadow-[0_0_5px_#ff0054]`} 
                            />
                        ))}
                    </div>
                </div>

                {/* Right Side: Action & Settings Circular/Pill Controls */}
                <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto dir-rtl">
                    {/* Pause Button */}
                    <button 
                      onClick={() => useStore.setState({ status: GameStatus.PAUSED })}
                      title="إيقاف مؤقت للعبة (Pause)" 
                      className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-gradient-to-r from-amber-600/90 via-yellow-700 to-amber-900 backdrop-blur-md rounded-xl border border-amber-400 hover:border-amber-200 text-amber-200 hover:text-white hover:bg-amber-500/40 active:scale-95 transition-all flex items-center gap-1 text-xs font-bold shadow-[0_0_15px_rgba(255,200,0,0.4)] cursor-pointer group"
                    >
                         <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 fill-amber-300 group-hover:scale-110 transition-transform" />
                         <span className="font-sans text-[11px] sm:text-xs">إيقاف ⏸</span>
                    </button>

                    {/* Home Menu Button */}
                    <button 
                      onClick={() => {
                        audio.stopBGM();
                        setBgmOn(false);
                        useStore.setState({ status: GameStatus.MENU });
                      }}
                      title="العودة للقائمة الرئيسية" 
                      className="p-1.5 sm:p-2 bg-black/70 backdrop-blur-md rounded-xl border border-pink-500/60 hover:border-pink-300 text-pink-300 hover:text-white active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                    >
                         <Home className="w-4 h-4 text-pink-400" />
                    </button>

                    {/* Sound Button */}
                    <button 
                      onClick={toggleSound} 
                      title={soundOn ? "المؤثرات الصوتية مفعلة" : "المؤثرات مكتومة"}
                      className="p-1.5 sm:p-2 bg-black/70 backdrop-blur-md rounded-xl border border-white/20 text-white hover:border-cyan-400 cursor-pointer transition-all active:scale-95"
                    >
                         {soundOn ? <Volume2 className="w-4 h-4 text-cyan-300" /> : <VolumeX className="w-4 h-4 text-red-400" />}
                    </button>

                    {/* Music Button */}
                    <button 
                      onClick={toggleBgm} 
                      title={bgmOn ? "الموسيقى مفعلة" : "الموسيقى مكتومة"}
                      className="p-1.5 sm:p-2 bg-black/70 backdrop-blur-md rounded-xl border border-white/20 text-white hover:border-pink-400 cursor-pointer transition-all active:scale-95"
                    >
                         <Music className={`w-4 h-4 ${bgmOn ? 'text-pink-400 animate-bounce' : 'text-gray-500'}`} />
                    </button>

                    {/* Graphics Quality */}
                    <button 
                      onClick={() => {
                        const next = graphicsQuality === GraphicsQuality.HIGH ? GraphicsQuality.MEDIUM : graphicsQuality === GraphicsQuality.MEDIUM ? GraphicsQuality.LOW : GraphicsQuality.HIGH;
                        setGraphicsQuality(next);
                      }}
                      title={`الجودة: ${graphicsQuality}`}
                      className="px-2 py-1 sm:px-2.5 sm:py-1.5 bg-black/70 backdrop-blur-md rounded-xl border border-cyan-500/40 text-cyan-300 hover:border-cyan-300 active:scale-95 transition-all flex items-center gap-1 text-[10px] sm:text-xs font-mono font-bold cursor-pointer"
                    >
                         <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                         <span>{graphicsQuality}</span>
                    </button>
                </div>
            </div>

            {/* Center Header Stack: Level Name + Gemini Letters + Fever Gauge */}
            <div className="flex flex-col items-center gap-1 mx-auto z-40 pointer-events-none">
                {/* Level Indicator Badge */}
                <div className="text-[10px] sm:text-xs text-cyan-300 font-bold tracking-tight font-mono bg-black/80 px-3 py-0.5 rounded-full border border-cyan-500/40 backdrop-blur-md flex items-center gap-1.5 dir-rtl whitespace-nowrap shadow-md pointer-events-auto">
                    <span>المرحلة {level}: {getLevelTheme(level).nameAr}</span>
                </div>

                {/* Gemini Collection Letters */}
                <div className="flex space-x-1 sm:space-x-2 pointer-events-auto">
                    {target.map((char, idx) => {
                        const isCollected = collectedLetters.includes(idx);
                        const color = getLetterColor(idx);

                        return (
                            <div 
                                key={idx}
                                style={{
                                    borderColor: isCollected ? color : 'rgba(55, 65, 81, 1)',
                                    color: isCollected ? 'rgba(0, 0, 0, 0.8)' : 'rgba(55, 65, 81, 1)',
                                    boxShadow: isCollected ? `0 0 15px ${color}` : 'none',
                                    backgroundColor: isCollected ? color : 'rgba(0, 0, 0, 0.9)'
                                }}
                                className={`w-6 h-8 sm:w-8 sm:h-10 flex items-center justify-center border-2 font-black text-sm sm:text-base font-cyber rounded-lg transform transition-all duration-300`}
                            >
                                {char}
                            </div>
                        );
                    })}
                </div>

                {/* Fever Mode Gauge */}
                <div className="w-32 sm:w-44 bg-black/80 border border-amber-500/50 rounded-full h-3 sm:h-3.5 p-0.5 backdrop-blur-md overflow-hidden relative shadow-[0_0_10px_rgba(255,180,0,0.3)] pointer-events-auto">
                    <div 
                        className={`h-full rounded-full transition-all duration-300 ${isFeverMode ? 'bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 animate-pulse' : 'bg-gradient-to-r from-yellow-500 to-amber-400'}`}
                        style={{ width: `${isFeverMode ? 100 : feverMeter}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] sm:text-[9px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] uppercase font-mono">
                        {isFeverMode ? '🔥 FEVER ACTIVE (2X) 🔥' : `FEVER ${feverMeter}%`}
                    </span>
                </div>

                {/* Active Powerups Row */}
                <div className="flex items-center gap-1.5 pointer-events-auto mt-0.5">
                     {isImmortalityActive && (
                          <div className="bg-yellow-500/20 border border-yellow-400 text-yellow-400 font-bold px-2 py-0.5 rounded-full text-[10px] sm:text-xs animate-pulse flex items-center shadow-[0_0_10px_gold]">
                              <Shield className="mr-1 w-3 h-3 fill-yellow-400" /> IMMORTAL
                          </div>
                     )}
                     {isMagnetActive && (
                          <div className="bg-cyan-500/20 border border-cyan-400 text-cyan-400 font-bold px-2 py-0.5 rounded-full text-[10px] sm:text-xs flex items-center shadow-[0_0_10px_#00ffff]">
                              <Magnet className="mr-1 w-3 h-3" /> MAGNET
                          </div>
                     )}
                     {isShieldDroneActive && (
                          <div className="bg-emerald-500/20 border border-emerald-400 text-emerald-400 font-bold px-2 py-0.5 rounded-full text-[10px] sm:text-xs flex items-center shadow-[0_0_10px_#00ffcc]">
                              <Shield className="mr-1 w-3 h-3" /> DRONE
                          </div>
                     )}
                </div>
            </div>
        </div>

        {/* On-Screen Touch / Mobile Controls */}
        <div className="w-full flex justify-between items-end pb-10 sm:pb-14 px-3 pointer-events-auto z-40">
             {/* Left side: Directional Touch Controls */}
             <div className="flex space-x-2 sm:space-x-3 dir-rtl">
                 <button 
                  onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))}
                  className="w-16 h-16 sm:w-18 sm:h-18 bg-black/70 backdrop-blur-md border-2 border-cyan-400/70 rounded-2xl flex flex-col items-center justify-center text-cyan-300 active:scale-90 active:bg-cyan-500/30 transition-transform shadow-[0_0_20px_rgba(0,255,255,0.3)]"
                  aria-label="Move Left"
                 >
                     <ChevronLeft className="w-8 h-8" />
                     <span className="text-[10px] font-bold tracking-tighter">يسار</span>
                 </button>
                 <button 
                  onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))}
                  className="w-16 h-16 sm:w-18 sm:h-18 bg-black/70 backdrop-blur-md border-2 border-cyan-400/70 rounded-2xl flex flex-col items-center justify-center text-cyan-300 active:scale-90 active:bg-cyan-500/30 transition-transform shadow-[0_0_20px_rgba(0,255,255,0.3)]"
                  aria-label="Move Right"
                 >
                     <ChevronRight className="w-8 h-8" />
                     <span className="text-[10px] font-bold tracking-tighter">يمين</span>
                 </button>
             </div>

             {/* Right side: Action Buttons (Laser, Jump, Special) */}
             <div className="flex items-center space-x-2 sm:space-x-3">
                 {blasterAmmo > 0 && (
                   <button 
                    onClick={() => {
                      if (useBlasterAmmo()) {
                        audio.playLaserShot();
                        window.dispatchEvent(new CustomEvent('fire-laser-shot', { detail: { x: 0, y: 1.2 } }));
                      }
                    }}
                    className="px-3 h-16 sm:h-18 bg-amber-500/30 backdrop-blur-md border-2 border-amber-400 text-amber-300 font-bold rounded-2xl flex flex-col items-center justify-center active:scale-90 active:bg-amber-500/50 transition-transform shadow-[0_0_20px_rgba(255,170,0,0.5)] text-xs"
                    aria-label="Fire Blaster"
                   >
                       <Crosshair className="w-6 h-6 text-amber-300 animate-pulse" />
                       <span className="text-[10px] mt-0.5">إطلاق ({blasterAmmo})</span>
                   </button>
                 )}

                 <button 
                  onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }))}
                  className="w-16 h-16 sm:w-18 sm:h-18 bg-pink-500/30 backdrop-blur-md border-2 border-pink-500 rounded-2xl flex flex-col items-center justify-center text-pink-300 active:scale-90 active:bg-pink-500/50 transition-transform shadow-[0_0_20px_rgba(255,0,100,0.4)]"
                  aria-label="Jump"
                 >
                     <ArrowUp className="w-8 h-8" />
                     <span className="text-[10px] font-bold tracking-tighter">قفز</span>
                 </button>

                 <div className="hidden lg:flex items-center space-x-2 text-cyan-400 opacity-90 pl-2 font-mono">
                     <Zap className="w-4 h-4 animate-pulse" />
                     <span className="text-sm">SPD {Math.round((speed / RUN_SPEED_BASE) * 100)}%</span>
                 </div>
             </div>
        </div>
    </div>
  );
};
