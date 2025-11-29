import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/shared/utils/styleUtils';
import { useAuth } from '@/modules/auth';

const AVATARS = [
  { id: 1, color: 'bg-red-200' },
  { id: 2, color: 'bg-orange-200' },
  { id: 3, color: 'bg-amber-200' },
  { id: 4, color: 'bg-yellow-200' },
  { id: 5, color: 'bg-lime-200' },
  { id: 6, color: 'bg-green-200' },
  { id: 7, color: 'bg-emerald-200' },
  { id: 8, color: 'bg-teal-200' },
  { id: 9, color: 'bg-cyan-200' },
];

const AvatarSelection = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleConfirm = async () => {
    if (selectedId) {
      try {
        // 使用 Mock 登入
        await login({ email: 'test@example.com', password: 'password' });
        navigate('/'); // Navigate to main app (Dashboard)
      } catch (error) {
        console.error('Login failed:', error);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-stone-800 text-white p-6">
      <div className="mt-12 mb-8">
        <h1 className="text-xl text-stone-400 mb-2">選擇頭貼</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="bg-white rounded-3xl p-6 min-h-[400px]">
          <div className="grid grid-cols-3 gap-4">
            {AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                className={cn(
                  "aspect-square rounded-full transition-all duration-200 relative",
                  avatar.color,
                  selectedId === avatar.id ? "ring-4 ring-[#EE5D50] scale-105" : "hover:opacity-80"
                )}
                onClick={() => setSelectedId(avatar.id)}
              >
                {selectedId === avatar.id && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-[#EE5D50] rounded-full" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 mb-8">
        <Button 
          className="w-full bg-[#EE5D50] hover:bg-[#D94A3D] text-white h-12 text-base rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleConfirm}
          disabled={!selectedId || isLoading}
        >
          {isLoading ? '處理中...' : '確認'}
        </Button>
      </div>
    </div>
  );
};

export default AvatarSelection;
