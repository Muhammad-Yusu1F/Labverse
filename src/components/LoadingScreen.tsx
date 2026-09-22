import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Atom, Sparkles } from 'lucide-react';

interface LoadingScreenProps {
  onLoaded: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onLoaded }) => {
  const [progress, setProgress] = useState(0);

  const statusText =
    progress < 25
      ? 'Laboratoriya ishga tushmoqda...'
      : progress < 55
      ? 'Fizika va kimyo modullari faollashtirilmoqda...'
      : progress < 88
      ? 'Virtual uskunalar kalibrlanmoqda...'
      : 'Tayyor! Ilmiy olamga xush kelibsiz!';

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const step = Math.floor(Math.random() * 10) + 7;
        const next = prev + step;
        return next >= 100 ? 100 : next;
      });
    }, 90);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        onLoaded();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [progress, onLoaded]);

  return (
    <AnimatePresence>
      <motion.div
        id="loading-screen"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050811] text-white px-4"
      >
        {/* Ambient background glow */}
        <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />
        <div className="absolute w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-pulse-slow -top-10 -right-10" />

        <div className="relative flex flex-col items-center max-w-md w-full text-center">
          {/* Futuristic Atom Animation */}
          <div className="relative w-36 h-36 mb-8 flex items-center justify-center">
            {/* Outer orbital rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
              className="absolute inset-0 rounded-full border border-cyan-400/30 border-dashed"
              style={{ transformStyle: 'preserve-3d', transform: 'rotateX(60deg) rotateY(15deg)' }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              className="absolute inset-1 rounded-full border border-blue-400/40 border-t-cyan-400"
              style={{ transformStyle: 'preserve-3d', transform: 'rotateX(-60deg) rotateY(25deg)' }}
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
              className="absolute inset-2 rounded-full border border-emerald-400/30 border-b-cyan-300"
              style={{ transformStyle: 'preserve-3d', transform: 'rotateY(75deg)' }}
            />

            {/* Glowing core */}
            <motion.div
              animate={{ scale: [0.9, 1.15, 0.9] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.7)]"
            >
              <Atom className="w-7 h-7 text-white animate-spin" style={{ animationDuration: '4s' }} />
            </motion.div>

            {/* Floating micro electrons */}
            <motion.div
              animate={{
                x: [0, 45, 0, -45, 0],
                y: [-45, 0, 45, 0, -45],
              }}
              transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
              className="absolute w-2.5 h-2.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee]"
            />
            <motion.div
              animate={{
                x: [0, -40, 0, 40, 0],
                y: [35, 0, -35, 0, 35],
              }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'linear' }}
              className="absolute w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]"
            />
          </div>

          {/* Titles */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-widest mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Virtual Tajriba Laboratoriyasi
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-wider font-display bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
              LABVERSE
            </h1>
            <p className="text-sm sm:text-base text-slate-400 mt-2 font-medium">
              {statusText}
            </p>
          </motion.div>

          {/* Progress bar */}
          <div className="w-full mt-6 space-y-2">
            <div className="h-1.5 w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50 p-0.5">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.8)]"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between text-xs font-mono text-cyan-400/80">
              <span>INITIALIZING...</span>
              <span>{progress}%</span>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
