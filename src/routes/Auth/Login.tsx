import { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// 匯入 Hero 圖片
import authHeroImage from '@/assets/images/auth/authHero.png';

// 輪播配置
const HERO_SLIDES = [
  {
    id: 1,
    image: authHeroImage,
    title: '快用 FuFood',
    subtitle: '來管理冰箱庫存吧！',
    caption: 'AI 智慧辨識入庫，\n你的隨身食材管家',
  },
  {
    id: 2,
    image: authHeroImage,
    title: '智慧食材管理',
    subtitle: '讓生活更輕鬆！',
    caption: '輕鬆追蹤過期日，\n減少食物浪費',
  },
  {
    id: 3,
    image: authHeroImage,
    title: '共享冰箱',
    subtitle: '與家人一起管理！',
    caption: '邀請家人加入群組，\n一起管理家中庫存',
  },
];

const Login = () => {
  const navigate = useNavigate();
  const {
    isLoading,
    getLineLoginUrl,
    refreshUser,
    error: authError,
  } = useAuth();

  const [lineLoginLoading, setLineLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const slidesRef = useRef<(HTMLDivElement | null)[]>([]);
  const isAnimatingRef = useRef(false);

  // GSAP utility for wrapping index
  const wrap = gsap.utils.wrap(0, HERO_SLIDES.length);

  // useGSAP for scoped animations
  const { contextSafe } = useGSAP({ scope: containerRef });

  // Initialize slide positions
  useEffect(() => {
    const slides = slidesRef.current.filter(Boolean) as HTMLDivElement[];
    if (slides.length === 0) return;

    // Set initial positions: stack all slides, only first one visible
    gsap.set(slides, { xPercent: 0, opacity: 0, scale: 0.95 });
    gsap.set(slides[0], { opacity: 1, scale: 1 });
  }, []);

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

  // 手動切換
  const goToSlide = (index: number) => {
    if (!isAnimatingRef.current && index !== currentIndex) {
      gotoSlideByIndex(index);
    }
  };

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

  const handleEmailLogin = async () => {
    navigate('/auth/avatar-selection');
  };

  const handleLineLogin = useCallback(() => {
    setLineLoginLoading(true);
    setLoginError(null);

    // 直接跳轉至後端 LINE OAuth 入口
    // 後端完成授權後會設定 HttpOnly Cookie 並重導回 /auth/line/callback
    const loginUrl = getLineLoginUrl();
    window.location.href = loginUrl;
  }, [getLineLoginUrl]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' && e.newValue) {
        refreshUser();
        navigate('/', { replace: true });
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate, refreshUser]);

  const displayError = loginError || authError;

  return (
    <div className="flex flex-col min-h-screen bg-white px-5">
      {/* Hero 輪播區域 */}
      <div className="flex flex-col mb-6 pt-8">
        {/* 輪播容器 */}
        <div
          ref={containerRef}
          className="relative w-full rounded-[32px] overflow-hidden mb-4"
          style={{ aspectRatio: '4/5' }}
        >
          {/* Slides - 使用絕對定位堆疊 */}
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={slide.id}
              ref={(el) => {
                slidesRef.current[index] = el;
              }}
              className="absolute inset-0 will-change-transform"
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-12 left-0 right-0 p-6 text-white text-center">
                <h1 className="text-2xl font-bold mb-2">{slide.title}</h1>
                <h2 className="text-xl font-medium mb-3">{slide.subtitle}</h2>
                <p className="text-sm opacity-90 whitespace-pre-line leading-relaxed">
                  {slide.caption}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 分頁指示器 */}
        <div className="flex justify-center gap-2">
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                currentIndex === index
                  ? 'bg-neutral-800 w-2 h-2'
                  : 'bg-neutral-300 w-2 h-2 hover:bg-neutral-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 登入按鈕區域 */}
      <div className="flex flex-col gap-4">
        {displayError && (
          <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
            {displayError}
          </div>
        )}

        <Button
          className="w-full bg-[#f58274] hover:bg-[#e06d5f] text-white h-12 text-base rounded-lg"
          onClick={handleLineLogin}
          disabled={isLoading || lineLoginLoading}
        >
          {lineLoginLoading ? '登入中...' : '使用LINE應用程式登入'}
        </Button>

        <Button
          variant="outline"
          className="w-full border-neutral-200 text-neutral-700 h-12 text-base rounded-lg hover:bg-neutral-50"
          onClick={handleEmailLogin}
          disabled={isLoading || lineLoginLoading}
        >
          使用電子郵件帳號登入
        </Button>

        <div className="flex justify-center">
          <button className="text-sm text-neutral-500 font-medium hover:text-neutral-800 transition-colors">
            忘記密碼？
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
