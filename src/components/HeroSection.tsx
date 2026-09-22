import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Play, 
  FlaskConical, 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  Gauge, 
  Atom, 
  Layers, 
  ArrowRight,
  TrendingUp,
  Activity,
  Flame
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { ExperimentId } from '../types';

interface HeroSectionProps {
  onStartLab: () => void;
  onExploreExperiments: () => void;
  onSelectExperiment: (id: ExperimentId) => void;
  onStartGame?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartLab,
  onExploreExperiments,
  onSelectExperiment,
  onStartGame
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Floating background scientific particles and energy nodes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle nodes
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
      alpha: number;
    }

    const particles: Particle[] = [];
    const colors = ['#06b6d4', '#3b82f6', '#10b981', '#a855f7'];

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2.5 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.5 + 0.2
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Connect nearby particles with glowing lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.15 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw and move particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section id="hero-section" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-12 lg:py-20">
      {/* Background Interactive Particle Canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
      />

      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Hero Copy & CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            {/* Pill Tag */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass border border-cyan-400/30 text-cyan-300 text-xs font-mono tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.25)]"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>O‘ZBEKISTON MAKTABLARI UCHUN INTERAKTIV TA’LIM</span>
            </motion.div>

            {/* Main Title & Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="space-y-2"
            >
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-extrabold font-display tracking-tight text-white">
                <span className="bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                  LABVERSE
                </span>
              </h1>
              <div className="text-xl sm:text-2xl lg:text-3xl font-semibold text-cyan-300/90 font-display">
                Virtual tajriba laboratoriyasi
              </div>
            </motion.div>

            {/* Core Slogan Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-300 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed"
            >
              <span className="text-cyan-400 font-bold">"Tajriba qil. Natijani ko‘r. Bilimni o‘zing yarat."</span>
              <br className="hidden sm:block" />
              Quruq nazariya o‘rniga haqiqiy asboblar bilan xavfsiz va qiziqarli virtual tajribalar o‘tkazing!
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row flex-wrap items-center justify-center lg:justify-start gap-4 pt-2"
            >
              {/* 3D GAME Button */}
              {onStartGame && (
                <button
                  id="btn-start-game-hero"
                  onClick={() => {
                    soundFx.playClick(750);
                    onStartGame();
                  }}
                  className="w-full sm:w-auto px-6 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-base shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:shadow-[0_0_35px_rgba(245,158,11,0.8)] transition-all flex items-center justify-center gap-2.5 cursor-pointer group"
                >
                  <Flame className="w-5 h-5 text-amber-200 animate-bounce" />
                  <span>3D O‘YIN: Portlaydimi? (100 ball)</span>
                </button>
              )}

              <button
                id="btn-start-lab-hero"
                onClick={() => {
                  soundFx.playClick(650);
                  onStartLab();
                }}
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-base shadow-[0_0_25px_rgba(6,182,212,0.45)] hover:shadow-[0_0_35px_rgba(6,182,212,0.7)] transition-all flex items-center justify-center gap-3 cursor-pointer group"
              >
                <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                <span>Laboratoriyani boshlash</span>
              </button>

              <button
                id="btn-explore-experiments-hero"
                onClick={() => {
                  soundFx.playClick(500);
                  onExploreExperiments();
                }}
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700 hover:border-cyan-500/50 text-slate-200 font-semibold text-base transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Tajribalarni ko‘rish</span>
                <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>

            {/* Highlights Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 max-w-lg mx-auto lg:mx-0"
            >
              <div className="text-left">
                <div className="text-xl sm:text-2xl font-bold font-mono text-cyan-300">4 Fan</div>
                <div className="text-xs text-slate-400">Fizika, Kimyo, Bio, Tabiat</div>
              </div>
              <div className="text-left">
                <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-300">100%</div>
                <div className="text-xs text-slate-400">Interaktiv & Xavfsiz</div>
              </div>
              <div className="text-left">
                <div className="text-xl sm:text-2xl font-bold font-mono text-amber-300">Real-time</div>
                <div className="text-xs text-slate-400">Jonli formulalar va grafik</div>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Futuristic Interactive Laboratory Graphic / Showcase */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* Glowing background halo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 rounded-3xl blur-2xl transform rotate-2" />

            {/* Glass Laboratory Console Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative w-full max-w-md rounded-2xl liquid-glass-card border border-cyan-400/30 p-5 shadow-2xl backdrop-blur-2xl overflow-hidden liquid-sheen-effect"
            >
              {/* Top specular reflection line */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-300/60 to-transparent" />

              {/* Header bar of the futuristic virtual console */}
              <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                  <span className="text-[11px] font-mono text-cyan-300/80 ml-2 tracking-wider">LAB_CORE_OS_v3.2</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full liquid-glass border border-emerald-500/40 text-emerald-300 text-[10px] font-mono shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  FAOL REJIM
                </div>
              </div>

              {/* Main Visual Chamber in the Console */}
              <div className="my-4 relative h-64 rounded-xl bg-[#040714]/90 border border-cyan-500/30 flex flex-col items-center justify-center overflow-hidden p-4 shadow-inner">
                
                {/* Circuit Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:16px_16px]" />

                {/* Animated Chemical / Physical Core */}
                <div className="relative z-10 flex flex-col items-center">
                  
                  {/* Pulsing Quantum Orb */}
                  <div className="relative w-28 h-28 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
                      className="absolute inset-0 rounded-full border-2 border-cyan-500/40 border-dashed"
                    />
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                      className="absolute inset-2 rounded-full border border-blue-400/50 border-t-cyan-300"
                    />
                    
                    {/* Center glowing core */}
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.8)]">
                      <Atom className="w-8 h-8 text-white animate-spin" style={{ animationDuration: '6s' }} />
                    </div>
                  </div>

                  {/* Telemetry live badges */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="px-2 py-1 rounded bg-slate-900 border border-cyan-500/40 text-[10px] font-mono text-cyan-300">
                      ⚡ U: 12.0 V
                    </span>
                    <span className="px-2 py-1 rounded bg-slate-900 border border-emerald-500/40 text-[10px] font-mono text-emerald-300">
                      🧪 pH: 7.00
                    </span>
                    <span className="px-2 py-1 rounded bg-slate-900 border border-amber-500/40 text-[10px] font-mono text-amber-300">
                      🌋 P: 45 bar
                    </span>
                  </div>
                </div>

                {/* Simulated sine-wave / circuit trace at bottom */}
                <div className="absolute bottom-2 inset-x-4 h-6 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <div className="flex items-center gap-1 text-cyan-400">
                    <Activity className="w-3.5 h-3.5 animate-pulse" />
                    <span>SIGNAL OK</span>
                  </div>
                  <span>LATENCY: 0.4ms</span>
                </div>
              </div>

              {/* Quick Launch Carousel inside card */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                  <span>TAJRIBANI TANLANG:</span>
                  <span className="text-cyan-400 font-semibold cursor-pointer hover:underline" onClick={onExploreExperiments}>
                    Hammasi (4)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      soundFx.playClick(600);
                      onSelectExperiment('physics-circuit');
                      onStartLab();
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-cyan-500/20 hover:border-cyan-400/60 hover:bg-cyan-950/30 transition-all text-left group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-cyan-300">Elektr zanjiri</div>
                      <div className="text-[10px] text-slate-400 font-mono">Fizika</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      soundFx.playClick(600);
                      onSelectExperiment('chemistry-reaction');
                      onStartLab();
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900/90 border border-emerald-500/20 hover:border-emerald-400/60 hover:bg-emerald-950/30 transition-all text-left group cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                      <FlaskConical className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-emerald-300">Kimyo reaksiyasi</div>
                      <div className="text-[10px] text-slate-400 font-mono">Kimyo</div>
                    </div>
                  </button>
                </div>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};
