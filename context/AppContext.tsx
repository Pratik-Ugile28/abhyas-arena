'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  TabType,
  AppRouteType,
  UserStats,
  QuizQuestion,
  ChapterQuest,
  QuestStage,
  Scholar,
  ImprovedScholar,
  Badge,
  InProgressSession,
  ClassGradeInfo,
  CLASS_GRADES,
  AmbajogaiSchools,
  calculateDojoMastery,
  ARENA_COMPANIONS,
} from '@/types';
import { AbhyasRepository, repoInstance } from '@/lib/repository';
import { sessionStore } from '@/lib/sessionStore';
import { AuthValidator, AuthValidationResult } from '@/lib/authService';

interface LoginParams {
  studentId: string;
  password?: string;
  grade?: string;
  schoolName?: string;
  companionId?: string;
  isRegister?: boolean;
}

interface AppContextType {
  // Navigation & Shell
  currentTab: TabType;
  currentRoute: AppRouteType;
  isBattleSession: boolean;
  selectTab: (tab: TabType) => void;
  navigateTo: (route: AppRouteType) => void;
  navigateToPractice: (subject?: string) => void;

  // Auth
  isAuthenticated: boolean;
  login: (params: LoginParams) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  deleteAccount: (password?: string) => Promise<boolean>;

  // User & Stats
  userStats: UserStats;
  updateCompanion: (companionId: string) => void;
  updateSchool: (schoolName: string) => void;
  setGrade: (grade: ClassGradeInfo) => void;
  activateScholarshipPass: (months: number) => void;
  redeemActivationCode: (code: string) => Promise<{ success: boolean; message: string }>;
  syncAccountPassStatus: () => Promise<{ success: boolean; message: string }>;

  // Quest Map & Practice Hub
  chapterQuests: ChapterQuest[];
  selectedRealm: string;
  selectRealm: (realm: string) => void;
  focusedChapterId: string | null;
  focusChapter: (chapterId: string, realm?: string | null) => void;
  clearFocusedChapter: () => void;
  selectedPracticeHub: string;
  selectPracticeHub: (hub: string) => void;

  // Active Practice Session
  activeQuestTitle: string;
  activeStageSubtitle: string;
  activeChapterId: string | null;
  activeStageNumber: number;
  practiceQuestions: QuizQuestion[];
  isMistakeBattle: boolean;
  isArenaBattle: boolean;
  isSpeedBlitz: boolean;
  isReplayStage: boolean;
  isDojo: boolean;
  inProgressSession: InProgressSession | null;

  // Practice Starters
  startPractice: (subject?: string) => void;
  startQuestStage: (quest: ChapterQuest, stage: QuestStage) => void;
  startSpeedBlitz: (quest: ChapterQuest) => void;
  startQuickSprint: (realm?: string | null) => void;
  startMockExam: () => void;
  startRandomDrill: () => void;
  startPolishDrill: (chapter: ChapterQuest) => void;
  startChapterDojo: (quest: ChapterQuest) => void;
  startMistakeBattle: (subjectFilter?: string | null) => void;
  startArenaQualifyingRound: () => boolean;

  // Session Control
  saveInProgressSession: (currentIndex: number, correctCount: number, totalXpEarned: number, elapsedTime: number) => void;
  resumeInProgressSession: () => void;
  clearInProgressSession: () => void;
  completeArenaRound: (accuracy: number, arenaPointsEarned: number, questionCount?: number) => void;
  completeActiveStage: (accuracy: number, xpEarned: number) => void;
  getActiveStageClaimedMasteryBonus: () => number;
  addXP: (amount: number) => void;
  recordWrongAnswer: () => void;
  recordMistake: (question: QuizQuestion, wrongChoice: string, seconds: number) => void;
  conquerMistake: (id: string) => void;
  toggleBookmark: (question: QuizQuestion) => void;
  isQuestionBookmarked: (questionId: string) => boolean;
  bookmarkedQuestionIds: Set<string>;

  // Mistakes
  mistakes: QuizQuestion[];
  mistakesCount: number;
  conqueredMistakesCount: number;
  getWeakestUnlockedChapter: () => ChapterQuest | null;
  getPolishDrillQuestionCount: (grade: string) => number;

  // Arena & Leaderboard
  podium: Scholar[];
  leaderboard: Scholar[];
  schoolPodium: Scholar[];
  schoolLeaderboard: Scholar[];
  examPodium: Scholar[];
  examLeaderboard: Scholar[];
  isLeaderboardRefreshing: boolean;
  refreshLeaderboard: () => Promise<void>;
  getMostImproved: () => ImprovedScholar[];

  // Badges & Celebrations
  newlyUnlockedBadge: Badge | null;
  badgeCelebrationQueueCount: number;
  featuredBadgeId: string | null;
  getBadges: () => Badge[];
  setFeaturedBadge: (badgeId: string | null) => void;
  dismissBadgeCelebration: () => void;
  onQuestionAnsweredSpeed: (elapsedSeconds: number) => void;
  onComboStreakUpdated: (combo: number) => void;

  // Daily Habits
  dailyQuestionsSolved: number;
  isDailyGoalClaimed: boolean;

  // Modals & Dialogs
  isSyllabusOpen: boolean;
  openSyllabus: (open: boolean) => void;
  isNotificationsOpen: boolean;
  openNotifications: (open: boolean) => void;
  readNotificationIds: Set<string>;
  hasUnreadNotifications: boolean;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  retryQuestion: QuizQuestion | null;
  openRetryModal: (question: QuizQuestion) => void;
  closeRetryModal: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const repository = repoInstance;

