'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Clock,
  Bookmark,
  BookmarkCheck,
  Lightbulb,
  CheckCircle2,
  Check,
  XCircle,
  Sparkles,
  Trophy,
  Star,
  ArrowRight,
  Flame,
  Zap,
} from 'lucide-react';
import { QuizQuestion, TabType, QuestionXpCalculator } from '@/types';

export interface PracticeSessionConfig {
  questTitle?: string;
  stageSubtitle?: string;
  isMistakeBattle?: boolean;
  isArenaBattle?: boolean;
  isSpeedBlitz?: boolean;
  isReplay?: boolean;
  isDojo?: boolean;
  previousClaimedMasteryBonus?: number;
  initialIndex?: number;
  initialElapsedTime?: number;
  initialCorrectCount?: number;
  initialXpEarned?: number;
  bookmarkedQuestionIds?: string[];
}

export interface PracticeScreenProps extends PracticeSessionConfig {
  questions: QuizQuestion[];
  onToggleBookmark?: (q: QuizQuestion) => void;
  onNavigate: (tab: TabType) => void;
  onExitRequest: () => void;
  onSaveAndExit?: (currentIndex: number, correctCount: number, totalXpEarned: number, elapsedTime: number) => void;
  onAbandon?: () => void;
  onAddXP: (xp: number) => void;
  onAddMistake: (q: QuizQuestion, wrongKey: string, timeSeconds: number) => void;
  onWrongAnswer?: () => void;
  onConquerMistake?: (id: string) => void;
  onCompleteArenaRound?: (accuracy: number, pointsEarned: number, questionCount: number) => void;
  onCompleteStage: (accuracy: number, xpEarned: number) => void;
  onFastAnswer?: (time: number) => void;
  onComboReached?: (combo: number) => void;
}

