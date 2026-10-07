export const TabType = {
  HOME: 'HOME' as const,
  PRACTICE: 'PRACTICE' as const,
  MISTAKES: 'MISTAKES' as const,
  ARENA: 'ARENA' as const,
  PROFILE: 'PROFILE' as const,
};
export type TabType = 'HOME' | 'PRACTICE' | 'MISTAKES' | 'ARENA' | 'PROFILE';

export type AppRouteType = 'auth' | 'home' | 'practice' | 'quest_battle' | 'mistakes' | 'arena' | 'profile';

export interface ClassGradeInfo {
  id?: string;
  key: string;
  label: string;
  examName: string;
}

export const ClassGrade = {
  CLASS_4: { id: 'CLASS_4', key: 'CLASS_4', label: 'Class 4', examName: 'Pre-Scholarship Foundation' },
  CLASS_5: { id: 'CLASS_5', key: 'CLASS_5', label: 'Class 5', examName: 'Maharashtra State Primary Scholarship Exam (PUP)' },
  CLASS_6: { id: 'CLASS_6', key: 'CLASS_6', label: 'Class 6', examName: 'Middle School Foundation' },
  CLASS_7: { id: 'CLASS_7', key: 'CLASS_7', label: 'Class 7', examName: 'Pre-Secondary Scholarship' },
  CLASS_8: { id: 'CLASS_8', key: 'CLASS_8', label: 'Class 8', examName: 'Maharashtra State High School Scholarship Exam (HSS)' },
  values: () => [
    { id: 'CLASS_4', key: 'CLASS_4', label: 'Class 4', examName: 'Pre-Scholarship Foundation' },
    { id: 'CLASS_5', key: 'CLASS_5', label: 'Class 5', examName: 'Maharashtra State Primary Scholarship Exam (PUP)' },
    { id: 'CLASS_6', key: 'CLASS_6', label: 'Class 6', examName: 'Middle School Foundation' },
    { id: 'CLASS_7', key: 'CLASS_7', label: 'Class 7', examName: 'Pre-Secondary Scholarship' },
    { id: 'CLASS_8', key: 'CLASS_8', label: 'Class 8', examName: 'Maharashtra State High School Scholarship Exam (HSS)' },
  ]
};
export type ClassGrade = ClassGradeInfo;

export const CLASS_GRADES: Record<string, ClassGradeInfo> = {
  CLASS_4: ClassGrade.CLASS_4,
  CLASS_5: ClassGrade.CLASS_5,
  CLASS_6: ClassGrade.CLASS_6,
  CLASS_7: ClassGrade.CLASS_7,
  CLASS_8: ClassGrade.CLASS_8,
};

export interface Option {
  key: string; // "A", "B", "C", "D"
  text: string;
}

export interface QuizQuestion {
  id: string;
  code?: string;
  subject: string;
  topic: string;
  grade?: string;
  exam?: string;
  language?: string;
  difficulty?: string;
  question: string;
  hint?: string;
  options: Option[];
  correctAnswer: string; // "A", "B", "C", "D"
  correctAnswerText?: string;
  explanation: string;
  chapterId?: string;
  stageType?: string; // "scout", "warrior", "boss", "blitz"
  userWrongChoice?: string | null;
  attemptTimeSeconds?: number | null;
  attemptDate?: string | null;
  isBookmarked?: boolean;
  isConquered?: boolean;
}

export type StageType = 'SCOUT' | 'WARRIOR' | 'BOSS' | 'BLITZ';

export interface QuestStage {
  stageNumber: number;
  name: string;
  type: StageType;
  difficulty: string; // "Easy", "Medium", "Hard - Exam PYQ"
  questionCount: number;
  xpReward: number;
  isCompleted?: boolean;
  isCurrent?: boolean;
  isLocked?: boolean;
  stars?: number;
  claimedMasteryBonus?: number;
}

