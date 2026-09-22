import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Flame, 
  FlaskConical, 
  Sparkles, 
  AlertTriangle, 
  RotateCcw, 
  Award, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Zap, 
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  Droplets,
  Plus,
  Timer,
  Play,
  Shuffle,
  Compass,
  Maximize2,
  Minimize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../../utils/audio';
import { LabVessels3DCanvas } from '../ThreeDLab/LabVessels3DCanvas';
import { GAME_REAGENTS, GameReagent, ReactionOutcome, findReactionOutcome } from '../../data/gameReagentsData';

interface LabReactionGameProps {
  onBackToMain: () => void;
  onSyncXpToGlobal?: (addedXp: number) => void;
}

// 3 Different Challenge Levels
export interface GameLevel {
  id: 1 | 2 | 3;
  nameUz: string;
  badgeUz: string;
  descriptionUz: string;
  reagentIds: string[];
  color: string;
}

const GAME_LEVELS: GameLevel[] = [
  {
    id: 1,
    nameUz: '1-Daraja: Boshlang‘ich Laborant',
    badgeUz: 'ODDIY KIMYO',
    descriptionUz: 'Tanish eritmalar, suv, indikatorlar va kislota-ishqor neytrallanish reaksiyalari.',
    reagentIds: ['water_h2o', 'hcl_acid', 'naoh_alkali', 'phenolphthalein', 'table_salt'],
    color: '#06b6d4'
  },
  {
    id: 2,
    nameUz: '2-Daraja: Tajribali Tadqiqotchi',
    badgeUz: 'O‘RTA XAVF',
    descriptionUz: 'Katalizatorlar, organik birikmalar va tezkor ekzotermik reaksiyalar.',
    reagentIds: ['h2o2_conc', 'potassium_iodide', 'glycerin', 'cuso4_copper', 'zinc_granules', 'ethanol'],
    color: '#f59e0b'
  },
  {
    id: 3,
    nameUz: '3-Daraja: Ekstremal Piromuhandislik',
    badgeUz: 'O‘TA XAVFLI',
    descriptionUz: 'Shiddatli yonuvchi metallar, kuchli oksidlovchilar va pirotexnik portlashlar!',
    reagentIds: ['na_metal', 'water_h2o', 'kmno4_crystals', 'glycerin', 'h2so4_conc', 'sugar_powder', 'calcium_carbide'],
    color: '#ef4444'
  }
];

