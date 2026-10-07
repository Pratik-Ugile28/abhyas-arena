import {
  Badge,
  BadgeTier,
  ChapterQuest,
  ClassGradeInfo,
  DojoTier,
  ImprovedScholar,
  MistakeDto,
  ProfileDto,
  QuizQuestion,
  RemoteAuthResult,
  Scholar,
  SubscriptionTimeUtils,
  UserStats,
  VoucherRpcResponse,
  calculateDojoMastery,
  calculateLevel,
  calculateStreakStatus,
} from '../types';
import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import { sessionStore } from './sessionStore';
import { QuestionSequencer } from './quizSequencer';
import {
  DEFAULT_CHAPTER_QUESTS,
  MOST_IMPROVED_SCHOLARS,
  SEED_QUESTIONS,
  SIMULATED_PEERS,
  SIMULATED_SCHOOL_PEERS,
} from './seedData';
import { AuthValidator } from './authService';

export class AbhyasRepository {
  private userStats: UserStats;
  private mistakes: QuizQuestion[] = [];
  private chapterQuests: ChapterQuest[] = [];
  private bookmarkedQuestionIds: Set<string> = new Set();
  private unlockedBadgeIds: Set<string> = new Set();
  private conqueredMistakesCount = 0;
  private featuredBadgeId: string | null = null;
  private remoteScholars: Scholar[] | null = null;
  private dailyQuestionsSolved = 0;
  private isDailyGoalClaimed = false;

  private listeners: (() => void)[] = [];

