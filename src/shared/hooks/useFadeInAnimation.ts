import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';

type UseFadeInAnimationOptions = {
  /** 是否正在載入 */
  isLoading: boolean;
  /** 動畫持續時間（秒） */
  duration?: number;
  /** Y 軸位移量（像素） */
  yOffset?: number;
  /** 緩動曲線 */
  ease?: string;
};

/**
 * 提供載入完成後的淡入動畫效果
 * @returns ref - 需要綁定到要動畫的元素上
 * @returns resetAnimation - 重置動畫狀態，讓動畫可以重新觸發
 * @returns triggerAnimation - 手動觸發動畫
 */
const useFadeInAnimation = <T extends HTMLElement = HTMLDivElement>({
  isLoading,
  duration = 0.35,
  yOffset = 20,
  ease = 'power3.out',
}: UseFadeInAnimationOptions) => {
  const ref = useRef<T>(null);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  // 當載入完成且尚未播放過動畫時，觸發動畫
  useEffect(() => {
    if (!isLoading && !hasAnimated) {
      setShouldAnimate(true);
    }
  }, [isLoading, hasAnimated]);

  // 執行動畫
  useEffect(() => {
    if (ref.current && shouldAnimate) {
      gsap.set(ref.current, { opacity: 0, y: yOffset });

      requestAnimationFrame(() => {
        gsap.to(ref.current, {
          opacity: 1,
          y: 0,
          duration,
          ease,
          onComplete: () => {
            setShouldAnimate(false);
            setHasAnimated(true);
          },
        });
      });
    }
  }, [shouldAnimate, duration, yOffset, ease]);

  // 重置動畫狀態（用於切換篩選等需要重新觸發動畫的場景）
  const resetAnimation = useCallback(() => {
    setHasAnimated(false);
  }, []);

  // 手動觸發動畫
  const triggerAnimation = useCallback(() => {
    setShouldAnimate(true);
  }, []);

  return { ref, resetAnimation, triggerAnimation, isAnimating: shouldAnimate };
};

export default useFadeInAnimation;

