import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '@/modules/auth';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

import { ArrowLeft, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const Register = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const containerRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    // 基本驗證
    if (!name || !email || !password || !confirmPassword) {
      setError('請填寫所有欄位');
      return;
    }

    if (password !== confirmPassword) {
      setError('兩次輸入的密碼不一致');
      return;
    }

    if (password.length < 6) {
      setError('密碼長度至少需要 6 個字元');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.register({ email, password, name });

      if (response && response.user) {
        // 更新快取 (authService.register 已經處理過 localStorage)
        queryClient.setQueryData(['GET_USER_PROFILE'], response.user);
        
        // 清除登出標記
        try {
          sessionStorage.removeItem('logged_out');
        } catch(e) {}

        // 導向頭像選擇
        navigate('/auth/avatar-selection', { replace: true });
      } else {
        setError('註冊回傳資料異常');
        setIsLoading(false);
      }
    } catch (err: unknown) {
      console.error('[Register] 註冊失敗:', err);
      // ApiClient 已統一處理錯誤訊息提取，直接使用 err.message 即可
      const errorMessage =
        err instanceof Error ? err.message : '註冊失敗，請稍後再試';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/auth/login');
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
        <h1 className="text-2xl font-bold text-neutral-800 mb-2">建立新帳號</h1>
        <p className="text-neutral-500 text-sm">
          加入 FuFood，開始管理您的智慧冰箱
        </p>
      </div>

      {/* 註冊表單 */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
        {/* 姓名輸入 */}
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-neutral-700 font-medium">
            姓名
          </label>
          <div className="relative">
            <User
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              size={20}
            />
            <Input
              id="name"
              type="text"
              placeholder="您的姓名"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="pl-10 h-12 rounded-lg border-neutral-200 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>

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
              placeholder="至少 6 個字元"
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

        {/* 確認密碼輸入 */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="confirmPassword"
            className="text-neutral-700 font-medium"
          >
            確認密碼
          </label>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
              size={20}
            />
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="再次輸入密碼"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-10 h-12 rounded-lg border-neutral-200 focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div className="text-primary-500 text-sm text-center bg-primary-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* 提交按鈕 */}
        <div className="mt-auto pt-4 pb-4">
          <Button
            type="submit"
            className="w-full bg-primary-500 hover:bg-primary-600 text-white h-12 text-base rounded-lg shadow-sm"
            disabled={isLoading}
          >
            {isLoading ? '註冊中...' : '註冊'}
          </Button>

          <div className="flex justify-center mt-4 gap-1">
            <span className="text-sm text-neutral-500">已經有帳號了？</span>
            <button
              type="button"
              onClick={() => navigate('/auth/login/email')}
              className="text-sm text-primary-500 font-medium hover:text-primary-600 transition-colors"
            >
              登入
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Register;
