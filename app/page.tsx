'use client';

import React from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { HeaderBar } from '@/components/navigation/HeaderBar';
import { BottomNavBar } from '@/components/navigation/BottomNavBar';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { HomeScreen } from '@/components/home/HomeScreen';
import { QuestHubScreen } from '@/components/quest/QuestHubScreen';
import { PracticeScreen } from '@/components/practice/PracticeScreen';
import { MistakesScreen } from '@/components/mistakes/MistakesScreen';
import { ArenaScreen } from '@/components/arena/ArenaScreen';
import { ProfileScreen } from '@/components/profile/ProfileScreen';
import { SyllabusModal } from '@/components/dialogs/SyllabusModal';
import { NotificationsModal } from '@/components/dialogs/NotificationsModal';
import { RetryModal } from '@/components/dialogs/RetryModal';
import { BadgeCelebrationDialog } from '@/components/dialogs/BadgeCelebrationDialog';

function MainAppShell() {
  const {
    // Navigation & Routes
    currentTab,
    currentRoute,
    isBattleSession,
    selectTab,
    navigateTo,
    navigateToPractice,

    // Auth
    isAuthenticated,
    logout,
    deleteAccount,

    // User & Stats
    userStats,
    setGrade,
    activateScholarshipPass,
    redeemActivationCode,
    syncAccountPassStatus,
    updateCompanion,

    // Practice & Battle
    activeQuestTitle,
    activeStageSubtitle,
    activeChapterId,
    practiceQuestions,
    isMistakeBattle,
    isArenaBattle,
    isSpeedBlitz,
    isReplayStage,
    isDojo,
    inProgressSession,
    saveInProgressSession,
    clearInProgressSession,
    completeArenaRound,
    completeActiveStage,
    getActiveStageClaimedMasteryBonus,
    addXP,
    recordMistake,
    recordWrongAnswer,
    conquerMistake,
    toggleBookmark,
    bookmarkedQuestionIds,
    onQuestionAnsweredSpeed,
    onComboStreakUpdated,

    // Mistakes
    mistakes,
    mistakesCount,
    conqueredMistakesCount,
    getWeakestUnlockedChapter,
    startMistakeBattle,
    startPolishDrill,

    // Quests
    chapterQuests,

    // Arena & Leaderboards
    podium,
    leaderboard,
    schoolPodium,
    schoolLeaderboard,
    examPodium,
    examLeaderboard,
    isLeaderboardRefreshing,
    refreshLeaderboard,
    getMostImproved,
    startArenaQualifyingRound,

    // Badges & Achievements
    newlyUnlockedBadge,
    badgeCelebrationQueueCount,
    featuredBadgeId,
    getBadges,
    setFeaturedBadge,
    dismissBadgeCelebration,

    // Modals
    isSyllabusOpen,
    openSyllabus,
    isNotificationsOpen,
    openNotifications,
    readNotificationIds,
    markNotificationRead,
    markAllNotificationsRead,
    retryQuestion,
    openRetryModal,
    closeRetryModal,
  } = useApp();

  // If student is not logged in, show AuthScreen (1:1 with Android AuthScreen)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-surface-dark flex flex-col items-center justify-center">
        <div className="w-full max-w-[480px] min-h-screen bg-surface-dark flex flex-col justify-center shadow-2xl">
          <AuthScreen />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-dark flex flex-col items-center">
      {/* Mobile-contained Application Shell (max 480px width, matching Android phone viewports) */}
      <div className="w-full max-w-[480px] min-h-screen flex flex-col bg-surface-dark relative shadow-2xl overflow-x-hidden">
        {/* Sticky Header Bar (Hidden during battle/quiz mode, matching Android MainActivity.kt line 83) */}
        {!isBattleSession && (
          <HeaderBar
            currentTab={currentTab}
            xp={userStats.xp}
            streakDays={userStats.streakDays}
            onNavigate={selectTab}
            subtitleOverride={`${userStats.grade} • ${userStats.schoolName}`}
          />
        )}

        {/* Screen Destination Switcher */}
        <main className={`flex-1 flex flex-col ${!isBattleSession ? 'pb-[72px]' : ''}`}>
          {currentRoute === 'quest_battle' ? (
            <PracticeScreen
              questions={practiceQuestions}
              questTitle={activeQuestTitle}
              stageSubtitle={activeStageSubtitle}
              isMistakeBattle={isMistakeBattle}
              isArenaBattle={isArenaBattle}
              isSpeedBlitz={isSpeedBlitz}
              isReplay={isReplayStage}
              isDojo={isDojo}
              previousClaimedMasteryBonus={getActiveStageClaimedMasteryBonus()}
              initialIndex={inProgressSession?.currentIndex ?? 0}
              initialElapsedTime={inProgressSession?.elapsedTime ?? 0}
              initialCorrectCount={inProgressSession?.correctCount ?? 0}
              initialXpEarned={inProgressSession?.totalXpEarned ?? 0}
              bookmarkedQuestionIds={Array.from(bookmarkedQuestionIds)}
              onToggleBookmark={toggleBookmark}
              onNavigate={selectTab}
              onExitRequest={() => navigateTo('home')}
              onSaveAndExit={saveInProgressSession}
              onAbandon={clearInProgressSession}
              onAddXP={addXP}
              onAddMistake={recordMistake}
              onWrongAnswer={recordWrongAnswer}
              onConquerMistake={conquerMistake}
              onCompleteArenaRound={completeArenaRound}
              onCompleteStage={completeActiveStage}
              onFastAnswer={onQuestionAnsweredSpeed}
              onComboReached={onComboStreakUpdated}
            />
          ) : currentTab === 'HOME' ? (
            <HomeScreen
              onNavigate={selectTab}
              onOpenSyllabus={() => openSyllabus(true)}
              onOpenNotifications={() => openNotifications(true)}
            />
          ) : currentTab === 'PRACTICE' ? (
            <QuestHubScreen />
          ) : currentTab === 'MISTAKES' ? (
            <MistakesScreen
              mistakes={mistakes}
              mistakesCount={mistakesCount}
              userGrade={userStats.grade}
              weakChapter={getWeakestUnlockedChapter()}
              bookmarkedQuestionIds={Array.from(bookmarkedQuestionIds)}
              onToggleBookmark={toggleBookmark}
              onNavigate={selectTab}
              onRetryQuestion={openRetryModal}
              onStartMistakeBattle={(filter) => {
                startMistakeBattle(filter);
              }}
              onStartPolishDrill={(ch) => {
                startPolishDrill(ch);
              }}
              onOpenQuestMap={() => selectTab('PRACTICE')}
            />
          ) : currentTab === 'ARENA' ? (
            <ArenaScreen
              userStats={userStats}
              podium={podium}
              leaderboard={leaderboard}
              schoolPodium={schoolPodium}
              schoolLeaderboard={schoolLeaderboard}
              examPodium={examPodium}
              examLeaderboard={examLeaderboard}
              mostImproved={getMostImproved()}
              isRefreshing={isLeaderboardRefreshing}
              onRefreshLeaderboard={refreshLeaderboard}
              onNavigate={selectTab}
              onPracticeClimb={() => {
                if (userStats.isSubscribed) {
                  startArenaQualifyingRound();
                }
              }}
              onStartArenaRound={() => {
                if (userStats.isSubscribed) {
                  startArenaQualifyingRound();
                }
              }}
              onRedeemActivationCode={redeemActivationCode}
              onSyncAccountStatus={syncAccountPassStatus}
            />
          ) : (
            <ProfileScreen
              userStats={userStats}
              badges={getBadges()}
              chapterQuests={chapterQuests}
              mistakes={mistakes}
              featuredBadgeId={featuredBadgeId}
              onFeatureBadge={setFeaturedBadge}
              onNavigate={selectTab}
              onSelectGrade={setGrade}
              onActivatePass={activateScholarshipPass}
              onRedeemActivationCode={redeemActivationCode}
              onSyncAccountStatus={syncAccountPassStatus}
              onStartWeakPractice={navigateToPractice}
              onOpenSyllabus={() => openSyllabus(true)}
              onUpdateCompanion={updateCompanion}
              onLogout={logout}
              onDeleteAccount={deleteAccount}
            />
          )}
        </main>

        {/* Bottom Floating Navigation Bar (Hidden during battle mode, matching Android) */}
        {!isBattleSession && (
          <BottomNavBar
            currentTab={currentTab}
            mistakesCount={mistakesCount}
            onSelectTab={selectTab}
          />
        )}

        {/* Global Modals matching Android MainActivity dialog hosts */}
        <SyllabusModal
          isOpen={isSyllabusOpen}
          grade={userStats.grade}
          onClose={() => openSyllabus(false)}
        />

        <NotificationsModal
          isOpen={isNotificationsOpen}
          onClose={() => openNotifications(false)}
          userStats={userStats}
          streakDays={userStats.streakDays}
          conqueredMistakesCount={conqueredMistakesCount}
          activeMistakesCount={mistakesCount}
          readNotificationIds={readNotificationIds}
          onNotificationRead={markNotificationRead}
          onMarkAllRead={markAllNotificationsRead}
        />

        <RetryModal
          question={retryQuestion}
          onClose={closeRetryModal}
          onConquer={(id) => {
            conquerMistake(id);
            closeRetryModal();
          }}
        />

        <BadgeCelebrationDialog
          badge={newlyUnlockedBadge}
          onDismiss={dismissBadgeCelebration}
          onFeatureBadge={setFeaturedBadge}
          queueCount={badgeCelebrationQueueCount}
        />
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <MainAppShell />
    </AppProvider>
  );
}
