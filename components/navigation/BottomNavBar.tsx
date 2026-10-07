'use client';

import React from 'react';
import { TabType } from '@/types';
import { Home, Brain, BookOpen, Trophy, User } from 'lucide-react';

interface BottomNavBarProps {
  currentTab: TabType;
  mistakesCount: number;
  onSelectTab: (tab: TabType) => void;
}

interface NavItemConfig {
  tab: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties; color?: string; size?: number }>;
  badge?: number | null;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  mistakesCount,
  onSelectTab,
}) => {
  const items: NavItemConfig[] = [
    { tab: 'HOME', label: 'Home', icon: Home },
    { tab: 'PRACTICE', label: 'Practice', icon: Brain },
    { tab: 'MISTAKES', label: 'Mistakes', icon: BookOpen, badge: mistakesCount > 0 ? mistakesCount : null },
    { tab: 'ARENA', label: 'Arena', icon: Trophy },
    { tab: 'PROFILE', label: 'Profile', icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 z-40 w-full shadow-lg shadow-black/50 border-t border-[#172236] bg-[#0B1220]/95 backdrop-blur-md pb-safe"
      aria-label="Bottom Navigation"
    >
      <div className="w-full max-w-[480px] mx-auto h-[72px] px-1 flex items-center justify-around">
        {items.map((item) => {
          const isSelected = item.tab === currentTab;
          const IconComponent = item.icon;
          const iconColor = isSelected ? '#22C7E6' : '#A8B4C4';

          return (
            <button
              key={item.tab}
              onClick={() => onSelectTab(item.tab)}
              className={`relative flex-1 h-[52px] rounded-[12px] flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'bg-[#22C7E6]/10 shadow-sm shadow-[#22C7E6]/25'
                  : 'bg-transparent hover:bg-[#172236]/40'
              }`}
              role="tab"
              aria-selected={isSelected}
              aria-label={item.label}
            >
              <div className="relative flex items-center justify-center">
                <IconComponent
                  className="w-[22px] h-[22px] transition-colors"
                  style={{ color: iconColor }}
                />
                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className="absolute -top-1.5 -right-3 min-w-[16px] h-4 px-1 rounded-full bg-[#F07167] text-[#3B1010] text-[10px] font-bold flex items-center justify-center leading-none"
                    aria-label={`${item.badge} unread mistakes`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className="text-[11px] font-bold mt-0.5 leading-none transition-colors"
                style={{ color: iconColor }}
              >
                {item.label}
              </span>

              {isSelected && (
                <span
                  className="w-1.5 h-1.5 rounded-full bg-[#22C7E6] mt-1"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
