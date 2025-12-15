import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Info } from 'lucide-react';
import gsap from 'gsap';

type InfoTooltipProps = {
  /** Tooltip 內容，支援 JSX */
  content: React.ReactNode;
  /** Tooltip 位置 */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Icon 的額外樣式 */
  className?: string;
  /** Icon 大小 */
  iconSize?: number;
};

/**
 * InfoTooltip 元件
 *
 * 點擊 Info icon 時顯示說明氣泡框，帶有 GSAP 動畫效果
 *
 * @example
 * ```tsx
 * <InfoTooltip
 *   content={
 *     <>
 *       <span className="text-primary-500">「即將到期」</span>系統預設為未來 7 天內到期的食材。
 *     </>
 *   }
 * />
 * ```
 */
export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  content,
  position = 'bottom',
  className = '',
  iconSize = 16,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLButtonElement>(null);

  // 處理開啟/關閉邏輯
  const handleToggle = () => {
    if (isVisible) {
      // 關閉：先播放動畫再移除元素
      closeTooltip();
    } else {
      // 開啟：先渲染元素再播放動畫
      setShouldRender(true);
      setIsVisible(true);
    }
  };

  // 關閉 tooltip 並播放動畫
  const closeTooltip = () => {
    if (tooltipRef.current) {
      const animProps = getCloseAnimationProps();
      gsap.to(tooltipRef.current, {
        ...animProps,
        opacity: 0,
        scale: 0.9,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
          setIsVisible(false);
          setShouldRender(false);
        },
      });
    } else {
      setIsVisible(false);
      setShouldRender(false);
    }
  };

  // 開啟動畫
  useLayoutEffect(() => {
    if (isVisible && tooltipRef.current) {
      const animProps = getOpenAnimationProps();
      gsap.fromTo(
        tooltipRef.current,
        {
          ...animProps,
          opacity: 0,
          scale: 0.9,
        },
        {
          x: 0,
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: 'back.out(1.7)',
        }
      );
    }
  }, [isVisible, position]);

  // 根據位置決定開啟動畫的起始位置
  const getOpenAnimationProps = () => {
    switch (position) {
      case 'top':
        return { y: 10 };
      case 'bottom':
        return { y: -10 };
      case 'left':
        return { x: 10 };
      case 'right':
        return { x: -10 };
      default:
        return { y: -10 };
    }
  };

  // 根據位置決定關閉動畫的結束位置
  const getCloseAnimationProps = () => {
    switch (position) {
      case 'top':
        return { y: 5 };
      case 'bottom':
        return { y: -5 };
      case 'left':
        return { x: 5 };
      case 'right':
        return { x: -5 };
      default:
        return { y: -5 };
    }
  };

  // 點擊外部時關閉 tooltip
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        iconRef.current &&
        !iconRef.current.contains(event.target as Node)
      ) {
        closeTooltip();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  // 計算 tooltip 位置樣式
  const getPositionStyles = (): string => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full -left-3 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      default:
        return 'top-full left-0 mt-2';
    }
  };

  // 計算箭頭位置樣式
  const getArrowStyles = (): string => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-neutral-100';
      case 'bottom':
        return 'bottom-full left-4 border-l-transparent border-r-transparent border-t-transparent border-b-neutral-100';
      case 'left':
        return 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-neutral-100';
      case 'right':
        return 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-neutral-100';
      default:
        return 'bottom-full left-4 border-l-transparent border-r-transparent border-t-transparent border-b-neutral-100';
    }
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        ref={iconRef}
        type="button"
        onClick={handleToggle}
        className={`text-neutral-400 hover:text-neutral-600 transition-colors focus:outline-none ${className}`}
        aria-label="顯示說明"
        aria-expanded={isVisible}
      >
        <Info
          style={{ width: iconSize, height: iconSize }}
          className="shrink-0"
        />
      </button>

      {shouldRender && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 ${getPositionStyles()}`}
          role="tooltip"
        >
          {/* 箭頭 */}
          <div
            className={`absolute w-0 h-0 border-[6px] ${getArrowStyles()}`}
          />

          {/* Tooltip 內容 */}
          <div className="bg-neutral-100 text-neutral-700 text-sm leading-relaxed px-4 py-3 rounded-xl shadow-lg min-w-[200px] max-w-[280px]">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
