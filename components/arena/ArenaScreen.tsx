'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Clock,
  Lock,
  Zap,
  RefreshCw,
  Gift,
  TrendingUp,
  Swords,
  Copy,
  Check,
  User,
} from 'lucide-react';
import { Scholar, ImprovedScholar, UserStats, TabType } from '@/types';
import { LockedQuizPassDialog } from '@/components/dialogs/LockedQuizPassDialog';
import { RedeemPassCodeDialog } from '@/components/dialogs/RedeemPassCodeDialog';

function calculateTimeUntilSundayMidnight(): string {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  const target = new Date(now);
  target.setDate(now.getDate() + daysUntilSunday);
  target.setHours(23, 59, 59, 999);

  const diffMs = Math.max(0, target.getTime() - now.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `RESETS IN ${days}D ${remainingHours}H`;
  if (hours > 0) return `RESETS IN ${hours}H ${minutes}M`;
  if (minutes > 0) return `RESETS IN ${minutes}M`;
  return 'RESETS SOON';
}

export interface ArenaScreenProps {
  userStats: UserStats;
  podium?: Scholar[];
  leaderboard?: Scholar[];
  schoolPodium?: Scholar[];
  schoolLeaderboard?: Scholar[];
  examPodium?: Scholar[];
  examLeaderboard?: Scholar[];
  mostImproved?: ImprovedScholar[];
  isRefreshing?: boolean;
  onRefreshLeaderboard?: () => void;
  onNavigate?: (tab: TabType) => void;
  onPracticeClimb?: () => void;
  onStartArenaRound?: () => void;
  onRedeemActivationCode: (code: string) => Promise<{ success: boolean; message: string }>;
  onSyncAccountStatus: () => Promise<{ success: boolean; message: string }>;
}

export const ArenaScreen: React.FC<ArenaScreenProps> = ({
  userStats,
  podium = [],
  leaderboard = [],
  schoolPodium = podium,
  schoolLeaderboard = leaderboard,
  examPodium = podium,
  examLeaderboard = leaderboard,
  mostImproved = [],
  isRefreshing = false,
  onRefreshLeaderboard,
  onNavigate,
  onPracticeClimb,
  onStartArenaRound = onPracticeClimb,
  onRedeemActivationCode,
  onSyncAccountStatus,
}) => {
  const [activeArenaTab, setActiveArenaTab] = useState<'school' | 'exam'>('school');
  const [showToast, setShowToast] = useState(false);
  const [challengeCreated, setChallengeCreated] = useState(false);
  const [showArenaBriefingDialog, setShowArenaBriefingDialog] = useState(false);
  const [showLockedPassDialog, setShowLockedPassDialog] = useState(false);
  const [showRedeemCodeDialog, setShowRedeemCodeDialog] = useState(false);
  const [resetCountdown, setResetCountdown] = useState(calculateTimeUntilSundayMidnight());

  useEffect(() => {
    const interval = setInterval(() => {
      setResetCountdown(calculateTimeUntilSundayMidnight());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const effectivePodium = activeArenaTab === 'school' ? (schoolPodium.length ? schoolPodium : podium) : (examPodium.length ? examPodium : podium);
  const effectiveLeaderboard = activeArenaTab === 'school' ? (schoolLeaderboard.length ? schoolLeaderboard : leaderboard) : (examLeaderboard.length ? examLeaderboard : leaderboard);
  const activeRank = activeArenaTab === 'school' ? userStats.schoolArenaRank : userStats.examArenaRank;
  const activeXp = activeArenaTab === 'school' ? userStats.schoolWeeklyXp : userStats.examWeeklyXp;

  const promotionStatusText =
    activeArenaTab === 'exam' && activeXp === 0
      ? '🎯 Solve your first Exam stage or Arena round to join the Exam Podium!'
      : activeRank === 1
      ? '👑 Division Champion! You hold #1 on the Arena Podium!'
      : activeRank === 2
      ? `🥈 Podium Leader! Only ${Math.max(0, 580 - activeXp)} XP to claim #1 from Rohan!`
      : activeRank === 3
      ? `🥉 On the Podium! Only ${Math.max(0, 510 - activeXp)} XP to reach #2 Ananya!`
      : activeRank === 4
      ? `🌟 Top 5 Scholar! Only ${Math.max(0, 480 - activeXp)} XP to reach the Podium (#3 Omkar: 480 XP)!`
      : activeRank === 5
      ? `🌟 Top 5 Scholar! Only ${Math.max(0, 420 - activeXp)} XP to reach #4 (#4 Tanvi: 420 XP)!`
      : activeRank === 6
      ? `Only ${Math.max(0, 390 - activeXp)} XP needed to enter Top 5 (#5 Pranav: 390 XP)!`
      : `Only ${Math.max(0, 350 - activeXp)} XP needed to climb (#6 Siddhesh: 350 XP)!`;

  const handleCreateChallenge = () => {
    setChallengeCreated(true);
    setShowToast(true);
    const studentFirstName = userStats.name.split(' ')[0];
    const cleanGradeSlug = userStats.grade.toLowerCase().replace(/\s+/g, '');
    const studentAccuracyOutOfTen = Math.max(1, Math.min(10, Math.round((userStats.accuracy * 10) / 100)));
    const challengeText = `${studentFirstName} challenged you to a 10-Q Scholarship Duel on Abhyas Arena! Can you beat their score of ${studentAccuracyOutOfTen}/10? Tap to accept: https://abhyasarena.in/duel/${studentFirstName.toLowerCase()}-${cleanGradeSlug}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(challengeText).catch(() => {});
    }

    setTimeout(() => {
      setShowToast(false);
    }, 3500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-surface-dark text-text-primary px-4 py-3 max-w-[480px] mx-auto select-none space-y-3.5 pb-20">
      {/* Top School Bar & Reset Timer */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex-1 truncate mr-2">
          <div className="flex items-center space-x-1.5">
            <Trophy className="w-5 h-5 text-gold-secondary flex-shrink-0" />
            <h1 className="text-base sm:text-lg font-extrabold text-text-primary truncate">
              {userStats.schoolName}
            </h1>
          </div>
          <p className="text-xs text-cyan-primary font-semibold mt-0.5">
            {userStats.town} • {userStats.grade} • Weekly Arena
          </p>
        </div>

        <div className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full bg-surface-container-high border border-outline text-[11px] font-bold text-gold-secondary whitespace-nowrap">
          <Clock className="w-3.5 h-3.5" />
          <span>{resetCountdown}</span>
        </div>
      </div>

      {/* Dual-Hub Leaderboard Switcher */}
      <div className="flex rounded-[12px] bg-surface-container-high border border-outline p-1">
        <button
          onClick={() => setActiveArenaTab('school')}
          className={`flex-1 py-2 text-xs font-bold rounded-[9px] transition-all ${
            activeArenaTab === 'school'
              ? 'bg-cyan-primary text-cyan-on-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          🏫 School Champions
        </button>
        <button
          onClick={() => setActiveArenaTab('exam')}
          className={`flex-1 py-2 text-xs font-bold rounded-[9px] flex items-center justify-center space-x-1 transition-all ${
            activeArenaTab === 'exam'
              ? 'bg-cyan-primary text-cyan-on-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <span>🏆 Exam Arena</span>
          {!userStats.isExamEnrolled && <Lock className="w-3 h-3 text-gold-secondary ml-1" />}
        </button>
      </div>

      {/* Exam Teaser Banner (if locked) */}
      {activeArenaTab === 'exam' && !userStats.isExamEnrolled && (
        <div className="flex items-center justify-between rounded-[14px] bg-surface-container-high border border-gold-secondary/50 p-3.5 space-x-3">
          <div className="flex-1">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-text-primary">
              <Lock className="w-4 h-4 text-gold-secondary" />
              <span>Exam Arena Locked</span>
            </div>
            <p className="text-[11px] text-text-secondary mt-1">
              Your schoolmates are competing in the {userStats.examTrack} Arena. Unlock to compete!
            </p>
          </div>
          <button
            onClick={() => setShowLockedPassDialog(true)}
            className="px-3 py-1.5 rounded-lg bg-gold-secondary text-gold-on-secondary text-xs font-extrabold hover:brightness-110 transition-all flex-shrink-0"
          >
            Unlock
          </button>
        </div>
      )}

      {/* "You" Highlight Profile Card */}
      <div className="rounded-[16px] bg-surface-container-high border border-outline p-4 space-y-2.5 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-surface-dark border-2 border-cyan-primary overflow-hidden flex items-center justify-center">
              <User className="w-7 h-7 text-cyan-primary" />
            </div>
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-cyan-primary text-[10px] font-black text-cyan-on-primary">
              {activeArenaTab === 'exam' && activeXp === 0 ? '—' : `#${activeRank}`}
            </span>
          </div>

          <div className="flex-1">
            <h2 className="text-base font-bold text-text-primary">
              You ({userStats.name.split(' ')[0]} • {userStats.division})
            </h2>
            <p className="text-xs text-text-secondary">
              {activeArenaTab === 'exam' && activeXp === 0
                ? 'Unranked • Solve 1 Exam Round to Join'
                : `${activeXp} Weekly XP • ${userStats.accuracy}% Acc • ${userStats.arenaQs}/100 Qs`}
            </p>
          </div>
        </div>

        <p className="text-xs text-text-primary leading-relaxed rounded-[10px] bg-surface-container-lowest p-2.5">
          {promotionStatusText}
        </p>

        <button
          onClick={() => {
            if (!userStats.isSubscribed) {
              setShowLockedPassDialog(true);
            } else {
              setShowArenaBriefingDialog(true);
            }
          }}
          className={`w-full py-3 rounded-[12px] font-extrabold text-sm flex items-center justify-center space-x-1.5 transition-all shadow-md active:scale-[0.99] ${
            !userStats.isSubscribed
              ? 'bg-gold-container text-gold-on-secondary hover:brightness-110 shadow-gold-secondary/20'
              : 'bg-cyan-primary text-cyan-on-primary hover:brightness-110 shadow-cyan-primary/20'
          }`}
        >
          {!userStats.isSubscribed ? (
            <>
              <Lock className="w-4 h-4" />
              <span>🔒 Enter Arena Battle (Pass Required)</span>
            </>
          ) : userStats.arenaQs >= 100 ? (
            <span>Review Division Standings</span>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Practice to Climb Rank</span>
            </>
          )}
        </button>
      </div>

      {/* Fair Play Cap Card */}
      <div className="rounded-[16px] bg-surface-container border border-outline p-4 space-y-3">
        <div className="rounded-[12px] bg-surface-container-high border border-outline p-3 space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-text-primary">
              Fair Play Cap: {userStats.arenaQs}/100 scored Qs
            </span>
            <span className="font-bold text-cyan-primary">
              {100 - userStats.arenaQs} remaining
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-surface-container-lowest overflow-hidden">
            <div
              className="h-full bg-cyan-primary transition-all duration-300"
              style={{ width: `${Math.min(100, (userStats.arenaQs / 100) * 100)}%` }}
            />
          </div>

          <p className="text-[11px] text-text-secondary leading-normal">
            First 100 qualifying questions count toward Arena score. Unlimited standard practice continues!
          </p>
        </div>

        <div className="flex items-start space-x-2.5">
          <Gift className="w-6 h-6 text-gold-secondary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-extrabold text-gold-secondary">
              WEEKLY ARENA CHAMPION PRIZE
            </p>
            <p className="text-xs text-text-primary leading-relaxed">
              Win a ₹50 Trimax Gold Gel Pen + Official Scholar Certificate shipped directly home!
            </p>
          </div>
        </div>
      </div>

      {/* Arena Podium (Top 3) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-text-primary">Arena Podium</h2>
            {isRefreshing && (
              <span className="text-xs text-cyan-primary font-semibold animate-pulse">
                • Syncing...
              </span>
            )}
          </div>

          <button
            onClick={onRefreshLeaderboard}
            disabled={isRefreshing}
            className="flex items-center space-x-1 text-xs font-bold text-gold-secondary hover:text-cyan-primary transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing' : 'League Stage 1'}</span>
          </button>
        </div>

        {/* Podium Layout: #2 Silver (left), #1 Gold (center, tall), #3 Bronze (right) */}
        <div className="grid grid-cols-3 gap-2 items-end pt-2">
          {/* #2 Silver */}
          {effectivePodium.length > 1 && (
            <PodiumCard
              scholar={effectivePodium[1]}
              rankLabel="#2"
              color="#CBD5E1"
              height="h-36"
            />
          )}

          {/* #1 Gold */}
          {effectivePodium.length > 0 && (
            <PodiumCard
              scholar={effectivePodium[0]}
              rankLabel="#1"
              color="#F5B94C"
              height="h-44"
            />
          )}

          {/* #3 Bronze */}
          {effectivePodium.length > 2 && (
            <PodiumCard
              scholar={effectivePodium[2]}
              rankLabel="#3"
              color="#D97706"
              height="h-32"
            />
          )}
        </div>
      </div>

      {/* Leaderboard Table (Ranks 4+) */}
      <div className="space-y-2">
        <div className="flex justify-between text-[11px] font-bold text-text-secondary px-1">
          <span>Rank & Scholar</span>
          <span>Weekly Score</span>
        </div>

        <div className="space-y-2">
          {effectiveLeaderboard.map((s) => {
            const isUser = s.isUser;
            return (
              <div
                key={s.studentId || `${s.name}-${s.rank}`}
                className={`flex items-center justify-between p-3 rounded-[14px] border transition-all ${
                  isUser
                    ? 'bg-cyan-primary/15 border-cyan-primary shadow-sm'
                    : 'bg-surface-container border-outline'
                }`}
              >
                <div className="flex items-center space-x-3 flex-1 truncate">
                  <span
                    className={`text-sm font-black w-7 ${
                      isUser ? 'text-cyan-primary' : 'text-text-secondary'
                    }`}
                  >
                    #{s.rank}
                  </span>

                  <div
                    className={`w-9 h-9 rounded-full bg-surface-container-high border overflow-hidden flex items-center justify-center flex-shrink-0 ${
                      isUser ? 'border-cyan-primary' : 'border-outline'
                    }`}
                  >
                    <User className="w-5 h-5 text-text-secondary" />
                  </div>

                  <span
                    className={`text-sm font-bold truncate ${
                      isUser ? 'text-cyan-primary' : 'text-text-primary'
                    }`}
                  >
                    {s.name}
                  </span>
                </div>

                <div className="text-right flex-shrink-0 ml-2">
                  <p
                    className={`text-sm font-black ${
                      isUser ? 'text-cyan-primary' : 'text-gold-secondary'
                    }`}
                  >
                    {s.points} XP
                  </p>
                  <p className="text-[11px] text-success-green font-semibold">
                    {s.accuracy}% Acc
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Most Improved Scholars */}
      {mostImproved.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary">Most Improved Scholars</h2>
            <span className="text-[11px] font-bold text-cyan-primary">Weekly Surge</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {mostImproved.map((imp) => (
              <div
                key={imp.name}
                className="rounded-[14px] bg-surface-container border border-outline p-3 space-y-1"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-text-primary truncate">{imp.name}</span>
                  <TrendingUp className="w-3.5 h-3.5 text-success-green flex-shrink-0" />
                </div>
                <p className="text-[11px] text-text-secondary">{imp.city}</p>
                <div className="flex items-center space-x-1 text-[11px] font-bold text-success-green pt-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+{imp.growth}% Accuracy Growth</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1v1 Challenge a Friend */}
      <div className="rounded-[18px] bg-surface-container border border-outline p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Swords className="w-5 h-5 text-cyan-primary" />
            <h2 className="text-base font-bold text-text-primary">Challenge a Friend</h2>
          </div>
          <span className="px-2 py-0.5 rounded-[10px] bg-cyan-primary/15 text-cyan-primary text-[11px] font-bold">
            1v1 Duel
          </span>
        </div>

        <p className="text-xs text-text-secondary leading-relaxed">
          Challenge a classmate in 10 fast questions! Test your speed and precision head-to-head.
        </p>

        <div className="rounded-[12px] bg-surface-container-lowest border border-outline p-3 flex items-start space-x-2.5">
          <User className="w-5 h-5 text-cyan-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-gold-secondary">Shareable Challenge Card</p>
            <p className="text-xs text-text-primary leading-relaxed mt-0.5">
              &quot;{userStats.name.split(' ')[0]} scored {Math.max(1, Math.min(10, Math.round((userStats.accuracy * 10) / 100)))}/10 in {userStats.activeChapter}. Can you beat them? Tap link to accept the arena battle!&quot;
            </p>
          </div>
        </div>

        <button
          onClick={handleCreateChallenge}
          className="w-full py-3 rounded-[12px] bg-cyan-primary text-cyan-on-primary font-extrabold text-sm flex items-center justify-center space-x-2 hover:brightness-110 active:scale-[0.99] transition-all shadow-md shadow-cyan-primary/20"
        >
          {challengeCreated ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{challengeCreated ? 'Challenge Link Copied!' : 'Create 10-Q Friend Challenge'}</span>
        </button>

        {showToast && (
          <p className="text-xs text-center font-bold text-cyan-primary py-2 rounded-[10px] bg-surface-container-high border border-cyan-primary/40 animate-in fade-in">
            Challenge link copied to clipboard! Share on WhatsApp.
          </p>
        )}
      </div>

      {/* Arena Briefing Modal */}
      {showArenaBriefingDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[20px] bg-surface-container-high border border-cyan-primary/60 p-5 shadow-2xl space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-extrabold text-cyan-primary tracking-wide">
                  ⚔️ ARENA QUALIFYING ROUND
                </span>
                <span className="px-2 py-0.5 rounded-full bg-gold-container/20 border border-gold-secondary text-gold-secondary text-[10px] font-bold">
                  Rank #{userStats.arenaRank}
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-text-primary">
                Weekly Division Promotion Trial
              </h3>
            </div>

            <div className="rounded-[14px] bg-surface-dark border border-outline p-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-text-secondary">Current Standing</span>
                <span className="font-bold text-cyan-primary">
                  {userStats.weeklyXp} Weekly XP • {userStats.accuracy}% Acc
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Next Promotion Gate</span>
                <span className="font-bold text-gold-secondary">
                  {Math.max(0, 910 - userStats.weeklyXp)} XP to #5 Pranav
                </span>
              </div>
            </div>

            <div className="rounded-[14px] bg-surface-container border border-outline p-3 space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-cyan-primary" />
                <span className="font-semibold text-text-primary">
                  5 Rapid-Fire Mixed Questions (Math, Logic, Lang)
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-gold-secondary" />
                <span className="font-semibold text-text-primary">
                  +15 Base XP + Up to +10 Speed Bonus per Q
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-cyan-primary" />
                <span className="text-text-secondary">
                  Fair Play Scored: {userStats.arenaQs}/100 Qs ({100 - userStats.arenaQs} left)
                </span>
              </div>
            </div>

            <div className="flex flex-col space-y-2 pt-1">
              <button
                onClick={() => {
                  setShowArenaBriefingDialog(false);
                  if (onStartArenaRound) onStartArenaRound();
                }}
                disabled={userStats.arenaQs >= 100}
                className="w-full py-3 rounded-xl bg-cyan-primary text-cyan-on-primary text-sm font-extrabold hover:brightness-110 transition-all disabled:opacity-50"
              >
                Enter Arena Battle (5 Qs)
              </button>
              <button
                onClick={() => setShowArenaBriefingDialog(false)}
                className="w-full py-2 text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Locked Quiz Pass Dialog */}
      {showLockedPassDialog && (
        <LockedQuizPassDialog
          studentName={userStats.name}
          studentPhone={userStats.parentPhone}
          stageTitle="Weekly Arena Qualifying Round"
          chapterName="Mixed Curriculum • All 12 Chapters Promotion Duel"
          onDismiss={() => setShowLockedPassDialog(false)}
          onRedeemCodeClick={() => {
            setShowLockedPassDialog(false);
            setShowRedeemCodeDialog(true);
          }}
          onSyncStatusClick={async () => {
            setShowLockedPassDialog(false);
            const res = await onSyncAccountStatus();
            alert(res.message);
          }}
        />
      )}

      {/* Redeem Pass Code Dialog */}
      {showRedeemCodeDialog && (
        <RedeemPassCodeDialog
          studentName={userStats.name}
          parentPhone={userStats.parentPhone}
          onDismiss={() => setShowRedeemCodeDialog(false)}
          onRedeemCode={onRedeemActivationCode}
          onSyncStatus={onSyncAccountStatus}
        />
      )}
    </div>
  );
};

// Sub-component for individual podium step card
interface PodiumCardProps {
  scholar: Scholar;
  rankLabel: string;
  color: string;
  height: string;
}

const PodiumCard: React.FC<PodiumCardProps> = ({ scholar, rankLabel, color, height }) => {
  const isUser = scholar.isUser;

  return (
    <div
      className={`rounded-[16px] border p-2.5 flex flex-col items-center justify-between ${height} transition-all ${
        isUser
          ? 'bg-cyan-primary/15 border-cyan-primary shadow-md'
          : 'bg-surface-container'
      }`}
      style={{ borderColor: isUser ? undefined : color }}
    >
      <div className="flex items-center space-x-1">
        <span
          className="text-xs font-black"
          style={{ color: isUser ? 'var(--color-cyan-primary)' : color }}
        >
          {rankLabel}
        </span>
        {isUser && (
          <span className="text-[9px] font-black px-1 rounded bg-cyan-primary text-cyan-on-primary">
            YOU
          </span>
        )}
      </div>

      <div
        className="w-10 h-10 rounded-full bg-surface-container-high border-2 overflow-hidden flex items-center justify-center flex-shrink-0"
        style={{ borderColor: isUser ? 'var(--color-cyan-primary)' : color }}
      >
        <User className="w-6 h-6 text-text-secondary" />
      </div>

      <div className="text-center w-full">
        <p
          className={`text-[11px] font-bold truncate ${
            isUser ? 'text-cyan-primary' : 'text-text-primary'
          }`}
        >
          {scholar.name}
        </p>
        <p
          className="text-[10px] font-black"
          style={{ color: isUser ? 'var(--color-cyan-primary)' : color }}
        >
          {scholar.points} XP
        </p>
      </div>
    </div>
  );
};