export interface ChapterQuest {
  id: string;
  subject: string; // "Mathematics", "Reasoning & Intelligence", "Language", "Science"
  chapterNumber: number;
  title: string;
  topics?: string;
  icon?: string;
  marksWeightage?: string;
  stars: number; // 0 to 3
  totalStages?: number;
  currentStage?: number;
  progressPercent: number;
  isLocked?: boolean;
  requiredLevel?: number;
  stages: QuestStage[];
  dojoQuestionsSolved?: number;
  track?: string; // "school" or "exam"
}

export type DojoTier = 'INITIATE' | 'BRONZE' | 'SILVER' | 'GOLD';

export interface DojoTierConfig {
  displayName: string;
  chipEmoji: string;
}

export const DOJO_TIERS: Record<DojoTier, DojoTierConfig> = {
  INITIATE: { displayName: 'Initiate', chipEmoji: '⚪' },
  BRONZE: { displayName: 'Bronze Scholar', chipEmoji: '🥉' },
  SILVER: { displayName: 'Silver Master', chipEmoji: '🥈' },
  GOLD: { displayName: 'Gold Grandmaster', chipEmoji: '🥇' },
};

export interface DojoMasteryInfo {
  tier: DojoTier;
  solved: number;
  targetQuestions: number;
  maxQuestions: number;
  pipsFilled: number;
  nextTierReward: number;
}

export function getDojoTierMilestoneReward(tier: DojoTier, grade: string): number {
  const cleanGrade = grade.replace(/\D/g, '');
  const isJunior = cleanGrade === '' || cleanGrade === '4' || cleanGrade === '5';
  if (isJunior) {
    switch (tier) {
      case 'BRONZE': return 7;
      case 'SILVER': return 7;
      case 'GOLD': return 10;
      default: return 0;
    }
  } else {
    switch (tier) {
      case 'BRONZE': return 10;
      case 'SILVER': return 7;
      case 'GOLD': return 10;
      default: return 0;
    }
  }
}

export function calculateDojoMastery(solvedCount: number, grade: string): DojoMasteryInfo {
  const cleanGrade = grade.replace(/\D/g, '');
  const isJunior = cleanGrade === '' || cleanGrade === '4' || cleanGrade === '5';
  const [t1, t2, t3] = isJunior ? [5, 10, 15] : [10, 15, 20];

  let tier: DojoTier = 'INITIATE';
  let pips = 0;
  let target = t1;

  if (solvedCount >= t3) {
    tier = 'GOLD';
    pips = 3;
    target = t3;
  } else if (solvedCount >= t2) {
    tier = 'SILVER';
    pips = 2;
    target = t3;
  } else if (solvedCount >= t1) {
    tier = 'BRONZE';
    pips = 1;
    target = t2;
  } else {
    tier = 'INITIATE';
    pips = 0;
    target = t1;
  }

  let nextReward = 0;
  if (tier === 'INITIATE') nextReward = getDojoTierMilestoneReward('BRONZE', grade);
  else if (tier === 'BRONZE') nextReward = getDojoTierMilestoneReward('SILVER', grade);
  else if (tier === 'SILVER') nextReward = getDojoTierMilestoneReward('GOLD', grade);

  return {
    tier,
    solved: solvedCount,
    targetQuestions: target,
    maxQuestions: t3,
    pipsFilled: pips,
    nextTierReward: nextReward,
  };
}

export interface InProgressSession {
  questTitle: string;
  stageSubtitle: string;
  chapterId: string;
  stageNumber: number;
  questions: QuizQuestion[];
  currentIndex: number;
  correctCount: number;
  totalXpEarned: number;
  elapsedTime: number;
  totalStageXp: number;
  isArenaBattle?: boolean;
  isMistakeBattle?: boolean;
  isReplay?: boolean;
  isSpeedBlitz?: boolean;
  studentId?: string | null;
}

