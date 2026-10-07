import { ChapterQuest, InProgressSession, UserStats } from '../types';

export interface ISessionStore {
  saveSession(session: InProgressSession, studentId?: string | null): void;
  getSession(studentId?: string | null): InProgressSession | null;
  clearSession(studentId?: string | null): void;

  getLastActiveDate(studentId?: string | null): string | null;
  saveLastActiveDate(date: string, studentId?: string | null): void;

  getLastActiveWeek(studentId?: string | null): number | null;
  saveLastActiveWeek(week: number, studentId?: string | null): void;

  isWeeklyResetPending(studentId?: string | null): boolean;
  setWeeklyResetPending(pending: boolean, studentId?: string | null): void;

  getUnlockedBadges(studentId?: string | null): Set<string>;
  saveUnlockedBadges(badges: Set<string>, studentId?: string | null): void;

  getFeaturedBadgeId(studentId?: string | null): string | null;
  saveFeaturedBadgeId(badgeId: string | null, studentId?: string | null): void;

  isLoggedIn(): boolean;
  getPasswordHash(studentId: string): string | null;
  savePasswordHash(studentId: string, hash: string): void;

  saveLoginState(
    isLoggedIn: boolean,
    studentId?: string | null,
    grade?: string | null,
    schoolName?: string | null,
    companionId?: string | null
  ): void;
  getSavedStudentId(): string | null;
  getSavedGrade(): string | null;
  getSavedSchoolName(): string | null;
  getSavedCompanionId(): string | null;
  clearAuthAndSession(): void;

  getScholarshipPassMonths(studentId?: string | null): number;
  saveScholarshipPassMonths(months: number, studentId?: string | null): void;

  getScholarshipPassExpiryTimestamp(studentId?: string | null): number;
  saveScholarshipPassExpiryTimestamp(expiryMs: number, studentId?: string | null): void;

  getRedeemAttempts(): number;
  saveRedeemAttempts(count: number): void;
  getRedeemLockoutUntil(): number;
  saveRedeemLockoutUntil(timestamp: number): void;
  resetRedeemRateLimit(): void;

  getQuestProgress(studentId: string): ChapterQuest[] | null;
  saveQuestProgress(studentId: string, quests: ChapterQuest[]): void;

  getCompletedStages(studentId: string): Set<string>;
  markStageCompleted(studentId: string, chapterId: string, stageNumber: number): void;
  clearQuestProgress(studentId: string): void;

  getCachedUserStats(studentId: string): UserStats | null;
  saveCachedUserStats(studentId: string, stats: UserStats): void;
  clearCachedUserStats(studentId: string): void;

  getDailyQuestionsSolved(studentId: string | null, date: string): number;
  incrementDailyQuestionsSolved(studentId: string | null, date: string, count?: number): number;
  setDailyQuestionsSolved(studentId: string | null, date: string, count: number): void;

  isDailyGoalClaimed(studentId: string | null, date: string): boolean;
  markDailyGoalClaimed(studentId: string | null, date: string): void;

  deleteStudentAccountData(studentId: string): void;
  getOfflineMistakes(studentId: string): Array<{ questionId: string; wrongChoice: string; isConquered: boolean; created_at: string }>;
  saveOfflineMistakes(studentId: string, mistakes: Array<{ questionId: string; wrongChoice: string; isConquered: boolean; created_at: string }>): void;
}

class BrowserSessionStore implements ISessionStore {
  private memStorage: Record<string, string> = {};

