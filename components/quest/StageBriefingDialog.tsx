'use client';

import React from 'react';
import { ChapterQuest, QuestStage } from '@/types';
import { Star, BookOpen, Zap, Lightbulb, Trophy, Flame, ArrowRight, Play, Key } from 'lucide-react';

interface StageBriefingDialogProps {
  quest: ChapterQuest;
  stage: QuestStage;
  studentName?: string;
  studentPhone?: string;
  onDismiss: () => void;
  onOpenQuestMap: () => void;
  onStartBattle: () => void;
  onRedeemPassCode?: () => void;
}

export const StageBriefingDialog: React.FC<StageBriefingDialogProps> = ({
  quest,
  stage,
  onDismiss,
  onOpenQuestMap,
  onStartBattle,
  onRedeemPassCode,
}) => {
  const isBoss = stage.type === 'BOSS';
  const stageColor =
    stage.type === 'SCOUT'
      ? '#39C88A'
      : stage.type === 'WARRIOR'
      ? '#22C7E6'
      : '#F5B94C';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in"
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-[460px] rounded-[20px] bg-[#22304A] border p-5 shadow-2xl space-y-4 animate-in zoom-in-95"
        style={{ borderColor: `${stageColor}80` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span
              className="text-[11px] font-extrabold uppercase tracking-wider"
              style={{ color: stageColor }}
            >
              {isBoss ? '👹 BOSS BATTLE BRIEFING' : '⚡ STAGE BATTLE BRIEFING'}
            </span>
            <div className="flex items-center gap-0.5">
              {[0, 1, 2].map((idx) => (
                <Star
                  key={idx}
                  className={`w-3.5 h-3.5 ${
                    idx < quest.stars
                      ? 'text-[#F5B94C] fill-[#F5B94C]'
                      : 'text-[#334155]'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <span className="text-[24px] leading-none">{quest.icon || '📘'}</span>
            <div className="min-w-0">
              <h2 className="text-[18px] font-extrabold text-[#F1F5F9] leading-tight truncate">
                {quest.title}
              </h2>
              <p className="text-[10px] text-[#A8B4C4] uppercase font-bold tracking-wider">
                CH {quest.chapterNumber} • {quest.subject}
              </p>
            </div>
          </div>
        </div>

        {/* Stage Target Node Card */}
        <div
          className="w-full rounded-[12px] bg-[#0F172A] p-3 border flex items-center justify-between"
          style={{ borderColor: `${stageColor}50` }}
        >
          <div>
            <h3
              className="text-[15px] font-extrabold leading-tight"
              style={{ color: stageColor }}
            >
              {stage.name}
            </h3>
            <p className="text-[11px] text-[#A8B4C4]">Difficulty: {stage.difficulty}</p>
          </div>
          <div className="px-2.5 py-1 rounded-[8px] bg-[#D99B2B]/20 text-[#F5B94C] text-[12px] font-extrabold">
            +{stage.xpReward} XP
          </div>
        </div>

        {/* Mission Intel */}
        <div className="w-full rounded-[12px] bg-[#172236] p-3 space-y-2 text-left">
          <p className="text-[10px] font-bold text-[#A8B4C4] uppercase tracking-wider">
            MISSION INTEL
          </p>
          <div className="space-y-1.5 text-[11px] text-[#F1F5F9]">
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-[#22C7E6] flex-shrink-0" />
              <span>{stage.questionCount} Authentic PUP Exam Questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[#22C7E6] flex-shrink-0" />
              <span>Target: &lt;10s/Q for Speed Bonus</span>
            </div>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-3.5 h-3.5 text-[#22C7E6] flex-shrink-0" />
              <span>Tactical Hints Enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-[#22C7E6] flex-shrink-0" />
              <span>80%+ Accuracy to earn 3-Star Mastery</span>
            </div>
            {isBoss && (
              <div className="flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-[#F5B94C] flex-shrink-0" />
                <span className="text-[#F5B94C] font-semibold">
                  Boss PYQ Multiplier: 2x XP Active!
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Preview */}
        <div className="flex items-center justify-between text-[11px] text-[#A8B4C4]">
          <span>Realm Progress: {quest.progressPercent}% Conquered</span>
        </div>

        {/* Buttons */}
        <div className="space-y-2 pt-1">
          {stage.isLocked ? (
            <button
              onClick={() => {
                onDismiss();
                onRedeemPassCode?.();
              }}
              className="w-full py-3 rounded-[10px] bg-[#F5B94C] text-[#3A2605] font-extrabold text-[13px] flex items-center justify-center gap-2 hover:bg-[#FFE0A3] active:scale-[0.98] transition-all shadow-md shadow-[#F5B94C]/25"
            >
              <Key className="w-4 h-4" />
              <span>Enter Pass Code • कोड टाका</span>
            </button>
          ) : (
            <button
              onClick={() => {
                onDismiss();
                onStartBattle();
              }}
              className="w-full py-3 rounded-[10px] bg-[#22C7E6] text-[#062A35] font-extrabold text-[13px] flex items-center justify-center gap-2 hover:bg-[#8DE7F4] active:scale-[0.98] transition-all shadow-md shadow-[#22C7E6]/25"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>ENTER ARENA BATTLE</span>
            </button>
          )}

          <button
            onClick={() => {
              onDismiss();
              onOpenQuestMap();
            }}
            className="w-full py-2 text-[13px] font-bold text-[#22C7E6] hover:underline flex items-center justify-center gap-1.5"
          >
            <span>View Full Quest Map</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
