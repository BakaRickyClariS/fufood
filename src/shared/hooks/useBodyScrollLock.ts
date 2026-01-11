import { useEffect, useRef } from 'react';

/**
 * 鎖定背景滾動的 Hook
 * 當 isLocked 為 true 時，鎖定 body 滾動
 * 關閉時自動恢復到原本的滾動位置
 */
export const useBodyScrollLock = (isLocked: boolean) => {
  const scrollYRef = useRef(0);

  useEffect(() => {
    if (isLocked) {
      // 記錄當前滾動位置
      scrollYRef.current = window.scrollY;

      // 鎖定背景滾動
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${scrollYRef.current}px`;
    } else {
      // 解除鎖定
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';

      // 恢復滾動位置
      window.scrollTo(0, scrollYRef.current);
    }

    return () => {
      // 清理
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [isLocked]);
};