  private getItem(key: string): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        // Fallback to in-memory
      }
    }
    return this.memStorage[key] ?? null;
  }

  private setItem(key: string, value: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        // Fallback to in-memory
      }
    }
    this.memStorage[key] = value;
  }

  private removeItem(key: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
        return;
      } catch {
        // Fallback to in-memory
      }
    }
    delete this.memStorage[key];
  }

  saveSession(session: InProgressSession, studentId?: string | null): void {
    const sid = studentId || session.studentId || 'default';
    this.setItem(`in_progress_session_${sid}`, JSON.stringify(session));
  }

  getSession(studentId?: string | null): InProgressSession | null {
    const sid = studentId || 'default';
    const raw = this.getItem(`in_progress_session_${sid}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  clearSession(studentId?: string | null): void {
    const sid = studentId || 'default';
    this.removeItem(`in_progress_session_${sid}`);
  }

  getLastActiveDate(studentId?: string | null): string | null {
    const sid = studentId || 'default';
    return this.getItem(`last_active_date_${sid}`);
  }

  saveLastActiveDate(date: string, studentId?: string | null): void {
    const sid = studentId || 'default';
    this.setItem(`last_active_date_${sid}`, date);
  }

  getLastActiveWeek(studentId?: string | null): number | null {
    const sid = studentId || 'default';
    const raw = this.getItem(`last_active_week_${sid}`);
    return raw ? parseInt(raw, 10) : null;
  }

  saveLastActiveWeek(week: number, studentId?: string | null): void {
    const sid = studentId || 'default';
    this.setItem(`last_active_week_${sid}`, week.toString());
  }

  isWeeklyResetPending(studentId?: string | null): boolean {
    const sid = studentId || 'default';
    return this.getItem(`weekly_reset_pending_${sid}`) === 'true';
  }

  setWeeklyResetPending(pending: boolean, studentId?: string | null): void {
    const sid = studentId || 'default';
    this.setItem(`weekly_reset_pending_${sid}`, pending ? 'true' : 'false');
  }

  getUnlockedBadges(studentId?: string | null): Set<string> {
    const sid = studentId || 'default';
    const raw = this.getItem(`unlocked_badges_${sid}`);
    if (!raw) return new Set();
    try {
      const arr = JSON.parse(raw);
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set();
    }
  }

  saveUnlockedBadges(badges: Set<string>, studentId?: string | null): void {
    const sid = studentId || 'default';
    this.setItem(`unlocked_badges_${sid}`, JSON.stringify(Array.from(badges)));
  }

  getFeaturedBadgeId(studentId?: string | null): string | null {
    const sid = studentId || 'default';
    return this.getItem(`featured_badge_${sid}`);
  }

  saveFeaturedBadgeId(badgeId: string | null, studentId?: string | null): void {
    const sid = studentId || 'default';
    if (badgeId) {
      this.setItem(`featured_badge_${sid}`, badgeId);
    } else {
      this.removeItem(`featured_badge_${sid}`);
    }
  }

  isLoggedIn(): boolean {
    return this.getItem('is_logged_in') === 'true';
  }

  getPasswordHash(studentId: string): string | null {
    return this.getItem(`pwd_hash_${studentId.trim().toLowerCase()}`);
  }

  savePasswordHash(studentId: string, hash: string): void {
    this.setItem(`pwd_hash_${studentId.trim().toLowerCase()}`, hash);
  }

  saveLoginState(
    isLoggedIn: boolean,
    studentId?: string | null,
    grade?: string | null,
    schoolName?: string | null,
    companionId?: string | null
  ): void {
    this.setItem('is_logged_in', isLoggedIn ? 'true' : 'false');
    if (studentId) this.setItem('saved_student_id', studentId);
    if (grade) this.setItem('saved_grade', grade);
    if (schoolName) this.setItem('saved_school_name', schoolName);
    if (companionId) this.setItem('saved_companion_id', companionId);
  }

  getSavedStudentId(): string | null {
    return this.getItem('saved_student_id');
  }

  getSavedGrade(): string | null {
    return this.getItem('saved_grade');
  }

  getSavedSchoolName(): string | null {
    return this.getItem('saved_school_name');
  }

  getSavedCompanionId(): string | null {
    return this.getItem('saved_companion_id');
  }

  clearAuthAndSession(): void {
    this.setItem('is_logged_in', 'false');
    this.removeItem('saved_student_id');
    this.removeItem('saved_grade');
    this.removeItem('saved_school_name');
    this.removeItem('saved_companion_id');
  }

  getScholarshipPassMonths(studentId?: string | null): number {
    const sid = studentId || 'default';
    const raw = this.getItem(`pass_months_${sid}`);
    return raw ? parseInt(raw, 10) : 0;
  }

  saveScholarshipPassMonths(months: number, studentId?: string | null): void {
    const sid = studentId || 'default';
    this.setItem(`pass_months_${sid}`, months.toString());
  }

  getScholarshipPassExpiryTimestamp(studentId?: string | null): number {
    const sid = studentId || 'default';
    const raw = this.getItem(`pass_expiry_${sid}`);
    return raw ? parseInt(raw, 10) : 0;
  }

  saveScholarshipPassExpiryTimestamp(expiryMs: number, studentId?: string | null): void {
    const sid = studentId || 'default';
    this.setItem(`pass_expiry_${sid}`, expiryMs.toString());
  }

  getRedeemAttempts(): number {
    const raw = this.getItem('redeem_attempts');
    return raw ? parseInt(raw, 10) : 0;
  }

  saveRedeemAttempts(count: number): void {
    this.setItem('redeem_attempts', count.toString());
  }

  getRedeemLockoutUntil(): number {
    const raw = this.getItem('redeem_lockout_until');
    return raw ? parseInt(raw, 10) : 0;
  }

  saveRedeemLockoutUntil(timestamp: number): void {
    this.setItem('redeem_lockout_until', timestamp.toString());
  }

  resetRedeemRateLimit(): void {
    this.removeItem('redeem_attempts');
    this.removeItem('redeem_lockout_until');
  }

  getQuestProgress(studentId: string): ChapterQuest[] | null {
    const raw = this.getItem(`quest_progress_${studentId}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  saveQuestProgress(studentId: string, quests: ChapterQuest[]): void {
    this.setItem(`quest_progress_${studentId}`, JSON.stringify(quests));
  }

  getCompletedStages(studentId: string): Set<string> {
    const raw = this.getItem(`completed_stages_${studentId}`);
    if (!raw) return new Set();
    try {
      const arr = JSON.parse(raw);
      return new Set(Array.isArray(arr) ? arr : []);
    } catch {
      return new Set();
    }
  }

  markStageCompleted(studentId: string, chapterId: string, stageNumber: number): void {
    const set = this.getCompletedStages(studentId);
    set.add(`${chapterId}:${stageNumber}`);
    this.setItem(`completed_stages_${studentId}`, JSON.stringify(Array.from(set)));
  }

  clearQuestProgress(studentId: string): void {
    this.removeItem(`quest_progress_${studentId}`);
    this.removeItem(`completed_stages_${studentId}`);
  }

  getCachedUserStats(studentId: string): UserStats | null {
    const raw = this.getItem(`cached_stats_${studentId}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  saveCachedUserStats(studentId: string, stats: UserStats): void {
    this.setItem(`cached_stats_${studentId}`, JSON.stringify(stats));
  }

  clearCachedUserStats(studentId: string): void {
    this.removeItem(`cached_stats_${studentId}`);
  }

  getDailyQuestionsSolved(studentId: string | null, date: string): number {
    const sid = studentId || 'default';
    const raw = this.getItem(`daily_q_${sid}_${date}`);
    return raw ? parseInt(raw, 10) : 0;
  }

  incrementDailyQuestionsSolved(studentId: string | null, date: string, count = 1): number {
    const current = this.getDailyQuestionsSolved(studentId, date);
    const updated = current + count;
    this.setDailyQuestionsSolved(studentId, date, updated);
    return updated;
  }

  setDailyQuestionsSolved(studentId: string | null, date: string, count: number): void {
    const sid = studentId || 'default';
    this.setItem(`daily_q_${sid}_${date}`, count.toString());
  }

  isDailyGoalClaimed(studentId: string | null, date: string): boolean {
    const sid = studentId || 'default';
    return this.getItem(`daily_goal_${sid}_${date}`) === 'true';
  }

  markDailyGoalClaimed(studentId: string | null, date: string): void {
    const sid = studentId || 'default';
    this.setItem(`daily_goal_${sid}_${date}`, 'true');
  }

  deleteStudentAccountData(studentId: string): void {
    this.clearQuestProgress(studentId);
    this.clearCachedUserStats(studentId);
    this.clearSession(studentId);
    this.removeItem(`unlocked_badges_${studentId}`);
    this.removeItem(`featured_badge_${studentId}`);
    this.removeItem(`last_active_date_${studentId}`);
    this.removeItem(`last_active_week_${studentId}`);
    this.removeItem(`pwd_hash_${studentId.trim().toLowerCase()}`);
    this.removeItem(`pass_months_${studentId}`);
    this.removeItem(`pass_expiry_${studentId}`);
    this.clearAuthAndSession();
  }

  getOfflineMistakes(studentId: string): Array<{ questionId: string; wrongChoice: string; isConquered: boolean; created_at: string }> {
    const raw = this.getItem(`abhyas_offline_mistakes_${studentId}`);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  saveOfflineMistakes(studentId: string, mistakes: Array<{ questionId: string; wrongChoice: string; isConquered: boolean; created_at: string }>): void {
    this.setItem(`abhyas_offline_mistakes_${studentId}`, JSON.stringify(mistakes));
  }
}

export const sessionStore = new BrowserSessionStore();
