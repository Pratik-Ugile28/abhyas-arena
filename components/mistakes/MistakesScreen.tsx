'use client';

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Wand2,
  Bookmark,
  BookmarkCheck,
  RefreshCw,
  Clock,
  XCircle,
  CheckCircle2,
  TrendingUp,
  Flag,
} from 'lucide-react';
import { QuizQuestion, ChapterQuest, TabType } from '@/types';

interface SubjectBadgeInfo {
  key: string;
  shortName: string;
  emoji: string;
  count: number;
  color: string;
  bgClass: string;
}

function resolveSubjectBadge(subject: string, count: number = 0): SubjectBadgeInfo {
  const s = subject.toLowerCase();
  if (s.includes('math') || s.includes('गणित')) {
    return {
      key: 'Mathematics',
      shortName: 'Math',
      emoji: '🔢',
      count,
      color: 'text-cyan-primary',
      bgClass: 'bg-cyan-primary',
    };
  }
  if (s.includes('reasoning') || s.includes('logic') || s.includes('बुद्धिमत्ता')) {
    return {
      key: 'Reasoning',
      shortName: 'Logic',
      emoji: '🧠',
      count,
      color: 'text-cyan-primary-fixed',
      bgClass: 'bg-cyan-primary-fixed',
    };
  }
  if (s.includes('science') || s.includes('विज्ञान')) {
    return {
      key: 'Science',
      shortName: 'Science',
      emoji: '🧪',
      count,
      color: 'text-success-green',
      bgClass: 'bg-success-green',
    };
  }
  if (s.includes('language') || s.includes('english') || s.includes('marathi') || s.includes('hindi') || s.includes('भाषा')) {
    const name = s.includes('english')
      ? 'English'
      : s.includes('marathi')
      ? 'Marathi'
      : s.includes('hindi')
      ? 'Hindi'
      : 'Language';
    return {
      key: 'Language',
      shortName: name,
      emoji: '📖',
      count,
      color: 'text-gold-secondary',
      bgClass: 'bg-gold-secondary',
    };
  }
  if (s.includes('social') || s.includes('history') || s.includes('geography') || s.includes('परिसर')) {
    return {
      key: 'Social Studies',
      shortName: 'Social',
      emoji: '🌍',
      count,
      color: 'text-gold-container',
      bgClass: 'bg-gold-container',
    };
  }
  return {
    key: subject || 'General',
    shortName: subject ? subject.slice(0, 10) : 'General',
    emoji: '⚡',
    count,
    color: 'text-cyan-primary',
    bgClass: 'bg-cyan-primary',
  };
}

export interface MistakesScreenProps {
  mistakes: QuizQuestion[];
  mistakesCount: number;
  userGrade?: string;
  weakChapter?: ChapterQuest | null;
  bookmarkedQuestionIds?: string[];
  onToggleBookmark?: (q: QuizQuestion) => void;
  onNavigate: (tab: TabType) => void;
  onRetryQuestion: (q: QuizQuestion) => void;
  onStartMistakeBattle: (filter: string | null) => void;
  onStartPolishDrill?: (chapter: ChapterQuest) => void;
  onOpenQuestMap?: () => void;
}

