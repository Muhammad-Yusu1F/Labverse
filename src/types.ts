export type ExperimentId = 'physics-circuit' | 'chemistry-reaction' | 'biology-cell' | 'earth-volcano';

export type SubjectCategory = 'KIMYO' | 'FIZIKA' | 'BIOLOGIYA' | 'TABIIY FANLAR';

export interface ExperimentStep {
  id: number;
  number: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

export interface ExperimentMeta {
  id: ExperimentId;
  subject: SubjectCategory;
  title: string;
  tagline: string;
  description: string;
  difficulty: 'Boshlang‘ich' | 'O‘rta' | 'Murakkab';
  duration: string;
  color: string;
  accentColor: string;
  gradient: string;
  glowColor: string;
  iconName: string;
  tools: string[];
  keyFormula?: string;
  explanation: {
    whatHappened: string;
    scientificReason: string;
    formulaExplanation?: string;
    funFact: string;
  };
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: string;
}

export interface UserProgress {
  xp: number;
  level: number;
  levelTitle: string;
  nextLevelXp: number;
  completedExperiments: string[];
  badges: Badge[];
  streakDays: number;
  totalTimeMinutes: number;
}

export interface CircuitState {
  voltage: number;      // 1 to 24 V
  resistance: number;   // 1 to 100 Ohm
  isSwitchClosed: boolean;
  hasBulb: boolean;
  hasResistor: boolean;
  hasAmmeter: boolean;
  wireConnected: boolean;
  bulbBroken: boolean;
}

export interface ChemistryReagent {
  id: string;
  name: string;
  formula: string;
  type: 'acid' | 'base' | 'indicator' | 'metal' | 'salt' | 'water';
  color: string;
  ph: number;
  volume: number; // ml
  description: string;
}

export interface ChemistryState {
  selectedReagents: ChemistryReagent[];
  currentVolume: number;
  beakerColor: string;
  ph: number;
  temperature: number; // Celsius
  reactionStatus: 'idle' | 'mixing' | 'reacting' | 'completed' | 'exploded';
  reactionMessage: string;
  reactionEquation?: string;
  bubblesActive: boolean;
  precipitateActive: boolean;
  smokeActive: boolean;
  heatGenerated: boolean;
  isExplosion?: boolean;
}

export interface BiologyOrganelle {
  id: string;
  nameUz: string;
  nameLat: string;
  description: string;
  functionUz: string;
  color: string;
  cx: number;
  cy: number;
  r: number;
}

export interface BiologyState {
  slideType: 'plant-cell' | 'animal-cell' | 'chloroplast-zoom';
  magnification: 100 | 400 | 1000;
  lightIntensity: number; // 20 to 100%
  focusLevel: number; // 0 to 100, 50 is sharpest
  stainingApplied: boolean;
  activeOrganelleId: string | null;
  cellHealth: number;
}

export interface VolcanoState {
  gasPressure: number;     // 10 to 120 bar
  silicaContent: number;   // 45% (basaltic) to 75% (rhyolitic)
  magmaTemp: number;       // 700 to 1200 °C
  waterVapor: number;      // 1 to 10 %
  isErupting: boolean;
  eruptionType: 'tinch' | 'vulqoniy' | 'portlovchi' | 'super-plinian';
  ashPlumeHeightKm: number;
  lavaFlowSpeedKmH: number;
  seismicMagnitude: number;
  co2EmittedTons: number;
}
