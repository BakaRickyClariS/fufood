import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth, authService } from '@/modules/auth';

const Login = () => {
  const navigate = useNavigate();
  const { isLoading, error, getLineLoginUrl, refreshUser } = useAuth();
  const [lineLoginLoading, setLineLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleEmailLogin = async () => {
    // 暫時導向到頭像選擇頁面，模擬登入流程
    navigate('/auth/avatar-selection');
  };

  /**
   * 處理 popup 視窗中導航到後端 callback URL 後的情況
   * 後端會直接返回 JSON，因此我們需要:
   * 1. 開啟 popup
   * 2. 偵測 popup URL 變化 (到達 callback URL)
   * 3. 讀取 popup 中的 JSON 內容
   * 4. 關閉 popup 並完成登入
   */
  const handleLineLogin = useCallback(() => {
    setLineLoginLoading(true);
    setLoginError(null);

    const loginUrl = getLineLoginUrl();
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    // 開啟 popup 視窗
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

    // 定期檢查 popup 狀態
    const checkPopup = setInterval(() => {
      try {
        // popup 被使用者關閉
        if (popup.closed) {
          clearInterval(checkPopup);
          setLineLoginLoading(false);
          return;
        }

        // 嘗試讀取 popup 的 URL（跨域時會拋出錯誤）
        const popupUrl = popup.location.href;

        // 檢查是否已到達後端 callback URL
        if (
          popupUrl.includes('/oauth/line/callback') ||
          popupUrl.includes('api.fufood.jocelynh.me')
        ) {
          // 等待一下讓頁面載入完成
          setTimeout(() => {
            try {
              // 嘗試讀取 popup 中的 body 內容（JSON）
              const bodyContent =
                popup.document.body.innerText ||
                popup.document.body.textContent;

              if (bodyContent) {
                const userData = JSON.parse(bodyContent);

                // 檢查是否有必要的用戶資料
                if (userData && (userData.id || userData.lineId)) {
                  // 建立 token（如果後端沒有返回，使用臨時 token）
                  const mockToken = {
                    accessToken: `line_auth_${Date.now()}`,
                    refreshToken: `line_refresh_${Date.now()}`,
                    expiresIn: 3600,
                  };

                  // 轉換用戶資料格式
                  const user = {
                    id: userData.id || userData.lineId,
                    lineId: userData.lineId,
                    name: userData.name || userData.displayName,
                    displayName: userData.name || userData.displayName,
                    avatar: userData.profilePictureUrl || '',
                    pictureUrl: userData.profilePictureUrl,
                    createdAt: userData.createdAt
                      ? new Date(userData.createdAt)
                      : new Date(),
                  };

                  // 儲存到 localStorage
                  authService.saveToken(mockToken);
                  authService.saveUser(user);

                  // 關閉 popup
                  popup.close();
                  clearInterval(checkPopup);

                  // 刷新用戶狀態並導向首頁
                  refreshUser();
                  navigate('/', { replace: true });
                } else {
                  throw new Error('無效的用戶資料');
                }
              }
            } catch (parseError) {
              console.error('解析登入資料失敗:', parseError);
              // 不要立即報錯，可能頁面還在載入
            }
          }, 500);
        }
      } catch {
        // 跨域錯誤，繼續等待
      }
    }, 500);

    // 設定超時（2 分鐘）
    setTimeout(() => {
      clearInterval(checkPopup);
      if (!popup.closed) {
        popup.close();
      }
      setLineLoginLoading(false);
    }, 120000);
  }, [getLineLoginUrl, navigate, refreshUser]);

  // 監聽 storage 事件（來自 LineLoginCallback 頁面）
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' && e.newValue) {
        // 用戶資料已更新，刷新並導向首頁
        refreshUser();
        navigate('/', { replace: true });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate, refreshUser]);

  const displayError = loginError || error;

  return (
    <div className="flex flex-col h-screen bg-white p-6">
      {/* Spacer to push content down */}
      <div className="flex-1" />

      {/* Content */}
      <div className="flex flex-col gap-4 mb-12">
        <div className="flex justify-center mb-4">
          <span className="text-2xl font-bold tracking-widest text-stone-400">
            ...
          </span>
        </div>

        {displayError && (
          <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
            {displayError}
          </div>
        )}

        <Button
          className="w-full bg-[#EE5D50] hover:bg-[#D94A3D] text-white h-12 text-base rounded-xl shadow-sm"
          onClick={handleLineLogin}
          disabled={isLoading || lineLoginLoading}
        >
          {lineLoginLoading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              登入中...
            </span>
          ) : (
            '使用LINE應用程式登入'
          )}
        </Button>

        <Button
          variant="outline"
          className="w-full border-stone-200 text-stone-700 h-12 text-base rounded-xl hover:bg-stone-50"
          onClick={handleEmailLogin}
          disabled={isLoading || lineLoginLoading}
        >
          使用電子郵件帳號登入
        </Button>

        <div className="flex justify-center mt-2">
          <button className="text-sm text-stone-800 font-medium hover:underline">
            忘記密碼？
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
