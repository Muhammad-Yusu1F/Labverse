import React from 'react';
import { HelpCircle, Lightbulb, BookOpen, Sparkles } from 'lucide-react';
import { ExperimentMeta } from '../../types';

interface KnowledgePanelProps {
  experiment: ExperimentMeta;
}

export const KnowledgePanel: React.FC<KnowledgePanelProps> = ({ experiment }) => {
  return (
    <div id="knowledge-panel" className="rounded-2xl liquid-glass-card border border-white/10 p-5 backdrop-blur-2xl space-y-4 overflow-hidden relative shadow-xl liquid-sheen-effect">
      {/* Top Specular Line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-cyan-500/20 text-cyan-300">
        <BookOpen className="w-5 h-5 text-cyan-400" />
        <h3 className="text-base font-display font-bold text-white">
          Ilmiy tushuncha va Xulosalar
        </h3>
      </div>

      {/* Main explanation card */}
      <div className="p-4 rounded-xl liquid-glass border border-white/5 space-y-2 shadow-inner">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-300 uppercase">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>Bu tajribada nima sodir bo‘ldi?</span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          {experiment.explanation.whatHappened}
        </p>

        <div className="pt-2 text-xs text-slate-400 border-t border-cyan-500/10 leading-relaxed">
          <strong className="text-slate-200">Ilmiy sabab: </strong>
          {experiment.explanation.scientificReason}
        </div>

        {experiment.explanation.formulaExplanation && (
          <div className="pt-2 text-[11px] font-mono text-cyan-300 bg-cyan-950/40 p-2.5 rounded-lg border border-cyan-400/30">
            {experiment.explanation.formulaExplanation}
          </div>
        )}
      </div>

      {/* Fun Fact Card */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900/60 to-transparent border border-amber-500/40 space-y-1.5 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300 uppercase">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <span>Qiziqarli fakt</span>
        </div>
        <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed italic">
          "{experiment.explanation.funFact}"
        </p>
      </div>

    </div>
  );
};
