import React from 'react';
import { CheckCircle2, CircleDot, Circle, ArrowRight } from 'lucide-react';
import { ExperimentStep } from '../../types';
import { soundFx } from '../../utils/audio';

interface ExperimentStepsProps {
  steps: ExperimentStep[];
  currentStepIndex: number;
  onSelectStep: (index: number) => void;
  onNextStep: () => void;
  onCompleteExperiment: () => void;
}

export const ExperimentSteps: React.FC<ExperimentStepsProps> = ({
  steps,
  currentStepIndex,
  onSelectStep,
  onNextStep,
  onCompleteExperiment
}) => {
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <div id="experiment-steps-panel" className="rounded-2xl liquid-glass-card border border-white/10 p-4 sm:p-5 backdrop-blur-2xl overflow-hidden relative shadow-xl liquid-sheen-effect">
      {/* Top Specular Line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />
      
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-300">
            Tajriba bosqichlari (5 qadam)
          </h3>
        </div>
        <span className="text-xs font-mono px-2.5 py-0.5 rounded-full liquid-glass border border-cyan-400/30 text-cyan-300">
          {currentStepIndex + 1} / {steps.length}
        </span>
      </div>

      {/* Progress bar line */}
      <div className="relative mb-5 px-1">
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 shadow-[0_0_10px_#06b6d4]"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-2.5">
        {steps.map((step, idx) => {
          const isActive = idx === currentStepIndex;
          const isDone = idx < currentStepIndex || step.isCompleted;

          return (
            <div
              key={step.id}
              onClick={() => {
                soundFx.playClick(550);
                onSelectStep(idx);
              }}
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-950/60 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)] text-white'
                  : isDone
                  ? 'bg-slate-900/50 border-slate-800/80 text-slate-300 hover:bg-slate-900'
                  : 'bg-slate-900/30 border-slate-800/40 text-slate-500 hover:bg-slate-900/50'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isActive ? (
                  <CircleDot className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                ) : (
                  <Circle className="w-4 h-4 text-slate-600" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-mono font-bold ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>
                    {step.number}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold truncate">
                    {step.title}
                  </span>
                </div>
                {isActive && (
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed animate-in fade-in duration-200">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Step Advancement Button */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
        {isLastStep ? (
          <button
            id="btn-finish-experiment-steps"
            onClick={() => {
              soundFx.playSuccess();
              onCompleteExperiment();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Tajribani yakunlash va XP olish</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        ) : (
          <button
            id="btn-next-step"
            onClick={() => {
              soundFx.playClick(600);
              onNextStep();
            }}
            className="w-full py-2.5 px-4 rounded-xl liquid-glass-btn border border-cyan-400/40 text-cyan-200 hover:text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          >
            <span>Keyingi bosqich</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
