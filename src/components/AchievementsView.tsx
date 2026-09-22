import React from 'react';
import { 
  Award, 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Zap, 
  FlaskConical, 
  Dna, 
  Flame,
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { UserProgress, ExperimentId } from '../types';
import { LEVEL_DEFINITIONS } from '../data/experimentsData';
import { soundFx } from '../utils/audio';

interface AchievementsViewProps {
  userProgress: UserProgress;
  onSelectExperiment: (id: ExperimentId) => void;
  onClose?: () => void;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({
  userProgress,
  onSelectExperiment,
  onClose
}) => {
  const currentLevelInfo = LEVEL_DEFINITIONS.find((l) => l.level === userProgress.level) || LEVEL_DEFINITIONS[0];
  const nextLevelInfo = LEVEL_DEFINITIONS.find((l) => l.level === userProgress.level + 1);

  const xpInCurrentLevel = userProgress.xp - currentLevelInfo.minXp;
  const xpNeededForNext = nextLevelInfo ? nextLevelInfo.minXp - currentLevelInfo.minXp : 100;
  const levelProgressPct = nextLevelInfo 
    ? Math.min(100, Math.max(0, (xpInCurrentLevel / xpNeededForNext) * 100))
    : 100;

  return (
    <div id="achievements-dashboard" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>O‘QUVCHI ILMIY PROGRESS TIZIMI</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
          Sizning Yutuqlaringiz & Ilmiy Darajangiz
        </h2>
        <p className="text-slate-400 text-sm sm:text-base">
          Virtual laboratoriyada tajribalarni mustaqil bajaring, tajriba ballari (XP) to‘plang va yangi ilmiy unvonlarga erishing!
        </p>
      </div>

      {/* Main Level Progress Banner Card */}
      <div className="rounded-3xl liquid-glass-card border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden liquid-sheen-effect">
        {/* Specular top highlight */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
        <div className="absolute right-0 top-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Level Insignia */}
          <div className="md:col-span-4 flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-[0_0_25px_rgba(245,158,11,0.5)] mb-3">
              <div className="w-full h-full bg-[#070d1a] rounded-[14px] flex items-center justify-center">
                <Award className="w-10 h-10 text-amber-400" />
              </div>
            </div>
            <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
              Hozirgi bosqich:
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-0.5">
              Level {userProgress.level} — {userProgress.levelTitle}
            </h3>
            <div className="mt-2 text-xs text-slate-400">
              Jami to‘plangan: <strong className="text-amber-300 font-mono text-sm">{userProgress.xp} XP</strong>
            </div>
          </div>

          {/* Level Progress Bar & Next Milestone */}
          <div className="md:col-span-8 space-y-4">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-300">
                Keyingi darajagacha: {nextLevelInfo ? `${nextLevelInfo.minXp - userProgress.xp} XP qoldi` : 'Maksimal daraja!'}
              </span>
              <span className="text-cyan-400 font-bold">
                {levelProgressPct.toFixed(0)}%
              </span>
            </div>

            <div className="h-3 w-full bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-amber-400 rounded-full transition-all duration-700 shadow-[0_0_12px_#06b6d4]"
                style={{ width: `${levelProgressPct}%` }}
              />
            </div>

            {/* All Levels Tier Map */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              {LEVEL_DEFINITIONS.map((def) => {
                const isPassed = userProgress.xp >= def.minXp;
                const isCurrent = userProgress.level === def.level;

                return (
                  <div 
                    key={def.level}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isCurrent
                        ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                        : isPassed
                        ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                        : 'bg-slate-900/30 border-slate-800/40 text-slate-500'
                    }`}
                  >
                    <div className="text-[10px] font-mono text-slate-400">Level {def.level}</div>
                    <div className="text-xs font-bold truncate">{def.title}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-1">{def.minXp} XP</div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </div>

      {/* Badges Collection Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            <h3 className="text-xl font-bold font-display text-white">
              Ilmiy Nishonlar & Medallar
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {userProgress.badges.filter((b) => b.unlocked).length} / {userProgress.badges.length} ochilgan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {userProgress.badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                badge.unlocked
                  ? 'liquid-glass-card border-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.2)] text-white'
                  : 'liquid-glass border-white/5 text-slate-500 opacity-60'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-base ${
                badge.unlocked
                  ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-slate-800 text-slate-500'
              }`}>
                {badge.unlocked ? <Sparkles className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-bold text-sm truncate">{badge.title}</span>
                  {badge.unlocked && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      OCHILGAN
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {badge.description}
                </p>
                <div className="mt-2 text-[10px] font-mono text-slate-500 uppercase">
                  Fan: {badge.category}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
