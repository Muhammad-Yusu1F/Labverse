import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, 
  Activity, 
  Wind, 
  RotateCcw, 
  Sparkles, 
  AlertTriangle,
  Play, 
  Sliders,
  Box
} from 'lucide-react';
import { VolcanoState } from '../../types';
import { soundFx } from '../../utils/audio';
import { Volcano3DCanvas } from '../ThreeDLab/Volcano3DCanvas';

interface VolcanoLabProps {
  onTelemetryUpdate: (data: {
    pressure: number;
    silica: number;
    temp: number;
    eruptionType: string;
    magnitude: number;
    status: string;
  }) => void;
  onStepProgress: (stepIdx: number) => void;
  onUnlockBadge?: (badgeId: string) => void;
}

export const VolcanoLab: React.FC<VolcanoLabProps> = ({
  onTelemetryUpdate,
  onStepProgress,
  onUnlockBadge
}) => {
  const [volcano, setVolcano] = useState<VolcanoState>({
    gasPressure: 65,     // 10 to 120 bar
    silicaContent: 60,   // 45% (basaltic) to 75% (rhyolitic)
    magmaTemp: 980,      // 700 to 1200 °C
    waterVapor: 4.5,     // %
    isErupting: false,
    eruptionType: 'vulqoniy',
    ashPlumeHeightKm: 4.2,
    lavaFlowSpeedKmH: 12,
    seismicMagnitude: 3.4,
    co2EmittedTons: 1200
  });

  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const lavaCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Calculate eruption characteristics
  const calculateEruption = (pressure: number, silica: number) => {
    let type: 'tinch' | 'vulqoniy' | 'portlovchi' | 'super-plinian' = 'vulqoniy';
    let height = (pressure * 0.15) + (silica * 0.1);
    let mag = 2.0 + (pressure * 0.04);

    if (pressure < 35 && silica < 52) {
      type = 'tinch'; // effusive Hawaiian style
      height = 1.2;
      mag = 2.4;
    } else if (pressure >= 35 && pressure < 70) {
      type = 'vulqoniy'; // Strombolian/Vulcanian
      height = 6.5;
      mag = 4.1;
    } else if (pressure >= 70 && pressure < 95) {
      type = 'portlovchi'; // Sub-plinian
      height = 16.0;
      mag = 5.6;
    } else {
      type = 'super-plinian'; // Ultra-violent
      height = 28.5;
      mag = 6.8;
    }

    return { type, height: Number(height.toFixed(1)), mag: Number(mag.toFixed(1)) };
  };

  const handleStartEruption = () => {
    soundFx.playRumble();
    const { type, height, mag } = calculateEruption(volcano.gasPressure, volcano.silicaContent);

    setVolcano((v) => ({
      ...v,
      isErupting: true,
      eruptionType: type,
      ashPlumeHeightKm: height,
      seismicMagnitude: mag
    }));

    onStepProgress(1); // started
    onStepProgress(3); // observed

    if (onUnlockBadge) {
      onUnlockBadge('volcanologist');
    }
  };

  const handleStopEruption = () => {
    soundFx.playClick(450);
    setVolcano((v) => ({ ...v, isErupting: false }));
  };

  // Stabilize callbacks using refs to prevent effect dependency cycles
  const telemetryRef = useRef(onTelemetryUpdate);
  useEffect(() => {
    telemetryRef.current = onTelemetryUpdate;
  });

  // Push telemetry
  useEffect(() => {
    telemetryRef.current({
      pressure: volcano.gasPressure,
      silica: volcano.silicaContent,
      temp: volcano.magmaTemp,
      eruptionType: volcano.eruptionType,
      magnitude: volcano.seismicMagnitude,
      status: volcano.isErupting ? 'OTILMOQDA (FAOL)' : 'TINCH (MAGMA YIG‘ILMOQDA)'
    });
  }, [volcano.gasPressure, volcano.silicaContent, volcano.magmaTemp, volcano.eruptionType, volcano.seismicMagnitude, volcano.isErupting]);

  // Particle explosion canvas
  useEffect(() => {
    const canvas = lavaCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; color: string; alpha: number }[] = [];
    const colors = ['#f97316', '#ef4444', '#facc15', '#71717a', '#3f3f46'];

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (volcano.isErupting) {
        // Spawn eruption sparks and ash
        for (let i = 0; i < 4; i++) {
          particles.push({
            x: canvas.width / 2 + (Math.random() - 0.5) * 16,
            y: canvas.height * 0.42,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 6 - 2,
            r: Math.random() * 4 + 1.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: 1
          });
        }
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12; // gravity
        p.alpha -= 0.015;

        if (p.alpha <= 0 || p.y > canvas.height) {
          particles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => cancelAnimationFrame(animId);
  }, [volcano.isErupting]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* ================= LEFT: Geological Chamber Parameters ================= */}
      <div className="lg:col-span-3 space-y-4">
        <div className="rounded-2xl bg-[#090f20]/90 border border-slate-800 p-4 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4" />
            <span>Magma xarakteristikasi</span>
          </div>

          {/* Magma temp slider */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Harorat (°C):</span>
              <span className="font-mono text-amber-400 font-bold text-xs bg-amber-950/70 px-2 py-0.5 rounded border border-amber-500/30">
                {volcano.magmaTemp} °C
              </span>
            </div>
            <input
              type="range"
              min="750"
              max="1200"
              step="25"
              value={volcano.magmaTemp}
              onChange={(e) => {
                soundFx.playClick(400);
                setVolcano((v) => ({ ...v, magmaTemp: Number(e.target.value) }));
              }}
              className="w-full accent-amber-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Silica content slider */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Silikat miqdori (SiO₂):</span>
              <span className="font-mono text-amber-400 font-bold text-xs bg-amber-950/70 px-2 py-0.5 rounded border border-amber-500/30">
                {volcano.silicaContent}%
              </span>
            </div>
            <input
              type="range"
              min="45"
              max="75"
              step="1"
              value={volcano.silicaContent}
              onChange={(e) => {
                soundFx.playClick(450);
                setVolcano((v) => ({ ...v, silicaContent: Number(e.target.value) }));
              }}
              className="w-full accent-amber-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>Bazalt (Suyuq)</span>
              <span>Riolit (Qovushqoq)</span>
            </div>
          </div>

          {/* Gas pressure slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Gaz bosimi (bar):</span>
              <span className="font-mono text-rose-400 font-bold text-xs bg-rose-950/70 px-2 py-0.5 rounded border border-rose-500/30">
                {volcano.gasPressure} bar
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="115"
              step="5"
              value={volcano.gasPressure}
              onChange={(e) => {
                soundFx.playClick(500);
                setVolcano((v) => ({ ...v, gasPressure: Number(e.target.value) }));
              }}
              className="w-full accent-rose-500 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

        </div>
      </div>

      {/* ================= CENTER: Volcano Visual Simulation ================= */}
      <div className="lg:col-span-6 space-y-4">
        <div className="relative rounded-2xl bg-[#050813] border border-amber-500/30 p-4 sm:p-6 shadow-2xl backdrop-blur-xl overflow-hidden min-h-[440px] flex flex-col justify-between">
          
          {/* Top Bar */}
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
              <span className="font-mono text-xs text-amber-300 font-semibold uppercase tracking-wider">
                VULQON KRATERI VA LITOSFERA PLITALARI
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* 3D vs 2D Toggle Button */}
              <button
                onClick={() => {
                  soundFx.playClick(600);
                  setIs3DMode(!is3DMode);
                }}
                className={`px-3 py-1 rounded-md text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  is3DMode
                    ? 'bg-amber-950 border border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                    : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <Box className="w-3.5 h-3.5 text-amber-400" />
                <span>{is3DMode ? '3D VULQON: YOQILGAN' : '2D KESIM'}</span>
              </button>

              <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                Seysmik: <strong className="text-rose-400">{volcano.seismicMagnitude} ball</strong>
              </div>
            </div>
          </div>

          {/* Center Graphic Volcano Section (3D or 2D) */}
          <div className="relative z-10 my-2 flex flex-col items-center justify-center w-full">
            {is3DMode ? (
              <div className="w-full">
                <Volcano3DCanvas
                  isErupting={volcano.isErupting}
                  gasPressure={volcano.gasPressure}
                  silicaContent={volcano.silicaContent}
                  magmaTemp={volcano.magmaTemp}
                  ashHeightKm={volcano.ashPlumeHeightKm}
                  eruptionType={volcano.eruptionType}
                />
              </div>
            ) : (
              <div className="relative w-full max-w-[460px] h-64 overflow-hidden rounded-xl bg-gradient-to-b from-[#070d1e] to-[#04060d] border border-slate-800 flex items-end justify-center">
                
                {/* Particle Canvas for Ash & Lava sparks */}
                <canvas 
                  ref={lavaCanvasRef}
                  width={460}
                  height={260}
                  className="absolute inset-0 w-full h-full pointer-events-none z-20"
                />

                {/* Sky Background Ash Cloud if erupting */}
                {volcano.isErupting && (
                  <div className="absolute top-2 inset-x-8 h-28 bg-gradient-to-b from-slate-700/60 via-slate-800/40 to-transparent rounded-full blur-xl animate-pulse" />
                )}

                {/* Volcano Cone SVG */}
                <svg viewBox="0 0 460 260" className="w-full h-full z-10">
                  <defs>
                    <linearGradient id="lava-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="60%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#b91c1c" />
                    </linearGradient>
                  </defs>

                  {/* Left mountain slope */}
                  <polygon points="40,260 210,110 230,110 230,260" fill="#1e293b" />
                  {/* Right mountain slope */}
                  <polygon points="420,260 250,110 230,110 230,260" fill="#0f172a" />

                  {/* Central magma conduit (vent) */}
                  <rect x="220" y="110" width="20" height="150" fill="#450a0a" />
                  {/* Flowing magma column in conduit */}
                  <rect 
                    x="224" 
                    y={volcano.isErupting ? "110" : "150"} 
                    width="12" 
                    height={volcano.isErupting ? "150" : "110"} 
                    fill="url(#lava-grad)" 
                    className="transition-all duration-700"
                  />

                  {/* Magma Chamber at the bottom */}
                  <ellipse cx="230" cy="240" rx="70" ry="25" fill="#7f1d1d" stroke="#f97316" strokeWidth="2" />
                  <ellipse 
                    cx="230" 
                    cy="240" 
                    rx="55" 
                    ry="18" 
                    fill="url(#lava-grad)" 
                    className={volcano.isErupting ? "animate-pulse" : ""}
                  />

                  {/* Flank lava flows when erupting */}
                  {volcano.isErupting && (
                    <>
                      <path d="M 210,115 Q 180,160 150,220" stroke="#f97316" strokeWidth="4" fill="none" strokeLinecap="round" />
                      <path d="M 250,115 Q 280,170 310,230" stroke="#ef4444" strokeWidth="3" fill="none" strokeLinecap="round" />
                    </>
                  )}
                </svg>

              </div>
            )}
          </div>

          {/* Bottom Live Metrics */}
          <div className="relative z-10 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Otilish turi:</span>
              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-bold uppercase border border-amber-500/40">
                {volcano.eruptionType}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400">Kul ustuni:</span>
              <span className="text-cyan-300 font-bold">{volcano.ashPlumeHeightKm} km</span>
            </div>

            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-rose-400" />
              <span className="text-slate-400">Holat:</span>
              <span className={volcano.isErupting ? "text-rose-400 font-bold" : "text-slate-300"}>
                {volcano.isErupting ? "PORTLASH SODIR BO‘LMOQDA" : "TINCH HOLAT"}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ================= RIGHT: Erupt Controls ================= */}
      <div className="lg:col-span-3 space-y-4">
        <div className="rounded-2xl bg-[#090f20]/90 border border-slate-800 p-4 sm:p-5 backdrop-blur-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
              <Sliders className="w-4 h-4" />
              <span>Simulyatsiya boshqaruvi</span>
            </div>
          </div>

          {/* Main Action Erupt Button */}
          {volcano.isErupting ? (
            <button
              onClick={handleStopEruption}
              className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold text-sm tracking-wide border border-rose-500/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Otilishni to‘xtatish</span>
            </button>
          ) : (
            <button
              id="btn-start-eruption"
              onClick={handleStartEruption}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(249,115,22,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Flame className="w-5 h-5 fill-current" />
              <span>Vulqonni otiltirish</span>
            </button>
          )}

          {/* Pressure Alert Box */}
          <div className={`p-3 rounded-xl border text-xs space-y-1 ${
            volcano.gasPressure > 75 
              ? 'bg-rose-950/40 border-rose-500/50 text-rose-300' 
              : 'bg-slate-900/80 border-slate-800 text-slate-300'
          }`}>
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>{volcano.gasPressure > 75 ? 'KRITIK BOSIM!' : 'Oddiy litosfera bosimi'}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {volcano.gasPressure > 75 
                ? 'Gaz bosimi 75 bardan yuqori bo‘lganda kuchli portlovchi (Plinian) otilish vujudga keladi.' 
                : 'Past bosimda lava tog‘ yonbag‘irlari bo‘ylab tinch oqadi.'}
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