export const PracticeScreen: React.FC<PracticeScreenProps> = ({
  questions,
  questTitle = 'Practice Session',
  stageSubtitle = 'Maharashtra Scholarship Practice',
  isMistakeBattle = false,
  isArenaBattle = false,
  isSpeedBlitz = false,
  isReplay = false,
  isDojo = false,
  previousClaimedMasteryBonus = 0,
  initialIndex = 0,
  initialElapsedTime = 0,
  initialCorrectCount = 0,
  initialXpEarned = 0,
  bookmarkedQuestionIds = [],
  onToggleBookmark,
  onNavigate,
  onExitRequest,
  onSaveAndExit,
  onAbandon,
  onAddXP,
  onAddMistake,
  onWrongAnswer,
  onConquerMistake,
  onCompleteArenaRound,
  onCompleteStage,
  onFastAnswer,
  onComboReached,
}) => {
  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-surface-dark px-4 text-center">
        <p className="text-text-secondary mb-4 text-sm">Loading chapter questions...</p>
        <button
          onClick={onExitRequest}
          className="px-5 py-2.5 rounded-xl bg-surface-container-high border border-outline text-text-primary text-sm font-semibold hover:bg-surface-container-highest transition-colors"
        >
          Return to Quest Map
        </button>
      </div>
    );
  }

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isReplayMode, setIsReplayMode] = useState(isReplay);
  const [currentClaimedBonus, setCurrentClaimedBonus] = useState(previousClaimedMasteryBonus);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(initialElapsedTime);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [combo, setCombo] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [lastAwardedXp, setLastAwardedXp] = useState(0);
  const [lastWasHintUsed, setLastWasHintUsed] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [correctCount, setCorrectCount] = useState(initialCorrectCount);
  const [totalXpEarned, setTotalXpEarned] = useState(initialXpEarned);

  // Timer Ref
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());
  const accumulatedTimeMsRef = useRef<number>(initialElapsedTime * 1000);

  useEffect(() => {
    if (isTimerRunning && !isAnswered && !sessionCompleted) {
      questionStartTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const delta = now - questionStartTimeRef.current;
        questionStartTimeRef.current = now;
        accumulatedTimeMsRef.current += delta;
        setElapsedTime(Math.floor(accumulatedTimeMsRef.current / 1000));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, isAnswered, sessionCompleted]);

  const currentQ = questions[currentIndex] || questions[0];
  const isBossQuestion =
    (currentQ.stageType && currentQ.stageType.toLowerCase() === 'boss') ||
    stageSubtitle.toLowerCase().includes('boss');
  const isCurrentBookmarked =
    bookmarkedQuestionIds.includes(currentQ.id) || currentQ.isBookmarked;
  const isDojoSession =
    isDojo ||
    questTitle.toLowerCase().includes('dojo') ||
    stageSubtitle.toLowerCase().includes('dojo');

  const pauseTimer = () => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
    }
  };

  const handleSelectOption = (optKey: string) => {
    if (isAnswered) return;

    setSelectedKey(optKey);
    setIsAnswered(true);
    setIsTimerRunning(false);

    const correct = optKey === currentQ.correctAnswer;
    setIsCorrect(correct);

    const currentElapsed = Math.max(1, elapsedTime);

    if (correct) {
      setCorrectCount((prev) => prev + 1);
      const isFast = currentElapsed < 4;
      if (isFast && onFastAnswer) {
        onFastAnswer(currentElapsed);
      }

      const speedBonus = currentElapsed < 12 ? 8 : currentElapsed <= 25 ? 4 : 0;
      const awarded = QuestionXpCalculator.calculateAwardedXp(
        currentQ.difficulty || 'Medium',
        isBossQuestion,
        isArenaBattle,
        isSpeedBlitz,
        isReplayMode,
        isDojoSession,
        isFast,
        showHint,
        combo,
        speedBonus
      );

      if (!showHint && !isReplayMode && !isArenaBattle && !isSpeedBlitz && !isDojoSession) {
        const nextCombo = combo + 1;
        setCombo(nextCombo);
        if (nextCombo >= 5 && onComboReached) {
          onComboReached(nextCombo);
        }
      }

      if (isMistakeBattle) {
        setLastAwardedXp(15);
        setLastWasHintUsed(false);
        if (onConquerMistake) onConquerMistake(currentQ.id);
        setTotalXpEarned((prev) => prev + 15);
      } else {
        setLastAwardedXp(awarded);
        setLastWasHintUsed(showHint);
        onAddXP(awarded);
        setTotalXpEarned((prev) => prev + awarded);
      }
    } else {
      setCombo(0);
      setLastAwardedXp(0);
      setLastWasHintUsed(false);
      if (!isMistakeBattle) {
        onAddMistake(currentQ, optKey, currentElapsed);
      }
      if (!isArenaBattle && onWrongAnswer) {
        onWrongAnswer();
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedKey(null);
      setIsAnswered(false);
      setIsCorrect(false);
      setElapsedTime(0);
      accumulatedTimeMsRef.current = 0;
      questionStartTimeRef.current = Date.now();
      setIsTimerRunning(true);
      setShowHint(false);
    } else {
      setSessionCompleted(true);
    }
  };

  // Completion Screen
  if (sessionCompleted) {
    const safeCorrect = Math.min(correctCount, questions.length);
    const accuracy = questions.length > 0 ? Math.round((safeCorrect / questions.length) * 100) : 100;
    const starsEarned = accuracy >= 80 ? 3 : accuracy >= 55 ? 2 : accuracy >= 40 ? 1 : 0;
    const arenaPointsEarned = safeCorrect === 0 ? 0 : totalXpEarned;

    return (
      <SessionResultsView
        questTitle={questTitle}
        totalQuestions={questions.length}
        accuracy={accuracy}
        starsEarned={starsEarned}
        correctCount={safeCorrect}
        totalXpEarned={totalXpEarned}
        isArenaBattle={isArenaBattle}
        isSpeedBlitz={isSpeedBlitz}
        isMistakeBattle={isMistakeBattle}
        isBossQuestion={isBossQuestion}
        isReplayMode={isReplayMode}
        isDojoSession={isDojoSession}
        previousClaimedMasteryBonus={currentClaimedBonus}
        combo={combo}
        arenaPointsEarned={arenaPointsEarned}
        onRetry={() => {
          const eligibleTierBonus =
            isMistakeBattle || isDojoSession || accuracy < 40
              ? 0
              : isBossQuestion && accuracy >= 80
              ? 50
              : isBossQuestion && accuracy >= 55
              ? 25
              : accuracy >= 80
              ? 20
              : accuracy >= 55
              ? 10
              : 0;

          setCurrentClaimedBonus(Math.max(currentClaimedBonus, eligibleTierBonus));
          setCurrentIndex(0);
          setSelectedKey(null);
          setIsAnswered(false);
          setIsCorrect(false);
          setElapsedTime(0);
          accumulatedTimeMsRef.current = 0;
          questionStartTimeRef.current = Date.now();
          setCombo(0);
          setSessionCompleted(false);
          setCorrectCount(0);
          setTotalXpEarned(0);
          setIsTimerRunning(true);
          if (accuracy >= 40 && !isArenaBattle && !isMistakeBattle && !isSpeedBlitz && !isDojoSession) {
            setIsReplayMode(true);
          }
        }}
        onExitRequest={onExitRequest}
      />
    );
  }

  // Timer format
  const formattedTime =
    elapsedTime >= 60
      ? `${Math.floor(elapsedTime / 60)}:${String(elapsedTime % 60).padStart(2, '0')}`
      : `${String(elapsedTime).padStart(2, '0')}s`;

  const timerColorClass =
    elapsedTime < 12
      ? 'text-gold-secondary'
      : elapsedTime <= 25
      ? 'text-cyan-primary'
      : 'text-text-secondary';

  const qDifficulty = (currentQ.difficulty || 'Medium').toLowerCase();
  const hintDeduction = isBossQuestion
    ? 9
    : qDifficulty.includes('hard') || qDifficulty.includes('pyq')
    ? 5
    : qDifficulty.includes('medium')
    ? 3
    : 2;

  return (
    <div className="flex flex-col min-h-screen bg-surface-dark text-text-primary px-4 py-3 max-w-[480px] mx-auto select-none">
      {/* Session Header */}
      <div className="flex items-center justify-between rounded-[14px] bg-surface-container-high border border-outline px-3 py-2 mb-3">
        <button
          onClick={() => {
            pauseTimer();
            setShowExitConfirmation(true);
          }}
          className="p-1 rounded-lg text-text-secondary hover:text-text-primary transition-colors"
          title="Exit practice"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex-1 mx-3 truncate">
          <h2 className="text-sm font-bold text-text-primary truncate">{questTitle}</h2>
          <p className="text-xs text-text-secondary">
            Question {currentIndex + 1} of {questions.length}
          </p>
        </div>

        <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-[10px] bg-surface-container">
          <Clock className={`w-3.5 h-3.5 ${timerColorClass}`} />
          <span className={`text-xs font-bold font-mono ${timerColorClass}`}>{formattedTime}</span>
        </div>
      </div>

      {/* Progress Bar */}
      {questions.length <= 10 ? (
        <div className="flex items-center space-x-1 mb-3">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 h-1.5 rounded-full transition-colors ${
                idx < currentIndex
                  ? 'bg-success-green'
                  : idx === currentIndex
                  ? 'bg-cyan-primary'
                  : 'bg-surface-container-high'
              }`}
            />
          ))}
        </div>
      ) : (
        <div className="w-full h-2 rounded-full bg-surface-container-lowest mb-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-primary to-cyan-primary-fixed transition-all duration-300"
            style={{ width: `${Math.round(((currentIndex + 1) / questions.length) * 100)}%` }}
          />
        </div>
      )}

      {/* Target & Combo Banner */}
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="px-2.5 py-1 rounded-[12px] bg-surface-container border border-outline truncate max-w-[200px]">
          <span
            className={`font-bold ${
              isBossQuestion || isArenaBattle || isSpeedBlitz
                ? 'text-gold-secondary'
                : 'text-cyan-primary'
            }`}
          >
            {stageSubtitle}
          </span>
        </div>

        <div
          className={`px-2.5 py-1 rounded-[12px] font-extrabold ${
            isReplayMode
              ? 'bg-surface-container-high text-gold-secondary'
              : isSpeedBlitz || isArenaBattle
              ? 'bg-gold-container/20 text-gold-secondary'
              : combo >= 3
              ? 'bg-gold-container text-gold-on-secondary'
              : 'bg-surface-container-high text-text-primary'
          }`}
        >
          {isReplayMode
            ? '🔄 Replay (2 XP/Q)'
            : isSpeedBlitz || isArenaBattle
            ? '⚡ <12s: +8 XP'
            : isDojoSession
            ? '⚡ <4s: +3 XP'
            : combo > 0
            ? `🔥 ${combo} COMBO!`
            : '🎯 Aim: <12s'}
        </div>
      </div>

      {/* Question Card */}
      <div
        className={`rounded-[18px] bg-surface-container p-4 mb-3 border ${
          isBossQuestion ? 'border-gold-secondary/60' : 'border-outline'
        }`}
      >
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            <span className="px-1.5 py-0.5 rounded-md bg-surface-container-high text-[10px] font-bold text-text-secondary">
              {currentQ.code || 'PUP-SCHOLAR'}
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-surface-container-high text-[10px] font-bold text-cyan-primary">
              {currentQ.grade}
            </span>
            {isSpeedBlitz ? (
              <span className="px-1.5 py-0.5 rounded-md bg-gold-secondary text-[10px] font-black text-gold-on-secondary">
                ⚡ SPEED BLITZ
              </span>
            ) : isArenaBattle ? (
              <span className="px-1.5 py-0.5 rounded-md bg-gold-secondary text-[10px] font-black text-gold-on-secondary">
                ⚔️ ARENA TRIAL
              </span>
            ) : isBossQuestion ? (
              <span className="px-1.5 py-0.5 rounded-md bg-gold-secondary text-[10px] font-black text-gold-on-secondary">
                2X XP BOSS
              </span>
            ) : (
              <span className="px-1.5 py-0.5 rounded-md bg-surface-container-high text-[10px] font-bold text-gold-secondary">
                {currentQ.difficulty}
              </span>
            )}
          </div>

          <button
            onClick={() => onToggleBookmark && onToggleBookmark(currentQ)}
            className="p-1 text-text-secondary hover:text-gold-secondary transition-colors"
          >
            {isCurrentBookmarked ? (
              <BookmarkCheck className="w-4 h-4 text-gold-secondary" />
            ) : (
              <Bookmark className="w-4 h-4 text-text-secondary" />
            )}
          </button>
        </div>

        <p className="text-xs font-bold text-cyan-primary mb-1">{currentQ.topic}</p>
        <p className="text-base sm:text-lg font-extrabold text-text-primary leading-snug mb-3">
          {currentQ.question}
        </p>

        {/* Hint Drawer */}
        {!isArenaBattle && currentQ.hint && (
          <div>
            {showHint ? (
              <div className="flex items-start space-x-2 rounded-[10px] bg-surface-container-high border border-gold-secondary/50 p-2.5 mt-2">
                <Lightbulb className="w-4 h-4 text-gold-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-gold-secondary">
                    💡 ASSISTED HINT (-{hintDeduction} XP on correct answer)
                  </p>
                  <p className="text-xs text-text-primary leading-relaxed mt-0.5">{currentQ.hint}</p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowHint(true)}
                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-gold-secondary text-[11px] font-bold transition-colors"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>💡 Unlock Hint (-{hintDeduction} XP)</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Option Cards */}
      <div className="mb-3">
        <p className="text-xs font-semibold text-text-secondary mb-2">Select Option:</p>
        <div className="flex flex-col space-y-2.5" role="radiogroup">
          {currentQ.options.map((opt) => {
            const isPicked = selectedKey === opt.key;
            const isActualCorrect = opt.key === currentQ.correctAnswer;
            const isSelectedCorrect = isAnswered && isPicked && isActualCorrect;

            let cardStyles = 'bg-surface-container border-outline text-text-primary';
            let circleStyles = 'bg-surface-container-high text-text-primary';

            if (!isAnswered && isPicked) {
              cardStyles = 'bg-cyan-primary/20 border-cyan-primary text-text-primary';
            } else if (isSelectedCorrect) {
              cardStyles = 'bg-cyan-primary border-cyan-primary text-cyan-on-primary';
              circleStyles = 'bg-cyan-on-primary text-cyan-primary';
            } else if (isAnswered && isActualCorrect) {
              cardStyles = 'bg-success-green/20 border-success-green text-text-primary';
              circleStyles = 'bg-success-green/30 text-success-green';
            } else if (isAnswered && isPicked && !isCorrect) {
              cardStyles = 'bg-error-red/20 border-error-red text-text-primary';
              circleStyles = 'bg-error-red/30 text-error-red';
            }

            return (
              <div
                key={opt.key}
                role="radio"
                aria-checked={isPicked}
                onClick={() => handleSelectOption(opt.key)}
                className={`flex items-center justify-between p-3.5 rounded-[14px] border cursor-pointer transition-all ${cardStyles}`}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 transition-all ${circleStyles}`}
                  >
                    {opt.key}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm sm:text-base ${isSelectedCorrect ? 'font-extrabold text-cyan-on-primary' : 'font-medium'}`}>
                      {opt.text}
                    </p>
                    {isSelectedCorrect && (
                      <p className="text-[11px] font-bold text-cyan-on-primary/80 mt-0.5">
                        {isArenaBattle
                          ? elapsedTime < 12
                            ? `⚡ +${lastAwardedXp} Pts! Lightning Strike!`
                            : `⚔️ +${lastAwardedXp} Pts! Arena Strike!`
                          : isSpeedBlitz
                          ? `⚡ +${lastAwardedXp} XP! Lightning Blitz!`
                          : isMistakeBattle
                          ? '✨ Conquered! Removed from Vault'
                          : isDojoSession
                          ? `🥋 Dojo Strike! +${lastAwardedXp} XP`
                          : 'Your Selection'}
                      </p>
                    )}
                  </div>
                </div>

                {isAnswered && (
                  <div className="ml-2 flex-shrink-0">
                    {isSelectedCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-cyan-on-primary" />
                    ) : isActualCorrect ? (
                      <Check className="w-5 h-5 text-success-green" />
                    ) : isPicked ? (
                      <XCircle className="w-5 h-5 text-error-red" />
                    ) : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Feedback & Explanation Banner */}
      {isAnswered && (
        <div className="rounded-[16px] bg-surface-container-high border border-outline p-3.5 mb-4 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2.5">
              <div
                className={`w-10 h-10 rounded-[14px] flex items-center justify-center ${
                  isCorrect ? 'bg-gold-container text-cyan-on-primary' : 'bg-surface-container-lowest text-cyan-primary'
                }`}
              >
                {isCorrect ? <Sparkles className="w-5 h-5" /> : <Flame className="w-5 h-5" />}
              </div>
              <div>
                <p
                  className={`text-sm sm:text-base font-extrabold ${
                    isCorrect ? 'text-success-green' : 'text-gold-secondary'
                  }`}
                >
                  {isCorrect
                    ? isSpeedBlitz
                      ? elapsedTime < 12
                        ? '⚡ LIGHTNING FAST! (+8 XP)'
                        : 'SPEED BLITZ HIT! 🎯'
                      : isArenaBattle
                      ? '⚡ ARENA POINT SCORED! ⚔️'
                      : isMistakeBattle
                      ? 'SLIP CONQUERED! 🛡️'
                      : 'EXCELLENT!'
                    : 'LEARNING OPPORTUNITY!'}
                </p>
                <p className="text-xs text-text-secondary font-bold">
                  Answered in {elapsedTime}s
                </p>
              </div>
            </div>

            {isCorrect && (
              <span className="px-2.5 py-1 rounded-[10px] bg-gold-secondary text-gold-on-secondary text-xs font-black">
                {lastWasHintUsed ? `+${lastAwardedXp} XP (Assisted)` : `+${lastAwardedXp} XP`}
              </span>
            )}
          </div>

          {currentQ.explanation && (
            <div className="rounded-[10px] bg-surface-dark p-2.5 mb-3">
              <p className="text-[11px] font-bold text-cyan-primary mb-0.5">Explanation:</p>
              <p className="text-xs text-text-primary leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          <button
            onClick={handleNextQuestion}
            className="w-full py-3.5 rounded-[14px] bg-cyan-primary text-cyan-on-primary font-bold text-sm flex items-center justify-center space-x-1.5 shadow-lg shadow-cyan-primary/20 hover:brightness-110 active:scale-[0.99] transition-all"
          >
            <span>{currentIndex < questions.length - 1 ? 'Next Question' : 'Complete Stage'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Exit Confirmation Dialog */}
      {showExitConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[20px] bg-surface-container-high border border-outline p-5 shadow-2xl">
            <h3 className="text-base font-bold text-text-primary mb-2">
              {isArenaBattle
                ? 'Abandon Arena Match?'
                : isAnswered && currentIndex >= questions.length - 1
                ? '🎉 Stage Complete!'
                : '⏸️ Pause Battle Stage?'}
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed mb-4">
              {isArenaBattle
                ? 'Arena qualifying matches cannot be paused. Abandoning will forfeit your current round.'
                : isAnswered && currentIndex >= questions.length - 1
                ? 'You have completed all questions in this stage. Tap below to view your results.'
                : `You are on Question ${currentIndex + 1} of ${questions.length}. Would you like to save your progress and resume later?`}
            </p>

            <div className="flex flex-col space-y-2">
              <button
                onClick={() => {
                  setShowExitConfirmation(false);
                  if (onSaveAndExit) {
                    const targetIndex = isAnswered ? currentIndex + 1 : currentIndex;
                    if (targetIndex >= questions.length) {
                      setSessionCompleted(true);
                    } else {
                      onSaveAndExit(targetIndex, correctCount, totalXpEarned, isAnswered ? 0 : elapsedTime);
                      onExitRequest();
                    }
                  } else {
                    onExitRequest();
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-cyan-primary text-cyan-on-primary text-xs font-bold hover:brightness-110 transition-all"
              >
                {isArenaBattle
                  ? 'Abandon Battle'
                  : isAnswered && currentIndex >= questions.length - 1
                  ? '🏁 View Results'
                  : '💾 Save & Resume Later'}
              </button>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setShowExitConfirmation(false);
                    if (onAbandon) onAbandon();
                    onExitRequest();
                  }}
                  className="flex-1 py-2 rounded-xl bg-surface-container text-error-red text-xs font-semibold hover:bg-surface-container-highest transition-colors"
                >
                  Abandon
                </button>
                <button
                  onClick={() => {
                    setShowExitConfirmation(false);
                    if (!isAnswered) setIsTimerRunning(true);
                  }}
                  className="flex-1 py-2 rounded-xl bg-surface-container text-text-primary text-xs font-semibold hover:bg-surface-container-highest transition-colors"
                >
                  Keep Battling
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Session Results View Component
interface SessionResultsViewProps {
  questTitle: string;
  totalQuestions: number;
  accuracy: number;
  starsEarned: number;
  correctCount: number;
  totalXpEarned: number;
  isArenaBattle: boolean;
  isSpeedBlitz: boolean;
  isMistakeBattle: boolean;
  isBossQuestion: boolean;
  isReplayMode: boolean;
  isDojoSession: boolean;
  previousClaimedMasteryBonus: number;
  combo: number;
  arenaPointsEarned: number;
  onRetry: () => void;
  onExitRequest: () => void;
}

const SessionResultsView: React.FC<SessionResultsViewProps> = ({
  questTitle,
  totalQuestions,
  accuracy,
  starsEarned,
  correctCount,
  totalXpEarned,
  isArenaBattle,
  isSpeedBlitz,
  isMistakeBattle,
  isBossQuestion,
  isReplayMode,
  isDojoSession,
  previousClaimedMasteryBonus,
  combo,
  arenaPointsEarned,
  onRetry,
  onExitRequest,
}) => {
  const isPassed = accuracy >= 40;

  const eligibleTierBonus =
    isMistakeBattle || isDojoSession || accuracy < 40
      ? 0
      : isBossQuestion && accuracy >= 80
      ? 50
      : isBossQuestion && accuracy >= 55
      ? 25
      : accuracy >= 80
      ? 20
      : accuracy >= 55
      ? 10
      : 0;

  const stageMasteryBonus = Math.max(0, eligibleTierBonus - previousClaimedMasteryBonus);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-surface-dark px-4 py-6 max-w-[480px] mx-auto select-none">
      <div className="w-full flex flex-col items-center space-y-4">
        {/* Result Icon */}
        <div
          className={`w-20 h-20 rounded-[22px] flex items-center justify-center ${
            isPassed ? 'bg-gold-container/20 text-gold-secondary' : 'bg-error-red/20 text-error-red'
          }`}
        >
          {isSpeedBlitz ? (
            <Zap className="w-10 h-10" />
          ) : isPassed ? (
            <Trophy className="w-10 h-10" />
          ) : (
            <X className="w-10 h-10" />
          )}
        </div>

        {/* Title */}
        <div className="text-center">
          <p
            className={`text-xs font-black uppercase tracking-wider ${
              isSpeedBlitz || isArenaBattle || (isBossQuestion && accuracy >= 55)
                ? 'text-gold-secondary'
                : !isPassed
                ? 'text-error-red'
                : 'text-cyan-primary'
            }`}
          >
            {isSpeedBlitz
              ? '⚡ SPEED BLITZ COMPLETE!'
              : isArenaBattle
              ? '🏆 ARENA ROUND COMPLETE!'
              : isMistakeBattle
              ? '🛡️ MISTAKES CONQUERED!'
              : isBossQuestion && accuracy >= 80
              ? '👹 BOSS CONQUERED (3★ FLAWLESS)!'
              : isBossQuestion && accuracy >= 55
              ? '👹 BOSS CONQUERED (2★ SKILLED)!'
              : isBossQuestion && accuracy >= 40
              ? '👹 BOSS DEFEATED (1★ PASSED)!'
              : isBossQuestion
              ? '👹 BOSS ESCAPED! (NEED 40%)'
              : !isPassed
              ? '⚠️ STAGE INCOMPLETE (NEED 40%)'
              : 'STAGE CONQUERED!'}
          </p>
          <h2 className="text-xl font-extrabold text-text-primary mt-1">{questTitle}</h2>
        </div>

        {/* Stars */}
        {!isSpeedBlitz && (
          <div className="flex items-center space-x-1.5">
            {[0, 1, 2].map((idx) => (
              <Star
                key={idx}
                className={`w-7 h-7 ${
                  idx < starsEarned
                    ? 'text-gold-secondary fill-gold-secondary'
                    : 'text-surface-container-high'
                }`}
              />
            ))}
          </div>
        )}

        {/* Summary Card */}
        <div className="w-full rounded-[16px] bg-surface-container border border-outline p-4 space-y-2.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-text-secondary">Accuracy:</span>
            <span
              className={`font-bold ${
                accuracy >= 80
                  ? 'text-success-green'
                  : accuracy >= 40
                  ? 'text-gold-secondary'
                  : 'text-error-red'
              }`}
            >
              {accuracy}% ({correctCount}/{totalQuestions} correct)
            </span>
          </div>

          {isSpeedBlitz ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Speed Blitz XP:</span>
                <span className="font-bold text-gold-secondary">+{totalXpEarned} XP</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Sprint Rating:</span>
                <span className="font-bold text-success-green">
                  {accuracy === 100
                    ? '⚡ Flawless Lightning Sprint!'
                    : accuracy >= 60
                    ? '🏃 Swift & Sharp!'
                    : '🎯 Keep Practicing!'}
                </span>
              </div>
            </>
          ) : isArenaBattle ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Arena XP Earned:</span>
                <span className="font-bold text-gold-secondary">+{arenaPointsEarned} XP</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Weekly XP Impact:</span>
                <span className="font-bold text-cyan-primary">+{arenaPointsEarned} XP to Rank</span>
              </div>
            </>
          ) : (
            <>
              {stageMasteryBonus > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-text-secondary">
                    {isReplayMode ? 'Star Mastery Upgrade:' : 'Stage Mastery Bonus:'}
                  </span>
                  <span className="font-bold text-gold-secondary">+{stageMasteryBonus} XP</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Total XP Awarded:</span>
                <span className="font-bold text-gold-secondary">
                  +{totalXpEarned + stageMasteryBonus} XP
                </span>
              </div>
              {!isDojoSession && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Max Combo Streak:</span>
                    <span className="font-bold text-cyan-primary">{combo} Combo</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary">Stage Status:</span>
                    <span className={`font-bold ${isPassed ? 'text-success-green' : 'text-error-red'}`}>
                      {isPassed ? `Stage Passed (${starsEarned}★)` : 'Retry Required (< 40%)'}
                    </span>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Buttons */}
        <div className="flex space-x-2.5 w-full mt-2">
          <button
            onClick={onRetry}
            className="flex-1 py-3 rounded-xl bg-surface-container-high border border-outline text-text-primary text-xs font-bold hover:bg-surface-container-highest transition-colors"
          >
            {isSpeedBlitz
              ? '⚡ Blitz Again'
              : !isPassed
              ? 'Retry Stage'
              : isArenaBattle
              ? 'Retry Round'
              : isMistakeBattle
              ? 'Retry Battle'
              : isDojoSession
              ? 'Practice Again'
              : 'Replay Stage'}
          </button>
          <button
            onClick={onExitRequest}
            className="flex-1 py-3 rounded-xl bg-cyan-primary text-cyan-on-primary text-xs font-bold hover:brightness-110 transition-all shadow-md shadow-cyan-primary/20"
          >
            {isArenaBattle ? 'Arena Leaderboard' : isMistakeBattle ? 'Mistake Book' : 'Quest Map'}
          </button>
        </div>
      </div>
    </div>
  );
};
