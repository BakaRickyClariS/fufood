import { useEffect, useState, useCallback, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LineLoginUrl, useAuth, authService } from '@/modules/auth';
import { identity } from '@/shared/utils/identity';
import LoginCarousel from './LoginCarousel';
import { Bot, X } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();

  const { isLoading, isAuthenticated, refetch, error: authError } = useAuth();
  const popupWindowRef = useRef<Window | null>(null);
  const checkIntervalRef = useRef<number | null>(null);
  const popupTimeoutRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [lineLoginLoading, setLineLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showProjectNotice, setShowProjectNotice] = useState(true);

  // 處理 LineLoginCallback 發送的 postMessage
  const handlePopupMessage = useCallback(
    (e: MessageEvent) => {
      // [Debug] Log all messages to debug LINE Login issues
      console.log('[Login] Received message:', {
        type: e.data?.type,
        origin: e.origin,
        currentOrigin: window.location.origin,
        data: e.data
      });

      // 允許的來源列表
      const allowedOrigins = [
        window.location.origin,
        'https://fufood.jocelynh.me', // Production domain
        'http://localhost:5173',       // Localhost
        'http://127.0.0.1:5173'
      ];

      // 檢查來源是否在允許列表中
      if (!allowedOrigins.includes(e.origin)) {
        console.warn('[Login] Message rejected due to origin mismatch:', e.origin, 'Allowed:', allowedOrigins);
        return;
      }

      // 檢查是否為 LINE 登入成功與錯誤訊息
      if (e.data?.type === 'LINE_LOGIN_ERROR') {
         setLoginError(e.data.error || '登入失敗');
         setLineLoginLoading(false);
         if (checkIntervalRef.current) {
            clearInterval(checkIntervalRef.current);
            checkIntervalRef.current = null;
         }
         popupWindowRef.current?.close();
         return;
      }

      if (e.data?.type === 'LINE_LOGIN_SUCCESS') {
        // [關鍵] 在導航前確保 user 資料已存入 localStorage
        if (e.data.user) {
          console.log('[Login] Received user data from popup, saving to localStorage');
          authService.saveUser(e.data.user);
        }

        // 清除登出標記，讓 API 正常運作
        identity.onLoginSuccess();

        // 清除 popup 監聯定時器
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }

        // 關閉 popup
        popupWindowRef.current?.close();

        // 直接導航到首頁，讓首頁的 useAuth 重新評估狀態
        // 不再依賴 refetch()，因為它可能有 stale enabled 狀態
        setLineLoginLoading(false);
        navigate('/');
      }
    },
    [navigate],
  );

  useEffect(() => {
    window.addEventListener('message', handlePopupMessage);
    return () => {
      window.removeEventListener('message', handlePopupMessage);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }
    };
  }, [handlePopupMessage]);

  // 當已認證時，播放轉場動畫後導向首頁
  // 使用 useGSAP 自動處理動畫和 cleanup
  useGSAP(
    () => {
      if (isAuthenticated && !isTransitioning) {
        setLineLoginLoading(false);
        setIsTransitioning(true);

        // GSAP 轉場動畫：淡出 + 輕微放大
        gsap.to(containerRef.current, {
          opacity: 0,
          scale: 1.02,
          duration: 0.25,
          ease: 'power2.out',
          onComplete: () => {
            navigate('/');
          },
        });
      }
    },
    { scope: containerRef, dependencies: [isAuthenticated, isTransitioning] },
  );

  // 防止重複檢查初始狀態（避免無限循環）
  const hasInitialCheckRef = useRef(false);

  // 頁面載入時，如果正在檢查認證狀態，顯示 loading
  // 使用 ref 確保只在首次載入時執行一次
  useEffect(() => {
    if (!hasInitialCheckRef.current && isLoading) {
      hasInitialCheckRef.current = true;
      setLineLoginLoading(true);
    }
    // 當初次檢查完成後，停止 loading 狀態
    if (hasInitialCheckRef.current && !isLoading) {
      setLineLoginLoading(false);
    }
  }, [isLoading]);

  const handleLineLogin = useCallback(() => {
    setLineLoginLoading(true);
    setLoginError(null);

    // 清除登出標記（準備登入）
    sessionStorage.removeItem('logged_out');

    // 取得登入模式設定：popup | redirect | auto
    const loginMode = import.meta.env.VITE_LINE_LOGIN_MODE || 'auto';

    // 檢測是否為 PWA standalone 模式
    const isPWAStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;

    // 檢測是否為 iOS
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    // 檢測是否為移動裝置
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // 判斷是否使用 redirect 模式
    // 1. 環境變數強制指定 redirect
    // 2. auto 模式下：
    //    - iOS PWA：使用 popup（redirect 在 iOS PWA 會有問題）
    //    - 其他 PWA standalone 或移動裝置：使用 redirect
    const isIOSPWA = isIOS && isPWAStandalone;
    const useRedirect =
      loginMode === 'redirect' ||
      (loginMode === 'auto' && !isIOSPWA && (isPWAStandalone || isMobile));

    // 除錯訊息（可在瀏覽器 Console 查看）
    console.log('[LINE Login]', {
      loginMode,
      isPWAStandalone,
      isIOS,
      isIOSPWA,
      isMobile,
      useRedirect,
    });

    // Redirect 模式：使用直接跳轉（適合 PWA standalone 和移動裝置）
    if (useRedirect) {
      window.location.href = LineLoginUrl;
      return;
    }

    // 瀏覽器模式：使用 popup 視窗
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    // [Fix] 用戶在 Localhost 開發時，強制指定 Callback URL 回到 Localhost
    // 這樣 Popup 就會是同源 (Same-Origin)，避免 window.opener 遺失問題
    // 注意：後端參數名稱為 'ref'，不是 'redirectUrl'
    let finalLoginUrl = LineLoginUrl;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      const callbackUrl = `${window.location.origin}/auth/line/callback`;
      const separator = finalLoginUrl.includes('?') ? '&' : '?';
      finalLoginUrl = `${finalLoginUrl}${separator}ref=${encodeURIComponent(callbackUrl)}`;
    }

    const popup = window.open(
      finalLoginUrl,
      'lineLogin',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`,
    );

    if (!popup) {
      setLoginError('無法開啟登入視窗，請檢查是否有彈出視窗被封鎖');
      setLineLoginLoading(false);
      return;
    }

    popupWindowRef.current = popup;

    // 監聽 popup 關閉（當用戶手動關閉或登入完成時）
    checkIntervalRef.current = window.setInterval(() => {
      if (popup.closed) {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }

        // Popup 被關閉，重新取得用戶資料
        refetch().finally(() => {
          setLineLoginLoading(false);
        });
      }
    }, 500);

    // Popup 登入超時備援（30 秒）
    // 當後端 callback 沒有正確重定向到前端時，popup 不會自動關閉
    // 此時需要超時備援來停止 loading 狀態
    popupTimeoutRef.current = window.setTimeout(() => {
      // 如果 30 秒後還在等待，檢查登入狀態
      if (checkIntervalRef.current) {
        console.warn('[LINE Login] Popup 登入超時，正在檢查登入狀態...');
        refetch().finally(() => {
          setLineLoginLoading(false);
          // 如果 popup 還開著，可能是後端 callback 設定問題
          if (!popup.closed) {
            setLoginError('登入逾時，請手動關閉登入視窗後重試');
          }
        });
      }
    }, 30000);
  }, [refetch]);

  const displayError = loginError || authError;

  return (
    <div ref={containerRef} className="flex flex-col min-h-screen px-5 my-8">
      {/* 學生專題作品提示框 */}
      {showProjectNotice ? (
        <div className="mb-[18px] p-4 bg-warning-50 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* 左側 Icon */}
          <Bot className="w-6 h-6 text-neutral-600 shrink-0" />
          
          {/* 中間文字 */}
          <p className="flex-1 text-neutral-600 text-sm font-semibold leading-relaxed">
            此產品為學生專題作品，僅學習與展示用，並沒有提供任何服務及商業行為。
          </p>

          {/* 右側關閉按鈕 */}
          <button
            onClick={() => setShowProjectNotice(false)}
            className="text-neutral-700 hover:text-neutral-900 font-bold transition-colors shrink-0"
          >
            <X size={20} />
          </button>
        </div>
      ) : (
        <div className="mt-8" />
      )}

      <LoginCarousel />

      {/* 登入按鈕區域 */}
      <div className="flex flex-col gap-4">
        {displayError && (
          <div className="text-primary-500 text-sm text-center bg-primary-50 p-2 rounded-lg">
            {String(displayError)}
          </div>
        )}

        <Button
          className="w-full bg-primary-500 hover:bg-primary-600 text-white h-12 text-base rounded-lg"
          onClick={handleLineLogin}
          disabled={isLoading || lineLoginLoading}
        >
          {lineLoginLoading ? '登入中...' : '使用LINE應用程式登入'}
        </Button>

        {/* <Button
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
        </div> */}
      </div>
    </div>
  );
};

export default Login;
