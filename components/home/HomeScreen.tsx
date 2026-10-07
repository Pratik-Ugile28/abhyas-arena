'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { TabType, ChapterQuest, QuestStage, ARENA_COMPANIONS } from '@/types';
import {
  Bell,
  Star,
  Play,
  RotateCcw,
  Trophy,
  Check,
  Zap,
  BookOpen,
  Flag,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { StageBriefingDialog } from '@/components/quest/StageBriefingDialog';
import { LockedQuizPassDialog } from '@/components/dialogs/LockedQuizPassDialog';
import { RedeemPassCodeDialog } from '@/components/dialogs/RedeemPassCodeDialog';

interface HomeScreenProps {
  onNavigate: (tab: TabType) => void;
  onOpenSyllabus: () => void;
  onOpenNotifications: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  onOpenNotifications,
}) => {
  const {
    userStats,
    chapterQuests,
    inProgressSession,
    dailyQuestionsSolved,
    isDailyGoalClaimed,
    hasUnreadNotifications,
    resumeInProgressSession,
    clearInProgressSession,
    startQuestStage,
    startSpeedBlitz,
    focusChapter,
    redeemActivationCode,
    syncAccountPassStatus,
  } = useApp();

  const [showStreakModal, setShowStreakModal] = useState<boolean>(false);
  const [showRedeemCodeDialog, setShowRedeemCodeDialog] = useState<boolean>(false);
  const [briefingPair, setBriefingPair] = useState<{ quest: ChapterQuest; stage: QuestStage } | null>(null);
  const [lockedPair, setLockedPair] = useState<{ quest: ChapterQuest; stage: QuestStage } | null>(null);

  const companion = ARENA_COMPANIONS.find((c) => c.id === userStats.companionId) || ARENA_COMPANIONS[0];

  const allChaptersConquered =
    chapterQuests.length > 0 &&
    chapterQuests.every((q) => q.stages.length > 0 && q.stages.every((s) => s.isCompleted));

  const activeQuest =
    (inProgressSession
      ? chapterQuests.find((q) => q.id === inProgressSession.chapterId)
      : null) ||
    chapterQuests.find((q) => !q.isLocked && q.progressPercent < 100) ||
    chapterQuests.find((q) => !q.isLocked) ||
    chapterQuests[0];

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

  const handleOpenQuestMap = () => {
    if (activeQuest) {
      const realm = activeQuest.subject.includes('Math')
        ? '🔢 Math'
        : activeQuest.subject.includes('Reasoning')
        ? '🧠 Logic'
        : '📖 Language';
      focusChapter(activeQuest.id, realm);
    }
    onNavigate('PRACTICE');
  };

  const handleRestartStage = () => {
    if (activeQuest) {
      const stage = activeQuest.stages.find((s) => s.isCurrent) || activeQuest.stages[0];
      const isFreeStage = activeQuest.chapterNumber === 1 && stage.stageNumber === 1;
      if (!userStats.isSubscribed && !isFreeStage) {
        setLockedPair({ quest: activeQuest, stage });
      } else {
        clearInProgressSession();
        startQuestStage(activeQuest, stage);
      }
    }
  };

  const handleStartActiveQuest = (quest: ChapterQuest, stage: QuestStage) => {
    const isFreeStage = quest.chapterNumber === 1 && stage.stageNumber === 1;
    if (!userStats.isSubscribed && !isFreeStage) {
      setLockedPair({ quest: quest, stage: stage });
    } else {
      clearInProgressSession();
      startQuestStage(quest, stage);
    }
  };

  const handleStartBlitz = () => {
    if (!userStats.isSubscribed) {
      const targetQuest = activeQuest || chapterQuests[0];
      setLockedPair({
        quest: targetQuest,
        stage: {
          stageNumber: 2,
          name: 'Speed Blitz Challenge',
          type: 'WARRIOR',
          difficulty: 'Rapid Fire',
          questionCount: 10,
          xpReward: 100,
        },
      });
    } else if (activeQuest) {
      startSpeedBlitz(activeQuest);
    } else {
      onNavigate('PRACTICE');
    }
  };

  return (
    <div className="w-full max-w-[480px] mx-auto p-4 space-y-3.5 pb-24">
      {/* 1. Top Hero Bar */}
      <div className="h-12 flex items-center justify-between">
        <div className="min-w-0 text-left">
          <h2 className="text-[17px] font-extrabold text-[#F1F5F9] leading-tight truncate">
            {greeting}, {userStats.name.split(' ')[0]} {companion.emoji}
          </h2>
          <p className="text-[11px] font-medium text-[#A8B4C4] leading-tight truncate">
            {userStats.grade} • Maharashtra Scholarship
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Streak Capsule */}
          <button
            onClick={() => setShowStreakModal(true)}
            className="rounded-full bg-[#22304A] border border-[#F5B94C]/45 px-3 py-1.5 flex items-center gap-1 active:scale-95 transition-transform"
          >
            <span className="text-[13px] leading-none animate-pulse">🔥</span>
            <span className="text-[12px] font-extrabold text-[#F5B94C] leading-none">
              {userStats.streakDays === 1 ? '1 Day' : `${userStats.streakDays} Days`}
            </span>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative w-9 h-9 rounded-full bg-[#22304A] border border-[#334155] flex items-center justify-center text-[#A8B4C4] hover:text-[#F1F5F9] active:scale-95 transition-transform"
            aria-label="Open notifications"
          >
            <Bell className="w-4 h-4" style={{ color: hasUnreadNotifications ? '#F5B94C' : undefined }} />
            {hasUnreadNotifications && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F5B94C] border border-[#0F172A]" />
            )}
          </button>
        </div>
      </div>

      {/* 2. Active Quest Hero Card */}
      {inProgressSession ? (
        // Case A: Test In Progress
        <div className="rounded-[18px] bg-gradient-to-br from-[#22304A] to-[#172236] border-[1.5px] border-[#22C7E6]/65 p-4 shadow-xl shadow-[#22C7E6]/10 space-y-3 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-[6px] bg-[#F5B94C]/20 border border-[#F5B94C]/40 text-[#F5B94C] text-[10px] font-extrabold">
                ⏳ TEST IN PROGRESS
              </span>
              <span className="text-[11px] font-bold text-[#A8B4C4]">
                Question {Math.min(inProgressSession.currentIndex + 1, inProgressSession.questions.length)} of {inProgressSession.questions.length}
              </span>
            </div>
            <button
              onClick={handleOpenQuestMap}
              className="text-[11px] font-bold text-[#22C7E6] px-2 py-1 rounded-[6px] bg-[#22C7E6]/15 hover:underline"
            >
              View Map ›
            </button>
          </div>

          <div>
            <h3 className="text-[17px] font-extrabold text-[#F1F5F9] truncate leading-tight">
              {inProgressSession.questTitle}
            </h3>
            <p className="text-[12px] text-[#A8B4C4] truncate">
              {inProgressSession.stageSubtitle}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-bold text-[#22C7E6]">
                {Math.round((inProgressSession.currentIndex / Math.max(1, inProgressSession.questions.length)) * 100)}% Completed
              </span>
              <span className="font-extrabold text-[#F5B94C]">
                {Math.max(1, inProgressSession.questions.length - inProgressSession.currentIndex)} left • +{inProgressSession.totalStageXp} XP to claim
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#0B1220] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#22C7E6] to-[#8DE7F4] transition-all"
                style={{
                  width: `${(inProgressSession.currentIndex / Math.max(1, inProgressSession.questions.length)) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={resumeInProgressSession}
              className="w-full h-12 rounded-[12px] bg-[#22C7E6] text-[#062A35] font-extrabold text-[13px] flex items-center justify-center gap-2 hover:bg-[#8DE7F4] active:scale-[0.98] transition-all shadow-md shadow-[#22C7E6]/25"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>CONTINUE TEST (+{inProgressSession.totalStageXp} XP TO CLAIM)</span>
            </button>
            <div className="flex justify-center">
              <button
                onClick={handleRestartStage}
                className="text-[12px] font-semibold text-[#A8B4C4] hover:text-[#F1F5F9] flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart Stage From Q1</span>
              </button>
            </div>
          </div>
        </div>
      ) : allChaptersConquered ? (
        // Case B: 100% Syllabus Mastered
        <div className="rounded-[18px] bg-gradient-to-br from-[#22304A] to-[#172236] border-[1.5px] border-[#F5B94C]/60 p-4 shadow-xl shadow-[#F5B94C]/15 space-y-3.5 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-11 h-11 rounded-[14px] bg-[#D99B2B] flex items-center justify-center text-[22px]">
                👑
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-[#F5B94C] tracking-wider uppercase">
                  🏆 100% SYLLABUS MASTERED
                </span>
                <h3 className="text-[19px] font-extrabold text-[#F1F5F9] leading-tight">
                  Realm Master!
                </h3>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              {[0, 1, 2].map((i) => (
                <Star key={i} className="w-4 h-4 text-[#F5B94C] fill-[#F5B94C]" />
              ))}
            </div>
          </div>

          <p className="text-[12px] text-[#A8B4C4] leading-relaxed">
            Every fortress in Math, Logic & Language conquered with 3-Star Mastery! Defend your rank on the weekly leaderboard to claim the scholarship crown.
          </p>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="px-2 py-1 rounded-[6px] bg-[#F5B94C]/15 border border-[#F5B94C]/40 text-[#F5B94C] text-[10px] font-bold whitespace-nowrap">
              ⭐ All Stars Claimed
            </span>
            <span className="px-2 py-1 rounded-[6px] bg-[#39C88A]/15 border border-[#39C88A]/40 text-[#39C88A] text-[10px] font-bold whitespace-nowrap">
              🎯 Exam Ready
            </span>
            <span className="px-2 py-1 rounded-[6px] bg-[#22C7E6]/15 border border-[#22C7E6]/40 text-[#22C7E6] text-[10px] font-bold whitespace-nowrap">
              🔥 Rank #1 Contender
            </span>
          </div>

          <div className="space-y-2 pt-1">
            <button
              onClick={() => onNavigate('ARENA')}
              className="w-full h-12 rounded-[12px] bg-[#F5B94C] text-[#3A2605] font-extrabold text-[13px] flex items-center justify-center gap-2 hover:bg-[#FFE0A3] active:scale-[0.98] transition-all shadow-md shadow-[#F5B94C]/25"
            >
              <span>⚔️ DEFEND RANK IN WEEKLY ARENA</span>
            </button>
            <button
              onClick={handleOpenQuestMap}
              className="w-full h-10 rounded-[12px] bg-[#334155] text-[#22C7E6] font-bold text-[12px] flex items-center justify-center hover:bg-[#334155]/80"
            >
              <span>⚡ REPLAY CHAPTERS & SPEED BLITZ</span>
            </button>
          </div>
        </div>
      ) : activeQuest ? (
        // Case C: Normal Active Quest
        (() => {
          const activeStage =
            activeQuest.stages.find((s) => s.isCurrent) ||
            activeQuest.stages.find((s) => !s.isCompleted) ||
            activeQuest.stages[0];

          return (
            <div className="rounded-[18px] bg-gradient-to-br from-[#22304A] to-[#172236] border border-[#22C7E6]/35 p-4 shadow-xl shadow-black/35 space-y-3 text-left">
              <div className="flex items-start justify-between">
                <div
                  onClick={handleOpenQuestMap}
                  className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                >
                  <div className="w-11 h-11 rounded-[12px] bg-[#334155] flex items-center justify-center text-[22px] flex-shrink-0">
                    {activeQuest.icon || '📘'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold text-[#22C7E6]">
                        ⚡ ACTIVE QUEST
                      </span>
                      {activeQuest.marksWeightage && (
                        <span className="px-1.5 py-0.5 rounded-[4px] bg-[#F5B94C]/15 text-[#F5B94C] text-[9px] font-bold">
                          {activeQuest.marksWeightage}
                        </span>
                      )}
                    </div>
                    <h3 className="text-[17px] font-extrabold text-[#F1F5F9] truncate leading-tight mt-0.5">
                      {activeQuest.title}
                    </h3>
                    <p className="text-[11px] text-[#A8B4C4] truncate">
                      CH {activeQuest.chapterNumber} • {activeQuest.subject}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 flex-shrink-0 pl-2">
                  <button
                    onClick={handleOpenQuestMap}
                    className="text-[11px] font-bold text-[#22C7E6] px-2 py-1 rounded-[6px] bg-[#22C7E6]/15 hover:underline"
                  >
                    View Map ›
                  </button>
                  <div className="flex items-center gap-0.5">
                    {[0, 1, 2].map((idx) => (
                      <Star
                        key={idx}
                        className={`w-3.5 h-3.5 ${
                          idx < activeQuest.stars
                            ? 'text-[#F5B94C] fill-[#F5B94C]'
                            : 'text-[#334155]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Stage Progress */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="font-bold text-[#F5B94C]">
                    {activeStage.name} ({activeStage.difficulty})
                  </span>
                  <span className="font-extrabold text-[#22C7E6]">
                    {activeQuest.progressPercent}% Conquered
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#0B1220] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#22C7E6] to-[#8DE7F4] transition-all"
                    style={{ width: `${activeQuest.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => setBriefingPair({ quest: activeQuest, stage: activeStage })}
                className="w-full h-12 rounded-[12px] bg-[#22C7E6] text-[#062A35] font-extrabold text-[13px] flex items-center justify-center gap-2 hover:bg-[#8DE7F4] active:scale-[0.98] transition-all shadow-md shadow-[#22C7E6]/25"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>RESUME BATTLE (+{activeStage.xpReward} XP)</span>
              </button>
            </div>
          );
        })()
      ) : null}

      {/* 3. Quick Actions Row */}
      <div className="grid grid-cols-2 gap-2.5 text-left">
        {/* Daily Goal Card */}
        <div
          onClick={handleOpenQuestMap}
          className="rounded-[14px] bg-[#172236] border p-3 cursor-pointer hover:border-[#22C7E6]/50 transition-all flex flex-col justify-between"
          style={{
            borderColor: dailyQuestionsSolved >= 10 || isDailyGoalClaimed ? '#39C88A80' : '#334155',
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Trophy
                className="w-4 h-4"
                style={{
                  color: dailyQuestionsSolved >= 10 || isDailyGoalClaimed ? '#F5B94C' : '#22C7E6',
                }}
              />
              <span className="text-[12px] font-bold text-[#F1F5F9]">Daily Goal</span>
            </div>
            <span
              className="text-[11px] font-extrabold"
              style={{
                color: dailyQuestionsSolved >= 10 || isDailyGoalClaimed ? '#39C88A' : '#22C7E6',
              }}
            >
              {dailyQuestionsSolved}/10
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-[#0B1220] overflow-hidden my-2">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (dailyQuestionsSolved / 10) * 100)}%`,
                backgroundColor:
                  dailyQuestionsSolved >= 10 || isDailyGoalClaimed ? '#39C88A' : '#22C7E6',
              }}
            />
          </div>

          <p
            className="text-[10px] truncate"
            style={{
              color: dailyQuestionsSolved >= 10 || isDailyGoalClaimed ? '#39C88A' : '#A8B4C4',
            }}
          >
            {dailyQuestionsSolved >= 10 || isDailyGoalClaimed
              ? 'Goal Completed! 🏆 • +150 XP'
              : `${Math.max(0, 10 - dailyQuestionsSolved)} Qs left • +150 XP`}
          </p>
        </div>

        {/* Speed Blitz Card */}
        <div
          onClick={handleStartBlitz}
          className="rounded-[14px] bg-[#172236] border border-[#F5B94C]/35 p-3 cursor-pointer hover:border-[#F5B94C] transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#F5B94C]" />
              <span className="text-[12px] font-bold text-[#F1F5F9]">Speed Blitz</span>
            </div>
            {!userStats.isSubscribed ? (
              <span className="px-1.5 py-0.5 rounded-[4px] bg-[#D99B2B]/25 text-[#F5B94C] text-[9px] font-extrabold flex items-center gap-0.5">
                <Lock className="w-2.5 h-2.5" />
                <span>PASS</span>
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded-[4px] bg-[#D99B2B]/25 text-[#F5B94C] text-[9px] font-extrabold">
                +8 BONUS
              </span>
            )}
          </div>

          <p className="text-[12px] font-bold text-[#F5B94C] mt-1.5">Speed Sprint</p>
          <p className="text-[10px] text-[#A8B4C4] truncate">Rapid-fire • Speed XP</p>
        </div>
      </div>

      {/* 4. Stats Grid */}
      <div className="grid grid-cols-2 gap-2 text-left">
        {/* Solved Qs */}
        <div
          onClick={() => onNavigate('PRACTICE')}
          className="p-3.5 rounded-[12px] bg-[#172236] border border-[#22304A] flex items-center gap-2.5 cursor-pointer hover:border-[#22C7E6]/40 transition-colors"
        >
          <div className="w-10 h-10 rounded-[12px] bg-[#22304A] flex items-center justify-center text-[#F1F5F9] flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[18px] font-bold text-[#F1F5F9] leading-tight truncate">
              {userStats.solvedQuestions}
            </p>
            <p className="text-[11px] font-bold text-[#A8B4C4] truncate">Solved Qs</p>
          </div>
        </div>

        {/* Accuracy */}
        <div
          onClick={() => onNavigate('MISTAKES')}
          className="p-3.5 rounded-[12px] bg-[#172236] border border-[#22304A] flex items-center gap-2.5 cursor-pointer hover:border-[#22C7E6]/40 transition-colors"
        >
          <div className="w-10 h-10 rounded-[12px] bg-[#22304A] flex items-center justify-center text-[#22C7E6] flex-shrink-0">
            <Flag className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[18px] font-bold text-[#22C7E6] leading-tight truncate">
              {userStats.accuracy}%
            </p>
            <p className="text-[11px] font-bold text-[#A8B4C4] truncate">Accuracy</p>
          </div>
        </div>

        {/* Arena Rank */}
        <div
          onClick={() => onNavigate('ARENA')}
          className="p-3.5 rounded-[12px] bg-[#172236] border border-[#22304A] flex items-center gap-2.5 cursor-pointer hover:border-[#F5B94C]/40 transition-colors"
        >
          <div className="w-10 h-10 rounded-[12px] bg-[#22304A] flex items-center justify-center text-[#F5B94C] flex-shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[18px] font-bold text-[#F5B94C] leading-tight truncate">
                #{userStats.arenaRank}
              </span>
              <span className="text-[10px] font-bold text-[#F5B94C]">▲2</span>
            </div>
            <p className="text-[11px] font-bold text-[#A8B4C4] truncate">Arena Rank</p>
          </div>
        </div>

        {/* Total XP */}
        <div
          onClick={() => onNavigate('PROFILE')}
          className="p-3.5 rounded-[12px] bg-[#172236] border border-[#22304A] flex items-center gap-2.5 cursor-pointer hover:border-[#22C7E6]/40 transition-colors"
        >
          <div className="w-10 h-10 rounded-[12px] bg-[#22304A] flex items-center justify-center text-[#22C7E6] flex-shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[18px] font-bold text-[#22C7E6] leading-tight truncate">
              {userStats.xp}
            </p>
            <p className="text-[11px] font-bold text-[#A8B4C4] truncate">Total XP</p>
          </div>
        </div>
      </div>

      {/* 5. Weekly Arena Banner */}
      <div
        onClick={() => onNavigate('ARENA')}
        className="rounded-[16px] bg-gradient-to-r from-[#22304A] via-[#172236] to-[#22304A] border border-[#334155]/50 p-3.5 flex items-center gap-3 cursor-pointer hover:border-[#F5B94C]/40 transition-all text-left"
      >
        <div className="w-10 h-10 rounded-[12px] bg-[#D99B2B]/20 flex items-center justify-center text-[#F5B94C] flex-shrink-0">
          <Trophy className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-extrabold text-[#F5B94C]">WEEKLY ARENA</span>
            <span className="px-1.5 py-0.5 rounded-[4px] bg-[#334155] text-[#A8B4C4] text-[10px]">
              Ends in 2d 14h
            </span>
          </div>
          <p className="text-[12px] font-bold text-[#F1F5F9] truncate">
            Win ₹50 Trimax Gold Pen!
          </p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#22C7E6]">
            <span>You are #{userStats.arenaRank} on Leaderboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {showStreakModal && (
        <StreakCalendarDialog
          userStats={userStats}
          onDismiss={() => setShowStreakModal(false)}
        />
      )}

      {briefingPair && (
        <StageBriefingDialog
          quest={briefingPair.quest}
          stage={briefingPair.stage}
          studentName={userStats.name}
          studentPhone={userStats.parentPhone}
          onDismiss={() => setBriefingPair(null)}
          onOpenQuestMap={() => {
            setBriefingPair(null);
            handleOpenQuestMap();
          }}
          onStartBattle={() => {
            const pair = briefingPair;
            setBriefingPair(null);
            handleStartActiveQuest(pair.quest, pair.stage);
          }}
          onRedeemPassCode={() => {
            setBriefingPair(null);
            setShowRedeemCodeDialog(true);
          }}
        />
      )}

      {lockedPair && (
        <LockedQuizPassDialog
          studentName={userStats.name}
          studentPhone={userStats.parentPhone}
          stageTitle={lockedPair.stage.name}
          chapterName={`${lockedPair.quest.subject} • CH ${lockedPair.quest.chapterNumber}: ${lockedPair.quest.title}`}
          onDismiss={() => setLockedPair(null)}
          onRedeemCodeClick={() => {
            setLockedPair(null);
            setShowRedeemCodeDialog(true);
          }}
          onSyncStatusClick={() => {
            setLockedPair(null);
            syncAccountPassStatus();
          }}
        />
      )}

      {showRedeemCodeDialog && (
        <RedeemPassCodeDialog
          studentName={userStats.name}
          parentPhone={userStats.parentPhone}
          onDismiss={() => setShowRedeemCodeDialog(false)}
          onRedeemCode={redeemActivationCode}
          onSyncStatus={syncAccountPassStatus}
        />
      )}
    </div>
  );
};

// 1–3–5 Habit Ladder Streak Dialog
const StreakCalendarDialog: React.FC<{
  userStats: any;
  onDismiss: () => void;
}> = ({ userStats, onDismiss }) => {
  const daysActive = userStats.daysActiveThisWeek || 1;
  const ladderDays = [
    { label: 'Day 1', reward: '+10 XP', stage: 'Kickoff' },
    { label: 'Day 2', reward: 'Run', stage: 'Momentum' },
    { label: 'Day 3', reward: '+50 XP', stage: 'Streak' },
    { label: 'Day 4', reward: 'Run', stage: 'Stamina' },
    { label: 'Day 5', reward: '+120 XP', stage: 'Jackpot' },
  ];

  const nextMilestoneTitle =
    daysActive < 1
      ? 'Next Milestone: Day 1 Kickoff (+10 XP)'
      : daysActive < 3
      ? 'Next Milestone: Day 3 Streak (+50 XP)'
      : daysActive < 5
      ? 'Next Milestone: Day 5 Grand Master (+120 XP)'
      : '🎉 Weekly Habit Champion (+180 XP)';

  const nextMilestoneSubtitle =
    daysActive < 1
      ? 'Start your week with 1 quick drill!'
      : daysActive < 3
      ? `${3 - daysActive} more practice day to claim streak bonus!`
      : daysActive < 5
      ? `${5 - daysActive} day left to hit the Grand Master Jackpot!`
      : 'All 5 days conquered! Maximum habit bonus claimed.';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-[440px] rounded-[24px] bg-[#0F172A] border border-[#334155] p-5 shadow-2xl space-y-4 animate-in zoom-in-95 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-[26px]">🔥</span>
          <div>
            <h2 className="text-[18px] font-extrabold text-[#F1F5F9] leading-tight">
              {userStats.streakDays === 1 ? '1 Day Streak! 🔥' : `${userStats.streakDays} Day Streak! 🔥`}
            </h2>
            <p className="text-[12px] font-semibold text-[#F5B94C]">{userStats.streakStatus}</p>
          </div>
        </div>

        <p className="text-[13px] text-[#A8B4C4] leading-relaxed">
          Weekly 1–3–5 Habit Ladder: Practice 5 days this week to earn +180 XP bonus and build scholarship stamina!
        </p>

        {/* 5 Days Ladder */}
        <div className="grid grid-cols-5 gap-1.5 text-center">
          {ladderDays.map((d, index) => {
            const dayNum = index + 1;
            const completed = dayNum <= daysActive;
            const isJackpot = dayNum === 5;

            return (
              <div key={d.label} className="space-y-1">
                <div
                  className={`w-full aspect-square rounded-[10px] flex items-center justify-center border transition-all ${
                    completed
                      ? isJackpot
                        ? 'bg-[#F5B94C] text-[#3A2605] border-[#F5B94C]'
                        : 'bg-[#D99B2B] text-[#3A2605] border-[#F5B94C]'
                      : 'bg-[#22304A] border-[#334155] text-[#A8B4C4]'
                  }`}
                >
                  {completed ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <span className="text-[9px] font-black">{d.reward}</span>
                  )}
                </div>
                <span
                  className={`text-[11px] block font-bold ${
                    completed ? 'text-[#F5B94C]' : 'text-[#A8B4C4]'
                  }`}
                >
                  D{dayNum}
                </span>
              </div>
            );
          })}
        </div>

        {/* Dynamic Milestone Box */}
        <div className="p-3 rounded-[12px] bg-[#22304A] border border-[#F5B94C]/35 flex items-center gap-2.5">
          <Trophy className="w-6 h-6 text-[#F5B94C] flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-[12px] font-bold text-[#F5B94C] leading-snug truncate">
              {nextMilestoneTitle}
            </p>
            <p className="text-[11px] text-[#F1F5F9] leading-snug">{nextMilestoneSubtitle}</p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="w-full py-2.5 rounded-[10px] bg-[#22C7E6] text-[#062A35] font-bold text-[13px] hover:bg-[#8DE7F4]"
        >
          Keep Battling
        </button>
      </div>
    </div>
  );
};
