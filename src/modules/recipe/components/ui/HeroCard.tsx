import type React from 'react';

type HeroCardProps = {
  children: React.ReactNode;
  className?: string;
};

export const HeroCard = ({ children, className = '' }: HeroCardProps) => (
  <div
    className={`px-4 py-6 relative overflow-hidden max-w-layout-container mx-auto ${className}`}
  >
    <div className="absolute left-1/2 top-1/3 -translate-x-1/2 w-64 h-40 body-dashboard-bg blur-3xl" />
    <div className="flex flex-col bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative z-10 overflow-hidden">
      {children}
    </div>
  </div>
);
