import { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth';
import LoginCarousel from './LoginCarousel';

const Login = () => {
  const navigate = useNavigate();
  const { isLoading, getLineLoginUrl, error: authError } = useAuth();

  const [lineLoginLoading, setLineLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Refs
  // OAuth popup 計時器 refs（用於清理避免記憶體洩漏）
  const popupIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const popupTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEmailLogin = async () => {
    navigate('/auth/avatar-selection');
  };

  // 清理 popup 計時器的函式
  const clearPopupTimers = useCallback(() => {
    if (popupIntervalRef.current) {
      clearInterval(popupIntervalRef.current);
      popupIntervalRef.current = null;
    }
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current);
      popupTimeoutRef.current = null;
    }
  }, []);

  // 元件卸載時清理計時器，避免記憶體洩漏
  useEffect(() => {
    return () => {
      clearPopupTimers();
    };
  }, [clearPopupTimers]);

  const handleLineLogin = useCallback(() => {
    setLineLoginLoading(true);
    setLoginError(null);

    // 先清理之前可能存在的計時器
    clearPopupTimers();

    const loginUrl = getLineLoginUrl();
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    // 開啟 popup 視窗（PWA 友好）
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
  }, []);

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
