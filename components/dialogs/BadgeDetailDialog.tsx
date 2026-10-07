'use client';

import React from 'react';
import { Badge, BADGE_TIER_META } from '@/types';
import { LeetCodeBadgeEmblem } from '@/components/common/LeetCodeBadgeEmblem';
import { CheckCircle2, Lock, Star, Trophy, X } from 'lucide-react';

interface BadgeDetailDialogProps {
  badge: Badge | null;
  isFeatured?: boolean;
  onDismiss: () => void;
  onFeatureBadge?: (badgeId: string | null) => void;
}

export const BadgeDetailDialog: React.FC<BadgeDetailDialogProps> = ({
  badge,
  isFeatured = false,
  onDismiss,
  onFeatureBadge,
}) => {
  if (!badge) return null;

  const isUnlocked = badge.status === 'Unlocked';
  const tierMeta = BADGE_TIER_META[badge.tier] || BADGE_TIER_META.BRONZE;
  const accentColor = tierMeta.colorHex;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-[400px] rounded-[24px] bg-[#0F172A] border border-[#334155] p-5 shadow-2xl flex flex-col items-center text-center space-y-3.5 animate-in zoom-in-95 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-[#A8B4C4] hover:text-[#F1F5F9] transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="pt-2">
          <LeetCodeBadgeEmblem badge={badge} size={96} isFeatured={isFeatured} />
        </div>

        <div>
          <h2 className="text-[20px] font-black text-[#F1F5F9]">{badge.name}</h2>
          <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-[8px] bg-[#172236] text-[11px]">
            <span className="font-extrabold" style={{ color: accentColor }}>
              {tierMeta.rarityLabel}
            </span>
            <span className="text-[#A8B4C4]">•</span>
            <span className="text-[#A8B4C4]">{tierMeta.rarityPercentile}</span>
          </div>
        </div>

        {/* Progress or Unlock Status */}
        <div className="w-full p-3 rounded-[12px] bg-[#172236] border border-[#334155]/60 text-left space-y-1.5">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[#A8B4C4] flex items-center gap-1">
              {isUnlocked ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#39C88A]" />
                  <span className="text-[#39C88A] font-bold">Unlocked</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-[#A8B4C4]" />
                  <span>Requirement Progress</span>
                </>
              )}
            </span>
            <span className="font-bold text-[#F1F5F9]">
              {badge.currentProgress} / {badge.maxProgress}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-[#0B1220] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (badge.currentProgress / Math.max(1, badge.maxProgress)) * 100)}%`,
                backgroundColor: isUnlocked ? '#39C88A' : accentColor,
              }}
            />
          </div>
        </div>

        {/* Description */}
        <p className="text-[13px] text-[#A8B4C4] leading-relaxed">
          {badge.description}
        </p>

        {/* Reward */}
        <div className="inline-flex items-center gap-1 text-[12px] font-bold text-[#F5B94C]">
          <Star className="w-3.5 h-3.5 fill-[#F5B94C]" />
          <span>Reward: +{badge.xpBonus} Lifetime XP</span>
        </div>

        {/* Buttons */}
        <div className="w-full space-y-2 pt-1">
          {isUnlocked && onFeatureBadge && (
            <button
              onClick={() => {
                onFeatureBadge(isFeatured ? null : badge.id);
                onDismiss();
              }}
              className={`w-full py-2.5 rounded-[12px] font-bold text-[13px] flex items-center justify-center gap-1.5 transition-all ${
                isFeatured
                  ? 'bg-[#172236] text-[#F5B94C] border border-[#F5B94C]/40'
                  : 'bg-[#F5B94C] text-[#3A2605] hover:bg-[#FFE0A3]'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>{isFeatured ? 'Remove as Featured' : 'Set as Featured on Profile'}</span>
            </button>
          )}

          <button
            onClick={onDismiss}
            className="w-full py-2.5 rounded-[12px] bg-[#172236] text-[#A8B4C4] font-semibold text-[13px] hover:text-[#F1F5F9]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
