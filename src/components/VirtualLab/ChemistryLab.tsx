import React, { useState, useEffect, useRef } from 'react';
import { 
  FlaskConical, 
  Pipette, 
  RotateCcw, 
  Sparkles, 
  Check, 
  Plus, 
  Flame, 
  Droplets,
  Thermometer,
  Activity,
  Box,
  Layers,
  AlertTriangle
} from 'lucide-react';
import { ChemistryReagent, ChemistryState } from '../../types';
import { INITIAL_REAGENTS } from '../../data/experimentsData';
import { soundFx } from '../../utils/audio';
import { LabVessels3DCanvas } from '../ThreeDLab/LabVessels3DCanvas';

interface ChemistryLabProps {
  onTelemetryUpdate: (data: {
    ph: number;
    temperature: number;
    volume: number;
    status: string;
    reactionName: string;
  }) => void;
  onStepProgress: (stepIdx: number) => void;
  onUnlockBadge?: (badgeId: string) => void;
}

export const ChemistryLab: React.FC<ChemistryLabProps> = ({
  onTelemetryUpdate,
  onStepProgress,
  onUnlockBadge
}) => {
  const [reagents] = useState<ChemistryReagent[]>(INITIAL_REAGENTS);
  const [selectedReagent1, setSelectedReagent1] = useState<ChemistryReagent | null>(INITIAL_REAGENTS[0]); // HCl
  const [selectedReagent2, setSelectedReagent2] = useState<ChemistryReagent | null>(INITIAL_REAGENTS[1]); // NaOH
  const [reactionState, setReactionState] = useState<ChemistryState>({
    selectedReagents: [],
    currentVolume: 50,
    beakerColor: INITIAL_REAGENTS[0].color,
    ph: INITIAL_REAGENTS[0].ph,
    temperature: 22.0,
    reactionStatus: 'idle',
    reactionMessage: 'Reagentlarni tanlang va "Moddalarni aralashtirish" tugmasini bosing.',
    bubblesActive: false,
    precipitateActive: false,
    smokeActive: false,
    heatGenerated: false
  });

  const [burnerActive, setBurnerActive] = useState<boolean>(false);
  const [is3DMode, setIs3DMode] = useState<boolean>(true);
  const [screenShake, setScreenShake] = useState<boolean>(false);
  const [wrongMixtureMode, setWrongMixtureMode] = useState<boolean>(false);
  const bubbleCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync beaker color when reagent 1 is chosen in idle state
  const handleSelectReagent1 = (reagent: ChemistryReagent) => {
    setSelectedReagent1(reagent);
    if (reactionState.reactionStatus === 'idle') {
      setReactionState((prev) => ({
        ...prev,
        beakerColor: reagent.color,
        ph: reagent.ph,
        currentVolume: 50,
        reactionMessage: `1-Reagent: ${reagent.name} (${reagent.formula}) idishga quyildi.`
      }));
    }
  };

  const handleSelectReagent2 = (reagent: ChemistryReagent) => {
    setSelectedReagent2(reagent);
    if (reactionState.reactionStatus === 'idle') {
      setReactionState((prev) => ({
        ...prev,
        reactionMessage: `2-Reagent: ${reagent.name} (${reagent.formula}) tayyorlandi. "Moddalarni aralashtirish"ni bosing!`
      }));
    }
  };

  // Reaction mixing trigger: 1) Lifting & Pouring -> 2) Reaction in beaker -> 3) Outcome (Safe or Broken Glass)
  const handleMixReagents = () => {
    if (!selectedReagent1 || !selectedReagent2) return;

    // 1-BOSQICH: Moddalar ko'tarilib kolbaga quyiladi
    soundFx.playPour();
    soundFx.playClick(700);

    setReactionState((prev) => ({
      ...prev,
      reactionStatus: 'mixing',
      reactionMessage: `Idishlar ko‘tarilmoqda: ${selectedReagent1.name} va ${selectedReagent2.name} kolbaga quyilmoqda...`,
      bubblesActive: false,
      smokeActive: false,
      precipitateActive: false
    }));

    onStepProgress(1); // started

    // 2-BOSQICH: 1.4s dan keyin aralashma reaksiyaga kirishadi
    setTimeout(() => {
      soundFx.playBubble();
      setReactionState((prev) => ({
        ...prev,
        reactionStatus: 'reacting',
        currentVolume: 90,
        bubblesActive: true,
        smokeActive: true,
        reactionMessage: 'Idishda kimyoviy reaksiya boshlandi! Moddalar aralashib molekulyar o‘zgarish sodir bo‘lmoqda...'
      }));

      // 3-BOSQICH: Yana 1.8s dan keyin natija chiqadi (To'g'ri reaksiya YOKI Shisha sinishi)
      setTimeout(() => {
        const r1 = selectedReagent1.id;
        const r2 = selectedReagent2.id;
        const pair = [r1, r2].sort().join('+');

        // Check if this is an incorrect combination (Overpressure thermal shock with burner or wrong mixture toggle)
        const isWrongMixture = wrongMixtureMode || (pair === 'hcl+zn' && burnerActive);

        if (isWrongMixture) {
          // XATO ARALASHMA: IDISH PORTLAB SHISHA SINADI!
          soundFx.playExplosion();
          soundFx.playGlassShatter();
          setScreenShake(true);
          setTimeout(() => setScreenShake(false), 900);

          setReactionState({
            selectedReagents: [selectedReagent1, selectedReagent2],
            currentVolume: 0,
            beakerColor: '#ef4444',
            ph: 1.0,
            temperature: 96.0,
            reactionStatus: 'exploded',
            reactionMessage: '💥 XATO ARALASHMA! Kuchli termik bosim va xavfsizlik qoidasi buzilishi tufayli idish portladi va shisha sindi!',
            reactionEquation: pair === 'hcl+zn' && burnerActive
              ? 'Zn + 2HCl + Q (Gorelka qizishi) → Haddan tashqari gaz bosimi va idish sinishi!'
              : 'Xato kimyoviy nisbat → Haddan tashqari termik bosim va idish sinishi!',
            bubblesActive: false,
            precipitateActive: false,
            smokeActive: true,
            heatGenerated: true,
            isExplosion: true
          });
          return;
        }

        // TO'G'RI / XAVFSIZ REAKSIYALAR
        let newColor = '#38bdf8';
        let newPh = 7.0;
        let newTemp = 24.0;
        let msg = 'Neytral aralashma hosil bo‘ldi.';
        let eq = '';
        let hasBubbles = false;
        let hasPrecipitate = false;
        let hasSmoke = false;

        // 1. Acid + Base (HCl + NaOH) -> Neutralization
        if (pair === 'hcl+naoh') {
          newColor = '#93c5fd';
          newPh = 7.0;
          newTemp = 38.5; // exothermic heat
          msg = 'Reaksiya yakunlandi! Neytrallanish reaksiyasi yuz berdi. Osh tuzi (NaCl) va suv hosil bo‘ldi.';
          eq = 'HCl + NaOH → NaCl + H₂O + Q (Issiqlik)';
          hasBubbles = true;
          hasSmoke = true;
        }
        // 2. Base + Indicator (NaOH + Phenolphthalein) -> Bright Pink
        else if (pair === 'naoh+phenolphthalein') {
          newColor = '#ec4899'; // vibrant magenta
          newPh = 11.5;
          newTemp = 22.5;
          msg = 'Reaksiya yakunlandi! Fenolftalein ishqoriy muhitda kationlarini o‘zgartirib yorqin malina rangiga kirdi!';
          eq = 'NaOH (ishqor) + Indikator → Malina rangli eritma';
          hasBubbles = false;
        }
        // 3. Acid + Indicator (HCl + Phenolphthalein) -> Colorless
        else if (pair === 'hcl+phenolphthalein') {
          newColor = '#e2e8f0'; // clear
          newPh = 1.8;
          newTemp = 22.0;
          msg = 'Fenolftalein kislotali muhitda mutlaqo rangsiz qoladi.';
          eq = 'HCl (kislota) + Indikator → Rangsiz eritma';
        }
        // 4. Acid + Metal (HCl + Zn) -> Hydrogen gas evolution
        else if (pair === 'hcl+zn') {
          newColor = '#cbd5e1';
          newPh = 3.5;
          newTemp = 48.0;
          msg = 'Reaksiya yakunlandi! Shiddatli reaksiya: Rux metali kislota bilan ta’sirlashib, vodorod gazi (H₂↑) pufakchalari otilib chiqdi!';
          eq = 'Zn + 2HCl → ZnCl₂ + H₂ ↑ (Gaz ajralishi)';
          hasBubbles = true;
          hasSmoke = true;
          soundFx.playBubble();
        }
        // 5. Copper sulfate + Base (CuSO4 + NaOH) -> Blue precipitate
        else if (pair === 'cuso4+naoh') {
          newColor = '#0284c7'; // rich royal blue
          newPh = 9.2;
          newTemp = 26.0;
          msg = 'Reaksiya yakunlandi! Moviy tusli cho‘kma: Mis (II) gidroksid Cu(OH)₂ cho‘kmaga tushdi!';
          eq = 'CuSO₄ + 2NaOH → Cu(OH)₂ ↓ (ko‘k cho‘kma) + Na₂SO₄';
          hasPrecipitate = true;
        }
        // 6. Acid + Baking Soda (HCl + NaHCO3) -> Effervescence
        else if (pair === 'hcl+nahco3') {
          newColor = '#e0f2fe';
          newPh = 6.5;
          newTemp = 27.0;
          msg = 'Reaksiya yakunlandi! Kuchli qaynash: Karbonat angidrid (CO₂↑) pufakchalari ajraldi!';
          eq = 'HCl + NaHCO₃ → NaCl + H₂O + CO₂ ↑ (Gaz)';
          hasBubbles = true;
          hasSmoke = true;
          soundFx.playBubble();
        }
        // 7. Water dilutions
        else if (r1 === 'h2o' || r2 === 'h2o') {
          const other = r1 === 'h2o' ? selectedReagent2 : selectedReagent1;
          newColor = other.color;
          newPh = Number(((other.ph + 7) / 2).toFixed(1));
          newTemp = 22.0;
          msg = `Suv bilan suyultirish: ${other.name} konsentratsiyasi kamaydi.`;
          eq = `${other.formula} + H₂O → Suyultirilgan eritma`;
        } else {
          newColor = '#38bdf8';
          newPh = Number(((selectedReagent1.ph + selectedReagent2.ph) / 2).toFixed(1));
          newTemp = 25.0;
          msg = 'Reaksiya yakunlandi! Moddalar aralashdi va ionlar almashinuvi sodir bo‘ldi.';
          eq = `${selectedReagent1.formula} + ${selectedReagent2.formula}`;
        }

        soundFx.playSuccess();

        setReactionState({
          selectedReagents: [selectedReagent1, selectedReagent2],
          currentVolume: 90,
          beakerColor: newColor,
          ph: newPh,
          temperature: newTemp + (burnerActive ? 25 : 0),
          reactionStatus: 'completed',
          reactionMessage: msg,
          reactionEquation: eq,
          bubblesActive: hasBubbles,
          precipitateActive: hasPrecipitate,
          smokeActive: hasSmoke,
          heatGenerated: newTemp > 30,
          isExplosion: false
        });

        onStepProgress(3); // observed
        if (onUnlockBadge) {
          onUnlockBadge('alchemist');
        }
      }, 1800);
    }, 1400);
  };

  const resetBeaker = () => {
    soundFx.playClick(500);
    setReactionState({
      selectedReagents: [],
      currentVolume: 50,
      beakerColor: selectedReagent1 ? selectedReagent1.color : INITIAL_REAGENTS[0].color,
      ph: selectedReagent1 ? selectedReagent1.ph : 7.0,
      temperature: 22.0,
      reactionStatus: 'idle',
      reactionMessage: 'Idish tozalandi. Reagentlarni tanlang va "Moddalarni aralashtirish"ni bosing.',
      bubblesActive: false,
      precipitateActive: false,
      smokeActive: false,
      heatGenerated: false
    });
  };

  const toggleBurner = () => {
    soundFx.playClick(burnerActive ? 400 : 700);
    setBurnerActive(!burnerActive);
    setReactionState((prev) => ({
      ...prev,
      temperature: burnerActive ? Math.max(22, prev.temperature - 25) : prev.temperature + 25
    }));
  };

  // Stabilize callbacks using refs to prevent effect dependency cycles
  const telemetryRef = useRef(onTelemetryUpdate);
  useEffect(() => {
    telemetryRef.current = onTelemetryUpdate;
  });

  // Push telemetry up to Live Results
  useEffect(() => {
    telemetryRef.current({
      ph: reactionState.ph,
      temperature: reactionState.temperature,
      volume: reactionState.currentVolume,
      status: reactionState.reactionStatus === 'completed' ? 'Reaksiya tugadi' : reactionState.reactionStatus === 'mixing' ? 'Aralashmoqda...' : 'Kutilmoqda',
      reactionName: reactionState.reactionEquation || 'Oddiy eritmalar'
    });
  }, [reactionState.ph, reactionState.temperature, reactionState.currentVolume, reactionState.reactionStatus, reactionState.reactionEquation]);

  // Bubble canvas animation
  useEffect(() => {
    const canvas = bubbleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let bubbles: { x: number; y: number; r: number; vy: number; alpha: number }[] = [];

    const initBubbles = () => {
      bubbles = [];
      for (let i = 0; i < 20; i++) {
        bubbles.push({
          x: Math.random() * canvas.width,
          y: canvas.height + Math.random() * 40,
          r: Math.random() * 3.5 + 1.5,
          vy: Math.random() * 1.5 + 1,
          alpha: Math.random() * 0.7 + 0.3
        });
      }
    };

    initBubbles();

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (reactionState.bubblesActive || burnerActive) {
        for (const b of bubbles) {
          b.y -= b.vy;
          if (b.y < 20) {
            b.y = canvas.height + 10;
            b.x = Math.random() * canvas.width;
          }

          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${b.alpha})`;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 4;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => cancelAnimationFrame(animId);
  }, [reactionState.bubblesActive, burnerActive]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* ================= LEFT: Chemical Reagents Shelves ================= */}
      <div className="lg:col-span-3 space-y-4">
        <div className="rounded-2xl bg-[#090f20]/90 border border-slate-800 p-4 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
            <FlaskConical className="w-4 h-4" />
            <span>Reagentlar javoni</span>
          </div>

          <p className="text-xs text-slate-400 mb-3">
            Sinov stakaniga quyish uchun 2 ta moddani tanlang:
          </p>

          {/* Reagent 1 selection */}
          <div className="space-y-1 mb-4">
            <label className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
              1-Reagent (A):
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {reagents.map((r) => {
                const isSelected = selectedReagent1?.id === r.id;
                return (
                  <button
                    key={`r1-${r.id}`}
                    onClick={() => {
                      soundFx.playClick(600);
                      handleSelectReagent1(r);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-200'
                        : 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: r.color }}
                      />
                      <span className="font-semibold">{r.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">{r.formula}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reagent 2 selection */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
              2-Reagent (B):
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {reagents.map((r) => {
                const isSelected = selectedReagent2?.id === r.id;
                return (
                  <button
                    key={`r2-${r.id}`}
                    onClick={() => {
                      soundFx.playClick(600);
                      handleSelectReagent2(r);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/60 border border-cyan-500/50 text-cyan-200'
                        : 'bg-slate-900/60 border border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: r.color }}
                      />
                      <span className="font-semibold">{r.name}</span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-400">{r.formula}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* ================= CENTER: Interactive Reaction Chamber ================= */}
      <div className="lg:col-span-6 space-y-4">
        <div className={`relative rounded-2xl bg-[#050813] border p-4 sm:p-6 shadow-2xl backdrop-blur-xl overflow-hidden min-h-[440px] flex flex-col justify-between transition-all duration-300 ${
          screenShake 
            ? 'border-rose-500 shadow-[0_0_60px_rgba(239,68,68,0.7)] ring-4 ring-rose-500/30' 
            : reactionState.reactionStatus === 'exploded'
              ? 'border-rose-700/60 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
              : 'border-emerald-500/30'
        }`}>
          
          {/* Blueprint Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#064e3b15_1px,transparent_1px),linear-gradient(to_bottom,#064e3b15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* Top Bar inside Chamber */}
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                reactionState.reactionStatus === 'exploded'
                  ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                  : 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
              }`} />
              <span className="font-mono text-xs text-emerald-300 font-semibold uppercase tracking-wider">
                {reactionState.reactionStatus === 'exploded' ? 'XAVFSIZLIK OGOHLANTIRISHI' : 'KIMYOVIY REAKSIYA STATSIYASI'}
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
                    ? 'bg-cyan-950 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <Box className="w-3.5 h-3.5 text-cyan-400" />
                <span>{is3DMode ? '3D IDISHLAR: YOQILGAN' : '2D SXEMA'}</span>
              </button>

              <button
                onClick={toggleBurner}
                className={`px-3 py-1 rounded-md text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  burnerActive
                    ? 'bg-rose-950 border border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                    : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <Flame className={`w-3.5 h-3.5 ${burnerActive ? 'text-amber-400 animate-bounce' : ''}`} />
                <span>Gorelka: {burnerActive ? 'QIZDIRILMOQDA' : 'O‘CHIQ'}</span>
              </button>
            </div>
          </div>

          {/* Central Chemical Beaker & Test Tubes Display (3D or 2D) */}
          <div className="relative z-10 my-4 flex flex-col items-center justify-center">
            
            {is3DMode ? (
              <div className="w-full">
                <LabVessels3DCanvas
                  status={
                    reactionState.reactionStatus === 'mixing'
                      ? 'pouring'
                      : reactionState.reactionStatus === 'reacting'
                        ? 'reacting' 
                        : reactionState.reactionStatus === 'exploded'
                          ? 'exploded'
                          : reactionState.reactionStatus === 'completed' 
                            ? 'safe_completed' 
                            : 'idle'
                  }
                  liquidColor={reactionState.beakerColor}
                  liquidVolumeLevel={reactionState.currentVolume > 0 ? (reactionState.currentVolume / 100) : 0.4}
                  isBurnerOn={burnerActive}
                  isExplosiveOutcome={reactionState.reactionStatus === 'exploded'}
                  reagentAName={selectedReagent1?.name}
                  reagentBName={selectedReagent2?.name}
                  reagentAFormula={selectedReagent1?.formula}
                  reagentBFormula={selectedReagent2?.formula}
                  reagentAColor={selectedReagent1?.color || '#38bdf8'}
                  reagentBColor={selectedReagent2?.color || '#818cf8'}
                  hasSmoke={reactionState.smokeActive}
                  hasBubbles={reactionState.bubblesActive}
                  hasPrecipitate={reactionState.precipitateActive}
                  temperature={reactionState.temperature}
                />
              </div>
            ) : (
              /* 2D Schematic Beaker Vessel with Fluid */
              <div className="relative w-44 h-56 flex flex-col items-center justify-end">
                
                {reactionState.reactionStatus === 'exploded' ? (
                  /* 2D Broken Glass Container representation */
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 rounded-2xl border-2 border-dashed border-rose-500/80 bg-rose-950/40">
                    <AlertTriangle className="w-10 h-10 text-rose-400 animate-bounce mb-2" />
                    <span className="font-bold text-xs text-rose-200">IDISH SINDI!</span>
                    <span className="text-[10px] text-rose-300/80 mt-1">Haddan tashqari bosim va shisha darz ketishi</span>
                  </div>
                ) : (
                  /* Normal Glass Beaker */
                  <div className="absolute inset-0 rounded-b-3xl border-x-4 border-b-4 border-t-2 border-cyan-300/40 bg-slate-900/30 backdrop-blur-sm overflow-hidden flex flex-col justify-end">
                    
                    {/* Measuring marks on glass */}
                    <div className="absolute top-8 left-2 space-y-4 font-mono text-[9px] text-slate-400 select-none">
                      <div>— 100 ml</div>
                      <div>— 75 ml</div>
                      <div>— 50 ml</div>
                      <div>— 25 ml</div>
                    </div>

                    {/* Animated Liquid Filling */}
                    <div 
                      className="w-full rounded-b-[20px] transition-all duration-700 relative overflow-hidden flex items-center justify-center"
                      style={{
                        height: reactionState.currentVolume > 0 ? '65%' : '15%',
                        backgroundColor: reactionState.beakerColor,
                        boxShadow: `inset 0 0 20px ${reactionState.beakerColor}`
                      }}
                    >
                      {/* Canvas for rising chemical bubbles */}
                      <canvas 
                        ref={bubbleCanvasRef} 
                        width={170} 
                        height={150} 
                        className="absolute inset-0 w-full h-full pointer-events-none"
                      />

                      {/* Liquid surface wave ripple */}
                      <div className="absolute top-0 inset-x-0 h-2 bg-white/20 blur-[1px] animate-pulse" />

                      {/* Precipitate settling at bottom */}
                      {reactionState.precipitateActive && (
                        <div className="absolute bottom-0 inset-x-0 h-4 bg-blue-600/80 rounded-b-[20px] shadow-[0_0_10px_#2563eb]" />
                      )}
                    </div>

                  </div>
                )}

                {/* Bunsen Burner Fire Flame below beaker */}
                {burnerActive && (
                  <div className="absolute -bottom-8 flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-amber-400/80 blur-sm animate-ping" />
                    <div className="w-4 h-6 rounded-t-full bg-gradient-to-t from-blue-600 via-amber-400 to-yellow-200 shadow-[0_0_20px_#f59e0b]" />
                    <div className="w-12 h-2 rounded bg-slate-700" />
                  </div>
                )}
              </div>
            )}

            {/* Reaction Banner */}
            <div className="mt-8 text-center max-w-md">
              <div className={`text-sm font-bold mb-1 ${
                reactionState.reactionStatus === 'exploded' ? 'text-rose-400' : 'text-white'
              }`}>
                {reactionState.reactionMessage}
              </div>
              {reactionState.reactionEquation && (
                <div className={`inline-block mt-2 px-3 py-1 rounded-lg font-mono text-xs ${
                  reactionState.reactionStatus === 'exploded'
                    ? 'bg-rose-950/80 border border-rose-500/50 text-rose-300'
                    : 'bg-slate-900 border border-emerald-500/40 text-emerald-300'
                }`}>
                  {reactionState.reactionEquation}
                </div>
              )}

              {/* Special Clean / Replace Broken Flask Button if exploded */}
              {reactionState.reactionStatus === 'exploded' && (
                <div className="mt-3">
                  <button
                    onClick={resetBeaker}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Yangi toza idish qo‘yish (Tozalash)</span>
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Bottom Live Metrics */}
          <div className="relative z-10 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-rose-400" />
              <span className="text-slate-400">Harorat:</span>
              <span className="text-rose-300 font-bold">+{reactionState.temperature.toFixed(1)} °C</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">pH ko‘rsatkich:</span>
              <span className={`px-2 py-0.5 rounded font-bold ${
                reactionState.ph < 6 ? 'bg-rose-950 text-rose-300 border border-rose-500/40' :
                reactionState.ph > 8 ? 'bg-blue-950 text-blue-300 border border-blue-500/40' :
                'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
              }`}>
                pH {reactionState.ph.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span className="text-slate-400">Hajm:</span>
              <span className="text-cyan-300 font-bold">{reactionState.currentVolume || 0} ml</span>
            </div>
          </div>

        </div>
      </div>

      {/* ================= RIGHT: Controls & Mix Action ================= */}
      <div className="lg:col-span-3 space-y-4">
        <div className="rounded-2xl bg-[#090f20]/90 border border-slate-800 p-4 sm:p-5 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
              <Activity className="w-4 h-4" />
              <span>Boshqaruv</span>
            </div>
            <button
              onClick={resetBeaker}
              title="Stakanni tozalash"
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Selected reagents preview card */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Aralashtiriluvchi moddalar:</div>
            
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-300">Modda 1:</span>
              <span className="font-bold text-emerald-300">{selectedReagent1?.name}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-300">Modda 2:</span>
              <span className="font-bold text-cyan-300">{selectedReagent2?.name}</span>
            </div>
          </div>

          {/* Optional: Wrong Mixture Test Mode Toggle */}
          <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-rose-300">Xato aralashma testi</span>
              <span className="text-[10px] text-slate-400">Idish sinishi animatsiyasini sinash</span>
            </div>
            <button
              type="button"
              onClick={() => {
                soundFx.playClick(wrongMixtureMode ? 400 : 700);
                setWrongMixtureMode(!wrongMixtureMode);
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer ${
                wrongMixtureMode 
                  ? 'bg-rose-600 text-white shadow-[0_0_10px_rgba(244,63,94,0.5)]' 
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {wrongMixtureMode ? 'YOQILGAN' : 'O‘CHIQ'}
            </button>
          </div>

          {/* Main Action Mix Button */}
          <button
            id="btn-mix-reagents"
            onClick={handleMixReagents}
            disabled={reactionState.reactionStatus === 'mixing' || reactionState.reactionStatus === 'reacting'}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
              reactionState.reactionStatus === 'exploded'
                ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                : 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
            }`}
          >
            <Pipette className="w-4 h-4" />
            <span>
              {reactionState.reactionStatus === 'mixing'
                ? 'Idishlar ko‘tarilib quyilmoqda...'
                : reactionState.reactionStatus === 'reacting'
                  ? 'Reaksiya kechmoqda...'
                  : reactionState.reactionStatus === 'exploded'
                    ? 'Qayta aralashtirish'
                    : 'Moddalarni aralashtirish'}
            </span>
          </button>

          {/* Reset Beaker button */}
          <button
            onClick={resetBeaker}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Yangi idish qo‘yish / Tozalash</span>
          </button>

          {/* Chemical reaction hints / recommendations */}
          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20 space-y-1.5 text-xs text-slate-300">
            <div className="font-mono text-[10px] text-cyan-400 uppercase font-bold">Tavsiya etilgan tajribalar:</div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
              <li><strong className="text-slate-200">HCl + NaOH:</strong> Neytrallanish va qizish</li>
              <li><strong className="text-slate-200">NaOH + Fenolftalein:</strong> Malina rangi</li>
              <li><strong className="text-slate-200">HCl + Zn:</strong> Vodorod gazi ajralishi</li>
              <li><strong className="text-slate-200">HCl + Osh sodasi:</strong> Gaz qaynashi</li>
            </ul>
          </div>

        </div>
      </div>

    </div>
  );
};
