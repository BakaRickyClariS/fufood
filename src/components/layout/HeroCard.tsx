import type React from 'react';

type HeroCardProps = {
  children: React.ReactNode;
};

const HeroCard: React.FC<HeroCardProps> = ({ children }) => {
  return (
    <>
      <div className="px-4 py-6 relative overflow-hidden">
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 w-64 h-40 body-dashboard-bg blur-3xl"></div>
        <div className="flex items-center px-3 py-4 gap-6 bg-white rounded-2xl shadow-[0_6px_14px_-2px_rgba(0,0,0,0.06)] relative z-10 overflow-x-auto no-scrollbar py-2">
          {children}
        </div>
      </div>
    </>
  );
};

export default HeroCard;