export const LabReactionGame: React.FC<LabReactionGameProps> = ({
  onBackToMain,
  onSyncXpToGlobal,
}) => {
  // 1. Initial 100 ball for every user entering the game
  const [score, setScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('labverse_reaction_game_score');
      if (saved) {
        return parseInt(saved, 10);
      }
    }
    return 100; // First time user gets 100 ball
  });

  // Current Level (1, 2 or 3)
  const [currentLevel, setCurrentLevel] = useState<1 | 2 | 3>(1);

  // Selected Reagents
  const [selectedReagentA, setSelectedReagentA] = useState<GameReagent | null>(GAME_REAGENTS[0]); // Natriy
  const [selectedReagentB, setSelectedReagentB] = useState<GameReagent | null>(GAME_REAGENTS[1]); // Suv

  // User's prediction: true = Explodes, false = Does not explode, null = not chosen yet
  const [userPrediction, setUserPrediction] = useState<boolean | null>(null);
  const userPredictionRef = useRef<boolean | null>(null);
  useEffect(() => {
    userPredictionRef.current = userPrediction;
  }, [userPrediction]);

  // Game Phases:
  // 'idle' -> 'announcing_and_pouring' -> 'observing_mixture' (15s observe) -> 'suspense_countdown' (5s question) -> 'reacting' -> 'finished'
  const [gamePhase, setGamePhase] = useState<'idle' | 'announcing_and_pouring' | 'observing_mixture' | 'suspense_countdown' | 'reacting' | 'finished'>('idle');
  const [outcome, setOutcome] = useState<ReactionOutcome | null>(null);
  const [lastScoreDelta, setLastScoreDelta] = useState<number | null>(null);
  const [isCorrectGuess, setIsCorrectGuess] = useState<boolean | null>(null);
  const [screenShake, setScreenShake] = useState<boolean>(false);

  // 15-second Observation Timer & 5-second Decision Countdown Timer
  const [observationSeconds, setObservationSeconds] = useState<number>(15);
  const observationIntervalRef = useRef<number | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(5);
  const countdownIntervalRef = useRef<number | null>(null);
  const [announcementText, setAnnouncementText] = useState<string>('');

  // Container ref for true fullscreen support
  const gameContainerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (gameContainerRef.current?.requestFullscreen) {
        gameContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Stats
  const [streak, setStreak] = useState<number>(0);
  const [totalGuesses, setTotalGuesses] = useState<number>(0);
  const [correctGuesses, setCorrectGuesses] = useState<number>(0);

  // Save score to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('labverse_reaction_game_score', score.toString());
    }
  }, [score]);

  // Filter reagents by current level
  const activeLevelConfig = GAME_LEVELS.find(l => l.id === currentLevel) || GAME_LEVELS[0];
  const levelReagents = GAME_REAGENTS.filter(r => activeLevelConfig.reagentIds.includes(r.id));

  // Voice narration is completely DISABLED per user explicit instruction ("gapririb utirmasin umuman sharty emas")
  const speakAnnouncement = useCallback((_text: string) => {
    // Intentionally left blank - no robotic voice speech narration
  }, []);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
      if (observationIntervalRef.current) {
        clearInterval(observationIntervalRef.current);
      }
    };
  }, []);

  // Phase 2 transition: Start the 5-second suspense decision countdown
  const start5SecondCountdown = useCallback((result: ReactionOutcome) => {
    if (observationIntervalRef.current) {
      clearInterval(observationIntervalRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    setGamePhase('suspense_countdown');
    setCountdownSeconds(5);
    soundFx.playCountdownBeep(750);

    let remaining = 5;
    countdownIntervalRef.current = window.setInterval(() => {
      remaining -= 1;
      setCountdownSeconds(remaining);

      if (remaining > 0) {
        soundFx.playCountdownBeep(remaining <= 2 ? 1100 : 800, remaining <= 2);
      } else {
        // 5s countdown expired without explicit click -> trigger reaction
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
        }
        triggerFinalReaction(result);
      }
    }, 1000);
  }, []);

  // Phase 1: Trigger automated mixture, pour into flask, and start 15-SECOND OBSERVATION PHASE
  const startMixingAndCountdown = useCallback((reagentA: GameReagent, reagentB: GameReagent) => {
    soundFx.playClick(650);
    const result = findReactionOutcome(reagentA.id, reagentB.id);
    setOutcome(result);
    setUserPrediction(null);
    setIsCorrectGuess(null);
    setLastScoreDelta(null);

    // Announce the mixture
    const announceMsg = `Diqqat! Kolbaga ${reagentA.nameUz} va ${reagentB.nameUz} quyilmoqda!`;
    setAnnouncementText(announceMsg);
    speakAnnouncement(announceMsg);

    // 1. Announcing & Pouring animation (1.4s)
    setGamePhase('announcing_and_pouring');
    soundFx.playPour();

    if (observationIntervalRef.current) {
      clearInterval(observationIntervalRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    // 2. After pouring finishes, start 15-SECOND OBSERVATION & INSPECTION PHASE
    setTimeout(() => {
      setGamePhase('observing_mixture');
      setObservationSeconds(15);
      soundFx.playBubble();

      let obsRemaining = 15;
      observationIntervalRef.current = window.setInterval(() => {
        obsRemaining -= 1;
        setObservationSeconds(obsRemaining);

        if (obsRemaining <= 0) {
          // 15 seconds observation finished! Automatically open 5-second decision prompt
          if (observationIntervalRef.current) {
            clearInterval(observationIntervalRef.current);
          }
          start5SecondCountdown(result);
        }
      }, 1000);

    }, 1400);
  }, [speakAnnouncement, start5SecondCountdown]);

  // Trigger the final reaction outcome (explodes or safe) after decision
  const triggerFinalReaction = (activeOutcome: ReactionOutcome, predictionOverride?: boolean) => {
    if (observationIntervalRef.current) {
      clearInterval(observationIntervalRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    setGamePhase('reacting');

    // 1. Check if reaction explodes (Real violent explosion, broken glass, smoke, screen shake)
    if (activeOutcome.willExplode) {
      soundFx.playExplosion();
      soundFx.playGlassShatter();
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 1800);
    } else {
      soundFx.playBubble();
    }

    // 2. Evaluate User's prediction (+15 or -10)
    setTimeout(() => {
      const finalPrediction = predictionOverride !== undefined ? predictionOverride : userPredictionRef.current;
      const correct = finalPrediction === activeOutcome.willExplode;

      setUserPrediction(finalPrediction);
      setIsCorrectGuess(correct);
      setTotalGuesses(t => t + 1);

      if (correct) {
        setScore(s => s + 15);
        setLastScoreDelta(15);
        setCorrectGuesses(c => c + 1);
        setStreak(st => {
          const nextStreak = st + 1;
          // Level up automatically every 2-3 streaks!
          if (nextStreak >= 2 && currentLevel === 1) {
            setCurrentLevel(2);
          } else if (nextStreak >= 4 && currentLevel === 2) {
            setCurrentLevel(3);
          }
          return nextStreak;
        });
        soundFx.playSuccess();
        confetti({
          particleCount: 90,
          spread: 85,
          origin: { y: 0.6 }
        });
        if (onSyncXpToGlobal) {
          onSyncXpToGlobal(15);
        }
      } else {
        setScore(s => Math.max(0, s - 10));
        setLastScoreDelta(-10);
        setStreak(0);
        soundFx.playFail();
      }

      setGamePhase('finished');
    }, 2200);
  };

  // Immediate guess selection by user during the 5-second suspense window
  const handleUserGuess = (guessExplodes: boolean) => {
    soundFx.playClick(guessExplodes ? 900 : 550);
    setUserPrediction(guessExplodes);
    // User made the decision, immediately trigger the reaction
    if (gamePhase === 'suspense_countdown' && outcome) {
      triggerFinalReaction(outcome, guessExplodes);
    }
  };

  // Skip the remainder of 15 seconds observation and directly ask the 5-second question
  const handleSkipObservationToQuestion = () => {
    if (outcome && gamePhase === 'observing_mixture') {
      soundFx.playClick(800);
      start5SecondCountdown(outcome);
    }
  };

  // Auto-generate random exciting mixture from current level
  const handleRandomMix = () => {
    soundFx.playClick(700);
    const available = levelReagents.length >= 2 ? levelReagents : GAME_REAGENTS;
    const idxA = Math.floor(Math.random() * available.length);
    let idxB = Math.floor(Math.random() * available.length);
    while (idxB === idxA) {
      idxB = Math.floor(Math.random() * available.length);
    }
    const rA = available[idxA];
    const rB = available[idxB];
    setSelectedReagentA(rA);
    setSelectedReagentB(rB);

    startMixingAndCountdown(rA, rB);
  };

  // Reset for next mixture round
  const handleResetForNext = () => {
    soundFx.playClick(600);
    setUserPrediction(null);
    setOutcome(null);
    setLastScoreDelta(null);
    setIsCorrectGuess(null);
    setGamePhase('idle');
    setCountdownSeconds(5);
  };

  // Manual Reagent selection
  const handleSelectReagent = (reagent: GameReagent) => {
    if (gamePhase === 'announcing_and_pouring' || gamePhase === 'suspense_countdown' || gamePhase === 'reacting') return;
    soundFx.playClick(500);

    if (!selectedReagentA) {
      setSelectedReagentA(reagent);
    } else if (!selectedReagentB && selectedReagentA.id !== reagent.id) {
      setSelectedReagentB(reagent);
    } else {
      if (selectedReagentA.id === reagent.id) {
        setSelectedReagentA(null);
      } else if (selectedReagentB?.id === reagent.id) {
        setSelectedReagentB(null);
      } else {
        setSelectedReagentB(reagent);
      }
    }
  };

  // 3D Canvas visual status mapping
  const get3DStatus = () => {
    if (gamePhase === 'announcing_and_pouring') return 'pouring';
    if (gamePhase === 'observing_mixture') return 'pouring'; // flask is filled, user is inspecting the mixture
    if (gamePhase === 'suspense_countdown') return 'pouring';
    if (gamePhase === 'reacting') return outcome?.willExplode ? 'exploded' : 'reacting';
    if (gamePhase === 'finished') return outcome?.willExplode ? 'exploded' : 'safe_completed';
    return 'idle';
  };

  const currentLiquidColor = outcome?.liquidFinalColor || 
    (selectedReagentA?.state === 'suyuq' ? selectedReagentA.colorHex :
     selectedReagentB?.state === 'suyuq' ? selectedReagentB.colorHex : 
     '#06b6d4');

  return (
    <div 
      ref={gameContainerRef}
      className={`min-h-screen w-full flex flex-col p-3 sm:p-5 lab-tile-wall relative transition-transform ${screenShake ? 'animate-shake-violent' : ''} ${isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto bg-[#030712]' : ''}`}
    >
      
      {/* Top Laboratory Fume Hood & Caution Beam */}
      <div className="w-full mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl liquid-glass-card border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Yellow/Black hazard stripe top accent */}
          <div className="absolute top-0 inset-x-0 h-1.5 hazard-stripes" />

          <div className="flex items-center gap-3 mt-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 p-0.5 shadow-[0_0_25px_rgba(245,158,11,0.4)] flex items-center justify-center">
              <Flame className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold">
                  3D KIMYO LABORATORIYASI
                </span>
                <span className="text-xs font-mono text-cyan-300">
                  {activeLevelConfig.nameUz}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-wide">
                Portlaydimi yoki Yo‘qmi? (5s To‘xtash)
              </h1>
            </div>
          </div>

          {/* Player Score & Ball Display (Starts with 100 ball) */}
          <div className="flex items-center flex-wrap gap-3">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#0f172a]/90 border border-amber-400/50 shadow-[0_0_20px_rgba(245,158,11,0.25)]">
              <Award className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Sizning Ballingiz
                </div>
                <div className="text-xl font-black text-amber-300 flex items-center gap-1.5 font-mono">
                  <span>{score}</span>
                  <span className="text-xs font-normal text-amber-400/80">ball</span>
                  {lastScoreDelta !== null && (
                    <span className={`text-xs font-bold px-1.5 py-0.2 rounded-full ${lastScoreDelta > 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40' : 'bg-rose-500/20 text-rose-400 border border-rose-400/40'}`}>
                      {lastScoreDelta > 0 ? `+${lastScoreDelta}` : lastScoreDelta}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Streak Counter */}
            <div className="px-3.5 py-2 rounded-2xl liquid-glass border border-white/10 text-center">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Seriya</div>
              <div className="text-sm font-bold text-cyan-300 flex items-center justify-center gap-1 font-mono">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>{streak} ta</span>
              </div>
            </div>

            {/* Fullscreen Toggle Button */}
            <button
              onClick={() => {
                soundFx.playClick(500);
                toggleFullscreen();
              }}
              title={isFullscreen ? "To‘liq ekrandan chiqish" : "To‘liq ekranni yoqish"}
              className="px-3 py-2 rounded-xl liquid-glass border border-cyan-500/40 text-cyan-300 hover:border-cyan-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-mono"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isFullscreen ? "Kichraytirish" : "To‘liq Ekran"}</span>
            </button>

            {/* Exit to Main Catalog */}
            <button
              onClick={() => {
                soundFx.playClick(450);
                onBackToMain();
              }}
              className="px-4 py-2 rounded-xl liquid-glass border border-slate-700 hover:border-cyan-400 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              Laboratoriyaga qaytish
            </button>
          </div>
        </div>

        {/* Level Switcher Bar */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
          {GAME_LEVELS.map((lvl) => {
            const isCurrent = currentLevel === lvl.id;
            return (
              <button
                key={lvl.id}
                onClick={() => {
                  soundFx.playClick(550);
                  setCurrentLevel(lvl.id);
                  handleResetForNext();
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isCurrent
                    ? 'bg-gradient-to-r from-cyan-900 to-blue-900 border border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'liquid-glass border-white/5 text-slate-400 hover:text-slate-200 hover:border-white/20'
                }`}
              >
                <span 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: lvl.color }} 
                />
                <span>{lvl.nameUz}</span>
                <span className="px-1.5 py-0.2 rounded bg-black/40 text-[9px] uppercase tracking-wider text-amber-300">
                  {lvl.badgeUz}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Full-Screen Game Area */}
      <div className="w-full flex-1 flex flex-col lg:flex-row gap-4 items-stretch">
        
        {/* ================= LEFT / REAGENTS SELECTION PANEL ================= */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 space-y-4">
          <div className="rounded-2xl liquid-glass-card border border-white/10 p-4 sm:p-5 shadow-xl relative overflow-hidden flex flex-col h-full">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20 mb-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                <FlaskConical className="w-4 h-4 text-cyan-400" />
                <span>Stoldagi moddalar ({activeLevelConfig.badgeUz})</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                2 ta tanlang
              </span>
            </div>

            {/* Quick Mix Action Button */}
            <button
              onClick={handleRandomMix}
              disabled={gamePhase !== 'idle' && gamePhase !== 'finished'}
              className="w-full mb-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
            >
              <Shuffle className="w-4 h-4" />
              <span>🎲 Yangi Qorishma Tayyorlash</span>
            </button>

            {/* Reagents Grid */}
            <div className="grid grid-cols-2 gap-2 max-h-[300px] lg:max-h-[360px] overflow-y-auto pr-1 flex-1">
              {levelReagents.map((reagent) => {
                const isSelectedA = selectedReagentA?.id === reagent.id;
                const isSelectedB = selectedReagentB?.id === reagent.id;
                const isSelected = isSelectedA || isSelectedB;

                return (
                  <button
                    key={reagent.id}
                    onClick={() => handleSelectReagent(reagent)}
                    disabled={gamePhase !== 'idle' && gamePhase !== 'finished'}
                    className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer disabled:opacity-50 ${
                      isSelected
                        ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.35)] scale-[1.02]'
                        : 'liquid-glass border-white/5 hover:border-cyan-400/40 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span 
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-white/30 shadow-sm"
                        style={{ backgroundColor: reagent.colorHex }}
                      />
                      {isSelectedA && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-cyan-500 text-black">
                          A
                        </span>
                      )}
                      {isSelectedB && (
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-blue-500 text-white">
                          B
                        </span>
                      )}
                    </div>

                    <div className="mt-2">
                      <div className="font-mono text-xs font-bold text-white truncate">
                        {reagent.formula}
                      </div>
                      <div className="text-[11px] text-slate-300 leading-tight line-clamp-1">
                        {reagent.nameUz}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>{reagent.state}</span>
                      <span className={`text-[9px] ${reagent.dangerLevel === 'O‘ta xavfli' ? 'text-rose-400' : reagent.dangerLevel === 'Xavfli' ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {reagent.dangerLevel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Currently Mixed Vessels Preview & Flask Checks */}
            <div className="mt-3 pt-3 border-t border-cyan-500/20 space-y-2.5">
              <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center justify-between">
                <span>Tanlangan Qorishma:</span>
                <span className="text-cyan-400 font-bold">Kolbada to‘liq</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 p-2 rounded-xl liquid-glass border border-cyan-400/30 text-center">
                  <div className="text-[10px] font-mono text-cyan-300">Modda A</div>
                  <div className="font-bold text-xs text-white truncate">
                    {selectedReagentA ? selectedReagentA.formula : 'Tanlanmagan'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {selectedReagentA?.nameUz.slice(0, 14)}
                  </div>
                </div>
                <Plus className="w-4 h-4 text-cyan-400" />
                <div className="flex-1 p-2 rounded-xl liquid-glass border border-blue-400/30 text-center">
                  <div className="text-[10px] font-mono text-blue-300">Modda B</div>
                  <div className="font-bold text-xs text-white truncate">
                    {selectedReagentB ? selectedReagentB.formula : 'Tanlanmagan'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {selectedReagentB?.nameUz.slice(0, 14)}
                  </div>
                </div>
              </div>

              {/* Start Mixing Button */}
              {gamePhase === 'idle' && (
                <button
                  disabled={!selectedReagentA || !selectedReagentB}
                  onClick={() => {
                    if (selectedReagentA && selectedReagentB) {
                      startMixingAndCountdown(selectedReagentA, selectedReagentB);
                    }
                  }}
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs tracking-wider uppercase font-mono shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.7)] transition-all cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Aralashtirish va O‘rganish (15s)</span>
                </button>
              )}

              {/* Flask graduation check status */}
              <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] font-mono space-y-1">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Asosiy idish:</span>
                  <span className="text-cyan-300 font-bold">Erlenmeyer 250ml</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Qorishma sathi:</span>
                  <span className="text-emerald-400 font-bold">230 ml (92% to‘liq to‘lgan)</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full w-[92%]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CENTER: 3D REALISTIC FULL-SCREEN WORKBENCH ================= */}
        <div className="flex-1 flex flex-col min-w-0 space-y-3">
          
          {/* 3D Lab Vessels Canvas (Expanded to fill full screen height) */}
          <div className="flex-1 w-full min-h-[560px] lg:min-h-[640px] relative flex flex-col">
            <LabVessels3DCanvas
              status={get3DStatus()}
              liquidColor={currentLiquidColor}
              liquidVolumeLevel={0.96}
              isBurnerOn={true}
              isExplosiveOutcome={outcome?.willExplode}
              reagentAName={selectedReagentA?.nameUz}
              reagentAFormula={selectedReagentA?.formula}
              reagentAColor={selectedReagentA?.colorHex}
              reagentBName={selectedReagentB?.nameUz}
              reagentBFormula={selectedReagentB?.formula}
              reagentBColor={selectedReagentB?.colorHex}
              reactionTitle={outcome?.resultTitle}
              reactionEquation={outcome?.reactionEquation}
              reactionExplanation={outcome?.scientificExplanation}
              gasProduced={outcome?.gasProduced}
              temperatureChange={outcome?.temperatureChange}
              temperature={outcome?.temperatureChange?.includes('85') ? 95 : outcome?.temperatureChange?.includes('45') ? 67 : 24}
            />

            {/* 15-SECOND OBSERVATION & INSPECTION OVERLAY BANNER */}
            {gamePhase === 'observing_mixture' && (
              <div className="absolute top-16 inset-x-3 sm:inset-x-auto sm:right-4 sm:max-w-md z-20 pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="p-4 rounded-2xl liquid-glass-card border-2 border-cyan-400/60 shadow-[0_0_40px_rgba(6,182,212,0.4)] backdrop-blur-xl space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                      <span className="font-mono font-black text-xs text-cyan-300 tracking-wider uppercase">
                        Qorishmani o‘rganish: 15 soniya
                      </span>
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/50 font-mono font-black text-cyan-200 text-sm">
                      {observationSeconds}s
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-cyan-400 to-amber-400 h-full rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${(observationSeconds / 15) * 100}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed">
                    Kolbaga <strong>{selectedReagentA?.nameUz} ({selectedReagentA?.formula})</strong> va <strong>{selectedReagentB?.nameUz} ({selectedReagentB?.formula})</strong> quyildi. Moddalarni yaxshilab ko‘rib oling! 15 soniyadan so‘ng 5 soniyalik portlash testi ochiladi!
                  </p>

                  <button
                    onClick={handleSkipObservationToQuestion}
                    className="w-full py-2 px-3 rounded-xl bg-cyan-600/40 hover:bg-cyan-500/60 border border-cyan-400/60 text-cyan-100 font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>▶ Tayyorman, hoziroq so‘rash (5s test)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Floating Quick Actions & Reaction Status Bar */}
          <div className="rounded-2xl liquid-glass-card border border-white/10 p-3 sm:p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#34d399]" />
              <span className="text-slate-300">
                {gamePhase === 'idle' && 'Moddalarni aralashtirishga tayyor. "Aralashtirish va O‘rganish" tugmasini bosing.'}
                {gamePhase === 'announcing_and_pouring' && 'Moddalar kolbaga quyilmoqda...'}
                {gamePhase === 'observing_mixture' && `Kolbaga to‘liq quyildi! 15 soniya davomida qorishmani ko‘rib oling (${observationSeconds}s qoldi)...`}
                {gamePhase === 'suspense_countdown' && '5 SONIYA STOP! O‘rtadagi ekranda javobni tanlang: Portlaydimi yoki yo‘qmi?!'}
                {gamePhase === 'reacting' && (outcome?.willExplode ? '💥 PORTLASH RO‘Y BERMOQDA! Shisha sinib parchalandi!' : '✨ Xavfsiz reaksiya yuz bermoqda!')}
                {gamePhase === 'finished' && 'Tajriba yakunlandi. Natijani ko‘ring.'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {gamePhase === 'finished' && (
                <button
                  onClick={handleRandomMix}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold font-mono text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all cursor-pointer flex items-center gap-2"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Keyingi Aralashma</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5-SECOND SUSPENSE STOP & CENTER-SCREEN PREDICTION QUESTION MODAL */}
      {/* ========================================================================= */}
      {gamePhase === 'suspense_countdown' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#0f172a] via-[#0b1120] to-[#050814] border-2 border-amber-400 shadow-[0_0_90px_rgba(245,158,11,0.6)] text-center relative overflow-hidden space-y-6">
            
            {/* Top Warning Hazard Accent */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 animate-pulse" />

            {/* Giant 5-Second Circular Pulse Clock */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-24 h-24 rounded-full bg-amber-500/20 border-4 border-amber-400 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.7)] animate-bounce">
                <span className="font-mono font-black text-5xl text-amber-300 animate-pulse">
                  {countdownSeconds}
                </span>
                <span className="absolute -bottom-2.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-black font-mono font-bold text-[10px] tracking-wider uppercase">
                  Sekund
                </span>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 border border-amber-400/50 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />
                <span>DIQQAT: QORISHMA KOLBAGACHA TO‘LDIRILDI! 5 SONIYA STOP!</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white tracking-wide">
                BU QORISHMA PORTLAYDIMI YOKI XAVFSIZMI?
              </h2>
              
              {/* Reagents pair formula showcase */}
              <div className="mt-4 p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-400/30 flex items-center justify-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: selectedReagentA?.colorHex || '#38bdf8' }} />
                  <span className="font-mono font-black text-white text-base sm:text-lg">{selectedReagentA?.formula}</span>
                  <span className="text-xs text-slate-400">({selectedReagentA?.nameUz})</span>
                </div>
                <span className="text-amber-400 font-black text-xl">+</span>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: selectedReagentB?.colorHex || '#38bdf8' }} />
                  <span className="font-mono font-black text-white text-base sm:text-lg">{selectedReagentB?.formula}</span>
                  <span className="text-xs text-slate-400">({selectedReagentB?.nameUz})</span>
                </div>
              </div>
            </div>

            {/* The Two Big Decision Buttons Right in Center Screen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Explodes Button */}
              <button
                onClick={() => handleUserGuess(true)}
                className="p-5 rounded-2xl border-2 border-rose-500 bg-gradient-to-b from-rose-950/90 to-[#2a0812] hover:border-rose-400 hover:from-rose-900 shadow-[0_0_35px_rgba(244,63,94,0.5)] hover:shadow-[0_0_55px_rgba(244,63,94,0.8)] transition-all cursor-pointer group transform hover:scale-[1.03] text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/30 border border-rose-400 flex items-center justify-center text-rose-300 group-hover:scale-110 transition-transform flex-shrink-0">
                    <Flame className="w-7 h-7 text-rose-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xl font-black text-white group-hover:text-rose-200">
                      PORTLAYDI! 💥
                    </div>
                    <div className="text-xs text-rose-300/80 font-mono mt-0.5">
                      Shisha sinadi, alanga otiladi!
                    </div>
                  </div>
                </div>
              </button>

              {/* Safe Button */}
              <button
                onClick={() => handleUserGuess(false)}
                className="p-5 rounded-2xl border-2 border-emerald-500 bg-gradient-to-b from-emerald-950/90 to-[#062016] hover:border-emerald-400 hover:from-emerald-900 shadow-[0_0_35px_rgba(16,185,129,0.5)] hover:shadow-[0_0_55px_rgba(16,185,129,0.8)] transition-all cursor-pointer group transform hover:scale-[1.03] text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/30 border border-emerald-400 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform flex-shrink-0">
                    <ShieldCheck className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xl font-black text-white group-hover:text-emerald-200">
                      PORTLAMAYDI 🧪
                    </div>
                    <div className="text-xs text-emerald-300/80 font-mono mt-0.5">
                      Xavfsiz, sokin reaksiya
                    </div>
                  </div>
                </div>
              </button>
            </div>

            <div className="text-xs font-mono text-slate-400 flex items-center justify-between px-2 pt-2 border-t border-white/10">
              <span>To‘g‘ri topilsa: <strong className="text-emerald-400 font-bold">+15 ball</strong></span>
              <span>Xato tanlansa: <strong className="text-rose-400 font-bold">-10 ball</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FINISHED SCIENTIFIC OUTCOME MODAL (CENTER OF SCREEN) */}
      {/* ========================================================================= */}
      {gamePhase === 'finished' && outcome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <div className="w-full max-w-xl p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-[#0f172a] via-[#0b1120] to-[#050814] border-2 border-cyan-400/50 shadow-[0_0_80px_rgba(6,182,212,0.5)] relative overflow-hidden space-y-5">
            
            {/* Result Status Banner */}
            <div className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-4 ${
              isCorrectGuess 
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 shadow-[0_0_35px_rgba(16,185,129,0.4)]' 
                : 'bg-rose-950/80 border-rose-500 text-rose-200 shadow-[0_0_35px_rgba(244,63,94,0.4)]'
            }`}>
              <div className="flex items-center gap-3">
                {isCorrectGuess ? (
                  <CheckCircle2 className="w-9 h-9 text-emerald-400 flex-shrink-0 animate-bounce" />
                ) : (
                  <XCircle className="w-9 h-9 text-rose-400 flex-shrink-0" />
                )}
                <div>
                  <div className="text-xs font-mono uppercase font-black tracking-wider">
                    {isCorrectGuess ? '🎉 OFARIN! SIZ TO‘G‘RI TOPDINGIZ' : '⚠️ AFSUSKI TAXMIN NOTO‘G‘RI CHIQDI'}
                  </div>
                  <div className="text-lg sm:text-xl font-black text-white mt-0.5">
                    {outcome.resultTitle}
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0 font-mono">
                <div className={`text-2xl sm:text-3xl font-black ${isCorrectGuess ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isCorrectGuess ? '+15 BALL' : '-10 BALL'}
                </div>
                <div className="text-xs text-amber-300">
                  Jami: {score} ball
                </div>
              </div>
            </div>

            {/* Reaction Details & Equation */}
            <div className="p-4 rounded-xl liquid-glass border border-white/10 space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs font-mono text-cyan-300">
                <span>KIMYOVIY TENGLAMA:</span>
                <span className="text-amber-400">Harorat: {outcome.temperatureChange}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#050813] border border-cyan-500/30 text-center font-mono text-sm font-bold text-cyan-200 tracking-wider">
                {outcome.reactionEquation}
              </div>

              <div className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">Ilmiy tushuntirish: </strong>
                {outcome.scientificExplanation}
              </div>

              {outcome.willExplode && (
                <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/40 text-[11px] text-rose-300 font-mono">
                  <strong>💥 Portlash oqibati: </strong> Erlenmeyer kolbasi sinib, borosilikat shisha parchalari va kimyoviy quyuq qorishma atrofdagi muhitga sochilib ketdi.
                </div>
              )}

              <div className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-[11px] text-amber-300 font-mono">
                <strong>🛡️ Xavfsizlik qoidasi: </strong> {outcome.safetyAdvice}
              </div>
            </div>

            {/* Next Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                onClick={handleResetForNext}
                className="px-5 py-2.5 rounded-xl liquid-glass border border-slate-700 hover:border-cyan-400 text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>O‘zim tanlayman</span>
              </button>

              <button
                onClick={handleRandomMix}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs font-mono uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all cursor-pointer flex items-center gap-2"
              >
                <Shuffle className="w-4 h-4" />
                <span>Keyingi Qorishma ➔</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Laboratory Wall Information & Reference Bar at the bottom */}
      <div className="max-w-7xl mx-auto mt-8 p-4 rounded-2xl liquid-glass border border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>KIMYOVIY XAVFSIZLIK LABORATORIYASI: 3D SHISHA SINISHI VA MODDALAR PORTLASH FIZIKASI</span>
        </div>
        <div>
          Jami urinishlar: <strong className="text-white">{totalGuesses}</strong> | To‘g‘ri topilgan: <strong className="text-emerald-400">{correctGuesses}</strong>
        </div>
      </div>
    </div>
  );
};
