/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { 
  Heart, Zap, Trophy, MapPin, Diamond, Rocket, ArrowUpCircle, 
  Shield, Activity, PlusCircle, Play, Magnet, Crosshair, 
  Volume2, VolumeX, Music, Sparkles, ChevronLeft, ChevronRight, ArrowUp, Home, RotateCcw
} from 'lucide-react';
import { useStore } from '../../store';
import { GameStatus, GEMINI_COLORS, ShopItem, RUN_SPEED_BASE, PlayerSkin, SKINS_DATA, getLevelTheme, getLevelTargetWord, getLetterColor } from '../../types';
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
      unlockedSkins, activeSkin, selectSkin, buySkin, totalGems, activeShopTab
    } = useStore();
    
    const [tab, setTab] = useState<'UPGRADES' | 'SKINS' | 'ACHIEVEMENTS'>(activeShopTab || 'UPGRADES');

    useEffect(() => {
        if (activeShopTab) {
            setTab(activeShopTab);
        }
    }, [activeShopTab]);
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
                        className={`px-4 py-2 rounded-lg font-bold text-xs md:text-base transition-all ${tab === 'ACHIEVEMENTS' ? 'bg-amber-400 text-black shadow-[0_0_10px_#ffcc00]' : 'text-gray-400 hover:text-white'}`}
                     >
                        الإنجازات 🏆
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
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl w-full mb-8 dir-rtl">
                       {achievementsList.map(ach => {
                           const isClaimed = claimedAchievements.includes(ach.id);
                           return (
                               <div key={ach.id} className="bg-gray-900/80 border border-gray-700 p-4 rounded-xl flex items-center justify-between shadow-lg">
                                   <div>
                                       <h3 className="text-base font-bold text-amber-300 mb-1">{ach.name}</h3>
                                       <p className="text-gray-400 text-xs mb-2">{ach.desc}</p>
                                       <span className="text-xs font-mono text-cyan-400 font-bold">المكافأة: {ach.reward} جوهرة</span>
                                   </div>
                                   <button 
                                      onClick={() => claimReward(ach.id, ach.reward)}
                                      disabled={isClaimed || !ach.isMet}
                                      className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${isClaimed ? 'bg-gray-800 text-gray-500 border border-gray-700' : ach.isMet ? 'bg-amber-400 text-black hover:bg-amber-300 shadow-[0_0_10px_#ffcc00]' : 'bg-gray-700 text-gray-400 opacity-50'}`}
                                   >
                                       {isClaimed ? 'تم الاستلام ✓' : ach.isMet ? 'استلام المكافأة' : 'مغلق'}
                                   </button>
                               </div>
                           );
                       })}
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
    openShop
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

  if (status === GameStatus.SHOP) {
      return <ShopScreen />;
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
                         <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-pink-500 p-0.5 shadow-[0_0_15px_#00ffff]">
                             <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
                                 <Rocket className="w-5 h-5 text-cyan-400 animate-pulse" />
                             </div>
                         </div>
                         <div>
                             <h2 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-300 font-sans tracking-wide">
                                 NEON GEMINI RUNNER
                             </h2>
                             <p className="text-xs text-cyan-300/80 font-mono">عدّاء النيون في أعماق الفضاء السيبراني</p>
                         </div>
                     </div>

                     {/* Audio & Sound Toggle */}
                     <div className="flex items-center space-x-2 space-x-reverse">
                         <button 
                             onClick={toggleBgm}
                             className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${bgmOn ? 'bg-pink-500/20 text-pink-300 border-pink-500/50 shadow-[0_0_10px_#ff0077]' : 'bg-gray-800/80 text-gray-400 border-gray-700 hover:border-pink-400'}`}
                         >
                             <Music className={`w-3.5 h-3.5 ${bgmOn ? 'animate-bounce text-pink-400' : ''}`} />
                             <span>{bgmOn ? 'الموسيقى مفعلة 🎵' : 'تشغيل الموسيقى 🎵'}</span>
                         </button>
                         <button onClick={toggleSound} className="p-2 bg-black/60 rounded-full border border-white/20 text-white hover:border-cyan-400 cursor-pointer">
                             {soundOn ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
                         </button>
                     </div>
                 </div>

                 {/* Hero Cover Banner */}
                 <div className="relative w-full h-44 sm:h-56 overflow-hidden">
                      <img 
                       src="https://www.gstatic.com/aistudio/starter-apps/gemini_runner/gemini_runner.png" 
                       alt="Gemini Runner Cover" 
                       className="w-full h-full object-cover block filter brightness-95 contrast-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050014] via-black/40 to-transparent"></div>
                      
                      {/* High Score Badge */}
                      <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-yellow-500/50 text-yellow-300 font-mono text-xs flex items-center shadow-[0_0_12px_rgba(255,215,0,0.3)]">
                          <Trophy className="w-4 h-4 ml-1.5 text-yellow-400" /> أعلى نتيجة: {highScore.toLocaleString()}
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                           <div className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                               8 مراحل فضائية أسطورية 🌌
                           </div>
                           <div className="bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg border border-purple-500/30 text-purple-300 text-xs font-mono">
                               💎 الجواهر: {totalGems.toLocaleString()}
                           </div>
                      </div>
                 </div>

                 {/* Interactive Game Highlights Grid */}
                 <div className="p-4 md:p-6 space-y-4">
                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                         <button 
                             onClick={() => {
                                 audio.init();
                                 audio.startBGM();
                                 setBgmOn(true);
                                 startGame();
                             }}
                             className="bg-gray-900/80 hover:bg-cyan-950/60 p-3 rounded-xl border border-cyan-500/30 hover:border-cyan-400 text-center transition-all cursor-pointer hover:scale-105 active:scale-95 group shadow-[0_0_12px_rgba(0,255,255,0.15)]"
                         >
                             <span className="text-xl block mb-1 group-hover:scale-110 transition-transform">🌌</span>
                             <span className="text-xs font-bold text-cyan-300 block">8 عوالم نيون</span>
                             <span className="text-[10px] text-cyan-400/90 font-bold block mt-1">اضغط للعب ▶</span>
                         </button>

                         <button 
                             onClick={() => setShowWordModal(true)}
                             className="bg-gray-900/80 hover:bg-pink-950/60 p-3 rounded-xl border border-pink-500/30 hover:border-pink-400 text-center transition-all cursor-pointer hover:scale-105 active:scale-95 group shadow-[0_0_12px_rgba(255,0,128,0.15)]"
                         >
                             <span className="text-xl block mb-1 group-hover:scale-110 transition-transform">🔤</span>
                             <span className="text-xs font-bold text-pink-300 block">تجميع الكلمات</span>
                             <span className="text-[10px] text-pink-400/90 font-bold block mt-1">عرض الكلمات ℹ️</span>
                         </button>

                         <button 
                             onClick={() => openShop('UPGRADES')}
                             className="bg-gray-900/80 hover:bg-purple-950/60 p-3 rounded-xl border border-purple-500/30 hover:border-purple-400 text-center transition-all cursor-pointer hover:scale-105 active:scale-95 group shadow-[0_0_12px_rgba(160,0,255,0.15)]"
                         >
                             <span className="text-xl block mb-1 group-hover:scale-110 transition-transform">🛡️</span>
                             <span className="text-xs font-bold text-purple-300 block">مقويات طائرة</span>
                             <span className="text-[10px] text-purple-400/90 font-bold block mt-1">افتح المتجر 🛒</span>
                         </button>

                         <button 
                             onClick={() => openShop('ACHIEVEMENTS')}
                             className="bg-gray-900/80 hover:bg-amber-950/60 p-3 rounded-xl border border-amber-500/30 hover:border-amber-400 text-center transition-all cursor-pointer hover:scale-105 active:scale-95 group shadow-[0_0_12px_rgba(255,200,0,0.15)]"
                         >
                             <span className="text-xl block mb-1 group-hover:scale-110 transition-transform">🏆</span>
                             <span className="text-xs font-bold text-amber-300 block">نظام الإنجازات</span>
                             <span className="text-[10px] text-amber-400/90 font-bold block mt-1">استلم الجوائز 🎁</span>
                         </button>
                     </div>

                     {/* Action Buttons */}
                     <div className="pt-2 flex flex-col sm:flex-row gap-3">
                         <button 
                           onClick={() => { 
                               audio.init(); 
                               audio.startBGM(); 
                               setBgmOn(true);
                               startGame(); 
                           }}
                           className="flex-1 group relative px-6 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-pink-500 text-white font-black text-lg md:text-xl rounded-2xl hover:scale-102 transition-all shadow-[0_0_30px_rgba(0,255,255,0.4)] active:scale-95 overflow-hidden text-center cursor-pointer"
                         >
                             <span className="relative z-10 tracking-wider flex items-center justify-center font-sans">
                                 انطلق في السباق الأسطوري <Play className="mr-2 ml-2 w-6 h-6 fill-white" />
                             </span>
                         </button>

                         <button 
                           onClick={() => openShop('SKINS')}
                           className="px-6 py-4 bg-gray-900 hover:bg-gray-800 text-cyan-300 font-bold text-base rounded-2xl border border-cyan-500/40 hover:border-cyan-400 transition-all text-center flex items-center justify-center gap-2 cursor-pointer"
                         >
                             <Sparkles className="w-5 h-5 text-pink-400" />
                             المتجر والشخصيات
                         </button>
                     </div>

                     {/* Controls Instructions Footer */}
                     <p className="text-center text-cyan-300/80 text-xs font-sans pt-1">
                         🎮 التحكم: أسهم الكيبورد أو المس أزرار الاتجاهات والقفز والإطلاق على الشاشة
                     </p>
                 </div>
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
        {/* Top Bar */}
        <div className="flex justify-between items-start w-full">
            <div className="flex flex-col">
                <div className="text-3xl md:text-5xl font-bold text-cyan-400 drop-shadow-[0_0_10px_#00ffff] font-cyber">
                    {score.toLocaleString()}
                </div>
            </div>

            {/* Audio & Status Controls & Back to Menu */}
            <div className="flex items-center space-x-2 md:space-x-3 pointer-events-auto dir-rtl">
                <button 
                  onClick={() => {
                    audio.stopBGM();
                    setBgmOn(false);
                    useStore.setState({ status: GameStatus.MENU });
                  }}
                  title="العودة للقائمة الرئيسية" 
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-red-900/80 via-black to-pink-950/80 backdrop-blur-md rounded-xl border border-pink-500/60 hover:border-pink-300 text-pink-300 hover:text-white hover:bg-pink-500/30 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold shadow-[0_0_15px_rgba(255,0,128,0.3)] cursor-pointer z-50"
                >
                     <Home className="w-4 h-4 text-pink-400" />
                     <span className="font-sans">العودة للقائمة</span>
                </button>
                <button onClick={toggleSound} className="p-2 bg-black/60 backdrop-blur-md rounded-full border border-white/20 text-white hover:border-cyan-400 cursor-pointer">
                     {soundOn ? <Volume2 className="w-4 h-4 md:w-5 md:h-5" /> : <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-red-400" />}
                </button>
                <button onClick={toggleBgm} className="p-2 bg-black/60 backdrop-blur-md rounded-full border border-white/20 text-white hover:border-pink-400 cursor-pointer">
                     <Music className={`w-4 h-4 md:w-5 md:h-5 ${bgmOn ? 'text-pink-400 animate-bounce' : 'text-gray-500'}`} />
                </button>

                <div className="flex space-x-1 md:space-x-2 ml-2">
                    {[...Array(maxLives)].map((_, i) => (
                        <Heart 
                            key={i} 
                            className={`w-5 h-5 md:w-7 md:h-7 ${i < lives ? 'text-pink-500 fill-pink-500' : 'text-gray-800 fill-gray-800'} drop-shadow-[0_0_5px_#ff0054]`} 
                        />
                    ))}
                </div>
            </div>
        </div>
        
        {/* Level Indicator */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs md:text-sm text-cyan-300 font-bold tracking-wider font-mono bg-black/80 px-4 py-1.5 rounded-full border border-cyan-500/40 backdrop-blur-md z-50 flex items-center space-x-2 shadow-[0_0_15px_rgba(0,255,255,0.3)] dir-rtl">
            <span>{getLevelTheme(level).nameAr}</span>
            <span className="text-gray-400 text-xs font-mono">({level}/8)</span>
        </div>

        {/* Active Powerups Row */}
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
             {isImmortalityActive && (
                  <div className="bg-yellow-500/20 border border-yellow-400 text-yellow-400 font-bold px-3 py-1 rounded-full text-xs md:text-sm animate-pulse flex items-center shadow-[0_0_10px_gold]">
                      <Shield className="mr-1.5 w-4 h-4 fill-yellow-400" /> IMMORTAL
                  </div>
             )}
             {isMagnetActive && (
                  <div className="bg-cyan-500/20 border border-cyan-400 text-cyan-400 font-bold px-3 py-1 rounded-full text-xs md:text-sm flex items-center shadow-[0_0_10px_#00ffff]">
                      <Magnet className="mr-1.5 w-4 h-4" /> MAGNET ACTIVE
                  </div>
             )}
             {isShieldDroneActive && (
                  <div className="bg-emerald-500/20 border border-emerald-400 text-emerald-400 font-bold px-3 py-1 rounded-full text-xs md:text-sm flex items-center shadow-[0_0_10px_#00ffcc]">
                      <Shield className="mr-1.5 w-4 h-4" /> DRONE ACTIVE
                  </div>
             )}
        </div>

        {/* Gemini Collection Status */}
        <div className="absolute top-14 md:top-20 left-1/2 transform -translate-x-1/2 flex space-x-1.5 md:space-x-3">
            {target.map((char, idx) => {
                const isCollected = collectedLetters.includes(idx);
                const color = getLetterColor(idx);

                return (
                    <div 
                        key={idx}
                        style={{
                            borderColor: isCollected ? color : 'rgba(55, 65, 81, 1)',
                            color: isCollected ? 'rgba(0, 0, 0, 0.8)' : 'rgba(55, 65, 81, 1)',
                            boxShadow: isCollected ? `0 0 20px ${color}` : 'none',
                            backgroundColor: isCollected ? color : 'rgba(0, 0, 0, 0.9)'
                        }}
                        className={`w-7 h-9 md:w-10 md:h-12 flex items-center justify-center border-2 font-black text-base md:text-xl font-cyber rounded-lg transform transition-all duration-300`}
                    >
                        {char}
                    </div>
                );
            })}
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