  constructor() {
    this.userStats = this.getDefaultUserStats();
    this.initializeState();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  public getDefaultUserStats(): UserStats {
    return {
      name: 'Aarav Patil',
      studentId: 'STU-58291',
      grade: 'Class 5',
      schoolName: 'Kholeshwar Vidyalaya, Ambajogai',
      town: 'Ambajogai',
      division: '5-A',
      exam: 'Maharashtra State Scholarship Exam (PUP)',
      district: 'Beed District',
      districtRank: 7,
      level: calculateLevel(4280),
      xp: 4280,
      weeklyXp: 820,
      schoolWeeklyXp: 420,
      examWeeklyXp: 400,
      schoolArenaRank: 5,
      examArenaRank: 3,
      isExamEnrolled: true,
      examTrack: 'Navodaya',
      streakDays: 6,
      streakStatus: 'On Fire',
      solvedQuestions: 342,
      totalAttemptedQuestions: 417,
      accuracy: 82,
      arenaRank: 7,
      arenaPoints: 820,
      arenaQs: 64,
      weeklyQuestions: 126,
      daysActiveThisWeek: 4,
      activeSubject: 'Mathematics',
      activeChapter: 'Fractions & Decimals',
      chapterProgress: 65,
      isSubscribed: false,
      trialDaysRemaining: 0,
      subscriptionExpiresAt: null,
      companionId: 'unicorn',
      parentPhone: '9822123456',
    };
  }

  public getDefaultMistakes(): QuizQuestion[] {
    return [
      {
        id: 'q_m8',
        code: 'PUP-2022-FRC-08',
        subject: 'Mathematics',
        topic: 'Math • Fractions',
        grade: 'Class 5',
        difficulty: 'Medium',
        chapterId: 'math_ch2',
        stageType: 'warrior',
        question: 'If 3/5 of a water tank is 60 liters, what is the total capacity of the tank?',
        hint: '3 parts = 60 liters, so 1 part = 20 liters. 5 parts = 100 liters.',
        options: [
          { key: 'A', text: '80 L' },
          { key: 'B', text: '90 L' },
          { key: 'C', text: '100 L' },
          { key: 'D', text: '120 L' },
        ],
        correctAnswer: 'C',
        explanation: '3/5 = 60 L → 1/5 = 20 L → 5/5 = 100 L.',
        userWrongChoice: 'B',
        attemptTimeSeconds: 24,
        attemptDate: 'Attempted 2d ago',
        isBookmarked: true,
      },
      {
        id: 'q_l4',
        code: 'PUP-2021-LOG-BOSS',
        subject: 'Reasoning & Intelligence',
        topic: 'Reasoning • Classification',
        grade: 'Class 5',
        difficulty: 'Hard - Exam PYQ',
        chapterId: 'logic_ch1',
        stageType: 'boss',
        question: 'At 3:15, what is the angle between the hour hand and minute hand of a clock?',
        hint: 'The hour hand does not stay frozen at 3; it moves 0.5° every minute!',
        options: [
          { key: 'A', text: '0°' },
          { key: 'B', text: '7.5°' },
          { key: 'C', text: '15°' },
          { key: 'D', text: '30°' },
        ],
        correctAnswer: 'B',
        explanation: 'In 15 minutes, the hour hand moves: 15 × 0.5° = 7.5° past 3. Minute hand is exactly at 3 (90°). Angle = 7.5°.',
        userWrongChoice: 'A',
        attemptTimeSeconds: 31,
        attemptDate: 'Attempted 3d ago',
        isBookmarked: true,
      },
      {
        id: 'q_lan1',
        code: 'PUP-2023-LAN-01',
        subject: 'Language',
        topic: 'Language • Antonyms',
        grade: 'Class 5',
        difficulty: 'Easy',
        chapterId: 'lang_ch1',
        stageType: 'scout',
        question: 'Choose the exact antonym for the underlined word: "The king showed immense clemency to the travelers."',
        hint: 'Clemency = Mercy / Leniency. Antonym = Harshness / Cruelty.',
        options: [
          { key: 'A', text: 'Kindness' },
          { key: 'B', text: 'Generosity' },
          { key: 'C', text: 'Harshness' },
          { key: 'D', text: 'Bravery' },
        ],
        correctAnswer: 'C',
        explanation: 'Harshness is the true antonym of clemency.',
        userWrongChoice: 'A',
        attemptTimeSeconds: 12,
        attemptDate: 'Attempted yesterday',
        isBookmarked: true,
      },
      {
        id: 'q_m2',
        code: 'PUP-2023-FRC-02',
        subject: 'Mathematics',
        topic: 'Math • Fractions',
        grade: 'Class 5',
        difficulty: 'Medium',
        chapterId: 'math_ch2',
        stageType: 'warrior',
        question: 'Solve: 5/8 + 1/4 = ?',
        hint: 'Convert 1/4 into eighths first: 1/4 = 2/8.',
        options: [
          { key: 'A', text: '6/12' },
          { key: 'B', text: '7/8' },
          { key: 'C', text: '6/8' },
          { key: 'D', text: '5/32' },
        ],
        correctAnswer: 'B',
        explanation: '5/8 + 2/8 = 7/8.',
        userWrongChoice: 'A',
        attemptTimeSeconds: 18,
        attemptDate: 'Attempted 1d ago',
        isBookmarked: true,
      },
      {
        id: 'q_log1',
        code: 'PUP-2023-LOG-01',
        subject: 'Reasoning & Intelligence',
        topic: 'Reasoning • Classification',
        grade: 'Class 5',
        difficulty: 'Easy',
        chapterId: 'logic_ch1',
        stageType: 'scout',
        question: 'Find the odd one out among the following numbers: 27, 64, 125, 144',
        hint: 'Look at cubes vs squares: 3³=27, 4³=64, 5³=125, but 144 is 12².',
        options: [
          { key: 'A', text: '27' },
          { key: 'B', text: '64' },
          { key: 'C', text: '125' },
          { key: 'D', text: '144' },
        ],
        correctAnswer: 'D',
        explanation: '27 (3³), 64 (4³), and 125 (5³) are perfect cubes. 144 is a square (12²).',
        userWrongChoice: 'B',
        attemptTimeSeconds: 15,
        attemptDate: 'Attempted 4d ago',
        isBookmarked: false,
      },
    ];
  }

  private initializeState(): void {
    const savedStudentId = sessionStore.getSavedStudentId();
    const isRealAuthenticated = sessionStore.isLoggedIn() && !!savedStudentId && savedStudentId !== 'STU-58291';
    const effectiveStudentId = isRealAuthenticated ? savedStudentId! : 'STU-58291';

    const savedBadges = sessionStore.getUnlockedBadges(effectiveStudentId);

    if (isRealAuthenticated) {
      const cachedStats = sessionStore.getCachedUserStats(effectiveStudentId);
      const passMonths = sessionStore.getScholarshipPassMonths(effectiveStudentId);
      let expiryMs = sessionStore.getScholarshipPassExpiryTimestamp(effectiveStudentId);
      const now = Date.now();

      if (expiryMs === 0 && passMonths > 0) {
        expiryMs = now + passMonths * 30 * 24 * 60 * 60 * 1000;
        sessionStore.saveScholarshipPassExpiryTimestamp(expiryMs, effectiveStudentId);
      } else if (expiryMs === 0 && cachedStats?.isSubscribed && cachedStats.trialDaysRemaining > 0) {
        expiryMs = now + cachedStats.trialDaysRemaining * 24 * 60 * 60 * 1000;
        sessionStore.saveScholarshipPassExpiryTimestamp(expiryMs, effectiveStudentId);
      }

      const isPassActive = expiryMs > now;
      const daysRemaining = isPassActive ? SubscriptionTimeUtils.calculateDaysRemaining(expiryMs, now) : 0;
      const isoExpiry = isPassActive ? SubscriptionTimeUtils.formatIsoTimestamp(expiryMs) : null;

      if (cachedStats) {
        this.userStats = {
          ...cachedStats,
          isSubscribed: isPassActive,
          trialDaysRemaining: daysRemaining,
          subscriptionExpiresAt: isoExpiry,
        };
      } else {
        this.userStats = {
          ...this.getDefaultUserStats(),
          studentId: effectiveStudentId,
          name: 'Scholar',
          grade: sessionStore.getSavedGrade() || 'Class 5',
          schoolName: sessionStore.getSavedSchoolName() || 'Kholeshwar Vidyalaya, Ambajogai',
          companionId: sessionStore.getSavedCompanionId() || 'unicorn',
          isSubscribed: isPassActive,
          trialDaysRemaining: daysRemaining,
          subscriptionExpiresAt: isoExpiry,
          xp: 0,
          weeklyXp: 0,
          level: 1,
          streakDays: 1,
          streakStatus: 'Getting Started',
          solvedQuestions: 0,
          totalAttemptedQuestions: 0,
          accuracy: 100,
          arenaRank: 7,
          arenaPoints: 0,
          arenaQs: 0,
          weeklyQuestions: 0,
          daysActiveThisWeek: 1,
        };
      }
      this.mistakes = [];
      this.bookmarkedQuestionIds = new Set();
      this.unlockedBadgeIds = savedBadges;
    } else {
      const demoStats = this.getDefaultUserStats();
      const expiryMs = sessionStore.getScholarshipPassExpiryTimestamp('STU-58291');
      const now = Date.now();
      const isPassActive = expiryMs > now;
      const daysRemaining = isPassActive ? SubscriptionTimeUtils.calculateDaysRemaining(expiryMs, now) : 0;

      this.userStats = isPassActive
        ? {
            ...demoStats,
            isSubscribed: true,
            trialDaysRemaining: daysRemaining,
            subscriptionExpiresAt: SubscriptionTimeUtils.formatIsoTimestamp(expiryMs),
          }
        : demoStats;

      const defaultMistakes = this.getDefaultMistakes();
      this.mistakes = defaultMistakes;
      this.bookmarkedQuestionIds = new Set(defaultMistakes.filter((m) => m.isBookmarked).map((m) => m.id));
      this.unlockedBadgeIds = savedBadges.size > 0 ? savedBadges : new Set(['first_spark', 'centurion', 'slip_slayer']);
    }

    this.chapterQuests = this.loadQuestsForStudent(effectiveStudentId);
    this.featuredBadgeId = sessionStore.getFeaturedBadgeId(effectiveStudentId);
    this.refreshDailyGoalProgress(effectiveStudentId);
  }

  public getQuests(): ChapterQuest[] {
    return this.chapterQuests;
  }

  public getUserStats(): UserStats {
    return this.userStats;
  }

  public getMistakes(): QuizQuestion[] {
    return this.mistakes;
  }

  public getBookmarkedQuestionIds(): Set<string> {
    return this.bookmarkedQuestionIds;
  }

  public getFeaturedBadgeId(): string | null {
    return this.featuredBadgeId;
  }

  public setFeaturedBadge(badgeId: string | null): void {
    this.featuredBadgeId = badgeId;
    const studentId = this.userStats.studentId;
    if (studentId !== 'STU-58291') {
      sessionStore.saveFeaturedBadgeId(badgeId, studentId);
    }
    this.notify();
  }

  public getEffectiveFeaturedBadge(): Badge | null {
    const badges = this.getBadges();
    const unlocked = badges.filter((b) => b.status === 'Unlocked');
    if (unlocked.length === 0) return null;
    const currentId = this.featuredBadgeId;
    const chosen = unlocked.find((b) => b.id === currentId);
    if (chosen) return chosen;

    const tierPriority: Record<BadgeTier, number> = {
      MYTHIC: 5,
      DIAMOND: 4,
      GOLD: 3,
      SILVER: 2,
      BRONZE: 1,
    };
    return [...unlocked].sort((a, b) => tierPriority[b.tier] - tierPriority[a.tier])[0];
  }

  public loadQuestsForStudent(studentId: string): ChapterQuest[] {
    const saved = sessionStore.getQuestProgress(studentId);
    const completedStages = sessionStore.getCompletedStages(studentId);

    if (saved && saved.length > 0) {
      return saved.map((quest) => ({
        ...quest,
        stages: quest.stages.map((stage) => {
          const key = `${quest.id}:${stage.stageNumber}`;
          return completedStages.has(key) ? { ...stage, isCompleted: true } : stage;
        }),
      }));
    } else if (studentId === 'STU-58291') {
      return JSON.parse(JSON.stringify(DEFAULT_CHAPTER_QUESTS));
    } else {
      return this.getCleanQuests();
    }
  }

  public getCleanQuests(): ChapterQuest[] {
    return DEFAULT_CHAPTER_QUESTS.map((quest) => {
      const isFirstChapter = quest.chapterNumber === 1;
      return {
        ...quest,
        stars: 0,
        currentStage: 1,
        progressPercent: 0,
        dojoQuestionsSolved: 0,
        isLocked: !isFirstChapter,
        stages: quest.stages.map((stage, idx) => ({
          ...stage,
          isCompleted: false,
          isCurrent: isFirstChapter && idx === 0,
          isLocked: !isFirstChapter || idx > 0,
        })),
      };
    });
  }

  public isStageCompleted(chapterId: string, stageNumber: number): boolean {
    const studentId = this.userStats.studentId;
    const key = `${chapterId}:${stageNumber}`;
    if (sessionStore.getCompletedStages(studentId).has(key)) return true;
    const quest = this.chapterQuests.find((q) => q.id === chapterId);
    const stage = quest?.stages.find((s) => s.stageNumber === stageNumber);
    return stage?.isCompleted === true;
  }

  public getStageClaimedMasteryBonus(chapterId: string, stageNumber: number): number {
    const quest = this.chapterQuests.find((q) => q.id === chapterId);
    const stage = quest?.stages.find((s) => s.stageNumber === stageNumber);
    const isBossStage = stageNumber === 3;
    if (stage && (stage.claimedMasteryBonus || 0) > 0) return stage.claimedMasteryBonus!;
    if (stage && (stage.stars || 0) >= 3) return isBossStage ? 50 : 20;
    if (stage && (stage.stars || 0) === 2) return isBossStage ? 25 : 10;
    return 0;
  }

  public async getQuestionsForGrade(grade: string, subject?: string | null): Promise<QuizQuestion[]> {
    const client = getSupabaseClient();
    if (client) {
      try {
        let query = client.from('questions').select('*');
        if (grade && grade !== 'All') query = query.eq('grade', grade);
        if (subject && subject !== 'All') query = query.ilike('subject', `%${subject}%`);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            code: d.code,
            subject: d.subject,
            topic: d.topic,
            grade: d.grade,
            exam: d.exam,
            language: d.language,
            difficulty: d.difficulty,
            question: d.question,
            hint: d.hint,
            options: Array.isArray(d.options) ? d.options : JSON.parse(d.options || '[]'),
            correctAnswer: d.correct_answer,
            correctAnswerText: d.correct_answer_text,
            explanation: d.explanation,
            chapterId: d.chapter_id,
            stageType: d.stage_type,
          }));
        }
      } catch (err) {
        console.warn('[Repository] Supabase questions query skipped:', err);
      }
    }

    return SEED_QUESTIONS.filter((q) => {
      if (grade && grade !== 'All' && q.grade !== grade) return false;
      if (subject && subject !== 'All' && !q.subject.toLowerCase().includes(subject.toLowerCase())) return false;
      return true;
    });
  }

  public async getQuestionsForQuest(chapterId: string, stageTypeKey: string, questionCount: number): Promise<QuizQuestion[]> {
    const pool = await this.getQuestionsForGrade(this.userStats.grade);
    const filtered = pool.filter((q) => {
      const matchChapter = !q.chapterId || q.chapterId === chapterId;
      const matchStage = !q.stageType || q.stageType.toLowerCase() === stageTypeKey.toLowerCase();
      return matchChapter && matchStage;
    });

    const candidatePool = filtered.length >= 3 ? filtered : pool.length > 0 ? pool : SEED_QUESTIONS;
    return QuestionSequencer.buildStageSequence(candidatePool, questionCount, this.userStats.grade, stageTypeKey);
  }

  public async getQuickSprintQuestions(subject: string | null, count: number): Promise<QuizQuestion[]> {
    const pool = await this.getQuestionsForGrade(this.userStats.grade, subject);
    const candidatePool = pool.length > 0 ? pool : SEED_QUESTIONS;
    return QuestionSequencer.buildAdaptiveSequence(candidatePool, count, this.userStats.grade);
  }

  public async getMockQuestions(count = 25): Promise<QuizQuestion[]> {
    const pool = await this.getQuestionsForGrade(this.userStats.grade);
    const candidatePool = pool.length > 0 ? pool : SEED_QUESTIONS;
    return QuestionSequencer.buildAdaptiveSequence(candidatePool, count, this.userStats.grade);
  }

  public async getPolishDrillQuestions(chapterId: string): Promise<QuizQuestion[]> {
    const pool = await this.getQuestionsForGrade(this.userStats.grade);
    const filtered = pool.filter((q) => q.chapterId === chapterId);
    const candidate = filtered.length >= 2 ? filtered : pool.length > 0 ? pool : SEED_QUESTIONS;
    const count = this.getPolishDrillQuestionCount(this.userStats.grade);
    return QuestionSequencer.buildAdaptiveSequence(candidate, count, this.userStats.grade);
  }

  public getPolishDrillQuestionCount(grade: string): number {
    const clean = grade.replace(/\D/g, '');
    return clean === '4' || clean === '5' ? 5 : 8;
  }

  public async getChapterDojoQuestions(chapterId: string, count = 5): Promise<QuizQuestion[]> {
    const pool = await this.getQuestionsForGrade(this.userStats.grade);
    const filtered = pool.filter((q) => q.chapterId === chapterId);
    const candidate = filtered.length >= 2 ? filtered : pool.length > 0 ? pool : SEED_QUESTIONS;
    return QuestionSequencer.buildAdaptiveSequence(candidate, count, this.userStats.grade);
  }

  public async getArenaQualifyingQuestions(grade: string, count = 5): Promise<QuizQuestion[]> {
    const pool = await this.getQuestionsForGrade(grade);
    const candidate = pool.length > 0 ? pool : SEED_QUESTIONS;
    return QuestionSequencer.buildAdaptiveSequence(candidate, count, grade);
  }

  public addXpAndPoints(amount: number, track: 'school' | 'exam'): void {
    const cur = this.userStats;
    const newXp = cur.xp + amount;
    const newWeeklyXp = cur.weeklyXp + amount;
    const newLevel = calculateLevel(newXp);

    if (track === 'school') {
      this.userStats = {
        ...cur,
        xp: newXp,
        weeklyXp: newWeeklyXp,
        schoolWeeklyXp: cur.schoolWeeklyXp + amount,
        level: newLevel,
      };
    } else {
      this.userStats = {
        ...cur,
        xp: newXp,
        weeklyXp: newWeeklyXp,
        examWeeklyXp: cur.examWeeklyXp + amount,
        level: newLevel,
      };
    }
    this.saveStats();
    this.syncBadgesWithProgress();
    this.notify();
  }

  public recordWrongAnswer(): void {
    const cur = this.userStats;
    const attempted = cur.totalAttemptedQuestions + 1;
    const accuracy = Math.round((cur.solvedQuestions * 100) / attempted);
    this.userStats = {
      ...cur,
      totalAttemptedQuestions: attempted,
      accuracy,
    };
    this.saveStats();
    this.notify();
  }

  public recordMistake(question: QuizQuestion, wrongChoice: string, seconds: number): void {
    const existing = this.mistakes.find((m) => m.id === question.id);
    const updatedQuestion: QuizQuestion = {
      ...question,
      userWrongChoice: wrongChoice,
      attemptTimeSeconds: seconds,
      attemptDate: 'Just now',
      isBookmarked: existing ? existing.isBookmarked : true,
      isConquered: false,
    };

    this.mistakes = [updatedQuestion, ...this.mistakes.filter((m) => m.id !== question.id)];
    if (updatedQuestion.isBookmarked) {
      this.bookmarkedQuestionIds.add(question.id);
    }
    this.notify();
  }

  public conquerMistake(id: string): void {
    this.mistakes = this.mistakes.filter((m) => m.id !== id);
    this.bookmarkedQuestionIds.delete(id);
    this.conqueredMistakesCount += 1;
    this.addXpAndPoints(15, 'exam');
    this.syncBadgesWithProgress();
    this.notify();
  }

  public toggleBookmark(question: QuizQuestion): boolean {
    const isCurrently = this.bookmarkedQuestionIds.has(question.id);
    if (isCurrently) {
      this.bookmarkedQuestionIds.delete(question.id);
    } else {
      this.bookmarkedQuestionIds.add(question.id);
    }

    this.mistakes = this.mistakes.map((m) => (m.id === question.id ? { ...m, isBookmarked: !isCurrently } : m));
    this.notify();
    return !isCurrently;
  }

  public isQuestionBookmarked(questionId: string): boolean {
    return this.bookmarkedQuestionIds.has(questionId);
  }

  public completeQuestStage(
    chapterId: string,
    stageNumber: number,
    accuracy: number,
    xpEarned: number,
    questionCount = 5,
    isReplay = false
  ): void {
    const studentId = this.userStats.studentId;
    sessionStore.markStageCompleted(studentId, chapterId, stageNumber);

    const calculatedStars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 40 ? 1 : 0;

    this.chapterQuests = this.chapterQuests.map((quest) => {
      if (quest.id !== chapterId) return quest;

      const updatedStages = quest.stages.map((stage) => {
        if (stage.stageNumber === stageNumber) {
          return {
            ...stage,
            isCompleted: true,
            isCurrent: false,
            stars: Math.max(stage.stars || 0, calculatedStars),
          };
        }
        if (stage.stageNumber === stageNumber + 1) {
          return {
            ...stage,
            isLocked: false,
            isCurrent: true,
          };
        }
        return stage;
      });

      const completedCount = updatedStages.filter((s) => s.isCompleted).length;
      const progressPercent = Math.min(100, Math.round((completedCount / updatedStages.length) * 100));
      const questStars = Math.max(
        quest.stars,
        Math.round(updatedStages.reduce((acc, s) => acc + (s.stars || 0), 0) / updatedStages.length)
      );

      return {
        ...quest,
        stages: updatedStages,
        progressPercent,
        stars: questStars,
      };
    });

    sessionStore.saveQuestProgress(studentId, this.chapterQuests);

    const cur = this.userStats;
    const newSolved = isReplay ? cur.solvedQuestions : cur.solvedQuestions + questionCount;
    const newAttempted = isReplay ? cur.totalAttemptedQuestions : cur.totalAttemptedQuestions + questionCount;
    const newAcc = newAttempted > 0 ? Math.round((newSolved * 100) / newAttempted) : 100;

    this.userStats = {
      ...cur,
      solvedQuestions: newSolved,
      totalAttemptedQuestions: newAttempted,
      accuracy: newAcc,
      weeklyQuestions: cur.weeklyQuestions + questionCount,
    };
    this.saveStats();
    this.syncBadgesWithProgress();
    this.notify();
  }

  public recordDojoSessionCompleted(chapterId: string, correctCount: number): void {
    this.chapterQuests = this.chapterQuests.map((quest) => {
      if (quest.id !== chapterId) return quest;
      return {
        ...quest,
        dojoQuestionsSolved: (quest.dojoQuestionsSolved || 0) + correctCount,
      };
    });
    sessionStore.saveQuestProgress(this.userStats.studentId, this.chapterQuests);
    this.notify();
  }

  public upgradeChapterStarRating(chapterId: string): void {
    this.chapterQuests = this.chapterQuests.map((quest) => {
      if (quest.id !== chapterId) return quest;
      return {
        ...quest,
        stars: Math.min(3, quest.stars + 1),
      };
    });
    sessionStore.saveQuestProgress(this.userStats.studentId, this.chapterQuests);
    this.notify();
  }

  public recordArenaRoundResult(arenaPointsEarned: number, questionCount: number, accuracy: number): void {
    const cur = this.userStats;
    const newPoints = cur.arenaPoints + arenaPointsEarned;
    const newQs = Math.min(100, cur.arenaQs + questionCount);
    const newRank = Math.max(1, cur.arenaRank - Math.floor(arenaPointsEarned / 50));

    this.userStats = {
      ...cur,
      arenaPoints: newPoints,
      arenaQs: newQs,
      arenaRank: newRank,
      weeklyXp: cur.weeklyXp + arenaPointsEarned,
      xp: cur.xp + arenaPointsEarned,
      level: calculateLevel(cur.xp + arenaPointsEarned),
    };
    this.saveStats();
    this.notify();
  }

  public switchClassGrade(grade: ClassGradeInfo): void {
    this.userStats = {
      ...this.userStats,
      grade: grade.label,
      exam: grade.examName,
    };
    this.chapterQuests = this.loadQuestsForStudent(this.userStats.studentId);
    this.saveStats();
    this.notify();
  }

  public updateSchool(schoolName: string): void {
    this.userStats = {
      ...this.userStats,
      schoolName,
    };
    this.saveStats();
    this.notify();
  }

  public updateCompanion(companionId: string): void {
    this.userStats = {
      ...this.userStats,
      companionId,
    };
    this.saveStats();
    this.notify();
  }

  public activateScholarshipPass(months: number): void {
    const now = Date.now();
    const existingExpiry = sessionStore.getScholarshipPassExpiryTimestamp(this.userStats.studentId);
    const baseTime = existingExpiry > now ? existingExpiry : now;
    const newExpiry = baseTime + months * 30 * 24 * 60 * 60 * 1000;

    sessionStore.saveScholarshipPassMonths(months, this.userStats.studentId);
    sessionStore.saveScholarshipPassExpiryTimestamp(newExpiry, this.userStats.studentId);

    const daysRemaining = SubscriptionTimeUtils.calculateDaysRemaining(newExpiry, now);
    this.userStats = {
      ...this.userStats,
      isSubscribed: true,
      trialDaysRemaining: daysRemaining,
      subscriptionExpiresAt: SubscriptionTimeUtils.formatIsoTimestamp(newExpiry),
    };
    this.saveStats();
    this.notify();
  }

  public checkAndExpireSubscriptionIfNeeded(): void {
    const expiryMs = sessionStore.getScholarshipPassExpiryTimestamp(this.userStats.studentId);
    const now = Date.now();
    if (this.userStats.isSubscribed && expiryMs > 0 && expiryMs <= now) {
      sessionStore.saveScholarshipPassMonths(0, this.userStats.studentId);
      sessionStore.saveScholarshipPassExpiryTimestamp(0, this.userStats.studentId);
      this.userStats = {
        ...this.userStats,
        isSubscribed: false,
        trialDaysRemaining: 0,
        subscriptionExpiresAt: null,
      };
      this.saveStats();
      this.notify();
    }
  }

  public setStreakDays(days: number): void {
    this.userStats = {
      ...this.userStats,
      streakDays: days,
      streakStatus: calculateStreakStatus(days),
    };
    this.saveStats();
    this.notify();
  }

  public recordDailyHabitMilestone(explicitDay?: number | null, newStreakDays?: number): number {
    const streak = newStreakDays !== undefined ? newStreakDays : this.userStats.streakDays;
    const daysActive = explicitDay !== null && explicitDay !== undefined ? explicitDay : Math.min(7, this.userStats.daysActiveThisWeek + 1);

    const bonus = 20;
    this.userStats = {
      ...this.userStats,
      streakDays: streak,
      streakStatus: calculateStreakStatus(streak),
      daysActiveThisWeek: daysActive,
      xp: this.userStats.xp + bonus,
      weeklyXp: this.userStats.weeklyXp + bonus,
    };
    this.saveStats();
    this.notify();
    return bonus;
  }

  public resetWeeklyLeaderboard(): void {
    this.userStats = {
      ...this.userStats,
      weeklyXp: 0,
      weeklyQuestions: 0,
      daysActiveThisWeek: 1,
      schoolWeeklyXp: 0,
      examWeeklyXp: 0,
      arenaPoints: 0,
      arenaQs: 0,
    };
    this.saveStats();
    this.notify();
  }

  public refreshDailyGoalProgress(studentId: string): void {
    const today = new Date().toISOString().split('T')[0];
    this.dailyQuestionsSolved = sessionStore.getDailyQuestionsSolved(studentId, today);
    this.isDailyGoalClaimed = sessionStore.isDailyGoalClaimed(studentId, today);
    this.notify();
  }

  public getDailyQuestionsSolved(): number {
    return this.dailyQuestionsSolved;
  }

  public getIsDailyGoalClaimed(): boolean {
    return this.isDailyGoalClaimed;
  }

  public getWeakestUnlockedChapter(): ChapterQuest | null {
    const unlocked = this.chapterQuests.filter((q) => !q.isLocked);
    if (unlocked.length === 0) return null;
    return [...unlocked].sort((a, b) => a.stars - b.stars)[0];
  }

  public getPodiumScholars(schoolName = this.userStats.schoolName, grade = this.userStats.grade): Scholar[] {
    return this.getAllDivisionScholars(schoolName, grade).slice(0, 3);
  }

  public getWeeklyLeaderboard(schoolName = this.userStats.schoolName, grade = this.userStats.grade): Scholar[] {
    return this.getAllDivisionScholars(schoolName, grade).slice(3);
  }

  public getSchoolPodium(schoolName = this.userStats.schoolName, grade = this.userStats.grade): Scholar[] {
    return this.getAllDivisionScholars(schoolName, grade, 'school').slice(0, 3);
  }

  public getSchoolLeaderboard(schoolName = this.userStats.schoolName, grade = this.userStats.grade): Scholar[] {
    return this.getAllDivisionScholars(schoolName, grade, 'school').slice(3);
  }

  public getExamPodium(schoolName = this.userStats.schoolName, grade = this.userStats.grade): Scholar[] {
    return this.getAllDivisionScholars(schoolName, grade, 'exam').slice(0, 3);
  }

  public getExamLeaderboard(schoolName = this.userStats.schoolName, grade = this.userStats.grade): Scholar[] {
    return this.getAllDivisionScholars(schoolName, grade, 'exam').slice(3);
  }

  public getMostImproved(): ImprovedScholar[] {
    return MOST_IMPROVED_SCHOLARS;
  }

  public getAllDivisionScholars(
    schoolName = this.userStats.schoolName,
    grade = this.userStats.grade,
    track: 'school' | 'exam' | 'combined' = 'combined'
  ): Scholar[] {
    const stats = this.userStats;
    let userPoints = stats.weeklyXp;
    let userRank = stats.arenaRank;

    if (track === 'school') {
      userPoints = stats.schoolWeeklyXp;
      userRank = stats.schoolArenaRank;
    } else if (track === 'exam') {
      userPoints = stats.examWeeklyXp;
      userRank = stats.examArenaRank;
    }

    const userScholar: Scholar = {
      rank: userRank,
      name: `${stats.name} (You)`,
      city: stats.town || 'Ambajogai',
      school: stats.schoolName || 'Kholeshwar Vidyalaya, Ambajogai',
      grade: stats.grade || 'Class 5',
      division: stats.division || '5-A',
      points: userPoints,
      accuracy: stats.accuracy,
      isUser: true,
      avatarUrl: '/assets/profile_avatar.svg',
      studentId: stats.studentId,
    };

    const remotePeers = this.remoteScholars?.filter(
      (s) => s.studentId !== stats.studentId && s.name !== stats.name && !s.isUser
    );
    const defaultPeers = track === 'school' ? SIMULATED_SCHOOL_PEERS : SIMULATED_PEERS;
    const peers = remotePeers && remotePeers.length > 0 ? remotePeers : defaultPeers;

    const combined = [...peers, userScholar].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.accuracy - a.accuracy;
    });

    return combined.map((s, idx) => ({ ...s, rank: idx + 1 }));
  }

  public async fetchRemoteLeaderboard(): Promise<Scholar[] | null> {
    const client = getSupabaseClient();
    if (!client) return null;
    try {
      const { data, error } = await client.from('scholars').select('*').order('points', { ascending: false }).limit(20);
      if (!error && data && data.length > 0) {
        this.remoteScholars = data.map((d: any, idx: number) => ({
          rank: idx + 1,
          name: d.name,
          city: d.city || 'Ambajogai',
          school: d.school,
          grade: 'Class 5',
          division: '5-A',
          points: d.points,
          accuracy: d.accuracy,
          isUser: false,
          avatarUrl: d.avatar_url,
          studentId: d.student_id,
        }));
        this.notify();
        return this.remoteScholars;
      }
    } catch (e) {
      console.warn('[Repository] fetchRemoteLeaderboard skipped:', e);
    }
    return null;
  }

  public getBadges(): Badge[] {
    const stats = this.userStats;
    const unlocked = this.unlockedBadgeIds;
    const conquered = this.conqueredMistakesCount;

    return [
      {
        id: 'first_spark',
        name: 'First Spark',
        icon: '⚡',
        status: unlocked.has('first_spark') ? 'Unlocked' : 'Locked',
        highlight: unlocked.has('first_spark') ? 'Day 1 Kickoff' : '+25 XP',
        description: 'Solve your very first scholarship question to ignite your journey.',
        tier: 'BRONZE',
        xpBonus: 25,
        currentProgress: Math.min(1, stats.solvedQuestions),
        maxProgress: 1,
        category: 'Volume',
      },
      {
        id: 'centurion',
        name: 'Centurion',
        icon: '📚',
        status: unlocked.has('centurion') ? 'Unlocked' : 'Locked',
        highlight: unlocked.has('centurion') ? '100 Club' : '+100 XP',
        description: 'Cross the century mark by solving 100 scholarship questions.',
        tier: 'SILVER',
        xpBonus: 100,
        currentProgress: Math.min(100, stats.solvedQuestions),
        maxProgress: 100,
        category: 'Volume',
      },
      {
        id: 'half_k_titan',
        name: 'Half-K Titan',
        icon: '🛡️',
        status: unlocked.has('half_k_titan') ? 'Unlocked' : 'Locked',
        highlight: unlocked.has('half_k_titan') ? '500 Titan' : '+200 XP',
        description: 'Power through 500 scholarship questions with unwavering resolve.',
        tier: 'GOLD',
        xpBonus: 200,
        currentProgress: Math.min(500, stats.solvedQuestions),
        maxProgress: 500,
        category: 'Volume',
      },
      {
        id: 'millennium_master',
        name: 'Millennium Master',
        icon: '🏛️',
        status: unlocked.has('millennium_master') ? 'Unlocked' : 'Locked',
        highlight: unlocked.has('millennium_master') ? '1,000 Legend' : '+500 XP',
        description: 'Solve 1,000 scholarship exam questions to achieve legendary scholar status.',
        tier: 'MYTHIC',
        xpBonus: 500,
        currentProgress: Math.min(1000, stats.solvedQuestions),
        maxProgress: 1000,
        category: 'Volume',
      },
      {
        id: 'week_warrior',
        name: '7-Day Warrior',
        icon: '🔥',
        status: unlocked.has('week_warrior') ? 'Unlocked' : 'Locked',
        highlight: unlocked.has('week_warrior') ? '7 Days Hot' : '+75 XP',
        description: 'Maintain a solid 7-day daily study streak.',
        tier: 'SILVER',
        xpBonus: 75,
        currentProgress: Math.min(7, stats.streakDays),
        maxProgress: 7,
        category: 'Streak',
      },
      {
        id: 'fortnight_fortress',
        name: 'Fortnight Fortress',
        icon: '🏰',
        status: unlocked.has('fortnight_fortress') ? 'Unlocked' : 'Locked',
        highlight: unlocked.has('fortnight_fortress') ? '14 Days Unbroken' : '+150 XP',
        description: 'Hold the fortress with 14 consecutive days of scholarship practice.',
        tier: 'GOLD',
        xpBonus: 150,
        currentProgress: Math.min(14, stats.streakDays),
        maxProgress: 14,
        category: 'Streak',
      },
      {
        id: 'month_legend',
        name: '30-Day Legend',
        icon: '👑',
        status: unlocked.has('month_legend') ? 'Unlocked' : 'Locked',
        highlight: unlocked.has('month_legend') ? 'Scholar Elite' : '+300 XP',
        description: 'Achieve the ultimate 30-day streak milestone of scholarship dedication.',
        tier: 'DIAMOND',
        xpBonus: 300,
        currentProgress: Math.min(30, stats.streakDays),
        maxProgress: 30,
        category: 'Streak',
      },
      {
        id: 'slip_slayer',
        name: 'Slip Slayer',
        icon: '🗡️',
        status: unlocked.has('slip_slayer') ? 'Unlocked' : 'Locked',
        highlight: unlocked.has('slip_slayer') ? 'First Conquered' : '+30 XP',
        description: 'Conquer your first question from the Mistake Vault to turn weakness into strength.',
        tier: 'BRONZE',
        xpBonus: 30,
        currentProgress: Math.min(1, conquered),
        maxProgress: 1,
        category: 'Mistakes',
      },
      {
        id: 'phoenix_rebirth',
        name: 'Phoenix Rebirth',
        icon: '🦅',
        status: unlocked.has('phoenix_rebirth') ? 'Unlocked' : 'Locked',
        highlight: unlocked.has('phoenix_rebirth') ? '10 Conquered' : '+150 XP',
        description: 'Conquer 10 previous mistakes in the Mistake Vault to rise stronger.',
        tier: 'GOLD',
        xpBonus: 150,
        currentProgress: Math.min(10, conquered),
        maxProgress: 10,
        category: 'Mistakes',
      },
      {
        id: 'iron_mind',
        name: 'Iron Mind',
        icon: '🧠',
        status: unlocked.has('iron_mind') ? 'Unlocked' : 'Locked',
        highlight: unlocked.has('iron_mind') ? '25 Conquered' : '+250 XP',
        description: 'Conquer 25 mistakes in the Mistake Vault. Eliminating every misconception.',
        tier: 'DIAMOND',
        xpBonus: 250,
        currentProgress: Math.min(25, conquered),
        maxProgress: 25,
        category: 'Mistakes',
      },
      {
        id: 'boss_slayer',
        name: 'Boss Slayer',
        icon: '👹',
        status: unlocked.has('boss_slayer') ? 'Unlocked' : 'Locked',
        highlight: unlocked.has('boss_slayer') ? 'Boss Defeated' : '+100 XP',
        description: 'Defeat a Stage 3 Chapter Boss PYQ with 55%+ accuracy (2★ or 3★).',
        tier: 'GOLD',
        xpBonus: 100,
        currentProgress: unlocked.has('boss_slayer') ? 1 : 0,
        maxProgress: 1,
        category: 'Combat',
      },
      {
        id: 'perfect_10',
        name: 'Perfect 10',
        icon: '💯',
        status: unlocked.has('perfect_10') ? 'Unlocked' : 'Locked',
        highlight: unlocked.has('perfect_10') ? '100% Flawless' : '+50 XP',
        description: 'Achieve flawless 100% accuracy in a session with at least 5 questions.',
        tier: 'SILVER',
        xpBonus: 50,
        currentProgress: unlocked.has('perfect_10') ? 1 : 0,
        maxProgress: 1,
        category: 'Mastery',
      },
      {
        id: 'lightning',
        name: 'Lightning Reflexes',
        icon: '⚡',
        status: unlocked.has('lightning') ? 'Unlocked' : 'Locked',
        highlight: unlocked.has('lightning') ? 'Sub-4s Speed' : '+25 XP',
        description: 'Answer a scholarship question correctly in under 4 seconds.',
        tier: 'BRONZE',
        xpBonus: 25,
        currentProgress: unlocked.has('lightning') ? 1 : 0,
        maxProgress: 1,
        category: 'Speed',
      },
      {
        id: 'combo_master',
        name: 'Combo Master',
        icon: '🌟',
        status: unlocked.has('combo_master') ? 'Unlocked' : 'Locked',
        highlight: unlocked.has('combo_master') ? '5-in-a-Row' : '+50 XP',
        description: 'Achieve a 5-question consecutive correct answer combo streak.',
        tier: 'SILVER',
        xpBonus: 50,
        currentProgress: unlocked.has('combo_master') ? 1 : 0,
        maxProgress: 1,
        category: 'Mastery',
      },
      {
        id: 'arena_podium',
        name: 'Arena Podium',
        icon: '🏆',
        status: unlocked.has('arena_podium') ? 'Unlocked' : 'Locked',
        highlight: unlocked.has('arena_podium') ? 'Top 3 Podium' : '+250 XP',
        description: 'Climb to the top 3 podium on the Weekly Arena Leaderboard.',
        tier: 'MYTHIC',
        xpBonus: 250,
        currentProgress: unlocked.has('arena_podium') ? 1 : stats.arenaRank <= 3 ? 1 : 0,
        maxProgress: 1,
        category: 'Arena',
      },
    ];
  }

  public syncBadgesWithProgress(): void {
    const stats = this.userStats;
    if (stats.studentId === 'STU-58291') return;

    const badges = new Set(this.unlockedBadgeIds);
    if (stats.solvedQuestions >= 1) badges.add('first_spark');
    if (stats.solvedQuestions >= 100) badges.add('centurion');
    if (stats.solvedQuestions >= 500) badges.add('half_k_titan');
    if (stats.solvedQuestions >= 1000) badges.add('millennium_master');
    if (stats.streakDays >= 7) badges.add('week_warrior');
    if (stats.streakDays >= 14) badges.add('fortnight_fortress');
    if (stats.streakDays >= 30) badges.add('month_legend');
    if (this.conqueredMistakesCount >= 1) badges.add('slip_slayer');
    if (this.conqueredMistakesCount >= 10) badges.add('phoenix_rebirth');
    if (this.conqueredMistakesCount >= 25) badges.add('iron_mind');
    if (stats.arenaRank >= 1 && stats.arenaRank <= 3) badges.add('arena_podium');

    this.unlockedBadgeIds = badges;
    sessionStore.saveUnlockedBadges(badges, stats.studentId);
  }

  public checkAndAwardMilestoneBadges(opts: { fastAnswer?: boolean; comboStreakReached?: boolean } = {}): void {
    if (opts.fastAnswer) {
      this.unlockedBadgeIds.add('lightning');
      sessionStore.saveUnlockedBadges(this.unlockedBadgeIds, this.userStats.studentId);
      this.notify();
    }
    if (opts.comboStreakReached) {
      this.unlockedBadgeIds.add('combo_master');
      sessionStore.saveUnlockedBadges(this.unlockedBadgeIds, this.userStats.studentId);
      this.notify();
    }
  }

  public async verifyRemoteCredentials(studentId: string, passwordHash: string, isRegister = false): Promise<RemoteAuthResult> {
    const cleanId = studentId.trim();
    if (cleanId.toLowerCase() === 'stu-58291' || cleanId.toLowerCase() === 'demo_student') {
      return { success: true, status: 'VERIFIED', message: 'Demo student verified' };
    }

    const client = getSupabaseClient();
    if (!client) {
      return {
        success: false,
        error_code: 'OFFLINE',
        message: 'Internet connection required for initial sign-in on a new device. Please connect to verify your account.',
      };
    }

    try {
      const { data, error } = await client.rpc('verify_student_credentials', {
        p_student_id: cleanId,
        p_password_hash: passwordHash,
        p_is_register: isRegister,
      });

      if (error) {
        return {
          success: false,
          error_code: error.code || 'RPC_ERROR',
          message: error.message || 'Verification error.',
        };
      }

      return data as RemoteAuthResult;
    } catch (e: any) {
      return {
        success: false,
        error_code: 'NETWORK_ERROR',
        message: e?.message || 'Unable to connect to verification server.',
      };
    }
  }

  public async loadProfileFromSupabase(studentId: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;

    try {
      const { data, error } = await client.from('profiles').select('*').eq('student_id', studentId).single();
      if (!error && data) {
        this.applyRemoteProfile(data as ProfileDto);
        return true;
      }
    } catch (e) {
      console.warn('[Repository] loadProfileFromSupabase skipped:', e);
    }
    return false;
  }

  public applyRemoteProfile(remote: ProfileDto): void {
    const current = this.userStats;
    const now = Date.now();
    const remoteExpiryMs = SubscriptionTimeUtils.parseIsoTimestamp(remote.subscription_expires_at);
    const isPassActive = (remoteExpiryMs || 0) > now;
    const daysRemaining = isPassActive ? SubscriptionTimeUtils.calculateDaysRemaining(remoteExpiryMs!, now) : 0;

    this.userStats = {
      ...current,
      name: remote.name || current.name,
      grade: remote.grade || current.grade,
      schoolName: remote.school_name || current.schoolName,
      town: remote.town || current.town,
      division: remote.division || current.division,
      companionId: remote.companion_id || current.companionId,
      xp: Math.max(remote.xp, current.xp),
      weeklyXp: Math.max(remote.weekly_xp, current.weeklyXp),
      level: Math.max(remote.level, current.level, calculateLevel(Math.max(remote.xp, current.xp))),
      streakDays: Math.max(remote.streak_days, current.streakDays),
      streakStatus: calculateStreakStatus(Math.max(remote.streak_days, current.streakDays)),
      arenaRank: remote.arena_rank > 0 ? remote.arena_rank : current.arenaRank,
      arenaPoints: Math.max(remote.arena_points, current.arenaPoints),
      arenaQs: Math.max(remote.arena_qs, current.arenaQs),
      solvedQuestions: Math.max(remote.solved_questions, current.solvedQuestions),
      accuracy: current.accuracy > 0 ? current.accuracy : remote.accuracy,
      weeklyQuestions: Math.max(remote.weekly_questions, current.weeklyQuestions),
      daysActiveThisWeek: Math.max(remote.days_active_this_week, current.daysActiveThisWeek),
      isSubscribed: isPassActive,
      trialDaysRemaining: daysRemaining,
      subscriptionExpiresAt: remote.subscription_expires_at || null,
    };

    this.saveStats();
    this.syncBadgesWithProgress();
    this.notify();
  }

  public async syncProfileWithSupabase(studentId: string, grade: string, companionId: string, isWeeklyReset = false): Promise<boolean> {
    if (!studentId || studentId === 'STU-58291') return true;

    const client = getSupabaseClient();
    if (!client) return false;

    const stats = this.userStats;
    const passwordHash = sessionStore.getPasswordHash(studentId);

    try {
      const { data, error } = await client.rpc('sync_student_profile', {
        p_student_id: studentId,
        p_name: stats.name,
        p_grade: grade,
        p_school_name: stats.schoolName,
        p_town: stats.town,
        p_division: stats.division,
        p_companion_id: companionId,
        p_xp: stats.xp,
        p_weekly_xp: stats.weeklyXp,
        p_level: stats.level,
        p_streak_days: stats.streakDays,
        p_arena_rank: stats.arenaRank,
        p_arena_points: stats.arenaPoints,
        p_arena_qs: stats.arenaQs,
        p_solved_questions: stats.solvedQuestions,
        p_accuracy: stats.accuracy,
        p_weekly_questions: stats.weeklyQuestions,
        p_days_active_this_week: stats.daysActiveThisWeek,
        p_password_hash: passwordHash,
        p_is_weekly_reset: isWeeklyReset,
      });

      if (!error && data?.success) {
        return true;
      }
    } catch (e) {
      console.warn('[Repository] syncProfileWithSupabase skipped:', e);
    }
    return false;
  }

  public async redeemVoucherOnline(code: string, studentId: string, studentPhone: string): Promise<VoucherRpcResponse | null> {
    const cleanCode = code.trim().toUpperCase();
    const client = getSupabaseClient();
    if (!client) return null;

    try {
      const { data, error } = await client.rpc('redeem_voucher_code', {
        p_code: cleanCode,
        p_student_id: studentId,
        p_student_phone: studentPhone,
      });

      if (!error && data) {
        const resp = data as VoucherRpcResponse;
        if (resp.success) {
          this.activateScholarshipPass(resp.months || 1);
        }
        return resp;
      }
    } catch (e) {
      console.warn('[Repository] redeemVoucherOnline skipped:', e);
    }
    return null;
  }

  public async deleteStudentAccount(providedPassword?: string | null): Promise<boolean> {
    const studentId = this.userStats.studentId;
    let passwordHash = sessionStore.getPasswordHash(studentId);
    if (providedPassword) {
      passwordHash = await AuthValidator.hashPassword(providedPassword, studentId);
    }

    sessionStore.deleteStudentAccountData(studentId);
    this.userStats = this.getDefaultUserStats();
    this.mistakes = [];
    this.bookmarkedQuestionIds = new Set();
    this.unlockedBadgeIds = new Set(['first_spark', 'centurion', 'slip_slayer']);
    this.featuredBadgeId = null;
    this.conqueredMistakesCount = 0;
    this.chapterQuests = this.getCleanQuests();

    const client = getSupabaseClient();
    if (client && studentId && studentId !== 'STU-58291' && studentId !== 'demo_student') {
      try {
        await client.rpc('delete_student_account', {
          p_student_id: studentId,
          p_password_hash: passwordHash,
        });
      } catch (e) {
        console.warn('[Repository] delete_student_account RPC error:', e);
      }
    }

    this.notify();
    return true;
  }

  public updateStudentInfo(studentId: string, grade: string, schoolName: string, companionId: string): void {
    const current = this.userStats;
    const isDifferent = current.studentId !== studentId;
    const cachedStats = isDifferent && studentId !== 'STU-58291' ? sessionStore.getCachedUserStats(studentId) : null;

    if (cachedStats) {
      this.userStats = {
        ...cachedStats,
        grade,
        schoolName,
        companionId,
      };
    } else if (isDifferent && current.studentId === 'STU-58291') {
      this.userStats = {
        ...this.getDefaultUserStats(),
        studentId,
        name: 'Scholar',
        grade,
        schoolName,
        companionId,
        xp: 0,
        weeklyXp: 0,
        level: 1,
        streakDays: 1,
        streakStatus: 'Getting Started',
        solvedQuestions: 0,
        totalAttemptedQuestions: 0,
        accuracy: 100,
        arenaRank: 7,
        arenaPoints: 0,
        arenaQs: 0,
        weeklyQuestions: 0,
        daysActiveThisWeek: 1,
      };
    } else {
      this.userStats = {
        ...current,
        studentId,
        grade,
        schoolName,
        companionId,
      };
    }

    if (isDifferent) {
      this.mistakes = [];
      this.bookmarkedQuestionIds = new Set();
      if (studentId === 'STU-58291') {
        this.unlockedBadgeIds = new Set(['first_spark', 'centurion', 'slip_slayer']);
        this.featuredBadgeId = null;
      } else {
        this.unlockedBadgeIds = sessionStore.getUnlockedBadges(studentId);
        this.featuredBadgeId = sessionStore.getFeaturedBadgeId(studentId);
      }
    }

    this.chapterQuests = this.loadQuestsForStudent(studentId);
    this.saveStats();
    this.notify();
  }

  public getConqueredMistakesCount(): number {
    return this.conqueredMistakesCount;
  }

  public getNewlyUnlockedBadge(): Badge | null {
    return null;
  }

  public getBadgeCelebrationQueueCount(): number {
    return 0;
  }

  public dismissNewlyUnlockedBadge(): void {
    this.notify();
  }

  public getSeedQuestions(): QuizQuestion[] {
    return SEED_QUESTIONS;
  }

  public async syncOfflineMistakesToSupabase(studentId: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client || !studentId || studentId === 'STU-58291') return;
    try {
      const local = sessionStore.getOfflineMistakes(studentId);
      if (local && local.length > 0) {
        const passwordHash = sessionStore.getPasswordHash(studentId);
        for (const m of local) {
          await client.rpc('sync_student_mistake', {
            p_student_id: studentId,
            p_question_id: m.questionId,
            p_password_hash: passwordHash || null,
            p_user_wrong_choice: m.wrongChoice,
            p_is_conquered: m.isConquered,
          });
        }
      }
    } catch (e) {
      console.warn('[Repository] syncOfflineMistakesToSupabase skipped:', e);
    }
  }

  public async fetchMistakesFromSupabase(studentId: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client || !studentId || studentId === 'STU-58291') return;
    try {
      const { data, error } = await client.from('mistakes').select('*').eq('scholar_id', studentId);
      if (!error && data && data.length > 0) {
        this.notify();
      }
    } catch (e) {
      console.warn('[Repository] fetchMistakesFromSupabase skipped:', e);
    }
  }

  public reloadLocalMistakes(studentId: string): void {
    if (studentId === 'STU-58291') {
      this.mistakes = this.getDefaultMistakes();
    }
    this.notify();
  }

  public async recordMistakeInSupabase(studentId: string, questionId: string, wrongChoice: string, seconds: number): Promise<void> {
    const client = getSupabaseClient();
    if (!client || !studentId || studentId === 'STU-58291') return;
    try {
      const passwordHash = sessionStore.getPasswordHash(studentId);
      await client.rpc('sync_student_mistake', {
        p_student_id: studentId,
        p_question_id: questionId,
        p_password_hash: passwordHash || null,
        p_user_wrong_choice: wrongChoice,
        p_attempt_time_seconds: seconds,
        p_is_bookmarked: true,
        p_is_conquered: false,
      });
    } catch (e) {
      console.warn('[Repository] recordMistakeInSupabase error:', e);
    }
  }

  public async conquerMistakeInSupabase(studentId: string, questionId: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client || !studentId || studentId === 'STU-58291') return;
    try {
      const passwordHash = sessionStore.getPasswordHash(studentId);
      await client.rpc('sync_student_mistake', {
        p_student_id: studentId,
        p_question_id: questionId,
        p_password_hash: passwordHash || null,
        p_is_conquered: true,
      });
    } catch (e) {
      console.warn('[Repository] conquerMistakeInSupabase error:', e);
    }
  }

  public async syncBookmarkWithSupabase(studentId: string, questionId: string, isBookmarked: boolean): Promise<void> {
    const client = getSupabaseClient();
    if (!client || !studentId || studentId === 'STU-58291') return;
    try {
      const passwordHash = sessionStore.getPasswordHash(studentId);
      await client.rpc('sync_student_mistake', {
        p_student_id: studentId,
        p_question_id: questionId,
        p_password_hash: passwordHash || null,
        p_is_bookmarked: isBookmarked,
      });
    } catch (e) {
      console.warn('[Repository] syncBookmarkWithSupabase error:', e);
    }
  }

  public async syncArenaScoreWithSupabase(studentId: string, points: number): Promise<void> {
    if (!studentId || studentId === 'STU-58291') return;
    await this.syncProfileWithSupabase(studentId, this.userStats.grade, this.userStats.companionId);
  }

  public resetStudentSession(): void {
    this.initializeState();
    this.notify();
  }

  private saveStats(): void {
    const sid = this.userStats.studentId;
    if (sid && sid !== 'STU-58291') {
      sessionStore.saveCachedUserStats(sid, this.userStats);
    }
  }
}

export const repository = new AbhyasRepository();
export const repoInstance = repository;
