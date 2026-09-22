import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  FlaskConical, 
  Dna, 
  Flame, 
  Clock, 
  ArrowRight, 
  BarChart2, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { EXPERIMENTS } from '../data/experimentsData';
import { ExperimentId, UserProgress } from '../types';
import { soundFx } from '../utils/audio';

interface ExperimentCatalogProps {
  onSelectExperiment: (id: ExperimentId) => void;
  userProgress: UserProgress;
}

export const ExperimentCatalog: React.FC<ExperimentCatalogProps> = ({
  onSelectExperiment,
  userProgress
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return Zap;
      case 'FlaskConical':
        return FlaskConical;
      case 'Dna':
        return Dna;
      case 'Flame':
        return Flame;
      default:
        return Sparkles;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'Boshlang‘ich':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30';
      case 'O‘rta':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/30';
      case 'Murakkab':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <section id="experiments-section" className="py-16 sm:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>INTERAKTIV SIMULATSIYALAR KATALOGI</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display tracking-tight text-white">
            Virtual laboratoriyaga xush kelibsiz
          </h2>

          <p className="text-base sm:text-lg text-slate-400">
            O‘zingiz qiziqqan fanni tanlang va real tajriba o‘tkazishni boshlang. 
            Har bir tajriba nazariy formulalarni jonli grafiklar va vizual oqim bilan bog‘laydi.
          </p>
        </div>

        {/* Experiment Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {EXPERIMENTS.map((exp, index) => {
            const Icon = getIcon(exp.iconName);
            const isCompleted = userProgress.completedExperiments.includes(exp.id);

            return (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="group relative rounded-2xl liquid-glass-card border border-white/10 hover:border-cyan-400/60 p-6 sm:p-7 backdrop-blur-2xl shadow-xl hover:shadow-[0_0_35px_rgba(6,182,212,0.3)] transition-all duration-300 flex flex-col justify-between overflow-hidden liquid-sheen-effect"
              >
                {/* Specular Top Line */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

                {/* Background soft glow on hover */}
                <div 
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at top right, ${exp.glowColor}, transparent 70%)`
                  }}
                />

                <div className="relative z-10 space-y-4">
                  {/* Top Bar: Subject, Difficulty, Completed tag */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold tracking-wider uppercase px-2.5 py-1 rounded bg-slate-800/90 text-slate-300 border border-slate-700">
                        {exp.subject}
                      </span>
                      <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${getDifficultyBadge(exp.difficulty)}`}>
                        {exp.difficulty}
                      </span>
                    </div>

                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Bajarildi
                      </span>
                    )}
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-4">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 shadow-lg"
                      style={{
                        background: exp.gradient,
                        boxShadow: `0 0 20px ${exp.glowColor}`
                      }}
                    >
                      <Icon className="w-7 h-7 text-slate-950" />
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold font-display text-white group-hover:text-cyan-300 transition-colors">
                        {exp.title}
                      </h3>
                      <p className="text-xs text-cyan-400/90 font-mono mt-0.5">
                        {exp.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {exp.description}
                  </p>

                  {/* Equipment / Tools Preview */}
                  <div className="pt-2">
                    <div className="text-[11px] font-mono text-slate-400 mb-2">
                      Asosiy uskunalar:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {exp.tools.slice(0, 3).map((tool, idx) => (
                        <span 
                          key={idx}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-800 text-slate-300 font-medium"
                        >
                          {tool}
                        </span>
                      ))}
                      {exp.tools.length > 3 && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900/90 border border-slate-800 text-cyan-400 font-mono">
                          +{exp.tools.length - 3} ta
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="relative z-10 pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{exp.duration}</span>
                  </div>

                  <button
                    id={`btn-start-${exp.id}`}
                    onClick={() => {
                      soundFx.playClick(650);
                      onSelectExperiment(exp.id);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl liquid-glass-btn text-cyan-200 hover:text-white border border-cyan-400/40 hover:border-cyan-300 font-semibold text-xs sm:text-sm tracking-wide shadow-[0_0_18px_rgba(6,182,212,0.25)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all cursor-pointer group/btn"
                  >
                    <span>Tajribani boshlash</span>
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
