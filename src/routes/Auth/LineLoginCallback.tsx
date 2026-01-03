import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { authApi, authService } from '@/modules/auth';
import { identity } from '@/shared/utils/identity';

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
  const [loginSuccess, setLoginSuccess] = useState(false);
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
          window.opener?.postMessage(
            { type: 'LINE_LOGIN_ERROR', error: errorMsg },
            '*',
          );
          setTimeout(() => window.close(), 2000);
        } else {
          setTimeout(() => navigate('/auth/login'), 2500);
        }
        return;
      }

      try {
        // 清除登出標記，確保後續 API 呼叫正常
        identity.onLoginSuccess();

        // 呼叫 Profile API 確認 Cookie 已設定
        const response = await authApi.getProfile();

        // 將 API 回傳的資料轉換為 User 格式並儲存
        const userData = {
          id: response.data.id,
          lineId: response.data.lineId,
          name: response.data.name,
          displayName: response.data.name,
          avatar: response.data.profilePictureUrl ?? '',
          pictureUrl: response.data.profilePictureUrl ?? undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          gender: response.data.gender,
          customGender: response.data.customGender,
          email: response.data.email || undefined,
          dietaryPreference: response.data.preference ? {
            cookingFrequency: '1-2' as const,
            prepTime: '15-30' as const,
            seasoningLevel: 'moderate' as const,
            restrictions: []
          } : undefined,
        };

        // 儲存到 localStorage（作為備份）
        authService.saveUser(userData);

        // 判斷是否在 Popup 視窗中
        if (isPopupWindow()) {
          // 通知父視窗登入成功
          // 通知父視窗登入成功
          console.log('[LineLoginCallback] Sending success message to opener. Opener exists:', !!window.opener);
          if (window.opener) {
            window.opener.postMessage(
              { type: 'LINE_LOGIN_SUCCESS', user: userData },
              '*',
            );
          } else {
             console.error('[LineLoginCallback] window.opener is missing, cannot notify parent!');
          }

          // 關閉 Popup 視窗
          window.close();
        } else {
          // 非 Popup 模式（Redirect 模式）：更新快取並導向首頁
          setIsProcessing(false);
          setLoginSuccess(true);

          // 使快取失效並重新取得用戶資料
          await queryClient.invalidateQueries({
            queryKey: ['GET_USER_PROFILE'],
          });

          // 稍微延遲讓用戶看到成功訊息
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 800);
        }
      } catch (err) {
        console.error('LINE 登入驗證失敗:', err);
        setError('登入失敗，請重試');
        setIsProcessing(false);

        if (isPopupWindow()) {
          window.opener?.postMessage(
            { type: 'LINE_LOGIN_ERROR', error: '登入失敗' },
            '*',
          );
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
          <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-primary-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <p className="text-primary-500 font-medium mb-2">{error}</p>
          <p className="text-sm text-neutral-400">
            {isPopupWindow() ? '視窗即將關閉...' : '正在返回登入頁面...'}
          </p>
        </div>
      ) : loginSuccess ? (
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-success-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-success-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-success-600 font-medium">登入成功！</p>
          <p className="text-sm text-neutral-400 mt-1">正在導向首頁...</p>
        </div>
      ) : isProcessing ? (
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-primary-300 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-success-600 font-medium">正在完成登入...</p>
          <p className="text-sm text-neutral-400 mt-1">請稍候</p>
        </div>
      ) : null}
    </div>
  );
};

export default LineLoginCallback;
