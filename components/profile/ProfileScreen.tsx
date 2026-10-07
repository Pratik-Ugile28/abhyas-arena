'use client';

import React, { useState, useMemo } from 'react';
import {
  User,
  ShieldCheck,
  School,
  Trophy,
  Flame,
  Zap,
  BookOpen,
  Flag,
  Award,
  Sparkles,
  HelpCircle,
  LogOut,
  Trash2,
  Lock,
  CheckCircle2,
  RotateCw,
  Share2,
  ChevronRight,
  Eye,
  EyeOff,
  AlertTriangle,
  FileText,
  Key,
} from 'lucide-react';
import {
  UserStats,
  Badge,
  ChapterQuest,
  QuizQuestion,
  TabType,
  ClassGrade,
  ArenaCompanions,
  ArenaCompanion,
  getBadgeTierAccentColor,
} from '@/types';
import { LeetCodeBadgeEmblem } from '@/components/common/LeetCodeBadgeEmblem';
import { BadgeDetailDialog } from '@/components/dialogs/BadgeDetailDialog';
import { RedeemPassCodeDialog } from '@/components/dialogs/RedeemPassCodeDialog';

export interface ProfileScreenProps {
  userStats: UserStats;
  badges: Badge[];
  chapterQuests?: ChapterQuest[];
  mistakes?: QuizQuestion[];
  featuredBadgeId?: string | null;
  onFeatureBadge?: (id: string | null) => void;
  onNavigate: (tab: TabType) => void;
  onSelectGrade: (grade: any) => void;
  onActivatePass?: (months: number) => void;
  onRedeemActivationCode: (code: string) => Promise<{ success: boolean; message: string }>;
  onSyncAccountStatus: () => Promise<{ success: boolean; message: string }>;
  onStartWeakPractice: (topic: string) => void;
  onOpenSyllabus: () => void;
  onUpdateCompanion?: (companionId: string) => void;
  onLogout?: () => void;
  onDeleteAccount: (password?: string) => Promise<boolean> | boolean;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userStats,
  badges,
  chapterQuests = [],
  mistakes = [],
  featuredBadgeId = null,
  onFeatureBadge = () => {},
  onNavigate,
  onSelectGrade,
  onActivatePass = () => {},
  onRedeemActivationCode,
  onSyncAccountStatus,
  onStartWeakPractice,
  onOpenSyllabus,
  onUpdateCompanion = () => {},
  onLogout = () => {},
  onDeleteAccount,
}) => {
  const [parentMode, setParentMode] = useState(false);
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteStep1Dialog, setShowDeleteStep1Dialog] = useState(false);
  const [showDeleteStep2Dialog, setShowDeleteStep2Dialog] = useState(false);
  const [deletePasswordInput, setDeletePasswordInput] = useState('');
  const [deletePasswordVisible, setDeletePasswordVisible] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  const [inspectingBadge, setInspectingBadge] = useState<Badge | null>(null);

  const unlockedBadges = useMemo(() => badges.filter((b) => b.status === 'Unlocked'), [badges]);
  const effectiveFeaturedBadge = useMemo(() => {
    const explicitlyChosen = unlockedBadges.find((b) => b.id === featuredBadgeId);
    return explicitlyChosen || unlockedBadges[0] || badges[0];
  }, [unlockedBadges, featuredBadgeId, badges]);

  const handleShareParentDigest = () => {
    const digest = `${userStats.name}'s Abhyas Arena Summary (${userStats.grade} • ${userStats.schoolName}):\n` +
      `${userStats.weeklyQuestions} Questions Practiced this week\n` +
      `${userStats.daysActiveThisWeek}/5 Days Active (${userStats.streakDays}-Day Streak!)\n` +
      `${userStats.accuracy}% Avg Accuracy\n` +
      `${userStats.weeklyXp} Weekly XP Earned\n` +
      `Rank #${userStats.arenaRank} in ${userStats.grade} (${userStats.town})\n` +
      `Keep up the great work in Ambajogai!`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(digest).catch(() => {});
    }
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 3500);
  };

  const currentCompanion = ArenaCompanions.getById(userStats.companionId);

  return (
    <div className="flex flex-col min-h-screen bg-surface-dark text-text-primary px-4 py-3 max-w-[480px] mx-auto select-none space-y-3.5 pb-20">
      {/* Mode Toggle: Champion Profile vs Parent Digest */}
      <div className="flex rounded-[24px] bg-surface-container-high border border-outline p-1 space-x-1">
        <button
          onClick={() => setParentMode(false)}
          className={`flex-1 py-2 text-xs font-bold rounded-[20px] flex items-center justify-center space-x-1.5 transition-all ${
            !parentMode
              ? 'bg-cyan-primary text-cyan-on-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Champion Profile</span>
        </button>
        <button
          onClick={() => setParentMode(true)}
          className={`flex-1 py-2 text-xs font-bold rounded-[20px] flex items-center justify-center space-x-1.5 transition-all ${
            parentMode
              ? 'bg-cyan-primary text-cyan-on-primary shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <School className="w-4 h-4" />
          <span>Parent Digest</span>
        </button>
      </div>

      {/* Student Hero Card */}
      <div className="rounded-[16px] bg-surface-container border border-outline p-4 flex flex-col items-center text-center space-y-2.5 shadow-lg">
        {/* Avatar with gradient ring & Level Badge */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-primary to-gold-secondary p-0.5 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-surface-dark overflow-hidden flex items-center justify-center">
              <User className="w-12 h-12 text-cyan-primary" />
            </div>
          </div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gold-container border border-gold-on-secondary flex items-center space-x-1 text-[11px] font-black text-gold-on-secondary whitespace-nowrap shadow-sm">
            <Zap className="w-3 h-3 fill-gold-on-secondary" />
            <span>LVL {userStats.level}</span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 pt-1">
          <h1 className="text-xl font-bold text-text-primary">{userStats.name}</h1>
          <ShieldCheck className="w-5 h-5 text-cyan-primary" />
        </div>

        <p className="text-xs text-text-secondary">
          {userStats.grade} ({userStats.division}) • {userStats.schoolName}
        </p>

        {/* Switch Grade Pill */}
        <button
          onClick={() => setShowGradeDialog(true)}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-surface-container-high text-cyan-primary text-xs font-semibold hover:bg-surface-container-highest transition-colors"
        >
          <School className="w-3.5 h-3.5" />
          <span>{userStats.grade} • Tap to switch</span>
        </button>

        {/* Division Rank Badge */}
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-surface-container-highest border border-surface-container-highest text-[11px] font-bold text-gold-secondary">
          <Trophy className="w-3.5 h-3.5 text-gold-secondary" />
          <span>
            RANK #{userStats.arenaRank} IN {userStats.grade.toUpperCase()} ({userStats.town.toUpperCase()})
          </span>
        </div>
      </div>

      {/* Arena Companion Card */}
      <ArenaCompanionProfileCard
        companion={currentCompanion}
        onSelectCompanion={onUpdateCompanion}
      />

      {/* Stats Grid */}
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-[14px] bg-surface-container border border-outline p-3 flex items-center space-x-2.5">
            <Flame className="w-5 h-5 text-gold-secondary flex-shrink-0" />
            <div>
              <p className="text-lg font-black text-gold-secondary">{userStats.streakDays}</p>
              <p className="text-[10px] font-bold text-text-secondary">
                {userStats.streakDays === 1 ? 'Day Streak' : 'Days Streak'}
              </p>
            </div>
          </div>

          <div className="rounded-[14px] bg-surface-container border border-outline p-3 flex items-center space-x-2.5">
            <Zap className="w-5 h-5 text-gold-secondary flex-shrink-0" />
            <div>
              <p className="text-lg font-black text-gold-secondary">
                {userStats.xp >= 1000 ? `${(userStats.xp / 1000).toFixed(1)}k` : userStats.xp}
              </p>
              <p className="text-[10px] font-bold text-text-secondary">Total XP</p>
            </div>
          </div>

          <div className="rounded-[14px] bg-surface-container border border-outline p-3 flex items-center space-x-2.5">
            <BookOpen className="w-5 h-5 text-cyan-primary flex-shrink-0" />
            <div>
              <p className="text-lg font-black text-cyan-primary">{userStats.solvedQuestions}</p>
              <p className="text-[10px] font-bold text-text-secondary">Solved Qs</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-[14px] bg-surface-container border border-outline p-3 flex items-center space-x-2.5">
            <Flag className="w-5 h-5 text-cyan-primary flex-shrink-0" />
            <div>
              <p className="text-lg font-black text-cyan-primary">{userStats.accuracy}%</p>
              <p className="text-[10px] font-bold text-text-secondary">Accuracy</p>
            </div>
          </div>

          <div className="col-span-2 rounded-[14px] bg-surface-container border border-outline p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-primary/20 flex items-center justify-center">
                <Award className="w-4 h-4 text-gold-secondary" />
              </div>
              <div>
                <p className="text-xs font-bold text-text-primary">
                  {unlockedBadges.length} / {badges.length} Badges
                </p>
                <p className="text-[11px] text-text-secondary">
                  {unlockedBadges.length >= 5 ? 'Elite scholar milestone!' : 'Solve questions to unlock'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-text-secondary" />
          </div>
        </div>
      </div>

      {/* Featured Badge Spotlight */}
      {effectiveFeaturedBadge && (
        <FeaturedBadgeSpotlightCard
          featuredBadge={effectiveFeaturedBadge}
          totalBadges={badges.length}
          unlockedCount={unlockedBadges.length}
          onInspectBadge={setInspectingBadge}
        />
      )}

      {/* Badges Trophy Case Row */}
      <BadgesCaseRow
        badges={badges}
        featuredBadgeId={effectiveFeaturedBadge?.id}
        onInspectBadge={setInspectingBadge}
      />

      {/* Subject Mastery Stepper */}
      <SubjectMasterySection userStats={userStats} chapterQuests={chapterQuests} />

      {/* Weak Topics Booster */}
      <WeakTopicsSection mistakes={mistakes} onStartWeakPractice={onStartWeakPractice} />

      {/* Parent Digest Section */}
      <ParentDigestSection
        userStats={userStats}
        chapterQuests={chapterQuests}
        onShare={handleShareParentDigest}
        onOpenRedeemModal={() => setShowRedeemDialog(true)}
      />

      {showShareToast && (
        <p className="text-xs text-center font-bold text-gold-secondary py-2 rounded-[10px] bg-surface-container border border-gold-secondary/40 animate-in fade-in">
          Parent digest copied! Select an app to share.
        </p>
      )}

      {/* Scholarship Pass Status Card */}
      <ScholarshipPassStatusCard
        userStats={userStats}
        onOpenRedeemModal={() => setShowRedeemDialog(true)}
        onSyncStatus={async () => {
          const res = await onSyncAccountStatus();
          alert(res.message);
        }}
      />

      {/* Settings Section */}
      <SettingsSection
        currentGrade={userStats.grade}
        onOpenGradeDialog={() => setShowGradeDialog(true)}
        onOpenSyllabus={onOpenSyllabus}
        onOpenPrivacyPolicy={() => setShowPrivacyDialog(true)}
        onLogout={() => setShowLogoutDialog(true)}
        onDeleteAccount={() => setShowDeleteStep1Dialog(true)}
      />

      {/* Footer Info */}
      <p className="text-[10px] text-text-secondary text-center leading-normal pt-2">
        Abhyas Arena v2.4 • Maharashtra State Board Curated
        <br />
        Designed with encouragement &amp; safe gamification
      </p>

      {/* Modals */}
      {showLogoutDialog && (
        <LogoutDialog
          onConfirm={() => {
            setShowLogoutDialog(false);
            onLogout();
          }}
          onCancel={() => setShowLogoutDialog(false)}
        />
      )}

      {showPrivacyDialog && (
        <PrivacyPolicyDialog
          onClose={() => setShowPrivacyDialog(false)}
          onOpenWebPolicy={() => window.open('https://abhyasarena.web.app/privacy', '_blank')}
        />
      )}

      {showDeleteStep1Dialog && (
        <DeleteAccountStep1Dialog
          studentId={userStats.studentId}
          onConfirm={() => {
            setShowDeleteStep1Dialog(false);
            setDeletePasswordInput('');
            setDeleteErrorMessage(null);
            setShowDeleteStep2Dialog(true);
          }}
          onCancel={() => setShowDeleteStep1Dialog(false)}
        />
      )}

      {showDeleteStep2Dialog && (
        <DeleteAccountStep2Dialog
          studentName={userStats.name}
          studentId={userStats.studentId}
          passwordInput={deletePasswordInput}
          setPasswordInput={setDeletePasswordInput}
          passwordVisible={deletePasswordVisible}
          setPasswordVisible={setDeletePasswordVisible}
          errorMessage={deleteErrorMessage}
          onConfirm={async () => {
            if (deletePasswordInput.trim()) {
              const res = onDeleteAccount(deletePasswordInput);
              const success = typeof (res as any)?.then === 'function' ? await res : res;
              if (success) {
                setShowDeleteStep2Dialog(false);
                alert('Account permanently deleted');
              } else {
                setDeleteErrorMessage('❌ Incorrect password. Deletion cancelled to protect account.');
              }
            }
          }}
          onCancel={() => {
            setShowDeleteStep2Dialog(false);
            setDeletePasswordInput('');
            setDeleteErrorMessage(null);
          }}
        />
      )}

      {showGradeDialog && (
        <GradeSelectionDialog
          currentGrade={userStats.grade}
          onSelectGrade={onSelectGrade}
          onClose={() => setShowGradeDialog(false)}
        />
      )}

      {showRedeemDialog && (
        <RedeemPassCodeDialog
          studentName={userStats.name}
          parentPhone={userStats.parentPhone}
          onDismiss={() => setShowRedeemDialog(false)}
          onRedeemCode={onRedeemActivationCode}
          onSyncStatus={onSyncAccountStatus}
        />
      )}

      {inspectingBadge && (
        <BadgeDetailDialog
          badge={inspectingBadge}
          isFeatured={inspectingBadge.id === effectiveFeaturedBadge?.id}
          onDismiss={() => setInspectingBadge(null)}
          onFeatureBadge={(id) => {
            onFeatureBadge(id);
            setInspectingBadge(null);
          }}
        />
      )}
    </div>
  );
};

// Subcomponent: Arena Companion Card
interface ArenaCompanionProfileCardProps {
  companion: ArenaCompanion;
  onSelectCompanion: (id: string) => void;
}

const ArenaCompanionProfileCard: React.FC<ArenaCompanionProfileCardProps> = ({
  companion,
  onSelectCompanion,
}) => {
  const [isSwitching, setIsSwitching] = useState(false);

  return (
    <div
      className="rounded-[16px] bg-surface-container border p-3.5 space-y-2.5"
      style={{ borderColor: `${companion.auraColorHex}66` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
            style={{ backgroundColor: `${companion.auraColorHex}33` }}
          >
            {companion.emoji}
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">{companion.name}</p>
            <p
              className="text-[11px] font-semibold"
              style={{ color: companion.auraColorHex }}
            >
              {companion.title} • {companion.tagline}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsSwitching(!isSwitching)}
          className="text-xs font-bold text-cyan-primary hover:underline"
        >
          {isSwitching ? 'Done' : 'Switch ›'}
        </button>
      </div>

      {isSwitching && (
        <div className="space-y-1.5 pt-1">
          <p className="text-[11px] font-semibold text-text-secondary">
            Choose a New Arena Champion:
          </p>
          <div className="flex space-x-2 overflow-x-auto no-scrollbar py-1">
            {ArenaCompanions.ALL.map((comp) => {
              const isSelected = comp.id === companion.id;
              return (
                <div
                  key={comp.id}
                  onClick={() => onSelectCompanion(comp.id)}
                  className={`w-20 rounded-[10px] p-2 flex flex-col items-center cursor-pointer flex-shrink-0 border transition-all ${
                    isSelected
                      ? 'bg-surface-container-highest border-cyan-primary'
                      : 'bg-surface-container-high border-outline hover:border-text-secondary'
                  }`}
                  style={{ borderColor: isSelected ? comp.auraColorHex : undefined }}
                >
                  <span className="text-2xl">{comp.emoji}</span>
                  <span
                    className="text-[10px] font-bold mt-1 truncate max-w-full"
                    style={{ color: isSelected ? comp.auraColorHex : 'var(--color-text-primary)' }}
                  >
                    {comp.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Subcomponent: Featured Badge Spotlight
interface FeaturedBadgeSpotlightCardProps {
  featuredBadge: Badge;
  totalBadges: number;
  unlockedCount: number;
  onInspectBadge: (badge: Badge) => void;
}

const FeaturedBadgeSpotlightCard: React.FC<FeaturedBadgeSpotlightCardProps> = ({
  featuredBadge,
  totalBadges,
  unlockedCount,
  onInspectBadge,
}) => {
  const tierColor = getBadgeTierAccentColor(featuredBadge.tier);

  return (
    <div
      onClick={() => onInspectBadge(featuredBadge)}
      className="rounded-[24px] bg-gradient-to-b from-surface-container-high via-surface-container-high to-surface-dark border p-4 flex flex-col items-center cursor-pointer shadow-xl transition-all hover:brightness-105"
      style={{ borderColor: `${tierColor}80` }}
    >
      <div className="w-full flex items-center justify-between text-xs mb-3">
        <div
          className="flex items-center space-x-1 px-2.5 py-1 rounded-full border text-[10px] font-extrabold"
          style={{
            backgroundColor: `${tierColor}33`,
            borderColor: `${tierColor}99`,
            color: tierColor,
          }}
        >
          <Award className="w-3.5 h-3.5" />
          <span>FEATURED MEDAL</span>
        </div>
        <span className="text-[11px] font-bold text-text-secondary">
          {unlockedCount} / {totalBadges} Unlocked
        </span>
      </div>

      <div className="my-2">
        <LeetCodeBadgeEmblem
          badge={featuredBadge}
          size={84}
          isFeatured={true}
          animateShimmer={true}
        />
      </div>

      <h3 className="text-base font-black text-text-primary mt-1 text-center">
        {featuredBadge.name}
      </h3>
      <p className="text-[11px] font-bold mt-0.5" style={{ color: tierColor }}>
        {featuredBadge.tier}
      </p>
      <p className="text-xs text-text-secondary text-center mt-1 line-clamp-2 max-w-xs">
        {featuredBadge.description}
      </p>

      <div className="mt-3 px-2.5 py-1 rounded-md bg-surface-container-high text-[10px] font-semibold text-cyan-primary">
        Tap to view details or change featured medal ›
      </div>
    </div>
  );
};

// Subcomponent: Badges Case Row
interface BadgesCaseRowProps {
  badges: Badge[];
  featuredBadgeId?: string | null;
  onInspectBadge: (badge: Badge) => void;
}

const BadgesCaseRow: React.FC<BadgesCaseRowProps> = ({
  badges,
  featuredBadgeId,
  onInspectBadge,
}) => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const categories = ['All', 'Unlocked', 'Volume', 'Streak', 'Mastery', 'Skill', 'Arena'];
  const unlockedCount = badges.filter((b) => b.status === 'Unlocked').length;

  const filteredBadges = useMemo(() => {
    switch (selectedFilter) {
      case 'Unlocked':
        return badges.filter((b) => b.status === 'Unlocked');
      case 'Volume':
      case 'Streak':
      case 'Mastery':
      case 'Skill':
      case 'Arena':
        return badges.filter((b) => b.category?.toLowerCase() === selectedFilter.toLowerCase());
      default:
        return badges;
    }
  }, [selectedFilter, badges]);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <Trophy className="w-4 h-4 text-cyan-primary" />
          <h2 className="text-base font-bold text-text-primary">Trophy Case</h2>
        </div>
        <span className="text-[11px] font-bold text-cyan-primary">
          {unlockedCount} / {badges.length} Unlocked
        </span>
      </div>

      {/* Filter Chips */}
      <div className="flex space-x-1.5 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => {
          const isSelected = selectedFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-3 py-1 rounded-[10px] text-[11px] font-semibold whitespace-nowrap border transition-all ${
                isSelected
                  ? 'bg-cyan-primary/20 border-cyan-primary text-cyan-primary font-bold'
                  : 'bg-surface-container border-outline text-text-secondary hover:text-text-primary'
              }`}
            >
              {cat === 'All' ? `All (${badges.length})` : cat === 'Unlocked' ? `Unlocked (${unlockedCount})` : cat}
            </button>
          );
        })}
      </div>

      {/* Badges Cards Carousel */}
      <div className="flex space-x-3 overflow-x-auto no-scrollbar py-1">
        {filteredBadges.map((badge) => {
          const isEquipped = badge.id === featuredBadgeId;
          const tierColor = getBadgeTierAccentColor(badge.tier);
          const progressPct =
            badge.maxProgress > 0 ? Math.min(100, (badge.currentProgress / badge.maxProgress) * 100) : 0;

          return (
            <div
              key={badge.id}
              onClick={() => onInspectBadge(badge)}
              className={`w-32 rounded-[18px] p-2.5 flex flex-col items-center justify-between flex-shrink-0 cursor-pointer border transition-all ${
                badge.status !== 'Unlocked'
                  ? 'bg-surface-container/60 border-outline opacity-80'
                  : isEquipped
                  ? 'bg-surface-container border-cyan-primary shadow-md'
                  : 'bg-surface-container border-outline'
              }`}
            >
              <div className="w-full flex justify-between items-center text-[9px] mb-1">
                <span
                  className="px-1.5 py-0.5 rounded font-black uppercase"
                  style={{
                    backgroundColor: `${tierColor}33`,
                    color: tierColor,
                  }}
                >
                  {badge.tier}
                </span>
                {isEquipped && (
                  <span className="px-1 py-0.5 rounded bg-cyan-primary/20 text-cyan-primary font-black">
                    ★
                  </span>
                )}
              </div>

              <div className="my-1.5">
                <LeetCodeBadgeEmblem
                  badge={badge}
                  size={54}
                  showHaloProgress={true}
                  isFeatured={isEquipped}
                />
              </div>

              <p className="text-xs font-bold text-center text-text-primary line-clamp-2 min-h-[32px] flex items-center">
                {badge.name}
              </p>

              {badge.status !== 'Unlocked' ? (
                <div className="w-full space-y-1 mt-1">
                  <div className="w-full h-1 rounded-full bg-surface-container-high overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${progressPct}%`, backgroundColor: tierColor }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-text-secondary font-bold">
                    <span>{badge.currentProgress}/{badge.maxProgress}</span>
                    <span style={{ color: tierColor }}>+{badge.xpBonus} XP</span>
                  </div>
                </div>
              ) : (
                <span
                  className="text-[10px] font-black mt-1 px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${tierColor}22`, color: tierColor }}
                >
                  ✓ +{badge.xpBonus} XP
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Subcomponent: Subject Mastery
interface SubjectMasterySectionProps {
  userStats: UserStats;
  chapterQuests: ChapterQuest[];
}

const SubjectMasterySection: React.FC<SubjectMasterySectionProps> = ({
  userStats,
  chapterQuests,
}) => {
  const mathQuests = chapterQuests.filter((q) => q.subject.toLowerCase().includes('math'));
  const logicQuests = chapterQuests.filter(
    (q) => q.subject.toLowerCase().includes('reasoning') || q.subject.toLowerCase().includes('logic')
  );
  const langQuests = chapterQuests.filter((q) => q.subject.toLowerCase().includes('language'));

  const mathProgress = mathQuests.length
    ? Math.round(mathQuests.reduce((a, b) => a + b.progressPercent, 0) / mathQuests.length)
    : 0;
  const logicProgress = logicQuests.length
    ? Math.round(logicQuests.reduce((a, b) => a + b.progressPercent, 0) / logicQuests.length)
    : 0;
  const langProgress = langQuests.length
    ? Math.round(langQuests.reduce((a, b) => a + b.progressPercent, 0) / langQuests.length)
    : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <Flag className="w-4 h-4 text-cyan-primary" />
          <h2 className="text-base font-bold text-text-primary">Subject Mastery</h2>
        </div>
        <span className="text-[11px] font-bold text-cyan-primary">{userStats.grade} Syllabus</span>
      </div>

      <div className="space-y-2">
        <MasteryRow
          label="Mathematics"
          progress={mathProgress}
          color={mathProgress >= 70 ? 'bg-success-green' : 'bg-cyan-primary'}
        />
        <MasteryRow
          label="Reasoning & Intelligence"
          progress={logicProgress}
          color={logicProgress >= 70 ? 'bg-success-green' : 'bg-cyan-primary'}
        />
        <MasteryRow
          label="Language (Marathi/English)"
          progress={langProgress}
          color={langProgress >= 70 ? 'bg-success-green' : 'bg-gold-secondary'}
        />
      </div>
    </div>
  );
};

const MasteryRow: React.FC<{ label: string; progress: number; color: string }> = ({
  label,
  progress,
  color,
}) => (
  <div className="rounded-[12px] bg-surface-container border border-outline p-3 space-y-1.5">
    <div className="flex justify-between items-center text-xs">
      <span className="font-bold text-text-primary">{label}</span>
      <span className="font-bold text-text-primary">{progress}%</span>
    </div>
    <div className="w-full h-2 rounded-full bg-surface-container-lowest overflow-hidden">
      <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${progress}%` }} />
    </div>
  </div>
);

// Subcomponent: Weak Topics
interface WeakTopicsSectionProps {
  mistakes: QuizQuestion[];
  onStartWeakPractice: (topic: string) => void;
}

const WeakTopicsSection: React.FC<WeakTopicsSectionProps> = ({ mistakes, onStartWeakPractice }) => {
  const grouped = useMemo(() => {
    const map: Record<string, QuizQuestion[]> = {};
    mistakes.forEach((m) => {
      const cleanTopic = m.topic.split('•')[0].trim() || m.topic;
      if (!map[cleanTopic]) map[cleanTopic] = [];
      map[cleanTopic].push(m);
    });
    return Object.entries(map)
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 3);
  }, [mistakes]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <Zap className="w-4 h-4 text-cyan-primary" />
          <h2 className="text-base font-bold text-text-primary">Weak Topics to Boost</h2>
        </div>
        <span className="text-[11px] font-bold text-cyan-primary">
          {mistakes.length ? `${mistakes.length} to review` : 'Clean Vault'}
        </span>
      </div>

      {grouped.length === 0 ? (
        <div className="rounded-[12px] bg-surface-container border border-outline p-4 text-center space-y-1">
          <p className="text-xl">🎉</p>
          <p className="text-sm font-bold text-success-green">No Weak Topics Found!</p>
          <p className="text-xs text-text-secondary">
            Your mistake vault is completely clear. Keep practicing to maintain high mastery!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {grouped.map(([topicName, questions]) => {
            const count = questions.length;
            const subjectName = questions[0]?.subject || 'Practice';
            const estimatedScore = Math.max(35, 85 - count * 10);

            return (
              <div
                key={topicName}
                className="rounded-[12px] bg-surface-container border border-outline p-3 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center font-bold text-xs text-gold-secondary">
                    {estimatedScore}%
                  </div>
                  <div>
                    <p className="text-xs font-bold text-text-primary">{topicName}</p>
                    <p className="text-[11px] text-text-secondary">
                      {subjectName} • {count} {count === 1 ? 'mistake' : 'mistakes'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onStartWeakPractice(topicName)}
                  className="px-3 py-1.5 rounded-[10px] bg-cyan-primary text-cyan-on-primary text-xs font-extrabold hover:brightness-110 transition-all"
                >
                  Practice
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Subcomponent: Parent Digest
interface ParentDigestSectionProps {
  userStats: UserStats;
  chapterQuests: ChapterQuest[];
  onShare: () => void;
  onOpenRedeemModal: () => void;
}

const ParentDigestSection: React.FC<ParentDigestSectionProps> = ({
  userStats,
  chapterQuests,
  onShare,
  onOpenRedeemModal,
}) => {
  const currentWeek = useMemo(() => {
    const now = new Date();
    const oneJan = new Date(now.getFullYear(), 0, 1);
    const numberOfDays = Math.floor((now.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
    return Math.ceil((now.getDay() + 1 + numberOfDays) / 7);
  }, []);

  return (
    <div className="rounded-[16px] bg-surface-container-high border border-outline p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-1.5">
            <School className="w-4 h-4 text-cyan-primary" />
            <h2 className="text-base font-bold text-text-primary">Weekly Parent Summary</h2>
          </div>
          <p className="text-xs text-text-secondary">
            Simple insight for {userStats.name.split(' ')[0]}&apos;s study progress
          </p>
        </div>
        <span className="px-2 py-0.5 rounded-[10px] bg-cyan-primary/15 border border-cyan-primary/30 text-cyan-primary text-[11px] font-bold">
          Week {currentWeek}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-[10px] bg-surface-container-lowest border border-outline p-2.5 text-center">
          <p className="text-base font-extrabold text-cyan-primary">{userStats.weeklyQuestions}</p>
          <p className="text-[10px] font-semibold text-text-secondary">Questions</p>
        </div>
        <div className="rounded-[10px] bg-surface-container-lowest border border-outline p-2.5 text-center">
          <p className="text-base font-extrabold text-cyan-primary">{userStats.daysActiveThisWeek}/5</p>
          <p className="text-[10px] font-semibold text-text-secondary">Days Active</p>
        </div>
        <div className="rounded-[10px] bg-surface-container-lowest border border-outline p-2.5 text-center">
          <p className="text-base font-extrabold text-cyan-primary">{userStats.accuracy}%</p>
          <p className="text-[10px] font-semibold text-text-secondary">Avg Accuracy</p>
        </div>
      </div>

      <div className="rounded-[10px] bg-surface-container-lowest/60 p-3 space-y-1.5 text-xs text-text-primary">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-primary" />
          <span>Strongest: Mathematics (75% mastered)</span>
        </div>
        <div className="flex items-center space-x-2">
          <Flag className="w-4 h-4 text-gold-secondary" />
          <span>Focus Area: Language (42% mastered)</span>
        </div>
      </div>

      <button
        onClick={onShare}
        className="w-full py-3 rounded-[12px] bg-gold-container text-gold-on-secondary font-extrabold text-xs flex items-center justify-center space-x-1.5 hover:brightness-110 active:scale-[0.99] transition-all shadow-md"
      >
        <Share2 className="w-4 h-4" />
        <span>Share WhatsApp Digest to Parents</span>
      </button>

      {!userStats.isSubscribed ? (
        <div
          onClick={onOpenRedeemModal}
          className="flex items-center justify-between p-3 rounded-[12px] bg-surface-container-high border border-gold-secondary/50 cursor-pointer"
        >
          <div className="flex items-center space-x-2.5">
            <Award className="w-5 h-5 text-gold-secondary" />
            <div>
              <p className="text-xs font-bold text-text-primary">Scholarship Practice Pass</p>
              <p className="text-[11px] text-gold-secondary">
                Activate pass code to unlock all 12 chapters
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-gold-secondary text-gold-on-secondary text-[11px] font-black">
            Redeem ➔
          </span>
        </div>
      ) : (
        <div className="flex items-center space-x-2.5 p-3 rounded-[12px] bg-surface-container-high border border-success-green/40">
          <CheckCircle2 className="w-4 h-4 text-success-green flex-shrink-0" />
          <div>
            <p className="text-xs font-bold text-text-primary">
              Pass Active • {userStats.trialDaysRemaining} Days Remaining
            </p>
            <p className="text-[11px] text-text-secondary">
              रविवार व्हॉट्सअॅप प्रगती अहवाल सुरू आहेत
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// Subcomponent: Scholarship Pass Status Card
interface ScholarshipPassStatusCardProps {
  userStats: UserStats;
  onOpenRedeemModal: () => void;
  onSyncStatus: () => void;
}

const ScholarshipPassStatusCard: React.FC<ScholarshipPassStatusCardProps> = ({
  userStats,
  onOpenRedeemModal,
  onSyncStatus,
}) => {
  const isSubscribed = userStats.isSubscribed;
  const daysRemaining = userStats.trialDaysRemaining;
  const isActive = isSubscribed && daysRemaining > 0;
  const maxDays = 180;
  const progress = Math.min(1, Math.max(0, daysRemaining / maxDays));

  return (
    <div
      className={`rounded-[16px] bg-gradient-to-b from-surface-container-high to-surface-container-lowest border p-4 space-y-3 shadow-lg ${
        isActive ? 'border-success-green/50' : 'border-gold-secondary/40'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Award className={`w-5 h-5 ${isActive ? 'text-success-green' : 'text-gold-secondary'}`} />
          <div>
            <h3 className="text-sm font-extrabold text-text-primary">Pass Status &amp; Validity</h3>
            <p className="text-[11px] font-semibold text-gold-secondary">Pass Validity &amp; Access</p>
          </div>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
            isActive
              ? 'bg-success-green text-surface-dark'
              : isSubscribed
              ? 'bg-error-red text-white'
              : 'bg-outline text-text-primary'
          }`}
        >
          {isActive ? 'ACTIVE PASS ✓' : isSubscribed ? 'EXPIRED' : 'STARTER'}
        </span>
      </div>

      <div className="rounded-[12px] bg-surface-dark border border-outline p-3.5 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <div>
            <p className="text-[10px] font-bold text-cyan-primary">SCHOLARSHIP PRACTICE PASS</p>
            <p className="text-sm font-black text-text-primary">
              {isActive ? `${daysRemaining} Days Remaining` : 'Free Starter Access • Ch 1 Scout Unlocked'}
            </p>
          </div>
          {isActive && (
            <span className="px-2 py-0.5 rounded-md bg-success-green/15 border border-success-green/40 text-success-green text-[11px] font-bold">
              {Math.round(progress * 100)}% Active
            </span>
          )}
        </div>

        <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-primary to-success-green transition-all"
            style={{ width: `${isActive ? progress * 100 : 0}%` }}
          />
        </div>

        <p className="text-[11px] text-text-secondary leading-tight">
          {isActive
            ? 'Includes all 12 chapters, 36 stage battles, and Sunday WhatsApp parent reports.'
            : 'Redeem an activation pass code or sync student account to unlock full curriculum.'}
        </p>
      </div>

      <div className="space-y-1.5 text-xs text-text-primary">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-primary" />
          <span>10,000+ State Exam Verified Questions</span>
        </div>
        <div className="flex items-center space-x-2">
          <Share2 className="w-4 h-4 text-gold-secondary" />
          <span>Sunday WhatsApp Progress Reports for Parents</span>
        </div>
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-cyan-primary" />
          <span>Unlimited Mistake Revision Book with Audio</span>
        </div>
      </div>

      <div className="flex space-x-2 pt-1">
        <button
          onClick={onOpenRedeemModal}
          className="flex-1 py-2.5 rounded-xl bg-cyan-primary text-cyan-on-primary text-xs font-bold flex items-center justify-center space-x-1 hover:brightness-110 transition-all"
        >
          <Key className="w-3.5 h-3.5" />
          <span>Redeem Pass Code</span>
        </button>
        <button
          onClick={onSyncStatus}
          className="px-3 py-2.5 rounded-xl bg-transparent border border-gold-secondary/70 text-gold-secondary text-xs font-bold flex items-center justify-center space-x-1 hover:bg-gold-secondary/10 transition-all"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Sync Status ⟳</span>
        </button>
      </div>
    </div>
  );
};

// Subcomponent: Settings Section
interface SettingsSectionProps {
  currentGrade: string;
  onOpenGradeDialog: () => void;
  onOpenSyllabus: () => void;
  onOpenPrivacyPolicy: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
  currentGrade,
  onOpenGradeDialog,
  onOpenSyllabus,
  onOpenPrivacyPolicy,
  onLogout,
  onDeleteAccount,
}) => {
  return (
    <div className="rounded-[12px] bg-surface-container border border-outline divide-y divide-outline">
      <SettingRow
        icon={<School className="w-5 h-5 text-text-secondary" />}
        label={`Switch Class / Grade (${currentGrade})`}
        onClick={onOpenGradeDialog}
      />
      <SettingRow
        icon={<FileText className="w-5 h-5 text-text-secondary" />}
        label="Exam Language (Marathi / Semi-English)"
        onClick={onOpenSyllabus}
      />
      <SettingRow
        icon={<HelpCircle className="w-5 h-5 text-text-secondary" />}
        label="Scholarship Syllabus & Exam Pattern"
        onClick={onOpenSyllabus}
      />
      <SettingRow
        icon={<ShieldCheck className="w-5 h-5 text-text-secondary" />}
        label="Privacy Policy & Student Data Safety"
        onClick={onOpenPrivacyPolicy}
      />
      <SettingRow
        icon={<LogOut className="w-5 h-5 text-text-secondary" />}
        label="Sign Out / Switch Student"
        onClick={onLogout}
      />
      <SettingRow
        icon={<Trash2 className="w-5 h-5 text-error-red" />}
        label="Delete Account & Reset Data"
        textColor="text-error-red"
        onClick={onDeleteAccount}
      />
    </div>
  );
};

const SettingRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  textColor?: string;
  onClick: () => void;
}> = ({ icon, label, textColor = 'text-text-primary', onClick }) => (
  <div
    onClick={onClick}
    className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-surface-container-high transition-colors"
  >
    <div className="flex items-center space-x-3">
      {icon}
      <span className={`text-xs font-semibold ${textColor}`}>{label}</span>
    </div>
    <ChevronRight className="w-4 h-4 text-text-secondary" />
  </div>
);

// Dialogs
const LogoutDialog: React.FC<{ onConfirm: () => void; onCancel: () => void }> = ({
  onConfirm,
  onCancel,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div className="w-full max-w-sm rounded-[16px] bg-surface-container-high border border-outline p-5 shadow-2xl space-y-3">
      <div className="flex items-center space-x-2 text-error-red">
        <LogOut className="w-5 h-5" />
        <h3 className="text-base font-bold text-text-primary">Sign Out Student?</h3>
      </div>
      <p className="text-xs text-text-secondary leading-relaxed">
        Are you sure you want to sign out? Your current session and cached student data will be cleared from this device. You can log back in at any time.
      </p>
      <div className="flex space-x-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg bg-surface-container text-text-secondary text-xs font-semibold hover:text-text-primary"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2 rounded-lg bg-error-red text-white text-xs font-bold hover:brightness-110"
        >
          Sign Out
        </button>
      </div>
    </div>
  </div>
);

const PrivacyPolicyDialog: React.FC<{ onClose: () => void; onOpenWebPolicy: () => void }> = ({
  onClose,
  onOpenWebPolicy,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div className="w-full max-w-md max-h-[85vh] rounded-[20px] bg-surface-container-high border border-outline p-5 shadow-2xl flex flex-col space-y-3">
      <div className="flex items-center space-x-2">
        <ShieldCheck className="w-5 h-5 text-cyan-primary" />
        <h3 className="text-base font-bold text-text-primary">Student Privacy &amp; Safety</h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 text-xs text-text-secondary pr-1">
        <p className="text-text-primary font-semibold">
          Abhyas Arena strictly complies with Google Play&apos;s Families Policy and Child Privacy Standards:
        </p>
        <div>
          <p className="font-bold text-text-primary">🔒 Zero Commercial Advertisements</p>
          <p>No behavioral tracking, commercial banners, or third-party ad networks.</p>
        </div>
        <div>
          <p className="font-bold text-text-primary">📚 Educational Progress Records</p>
          <p>We store student name, ID, grade, school, question accuracy, and mistake notebook entries strictly to track syllabus completion and power revision.</p>
        </div>
        <div>
          <p className="font-bold text-text-primary">👨‍👩‍👧 Parent Transparency</p>
          <p>Parent phone numbers are used solely for optional Sunday WhatsApp progress digests and scholarship pass recovery. Never sold or shared.</p>
        </div>
        <div>
          <p className="font-bold text-text-primary">⚡ Offline-First Storage</p>
          <p>Bookmarks and mistake notebooks are stored locally on your device for low-data rural connectivity.</p>
        </div>
        <div>
          <p className="font-bold text-text-primary">🗑️ Right to Erasure (Account Deletion)</p>
          <p>Students and parents can permanently delete account data, mistake logs, and leaderboard records at any time from this Settings menu or online.</p>
        </div>
      </div>

      <div className="flex space-x-2 pt-2 border-t border-outline">
        <button
          onClick={onClose}
          className="flex-1 py-2 rounded-lg bg-surface-container text-text-secondary text-xs font-semibold hover:text-text-primary"
        >
          Close
        </button>
        <button
          onClick={onOpenWebPolicy}
          className="flex-1 py-2 rounded-lg bg-cyan-primary text-cyan-on-primary text-xs font-bold hover:brightness-110"
        >
          Open Web Policy
        </button>
      </div>
    </div>
  </div>
);

const DeleteAccountStep1Dialog: React.FC<{
  studentId: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ studentId, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div className="w-full max-w-sm rounded-[16px] bg-surface-container-high border border-outline p-5 shadow-2xl space-y-3">
      <div className="flex items-center space-x-2 text-error-red">
        <AlertTriangle className="w-5 h-5" />
        <h3 className="text-base font-bold text-text-primary">Delete Account &amp; Reset?</h3>
      </div>
      <p className="text-xs text-text-secondary leading-relaxed">
        Are you sure you want to delete account &apos;{studentId}&apos;?
        <br /><br />
        This will permanently erase your study records, earned XP, division rank, mistake notebook, and chapter mastery stars on this device.
        <br /><br />
        This action cannot be undone.
      </p>
      <div className="flex space-x-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg bg-surface-container text-text-secondary text-xs font-semibold hover:text-text-primary"
        >
          Cancel / Keep
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2 rounded-lg bg-error-red text-white text-xs font-bold hover:brightness-110"
        >
          Continue
        </button>
      </div>
    </div>
  </div>
);

const DeleteAccountStep2Dialog: React.FC<{
  studentName: string;
  studentId: string;
  passwordInput: string;
  setPasswordInput: (val: string) => void;
  passwordVisible: boolean;
  setPasswordVisible: (val: boolean) => void;
  errorMessage: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({
  studentName,
  studentId,
  passwordInput,
  setPasswordInput,
  passwordVisible,
  setPasswordVisible,
  errorMessage,
  onConfirm,
  onCancel,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div className="w-full max-w-sm rounded-[16px] bg-surface-container-high border border-outline p-5 shadow-2xl space-y-3">
      <div className="flex items-center space-x-2 text-error-red">
        <Lock className="w-5 h-5" />
        <h3 className="text-base font-bold text-text-primary">Security Verification</h3>
      </div>
      <p className="text-xs text-text-secondary leading-relaxed">
        To protect student &apos;{studentName}&apos; from unauthorized deletion, enter your Student Password for &apos;{studentId}&apos;:
      </p>

      <div className="relative">
        <input
          type={passwordVisible ? 'text' : 'password'}
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          placeholder="Enter student password"
          className="w-full px-3 py-2 text-xs rounded-lg bg-surface-dark border border-outline text-text-primary focus:border-error-red outline-none"
        />
        <button
          type="button"
          onClick={() => setPasswordVisible(!passwordVisible)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
        >
          {passwordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {errorMessage && (
        <p className="text-[11px] font-semibold text-error-red">{errorMessage}</p>
      )}

      <p className="text-[10px] text-error-red/90 font-medium">
        ⚠️ Irreversible: All XP, streaks, and records will be destroyed immediately.
      </p>

      <div className="flex space-x-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg bg-surface-container text-text-secondary text-xs font-semibold hover:text-text-primary"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={!passwordInput.trim()}
          className="flex-1 py-2 rounded-lg bg-error-red text-white text-xs font-bold hover:brightness-110 disabled:opacity-50"
        >
          Verify &amp; Delete
        </button>
      </div>
    </div>
  </div>
);

const GradeSelectionDialog: React.FC<{
  currentGrade: string;
  onSelectGrade: (grade: ClassGrade) => void;
  onClose: () => void;
}> = ({ currentGrade, onSelectGrade, onClose }) => {
  const grades = [
    ClassGrade.CLASS_4,
    ClassGrade.CLASS_5,
    ClassGrade.CLASS_6,
    ClassGrade.CLASS_7,
    ClassGrade.CLASS_8,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[16px] bg-surface-dark border border-outline p-5 shadow-2xl space-y-3">
        <div className="flex items-center space-x-2">
          <School className="w-5 h-5 text-cyan-primary" />
          <h3 className="text-base font-bold text-text-primary">Select Class / Exam Track</h3>
        </div>
        <p className="text-xs text-text-secondary leading-relaxed">
          Switching class adapts your practice chapters, mock tests, and syllabus guidelines.
        </p>

        <div className="space-y-2 pt-1">
          {grades.map((g) => {
            const isSelected = currentGrade.toLowerCase() === g.label.toLowerCase();
            return (
              <div
                key={g.id}
                onClick={() => {
                  onSelectGrade(g);
                  onClose();
                }}
                className={`p-3 rounded-[10px] border cursor-pointer flex justify-between items-center transition-all ${
                  isSelected
                    ? 'bg-cyan-primary/15 border-cyan-primary'
                    : 'bg-surface-container border-outline hover:border-text-secondary'
                }`}
              >
                <div>
                  <p
                    className={`text-sm font-bold ${
                      isSelected ? 'text-cyan-primary' : 'text-text-primary'
                    }`}
                  >
                    {g.label}
                  </p>
                  <p className="text-[11px] text-text-secondary">{g.examName}</p>
                </div>
                {isSelected && (
                  <span className="text-xs font-bold text-cyan-primary">Active ✓</span>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 text-xs font-bold text-cyan-primary hover:underline pt-1"
        >
          Close
        </button>
      </div>
    </div>
  );
};
