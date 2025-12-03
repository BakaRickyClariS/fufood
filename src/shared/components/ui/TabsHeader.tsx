import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

type Tab = {
  id: string;
  label: string;
};

type TabsHeaderProps = {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
};

export const TabsHeader = ({ tabs, activeTab, onTabChange, className = '' }: TabsHeaderProps) => {
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const lineRef = useRef<HTMLDivElement>(null);
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
    const activeElement = tabsRef.current[activeIndex];
    const line = lineRef.current;

    if (activeElement && line) {
      const { offsetLeft, offsetWidth } = activeElement;

      if (isFirstRender) {
        // First render: set position immediately without animation
        gsap.set(line, {
          left: offsetLeft,
          width: offsetWidth,
          opacity: 1
        });
        setIsFirstRender(false);
      } else {
        // Subsequent renders: animate to new position
        gsap.to(line, {
          left: offsetLeft,
          width: offsetWidth,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    }
  }, [activeTab, tabs, isFirstRender]);

  return (
    <div className={`flex justify-center items-center bg-white shadow-[0_6px_5px_-2px_rgba(0,0,0,0.06)] relative ${className}`}>
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          ref={el => { tabsRef.current[index] = el; }}
          onClick={() => onTabChange(tab.id)}
          className="relative font-semibold text-neutral-900 pt-4 pb-2 px-2 border-b-4 border-transparent z-10"
        >
          {tab.label}
        </button>
      ))}
      {/* Animated Bottom Border */}
      <div 
        ref={lineRef}
        className="absolute bottom-0 h-1 bg-primary-500 opacity-0 pointer-events-none"
      />
    </div>
  );
};
