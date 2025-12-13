import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth';

const Login = () => {
  const navigate = useNavigate();
  const { isLoading, error, getLineLoginUrl } = useAuth();

  const handleEmailLogin = async () => {
    // 暫時導向到頭像選擇頁面，模擬登入流程
    navigate('/auth/avatar-selection');
  };

  const handleLineLogin = () => {
    // 直接跳轉至後端 LINE OAuth 入口
    const loginUrl = getLineLoginUrl();
    window.location.href = loginUrl;
  };

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

        {error && (
          <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
            {error}
          </div>
        )}

        <Button
          className="w-full bg-[#EE5D50] hover:bg-[#D94A3D] text-white h-12 text-base rounded-xl shadow-sm"
          onClick={handleLineLogin}
          disabled={isLoading}
        >
          使用LINE應用程式登入
        </Button>

        <Button
          variant="outline"
          className="w-full border-stone-200 text-stone-700 h-12 text-base rounded-xl hover:bg-stone-50"
          onClick={handleEmailLogin}
          disabled={isLoading}
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

