import React from 'react';

export const LabAtmosphereOverlay: React.FC = () => {
  return (
    <>
      {/* Subtle Top & Bottom Ambient Light Glow */}
      <div 
        className="fixed top-0 left-0 right-0 h-[2px] pointer-events-none z-40 transition-all duration-700"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.4) 30%, rgba(59,130,246,0.6) 50%, rgba(6,182,212,0.4) 70%, transparent 100%)',
          boxShadow: '0 0 14px 1px rgba(6,182,212,0.35)'
        }}
      />
      <div 
        className="fixed bottom-0 left-0 right-0 h-[1px] pointer-events-none z-40 transition-all duration-700"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.2) 30%, rgba(59,130,246,0.3) 50%, rgba(6,182,212,0.2) 70%, transparent 100%)'
        }}
      />

      {/* Atmospheric Cleanroom Vignette (Smooth and uncluttered) */}
      <div 
        className="fixed inset-0 pointer-events-none z-20"
        style={{
          boxShadow: 'inset 0 0 100px 30px rgba(3, 7, 18, 0.75)'
        }}
      />
    </>
  );
};
