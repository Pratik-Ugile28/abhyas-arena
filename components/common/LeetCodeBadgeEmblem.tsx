'use client';

import React from 'react';
import { Badge, BADGE_TIER_META, BadgeTier } from '@/types';
import { Lock } from 'lucide-react';

interface LeetCodeBadgeEmblemProps {
  badge: Badge;
  size?: number; // size in px, default 80
  showHaloProgress?: boolean;
  isFeatured?: boolean;
  animateShimmer?: boolean;
  onClick?: () => void;
}

export const LeetCodeBadgeEmblem: React.FC<LeetCodeBadgeEmblemProps> = ({
  badge,
  size = 80,
  showHaloProgress = true,
  isFeatured = false,
  animateShimmer = true,
  onClick,
}) => {
  const isUnlocked = badge.status === 'Unlocked';
  const tier = badge.tier || 'BRONZE';
  const tierMeta = BADGE_TIER_META[tier] || BADGE_TIER_META.BRONZE;
  const accentColor = tierMeta.colorHex;

  const progressFraction = badge.maxProgress > 0 ? Math.min(1, badge.currentProgress / badge.maxProgress) : 0;

  // Hexagon geometry
  const strokeWidth = size * 0.05;
  const radius = (size - strokeWidth * 2) / 2;
  const center = size / 2;

  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angleDeg = i * 60 - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = center + radius * Math.cos(angleRad);
    const y = center + radius * Math.sin(angleRad);
    points.push(`${x},${y}`);
  }
  const hexPointsString = points.join(' ');

  // Inner hex
  const innerRadius = radius * 0.78;
  const innerPoints: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angleDeg = i * 60 - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    const x = center + innerRadius * Math.cos(angleRad);
    const y = center + innerRadius * Math.sin(angleRad);
    innerPoints.push(`${x},${y}`);
  }
  const innerHexPointsString = innerPoints.join(' ');

  // Circumference for halo progress
  const haloRadius = size * 0.46;
  const haloCircumference = 2 * Math.PI * haloRadius;
  const strokeDashoffset = haloCircumference * (1 - progressFraction);

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center select-none ${
        onClick ? 'cursor-pointer active:scale-95 transition-transform' : ''
      }`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="absolute inset-0 overflow-visible"
      >
        <defs>
          <radialGradient id={`aura-${badge.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={accentColor} stopOpacity={isUnlocked ? "0.4" : "0.1"} />
            <stop offset="70%" stopColor={accentColor} stopOpacity="0.05" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`bevel-${badge.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isUnlocked ? accentColor : "#475569"} />
            <stop offset="50%" stopColor={isUnlocked ? "#ffffff" : "#334155"} stopOpacity={isUnlocked ? 0.8 : 0.4} />
            <stop offset="100%" stopColor={isUnlocked ? accentColor : "#1e293b"} />
          </linearGradient>
        </defs>

        {/* Outer Aura Glow */}
        <circle cx={center} cy={center} r={size * 0.48} fill={`url(#aura-${badge.id})`} />

        {/* Halo Progress Ring for locked items */}
        {!isUnlocked && showHaloProgress && badge.maxProgress > 1 && (
          <circle
            cx={center}
            cy={center}
            r={haloRadius}
            fill="none"
            stroke={accentColor}
            strokeWidth={2}
            strokeDasharray={haloCircumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 origin-center -rotate-90"
            opacity={0.7}
          />
        )}

        {/* Outer Hexagon with Bevel Rim */}
        <polygon
          points={hexPointsString}
          fill={isUnlocked ? '#172236' : '#0F172A'}
          stroke={`url(#bevel-${badge.id})`}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />

        {/* Inner Jewel Hexagon Core */}
        <polygon
          points={innerHexPointsString}
          fill={isUnlocked ? '#0F172A' : '#0B0F17'}
          stroke={isUnlocked ? accentColor : 'rgba(255,255,255,0.08)'}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      </svg>

      {/* Center Content: Icon or Lock */}
      <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
        {isUnlocked ? (
          <span
            style={{ fontSize: size * 0.38 }}
            className={`leading-none drop-shadow-md ${animateShimmer ? 'animate-pulse' : ''}`}
          >
            {badge.icon}
          </span>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <Lock
              className="text-[#A8B4C4]/80"
              style={{ width: size * 0.28, height: size * 0.28 }}
            />
            {showHaloProgress && badge.maxProgress > 1 && size >= 64 && (
              <span
                className="font-bold text-[10px] mt-0.5 leading-none"
                style={{ color: accentColor }}
              >
                {Math.round(progressFraction * 100)}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Featured Star Pip */}
      {isFeatured && (
        <span
          className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#F5B94C] text-[#3A2605] flex items-center justify-center text-[10px] font-bold shadow-md shadow-[#F5B94C]/40 border border-[#0F172A]"
          title="Featured Badge"
        >
          ★
        </span>
      )}
    </div>
  );
};
