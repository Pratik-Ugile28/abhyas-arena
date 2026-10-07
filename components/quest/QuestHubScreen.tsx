'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { ChapterQuest, QuestStage, ARENA_COMPANIONS, DojoTier, calculateDojoMastery } from '@/types';
import {
  Star,
  Lock,
  Flame,
  Zap,
  Play,
  Check,
  ArrowRight,
  Gift,
  Shield,
  Trophy,
} from 'lucide-react';
import { StageBriefingDialog } from '@/components/quest/StageBriefingDialog';
import { LockedQuizPassDialog } from '@/components/dialogs/LockedQuizPassDialog';
import { RedeemPassCodeDialog } from '@/components/dialogs/RedeemPassCodeDialog';

export const QuestHubScreen: React.FC = () => {
  const {
    userStats,
    chapterQuests,
    selectedRealm,
    selectRealm,
    focusedChapterId,
    selectedPracticeHub,
    selectPracticeHub,
    startQuestStage,
    startSpeedBlitz,
    startChapterDojo,
    redeemActivationCode,
    syncAccountPassStatus,
  } = useApp();

  const [showChestDialog, setShowChestDialog] = useState<boolean>(false);
  const [showRedeemCodeDialog, setShowRedeemCodeDialog] = useState<boolean>(false);
  const [briefingPair, setBriefingPair] = useState<{ quest: ChapterQuest; stage: QuestStage } | null>(null);
  const [lockedPair, setLockedPair] = useState<{ quest: ChapterQuest; stage: QuestStage } | null>(null);

  const companion = ARENA_COMPANIONS.find((c) => c.id === userStats.companionId) || ARENA_COMPANIONS[0];
  const auraColor = companion.auraColorHex;

  const totalStars = useMemo(() => chapterQuests.reduce((sum, q) => sum + (q.stars || 0), 0), [chapterQuests]);

  const filteredQuests = useMemo(() => {
    const hubQuests = chapterQuests.filter((quest) => {
      if (selectedPracticeHub === 'school') {
        return quest.track === 'school' || (quest.track !== 'exam' && !quest.subject.toLowerCase().includes('reasoning'));
      } else {
        return quest.track === 'exam' || quest.subject.toLowerCase().includes('reasoning');
      }
    });

    if (selectedRealm === 'All') {
      return hubQuests;
    }
    const clean = selectedRealm.replace('🔢', '').replace('🧠', '').replace('📖', '').replace('🔬', '').trim().toLowerCase();
    return hubQuests.filter((q) => q.subject.toLowerCase().includes(clean));
  }, [chapterQuests, selectedPracticeHub, selectedRealm]);

  // Realms list based on hub
  const realms = useMemo(() => {
    if (selectedPracticeHub === 'school') {
      return [
        { key: 'All', label: 'All Realms' },
        { key: 'Science', label: '🔬 Science' },
        { key: 'Mathematics', label: '🔢 Math' },
        { key: 'Language', label: '📖 English' },
      ];
    } else {
      return [
        { key: 'All', label: 'All Realms' },
        { key: 'Reasoning', label: '🧠 Mental Ability' },
        { key: 'Mathematics', label: '🔢 Arithmetic' },
        { key: 'Language', label: '📖 Passages' },
      ];
    }
  }, [selectedPracticeHub]);

  return (
    <div className="w-full max-w-[480px] mx-auto p-4 space-y-4 pb-24 text-left">
      {/* 1. Two-Hub Toggle Pill Switch */}
      <div className="w-full rounded-[12px] bg-[#22304A] border border-[#334155] p-1 flex">
        <button
          onClick={() => {
            selectPracticeHub('school');
            selectRealm('All');
          }}
          className={`flex-1 py-2.5 rounded-[9px] font-bold text-[13px] transition-all text-center ${
            selectedPracticeHub === 'school'
              ? 'bg-[#22C7E6] text-[#062A35] shadow-sm'
              : 'text-[#A8B4C4] hover:text-[#F1F5F9]'
          }`}
        >
          🏫 School Subjects
        </button>
        <button
          onClick={() => {
            selectPracticeHub('exam');
            selectRealm('All');
          }}
          className={`flex-1 py-2.5 rounded-[9px] font-bold text-[13px] transition-all flex items-center justify-center gap-1.5 ${
            selectedPracticeHub === 'exam'
              ? 'bg-[#22C7E6] text-[#062A35] shadow-sm'
              : 'text-[#A8B4C4] hover:text-[#F1F5F9]'
          }`}
        >
          <span>🏆 Exam Subjects</span>
          {!userStats.isExamEnrolled && (
            <Lock className="w-3.5 h-3.5 text-[#F5B94C]" />
          )}
        </button>
      </div>

      {/* Header Info & Star Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-black text-[#F1F5F9] leading-tight uppercase">
            {selectedPracticeHub === 'school' ? 'SCHOOL CURRICULUM' : `${userStats.examTrack.toUpperCase()} PREP`}
          </h2>
          <p className="text-[12px] text-[#A8B4C4]">
            {selectedPracticeHub === 'school'
              ? 'Standard State Board chapters & homework'
              : 'Competitive exam syllabus, PYQs & shortcuts'}
          </p>
        </div>

        <div className="rounded-full bg-[#22304A] border border-[#F5B94C]/40 px-2.5 py-1 flex items-center gap-1">
          <Star className="w-4 h-4 text-[#F5B94C] fill-[#F5B94C]" />
          <span className="text-[12px] font-extrabold text-[#F5B94C]">{totalStars} Stars</span>
        </div>
      </div>

      {/* Realm Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {realms.map((r) => {
          const isSelected = selectedRealm === r.key;
          return (
            <button
              key={r.key}
              onClick={() => selectRealm(r.key)}
              className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all whitespace-nowrap border ${
                isSelected
                  ? 'bg-[#22C7E6] text-[#062A35] border-[#22C7E6]'
                  : 'bg-[#172236] text-[#A8B4C4] border-[#334155] hover:text-[#F1F5F9]'
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>

      {/* 2. Dynamic Companion Battle / Loot HUD */}
      <div
        onClick={() => {
          if (selectedRealm === 'All') setShowChestDialog(true);
        }}
        className={`w-full rounded-[12px] border p-3 flex items-center gap-3 transition-all ${
          selectedRealm === 'All' ? 'cursor-pointer hover:border-[#F5B94C]' : ''
        }`}
        style={{
          backgroundColor: '#22304A',
          borderColor: `${auraColor}55`,
        }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-[20px] flex-shrink-0"
          style={{ backgroundColor: `${auraColor}30` }}
        >
          {companion.emoji}
        </div>

        {selectedRealm === 'All' ? (
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-extrabold uppercase tracking-wide" style={{ color: auraColor }}>
                {companion.name} • BRONZE CHEST
              </span>
              <span className="font-bold text-[#F5B94C]">{totalStars}/15 ⭐</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#0B1220] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#22C7E6] to-[#F5B94C] transition-all"
                style={{ width: `${Math.min(100, (totalStars / 15) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-[#A8B4C4] font-semibold mt-1">
              {15 - totalStars > 0
                ? `⚡ ${15 - totalStars} more ⭐ to open loot chest!`
                : '🎉 Loot chest ready to open!'}
            </p>
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-extrabold text-[#EF4444] uppercase tracking-wide">
                REALM BOSS IS WEAKENED!
              </span>
              <span className="font-extrabold text-[#EF4444]">40% HP</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#0B1220] overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-[#EF4444] to-[#F59E0B] w-[40%]" />
            </div>
            <p className="text-[10px] text-[#A8B4C4] font-semibold mt-1">
              💥 1 battle to defeat! Defend the Realm
            </p>
          </div>
        )}

        <span className="text-[22px] flex-shrink-0">🎁</span>
      </div>

      {/* 3. Section Title: CHAPTER QUESTS */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5">
          <Flame className="w-5 h-5 text-[#F5B94C]" />
          <h3 className="text-[15px] font-black text-[#F1F5F9] uppercase tracking-wide">
            CHAPTER QUESTS
          </h3>
        </div>
        <span className="text-[12px] font-bold text-[#22C7E6]">
          {filteredQuests.filter((q) => !q.isLocked).length} Unlocked
        </span>
      </div>

      {/* 4. Chapter Quests List */}
      <div className="space-y-3.5">
        {filteredQuests.map((quest) => {
          const isFreeChapter = quest.chapterNumber === 1;
          const isGated = !userStats.isSubscribed && !isFreeChapter;
          const isFocused = quest.id === focusedChapterId;
          const mastery = calculateDojoMastery(quest.dojoQuestionsSolved || 0, userStats.grade);

          return (
            <div
              key={quest.id}
              className={`rounded-[16px] bg-[#172236] border p-4 space-y-3 transition-all ${
                isFocused
                  ? 'border-[#22C7E6] shadow-lg shadow-[#22C7E6]/20'
                  : quest.stars === 3
                  ? 'border-[#F5B94C]/40'
                  : 'border-[#334155]'
              }`}
            >
              {/* Chapter Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-[10px] bg-[#22304A] flex items-center justify-center text-[20px] flex-shrink-0">
                    {isGated ? <Lock className="w-4 h-4 text-[#A8B4C4]" /> : quest.icon || '📘'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-[#22C7E6] uppercase">
                        CH {quest.chapterNumber} • {quest.subject}
                      </span>
                      {isFocused && (
                        <span className="px-1.5 py-0.5 rounded-[4px] bg-[#22C7E6] text-[#062A35] text-[8px] font-extrabold uppercase">
                          ⚡ RECOMMENDED FOCUS
                        </span>
                      )}
                    </div>
                    <h4 className="text-[16px] font-bold text-[#F1F5F9] truncate leading-tight">
                      {quest.title}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 flex-shrink-0 pl-2">
                  {[0, 1, 2].map((idx) => (
                    <Star
                      key={idx}
                      className={`w-4 h-4 ${
                        idx < quest.stars ? 'text-[#F5B94C] fill-[#F5B94C]' : 'text-[#334155]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-[12px] text-[#A8B4C4] leading-relaxed">
                {quest.topics}
              </p>

              {/* Gated Stage Banner OR Normal Stages */}
              {isGated ? (
                <div
                  onClick={() => {
                    const placeholderStage = quest.stages[0] || {
                      stageNumber: 1,
                      name: quest.title,
                      type: 'SCOUT' as const,
                      difficulty: 'Easy',
                      questionCount: 10,
                      xpReward: 100,
                      isLocked: true,
                    };
                    setLockedPair({ quest, stage: placeholderStage });
                  }}
                  className="rounded-[10px] bg-[#0B1220]/60 border border-[#F5B94C]/35 p-3 flex items-center justify-between cursor-pointer hover:border-[#F5B94C] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#F5B94C]" />
                    <div>
                      <p className="text-[12px] font-bold text-[#F1F5F9]">Locked Stage</p>
                      <p className="text-[11px] font-extrabold text-[#F5B94C]">
                        Unlock Full Chapter with Practice Pass ➔
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-[6px] bg-[#D99B2B] text-[#3A2605] text-[10px] font-black">
                    Unlock Pass
                  </span>
                </div>
              ) : (
                <>
                  {/* Stages List (Scout, Warrior, Boss) */}
                  <div className="space-y-2">
                    {quest.stages.map((stage) => {
                      const isBoss = stage.type === 'BOSS';
                      const isCompleted = stage.isCompleted;
                      const isLockedStage = stage.isLocked;

                      let rowBorder = 'border-[#334155]';
                      let rowBg = 'bg-[#22304A]';
                      let titleColor = '#F1F5F9';

                      if (isCompleted) {
                        rowBg = 'bg-[#0B1220]';
                        rowBorder = 'border-[#39C88A]/40';
                      } else if (isBoss) {
                        rowBg = 'bg-[#D99B2B]/12';
                        rowBorder = 'border-[#F5B94C]/70';
                        titleColor = '#F5B94C';
                      }

                      return (
                        <div
                          key={stage.stageNumber}
                          onClick={() => {
                            if (isLockedStage) {
                              setLockedPair({ quest, stage });
                            } else {
                              setBriefingPair({ quest, stage });
                            }
                          }}
                          className={`w-full rounded-[12px] border p-2.5 flex items-center justify-between cursor-pointer hover:border-[#22C7E6]/60 transition-all ${rowBg} ${rowBorder}`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold ${
                                isCompleted
                                  ? 'bg-[#39C88A] text-[#062A35]'
                                  : isBoss
                                  ? 'bg-[#F5B94C] text-[#3A2605]'
                                  : stage.isCurrent
                                  ? 'bg-[#22C7E6] text-[#062A35]'
                                  : 'bg-[#334155] text-[#A8B4C4]'
                              }`}
                            >
                              {isCompleted ? (
                                <Check className="w-4 h-4 stroke-[3]" />
                              ) : isBoss ? (
                                '👹'
                              ) : (
                                stage.stageNumber
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[13px] font-bold" style={{ color: titleColor }}>
                                  {stage.name}
                                </span>
                                {isBoss && (
                                  <span className="px-1 py-0.5 rounded-[4px] bg-[#F5B94C] text-[#3A2605] text-[9px] font-extrabold">
                                    2X XP
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-[#A8B4C4]">
                                {stage.questionCount} Questions • +{stage.xpReward} XP
                              </span>
                            </div>
                          </div>

                          {/* Action tag */}
                          {isCompleted ? (
                            <span className="text-[11px] font-bold text-[#39C88A]">Re-play</span>
                          ) : isLockedStage ? (
                            <span className="px-2 py-1 rounded-[6px] bg-[#D99B2B]/70 text-[#3A2605] text-[10px] font-extrabold flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              <span>PASS ONLY</span>
                            </span>
                          ) : (
                            <span
                              className={`px-2.5 py-1 rounded-[8px] text-[11px] font-extrabold flex items-center gap-1 ${
                                isBoss
                                  ? 'bg-[#F5B94C] text-[#3A2605]'
                                  : 'bg-[#22C7E6] text-[#062A35]'
                              }`}
                            >
                              <span>BATTLE</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Dojo Section */}
                  <div className="pt-2 border-t border-[#334155]/40 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-[#22C7E6]">🥋 DOJO</span>
                        {/* Pips */}
                        <div className="flex items-center gap-1">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              mastery.pipsFilled >= 1 ? 'bg-[#CD7F32]' : 'bg-[#334155]'
                            }`}
                          />
                          <span
                            className={`w-2 h-2 rounded-full ${
                              mastery.pipsFilled >= 2 ? 'bg-[#C0C0C0]' : 'bg-[#334155]'
                            }`}
                          />
                          <span
                            className={`w-2 h-2 rounded-full ${
                              mastery.pipsFilled >= 3 ? 'bg-[#F5B94C]' : 'bg-[#334155]'
                            }`}
                          />
                        </div>
                        <span className="font-bold text-[#A8B4C4]">
                          {mastery.tier}
                        </span>
                      </div>

                      <span
                        className={`font-semibold ${
                          mastery.tier === 'GOLD' ? 'text-[#F5B94C]' : 'text-[#A8B4C4]'
                        }`}
                      >
                        {mastery.tier === 'GOLD'
                          ? `${mastery.solved}/${mastery.maxQuestions} Qs • Mastered 👑`
                          : `${mastery.solved}/${mastery.targetQuestions} Qs (+${mastery.nextTierReward} XP)`}
                      </span>
                    </div>

                    {/* Speed Blitz & Practice Dojo Buttons */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => {
                          if (!userStats.isSubscribed) {
                            setLockedPair({ quest, stage: quest.stages[0] });
                          } else {
                            startSpeedBlitz(quest);
                          }
                        }}
                        className="text-[11px] font-bold text-[#F5B94C] flex items-center gap-1 hover:underline"
                      >
                        {!userStats.isSubscribed ? <Lock className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                        <span>{!userStats.isSubscribed ? 'Speed Blitz (Pass)' : 'Speed Blitz'}</span>
                      </button>

                      <button
                        onClick={() => {
                          if (!userStats.isSubscribed) {
                            setLockedPair({ quest, stage: quest.stages[0] });
                          } else {
                            startChapterDojo(quest);
                          }
                        }}
                        className="px-3 py-1.5 rounded-[10px] bg-[#22C7E6]/15 border border-[#22C7E6]/50 text-[#22C7E6] font-bold text-[12px] hover:bg-[#22C7E6]/25 transition-all"
                      >
                        {!userStats.isSubscribed ? '🔒 Practice Dojo' : '🥋 Practice Dojo (5 Qs)'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* 5. Mystery Loot Chest Banner */}
      <div
        onClick={() => setShowChestDialog(true)}
        className="rounded-[14px] bg-gradient-to-r from-[#22304A] to-[#0B1220] border border-[#F5B94C]/35 p-3.5 flex items-center justify-between cursor-pointer hover:border-[#F5B94C] transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[#D99B2B]/20 flex items-center justify-center text-[#F5B94C]">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold text-[#F5B94C] uppercase">
              BRONZE SCHOLAR CHEST
            </span>
            <p className="text-[13px] font-bold text-[#F1F5F9]">
              Earn 3 more stars to crack open loot
            </p>
          </div>
        </div>
        <span className="text-[12px] font-extrabold text-[#F5B94C]">{totalStars}/12 ⭐</span>
      </div>

      {/* Dialogs */}
      {showChestDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
          onClick={() => setShowChestDialog(false)}
        >
          <div
            className="w-full max-w-[420px] rounded-[24px] bg-[#0F172A] border border-[#334155] p-5 shadow-2xl space-y-3.5 animate-in zoom-in-95 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <Gift className="w-6 h-6 text-[#F5B94C]" />
              <h2 className="text-[18px] font-bold text-[#F1F5F9]">Bronze Scholar Chest</h2>
            </div>
            <p className="text-[13px] text-[#A8B4C4] leading-relaxed">
              You currently have {totalStars} Stars! Earn 3 more stars by conquering Chapter 2 & 3 to crack open this mystery loot drop.
            </p>
            <div className="p-3 rounded-[10px] bg-[#22304A] flex items-center justify-between text-[12px]">
              <span className="font-bold text-[#F1F5F9]">Contains:</span>
              <span className="font-bold text-[#F5B94C]">
                +250 XP • 1 Streak Shield • Boss Avatar
              </span>
            </div>
            <button
              onClick={() => setShowChestDialog(false)}
              className="w-full py-2.5 rounded-[10px] bg-[#22C7E6] text-[#062A35] font-bold text-[13px]"
            >
              Keep Battling
            </button>
          </div>
        </div>
      )}

      {briefingPair && (
        <StageBriefingDialog
          quest={briefingPair.quest}
          stage={briefingPair.stage}
          studentName={userStats.name}
          studentPhone={userStats.parentPhone}
          onDismiss={() => setBriefingPair(null)}
          onOpenQuestMap={() => setBriefingPair(null)}
          onStartBattle={() => {
            const pair = briefingPair;
            setBriefingPair(null);
            startQuestStage(pair.quest, pair.stage);
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
