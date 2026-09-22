import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Award, Sparkles, Check, ArrowRight, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundFx } from '../utils/audio';
import { Badge } from '../types';

interface GamificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  earnedXp: number;
  newLevelTitle?: string;
  unlockedBadge?: Badge | null;
  onNextExperiment?: () => void;
}

export const GamificationModal: React.FC<GamificationModalProps> = ({
  isOpen,
  onClose,
  earnedXp,
  newLevelTitle,
  unlockedBadge,
  onNextExperiment
}) => {
  useEffect(() => {
    if (isOpen) {
      soundFx.playSuccess();
      // Shoot festive confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ec4899']
        });
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg rounded-3xl bg-[#090f22] border-2 border-cyan-500/40 p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.4)] text-center overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-cyan-500/20 to-transparent pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Trophy Icon */}
          <div className="relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-[0_0_30px_rgba(245,158,11,0.6)] mb-5">
            <div className="w-full h-full bg-[#090e1a] rounded-[14px] flex items-center justify-center">
              <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
            </div>
          </div>

          {/* Title Banner */}
          <div className="space-y-2 mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold tracking-widest uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Muvaffaqiyatli qadam
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight bg-gradient-to-r from-white via-cyan-100 to-amber-300 bg-clip-text text-transparent">
              TAJRIBA MUVAFFAQIYATLI YAKUNLANDI!
            </h2>
            <p className="text-sm text-slate-300">
              Siz ushbu tajribadagi barcha ilmiy bosqichlarni to‘liq bajardingiz va tajriba ballariga ega bo‘ldingiz!
            </p>
          </div>

          {/* Reward Box */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {/* XP Award */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/30">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Qo‘shilgan ball:</div>
              <div className="text-2xl font-extrabold font-mono text-cyan-400 mt-0.5">
                +{earnedXp} XP
              </div>
            </div>

            {/* Level status */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/30">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Laboratoriya unvoni:</div>
              <div className="text-base font-bold text-amber-300 mt-1 truncate">
                {newLevelTitle || 'Tadqiqotchi'}
              </div>
            </div>
          </div>

          {/* Badge Unlocked Notification if available */}
          {unlockedBadge && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/50 to-indigo-950/50 border border-purple-500/40 mb-6 flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-purple-900/80 border border-purple-400/50 flex items-center justify-center flex-shrink-0 text-purple-200">
                <Award className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-mono text-purple-300 uppercase font-bold">
                  Yangi badge ochildi!
                </div>
                <div className="text-sm font-bold text-white truncate">
                  {unlockedBadge.title}
                </div>
                <div className="text-xs text-slate-400 truncate">
                  {unlockedBadge.description}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onClose}
              className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all"
            >
              Laboratoriyada qolish
            </button>

            <button
              onClick={() => {
                onClose();
                if (onNextExperiment) onNextExperiment();
              }}
              className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <span>Keyingi tajriba</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
