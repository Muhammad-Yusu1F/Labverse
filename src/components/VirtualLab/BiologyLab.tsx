import React, { useState, useEffect, useRef } from 'react';
import { 
  Dna, 
  Search, 
  Sun, 
  RotateCcw, 
  Sparkles, 
  Check, 
  Eye, 
  Sliders, 
  Layers,
  User,
  Trees
} from 'lucide-react';
import { BiologyState, BiologyOrganelle } from '../../types';
import { BIOLOGY_ORGANELLES } from '../../data/experimentsData';
import { soundFx } from '../../utils/audio';
import { Cell3DCanvas } from '../ThreeDLab/Cell3DCanvas';

interface BiologyLabProps {
  onTelemetryUpdate: (data: {
    magnification: number;
    focus: number;
    light: number;
    organelleName: string;
    slide: string;
  }) => void;
  onStepProgress: (stepIdx: number) => void;
  onUnlockBadge?: (badgeId: string) => void;
}

export const BiologyLab: React.FC<BiologyLabProps> = ({
  onTelemetryUpdate,
  onStepProgress,
  onUnlockBadge
}) => {
  const [state, setState] = useState<BiologyState>({
    slideType: 'plant-cell',
    magnification: 400,
    lightIntensity: 85,
    focusLevel: 50, // 50 is razor-sharp
    stainingApplied: true,
    activeOrganelleId: 'nucleus',
    cellHealth: 98
  });

  // Human/animal organelle list vs Plant organelle list
  const plantOrganelles: BiologyOrganelle[] = BIOLOGY_ORGANELLES['plant-cell'] || [];
  
  const animalOrganelles: BiologyOrganelle[] = [
    {
      id: 'nucleus',
      nameUz: 'Yadro va Yadrocha',
      nameLat: 'Nucleus & Nucleolus',
      description: 'Hujayra genetik axborot markazi',
      functionUz: 'Genetik axborot (DNK) saqlash, oqsil sintezini va barcha hujayra faoliyatini boshqarish markazi.',
      color: '#8b5cf6',
      cx: 150,
      cy: 150,
      r: 34
    },
    {
      id: 'mitochondria',
      nameUz: 'Mitoxondriyalar',
      nameLat: 'Mitochondria',
      description: 'Hujayra quvvat stansiyasi',
      functionUz: 'Hujayra "elektr stansiyasi" — ATF energiyasini sintez qiladi, hujayra nafas olishini ta’minlaydi.',
      color: '#f97316',
      cx: 120,
      cy: 250,
      r: 18
    },
    {
      id: 'er',
      nameUz: 'Endoplazmatik to‘r (ER)',
      nameLat: 'Endoplasmic Reticulum',
      description: 'Ichki tashuvchi labirint tizimi',
      functionUz: 'Oqsillar va lipidlarni sintezlash hamda hujayra bo‘ylab tashish kanallari tizimi.',
      color: '#a78bfa',
      cx: 100,
      cy: 120,
      r: 22
    },
    {
      id: 'golgi',
      nameUz: 'Golji majmuasi',
      nameLat: 'Apparatus Golgiensis',
      description: 'Sekretsiya va saralash markazi',
      functionUz: 'Sintezlangan moddalarni saralash, modifikatsiya qilish va sekretor pufakchalarga joylash.',
      color: '#ec4899',
      cx: 210,
      cy: 110,
      r: 20
    },
    {
      id: 'membrane',
      nameUz: 'Plazmatik membrana',
      nameLat: 'Membrana cellularis',
      description: 'Hujayra elastik tashqi qobig‘i',
      functionUz: 'Elastik ikki qavatli lipid to‘siq, hujayraga moddalar kirishi va chiqishini tanlab o‘tkazadi.',
      color: '#38bdf8',
      cx: 160,
      cy: 160,
      r: 120
    }
  ];

  const currentOrganelles = state.slideType === 'plant-cell' ? plantOrganelles : animalOrganelles;
  const activeOrganelle = currentOrganelles.find((o) => o.id === state.activeOrganelleId) || currentOrganelles[0];

  const blurPx = Math.abs(state.focusLevel - 50) * 0.18;

  // Stabilize telemetry
  const telemetryRef = useRef(onTelemetryUpdate);
  useEffect(() => {
    telemetryRef.current = onTelemetryUpdate;
  });

  useEffect(() => {
    telemetryRef.current({
      magnification: state.magnification,
      focus: state.focusLevel,
      light: state.lightIntensity,
      organelleName: activeOrganelle.nameUz,
      slide: state.slideType === 'plant-cell' ? "O‘simlik (Piyoz po‘stlog‘i)" : 'Odam / Hayvon hujayrasi'
    });
  }, [state.magnification, state.focusLevel, state.lightIntensity, state.slideType, activeOrganelle.nameUz]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      
      {/* ================= LEFT: Slide Specimen Selection ================= */}
      <div className="lg:col-span-3 space-y-4">
        <div className="rounded-3xl liquid-glass border border-white/10 p-4 sm:p-5 backdrop-blur-2xl shadow-xl space-y-4">
          
          <div className="flex items-center gap-2 pb-3 border-b border-white/10 text-xs font-mono text-teal-300 font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4 text-teal-400" />
            <span>Biologik Namunalar</span>
          </div>

          {/* Sample Switcher: Plant vs Animal/Human */}
          <div className="space-y-2">
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              3D Hujayra turi:
            </label>
            
            {/* Plant Cell Option */}
            <button
              onClick={() => {
                soundFx.playClick(600);
                setState((s) => ({ ...s, slideType: 'plant-cell', activeOrganelleId: 'nucleus' }));
                onStepProgress(1);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${
                state.slideType === 'plant-cell'
                  ? 'bg-teal-500/25 border border-teal-400 text-teal-100 shadow-[0_0_20px_rgba(20,184,166,0.3)]'
                  : 'bg-slate-900/60 border border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300">
                  <Trees className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">O‘simlik hujayrasi</div>
                  <div className="text-[10px] text-teal-400/80 font-mono">Piyoz po‘stlog‘i</div>
                </div>
              </div>
              {state.slideType === 'plant-cell' && <Check className="w-4 h-4 text-teal-300" />}
            </button>

            {/* Human / Animal Cell Option */}
            <button
              onClick={() => {
                soundFx.playClick(650);
                setState((s) => ({ ...s, slideType: 'animal-cell' as any, activeOrganelleId: 'nucleus' }));
                onStepProgress(1);
              }}
              className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer ${
                state.slideType === ('animal-cell' as any)
                  ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-100 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900/60 border border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                  <User className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">Odam hujayrasi</div>
                  <div className="text-[10px] text-cyan-400/80 font-mono">Epiteliy to‘qimasi</div>
                </div>
              </div>
              {state.slideType === ('animal-cell' as any) && <Check className="w-4 h-4 text-cyan-300" />}
            </button>
          </div>

          {/* Objective Lenses */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Kattalashtirish (Zoom):
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([100, 400, 1000] as const).map((mag) => (
                <button
                  key={mag}
                  onClick={() => {
                    soundFx.playClick(mag);
                    setState((s) => ({ ...s, magnification: mag }));
                    onStepProgress(2);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    state.magnification === mag
                      ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-[0_0_20px_rgba(20,184,166,0.45)]'
                      : 'bg-slate-900/80 border border-white/5 text-slate-300 hover:bg-white/5'
                  }`}
                >
                  {mag}x
                </button>
              ))}
            </div>
          </div>

          {/* Staining solution toggle */}
          <div className="p-3 rounded-2xl bg-slate-900/70 border border-white/10 space-y-2">
            <div className="text-[11px] font-mono text-slate-400 uppercase">Bo‘yash eritmalar</div>
            <button
              onClick={() => {
                soundFx.playClick();
                setState((s) => ({ ...s, stainingApplied: !s.stainingApplied }));
              }}
              className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                state.stainingApplied
                  ? 'bg-purple-950/60 border border-purple-500/50 text-purple-200 shadow-sm'
                  : 'bg-slate-800/40 border border-slate-700/40 text-slate-400'
              }`}
            >
              <span>Lugol (Yod) eritmasi</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-purple-900/50">
                {state.stainingApplied ? 'BO‘YALGAN' : 'TABIIY'}
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* ================= CENTER: 3D Cellular Viewport ================= */}
      <div className="lg:col-span-6 space-y-4">
        <Cell3DCanvas
          cellType={state.slideType === ('animal-cell' as any) ? 'animal-cell' : 'plant-cell'}
          magnification={state.magnification}
          focusLevel={state.focusLevel}
          lightIntensity={state.lightIntensity}
          stainingApplied={state.stainingApplied}
          activeOrganelleId={state.activeOrganelleId || 'nucleus'}
          onSelectOrganelle={(id) => setState((s) => ({ ...s, activeOrganelleId: id }))}
        />

        {/* Selected Organelle Card */}
        <div className="p-4 rounded-3xl liquid-glass border border-teal-500/30 backdrop-blur-2xl shadow-xl flex items-center justify-between gap-4">
          <div>
            <div className="font-mono text-teal-300 font-bold flex items-center gap-2">
              <span className="text-sm">{activeOrganelle.nameUz}</span>
              <span className="text-[11px] text-slate-400 italic">({activeOrganelle.nameLat})</span>
            </div>
            <p className="text-xs text-slate-200 mt-1 leading-relaxed">{activeOrganelle.functionUz}</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-teal-950/80 text-teal-300 font-mono text-[10px] border border-teal-500/40 font-bold flex-shrink-0">
            3D ORGANOID
          </span>
        </div>
      </div>

      {/* ================= RIGHT: Focus, Light & Organelle Selector ================= */}
      <div className="lg:col-span-3 space-y-4">
        <div className="rounded-3xl liquid-glass border border-white/10 p-4 sm:p-5 backdrop-blur-2xl space-y-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-mono text-teal-300 font-bold uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-teal-400" />
              <span>Optik Boshqaruv</span>
            </div>
            <button
              onClick={() => setState((s) => ({ ...s, focusLevel: 50, lightIntensity: 85 }))}
              title="Fokusni to‘g‘rilash"
              className="p-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Focus Micro-meter screw */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Mikrometrik fokus:</span>
              <span className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded-md border ${
                blurPx <= 0.8 
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' 
                  : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
              }`}>
                {blurPx <= 0.8 ? 'TINIQ' : 'XIRA'}
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              step="1"
              value={state.focusLevel}
              onChange={(e) => {
                soundFx.playClick(400 + Number(e.target.value) * 5);
                setState((s) => ({ ...s, focusLevel: Number(e.target.value) }));
              }}
              className="w-full accent-teal-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Light intensity condenser */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Yorug‘lik kuchi:</span>
              <span className="font-mono text-teal-300 font-bold text-xs bg-teal-950/70 px-2 py-0.5 rounded-md border border-teal-500/30">
                {state.lightIntensity}%
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="100"
              step="5"
              value={state.lightIntensity}
              onChange={(e) => {
                soundFx.playClick(300 + Number(e.target.value) * 4);
                setState((s) => ({ ...s, lightIntensity: Number(e.target.value) }));
              }}
              className="w-full accent-teal-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
          </div>

          {/* Organelles clickable list */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              3D Organellalar:
            </div>
            <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto pr-1">
              {currentOrganelles.map((org) => (
                <button
                  key={org.id}
                  onClick={() => {
                    soundFx.playClick(600);
                    setState((s) => ({ ...s, activeOrganelleId: org.id }));
                  }}
                  className={`p-2.5 rounded-xl text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                    state.activeOrganelleId === org.id
                      ? 'bg-teal-500/25 border border-teal-400 text-white shadow-sm'
                      : 'bg-slate-900/60 border border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span className="font-semibold block truncate">{org.nameUz}</span>
                  {state.activeOrganelleId === org.id && (
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_6px_#2dd4bf]" />
                  )}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
