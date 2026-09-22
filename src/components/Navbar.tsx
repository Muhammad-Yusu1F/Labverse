import React, { useState } from 'react';
import { 
  Atom, 
  Award, 
  Volume2, 
  VolumeX, 
  Menu, 
  X, 
  Flame, 
  FlaskConical, 
  Zap, 
  Dna,
  Home,
  Compass,
  Trophy,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { soundFx } from '../utils/audio';
import { ExperimentId, UserProgress } from '../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  userProgress: UserProgress;
  activeExperiment: ExperimentId;
  onSelectExperiment: (id: ExperimentId) => void;
  onOpenAchievements: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  userProgress,
  activeExperiment,
  onSelectExperiment,
  onOpenAchievements
}) => {
  const [isMuted, setIsMuted] = useState(soundFx.isMuted);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [experimentsDropdown, setExperimentsDropdown] = useState(false);

  const toggleSound = () => {
    soundFx.isMuted = !soundFx.isMuted;
    setIsMuted(soundFx.isMuted);
    if (!soundFx.isMuted) {
      soundFx.playClick(800);
    }
  };

  const navLinks = [
    { id: 'home', label: 'Bosh sahifa', icon: Home },
    { id: 'lab', label: 'Laboratoriya', icon: FlaskConical },
    { id: 'game', label: '3D O‘yin', icon: Flame, isSpecial: true, badge: '100 ball' },
    { id: 'experiments', label: 'Tajribalar', icon: Compass },
    { id: 'achievements', label: 'Natijalar', icon: Trophy },
  ];

  const experimentsList = [
    { id: 'biology-cell' as ExperimentId, title: 'Hujayra laboratoriyasi (3D)', category: 'BIOLOGIYA', icon: Dna, color: 'text-teal-400', bg: 'bg-teal-500/15' },
    { id: 'physics-circuit' as ExperimentId, title: 'Elektr zanjiri (3D Xona)', category: 'FIZIKA', icon: Zap, color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
    { id: 'chemistry-reaction' as ExperimentId, title: 'Reaksiya laboratoriyasi (3D)', category: 'KIMYO', icon: FlaskConical, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    { id: 'earth-volcano' as ExperimentId, title: 'Vulqon tajribasi (3D)', category: 'TABIIY FANLAR', icon: Flame, color: 'text-amber-400', bg: 'bg-amber-500/15' },
  ];

  return (
    <header className="sticky top-2 sm:top-3 z-50 w-full px-2 sm:px-4 lg:px-8 max-w-[98%] 2xl:max-w-[1820px] mx-auto transition-all">
      {/* Liquid Glass Wide Bar with balanced negative space */}
      <div className="liquid-glass-navbar rounded-2xl sm:rounded-3xl px-3 sm:px-6 lg:px-7 py-2.5 sm:py-3 relative flex items-center justify-between gap-3 sm:gap-4 border border-white/10 shadow-2xl backdrop-blur-2xl w-full">
        
        {/* Optical Specular Light Bevel */}
        <div className="liquid-reflection-bar" />

        {/* ================= 1. LOGO & BRAND ================= */}
        <div 
          id="navbar-logo"
          onClick={() => {
            soundFx.playClick();
            onNavigate('home');
          }}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none shrink-0 whitespace-nowrap"
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-2xl liquid-glass border border-cyan-400/40 p-0.5 shadow-[0_0_20px_rgba(6,182,212,0.35)] group-hover:shadow-[0_0_28px_rgba(6,182,212,0.7)] transition-all flex items-center justify-center overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/25 via-blue-600/30 to-purple-600/20" />
            <div className="relative w-full h-full rounded-[14px] bg-[#070d1d]/90 flex items-center justify-center">
              <Atom className="w-5 h-5 text-cyan-300 group-hover:rotate-180 transition-transform duration-700 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            </div>
          </div>

          <div className="shrink-0 whitespace-nowrap">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="font-display text-base sm:text-xl font-black tracking-wider bg-gradient-to-r from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent whitespace-nowrap">
                LABVERSE
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-400/40 font-bold tracking-wider shadow-sm shrink-0 whitespace-nowrap">
                3D
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981] animate-pulse shrink-0" />
              <span className="text-cyan-400 font-medium whitespace-nowrap">Virtual Laboratoriya</span>
            </div>
          </div>
        </div>

        {/* ================= 2. CENTER: SPACIOUS SPACED LIQUID GLASS NAVIGATION ================= */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 p-1.5 rounded-full liquid-glass-capsule border border-white/10 shadow-inner shrink-0 flex-nowrap whitespace-nowrap">
          {navLinks.map((link) => {
            const isActive = currentView === link.id;
            const IconComponent = link.icon;
            return (
              <button
                key={link.id}
                id={`nav-link-${link.id}`}
                onClick={() => {
                  soundFx.playClick(500);
                  if (link.id === 'achievements') {
                    onOpenAchievements();
                  } else {
                    onNavigate(link.id);
                  }
                }}
                className={`relative px-3.5 xl:px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer flex items-center gap-2 select-none shrink-0 whitespace-nowrap ${
                  isActive 
                    ? 'liquid-glass-pill-active text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                    : link.isSpecial
                      ? 'text-amber-300 hover:text-amber-200 hover:bg-amber-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-300' : link.isSpecial ? 'text-amber-400' : 'text-slate-400'}`} />
                <span className="whitespace-nowrap inline-block">{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/25 border border-amber-400/40 text-amber-300 font-bold shrink-0 whitespace-nowrap">
                    {link.badge}
                  </span>
                )}
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#22d3ee] animate-pulse shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* ================= 3. RIGHT: LEVEL, AUDIO, AND EXPERIMENT SELECTOR ================= */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 whitespace-nowrap">
          
          {/* Level & XP Badge */}
          <button
            id="xp-badge-btn"
            onClick={() => {
              soundFx.playClick(650);
              onOpenAchievements();
            }}
            title="Yutuqlar va Tajriba ballari (XP)"
            className="flex items-center gap-2.5 px-3 sm:px-3.5 py-1.5 rounded-2xl liquid-glass border border-cyan-400/30 hover:border-cyan-300 transition-all hover:shadow-[0_0_20px_rgba(6,182,212,0.35)] cursor-pointer shrink-0 whitespace-nowrap"
          >
            <div className="w-6 h-6 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)] shrink-0">
              <Award className="w-3.5 h-3.5" />
            </div>
            <div className="text-left hidden sm:block shrink-0 whitespace-nowrap">
              <div className="text-[9px] font-mono text-cyan-300 font-bold uppercase tracking-wider whitespace-nowrap">
                LVL {userProgress.level}
              </div>
              <div className="text-xs font-black text-amber-300 flex items-center gap-1 font-mono whitespace-nowrap">
                <span className="whitespace-nowrap">{userProgress.xp}</span>
                <span className="text-[9px] text-amber-400/80 font-normal whitespace-nowrap">XP</span>
              </div>
            </div>
          </button>

          {/* Audio Toggle Button */}
          <button
            id="sound-toggle-btn"
            onClick={toggleSound}
            title={isMuted ? "Ovozni yoqish" : "Ovozni o‘chirish"}
            className="p-2.5 rounded-2xl liquid-glass border border-white/10 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            )}
          </button>

          {/* Quick Experiment Dropdown Launcher */}
          <div className="relative shrink-0 whitespace-nowrap">
            <button
              id="quick-experiment-btn"
              onClick={() => {
                soundFx.playClick(700);
                setExperimentsDropdown(!experimentsDropdown);
              }}
              className="hidden sm:flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 text-white font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(6,182,212,0.25)] transition-all cursor-pointer border border-cyan-400/40 shrink-0 whitespace-nowrap"
            >
              <FlaskConical className="w-4 h-4 text-cyan-300 shrink-0" />
              <span className="whitespace-nowrap inline-block">Tajriba tanlash</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${experimentsDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {experimentsDropdown && (
              <div 
                className="absolute right-0 mt-3 w-80 rounded-2xl liquid-glass border border-cyan-400/40 p-2 shadow-[0_15px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.25)] z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-3xl"
              >
                <div className="px-3 py-2 text-[11px] font-mono text-cyan-300 font-bold border-b border-white/10 flex items-center justify-between">
                  <span>INTERAKTIV TAJRIBALAR</span>
                  <span className="text-[10px] text-slate-400">4 ta 3D modul</span>
                </div>

                <div className="mt-2 space-y-1">
                  {experimentsList.map((exp) => {
                    const Icon = exp.icon;
                    const isCurrent = activeExperiment === exp.id && currentView === 'lab';
                    return (
                      <button
                        key={exp.id}
                        onClick={() => {
                          soundFx.playClick(600);
                          onSelectExperiment(exp.id);
                          onNavigate('lab');
                          setExperimentsDropdown(false);
                        }}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left cursor-pointer ${
                          isCurrent 
                            ? 'bg-cyan-500/20 border border-cyan-400/50 text-white' 
                            : 'hover:bg-white/5 text-slate-300 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg ${exp.bg} border border-white/10 flex items-center justify-center flex-shrink-0 ${exp.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                            {exp.category}
                          </div>
                          <div className="text-xs font-semibold truncate text-white">
                            {exp.title}
                          </div>
                        </div>
                        {isCurrent && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl liquid-glass border border-white/10 text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 p-4 rounded-2xl liquid-glass border border-white/10 shadow-2xl backdrop-blur-3xl space-y-2 animate-in fade-in slide-in-from-top-4 duration-200">
          {navLinks.map((link) => {
            const IconComponent = link.icon;
            const isActive = currentView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  soundFx.playClick(500);
                  if (link.id === 'achievements') {
                    onOpenAchievements();
                  } else {
                    onNavigate(link.id);
                  }
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between p-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-white border border-cyan-400/40'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className="w-4 h-4 text-cyan-400" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 font-bold">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
