import React from 'react';
import { useStore } from '../../store';
import { GameStatus, RUN_SPEED_BASE } from '../../types';

export const SpeedBlurOverlay: React.FC = () => {
  const speed = useStore((s) => s.speed);
  const isFeverMode = useStore((s) => s.isFeverMode);
  const status = useStore((s) => s.status);

  if (status !== GameStatus.PLAYING) {
    return null;
  }

  // Calculate speed ratio (0 at base speed, 1 at max speed)
  const rawRatio = Math.max(0, (speed - RUN_SPEED_BASE) / (RUN_SPEED_BASE * 1.8));
  const speedRatio = Math.min(1.0, isFeverMode ? Math.max(0.8, rawRatio + 0.35) : rawRatio);

  // Peripheral blur amount in pixels (from 0px up to 14px blur)
  const blurAmount = Math.round(speedRatio * 14);

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {/* Radial Peripheral Motion Blur Layer */}
      {speedRatio > 0.05 && (
        <div 
          className="absolute inset-0 transition-all duration-300"
          style={{
            backdropFilter: `blur(${blurAmount}px)`,
            WebkitBackdropFilter: `blur(${blurAmount}px)`,
            maskImage: 'radial-gradient(circle at center, transparent 32%, black 80%)',
            WebkitMaskImage: 'radial-gradient(circle at center, transparent 32%, black 80%)',
            opacity: Math.min(1, speedRatio * 1.2),
          }}
        />
      )}

      {/* Speed Lines / Tunnel Motion Blur Overlay */}
      {speedRatio > 0.15 && (
        <div 
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: Math.min(0.85, speedRatio * 0.9),
            background: isFeverMode
              ? 'radial-gradient(circle at center, transparent 40%, rgba(255, 0, 128, 0.25) 75%, rgba(0, 255, 255, 0.4) 100%)'
              : 'radial-gradient(circle at center, transparent 45%, rgba(0, 255, 255, 0.15) 80%, rgba(0, 150, 255, 0.3) 100%)',
            boxShadow: `inset 0 0 ${Math.round(40 + speedRatio * 80)}px ${
              isFeverMode ? 'rgba(255, 0, 200, 0.6)' : 'rgba(0, 255, 255, 0.5)'
            }`
          }}
        >
          {/* Animated Speed Streaks in 4 Corners */}
          <div className="absolute inset-0 flex justify-between pointer-events-none opacity-80">
            {/* Left speed lines */}
            <div 
              className="w-1/4 h-full bg-[linear-gradient(90deg,rgba(0,255,255,0.3)_0%,transparent_100%)] animate-pulse"
              style={{ filter: `blur(${Math.max(1, blurAmount * 0.5)}px)` }}
            />
            {/* Right speed lines */}
            <div 
              className="w-1/4 h-full bg-[linear-gradient(270deg,rgba(255,0,200,0.3)_0%,transparent_100%)] animate-pulse"
              style={{ filter: `blur(${Math.max(1, blurAmount * 0.5)}px)` }}
            />
          </div>
        </div>
      )}

      {/* High Speed Tunnel Vignette Edge Glow */}
      {speedRatio > 0.4 && (
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 border-[6px] sm:border-[10px] border-transparent"
          style={{
            borderImage: isFeverMode
              ? 'linear-gradient(45deg, #ff007f, #00ffff, #ffcc00, #ff007f) 1'
              : 'linear-gradient(45deg, #00ffff, #0088ff, #ff00aa, #00ffff) 1',
            filter: `blur(${Math.round(4 + speedRatio * 8)}px)`,
            opacity: Math.min(0.9, (speedRatio - 0.3) * 1.4)
          }}
        />
      )}
    </div>
  );
};
