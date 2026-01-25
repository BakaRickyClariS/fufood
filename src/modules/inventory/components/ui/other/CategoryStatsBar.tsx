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
  const isVisibleRef = useRef(isVisible);

  // 同步 ref 與 state
  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  useEffect(() => {
    // 輪詢檢查 container 是否已掛載（解決 SlideModalLayout 動態掛載 ref 的時序問題）
    let container = scrollContainerRef.current;
    let pollAttempts = 0;
    const maxAttempts = 20;

    const tryAttachListener = () => {
      container = scrollContainerRef.current;
      if (container) {
        const handleScroll = () => {
          const shouldHide = container!.scrollTop > 50;
          if (shouldHide && isVisibleRef.current) {
            setIsVisible(false);
          } else if (!shouldHide && !isVisibleRef.current) {
            setIsVisible(true);
          }
        };

        container.addEventListener('scroll', handleScroll);
        return () => container!.removeEventListener('scroll', handleScroll);
      } else if (pollAttempts < maxAttempts) {
        pollAttempts++;
        const timeoutId = setTimeout(tryAttachListener, 100);
        return () => clearTimeout(timeoutId);
      }
      return undefined;
    };

    const cleanup = tryAttachListener();
    return () => {
      cleanup?.();
    };
  }, [scrollContainerRef]);

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
      className="fixed bottom-24 left-4 right-4 z-40 bg-white/70 text-neutral-900 backdrop-blur-md rounded-[50px] shadow-xl border border-neutral-100 p-3 flex justify-between items-center max-w-layout-container mx-auto"
    >
      <div className="flex flex-col items-center flex-1 border-r border-neutral-400 last:border-0">
        <span className="text-base font-bold">{totalCount}</span>
        <span className="text-xs font-medium mt-1">總數</span>
      </div>

      <div className="flex flex-col items-center flex-1 border-r border-neutral-400 last:border-0">
        <span className="text-base font-bold">{expiringCount}</span>
        <span className="text-xs font-medium mt-1">即將過期</span>
      </div>

      <div className="flex flex-col items-center flex-1">
        <span className="text-base font-bold">{expiredCount}</span>
        <span className="text-xs font-medium mt-1">已過期</span>
      </div>
    </div>
  );
};

export default CategoryStatsBar;
