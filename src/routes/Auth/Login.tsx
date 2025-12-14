import {
  useEffect,
  useState,
  useCallback,
  useLayoutEffect,
  useRef,
} from 'react';
import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth, authService } from '@/modules/auth';
import gsap from 'gsap';

// 匯入 Hero 圖片
import authHeroImage from '@/assets/images/auth/authHero.png';

// 輪播配置（暫時使用同一張圖片）
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
  const { isLoading, getLineLoginUrl, refreshUser } = useAuth();
  const [lineLoginLoading, setLineLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  // 自動輪播 - 5秒
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // GSAP 動畫 - 移動 Track
  useLayoutEffect(() => {
    if (!trackRef.current) return;

    gsap.to(trackRef.current, {
      x: `-${currentSlide * 100}%`,
      duration: 0.8,
      ease: 'power2.inOut',
    });
  }, [currentSlide]);

  const handleEmailLogin = async () => {
    navigate('/auth/avatar-selection');
  };

  const handleLineLogin = useCallback(() => {
    // ... (保留原有 LINE 登入邏輯，此處省略以節省篇幅，僅修改 UI 部分)
    // 由於 replace_file_content 限制，我將在下面完整保留 handleLineLogin 的邏輯
    setLineLoginLoading(true);
    setLoginError(null);

    const loginUrl = getLineLoginUrl();
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    const popup = window.open(
      loginUrl,
      'lineLogin',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`,
    );

    if (!popup) {
      setLoginError('無法開啟登入視窗，請檢查是否有彈出視窗被封鎖');
      setLineLoginLoading(false);
      return;
    }

    const checkPopup = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(checkPopup);
          setLineLoginLoading(false);
          return;
        }

        const popupUrl = popup.location.href;

        if (
          popupUrl.includes('/oauth/line/callback') ||
          popupUrl.includes('api.fufood.jocelynh.me')
        ) {
          setTimeout(() => {
            try {
              const bodyContent =
                popup.document.body.innerText ||
                popup.document.body.textContent;

              if (bodyContent) {
                const userData = JSON.parse(bodyContent);

                if (userData && (userData.id || userData.lineId)) {
                  const mockToken = {
                    accessToken: `line_auth_${Date.now()}`,
                    refreshToken: `line_refresh_${Date.now()}`,
                    expiresIn: 3600,
                  };

                  const user = {
                    id: userData.id || userData.lineId,
                    lineId: userData.lineId,
                    name: userData.name || userData.displayName,
                    displayName: userData.name || userData.displayName,
                    avatar: userData.profilePictureUrl || '',
                    pictureUrl: userData.profilePictureUrl,
                    createdAt: userData.createdAt
                      ? new Date(userData.createdAt)
                      : new Date(),
                  };

                  authService.saveToken(mockToken);
                  authService.saveUser(user);

                  popup.close();
                  clearInterval(checkPopup);

                  refreshUser();
                  navigate('/', { replace: true });
                } else {
                  throw new Error('無效的用戶資料');
                }
              }
            } catch (parseError) {
              console.error('解析登入資料失敗:', parseError);
            }
          }, 500);
        }
      } catch {
        // Cross-origin error, waiting
      }
    }, 500);

    setTimeout(() => {
      clearInterval(checkPopup);
      if (!popup.closed) {
        popup.close();
      }
      setLineLoginLoading(false);
    }, 120000);
  }, [getLineLoginUrl, navigate, refreshUser]);

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

  const displayError = loginError || useAuth().error;

  return (
    <div className="flex flex-col min-h-screen bg-white p-6 pb-24">
      {/* Hero 輪播區域 - 滿版圖片、文字在內 */}
      <div className="flex-1 flex flex-col justify-center mb-6 relative">
        <div className="w-full aspect-[4/5] rounded-[32px] overflow-hidden relative shadow-sm">
          {/* Track */}
          <div
            ref={trackRef}
            className="flex h-full w-full"
            style={{ width: `${HERO_SLIDES.length * 100}%` }}
          >
            {HERO_SLIDES.map((slide) => (
              <div
                key={slide.id}
                className="relative h-full w-full flex-shrink-0"
                style={{ width: `${100 / HERO_SLIDES.length}%` }}
              >
                {/* 圖片 */}
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                {/* 漸層遮罩，讓文字更清晰 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* 文字內容 */}
                <div className="absolute bottom-12 left-0 right-0 p-6 text-white text-center">
                  <h1 className="text-2xl font-bold mb-2 shadow-sm">
                    {slide.title}
                  </h1>
                  <h2 className="text-xl font-medium mb-3 shadow-sm">
                    {slide.subtitle}
                  </h2>
                  <p className="text-sm opacity-90 whitespace-pre-line leading-relaxed shadow-sm">
                    {slide.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 分頁指示器 (疊加在圖片上) */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
            {HERO_SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`transition-all duration-300 rounded-full shadow-sm ${
                  currentSlide === index
                    ? 'bg-white w-6 h-1.5'
                    : 'bg-white/50 w-1.5 h-1.5 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
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
          className="w-full bg-[#06C755] hover:bg-[#05b64d] text-white h-12 text-base rounded-xl shadow-sm"
          onClick={handleLineLogin}
          disabled={isLoading || lineLoginLoading}
        >
          {lineLoginLoading ? '登入中...' : '使用LINE應用程式登入'}
        </Button>

        <Button
          variant="outline"
          className="w-full border-neutral-200 text-neutral-700 h-12 text-base rounded-xl hover:bg-neutral-50"
          onClick={handleEmailLogin}
          disabled={isLoading || lineLoginLoading}
        >
          使用電子郵件帳號登入
        </Button>

        <div className="flex justify-center mt-2">
          <button className="text-sm text-neutral-500 font-medium hover:text-neutral-800 transition-colors">
            忘記密碼？
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