export const AmbajogaiSchools = {
  KHOLESHWAR: 'Kholeshwar Vidyalaya, Ambajogai',
  YOGESHWARI: 'Yogeshwari Vidyalaya, Ambajogai',
  JAIHIND: 'Jaihind Vidyalaya, Ambajogai',
  NEW_HIGH_SCHOOL: 'New High School, Ambajogai',
  SIDDHESHWAR: 'Shri Siddheshwar Vidyalaya, Ambajogai',
  OTHER: 'Other School, Ambajogai',
  ALL: [
    'Kholeshwar Vidyalaya, Ambajogai',
    'Yogeshwari Vidyalaya, Ambajogai',
    'Jaihind Vidyalaya, Ambajogai',
    'New High School, Ambajogai',
    'Shri Siddheshwar Vidyalaya, Ambajogai',
    'Other School, Ambajogai',
  ],
};

export function calculateLevel(xp: number): number {
  if (xp < 150) return 1;
  if (xp < 350) return 2;
  if (xp < 600) return 3;
  if (xp < 900) return 4;
  if (xp < 1300) return 5;
  if (xp < 1800) return 6;
  if (xp < 2400) return 7;
  if (xp < 3100) return 8;
  if (xp < 3900) return 9;
  if (xp < 4800) return 10;
  if (xp < 5800) return 11;
  if (xp < 7000) return 12;
  if (xp < 8400) return 13;
  if (xp < 10000) return 14;
  return Math.min(20, Math.floor(15 + (xp - 10000) / 1500));
}

export function calculateStreakStatus(streakDays: number): string {
  if (streakDays >= 14) return 'Legendary';
  if (streakDays >= 7) return 'Unstoppable';
  if (streakDays >= 3) return 'On Fire';
  return 'Getting Started';
}

export const QuestionXpCalculator = {
  calculateBaseXp(
    difficulty: string,
    isBossQuestion = false,
    isArenaBattle = false,
    isSpeedBlitz = false,
    speedBonus = 0
  ): number {
    if (isArenaBattle || isSpeedBlitz) return 15 + speedBonus;
    if (isBossQuestion) return 30;
    if (difficulty.toLowerCase().includes('hard') || difficulty.toLowerCase().includes('pyq')) return 15;
    if (difficulty.toLowerCase().includes('medium')) return 12;
    return 10;
  },

  calculateHintDeduction(difficulty: string, isBossQuestion = false): number {
    if (isBossQuestion) return 9;
    if (difficulty.toLowerCase().includes('hard') || difficulty.toLowerCase().includes('pyq')) return 5;
    if (difficulty.toLowerCase().includes('medium')) return 3;
    return 2;
  },

  calculateComboBonus(difficulty: string, isBossQuestion = false, combo = 0): number {
    const isEasy =
      !isBossQuestion &&
      !difficulty.toLowerCase().includes('hard') &&
      !difficulty.toLowerCase().includes('pyq') &&
      !difficulty.toLowerCase().includes('medium');

    if (isBossQuestion || isEasy) return 0;
    if (combo >= 4) return 5;
    if (combo >= 2) return 3;
    return 0;
  },

  calculateAwardedXp(
    difficulty: string,
    isBossQuestion = false,
    isArenaBattle = false,
    isSpeedBlitz = false,
    isReplay = false,
    isDojo = false,
    isFastAnswer = false,
    showHint = false,
    combo = 0,
    speedBonus = 0
  ): number {
    if (isDojo) {
      const base = 5;
      const speed = isFastAnswer ? 3 : 0;
      const deduction = showHint ? 1 : 0;
      return Math.max(1, base + speed - deduction);
    }
    const baseXP = this.calculateBaseXp(difficulty, isBossQuestion, isArenaBattle, isSpeedBlitz, speedBonus);
    const hintDeduction = this.calculateHintDeduction(difficulty, isBossQuestion);
    const comboBonus = this.calculateComboBonus(difficulty, isBossQuestion, combo);

    if (isArenaBattle || isSpeedBlitz) return baseXP;
    if (isReplay) return 2;
    if (showHint) return baseXP - hintDeduction;
    return baseXP + comboBonus;
  },
};

