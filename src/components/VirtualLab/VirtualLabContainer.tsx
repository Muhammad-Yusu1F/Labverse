import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  FlaskConical, 
  Dna, 
  Flame, 
  RotateCcw, 
  ArrowLeft, 
  CheckCircle2, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { ExperimentId, ExperimentStep, ExperimentMeta } from '../../types';
import { EXPERIMENTS } from '../../data/experimentsData';
import { PhysicsLab } from './PhysicsLab';
import { ChemistryLab } from './ChemistryLab';
import { BiologyLab } from './BiologyLab';
import { VolcanoLab } from './VolcanoLab';
import { ExperimentSteps } from './ExperimentSteps';
import { LiveResultsPanel } from './LiveResultsPanel';
import { KnowledgePanel } from './KnowledgePanel';
import { soundFx } from '../../utils/audio';

interface VirtualLabContainerProps {
  activeExperimentId: ExperimentId;
  onSelectExperiment: (id: ExperimentId) => void;
  onBackToCatalog: () => void;
  onExperimentCompleted: (experimentId: ExperimentId, xpEarned: number) => void;
  onUnlockBadge: (badgeId: string) => void;
}

export const VirtualLabContainer: React.FC<VirtualLabContainerProps> = ({
  activeExperimentId,
  onSelectExperiment,
  onBackToCatalog,
  onExperimentCompleted,
  onUnlockBadge
}) => {
  const currentExperiment: ExperimentMeta = 
    EXPERIMENTS.find((e) => e.id === activeExperimentId) || EXPERIMENTS[0];

  // 5 standard educational steps
  const [steps, setSteps] = useState<ExperimentStep[]>([
    {
      id: 1,
      number: '01',
      title: 'Asboblarni tayyorlash',
      description: 'Kerakli uskunalar va parametrlar to‘g‘ri ulanganligini tekshiring.',
      isCompleted: true,
      isActive: false
    },
    {
      id: 2,
      number: '02',
      title: 'Tajribani boshlash',
      description: 'Zanjir kalitini yoqing yoki reagentlarni aralashtiring.',
      isCompleted: false,
      isActive: true
    },
    {
      id: 3,
      number: '03',
      title: 'Parametrlarni o‘zgartirish',
      description: 'Kuchlanish, konsentratsiya, fokus yoki bosim qiymatlarini o‘zgartirib ta’sirini tahlil qiling.',
      isCompleted: false,
      isActive: false
    },
    {
      id: 4,
      number: '04',
      title: 'Natijani kuzatish',
      description: 'O‘lchov asboblari va grafikdagi dinamik o‘zgarishlarni qayd eting.',
      isCompleted: false,
      isActive: false
    },
    {
      id: 5,
      number: '05',
      title: 'Xulosa chiqarish',
      description: 'Olingan natijalar asosida ilmiy xulosa yasang va bilimlaringizni mustahkamlang.',
      isCompleted: false,
      isActive: false
    }
  ]);

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(1);
  const [telemetry, setTelemetry] = useState<any>({});
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [labKey, setLabKey] = useState<number>(0); // for resetting inner state

  const handleTelemetryUpdate = React.useCallback((data: any) => {
    setTelemetry(data);
  }, []);

  // Timer counter
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Reset steps when experiment changes
  useEffect(() => {
    setSteps([
      {
        id: 1,
        number: '01',
        title: 'Asboblarni tayyorlash',
        description: 'Kerakli uskunalar va parametrlar to‘g‘ri ulanganligini tekshiring.',
        isCompleted: true,
        isActive: false
      },
      {
        id: 2,
        number: '02',
        title: 'Tajribani boshlash',
        description: 'Zanjir kalitini yoqing yoki reagentlarni aralashtiring.',
        isCompleted: false,
        isActive: true
      },
      {
        id: 3,
        number: '03',
        title: 'Parametrlarni o‘zgartirish',
        description: 'Kuchlanish, konsentratsiya, fokus yoki bosim qiymatlarini o‘zgartirib ta’sirini tahlil qiling.',
        isCompleted: false,
        isActive: false
      },
      {
        id: 4,
        number: '04',
        title: 'Natijani kuzatish',
        description: 'O‘lchov asboblari va grafikdagi dinamik o‘zgarishlarni qayd eting.',
        isCompleted: false,
        isActive: false
      },
      {
        id: 5,
        number: '05',
        title: 'Xulosa chiqarish',
        description: 'Olingan natijalar asosida ilmiy xulosa yasang va bilimlaringizni mustahkamlang.',
        isCompleted: false,
        isActive: false
      }
    ]);
    setCurrentStepIndex(1);
    setElapsedSeconds(0);
    setLabKey((k) => k + 1);
  }, [activeExperimentId]);

  const handleStepProgress = React.useCallback((stepIdx: number) => {
    setCurrentStepIndex((prevIdx) => {
      if (stepIdx > prevIdx) {
        setSteps((prevSteps) =>
          prevSteps.map((s, idx) => ({
            ...s,
            isCompleted: idx < stepIdx,
            isActive: idx === stepIdx
          }))
        );
        return stepIdx;
      }
      return prevIdx;
    });
  }, []);

  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      const next = currentStepIndex + 1;
      setCurrentStepIndex(next);
      setSteps((prev) =>
        prev.map((s, idx) => ({
          ...s,
          isCompleted: idx < next,
          isActive: idx === next
        }))
      );
    }
  };

  const handleSelectStep = (idx: number) => {
    setCurrentStepIndex(idx);
    setSteps((prev) =>
      prev.map((s, i) => ({
        ...s,
        isActive: i === idx
      }))
    );
  };

  const handleRestart = () => {
    soundFx.playClick(500);
    setLabKey((k) => k + 1);
    setCurrentStepIndex(1);
    setElapsedSeconds(0);
  };

  const handleFinishExperiment = () => {
    onExperimentCompleted(activeExperimentId, 100);
    // Badge logic
    if (activeExperimentId === 'physics-circuit') onUnlockBadge('first-spark');
    if (activeExperimentId === 'chemistry-reaction') onUnlockBadge('alchemist');
    if (activeExperimentId === 'biology-cell') onUnlockBadge('bio-explorer');
    if (activeExperimentId === 'earth-volcano') onUnlockBadge('volcanologist');
  };

  const experimentsTabs = [
    { id: 'physics-circuit' as ExperimentId, name: '⚡ Fizika: Elektr zanjiri' },
    { id: 'chemistry-reaction' as ExperimentId, name: '🧪 Kimyo: Reaksiya lab' },
    { id: 'biology-cell' as ExperimentId, name: '🌱 Biologiya: Hujayra' },
    { id: 'earth-volcano' as ExperimentId, name: '🌋 Tabiat: Vulqon' },
  ];

  return (
    <section id="virtual-lab-section" className="py-8 sm:py-12 relative min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Top Laboratory Navigation Bar */}
        <div className="rounded-2xl liquid-glass-card border border-white/10 p-4 sm:p-5 backdrop-blur-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 overflow-hidden relative liquid-sheen-effect shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          {/* Top specular edge highlight */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundFx.playClick(500);
                onBackToCatalog();
              }}
              className="p-2.5 rounded-xl liquid-glass border border-slate-700 hover:border-cyan-400/60 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-mono cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Katalog</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full liquid-glass border border-cyan-400/40 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                  {currentExperiment.subject}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  Qiyinlik: <strong className="text-slate-200">{currentExperiment.difficulty}</strong>
                </span>
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1 ml-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  GERMETIK XONA: FAOL
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold font-display text-white mt-1">
                {currentExperiment.title}
              </h2>
            </div>
          </div>

          {/* Experiment Switcher Tabs */}
          <div className="flex items-center flex-wrap gap-1.5 p-1 rounded-full liquid-glass border border-white/10">
            {experimentsTabs.map((tab) => {
              const isSelected = tab.id === activeExperimentId;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundFx.playClick(600);
                    onSelectExperiment(tab.id);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500/25 to-blue-600/25 text-cyan-200 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.35)] font-semibold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.name}
                </button>
              );
            })}
          </div>

        </div>

        {/* ================= MAIN INTERACTIVE EXPERIMENT CORE ================= */}
        <div key={labKey}>
          {activeExperimentId === 'physics-circuit' && (
            <PhysicsLab 
              onTelemetryUpdate={handleTelemetryUpdate} 
              onStepProgress={handleStepProgress} 
            />
          )}
          {activeExperimentId === 'chemistry-reaction' && (
            <ChemistryLab 
              onTelemetryUpdate={handleTelemetryUpdate} 
              onStepProgress={handleStepProgress}
              onUnlockBadge={onUnlockBadge}
            />
          )}
          {activeExperimentId === 'biology-cell' && (
            <BiologyLab 
              onTelemetryUpdate={handleTelemetryUpdate} 
              onStepProgress={handleStepProgress}
              onUnlockBadge={onUnlockBadge}
            />
          )}
          {activeExperimentId === 'earth-volcano' && (
            <VolcanoLab 
              onTelemetryUpdate={handleTelemetryUpdate} 
              onStepProgress={handleStepProgress}
              onUnlockBadge={onUnlockBadge}
            />
          )}
        </div>

        {/* ================= SECONDARY PANELS: Steps, Live Chart, Knowledge ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Steps (5 Steps) */}
          <div className="lg:col-span-4">
            <ExperimentSteps
              steps={steps}
              currentStepIndex={currentStepIndex}
              onSelectStep={handleSelectStep}
              onNextStep={handleNextStep}
              onCompleteExperiment={handleFinishExperiment}
            />
          </div>

          {/* Live Dynamic Recharts Graphs & Stats */}
          <div className="lg:col-span-8">
            <LiveResultsPanel 
              activeExperiment={activeExperimentId}
              telemetry={telemetry}
              elapsedSeconds={elapsedSeconds}
            />
          </div>

        </div>

        {/* Knowledge & Fun Fact Section */}
        <KnowledgePanel experiment={currentExperiment} />

      </div>
    </section>
  );
};
