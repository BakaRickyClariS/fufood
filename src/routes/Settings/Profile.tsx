import { mockRequestHandlers } from '@/utils/debug/mockRequestHandlers';
import { User, RefreshCcw, LogOut } from 'lucide-react';
import { useAuth } from '@/modules/auth';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Profile = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleResetData = () => {
    if (
      window.confirm(
        '確定要重置所有模擬資料嗎？這將會清除您目前所有的操作紀錄並回復到預設值。',
      )
    ) {
      mockRequestHandlers.resetData();
      window.location.reload();
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    try {
      // 呼叫 useAuth 的 logout 方法
      // 這會清除 HttpOnly Cookie 和 TanStack Query 快取
      await logout();
      
      // 導向登入頁面
      navigate('/auth/login', { replace: true });
    } catch (error) {
      console.error('登出失敗:', error);
      // 即使失敗也嘗試導向登入頁面
      navigate('/auth/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-slate-950 px-6 py-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <User className="w-8 h-8 text-primary-500" />
          個人設定
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          管理您的帳號與應用程式偏好
        </p>
      </div>

      <div className="max-w-layout-container mx-auto px-4 py-6 space-y-6">
        {/* 開發者選項 */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <RefreshCcw className="w-5 h-5 text-orange-500" />
            開發與除錯工具
          </h2>
          <div className="space-y-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              如果您遇到資料顯示異常或想要重新開始測試，可以使用下方按鈕重置所有資料。
            </p>
            <button
              onClick={handleResetData}
              className="w-full py-3 px-4 bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:hover:bg-orange-900/50 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              重置所有模擬資料 (Reset Mock Data)
            </button>
          </div>
        </div>

        {/* 帳號操作 */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">
            帳號操作
          </h2>
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full py-3 px-4 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-4 h-4" />
            {isLoggingOut ? '登出中...' : '登出'}
          </button>
        </div>

        <div className="text-center text-xs text-slate-400 py-4">
          版本: v1.0.0 (PWA Enabled)
        </div>
      </div>
    </div>
  );
};

export default Profile;