export const MistakesScreen: React.FC<MistakesScreenProps> = ({
  mistakes,
  mistakesCount,
  userGrade = 'Class 5',
  weakChapter = null,
  bookmarkedQuestionIds = [],
  onToggleBookmark,
  onNavigate,
  onRetryQuestion,
  onStartMistakeBattle,
  onStartPolishDrill,
  onOpenQuestMap,
}) => {
  const [selectedFilter, setSelectedFilter] = useState('All');

  // Dynamically group mistakes by canonical subject
  const groupedMistakes = useMemo(() => {
    const map: Record<string, QuizQuestion[]> = {};
    mistakes.forEach((q) => {
      let key = 'General';
      const s = q.subject.toLowerCase();
      if (s.includes('math') || s.includes('गणित')) key = 'Mathematics';
      else if (s.includes('reasoning') || s.includes('logic') || s.includes('बुद्धिमत्ता')) key = 'Reasoning';
      else if (s.includes('science') || s.includes('विज्ञान')) key = 'Science';
      else if (s.includes('language') || s.includes('english') || s.includes('marathi') || s.includes('hindi') || s.includes('भाषा')) key = 'Language';
      else if (s.includes('social') || s.includes('history')) key = 'Social Studies';

      if (!map[key]) map[key] = [];
      map[key].push(q);
    });
    return map;
  }, [mistakes]);

  const subjectBadges = useMemo(() => {
    return Object.entries(groupedMistakes)
      .map(([canonicalKey, list]) => resolveSubjectBadge(canonicalKey, list.length))
      .sort((a, b) => b.count - a.count);
  }, [groupedMistakes]);

  const filteredList = useMemo(() => {
    if (selectedFilter === 'All') return mistakes;
    return (
      groupedMistakes[selectedFilter] ||
      mistakes.filter((m) => m.subject.toLowerCase().includes(selectedFilter.toLowerCase()))
    );
  }, [selectedFilter, mistakes, groupedMistakes]);

  const selectedBadge = subjectBadges.find((b) => b.key === selectedFilter);
  const count = userGrade.includes('4') || userGrade.includes('5') ? 3 : 5;

  let buttonLabel = 'Practice My Mistakes';
  let buttonAction = () => onStartMistakeBattle(selectedFilter === 'All' ? null : selectedFilter);
  let buttonIcon = <Flag className="w-5 h-5 mr-2" />;

  if (filteredList.length > 0) {
    if (selectedFilter !== 'All' && selectedBadge) {
      buttonLabel = `Practice ${selectedBadge.shortName} Mistakes (${filteredList.length})`;
    } else if (selectedFilter !== 'All') {
      buttonLabel = `Practice ${selectedFilter} Mistakes (${filteredList.length})`;
    } else {
      buttonLabel = `Practice My Mistakes (${mistakesCount})`;
    }
  } else if (mistakes.length > 0) {
    buttonLabel = `Practice All Mistakes (${mistakesCount})`;
  } else if (weakChapter) {
    buttonLabel = `🎯 Polish ${weakChapter.title} (${weakChapter.stars}★ → ${weakChapter.stars + 1}★) • ${count} Qs`;
    buttonAction = () => {
      if (onStartPolishDrill) onStartPolishDrill(weakChapter);
      else onStartMistakeBattle(null);
    };
    buttonIcon = <Wand2 className="w-5 h-5 mr-2" />;
  } else {
    buttonLabel = '🚀 All Mastered! Unlock Next Chapter';
    buttonAction = () => {
      if (onOpenQuestMap) onOpenQuestMap();
      else onNavigate(TabType.PRACTICE);
    };
    buttonIcon = <CheckCircle2 className="w-5 h-5 mr-2" />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface-dark text-text-primary px-4 py-3 max-w-[480px] mx-auto select-none space-y-3.5 pb-20">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <BookOpen className="w-5 h-5 text-cyan-primary" />
          <h1 className="text-xl font-bold text-text-primary">My Mistake Book</h1>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed mt-1">
          Turn every slip into your secret superpower! Every retry builds exam resilience.
        </p>
      </div>

      {/* Revision Vault Card */}
      <div className="rounded-[16px] bg-gradient-to-br from-surface-container-high to-surface-container border border-outline p-4 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-extrabold text-cyan-primary tracking-wide">
              REVISION VAULT
            </p>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-text-primary">{mistakesCount}</span>
              <span className="text-xs text-text-secondary">Questions to Review</span>
            </div>
          </div>
          <div className="p-2.5 rounded-[12px] bg-surface-container-high text-cyan-primary">
            <Wand2 className="w-5 h-5" />
          </div>
        </div>

        {/* Dynamic Proportion Bar */}
        {subjectBadges.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex h-2.5 w-full rounded-full overflow-hidden bg-surface-container-lowest">
              {subjectBadges.map((badge) => {
                const pct = Math.max(5, (badge.count / (mistakes.length || 1)) * 100);
                return (
                  <div
                    key={badge.key}
                    style={{ width: `${pct}%` }}
                    className={`${badge.bgClass} h-full`}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between flex-wrap gap-1">
              {subjectBadges.map((badge) => (
                <span
                  key={badge.key}
                  className={`text-[11px] font-bold ${badge.color}`}
                >
                  {badge.emoji} {badge.shortName} {badge.count}
                </span>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={buttonAction}
          className={`w-full py-3.5 rounded-[12px] font-bold text-sm flex items-center justify-center transition-all shadow-md active:scale-[0.99] ${
            mistakesCount > 0
              ? 'bg-cyan-primary text-cyan-on-primary hover:brightness-110 shadow-cyan-primary/20'
              : 'bg-gold-secondary text-gold-on-secondary hover:brightness-110 shadow-gold-secondary/20'
          }`}
        >
          {buttonIcon}
          <span>{buttonLabel}</span>
        </button>
      </div>

      {/* Personal Best Comparison Box */}
      <div className="rounded-[16px] bg-surface-container-high border border-outline p-3.5 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-gold-secondary">
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4 text-gold-secondary" />
            <span>NEW PERSONAL BEST!</span>
          </div>
          <span>+15 XP</span>
        </div>
        <p className="text-sm font-bold text-text-primary">Mastered in Fractions</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-[10px] bg-surface-container-lowest border border-error-red/30 p-2.5">
            <p className="text-[10px] font-bold text-error-red">First Try</p>
            <p className="text-base font-bold text-text-primary">14.2 sec</p>
            <p className="text-[11px] text-text-secondary">Calculation drift</p>
          </div>
          <div className="rounded-[10px] bg-surface-container-lowest border border-cyan-primary/30 p-2.5">
            <p className="text-[10px] font-bold text-cyan-primary">Retried & Conquered</p>
            <p className="text-base font-bold text-cyan-primary">9.7 sec</p>
            <p className="text-[11px] text-text-secondary">Instant mental jump</p>
          </div>
        </div>
      </div>

      {/* Realm Filter Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
        <button
          onClick={() => setSelectedFilter('All')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
            selectedFilter === 'All'
              ? 'bg-cyan-primary border-cyan-primary text-cyan-on-primary font-extrabold'
              : 'bg-surface-container border-outline text-text-secondary hover:text-text-primary'
          }`}
        >
          All Realms ({mistakes.length})
        </button>
        {subjectBadges.map((badge) => {
          const isSelected = selectedFilter === badge.key;
          return (
            <button
              key={badge.key}
              onClick={() => setSelectedFilter(badge.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${
                isSelected
                  ? 'bg-cyan-primary border-cyan-primary text-cyan-on-primary font-extrabold'
                  : 'bg-surface-container border-outline text-text-secondary hover:text-text-primary'
              }`}
            >
              {badge.emoji} {badge.shortName} ({badge.count})
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredList.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle2 className="w-11 h-11 text-success-green mb-2" />
          <p className="text-sm font-bold text-success-green">
            {selectedFilter === 'All' ? 'All Slips Conquered!' : `No pending slips in ${selectedFilter}!`}
          </p>
          <p className="text-xs text-text-secondary max-w-xs mt-1">
            {selectedFilter === 'All'
              ? 'Your mistake vault is clean. Keep dominating in practice!'
              : `You have conquered all ${selectedFilter} mistakes. Exam-ready!`}
          </p>
        </div>
      )}

      {/* Mistakes List */}
      <div className="space-y-3">
        {filteredList.map((q) => {
          const isBookmarked = bookmarkedQuestionIds.includes(q.id) || q.isBookmarked;
          const badge = resolveSubjectBadge(q.subject, 1);
          const cleanTopic = q.topic.includes('•') ? q.topic.split('•')[1].trim() : q.topic;

          return (
            <div
              key={q.id}
              className="rounded-[16px] bg-surface-container border border-outline p-3.5 space-y-2.5 shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface-container-high ${badge.color}`}
                  >
                    {badge.emoji} {badge.shortName} • {cleanTopic || q.topic}
                  </span>
                  <span className="text-[10px] text-text-secondary">
                    {q.attemptDate || 'recent'}
                  </span>
                </div>

                <button
                  onClick={() => onToggleBookmark && onToggleBookmark(q)}
                  className="p-1 text-text-secondary hover:text-gold-secondary transition-colors"
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="w-4 h-4 text-gold-secondary" />
                  ) : (
                    <Bookmark className="w-4 h-4 text-text-secondary" />
                  )}
                </button>
              </div>

              <p className="text-sm font-semibold text-text-primary leading-snug">
                {q.question}
              </p>

              {/* Reasoning Options Preview Row */}
              {q.subject.toLowerCase().startsWith('reasoning') && q.options && (
                <div className="grid grid-cols-4 gap-2">
                  {q.options.map((opt) => {
                    const isWrongChoice = opt.key === q.userWrongChoice;
                    const isCorrect = opt.key === q.correctAnswer;
                    return (
                      <div
                        key={opt.key}
                        className={`h-12 rounded-lg bg-surface-container-high border flex items-center justify-center font-bold text-sm ${
                          isWrongChoice
                            ? 'border-error-red text-error-red'
                            : isCorrect
                            ? 'border-cyan-primary text-cyan-primary'
                            : 'border-transparent text-text-secondary'
                        }`}
                      >
                        {opt.text}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Attempt Telemetry Row */}
              <div className="flex items-center space-x-3 text-[11px] pt-1">
                <div className="flex items-center space-x-1 text-text-secondary">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Time: {q.attemptTimeSeconds || 20}s</span>
                </div>
                <div className="flex items-center space-x-1 text-error-red">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Selected: {q.userWrongChoice || 'B'}</span>
                </div>
                <div className="flex items-center space-x-1 text-cyan-primary font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Key: {q.correctAnswer}</span>
                </div>
              </div>

              {/* Retry Button */}
              <button
                onClick={() => onRetryQuestion(q)}
                className="w-full py-2.5 rounded-[10px] bg-cyan-primary text-cyan-on-primary font-bold text-xs flex items-center justify-center space-x-1.5 hover:brightness-110 active:scale-[0.99] transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Question</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
