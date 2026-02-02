import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const EmailLogin = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 入場動畫
  useGSAP(
    () => {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.4,
        ease: 'power2.out',
      });
    },
    { scope: containerRef },
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('請填寫電子郵件和密碼');
      return;
    }

    setIsLoading(true);

    // TODO: 實作電子郵件登入 API
    // 目前顯示功能尚未開放提示
    setTimeout(() => {
      setError('此功能尚未開放，請使用 LINE 登入');
      setIsLoading(false);
    }, 1000);
  };

  const handleBack = () => {
    navigate('/login');
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col min-h-screen px-5 py-8 max-w-layout-container mx-auto w-full"
    >
      {/* 返回按鈕 */}
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-neutral-600 hover:text-neutral-800 transition-colors mb-6 self-start"
      >
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">返回</span>
      </button>

      {/* 標題區 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-800 mb-2">
          電子郵件登入
        </h1>
        <p className="text-neutral-500 text-sm">
          使用您的電子郵件帳號登入 FuFood
        </p>
      </div>

      {/* 登入表單 */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
        {/* 電子郵件輸入 */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-neutral-700 font-medium">
            電子郵件
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              size={20}
            />
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12 rounded-lg border-neutral-200 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* 密碼輸入 */}
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-neutral-700 font-medium">
            密碼
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              size={20}
            />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="輸入您的密碼"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 h-12 rounded-lg border-neutral-200 focus:border-primary-500 focus:ring-primary-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div className="text-primary-500 text-sm text-center bg-primary-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* 忘記密碼連結 */}
        <div className="flex justify-end">
          <button
            type="button"
            className="text-sm text-neutral-500 font-medium hover:text-neutral-800 transition-colors"
          >
            忘記密碼？
          </button>
        </div>

        {/* 提交按鈕 */}
        <div className="mt-auto pt-4">
          <Button
            type="submit"
            className="w-full bg-primary-500 hover:bg-primary-600 text-white h-12 text-base rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? '登入中...' : '登入'}
          </Button>

          {/* 註冊連結 */}
          <div className="flex justify-center mt-4 gap-1">
            <span className="text-sm text-neutral-500">還沒有帳號？</span>
            <button
              type="button"
              onClick={() => navigate('/sign-up')}
              className="text-sm text-primary-500 font-medium hover:text-primary-600 transition-colors"
            >
              立即註冊
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EmailLogin;
