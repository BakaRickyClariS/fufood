import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const StartPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
      return;
    }

    const timer = setTimeout(() => {
      navigate('/auth/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div 
      className="h-screen w-full flex flex-col items-center justify-center bg-stone-800 text-white relative overflow-hidden cursor-pointer"
      onClick={() => navigate('/auth/login')}
    >
      {/* Background decoration (Placeholder for 3D elements) */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-700 to-stone-900 opacity-50" />

      <div className="z-10 flex flex-col items-center gap-8">
        {/* Logo Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-wider mb-2">FOOD</h1>
          <div className="flex items-center justify-center gap-2 text-sm opacity-80">
            <span>冰箱</span>
            <span className="w-8 h-[1px] bg-white/50"></span>
            <span>庫存管理</span>
          </div>
        </div>

        {/* Character Placeholder */}
        <div className="w-64 h-64 bg-stone-600/30 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
          <span className="text-stone-400">3D Character Placeholder</span>
        </div>
      </div>
    </div>
  );
};

export default StartPage;
