import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { authApi, authService } from '@/modules/auth';

/**
 * 檢測是否在 Popup 視窗中
 */
const isPopupWindow = (): boolean => {
  return window.opener !== null && window.opener !== window;
};

/**
 * LINE 登入回調頁面
 * 後端已透過 HttpOnly Cookie 設定 token，此頁面負責：
 * 1. 呼叫 Profile API 確認登入狀態
 * 2. 如果是 Popup 視窗：通知父視窗並關閉
 * 3. 如果是主視窗：使 TanStack Query 快取失效並導向首頁
 */
const LineLoginCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const verifyLogin = async () => {
      // 檢查 LINE 返回的錯誤
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (errorParam) {
        const errorMsg = errorDescription || 'LINE 登入被取消或發生錯誤';
        setError(errorMsg);
        setIsProcessing(false);
        
        // 如果是 Popup，通知父視窗錯誤後關閉
        if (isPopupWindow()) {
          window.opener?.postMessage({ type: 'LINE_LOGIN_ERROR', error: errorMsg }, '*');
          setTimeout(() => window.close(), 2000);
        } else {
          setTimeout(() => navigate('/auth/login'), 2500);
        }
        return;
      }

      try {
        // 呼叫 Profile API 確認 Cookie 已設定
        const response = await authApi.getProfile();
        
        // 將 API 回傳的資料轉換為 User 格式並儲存
        const userData = {
          id: response.data.id,
          lineId: response.data.lineId,
          name: response.data.name,
          displayName: response.data.name,
          avatar: response.data.profilePictureUrl,
          pictureUrl: response.data.profilePictureUrl,
          createdAt: new Date(),
        };
        
        // 儲存到 localStorage（作為備份）
        authService.saveUser(userData);

        // 判斷是否在 Popup 視窗中
        if (isPopupWindow()) {
          // 通知父視窗登入成功
          window.opener?.postMessage({ type: 'LINE_LOGIN_SUCCESS', user: userData }, '*');
          
          // 關閉 Popup 視窗
          window.close();
        } else {
          // 非 Popup 模式：直接更新快取並導向首頁
          await queryClient.invalidateQueries({ queryKey: ['GET_USER_PROFILE'] });
          navigate('/', { replace: true });
        }
      } catch (err) {
        console.error('LINE 登入驗證失敗:', err);
        setError('登入失敗，請重試');
        setIsProcessing(false);
        
        if (isPopupWindow()) {
          window.opener?.postMessage({ type: 'LINE_LOGIN_ERROR', error: '登入失敗' }, '*');
          setTimeout(() => window.close(), 2000);
        } else {
          setTimeout(() => navigate('/auth/login'), 2500);
        }
      }
    };

    verifyLogin();
  }, [searchParams, navigate, queryClient]);

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
          <p className="text-sm text-stone-400">
            {isPopupWindow() ? '視窗即將關閉...' : '正在返回登入頁面...'}
          </p>
        </div>
      ) : isProcessing ? (
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-[#f58274] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-stone-600 font-medium">正在完成登入...</p>
          <p className="text-sm text-stone-400 mt-1">請稍候</p>
        </div>
      ) : null}
    </div>
  );
};

export default LineLoginCallback;