export interface Scholar {
  rank: number;
  name: string;
  city: string;
  school?: string | null;
  grade: string;
  division: string;
  points: number;
  accuracy: number;
  isUser?: boolean;
  avatarUrl?: string;
  studentId?: string | null;
}

export interface ImprovedScholar {
  name: string;
  city: string;
  prevAcc: number;
  currAcc: number;
  growth: number;
  icon: string;
  color: string;
}

export type BadgeTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND' | 'MYTHIC';

export interface BadgeTierMeta {
  displayName: string;
  colorHex: string;
  rarityPercentile: string;
  rarityLabel: string;
}

export const BADGE_TIER_META: Record<BadgeTier, BadgeTierMeta> = {
  BRONZE: {
    displayName: 'Bronze',
    colorHex: '#CD7F32',
    rarityPercentile: 'Top 100% of Scholars',
    rarityLabel: 'BRONZE INITIATE',
  },
  SILVER: {
    displayName: 'Silver',
    colorHex: '#C0C0C0',
    rarityPercentile: 'Top 28% of Scholars',
    rarityLabel: 'SILVER ACHIEVER',
  },
  GOLD: {
    displayName: 'Gold',
    colorHex: '#F5B94C',
    rarityPercentile: 'Top 12% of Scholars',
    rarityLabel: 'GOLD SCHOLAR',
  },
  DIAMOND: {
    displayName: 'Diamond',
    colorHex: '#22C7E6',
    rarityPercentile: 'Top 4.5% of Scholars',
    rarityLabel: 'DIAMOND MASTER',
  },
  MYTHIC: {
    displayName: 'Mythic',
    colorHex: '#FF3D71',
    rarityPercentile: 'Top 0.8% of Scholars',
    rarityLabel: 'MYTHIC ELITE',
  },
};

export function getBadgeTierAccentColor(tier: BadgeTier): string {
  return BADGE_TIER_META[tier]?.colorHex || '#F5B94C';
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  status: 'Unlocked' | 'Locked';
  highlight?: string | null;
  description: string;
  tier: BadgeTier;
  xpBonus: number;
  currentProgress: number;
  maxProgress: number;
  category: string;
}

export interface UserStats {
  name: string;
  studentId: string;
  grade: string;
  schoolName: string;
  town: string;
  division: string;
  exam: string;
  districtRank: number;
  district: string;
  level: number;
  xp: number;
  weeklyXp: number;
  schoolWeeklyXp: number;
  examWeeklyXp: number;
  schoolArenaRank: number;
  examArenaRank: number;
  isExamEnrolled: boolean;
  examTrack: string;
  streakDays: number;
  streakStatus: string;
  solvedQuestions: number;
  totalAttemptedQuestions: number;
  accuracy: number;
  arenaRank: number;
  arenaPoints: number;
  arenaQs: number;
  weeklyQuestions: number;
  daysActiveThisWeek: number;
  activeSubject: string;
  activeChapter: string;
  chapterProgress: number;
  isSubscribed: boolean;
  trialDaysRemaining: number;
  subscriptionExpiresAt: string | null;
  companionId: string;
  parentPhone: string;
}

export interface ArenaCompanion {
  id: string;
  name: string;
  emoji: string;
  title: string;
  tagline: string;
  auraColorHex: string;
  attackName: string;
}

