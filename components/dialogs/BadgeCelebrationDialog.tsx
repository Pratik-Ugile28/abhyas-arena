'use client';

import React, { useEffect } from 'react';
import { Badge, BADGE_TIER_META } from '@/types';
import { LeetCodeBadgeEmblem } from '@/components/common/LeetCodeBadgeEmblem';
import { Sparkles, Star, Trophy, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BadgeCelebrationDialogProps {
  badge: Badge | null;
  onDismiss: () => void;
  onFeatureBadge?: (badgeId: string | null) => void;
  queueCount?: number;
}

export const BadgeCelebrationDialog: React.FC<BadgeCelebrationDialogProps> = ({
  badge,
  onDismiss,
  onFeatureBadge,
  queueCount = 1,
}) => {
  useEffect(() => {
    if (badge) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#22C7E6', '#F5B94C', '#39C88A', '#FF3D71'],
        });
      } catch {}
    }
  }, [badge]);

  if (!badge) return null;

  const tierMeta = BADGE_TIER_META[badge.tier] || BADGE_TIER_META.BRONZE;
  const accentColor = tierMeta.colorHex;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-[420px] rounded-[28px] bg-[#0F172A] border-2 p-6 shadow-2xl flex flex-col items-center text-center space-y-4 animate-in zoom-in-95"
        style={{ borderColor: accentColor }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Chip */}
        <div
          className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider"
          style={{
            backgroundColor: `${accentColor}25`,
            color: accentColor,
            border: `1px solid ${accentColor}60`,
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {queueCount > 1 ? `NEW MEDAL UNLOCKED • +${queueCount - 1} MORE` : 'NEW MEDAL UNLOCKED'}
          </span>
        </div>

        {/* 125px Hexagonal Medallion */}
        <div className="py-2">
          <LeetCodeBadgeEmblem badge={badge} size={125} isFeatured animateShimmer />
        </div>

        {/* Badge Title & Rarity */}
        <div>
          <h2 className="text-[22px] font-black text-[#F1F5F9] leading-tight">
            {badge.name}
          </h2>
          <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 rounded-[8px] bg-[#172236] text-[11px]">
            <span className="font-extrabold" style={{ color: accentColor }}>
              {tierMeta.rarityLabel}
            </span>
            <span className="text-[#A8B4C4]">•</span>
            <span className="text-[#A8B4C4] font-medium">{tierMeta.rarityPercentile}</span>
          </div>
        </div>

        {/* Lifetime XP Award Banner */}
        <div className="w-full py-2.5 px-4 rounded-[16px] bg-[#F5B94C]/15 border border-[#F5B94C]/50 flex items-center justify-center gap-2 text-[#F5B94C]">
          <Star className="w-4 h-4 fill-[#F5B94C]" />
          <span className="text-[13px] font-extrabold tracking-wide">
            +{badge.xpBonus} LIFETIME XP AWARDED
          </span>
        </div>

        {/* Description / Lore */}
        <p className="text-[13px] text-[#A8B4C4] leading-relaxed px-2">
          {badge.description}
        </p>

        {/* Action Buttons */}
        <div className="w-full space-y-2 pt-2">
          {onFeatureBadge && (
            <button
              onClick={() => {
                onFeatureBadge(badge.id);
                onDismiss();
              }}
              className="w-full py-3 rounded-[12px] bg-[#F5B94C] text-[#3A2605] font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-[#FFE0A3] active:scale-[0.98] transition-all shadow-md shadow-[#F5B94C]/25"
            >
              <Trophy className="w-4 h-4" />
              <span>Feature on Scholar Profile</span>
            </button>
          )}

          <button
            onClick={onDismiss}
            className="w-full py-3 rounded-[12px] bg-[#22C7E6] text-[#062A35] font-bold text-[14px] hover:bg-[#8DE7F4] active:scale-[0.98] transition-all shadow-md shadow-[#22C7E6]/25"
          >
            {queueCount > 1 ? 'Next Medal →' : 'Claim & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};
