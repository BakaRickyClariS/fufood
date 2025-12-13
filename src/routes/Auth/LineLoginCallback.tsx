import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi, authService } from '@/modules/auth';

/**
 * LINE 登入回調頁面
 * 處理 LINE OAuth 回調，解析 code 並完成登入
 */
const LineLoginCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // 處理 LINE 返回的錯誤
      if (errorParam) {
        const errorMsg = errorDescription || 'LINE 登入被取消或發生錯誤';
        setError(errorMsg);
        setIsProcessing(false);
        setTimeout(() => navigate('/auth/login'), 2500);
        return;
      }

      // 驗證必要參數
      if (!code) {
        setError('無效的回調參數，缺少授權碼');
        setIsProcessing(false);
        setTimeout(() => navigate('/auth/login'), 2500);
        return;
      }

      try {
        // 呼叫後端 API 處理 LINE 登入
        const response = await authApi.handleLineCallback({ code, state: state || undefined });
        
        // 儲存 Token 及用戶資訊
        authService.saveToken(response.token);
        authService.saveUser(response.user);
        
        // 登入成功，導向首頁
        navigate('/', { replace: true });
      } catch (err) {
        console.error('LINE 登入失敗:', err);
        const message = err instanceof Error ? err.message : 'LINE 登入失敗，請稍後再試';
        setError(message);
        setIsProcessing(false);
        setTimeout(() => navigate('/auth/login'), 2500);
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      {error ? (
        <div className="text-center px-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-red-500 font-medium mb-2">{error}</p>
          <p className="text-sm text-stone-400">正在返回登入頁面...</p>
        </div>
      ) : isProcessing ? (
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-[#EE5D50] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-stone-600 font-medium">正在處理 LINE 登入...</p>
          <p className="text-sm text-stone-400 mt-1">請稍候</p>
        </div>
      ) : null}
    </div>
  );
};

export default LineLoginCallback;
