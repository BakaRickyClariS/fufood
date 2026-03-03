import { useCallback, useRef, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Button } from '@/shared/components/ui/button';
import { useAuth, authApi, authService } from '@/modules/auth';
import { useQueryClient } from '@tanstack/react-query';
import { identity } from '@/shared/utils/identity';
import { groupsApi } from '@/modules/groups/api/groupsApi';
import LoginCarousel from './LoginCarousel';
import { Bot, X } from 'lucide-react';

const AuthSelect = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);

  const { isLoading, refetch } = useAuth();
  const [lineLoginLoading, setLineLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showProjectNotice, setShowProjectNotice] = useState(true);

  const popupWindowRef = useRef<Window | null>(null);
  const checkIntervalRef = useRef<number | null>(null);
  const popupTimeoutRef = useRef<number | null>(null);

  // 1. 攔截 query args 並存入 sessionStorage
  useEffect(() => {
    const inviteToken = searchParams.get('inviteToken');
    if (inviteToken) {
      sessionStorage.setItem('pendingInviteToken', inviteToken);
    }
  }, [searchParams]);

  // 進場動畫
  useGSAP(
    () => {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.4,
        ease: 'power2.out',
      });
    },
    { scope: containerRef },
  );

  // --- LINE 登入共用邏輯 (擷取自 Login.tsx) ---
  const handlePopupMessage = useCallback(
    async (e: MessageEvent) => {
      const allowedOrigins = [
        window.location.origin,
        'https://fufood.jocelynh.me',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
      ];

      if (!allowedOrigins.includes(e.origin)) return;

      if (e.data?.type === 'LINE_LOGIN_ERROR') {
        setLoginError(e.data.error || '登入失敗');
        setLineLoginLoading(false);
        if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        popupWindowRef.current?.close();
        return;
      }

      if (e.data?.type === 'LINE_LOGIN_SUCCESS') {
        if (e.data.user) {
          authService.saveUser(e.data.user);
          queryClient.setQueryData(['GET_USER_PROFILE'], e.data.user);

          // 初始化 activeGroupId
          try {
            const groups = await groupsApi.getAll();
            if (groups && groups.length > 0) {
              localStorage.setItem('activeGroupId', groups[0].id);
            }
          } catch (err) {
            console.warn('[AuthSelect] 預先抓取群組失敗:', err);
          }
        }

        identity.onLoginSuccess();
        if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        popupWindowRef.current?.close();
        setLineLoginLoading(false);

        // [關鍵差異] 改導向 /auth/success 讓它處理意圖恢復
        window.location.href = '/auth/success';
      }
    },
    [queryClient],
  );

  useEffect(() => {
    window.addEventListener('message', handlePopupMessage);
    return () => {
      window.removeEventListener('message', handlePopupMessage);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
    };
  }, [handlePopupMessage]);

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
    sessionStorage.removeItem('logged_out');

    const authUrl = await getLineRedirectUrl();
    if (!authUrl) {
      setLoginError('無法取得 LINE 登入連結，請稍後再試');
      setLineLoginLoading(false);
      return;
    }

    const loginMode = import.meta.env.VITE_LINE_LOGIN_MODE || 'auto';
    const isPWAStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    const isIOSPWA = isIOS && isPWAStandalone;
    const useRedirect =
      loginMode === 'redirect' ||
      (loginMode === 'auto' && !isIOSPWA && (isPWAStandalone || isMobile));

    if (useRedirect) {
      window.location.href = authUrl;
      return;
    }

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
        if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
        refetch().finally(() => setLineLoginLoading(false));
      }
    }, 500);

    popupTimeoutRef.current = window.setTimeout(() => {
      if (checkIntervalRef.current) {
        refetch().finally(() => {
          setLineLoginLoading(false);
          if (!popup.closed)
            setLoginError('登入逾時，請手動關閉登入視窗後重試');
        });
      }
    }, 30000);
  }, [getLineRedirectUrl, refetch]);

  // --- 導向 Email 登入 ---
  const handleEmailLogin = useCallback(() => {
    navigate('/auth/login/email');
  }, [navigate]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col min-h-screen px-5 py-8 max-w-layout-container mx-auto w-full"
    >
      {showProjectNotice ? (
        <div className="mb-3 p-3 bg-warning-50 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <Bot className="w-5 h-5 text-neutral-600 shrink-0" />
          <p className="flex-1 text-neutral-600 text-xs font-semibold leading-relaxed">
            此產品為學生專題作品，僅學習與展示用，並沒有提供任何服務及商業行為。
          </p>
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

      <div className="flex flex-col gap-4 mt-4">
        {/* 提示正在要求登入以繼續 */}
        <div className="text-center mb-2">
          <p className="text-neutral-800 font-medium">請先登入以繼續操作</p>
        </div>

        {loginError && (
          <div className="text-primary-500 text-sm text-center bg-primary-50 p-2 rounded-lg">
            {loginError}
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
      </div>
    </div>
  );
};

export default AuthSelect;
