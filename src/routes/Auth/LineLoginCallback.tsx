import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authApi, authService } from '@/modules/auth';

/**
 * LINE 登入回調頁面
 * 後端已透過 HttpOnly Cookie 設定 token，此頁面負責：
 * 1. 呼叫 Profile API 確認登入狀態
 * 2. 儲存用戶資料到 localStorage
 * 3. 導向首頁
 */
const LineLoginCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const verifyLogin = async () => {
      // 檢查 LINE 返回的錯誤
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (errorParam) {
        const errorMsg = errorDescription || 'LINE 登入被取消或發生錯誤';
        setError(errorMsg);
        setIsProcessing(false);
        setTimeout(() => navigate('/auth/login'), 2500);
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
        
        authService.saveUser(userData);
        
        // 登入成功，導向首頁
        navigate('/', { replace: true });
      } catch (err) {
        console.error('LINE 登入驗證失敗:', err);
        setError('登入失敗，請重試');
        setIsProcessing(false);
        setTimeout(() => navigate('/auth/login'), 2500);
      }
    };

    verifyLogin();
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
          <div className="animate-spin w-10 h-10 border-4 border-[#f58274] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-stone-600 font-medium">正在完成登入...</p>
          <p className="text-sm text-stone-400 mt-1">請稍候</p>
        </div>
      ) : null}
    </div>
  );
};

export default LineLoginCallback;
