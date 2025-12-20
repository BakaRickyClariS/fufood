import { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { LineLoginUrl, useAuth } from '@/modules/auth';
import LoginCarousel from './LoginCarousel';

const Login = () => {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated, refetch, error: authError } = useAuth();
  const popupWindowRef = useRef<Window | null>(null);
  const checkIntervalRef = useRef<number | null>(null);

  const [lineLoginLoading, setLineLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // 處理 LineLoginCallback 發送的 postMessage
  const handlePopupMessage = useCallback(
    (e: MessageEvent) => {
      // 只接收來自同源的 postMessage（LineLoginCallback 發送的）
      if (e.origin !== window.location.origin) {
        return;
      }

      // 清除登出標記，讓 getUserProfile 正常運作
      sessionStorage.removeItem('logged_out');

      // 清除 popup 監聽定時器
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
        checkIntervalRef.current = null;
      }

      refetch().then(() => {
        setLineLoginLoading(false);
        popupWindowRef.current?.close();
      });
    },
    [refetch],
  );

  useEffect(() => {
    window.addEventListener('message', handlePopupMessage);
    return () => {
      window.removeEventListener('message', handlePopupMessage);
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [handlePopupMessage]);

  const handleEmailLogin = async () => {
    navigate('/auth/avatar-selection');
  };

  // 當已認證時，導向首頁（包含頁面載入時的檢查）
  useEffect(() => {
    if (isAuthenticated) {
      setLineLoginLoading(false);
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // 頁面載入時如果還在載入中，設定 lineLoginLoading 為 true
  // 這樣可以讓 UI 顯示正確的載入狀態
  useEffect(() => {
    if (isLoading) {
      setLineLoginLoading(true);
    }
  }, [isLoading]);

  // 登入超時 fallback：如果 lineLoginLoading 超過 3 秒，自動檢查登入狀態
  // 這是 OAuth 流程的常見補救機制，確保 Cookie 設定成功後能正確跳轉
  useEffect(() => {
    if (!lineLoginLoading) return;

    const timeoutId = setTimeout(() => {
      // 超時後重新檢查登入狀態
      refetch().finally(() => {
        // 如果 refetch 後仍未登入，停止 loading 狀態
        // 讓使用者可以再次嘗試登入
        setLineLoginLoading(false);
      });
    }, 3000); // 3 秒後自動檢查

    return () => clearTimeout(timeoutId);
  }, [lineLoginLoading, refetch]);

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

    // 檢測是否為移動裝置（移動裝置 popup 體驗較差，建議用 redirect）
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    // 判斷是否使用 redirect 模式
    // 1. 環境變數強制指定 redirect
    // 2. auto 模式下：PWA standalone 或移動裝置都使用 redirect
    const useRedirect =
      loginMode === 'redirect' ||
      (loginMode === 'auto' && (isPWAStandalone || isMobile));

    // 除錯訊息（可在瀏覽器 Console 查看）
    console.log('[LINE Login]', {
      loginMode,
      isPWAStandalone,
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

    const popup = window.open(
      LineLoginUrl,
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
  }, [refetch]);

  const displayError = loginError || authError;

  return (
    <div className="flex flex-col min-h-screen bg-white px-5">
      <LoginCarousel />

      {/* 登入按鈕區域 */}
      <div className="flex flex-col gap-4">
        {displayError && (
          <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
            {String(displayError)}
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
