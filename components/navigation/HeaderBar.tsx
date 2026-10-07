'use client';

import React from 'react';
import Image from 'next/image';
import { TabType } from '@/types';
import { ArrowLeft, Star } from 'lucide-react';

interface HeaderBarProps {
  currentTab: TabType;
  xp: number;
  streakDays: number;
  onNavigate: (tab: TabType) => void;
  showBack?: boolean;
  titleOverride?: string | null;
  subtitleOverride?: string | null;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentTab,
  xp,
  streakDays,
  onNavigate,
  showBack = false,
  titleOverride,
  subtitleOverride,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full shadow-md shadow-black/35 bg-[#0F172A]/85 backdrop-blur-md h-[64px] flex items-center justify-center">
      <div className="w-full max-w-[480px] h-[64px] px-4 flex items-center justify-between">
        {/* Left: Back / Logo + Title */}
        <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
          {showBack && (
            <button
              onClick={() => onNavigate('HOME')}
              className="w-10 h-10 rounded-[12px] bg-[#172236] flex items-center justify-center text-[#F1F5F9] active:scale-95 transition-transform"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 text-[#F1F5F9]" />
            </button>
          )}

          <button
            onClick={() => onNavigate('HOME')}
            className="w-8 h-8 rounded-[8px] overflow-hidden flex-shrink-0 active:scale-95 transition-transform"
            aria-label="Abhyas Arena Home"
          >
            <Image
              src="/assets/abhyas_logo.svg"
              alt="Abhyas Arena Logo"
              width={32}
              height={32}
              className="w-8 h-8 object-cover"
            />
          </button>

          <div className="flex flex-col min-w-0 text-left">
            <h1 className="text-[18px] font-bold text-[#F1F5F9] leading-tight truncate">
              {titleOverride || 'Abhyas Arena'}
            </h1>
            <span className="text-[11px] font-bold text-[#22C7E6] leading-tight truncate">
              {subtitleOverride || 'Class 5 • Maha Scholarship'}
            </span>
          </div>
        </div>

        {/* Right: Streak + XP + Avatar */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Streak Flame Pill */}
          <button
            onClick={() => onNavigate('HOME')}
            className="rounded-full bg-[#22304A]/90 px-2 py-1.5 flex items-center gap-1 active:scale-95 transition-transform border border-transparent hover:border-[#F5B94C]/30"
          >
            <span className="text-[12px] leading-none">🔥</span>
            <span className="text-[12px] font-extrabold text-[#F5B94C] leading-none">
              {streakDays}
            </span>
          </button>

          {/* XP Pill */}
          <button
            onClick={() => onNavigate('PROFILE')}
            className="rounded-full bg-[#22304A]/90 px-2.5 py-1.5 flex items-center gap-1 active:scale-95 transition-transform border border-transparent hover:border-[#F5B94C]/30"
          >
            <Star className="w-3 h-3 text-[#F5B94C] fill-[#F5B94C]" />
            <span className="text-[13px] font-bold text-[#F5B94C] leading-none">
              {xp} XP
            </span>
          </button>

          {/* Profile Avatar */}
          <button
            onClick={() => onNavigate('PROFILE')}
            className="w-9 h-9 rounded-full bg-[#334155] flex items-center justify-center overflow-hidden active:scale-95 transition-transform border border-cyan-400/20"
            aria-label="Open Profile"
          >
            <Image
              src="/assets/profile_avatar.svg"
              alt="Open Profile"
              width={34}
              height={34}
              className="w-[34px] h-[34px] rounded-full object-cover"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
