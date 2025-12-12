import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

type CategoryStatsBarProps = {
  totalCount: number;
  expiringCount: number;
  expiredCount: number;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
};

const CategoryStatsBar: React.FC<CategoryStatsBarProps> = ({
  totalCount,
  expiringCount,
  expiredCount,
  scrollContainerRef,
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (container.scrollTop > 50) {
        if (isVisible) setIsVisible(false);
      } else {
        if (!isVisible) setIsVisible(true);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [scrollContainerRef, isVisible]);

  useEffect(() => {
    if (isVisible) {
      // Slide up (show)
      gsap.to(barRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.4,
        ease: 'power2.out',
      });
    } else {
      // Slide down (hide)
      gsap.to(barRef.current, {
        y: '100%',
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
      });
    }
  }, [isVisible]);

  return (
    <div
      ref={barRef}
      className="fixed bottom-24 left-4 right-4 z-40 bg-white/70 text-neutral-900 backdrop-blur-md rounded-[50px] shadow-xl border border-neutral-100 p-4 flex justify-between items-center max-w-layout-container mx-auto"
    >
      <div className="flex flex-col items-center flex-1 border-r border-neutral-400 last:border-0">
        <span className="text-2xl font-bold">{totalCount}</span>
        <span className="text-xs font-medium mt-1">總數</span>
      </div>
      
      <div className="flex flex-col items-center flex-1 border-r border-neutral-400 last:border-0">
        <span className="text-2xl font-bold">{expiringCount}</span>
        <span className="text-xs font-medium mt-1">即將過期</span>
      </div>
      
      <div className="flex flex-col items-center flex-1">
        <span className="text-2xl font-bold">{expiredCount}</span>
        <span className="text-xs font-medium mt-1">已過期</span>
      </div>
    </div>
  );
};

export default CategoryStatsBar;
