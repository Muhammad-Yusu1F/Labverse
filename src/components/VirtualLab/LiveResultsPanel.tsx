import React, { useState, useEffect, useRef } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  Activity, 
  Clock, 
  Thermometer, 
  Zap, 
  ShieldCheck, 
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { ExperimentId } from '../../types';

interface LiveResultsPanelProps {
  activeExperiment: ExperimentId;
  telemetry: any;
  elapsedSeconds: number;
}

export const LiveResultsPanel: React.FC<LiveResultsPanelProps> = ({
  activeExperiment,
  telemetry,
  elapsedSeconds
}) => {
  const [chartData, setChartData] = useState<any[]>([]);

  // Format elapsed time MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const telemetryRef = useRef(telemetry);
  useEffect(() => {
    telemetryRef.current = telemetry;
  });

  // Keep a running window of real-time datapoints sampled per elapsed second
  useEffect(() => {
    const now = formatTime(elapsedSeconds);
    const tel = telemetryRef.current;

    setChartData((prev) => {
      let newPoint: any = { time: now };

      if (activeExperiment === 'physics-circuit') {
        newPoint = {
          time: now,
          val1: tel.current || 0, // Current (A)
          val2: tel.voltage || 12, // Voltage (V)
          val3: tel.power || 0 // Power (W)
        };
      } else if (activeExperiment === 'chemistry-reaction') {
        newPoint = {
          time: now,
          val1: tel.ph || 7.0, // pH
          val2: tel.temperature || 22.0, // Temp
        };
      } else if (activeExperiment === 'biology-cell') {
        newPoint = {
          time: now,
          val1: tel.focus || 50,
          val2: tel.light || 80,
        };
      } else {
        newPoint = {
          time: now,
          val1: tel.pressure || 50,
          val2: (tel.magnitude || 3.0) * 10,
        };
      }

      const updated = [...prev, newPoint];
      if (updated.length > 15) {
        return updated.slice(updated.length - 15);
      }
      return updated;
    });
  }, [elapsedSeconds, activeExperiment]);

  // Chart configuration based on active experiment
  const getChartConfig = () => {
    switch (activeExperiment) {
      case 'physics-circuit':
        return {
          title: 'Tok kuchi (I) va Quvvat (P) dinamikasi',
          series1: { key: 'val1', name: 'Tok (A)', color: '#06b6d4' },
          series2: { key: 'val3', name: 'Quvvat (Vt)', color: '#f59e0b' },
          unit: 'A / Vt'
        };
      case 'chemistry-reaction':
        return {
          title: 'pH darajasi va Harorat egri chizig‘i',
          series1: { key: 'val1', name: 'pH ko‘rsatkich', color: '#10b981' },
          series2: { key: 'val2', name: 'Harorat (°C)', color: '#ef4444' },
          unit: 'pH / °C'
        };
      case 'biology-cell':
        return {
          title: 'Fokus va Yorug‘lik intensivligi',
          series1: { key: 'val1', name: 'Fokus darajasi', color: '#14b8a6' },
          series2: { key: 'val2', name: 'Yorug‘lik (%)', color: '#38bdf8' },
          unit: '%'
        };
      case 'earth-volcano':
        return {
          title: 'Gaz bosimi (bar) va Seysmik to‘lqinlar',
          series1: { key: 'val1', name: 'Bosim (bar)', color: '#f97316' },
          series2: { key: 'val2', name: 'Seysmik x10', color: '#e11d48' },
          unit: 'bar'
        };
      default:
        return {
          title: 'Jonli telemetriya',
          series1: { key: 'val1', name: 'Qiymat 1', color: '#06b6d4' },
          series2: { key: 'val2', name: 'Qiymat 2', color: '#3b82f6' },
          unit: ''
        };
    }
  };

  const config = getChartConfig();

  return (
    <div id="live-results-dashboard" className="rounded-2xl liquid-glass-card border border-white/10 p-5 backdrop-blur-2xl space-y-5 overflow-hidden relative shadow-xl liquid-sheen-effect">
      {/* Top Specular Line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none" />
      
      {/* Dashboard Header with timer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
          <h3 className="text-base font-display font-bold text-white tracking-wide">
            Jonli Natijalar & Telemetriya
          </h3>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1 rounded-full liquid-glass border border-cyan-400/30 font-mono text-xs text-slate-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Vaqt: <strong className="text-cyan-300">{formatTime(elapsedSeconds)}</strong></span>
        </div>
      </div>

      {/* Metrics Row Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        
        {/* Metric 1 */}
        <div className="p-3.5 rounded-xl liquid-glass border border-white/5 shadow-inner">
          <div className="text-[11px] font-mono text-slate-400">
            {activeExperiment === 'physics-circuit' ? 'Kuchlanish (U)' :
             activeExperiment === 'chemistry-reaction' ? 'pH qiymat' :
             activeExperiment === 'biology-cell' ? 'Kattalashtirish' : 'Gaz bosimi'}
          </div>
          <div className="text-lg font-bold font-mono text-cyan-400 mt-1">
            {activeExperiment === 'physics-circuit' ? `${telemetry.voltage || 12} V` :
             activeExperiment === 'chemistry-reaction' ? `pH ${(telemetry.ph || 7.0).toFixed(1)}` :
             activeExperiment === 'biology-cell' ? `${telemetry.magnification || 400}x` : `${telemetry.pressure || 65} bar`}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-3.5 rounded-xl liquid-glass border border-white/5 shadow-inner">
          <div className="text-[11px] font-mono text-slate-400">
            {activeExperiment === 'physics-circuit' ? 'Tok kuchi (I)' :
             activeExperiment === 'chemistry-reaction' ? 'Harorat' :
             activeExperiment === 'biology-cell' ? 'Fokus tiniqligi' : 'Magma harorati'}
          </div>
          <div className="text-lg font-bold font-mono text-emerald-400 mt-1">
            {activeExperiment === 'physics-circuit' ? `${(telemetry.current || 0).toFixed(2)} A` :
             activeExperiment === 'chemistry-reaction' ? `+${(telemetry.temperature || 22).toFixed(1)} °C` :
             activeExperiment === 'biology-cell' ? `${telemetry.focus === 50 ? '100%' : '85%'}` : `${telemetry.temp || 980} °C`}
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-3.5 rounded-xl liquid-glass border border-white/5 shadow-inner">
          <div className="text-[11px] font-mono text-slate-400">
            {activeExperiment === 'physics-circuit' ? 'Qarshilik (R)' :
             activeExperiment === 'chemistry-reaction' ? 'Hajm' :
             activeExperiment === 'biology-cell' ? 'Yorug‘lik' : 'Silikat (SiO₂)'}
          </div>
          <div className="text-lg font-bold font-mono text-amber-400 mt-1">
            {activeExperiment === 'physics-circuit' ? `${telemetry.resistance || 12} Ω` :
             activeExperiment === 'chemistry-reaction' ? `${telemetry.volume || 80} ml` :
             activeExperiment === 'biology-cell' ? `${telemetry.light || 85}%` : `${telemetry.silica || 60}%`}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
          <div className="text-[11px] font-mono text-slate-400">
            {activeExperiment === 'physics-circuit' ? 'Quvvat (P)' :
             activeExperiment === 'chemistry-reaction' ? 'Reaksiya holati' :
             activeExperiment === 'biology-cell' ? 'Organoid' : 'Seysmik shkala'}
          </div>
          <div className="text-lg font-bold font-mono text-purple-400 mt-1 truncate">
            {activeExperiment === 'physics-circuit' ? `${telemetry.power || 0} W` :
             activeExperiment === 'chemistry-reaction' ? `${telemetry.status || 'Kutilmoqda'}` :
             activeExperiment === 'biology-cell' ? `${telemetry.organelleName || 'Yadro'}` : `${telemetry.magnitude || 3.4} ball`}
          </div>
        </div>

      </div>

      {/* Dynamic Animated Recharts Graph */}
      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span>{config.title}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.series1.color }} />
              <span className="text-slate-400">{config.series1.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.series2.color }} />
              <span className="text-slate-400">{config.series2.name}</span>
            </div>
          </div>
        </div>

        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="color1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.series1.color} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={config.series1.color} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="color2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={config.series2.color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={config.series2.color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={10} fontVariant="monospace" />
              <YAxis stroke="#64748b" fontSize={10} fontVariant="monospace" domain={['auto', 'auto']} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#090e1a', 
                  borderColor: '#38bdf840', 
                  borderRadius: '8px', 
                  fontSize: '12px',
                  color: '#fff'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="val1" 
                name={config.series1.name}
                stroke={config.series1.color} 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#color1)" 
                isAnimationActive={false}
              />
              <Area 
                type="monotone" 
                dataKey="val2" 
                name={config.series2.name}
                stroke={config.series2.color} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#color2)" 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