  // Navigation
  const [currentTab, setCurrentTab] = useState<TabType>('HOME');
  const [currentRoute, setCurrentRoute] = useState<AppRouteType>('home');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(sessionStore.isLoggedIn());

  // Repository state sync
  const [userStats, setUserStats] = useState<UserStats>(() => repository.getUserStats());
  const [mistakes, setMistakes] = useState<QuizQuestion[]>(() => repository.getMistakes());
  const [conqueredMistakesCount, setConqueredMistakesCount] = useState<number>(() => repository.getConqueredMistakesCount());
  const [chapterQuests, setChapterQuests] = useState<ChapterQuest[]>(() => repository.getQuests());
  const [bookmarkedQuestionIds, setBookmarkedQuestionIds] = useState<Set<string>>(() => repository.getBookmarkedQuestionIds());
  const [newlyUnlockedBadge, setNewlyUnlockedBadge] = useState<Badge | null>(() => repository.getNewlyUnlockedBadge());
  const [badgeCelebrationQueueCount, setBadgeCelebrationQueueCount] = useState<number>(() => repository.getBadgeCelebrationQueueCount());
  const [featuredBadgeId, setFeaturedBadgeId] = useState<string | null>(() => repository.getFeaturedBadgeId());
  const [dailyQuestionsSolved, setDailyQuestionsSolved] = useState<number>(() => repository.getDailyQuestionsSolved());
  const [isDailyGoalClaimed, setIsDailyGoalClaimed] = useState<boolean>(() => repository.getIsDailyGoalClaimed());

  // Quest Map State
  const [selectedRealm, setSelectedRealm] = useState<string>('All');
  const [focusedChapterId, setFocusedChapterId] = useState<string | null>(null);
  const [selectedPracticeHub, setSelectedPracticeHub] = useState<string>('school');

  // Practice Session State
  const [activeQuestTitle, setActiveQuestTitle] = useState<string>('Practice Session');
  const [activeStageSubtitle, setActiveStageSubtitle] = useState<string>('Maharashtra Scholarship Preparation');
  const [activeChapterId, setActiveChapterId] = useState<string | null>('math_ch2');
  const [activeStageNumber, setActiveStageNumber] = useState<number>(2);
  const [practiceQuestions, setPracticeQuestions] = useState<QuizQuestion[]>([]);
  const [isMistakeBattle, setIsMistakeBattle] = useState<boolean>(false);
  const [isArenaBattle, setIsArenaBattle] = useState<boolean>(false);
  const [isSpeedBlitz, setIsSpeedBlitz] = useState<boolean>(false);
  const [isReplayStage, setIsReplayStage] = useState<boolean>(false);

