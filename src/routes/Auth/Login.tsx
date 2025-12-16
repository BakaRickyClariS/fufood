import { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { LineLoginUrl, useAuth } from '@/modules/auth';
import LoginCarousel from './LoginCarousel';

type LineLoginMessage = {
  type: 'LINE_LOGIN_SUCCESS' | 'LINE_LOGIN_ERROR';
  user?: unknown;
  error?: string;
};

const Login = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isLoading, isAuthenticated, error: authError } = useAuth();
  const popupWindowRef = useRef<Window | null>(null);
  const checkIntervalRef = useRef<number | null>(null);

  const [lineLoginLoading, setLineLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // 處理來自 Popup 的訊息
  const handlePopupMessage = useCallback(
    (e: MessageEvent<LineLoginMessage>) => {
      // 驗證訊息來源（可以是同源或後端重定向的頁面）
      const data = e.data;
      
      if (data?.type === 'LINE_LOGIN_SUCCESS') {
        setLineLoginLoading(false);
        
        // 更新 TanStack Query 快取
        queryClient.invalidateQueries({ queryKey: ['GET_USER_PROFILE'] });
        
        // 清除定時器
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
        
        // 導向首頁（由 useEffect 處理，因為 isAuthenticated 會變化）
      } else if (data?.type === 'LINE_LOGIN_ERROR') {
        setLineLoginLoading(false);
        setLoginError(data.error || '登入失敗');
        
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
      }
    },
    [queryClient],
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

  // 當已認證時，導向首頁
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLineLogin = useCallback(() => {
    setLineLoginLoading(true);
    setLoginError(null);

    const width = 500;
    const height = 600;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    // 開啟 popup 視窗（PWA 友好）
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

    // 監聽 Popup 關閉（備用方案，如果 postMessage 沒有收到）
    checkIntervalRef.current = window.setInterval(() => {
      if (popup.closed) {
        if (checkIntervalRef.current) {
          clearInterval(checkIntervalRef.current);
          checkIntervalRef.current = null;
        }
        
        // Popup 被關閉，嘗試重新取得用戶資料
        queryClient.invalidateQueries({ queryKey: ['GET_USER_PROFILE'] });
        setLineLoginLoading(false);
      }
    }, 500);
  }, [queryClient]);

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
