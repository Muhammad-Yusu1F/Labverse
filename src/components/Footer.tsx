import React from 'react';
import { Atom, Heart, Sparkles, BookOpen, ShieldCheck } from 'lucide-react';
import { soundFx } from '../utils/audio';

interface FooterProps {
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#04060d] text-slate-400 py-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-[#070b14] rounded-[6px] flex items-center justify-center">
                  <Atom className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="font-display text-xl font-extrabold tracking-wider text-white">
                LABVERSE
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Maktab o‘quvchilari va texnologiya tanlovlari uchun mo‘ljallangan interaktiv 
              virtual fan laboratoriyasi platformasi.
            </p>
            <div className="text-[11px] font-mono text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>100% O‘zbek tilidagi interaktiv simulyatsiyalar</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-4 space-y-2">
            <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Bo‘limlar
            </div>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <button 
                  onClick={() => { soundFx.playClick(); onNavigate('home'); }} 
                  className="hover:text-cyan-400 transition-colors"
                >
                  Bosh sahifa
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { soundFx.playClick(); onNavigate('experiments'); }} 
                  className="hover:text-cyan-400 transition-colors"
                >
                  Tajribalar katalogi
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { soundFx.playClick(); onNavigate('lab'); }} 
                  className="hover:text-cyan-400 transition-colors"
                >
                  Asosiy laboratoriya
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { soundFx.playClick(); onNavigate('about'); }} 
                  className="hover:text-cyan-400 transition-colors"
                >
                  Platforma haqida
                </button>
              </li>
            </ul>
          </div>

          {/* Educational Note */}
          <div className="md:col-span-3 space-y-2">
            <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Standartlar
            </div>
            <div className="text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Xavfsiz STEAM ta’limi</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Umumiy o‘rta ta’lim standartlari (O‘zbekiston Respublikasi XTV) asosida ishlab chiqilgan.
              </p>
            </div>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div>
            © 2026 LABVERSE — Virtual Tajriba Laboratoriyasi. Barcha huquqlar himoyalangan.
          </div>
          <div className="flex items-center gap-1">
            <span>Ta’lim uchun mehr bilan yaratilgan</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 mx-1" />
          </div>
        </div>

      </div>
    </footer>
  );
};