  // Modals & Dialogs State
  const [isSyllabusOpen, setIsSyllabusOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [retryQuestion, setRetryQuestion] = useState<QuizQuestion | null>(null);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('abhyas_read_notifications');
        return saved ? new Set(JSON.parse(saved)) : new Set();
      } catch {
        return new Set();
      }
    }
    return new Set();
  });

  // Leaderboard State
  const [podium, setPodium] = useState<Scholar[]>(() => repository.getPodiumScholars());
  const [leaderboard, setLeaderboard] = useState<Scholar[]>(() => repository.getWeeklyLeaderboard());
  const [schoolPodium, setSchoolPodium] = useState<Scholar[]>(() => repository.getSchoolPodium());
  const [schoolLeaderboard, setSchoolLeaderboard] = useState<Scholar[]>(() => repository.getSchoolLeaderboard());
  const [examPodium, setExamPodium] = useState<Scholar[]>(() => repository.getExamPodium());
  const [examLeaderboard, setExamLeaderboard] = useState<Scholar[]>(() => repository.getExamLeaderboard());
  const [isLeaderboardRefreshing, setIsLeaderboardRefreshing] = useState<boolean>(false);

  // Restored in-progress session
  const [inProgressSession, setInProgressSession] = useState<InProgressSession | null>(() => {
    const currentStudentId = repository.getUserStats().studentId;
    return sessionStore.getSession(currentStudentId);
  });

  const isBattleSession = currentRoute === 'quest_battle';
  const mistakesCount = mistakes.length;
  const isDojo = (activeChapterId?.startsWith('dojo_') || activeQuestTitle.includes('Dojo')) ?? false;
  const hasUnreadNotifications = readNotificationIds.size < 3;

  // Subscriptions to repository state changes
  useEffect(() => {
    const syncState = () => {
      const stats = repository.getUserStats();
      setUserStats(stats);
      setMistakes(repository.getMistakes());
      setConqueredMistakesCount(repository.getConqueredMistakesCount());
      setChapterQuests(repository.getQuests());
      setBookmarkedQuestionIds(repository.getBookmarkedQuestionIds());
      setNewlyUnlockedBadge(repository.getNewlyUnlockedBadge());
      setBadgeCelebrationQueueCount(repository.getBadgeCelebrationQueueCount());
      setFeaturedBadgeId(repository.getFeaturedBadgeId());
      setDailyQuestionsSolved(repository.getDailyQuestionsSolved());
      setIsDailyGoalClaimed(repository.getIsDailyGoalClaimed());
      setPodium(repository.getPodiumScholars(stats.schoolName, stats.grade));
      setLeaderboard(repository.getWeeklyLeaderboard(stats.schoolName, stats.grade));
      setSchoolPodium(repository.getSchoolPodium(stats.schoolName, stats.grade));
      setSchoolLeaderboard(repository.getSchoolLeaderboard(stats.schoolName, stats.grade));
      setExamPodium(repository.getExamPodium(stats.schoolName, stats.grade));
      setExamLeaderboard(repository.getExamLeaderboard(stats.schoolName, stats.grade));
    };

    const unsubscribe = repository.subscribe(syncState);
    return () => {
      unsubscribe();
    };
  }, [repository]);

  // Daily habit & initial sync check
  useEffect(() => {
    repository.checkAndExpireSubscriptionIfNeeded();
    if (sessionStore.isLoggedIn()) {
      const studentId = sessionStore.getSavedStudentId();
      if (studentId && studentId !== 'STU-58291') {
        repository.loadProfileFromSupabase(studentId).then(() => {
          repository.syncOfflineMistakesToSupabase(studentId);
          repository.fetchMistakesFromSupabase(studentId);
          repository.reloadLocalMistakes(studentId);
        });
      }
    }
  }, [repository]);

  // Navigation handlers
  const selectTab = useCallback((tab: TabType) => {
    setCurrentTab(tab);
    switch (tab) {
      case 'HOME': setCurrentRoute('home'); break;
      case 'PRACTICE': setCurrentRoute('practice'); break;
      case 'MISTAKES': setCurrentRoute('mistakes'); break;
      case 'ARENA': setCurrentRoute('arena'); break;
      case 'PROFILE': setCurrentRoute('profile'); break;
    }
  }, []);

  const navigateTo = useCallback((route: AppRouteType) => {
    setCurrentRoute(route);
    switch (route) {
      case 'home': setCurrentTab('HOME'); break;
      case 'practice': setCurrentTab('PRACTICE'); break;
      case 'mistakes': setCurrentTab('MISTAKES'); break;
      case 'arena': setCurrentTab('ARENA'); break;
      case 'profile': setCurrentTab('PROFILE'); break;
      case 'quest_battle': setCurrentTab('PRACTICE'); break;
      default: break;
    }
  }, []);

  const selectRealm = useCallback((realm: string) => {
    setSelectedRealm(realm);
  }, []);

  const selectPracticeHub = useCallback((hub: string) => {
    setSelectedPracticeHub(hub);
  }, []);

  const focusChapter = useCallback((chapterId: string, realm?: string | null) => {
    setFocusedChapterId(chapterId);
    const quest = chapterQuests.find((q) => q.id === chapterId);
    if (quest?.track) {
      setSelectedPracticeHub(quest.track);
    }
    if (realm) {
      setSelectedRealm(realm);
    }
  }, [chapterQuests]);

  const clearFocusedChapter = useCallback(() => {
    setFocusedChapterId(null);
  }, []);

  const loadPracticeQuestions = useCallback(async (subject?: string) => {
    const list = await repository.getQuestionsForGrade(userStats.grade, subject);
    setPracticeQuestions(list);
  }, [repository, userStats.grade]);

  const startPractice = useCallback(async (subject?: string) => {
    await loadPracticeQuestions(subject);
    selectTab('PRACTICE');
  }, [loadPracticeQuestions, selectTab]);

  const startQuestStage = useCallback(async (quest: ChapterQuest, stage: QuestStage) => {
    setIsMistakeBattle(false);
    setIsArenaBattle(false);
    setIsSpeedBlitz(false);
    setIsReplayStage(stage.isCompleted || repository.isStageCompleted(quest.id, stage.stageNumber));
    setActiveQuestTitle(`${quest.icon || '📘'} ${quest.title}`);
    setActiveStageSubtitle(`${stage.name} • ${stage.difficulty}`);
    setActiveChapterId(quest.id);
    setActiveStageNumber(stage.stageNumber);

    const questions = await repository.getQuestionsForQuest(quest.id, stage.type.toLowerCase(), stage.questionCount);
    setPracticeQuestions(questions);
    navigateTo('quest_battle');
  }, [repository, navigateTo]);

  const startSpeedBlitz = useCallback(async (quest: ChapterQuest) => {
    setIsMistakeBattle(false);
    setIsArenaBattle(false);
    setIsSpeedBlitz(true);
    setIsReplayStage(false);
    setActiveQuestTitle(`⚡ Speed Blitz: ${quest.title}`);
    setActiveStageSubtitle('Rapid Sprint • Speed Bonus XP');
    setActiveChapterId(`blitz_${quest.id}`);
    setActiveStageNumber(0);

    const questions = await repository.getQuestionsForQuest(quest.id, 'blitz', 5);
    setPracticeQuestions(questions);
    navigateTo('quest_battle');
  }, [repository, navigateTo]);

  const startQuickSprint = useCallback(async (realm?: string | null) => {
    setIsMistakeBattle(false);
    setIsArenaBattle(false);
    setIsReplayStage(false);
    setIsSpeedBlitz(false);
    const realmTag = realm?.replace('🔢', '')?.replace('🧠', '')?.replace('📖', '')?.trim();
    setActiveQuestTitle(!realmTag || realmTag === 'All' ? '🎯 Quick 5 Sprint' : `🎯 Quick 5: ${realmTag}`);
    setActiveStageSubtitle('5 High-Yield Questions • +50 XP');
    setActiveChapterId('quick_sprint');
    setActiveStageNumber(0);

    const questions = await repository.getQuickSprintQuestions(realmTag || null, 5);
    setPracticeQuestions(questions);
    navigateTo('quest_battle');
  }, [repository, navigateTo]);

  const startMockExam = useCallback(async () => {
    setIsMistakeBattle(false);
    setIsArenaBattle(false);
    setIsReplayStage(false);
    setIsSpeedBlitz(false);
    setActiveQuestTitle('📝 Scholarship Mock Exam');
    setActiveStageSubtitle('25 Questions • Official PUP Simulation • +250 XP');
    setActiveChapterId('mock_exam');
    setActiveStageNumber(0);

    const questions = await repository.getMockQuestions(25);
    setPracticeQuestions(questions);
    navigateTo('quest_battle');
  }, [repository, navigateTo]);

  const startRandomDrill = useCallback(async () => {
    setInProgressSession(null);
    sessionStore.clearSession(userStats.studentId);
    setIsMistakeBattle(false);
    setIsArenaBattle(false);
    setIsReplayStage(false);
    setIsSpeedBlitz(false);
    setActiveQuestTitle('🎲 Adaptive Mistake Drill');
    setActiveStageSubtitle('Targeted Weak Spots • +100 XP');
    setActiveChapterId('random_drill');
    setActiveStageNumber(0);

    const questions = await repository.getQuickSprintQuestions(null, 10);
    setPracticeQuestions(questions);
    navigateTo('quest_battle');
  }, [repository, userStats.studentId, navigateTo]);

  const startPolishDrill = useCallback(async (chapter: ChapterQuest) => {
    setInProgressSession(null);
    sessionStore.clearSession(userStats.studentId);
    setIsMistakeBattle(false);
    setIsArenaBattle(false);
    setIsReplayStage(false);
    setIsSpeedBlitz(false);
    const count = repository.getPolishDrillQuestionCount(userStats.grade);
    setActiveQuestTitle(`🎯 Polish: ${chapter.title}`);
    setActiveStageSubtitle(`Targeted Weak Spot (${chapter.stars}★ → ${chapter.stars + 1}★) • ${count} Qs • +5 XP Mastery`);
    setActiveChapterId(`polish_${chapter.id}`);
    setActiveStageNumber(0);

    const questions = await repository.getPolishDrillQuestions(chapter.id);
    setPracticeQuestions(questions);
    navigateTo('quest_battle');
  }, [repository, userStats.grade, userStats.studentId, navigateTo]);

  const startChapterDojo = useCallback(async (quest: ChapterQuest) => {
    setInProgressSession(null);
    sessionStore.clearSession(userStats.studentId);
    setIsMistakeBattle(false);
    setIsArenaBattle(false);
    setIsReplayStage(false);
    setIsSpeedBlitz(false);
    const mastery = calculateDojoMastery(quest.dojoQuestionsSolved || 0, userStats.grade);
    setActiveQuestTitle(`🥋 Dojo: ${quest.title}`);
    setActiveStageSubtitle(`Mastery Drill (${mastery.tier}) • 5 Qs • +5 XP/Q`);
    setActiveChapterId(`dojo_${quest.id}`);
    setActiveStageNumber(0);

    const questions = await repository.getChapterDojoQuestions(quest.id, 5);
    setPracticeQuestions(questions);
    navigateTo('quest_battle');
  }, [repository, userStats.grade, userStats.studentId, navigateTo]);

  const startMistakeBattle = useCallback((subjectFilter?: string | null) => {
    setInProgressSession(null);
    sessionStore.clearSession(userStats.studentId);
    setIsMistakeBattle(true);
    setIsArenaBattle(false);
    setIsReplayStage(false);
    setIsSpeedBlitz(false);

    const allMistakes = repository.getMistakes();
    let filtered = allMistakes;
    if (subjectFilter && subjectFilter !== 'All') {
      const clean = subjectFilter.replace('🔢', '').replace('🧠', '').replace('📖', '').trim().toLowerCase();
      filtered = allMistakes.filter((q) => q.subject.toLowerCase().includes(clean));
    }
    const pool = filtered.length > 0 ? filtered : allMistakes.length > 0 ? allMistakes : repository.getSeedQuestions().slice(0, 5);
    const categoryLabel = subjectFilter && subjectFilter !== 'All' ? ` • ${subjectFilter}` : '';
    setActiveQuestTitle(`🔥 Mistake Revision Battle${categoryLabel}`);
    setActiveStageSubtitle(`${pool.length} Slips to Conquer • +15 XP / Conquer`);
    setActiveChapterId('mistake_vault');
    setActiveStageNumber(1);
    setPracticeQuestions(pool);
    navigateTo('quest_battle');
  }, [repository, userStats.studentId, navigateTo]);

  const startArenaQualifyingRound = useCallback(() => {
    if (!userStats.isSubscribed) return false;
    const remaining = Math.max(0, 100 - userStats.arenaQs);
    if (remaining <= 0) return false;
    const targetCount = Math.min(5, remaining);

    setInProgressSession(null);
    sessionStore.clearSession(userStats.studentId);
    setIsArenaBattle(true);
    setIsMistakeBattle(false);
    setIsReplayStage(false);
    setIsSpeedBlitz(false);
    setActiveQuestTitle('⚔️ Arena Qualifying Round');
    setActiveStageSubtitle(`Weekly Promotion Trial • ${targetCount} Scored Qs • +15 XP/Q + Speed Bonus`);
    setActiveChapterId('arena_qualifying');
    setActiveStageNumber(1);

    repository.getArenaQualifyingQuestions(userStats.grade, targetCount).then((questions) => {
      setPracticeQuestions(questions);
      navigateTo('quest_battle');
    });
    return true;
  }, [repository, userStats, navigateTo]);

  const navigateToPractice = useCallback((subject?: string) => {
    if (!subject) {
      selectTab('PRACTICE');
      return;
    }
    const s = subject.toLowerCase();
    if (s.includes('fraction') || s.includes('math')) {
      focusChapter('math_ch2', '🔢 Math');
      selectTab('PRACTICE');
    } else if (s.includes('geometry')) {
      focusChapter('math_ch3', '🔢 Math');
      selectTab('PRACTICE');
    } else if (s.includes('profit')) {
      focusChapter('math_ch4', '🔢 Math');
      selectTab('PRACTICE');
    } else if (s.includes('logic') || s.includes('reasoning') || s.includes('pattern')) {
      focusChapter('logic_ch1', '🧠 Logic');
      selectTab('PRACTICE');
    } else if (s.includes('series') || s.includes('code')) {
      focusChapter('logic_ch2', '🧠 Logic');
      selectTab('PRACTICE');
    } else if (s.includes('mirror') || s.includes('reflection') || s.includes('visual')) {
      focusChapter('logic_ch3', '🧠 Logic');
      selectTab('PRACTICE');
    } else if (s.includes('language') || s.includes('vocab')) {
      focusChapter('lang_ch1', '📖 Language');
      selectTab('PRACTICE');
    } else if (s.includes('comprehension') || s.includes('passage')) {
      focusChapter('lang_ch2', '📖 Language');
      selectTab('PRACTICE');
    } else if (s.includes('arena')) {
      startArenaQualifyingRound();
    } else if (s.includes('speed_blitz') || s.includes('blitz')) {
      const blitzChapter = chapterQuests.find((q) => !q.isLocked && q.progressPercent < 100) || chapterQuests.find((q) => !q.isLocked) || chapterQuests[0];
      if (blitzChapter) {
        if (!userStats.isSubscribed) {
          const realm = blitzChapter.subject.includes('Math') ? '🔢 Math' : blitzChapter.subject.includes('Reasoning') ? '🧠 Logic' : '📖 Language';
          focusChapter(blitzChapter.id, realm);
          selectTab('PRACTICE');
        } else {
          startSpeedBlitz(blitzChapter);
        }
      }
    } else {
      selectTab('PRACTICE');
    }
  }, [chapterQuests, userStats.isSubscribed, focusChapter, selectTab, startArenaQualifyingRound, startSpeedBlitz]);

  const saveInProgressSession = useCallback((
    currentIndex: number,
    correctCount: number,
    totalXpEarned: number,
    elapsedTime: number
  ) => {
    if (practiceQuestions.length === 0 || currentIndex < 0 || currentIndex >= practiceQuestions.length) return;
    const currentStageReward = chapterQuests
      .find((q) => q.id === activeChapterId)
      ?.stages.find((s) => s.stageNumber === activeStageNumber)?.xpReward || 80;

    const currentStudentId = userStats.studentId;
    const session: InProgressSession = {
      questTitle: activeQuestTitle,
      stageSubtitle: activeStageSubtitle,
      chapterId: activeChapterId || '',
      stageNumber: activeStageNumber,
      questions: practiceQuestions,
      currentIndex,
      correctCount: Math.min(correctCount, practiceQuestions.length),
      totalXpEarned,
      elapsedTime,
      totalStageXp: currentStageReward,
      isArenaBattle,
      isMistakeBattle,
      isReplay: isReplayStage,
      isSpeedBlitz,
      studentId: currentStudentId,
    };
    setInProgressSession(session);
    sessionStore.saveSession(session, currentStudentId);
  }, [practiceQuestions, chapterQuests, activeChapterId, activeStageNumber, userStats.studentId, activeQuestTitle, activeStageSubtitle, isArenaBattle, isMistakeBattle, isReplayStage, isSpeedBlitz]);

  const resumeInProgressSession = useCallback(() => {
    const currentStudentId = userStats.studentId;
    const session = inProgressSession || sessionStore.getSession(currentStudentId);
    if (!session) return;

    setInProgressSession(session);
    setActiveQuestTitle(session.questTitle);
    setActiveStageSubtitle(session.stageSubtitle);
    setActiveChapterId(session.chapterId);
    setActiveStageNumber(session.stageNumber);
    setIsArenaBattle(Boolean(session.isArenaBattle));
    setIsMistakeBattle(Boolean(session.isMistakeBattle));
    setIsSpeedBlitz(Boolean(session.isSpeedBlitz));
    setIsReplayStage(Boolean(session.isReplay) || repository.isStageCompleted(session.chapterId, session.stageNumber));
    setPracticeQuestions(session.questions);
    navigateTo('quest_battle');
  }, [inProgressSession, userStats.studentId, repository, navigateTo]);

  const clearInProgressSession = useCallback(() => {
    const currentStudentId = userStats.studentId;
    setInProgressSession(null);
    sessionStore.clearSession(currentStudentId);
  }, [userStats.studentId]);

  const completeArenaRound = useCallback((accuracy: number, arenaPointsEarned: number, questionCount?: number) => {
    const qCount = questionCount || practiceQuestions.length || 5;
    clearInProgressSession();
    setIsArenaBattle(false);
    setIsSpeedBlitz(false);
    repository.recordArenaRoundResult(arenaPointsEarned, qCount, accuracy);
    const studentId = userStats.studentId;
    repository.syncArenaScoreWithSupabase(studentId, arenaPointsEarned);
    repository.syncProfileWithSupabase(studentId, userStats.grade, userStats.companionId);
  }, [practiceQuestions.length, clearInProgressSession, repository, userStats]);

  const completeActiveStage = useCallback((accuracy: number, xpEarned: number) => {
    clearInProgressSession();
    setIsSpeedBlitz(false);
    const chapterId = activeChapterId;
    if (!chapterId) return;
    const qCount = practiceQuestions.length > 0 ? practiceQuestions.length : undefined;
    const isReplay = isReplayStage || repository.isStageCompleted(chapterId, activeStageNumber);

    repository.completeQuestStage(
      chapterId,
      activeStageNumber,
      accuracy,
      xpEarned,
      qCount,
      isReplay
    );

    if (accuracy >= 40) {
      setIsReplayStage(true);
    }
    if (chapterId.startsWith('polish_')) {
      const baseChapterId = chapterId.replace('polish_', '');
      if (accuracy === 100) {
        repository.upgradeChapterStarRating(baseChapterId);
      }
    }
    if (chapterId.startsWith('dojo_')) {
      const baseChapterId = chapterId.replace('dojo_', '');
      const count = qCount || 5;
      const correct = Math.min(count, Math.max(0, Math.round((accuracy * count) / 100)));
      repository.recordDojoSessionCompleted(baseChapterId, correct);
    }

    const studentId = userStats.studentId;
    repository.syncProfileWithSupabase(studentId, userStats.grade, userStats.companionId);
  }, [clearInProgressSession, activeChapterId, practiceQuestions.length, isReplayStage, repository, activeStageNumber, userStats]);

  const getActiveStageClaimedMasteryBonus = useCallback(() => {
    if (!activeChapterId) return 0;
    return repository.getStageClaimedMasteryBonus(activeChapterId, activeStageNumber);
  }, [repository, activeChapterId, activeStageNumber]);

  const addXP = useCallback((amount: number) => {
    const chapterId = activeChapterId || '';
    const activeQuest = chapterQuests.find((q) => q.id === chapterId);
    const isExam = isArenaBattle || isSpeedBlitz || activeQuest?.track === 'exam' || chapterId.startsWith('logic_') || chapterId.startsWith('arena_');
    const track = isExam ? 'exam' : 'school';
    repository.addXpAndPoints(amount, track);
  }, [activeChapterId, chapterQuests, isArenaBattle, isSpeedBlitz, repository]);

  const recordWrongAnswer = useCallback(() => {
    repository.recordWrongAnswer();
  }, [repository]);

  const recordMistake = useCallback((question: QuizQuestion, wrongChoice: string, seconds: number) => {
    repository.recordMistake(question, wrongChoice, seconds);
    const studentId = userStats.studentId;
    repository.recordMistakeInSupabase(studentId, question.id, wrongChoice, seconds);
  }, [repository, userStats.studentId]);

  const conquerMistake = useCallback((id: string) => {
    repository.conquerMistake(id);
    const studentId = userStats.studentId;
    repository.conquerMistakeInSupabase(studentId, id);
    repository.syncProfileWithSupabase(studentId, userStats.grade, userStats.companionId);
  }, [repository, userStats]);

  const toggleBookmark = useCallback((question: QuizQuestion) => {
    const isBm = repository.toggleBookmark(question);
    const studentId = userStats.studentId;
    repository.syncBookmarkWithSupabase(studentId, question.id, isBm);
  }, [repository, userStats.studentId]);

  const isQuestionBookmarked = useCallback((questionId: string) => {
    return repository.isQuestionBookmarked(questionId);
  }, [repository]);

  const setGrade = useCallback((grade: ClassGradeInfo) => {
    const classGradeKey = (CLASS_GRADES[grade.key] ? grade.key : 'CLASS_5') as any;
    repository.switchClassGrade({ key: classGradeKey, label: grade.label, examName: grade.examName });
    const stats = repository.getUserStats();
    sessionStore.saveLoginState(true, stats.studentId, grade.label, stats.schoolName, stats.companionId);
    repository.syncProfileWithSupabase(stats.studentId, grade.label, stats.companionId);
    loadPracticeQuestions();
  }, [repository, loadPracticeQuestions]);

  const activateScholarshipPass = useCallback((months: number) => {
    repository.activateScholarshipPass(months);
    const stats = repository.getUserStats();
    repository.syncProfileWithSupabase(stats.studentId, stats.grade, stats.companionId);
  }, [repository]);

  const redeemActivationCode = useCallback(async (code: string) => {
    const clean = code.trim().toUpperCase();
    if (!clean) return { success: false, message: 'Please enter an activation code' };

    const now = Date.now();
    const lockoutUntil = sessionStore.getRedeemLockoutUntil();
    if (now < lockoutUntil) {
      const remainingSec = Math.max(1, Math.floor((lockoutUntil - now) / 1000));
      const mins = Math.floor(remainingSec / 60);
      const secs = remainingSec % 60;
      return { success: false, message: `Too many failed attempts. Security lockout active for ${mins}m ${secs}s.` };
    }

    const voucherRegex = /^AA-(1M|3M|6M)-([2-9A-HJ-NP-Z0-9]{6})$/i;
    const match = clean.match(voucherRegex);
    if (!match) {
      const attempts = sessionStore.getRedeemAttempts() + 1;
      sessionStore.saveRedeemAttempts(attempts);
      if (attempts >= 4) {
        sessionStore.saveRedeemLockoutUntil(now + 5 * 60 * 1000);
        return { success: false, message: 'Too many failed attempts. Temporary lockout for 5 minutes.' };
      }
      return { success: false, message: `Invalid code format. Codes look like AA-6M-K7P9W2 (Attempt ${attempts} of 3)` };
    }

    const planTag = match[1].toUpperCase();
    const months = planTag === '6M' ? 6 : planTag === '3M' ? 3 : 1;
    const currentStudentId = userStats.studentId;

    const onlineRes = await repository.redeemVoucherOnline(clean, currentStudentId, userStats.parentPhone);
    if (onlineRes) {
      if (onlineRes.success) {
        sessionStore.resetRedeemRateLimit();
        return { success: true, message: onlineRes.message || `✓ Pass activated successfully! (${months} Months access)` };
      }
      const attempts = sessionStore.getRedeemAttempts() + 1;
      sessionStore.saveRedeemAttempts(attempts);
      return { success: false, message: onlineRes.message || 'Invalid voucher code. Please check and try again.' };
    }

    if (currentStudentId === 'STU-58291') {
      sessionStore.resetRedeemRateLimit();
      activateScholarshipPass(months);
      return { success: true, message: `✓ Pass activated successfully! (${months} Months access)` };
    }

    return { success: false, message: 'Network error contacting scholarship server. Please check your internet connection and try again.' };
  }, [userStats, repository, activateScholarshipPass]);

  const syncAccountPassStatus = useCallback(async () => {
    const stats = userStats;
    const loaded = await repository.loadProfileFromSupabase(stats.studentId);
    repository.checkAndExpireSubscriptionIfNeeded();
    const result = await repository.syncProfileWithSupabase(stats.studentId, stats.grade, stats.companionId);
    if (loaded || result) {
      return { success: true, message: '✓ Account & Pass synced successfully!' };
    }
    return { success: false, message: 'Sync completed.' };
  }, [userStats, repository]);

  const login = useCallback(async ({
    studentId,
    password = '',
    grade = 'Class 5',
    schoolName = AmbajogaiSchools.KHOLESHWAR,
    companionId = 'unicorn',
    isRegister = false,
  }: LoginParams): Promise<{ success: boolean; error?: string }> => {
    const cleanId = studentId.trim();
    const idVal = AuthValidator.validateStudentId(cleanId);
    if (!idVal.valid) {
      return { success: false, error: idVal.reason };
    }

    const isDemo = cleanId.toUpperCase() === 'STU-58291' || cleanId.toLowerCase() === 'demo_student';
    if (!isDemo && password.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters.' };
    }

    const inputHash = password ? await AuthValidator.hashPassword(password, cleanId) : '';
    const storedHash = sessionStore.getPasswordHash(cleanId);

    if (storedHash && storedHash !== inputHash) {
      return { success: false, error: 'Incorrect password. Please verify your credentials.' };
    }

    if (!isDemo) {
      const remoteCheck = await repository.verifyRemoteCredentials(cleanId, inputHash, isRegister);
      if (!remoteCheck.success) {
        return { success: false, error: remoteCheck.message || 'Invalid credentials or connection error.' };
      }
    }

    sessionStore.saveLoginState(true, cleanId, grade, schoolName, companionId);
    sessionStore.savePasswordHash(cleanId, inputHash);
    repository.updateStudentInfo(cleanId, grade, schoolName, companionId);

    if (isRegister) {
      await repository.syncProfileWithSupabase(cleanId, grade, companionId);
    } else {
      await repository.loadProfileFromSupabase(cleanId);
    }
    await repository.fetchMistakesFromSupabase(cleanId);
    repository.reloadLocalMistakes(cleanId);

    setIsAuthenticated(true);
    setCurrentTab('HOME');
    setCurrentRoute('home');
    return { success: true };
  }, [repository]);

  const logout = useCallback(() => {
    setInProgressSession(null);
    sessionStore.clearAuthAndSession();
    repository.resetStudentSession();
    setIsAuthenticated(false);
    setCurrentTab('HOME');
    setCurrentRoute('auth');
  }, [repository]);

  const deleteAccount = useCallback(async (password?: string): Promise<boolean> => {
    const studentId = userStats.studentId;
    if (password) {
      const storedHash = sessionStore.getPasswordHash(studentId);
      if (storedHash) {
        const inputHash = await AuthValidator.hashPassword(password, studentId);
        if (inputHash !== storedHash) return false;
      }
    }
    await repository.deleteStudentAccount(password);
    logout();
    return true;
  }, [userStats.studentId, repository, logout]);

  const updateCompanion = useCallback((companionId: string) => {
    repository.updateCompanion(companionId);
    const stats = userStats;
    repository.syncProfileWithSupabase(stats.studentId, stats.grade, companionId);
  }, [repository, userStats]);

  const updateSchool = useCallback((schoolName: string) => {
    repository.updateSchool(schoolName);
    const stats = userStats;
    repository.syncProfileWithSupabase(stats.studentId, stats.grade, stats.companionId);
  }, [repository, userStats]);

  const refreshLeaderboard = useCallback(async () => {
    setIsLeaderboardRefreshing(true);
    try {
      await repository.fetchRemoteLeaderboard();
      const stats = repository.getUserStats();
      setPodium(repository.getPodiumScholars(stats.schoolName, stats.grade));
      setLeaderboard(repository.getWeeklyLeaderboard(stats.schoolName, stats.grade));
      setSchoolPodium(repository.getSchoolPodium(stats.schoolName, stats.grade));
      setSchoolLeaderboard(repository.getSchoolLeaderboard(stats.schoolName, stats.grade));
      setExamPodium(repository.getExamPodium(stats.schoolName, stats.grade));
      setExamLeaderboard(repository.getExamLeaderboard(stats.schoolName, stats.grade));
    } finally {
      setIsLeaderboardRefreshing(false);
    }
  }, [repository]);

  const getBadges = useCallback(() => repository.getBadges(), [repository]);
  const getMostImproved = useCallback(() => repository.getMostImproved(), [repository]);
  const getWeakestUnlockedChapter = useCallback(() => repository.getWeakestUnlockedChapter(), [repository]);
  const getPolishDrillQuestionCount = useCallback((g: string) => repository.getPolishDrillQuestionCount(g), [repository]);
  const setFeaturedBadge = useCallback((id: string | null) => repository.setFeaturedBadge(id), [repository]);
  const dismissBadgeCelebration = useCallback(() => repository.dismissNewlyUnlockedBadge(), [repository]);

  const onQuestionAnsweredSpeed = useCallback((elapsed: number) => {
    if (elapsed < 4.0) repository.checkAndAwardMilestoneBadges({ fastAnswer: true });
  }, [repository]);

  const onComboStreakUpdated = useCallback((combo: number) => {
    if (combo >= 5) repository.checkAndAwardMilestoneBadges({ comboStreakReached: true });
  }, [repository]);

  const openRetryModal = useCallback((q: QuizQuestion) => setRetryQuestion(q), []);
  const closeRetryModal = useCallback(() => setRetryQuestion(null), []);
  const openSyllabus = useCallback((open: boolean) => setIsSyllabusOpen(open), []);
  const openNotifications = useCallback((open: boolean) => setIsNotificationsOpen(open), []);

  const markNotificationRead = useCallback((id: string) => {
    setReadNotificationIds((prev) => {
      const next = new Set(prev).add(id);
      try {
        localStorage.setItem('abhyas_read_notifications', JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    const all = new Set(['streak_protected', 'arena_rank', 'mistake_tip']);
    setReadNotificationIds(all);
    try {
      localStorage.setItem('abhyas_read_notifications', JSON.stringify([...all]));
    } catch {}
  }, []);

  const value = useMemo<AppContextType>(() => ({
    currentTab,
    currentRoute,
    isBattleSession,
    selectTab,
    navigateTo,
    navigateToPractice,
    isAuthenticated,
    login,
    logout,
    deleteAccount,
    userStats,
    updateCompanion,
    updateSchool,
    setGrade,
    activateScholarshipPass,
    redeemActivationCode,
    syncAccountPassStatus,
    chapterQuests,
    selectedRealm,
    selectRealm,
    focusedChapterId,
    focusChapter,
    clearFocusedChapter,
    selectedPracticeHub,
    selectPracticeHub,
    activeQuestTitle,
    activeStageSubtitle,
    activeChapterId,
    activeStageNumber,
    practiceQuestions,
    isMistakeBattle,
    isArenaBattle,
    isSpeedBlitz,
    isReplayStage,
    isDojo,
    inProgressSession,
    startPractice,
    startQuestStage,
    startSpeedBlitz,
    startQuickSprint,
    startMockExam,
    startRandomDrill,
    startPolishDrill,
    startChapterDojo,
    startMistakeBattle,
    startArenaQualifyingRound,
    saveInProgressSession,
    resumeInProgressSession,
    clearInProgressSession,
    completeArenaRound,
    completeActiveStage,
    getActiveStageClaimedMasteryBonus,
    addXP,
    recordWrongAnswer,
    recordMistake,
    conquerMistake,
    toggleBookmark,
    isQuestionBookmarked,
    bookmarkedQuestionIds,
    mistakes,
    mistakesCount,
    conqueredMistakesCount,
    getWeakestUnlockedChapter,
    getPolishDrillQuestionCount,
    podium,
    leaderboard,
    schoolPodium,
    schoolLeaderboard,
    examPodium,
    examLeaderboard,
    isLeaderboardRefreshing,
    refreshLeaderboard,
    getMostImproved,
    newlyUnlockedBadge,
    badgeCelebrationQueueCount,
    featuredBadgeId,
    getBadges,
    setFeaturedBadge,
    dismissBadgeCelebration,
    onQuestionAnsweredSpeed,
    onComboStreakUpdated,
    dailyQuestionsSolved,
    isDailyGoalClaimed,
    isSyllabusOpen,
    openSyllabus,
    isNotificationsOpen,
    openNotifications,
    readNotificationIds,
    hasUnreadNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    retryQuestion,
    openRetryModal,
    closeRetryModal,
  }), [
    currentTab,
    currentRoute,
    isBattleSession,
    selectTab,
    navigateTo,
    navigateToPractice,
    isAuthenticated,
    login,
    logout,
    deleteAccount,
    userStats,
    updateCompanion,
    updateSchool,
    setGrade,
    activateScholarshipPass,
    redeemActivationCode,
    syncAccountPassStatus,
    chapterQuests,
    selectedRealm,
    selectRealm,
    focusedChapterId,
    focusChapter,
    clearFocusedChapter,
    selectedPracticeHub,
    selectPracticeHub,
    activeQuestTitle,
    activeStageSubtitle,
    activeChapterId,
    activeStageNumber,
    practiceQuestions,
    isMistakeBattle,
    isArenaBattle,
    isSpeedBlitz,
    isReplayStage,
    isDojo,
    inProgressSession,
    startPractice,
    startQuestStage,
    startSpeedBlitz,
    startQuickSprint,
    startMockExam,
    startRandomDrill,
    startPolishDrill,
    startChapterDojo,
    startMistakeBattle,
    startArenaQualifyingRound,
    saveInProgressSession,
    resumeInProgressSession,
    clearInProgressSession,
    completeArenaRound,
    completeActiveStage,
    getActiveStageClaimedMasteryBonus,
    addXP,
    recordWrongAnswer,
    recordMistake,
    conquerMistake,
    toggleBookmark,
    isQuestionBookmarked,
    bookmarkedQuestionIds,
    mistakes,
    mistakesCount,
    conqueredMistakesCount,
    getWeakestUnlockedChapter,
    getPolishDrillQuestionCount,
    podium,
    leaderboard,
    schoolPodium,
    schoolLeaderboard,
    examPodium,
    examLeaderboard,
    isLeaderboardRefreshing,
    refreshLeaderboard,
    getMostImproved,
    newlyUnlockedBadge,
    badgeCelebrationQueueCount,
    featuredBadgeId,
    getBadges,
    setFeaturedBadge,
    dismissBadgeCelebration,
    onQuestionAnsweredSpeed,
    onComboStreakUpdated,
    dailyQuestionsSolved,
    isDailyGoalClaimed,
    isSyllabusOpen,
    openSyllabus,
    isNotificationsOpen,
    openNotifications,
    readNotificationIds,
    hasUnreadNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    retryQuestion,
    openRetryModal,
    closeRetryModal,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
