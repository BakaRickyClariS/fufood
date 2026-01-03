import React, { useEffect, useRef, useState } from 'react';

// 匯入 Hero 圖片
import authHero1 from '@/assets/images/auth/authHero-1.png';
import authHero2 from '@/assets/images/auth/authHero-2.png';
import authHero3 from '@/assets/images/auth/authHero-3.png';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

// 輪播圖片陣列
const HERO_IMAGES = [authHero1, authHero2, authHero3];

const LoginCarousel: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
  const isAnimatingRef = useRef(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // GSAP utility for wrapping index
  const wrap = gsap.utils.wrap(0, HERO_IMAGES.length);
  
  // useGSAP for scoped animations and initialization
  const { contextSafe } = useGSAP(
    () => {
      const slides = slidesRef.current.filter(Boolean) as HTMLDivElement[];
      if (slides.length === 0) return;

      // Set initial positions: stack all slides, only first one visible
      gsap.set(slides, { xPercent: 0, opacity: 0, scale: 0.95 });
      gsap.set(slides[0], { opacity: 1, scale: 1 });
    },
    { scope: containerRef, dependencies: [] }
  );

  // Animation function using contextSafe
  const gotoSlide = contextSafe((direction: number) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const slides = slidesRef.current.filter(Boolean) as HTMLDivElement[];
    const newIndex = wrap(currentIndex + direction);
    const currentSlide = slides[currentIndex];
    const newSlide = slides[newIndex];

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimatingRef.current = false;
        setCurrentIndex(newIndex);
      },
    });

    // Animate current slide out
    tl.to(
      currentSlide,
      {
        xPercent: direction * -100,
        opacity: 0,
        scale: 0.95,
        duration: 0.6,
        ease: 'power2.inOut',
      },
      0,
    );

    // Animate new slide in (start from opposite side)
    tl.fromTo(
      newSlide,
      {
        xPercent: direction * 100,
        opacity: 0,
        scale: 0.95,
      },
      {
        xPercent: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: 'power2.inOut',
      },
      0,
    );

    // Reset current slide position after animation
    tl.set(currentSlide, { xPercent: 0 });
  });

  // 自動輪播
  useEffect(() => {
    const interval = setInterval(() => {
      gotoSlide(1);
    }, 3500);
    return () => clearInterval(interval);
  }, [gotoSlide]);

  // 直接跳轉到指定 index
  const gotoSlideByIndex = contextSafe((targetIndex: number) => {
    if (isAnimatingRef.current || targetIndex === currentIndex) return;
    isAnimatingRef.current = true;

    const slides = slidesRef.current.filter(Boolean) as HTMLDivElement[];
    const currentSlide = slides[currentIndex];
    const newSlide = slides[targetIndex];
    const direction = targetIndex > currentIndex ? 1 : -1;

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimatingRef.current = false;
        setCurrentIndex(targetIndex);
      },
    });

    // Animate current slide out
    tl.to(
      currentSlide,
      {
        xPercent: direction * -100,
        opacity: 0,
        scale: 0.95,
        duration: 0.6,
        ease: 'power2.inOut',
      },
      0,
    );

    // Animate new slide in
    tl.fromTo(
      newSlide,
      {
        xPercent: direction * 100,
        opacity: 0,
        scale: 0.95,
      },
      {
        xPercent: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        ease: 'power2.inOut',
      },
      0,
    );

    // Reset current slide position after animation
    tl.set(currentSlide, { xPercent: 0 });
  });

  // 手動切換
  const goToSlide = (index: number) => {
    if (!isAnimatingRef.current && index !== currentIndex) {
      gotoSlideByIndex(index);
    }
  };

  return (
    <div className="flex flex-col mb-6">
      {/* 輪播容器 */}
      <div
        ref={containerRef}
        className="relative w-full rounded-xl overflow-hidden mb-4"
        style={{ aspectRatio: '1416/2052' }}
      >
        {/* Slides - 使用絕對定位堆疊 */}
        {HERO_IMAGES.map((image, index) => (
          <div
            key={index}
            ref={(el) => {
              slidesRef.current[index] = el;
            }}
            className="absolute inset-0 will-change-transform"
          >
            <img
              src={image}
              alt={`Hero Slide ${index + 1}`}
              className="w-full h-full object-contain"
            />

          </div>
        ))}
      </div>

      {/* 分頁指示器 */}
      <div className="flex justify-center gap-1">
        {HERO_IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              currentIndex === index
                ? 'bg-neutral-800 w-1 h-1'
                : 'bg-neutral-300 w-1 h-1 hover:bg-neutral-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default LoginCarousel;