export const ARENA_COMPANIONS: ArenaCompanion[] = [
  {
    id: 'unicorn',
    name: 'Star Unicorn',
    emoji: '🦄',
    title: 'Radiant Mystic',
    tagline: 'Radiant Magic & Wonder ✨',
    auraColorHex: '#D946EF',
    attackName: 'Starlight Sparkle',
  },
  {
    id: 'dragon',
    name: 'Cosmic Dragon',
    emoji: '🐉',
    title: 'Flame Sovereign',
    tagline: 'Unstoppable Fire 🔥',
    auraColorHex: '#10B981',
    attackName: 'Cosmic Breath',
  },
  {
    id: 'owl',
    name: 'Cyber Owl',
    emoji: '🦉',
    title: 'Wise Tactician',
    tagline: 'Sharp Memory & Mind 🧠',
    auraColorHex: '#06B6D4',
    attackName: 'Cerebral Pulse',
  },
  {
    id: 'phoenix',
    name: 'Golden Phoenix',
    emoji: '🦅',
    title: 'Sun Champion',
    tagline: 'Rises from Mistakes 🌟',
    auraColorHex: '#F59E0B',
    attackName: 'Solar Rebirth',
  },
  {
    id: 'lion',
    name: 'Royal Lion',
    emoji: '🦁',
    title: 'Apex Guardian',
    tagline: 'Fearless Champion 👑',
    auraColorHex: '#EAB308',
    attackName: 'Apex Roar',
  },
  {
    id: 'fox',
    name: 'Shadow Fox',
    emoji: '🦊',
    title: 'Swift Riddlemaster',
    tagline: 'Clever & One Step Ahead 🐾',
    auraColorHex: '#F97316',
    attackName: 'Shadow Pounce',
  },
  {
    id: 'bot',
    name: 'Astro Bot',
    emoji: '🤖',
    title: 'Quantum Cybernetic',
    tagline: 'Lightspeed Logic ⚡',
    auraColorHex: '#3B82F6',
    attackName: 'Laser Formula',
  },
  {
    id: 'knight',
    name: 'Valiant Knight',
    emoji: '⚔️',
    title: 'Order of Scholar',
    tagline: 'Steadfast Honor 🛡️',
    auraColorHex: '#8B5CF6',
    attackName: 'Justice Blade',
  },
];

export function getCompanionById(id: string): ArenaCompanion {
  return ARENA_COMPANIONS.find((c) => c.id.toLowerCase() === id.toLowerCase()) || ARENA_COMPANIONS[0];
}

export const ArenaCompanions = {
  ALL: ARENA_COMPANIONS,
  getById: getCompanionById,
};

export interface ProfileDto {
  id?: string | null;
  student_id: string;
  name: string;
  grade: string;
  school_name: string;
  town: string;
  division: string;
  companion_id: string;
  xp: number;
  weekly_xp: number;
  level: number;
  streak_days: number;
  arena_rank: number;
  arena_points: number;
  arena_qs: number;
  solved_questions: number;
  total_attempted_questions?: number;
  accuracy: number;
  weekly_questions: number;
  days_active_this_week: number;
  is_subscribed: boolean;
  trial_days_remaining: number;
  subscription_expires_at?: string | null;
}

export interface MistakeDto {
  id?: string | null;
  student_id: string;
  question_id: string;
  user_wrong_choice?: string | null;
  attempt_time_seconds?: number | null;
  is_bookmarked?: boolean;
  is_conquered?: boolean;
}

export interface VoucherRpcResponse {
  success: boolean;
  error_code?: string | null;
  message?: string | null;
  months?: number | null;
  plan_id?: string | null;
  expires_at?: string | null;
}

export interface RemoteAuthResult {
  success: boolean;
  status?: string | null;
  error_code?: string | null;
  message?: string | null;
}

export const SubscriptionTimeUtils = {
  parseIsoTimestamp(isoString?: string | null): number | null {
    if (!isoString) return null;
    const clean = isoString.trim();
    if (/^\d+$/.test(clean)) {
      return parseInt(clean, 10);
    }
    const parsed = Date.parse(clean);
    return isNaN(parsed) ? null : parsed;
  },

  formatIsoTimestamp(epochMs: number): string {
    return new Date(epochMs).toISOString();
  },

  formatDisplayDate(epochMs: number): string {
    return new Date(epochMs).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  },

  calculateDaysRemaining(expiryMs: number, nowMs: number = Date.now()): number {
    if (expiryMs <= nowMs) return 0;
    const diffMs = expiryMs - nowMs;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(1, days);
  },
};
