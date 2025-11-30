import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import bgImage from '@/assets/images/startup/bg.png';
import charImage from '@/assets/images/startup/char.png';
import logoImage from '@/assets/images/startup/logo.png';

export const SplashScreen = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const charRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // GSAP 時間軸動畫
    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
    });

    // 動畫序列
    tl.fromTo(
      logoRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.2 },
    ).fromTo(
      charRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8 },
      '-=0.3', // 與前一個動畫重疊 0.3 秒
    );

    return () => {
      tl.kill(); // 清理動畫
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-hidden bg-white"
    >
      {/* 背景圖 */}
      <img
        src={bgImage}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 內容容器 */}
      <div className="relative h-full flex flex-col items-center justify-center px-6">
        {/* Logo */}
        <img
          ref={logoRef}
          src={logoImage}
          alt="fufood Logo"
          className="w-48 mb-8"
          style={{ opacity: 0 }}
        />

        {/* 角色群 */}
        <img
          ref={charRef}
          src={charImage}
          alt="Characters"
          className="w-64 max-w-[80%]"
          style={{ opacity: 0 }}
        />
      </div>
    </div>
  );
};
