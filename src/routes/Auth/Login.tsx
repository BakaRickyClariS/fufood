import { useEffect, useState, useCallback, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth, authService, authApi } from '@/modules/auth';
import { identity } from '@/shared/utils/identity';
import { groupsApi } from '@/modules/groups/api/groupsApi';
import LoginCarousel from './LoginCarousel';
import { Bot, X } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
    async (e: MessageEvent) => {
      // [Debug] Log all messages to debug LINE Login issues
      console.log('[Login] Received message:', {
        type: e.data?.type,
        origin: e.origin,
        currentOrigin: window.location.origin,
        data: e.data,
      });

      // 允許的來源列表
      const allowedOrigins = [
        window.location.origin,
        'https://fufood.jocelynh.me', // Production domain
        'http://localhost:5173', // Localhost
        'http://127.0.0.1:5173',
      ];

      // 檢查來源是否在允許列表中
      if (!allowedOrigins.includes(e.origin)) {
        console.warn(
          '[Login] Message rejected due to origin mismatch:',
          e.origin,
          'Allowed:',
          allowedOrigins,
        );
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
        // [關鍵] 在導航前確保 user 資料已存入 localStorage 及 TanStack Query 快取
        if (e.data.user) {
          console.log(
            '[Login] Received user data from popup, saving to localStorage and query cache',
          );
          authService.saveUser(e.data.user);
          // 直接設定 TanStack Query 快取，讓 useAuth 立即取得用戶資料
          queryClient.setQueryData(['GET_USER_PROFILE'], e.data.user);

          // [新增] 初始化 activeGroupId：
          // 為了避免 Dashboard 載入時因為沒有群組 ID 而導致 API 失敗，
          // 我們在登入當下就先抓取群組列表，並設定預設 ID。
          try {
            console.log(
              '[Login] 正在預先抓取群組資料以初始化 activeGroupId...',
            );
            const groups = await groupsApi.getAll();
            if (groups && groups.length > 0) {
              const defaultGroupId = groups[0].id;
              console.log(
                '[Login] 設定預設 activeGroupId:',
                defaultGroupId,
              );
              localStorage.setItem('activeGroupId', defaultGroupId);
            } else {
              console.log('[Login] 用戶沒有群組，無法設定預設 ID');
            }
          } catch (err) {
            console.warn('[Login] 預先抓取群組失敗 (非致命錯誤):', err);
          }
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

        setLineLoginLoading(false);

        // 強制刷新頁面以確保 Cookie 和狀態完全同步
        window.location.href = '/';
      }
    },
    [navigate, queryClient],
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

  // 跳轉到電子郵件登入頁面
  const handleEmailLogin = useCallback(() => {
    navigate('/auth/login/email');
  }, [navigate]);

  const getLineRedirectUrl = useCallback(async (): Promise<string | null> => {
    try {
      const { authUrl } = await authApi.lineInit();
      return authUrl ?? null;
    } catch (err) {
      console.error('[LINE Login] 取得 authUrl 失敗:', err);
      return null;
    }
  }, []);

  const handleLineLogin = useCallback(async () => {
    setLineLoginLoading(true);
    setLoginError(null);

    // 清除登出標記（準備登入）
    sessionStorage.removeItem('logged_out');

    // POST /api/v2/auth/line/init 取得 LINE OAuth redirectUrl
    const authUrl = await getLineRedirectUrl();
    if (!authUrl) {
      setLoginError('無法取得 LINE 登入連結，請稍後再試');
      setLineLoginLoading(false);
      return;
    }

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
    const isIOSPWA = isIOS && isPWAStandalone;
    const useRedirect =
      loginMode === 'redirect' ||
      (loginMode === 'auto' && !isIOSPWA && (isPWAStandalone || isMobile));

    console.log('[LINE Login]', {
      loginMode,
      authUrl,
      isPWAStandalone,
      isIOS,
      isIOSPWA,
      isMobile,
      useRedirect,
    });

    // Redirect 模式：直接跳轉 LINE OAuth 頁面
    if (useRedirect) {
      window.location.href = authUrl;
      return;
    }

    // Popup 模式
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    const popup = window.open(
      authUrl,
      'lineLogin',
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`,
    );

    if (!popup) {
      setLoginError('無法開啟登入視窗，請檢查是否有彈出視窗被封鎖');
      setLineLoginLoading(false);
      return;
    }

    popupWindowRef.current = popup;

    checkIntervalRef.current = window.setInterval(() => {
      if (popup.closed) {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
        refetch().finally(() => {
          setLineLoginLoading(false);
        });
      }
    }, 500);

    popupTimeoutRef.current = window.setTimeout(() => {
      if (checkIntervalRef.current) {
        console.warn('[LINE Login] Popup 登入超時，正在檢查登入狀態...');
        refetch().finally(() => {
          setLineLoginLoading(false);
          if (!popup.closed) {
            setLoginError('登入逾時，請手動關閉登入視窗後重試');
          }
        });
      }
    }, 30000);
  }, [getLineRedirectUrl, refetch]);

  const displayError = loginError || authError;

  return (
    <div
      ref={containerRef}
      className="flex flex-col min-h-screen px-5 py-8 max-w-layout-container mx-auto w-full"
    >
      {/* 學生專題作品提示框 */}
      {showProjectNotice ? (
        <div className="mb-3 p-3 bg-warning-50 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* 左側 Icon */}
          <Bot className="w-5 h-5 text-neutral-600 shrink-0" />

          {/* 中間文字 */}
          <p className="flex-1 text-neutral-600 text-xs font-semibold leading-relaxed">
            此產品為學生專題作品，僅學習與展示用，並沒有提供任何服務及商業行為。
          </p>

          {/* 右側關閉按鈕 */}
          <button
            onClick={() => setShowProjectNotice(false)}
            className="text-neutral-700 hover:text-neutral-900 font-bold transition-colors shrink-0"
          >
            <X size={16} />
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

        <Button
          variant="outline"
          className="w-full border-neutral-200 text-neutral-700 h-12 text-base rounded-lg hover:bg-neutral-50"
          onClick={handleEmailLogin}
          disabled={isLoading || lineLoginLoading}
        >
          使用電子郵件帳號登入
        </Button>

        <div className="flex justify-center">
          <button
            onClick={() => navigate('/forgot-password')}
            className="text-sm text-neutral-500 font-medium hover:text-neutral-800 transition-colors"
          >
            忘記密碼？
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
