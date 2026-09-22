import React, { useState, useEffect } from 'react';
import { LoadingScreen } from './components/LoadingScreen';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ExperimentCatalog } from './components/ExperimentCatalog';
import { VirtualLabContainer } from './components/VirtualLab/VirtualLabContainer';
import { AchievementsView } from './components/AchievementsView';
import { AboutSection } from './components/AboutSection';
import { Footer } from './components/Footer';
import { GamificationModal } from './components/GamificationModal';
import { LabAtmosphereOverlay } from './components/LabAtmosphereOverlay';
import { LabReactionGame } from './components/LabGame/LabReactionGame';
import { ExperimentId, UserProgress, Badge } from './types';
import { INITIAL_BADGES, LEVEL_DEFINITIONS } from './data/experimentsData';

export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<string>('home');
  const [activeExperiment, setActiveExperiment] = useState<ExperimentId>('physics-circuit');

  // Gamification state
  const [userProgress, setUserProgress] = useState<UserProgress>({
    xp: 120,
    level: 1,
    levelTitle: 'Tadqiqotchi',
    nextLevelXp: 150,
    completedExperiments: [],
    badges: INITIAL_BADGES,
    streakDays: 3,
    totalTimeMinutes: 24
  });

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [lastEarnedXp, setLastEarnedXp] = useState<number>(100);
  const [lastUnlockedBadge, setLastUnlockedBadge] = useState<Badge | null>(null);

  // Recalculate level when XP changes
  const calculateLevel = (currentXp: number) => {
    let lvl = 1;
    let title = 'Tadqiqotchi';

    for (const def of LEVEL_DEFINITIONS) {
      if (currentXp >= def.minXp) {
        lvl = def.level;
        title = def.title;
      }
    }

    return { level: lvl, levelTitle: title };
  };

  const handleLoaded = React.useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleUnlockBadge = React.useCallback((badgeId: string) => {
    let newlyUnlockedBadge: Badge | null = null;
    setUserProgress((prev) => {
      const badge = prev.badges.find((b) => b.id === badgeId);
      if (badge && !badge.unlocked) {
        const updatedBadges = prev.badges.map((b) =>
          b.id === badgeId ? { ...b, unlocked: true, unlockedAt: new Date().toLocaleDateString() } : b
        );
        newlyUnlockedBadge = updatedBadges.find((b) => b.id === badgeId) || null;
        return { ...prev, badges: updatedBadges };
      }
      return prev;
    });
    if (newlyUnlockedBadge) {
      setLastUnlockedBadge(newlyUnlockedBadge);
    }
  }, []);

  const handleSyncGameXp = React.useCallback((pts: number) => {
    setUserProgress((prev) => {
      const newXp = prev.xp + pts;
      const { level, levelTitle } = calculateLevel(newXp);
      return { ...prev, xp: newXp, level, levelTitle };
    });
  }, []);

  const handleExperimentCompleted = React.useCallback((experimentId: ExperimentId, xpEarned: number = 100) => {
    setLastEarnedXp(xpEarned);

    setUserProgress((prev) => {
      const newXp = prev.xp + xpEarned;
      const { level, levelTitle } = calculateLevel(newXp);
      const isAlreadyCompleted = prev.completedExperiments.includes(experimentId);
      const completed = isAlreadyCompleted 
        ? prev.completedExperiments 
        : [...prev.completedExperiments, experimentId];

      return {
        ...prev,
        xp: newXp,
        level,
        levelTitle,
        completedExperiments: completed
      };
    });

    setModalOpen(true);
  }, []);

  const handleSelectExperiment = React.useCallback((id: ExperimentId) => {
    setActiveExperiment(id);
    setCurrentView('lab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleStartLab = React.useCallback(() => {
    setCurrentView('lab');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleExploreExperiments = React.useCallback(() => {
    setCurrentView('experiments');
    const el = document.getElementById('experiments-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black relative">
      {/* Immersive Laboratory Environment Visor & Perimeter Atmosphere */}
      <LabAtmosphereOverlay />

      {/* 1. Loading Screen with futuristic scientific animation */}
      {isLoading && <LoadingScreen onLoaded={handleLoaded} />}

      {/* 2. Top Navigation Bar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        userProgress={userProgress}
        activeExperiment={activeExperiment}
        onSelectExperiment={handleSelectExperiment}
        onOpenAchievements={() => setCurrentView('achievements')}
      />

      {/* Main Views */}
      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <HeroSection
              onStartLab={handleStartLab}
              onExploreExperiments={handleExploreExperiments}
              onSelectExperiment={handleSelectExperiment}
              onStartGame={() => {
                setCurrentView('game');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <ExperimentCatalog
              onSelectExperiment={handleSelectExperiment}
              userProgress={userProgress}
            />
            <AboutSection />
          </>
        )}

        {currentView === 'experiments' && (
          <div className="py-6">
            <ExperimentCatalog
              onSelectExperiment={handleSelectExperiment}
              userProgress={userProgress}
            />
          </div>
        )}

        {currentView === 'game' && (
          <LabReactionGame
            onBackToMain={() => setCurrentView('lab')}
            onSyncXpToGlobal={handleSyncGameXp}
          />
        )}

        {currentView === 'lab' && (
          <VirtualLabContainer
            activeExperimentId={activeExperiment}
            onSelectExperiment={setActiveExperiment}
            onBackToCatalog={() => setCurrentView('experiments')}
            onExperimentCompleted={handleExperimentCompleted}
            onUnlockBadge={handleUnlockBadge}
          />
        )}

        {currentView === 'achievements' && (
          <AchievementsView
            userProgress={userProgress}
            onSelectExperiment={handleSelectExperiment}
            onClose={() => setCurrentView('lab')}
          />
        )}

        {currentView === 'about' && (
          <div className="py-8">
            <AboutSection />
          </div>
        )}
      </main>

      {/* 3. Footer */}
      <Footer onNavigate={(v) => setCurrentView(v)} />

      {/* 4. Gamification Success Confetti Modal */}
      <GamificationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        earnedXp={lastEarnedXp}
        newLevelTitle={userProgress.levelTitle}
        unlockedBadge={lastUnlockedBadge}
        onNextExperiment={() => {
          const list: ExperimentId[] = ['physics-circuit', 'chemistry-reaction', 'biology-cell', 'earth-volcano'];
          const nextIdx = (list.indexOf(activeExperiment) + 1) % list.length;
          setActiveExperiment(list[nextIdx]);
        }}
      />
    </div>
  );
}
