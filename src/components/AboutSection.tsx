import React from 'react';
import { ShieldCheck, BookOpen, Atom, Users, Cpu, Award } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const advantages = [
    {
      icon: ShieldCheck,
      title: '100% Xavfsiz Muhit',
      description: 'Qimmatbaho uskunalar yoki xavfli kislota va zaharli gazlarsiz, istalgancha tajribalarni xavfsiz sinab ko‘rish imkoniyati.'
    },
    {
      icon: Cpu,
      title: 'Haqiqiy Fizika & Kimyo Qonunlari',
      description: 'Har bir tajriba haqiqiy matematik va ilmiy formulalar (Om qonuni, reaksiya stexiometriyasi, seysmologiya) asosida ishlaydi.'
    },
    {
      icon: Award,
      title: 'Gamifikatsiya & Qiziqarli Ta’lim',
      description: 'O‘quvchilar tajribalarni mustaqil o‘tkazish davomida XP to‘playdi, yangi ilmiy daraja va faxriy nishonlarni ochadi.'
    },
    {
      icon: BookOpen,
      title: 'Maktab Dasturiga Mos',
      description: 'O‘zbekiston umumta’lim maktablarining 7-11 sinf fizika, kimyo, biologiya va geografiya darsliklariga to‘liq mos keladi.'
    }
  ];

  return (
    <section id="about-section" className="py-16 sm:py-20 border-t border-slate-800/80 bg-[#050812]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
            <Atom className="w-3.5 h-3.5" />
            <span>LABVERSE HAQIDA</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white">
            Kelajak Ta’limi — Virtual Tajribalarda
          </h2>

          <p className="text-base sm:text-lg text-slate-400">
            <strong>LABVERSE</strong> — bu maktab o‘quvchilari va ustozlar uchun mo‘ljallangan eng zamonaviy 
            virtual fan laboratoriyasidir. Bizning maqsadimiz — quruq yodlash o‘rniga tadqiqot orqali chuqur bilim berish.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-[#090f20]/90 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-display">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Quote banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-cyan-950/30 via-slate-900 to-blue-950/30 border border-cyan-500/20 text-center max-w-4xl mx-auto">
          <p className="text-lg sm:text-xl font-medium text-cyan-200 italic font-display">
            "Aytib bersang — unutaman, ko‘rsatsang — eslab qolaman, lekin o‘zim bajarsam — tushunaman!"
          </p>
          <span className="block mt-2 text-xs font-mono text-slate-400 uppercase tracking-widest">
            — Qadimgi hikmat & Zamonaviy pedagogika shiori
          </span>
        </div>

      </div>
    </section>
  );
};
