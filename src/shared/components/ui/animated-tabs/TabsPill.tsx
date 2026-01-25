import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { cn } from '@/shared/utils/styleUtils';
import type { BaseTabsProps } from './types';

type TabsPillProps<TId extends string = string> = BaseTabsProps<TId> & {
  animated?: boolean;
};

const TabsPill = <TId extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  className = '',
  animated = true,
}: TabsPillProps<TId>) => {
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const bgRef = useRef<HTMLDivElement>(null);
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    if (!animated) return;

    const activeIndex = tabs.findIndex((tab) => tab.id === activeTab);
    const activeElement = tabsRef.current[activeIndex];
    const bg = bgRef.current;

    if (activeElement && bg) {
      const { offsetLeft, offsetWidth, offsetTop, offsetHeight } =
        activeElement;

      if (isFirstRender) {
        gsap.set(bg, {
          left: offsetLeft,
          top: offsetTop,
          width: offsetWidth,
          height: offsetHeight,
          opacity: 1,
        });
        setIsFirstRender(false);
      } else {
        gsap.to(bg, {
          left: offsetLeft,
          top: offsetTop,
          width: offsetWidth,
          height: offsetHeight,
          duration: 0.3,
          ease: 'back.out(0.5)',
        });
      }
    }
  }, [activeTab, tabs, isFirstRender, animated]);

  return (
    <div
      className={cn(
        'flex items-center justify-between bg-neutral-200 rounded-full gap-0.5 p-0.5 relative',
        className,
      )}
    >
      {/* Animated Background Pill */}
      {animated && (
        <div
          ref={bgRef}
          className="absolute bg-white shadow-[0_6px_14px_-2px_rgba(0,0,0,0.12)] rounded-full pointer-events-none z-0"
          style={{ opacity: 0 }} // Initially hidden until positioned
        />
      )}

      {tabs.map((tab, index) => (
        <React.Fragment key={tab.id}>
          <div className="flex items-center justify-center flex-1 z-10">
            <button
              ref={(el) => {
                tabsRef.current[index] = el;
              }}
              className={`
                px-6 py-1 w-full rounded-full text-sm font-medium transition-colors duration-200
                ${
                  activeTab === tab.id
                    ? (!animated
                        ? 'bg-white shadow-[0_6px_14px_-2px_rgba(0,0,0,0.12)]'
                        : '') + ' text-neutral-900'
                    : 'text-neutral-600 hover:text-neutral-800'
                }
              `}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.label}
            </button>
          </div>
          {index < tabs.length - 1 && (
            <span className="text-neutral-100 font-light text-sm relative z-0">
              |
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default TabsPill;
