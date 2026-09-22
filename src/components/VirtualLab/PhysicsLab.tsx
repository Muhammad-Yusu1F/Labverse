import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  ToggleLeft, 
  ToggleRight, 
  RotateCcw, 
  Sliders, 
  Info, 
  Check, 
  AlertTriangle,
  Lightbulb,
  Radio,
  Sparkles
} from 'lucide-react';
import { CircuitState } from '../../types';
import { soundFx } from '../../utils/audio';
import { Circuit3DCanvas } from '../ThreeDLab/Circuit3DCanvas';

interface PhysicsLabProps {
  onTelemetryUpdate: (data: {
    voltage: number;
    current: number;
    resistance: number;
    power: number;
    status: string;
    temperature: number;
  }) => void;
  onStepProgress: (stepIdx: number) => void;
}

export const PhysicsLab: React.FC<PhysicsLabProps> = ({
  onTelemetryUpdate,
  onStepProgress
}) => {
  const [circuit, setCircuit] = useState<CircuitState>({
    voltage: 12,
    resistance: 10,
    isSwitchClosed: true,
    hasBulb: true,
    hasResistor: true,
    hasAmmeter: true,
    wireConnected: true,
    bulbBroken: false
  });

  // Stabilize callbacks using refs
  const telemetryRef = useRef(onTelemetryUpdate);
  useEffect(() => {
    telemetryRef.current = onTelemetryUpdate;
  });

  const stepProgressRef = useRef(onStepProgress);
  useEffect(() => {
    stepProgressRef.current = onStepProgress;
  });

  // Electrical calculations
  const totalResistance = circuit.resistance + (circuit.hasBulb ? 2 : 0);
  const current = (circuit.isSwitchClosed && circuit.wireConnected && !circuit.bulbBroken)
    ? Number((circuit.voltage / totalResistance).toFixed(2))
    : 0;

  const power = Number((current * circuit.voltage).toFixed(2));
  const wireTemperature = Number((20 + (current * current * 0.8)).toFixed(1));

  // Push telemetry up to live charts cleanly
  useEffect(() => {
    const status = !circuit.wireConnected
      ? 'Zanjir uzilgan (Ulanmagan)'
      : !circuit.isSwitchClosed
      ? 'Kalit ochiq (Tok oqmayapti)'
      : circuit.bulbBroken
      ? 'Lampochka kuygan!'
      : 'Normal yopiq zanjir (3D Faol)';

    telemetryRef.current({
      voltage: circuit.voltage,
      current: current,
      resistance: totalResistance,
      power: power,
      status: status,
      temperature: wireTemperature
    });
  }, [circuit.voltage, circuit.resistance, circuit.isSwitchClosed, circuit.wireConnected, circuit.bulbBroken, circuit.hasBulb, current, totalResistance, power, wireTemperature]);

  const toggleSwitch = () => {
    soundFx.playClick(circuit.isSwitchClosed ? 400 : 750);
    if (!circuit.isSwitchClosed) {
      soundFx.playSpark();
      stepProgressRef.current(1);
    }
    setCircuit((prev) => ({ ...prev, isSwitchClosed: !prev.isSwitchClosed }));
  };

  const resetCircuit = () => {
    soundFx.playClick(500);
    setCircuit({
      voltage: 12,
      resistance: 10,
      isSwitchClosed: true,
      hasBulb: true,
      hasResistor: true,
      hasAmmeter: true,
      wireConnected: true,
      bulbBroken: false
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      
      {/* ================= LEFT: Laboratory Tools / Equipment ================= */}
      <div className="lg:col-span-3 space-y-4">
        <div className="rounded-3xl liquid-glass border border-white/10 p-4 sm:p-5 backdrop-blur-2xl shadow-xl space-y-4">
          
          <div className="flex items-center gap-2 pb-3 border-b border-white/10 text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Zanjir Sozlamalari</span>
          </div>

          <div className="space-y-3">
            {/* Battery / Voltage Source Selector */}
            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 text-xs space-y-1">
              <div className="flex justify-between font-bold text-slate-200">
                <span>Manba turi</span>
                <span className="text-cyan-400 font-mono">DC Akkumulyator</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Doimiy tok laboratoriya ta’minoti (1V - 24V oralig‘i)
              </p>
            </div>

            {/* Component Toggles */}
            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 space-y-2.5">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Stoldagi elementlar
              </div>

              {/* Toggle Bulb */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  setCircuit((c) => ({ ...c, hasBulb: !c.hasBulb }));
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  circuit.hasBulb
                    ? 'bg-amber-500/20 border border-amber-400/50 text-amber-200'
                    : 'bg-slate-800/40 border border-slate-700/40 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Cho‘g‘lanma lampochka (2Ω)</span>
                </div>
                {circuit.hasBulb ? <Check className="w-4 h-4 text-amber-400" /> : <span className="text-[10px]">O‘chirilgan</span>}
              </button>

              {/* Toggle Resistor */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  setCircuit((c) => ({ ...c, hasResistor: !c.hasResistor }));
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  circuit.hasResistor
                    ? 'bg-cyan-500/20 border border-cyan-400/50 text-cyan-200'
                    : 'bg-slate-800/40 border border-slate-700/40 text-slate-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Rezistor ({circuit.resistance}Ω)</span>
                </div>
                {circuit.hasResistor ? <Check className="w-4 h-4 text-cyan-400" /> : <span className="text-[10px]">O‘chirilgan</span>}
              </button>

              {/* Wire connectivity trigger */}
              <button
                onClick={() => {
                  soundFx.playClick(circuit.wireConnected ? 300 : 700);
                  setCircuit((c) => ({ ...c, wireConnected: !c.wireConnected }));
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  circuit.wireConnected
                    ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-200'
                    : 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
                }`}
              >
                <span>Ulovchi mis simlar:</span>
                <span className="font-mono font-bold text-[11px]">
                  {circuit.wireConnected ? 'ULANGAN' : 'UZILGAN'}
                </span>
              </button>
            </div>

            {/* Quick Preset Scenarios */}
            <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 space-y-2">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Tezkor sinovlar
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    soundFx.playClick(600);
                    setCircuit({
                      voltage: 5,
                      resistance: 5,
                      isSwitchClosed: true,
                      hasBulb: true,
                      hasResistor: true,
                      hasAmmeter: true,
                      wireConnected: true,
                      bulbBroken: false
                    });
                  }}
                  className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-[11px] font-medium text-slate-200 cursor-pointer text-center"
                >
                  5V / 5Ω
                </button>
                <button
                  onClick={() => {
                    soundFx.playClick(600);
                    setCircuit({
                      voltage: 12,
                      resistance: 10,
                      isSwitchClosed: true,
                      hasBulb: true,
                      hasResistor: true,
                      hasAmmeter: true,
                      wireConnected: true,
                      bulbBroken: false
                    });
                  }}
                  className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-[11px] font-medium text-slate-200 cursor-pointer text-center"
                >
                  12V Standart
                </button>
                <button
                  onClick={() => {
                    soundFx.playClick(600);
                    setCircuit({
                      voltage: 24,
                      resistance: 6,
                      isSwitchClosed: true,
                      hasBulb: true,
                      hasResistor: true,
                      hasAmmeter: true,
                      wireConnected: true,
                      bulbBroken: false
                    });
                  }}
                  className="px-2.5 py-2 rounded-xl bg-amber-950/50 border border-amber-500/30 hover:bg-amber-900/50 text-[11px] font-bold text-amber-300 cursor-pointer text-center"
                >
                  24V Maksimal
                </button>
                <button
                  onClick={resetCircuit}
                  className="px-2.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-[11px] font-medium text-cyan-300 flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Qayta</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ================= CENTER: 3D Room / Table Simulation ================= */}
      <div className="lg:col-span-6 space-y-4">
        <Circuit3DCanvas
          voltage={circuit.voltage}
          resistance={circuit.resistance}
          isSwitchClosed={circuit.isSwitchClosed}
          hasBulb={circuit.hasBulb}
          hasResistor={circuit.hasResistor}
          hasAmmeter={circuit.hasAmmeter}
          wireConnected={circuit.wireConnected}
          bulbBroken={circuit.bulbBroken}
          onToggleSwitch={toggleSwitch}
        />

        {/* Live Formula & Law of Physics Card */}
        <div className="p-4 rounded-3xl liquid-glass border border-cyan-500/30 backdrop-blur-2xl shadow-xl flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Om qonuni:</span>
            <span className="px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 font-bold text-sm">
              I = U / R = {circuit.voltage}V / {totalResistance}Ω = {current.toFixed(2)} A
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400">Quvvat:</span>
            <span className="px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-500/40 text-amber-300 font-bold text-sm">
              P = U · I = {power} Vt (W)
            </span>
          </div>
        </div>
      </div>

      {/* ================= RIGHT: Controls & Param Sliders ================= */}
      <div className="lg:col-span-3 space-y-4">
        <div className="rounded-3xl liquid-glass border border-white/10 p-4 sm:p-5 backdrop-blur-2xl space-y-5 shadow-xl">
          
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>Tajriba Boshqaruvi</span>
            </div>
            <button
              onClick={resetCircuit}
              title="Standart holatga qaytarish"
              className="p-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Switch Trigger Big Button */}
          <button
            id="btn-toggle-switch"
            onClick={toggleSwitch}
            className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs tracking-wide flex items-center justify-center gap-2.5 transition-all shadow-lg cursor-pointer ${
              circuit.isSwitchClosed
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:from-amber-300 hover:to-amber-400'
                : 'bg-slate-900/80 border border-white/10 text-slate-300 hover:border-cyan-400/50'
            }`}
          >
            {circuit.isSwitchClosed ? (
              <>
                <ToggleRight className="w-5 h-5 text-slate-950" />
                <span>KALIT: YOQILGAN (TOK OQYAPTI)</span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-5 h-5 text-slate-400" />
                <span>KALIT: O‘CHIRILGAN (OCHIQ)</span>
              </>
            )}
          </button>

          {/* Slider 1: Voltage */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Kuchlanish (U):</span>
              <span className="font-mono text-cyan-300 font-bold text-xs bg-cyan-950/70 px-2 py-0.5 rounded-md border border-cyan-500/30">
                {circuit.voltage} Volt
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="24"
              step="1"
              value={circuit.voltage}
              onChange={(e) => {
                soundFx.playClick(300 + Number(e.target.value) * 20);
                setCircuit((c) => ({ ...c, voltage: Number(e.target.value) }));
                onStepProgress(2);
              }}
              className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>1 V</span>
              <span className="text-cyan-400">12 V (Standart)</span>
              <span>24 V</span>
            </div>
          </div>

          {/* Slider 2: Resistance */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Rezistor qarshiligi (R):</span>
              <span className="font-mono text-cyan-300 font-bold text-xs bg-cyan-950/70 px-2 py-0.5 rounded-md border border-cyan-500/30">
                {circuit.resistance} Om (Ω)
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="60"
              step="2"
              value={circuit.resistance}
              onChange={(e) => {
                soundFx.playClick(500 - Number(e.target.value) * 5);
                setCircuit((c) => ({ ...c, resistance: Number(e.target.value) }));
                onStepProgress(2);
              }}
              className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>2 Ω</span>
              <span className="text-cyan-400">10 Ω</span>
              <span>60 Ω</span>
            </div>
          </div>

          {/* Real-time Telemetry Metrics */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 space-y-2.5 text-xs">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Jonli hisoblash natijalari
            </div>
            
            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-slate-400">Tok kuchi (I):</span>
              <span className="font-mono font-bold text-cyan-300">{current.toFixed(2)} A</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-white/5">
              <span className="text-slate-400">Ajralayotgan quvvat:</span>
              <span className="font-mono font-bold text-amber-300">{power} Vt (W)</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">Sim harorati:</span>
              <span className="font-mono font-bold text-emerald-300">+{wireTemperature} °C</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
