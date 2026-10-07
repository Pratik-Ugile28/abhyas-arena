'use client';

import React from 'react';
import { UserStats } from '@/types';
import { X } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStats?: UserStats | null;
  streakDays?: number;
  conqueredMistakesCount?: number;
  activeMistakesCount?: number;
  readNotificationIds: Set<string>;
  onNotificationRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  userStats,
  streakDays = userStats?.streakDays ?? 1,
  conqueredMistakesCount = 0,
  activeMistakesCount = 0,
  readNotificationIds,
  onNotificationRead,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  const streakTitle = streakDays > 0 ? 'Streak Protected! 🔥' : 'Start Your Daily Streak! 🚀';
  const streakDesc =
    streakDays > 0
      ? `You're on a ${streakDays}-day study streak (${userStats?.streakStatus || 'Active'})! Practice today to climb the 1-3-5 Habit Ladder.`
      : 'Complete your daily practice today to ignite your study streak and earn bonus XP on the Habit Ladder.';

  let arenaTitle = 'Weekly Arena Open ⚔️';
  let arenaDesc = 'The Maharashtra Scholarship Arena is live! Enter your first round to claim your spot on the division leaderboard.';

  if (userStats && userStats.weeklyXp > 0) {
    if (userStats.arenaRank === 1) {
      arenaTitle = '🏆 Division Leader!';
      arenaDesc = `You are currently #1 in Weekly Arena with ${userStats.weeklyXp} XP! Defend your Gold Podium spot.`;
    } else if (userStats.arenaRank === 2) {
      arenaTitle = '🥈 Silver Podium Standing!';
      arenaDesc = `You are in 2nd place in Weekly Arena with ${userStats.weeklyXp} XP! Just one strong duel away from #1 Gold.`;
    } else if (userStats.arenaRank === 3) {
      arenaTitle = '🥉 Bronze Podium Standing!';
      arenaDesc = `You are in 3rd place with ${userStats.weeklyXp} XP! Keep dueling to secure your podium trophy.`;
    } else if (userStats.arenaRank <= 10) {
      arenaTitle = 'Arena Rank Alert ⚔️';
      arenaDesc = `You are currently #${userStats.arenaRank} in Weekly Arena with ${userStats.weeklyXp} XP. Climb higher to claim a podium spot!`;
    } else {
      arenaTitle = 'Arena Rank Alert ⚔️';
      arenaDesc = `You have earned ${userStats.weeklyXp} XP in Weekly Arena. Practice more to climb the division leaderboard!`;
    }
  }

  let mistakeTitle = '✨ Flawless Mistake Vault';
  let mistakeDesc = 'Your mistake vault is completely clear! Keep up your high accuracy across Chapter Quests.';

  if (conqueredMistakesCount > 0) {
    mistakeTitle = '🛡️ Mistake Vault Victory';
    mistakeDesc = `You have conquered ${conqueredMistakesCount} tricky questions! Overall accuracy is at ${userStats?.accuracy || 80}%.`;
  } else if (activeMistakesCount > 0) {
    mistakeTitle = '💡 Mistake Vault Reminder';
    mistakeDesc = `You have ${activeMistakesCount} saved questions in your Mistake Vault. Review them in Mistakes Dojo to earn +15 XP per question.`;
  }

  const notifications = [
    { id: 'streak_protected', title: streakTitle, desc: streakDesc, time: '1h ago' },
    { id: 'arena_rank', title: arenaTitle, desc: arenaDesc, time: '3h ago' },
    { id: 'mistake_tip', title: mistakeTitle, desc: mistakeDesc, time: 'Yesterday' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[480px] max-h-[85vh] flex flex-col rounded-t-[24px] sm:rounded-[24px] bg-[#0F172A] border border-[#334155] p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-1">
          <div>
            <h2 className="text-[19px] font-bold text-[#F1F5F9]">Daily Alerts & Quests</h2>
            <p className="text-[13px] text-[#A8B4C4]">Your latest progress and study updates</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#A8B4C4] hover:text-[#F1F5F9] hover:bg-[#172236] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-end">
          <button
            onClick={onMarkAllRead}
            className="text-[13px] font-bold text-[#22C7E6] hover:underline"
          >
            Mark all as read
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {notifications.map((item) => {
            const isUnread = !readNotificationIds.has(item.id);
            return (
              <div
                key={item.id}
                onClick={() => onNotificationRead(item.id)}
                className={`w-full p-3.5 rounded-[12px] border transition-all cursor-pointer ${
                  isUnread
                    ? 'bg-[#22304A] border-[#22C7E6]/50'
                    : 'bg-[#172236] border-[#334155]'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-[#22C7E6] flex-shrink-0" />
                    )}
                    <h3 className="text-[14px] font-bold text-[#F1F5F9]">{item.title}</h3>
                  </div>
                  <span className="text-[11px] text-[#A8B4C4] flex-shrink-0">{item.time}</span>
                </div>
                <p className="text-[13px] text-[#A8B4C4] mt-1.5 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-[12px] bg-[#22C7E6] text-[#062A35] font-bold text-[14px] hover:bg-[#8DE7F4] active:scale-[0.98] transition-all"
        >
          Done
        </button>
      </div>
    </div>
  );
};
