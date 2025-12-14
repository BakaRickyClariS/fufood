import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/shared/utils/styleUtils';
import { useAuth } from '@/modules/auth';
import { Check } from 'lucide-react';

// 匯入頭像圖片
import Avatar1 from '@/assets/images/auth/Avatar-1.png';
import Avatar2 from '@/assets/images/auth/Avatar-2.png';
import Avatar3 from '@/assets/images/auth/Avatar-3.png';
import Avatar4 from '@/assets/images/auth/Avatar-4.png';
import Avatar5 from '@/assets/images/auth/Avatar-5.png';
import Avatar6 from '@/assets/images/auth/Avatar-6.png';
import Avatar7 from '@/assets/images/auth/Avatar-7.png';
import Avatar8 from '@/assets/images/auth/Avatar-8.png';
import Avatar9 from '@/assets/images/auth/Avatar-9.png';

const AVATARS = [
  { id: 1, src: Avatar1 },
  { id: 2, src: Avatar2 },
  { id: 3, src: Avatar3 },
  { id: 4, src: Avatar4 },
  { id: 5, src: Avatar5 },
  { id: 6, src: Avatar6 },
  { id: 7, src: Avatar7 },
  { id: 8, src: Avatar8 },
  { id: 9, src: Avatar9 },
];

const AvatarSelection = () => {
  const navigate = useNavigate();
  const { mockLogin, isLoading } = useAuth();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [displayName, setDisplayName] = useState('Ricky');

  const handleConfirm = async () => {
    if (selectedId && displayName.trim()) {
      try {
        // 使用 Mock 登入 (改用 mockLogin)
        await mockLogin(selectedId, displayName);
        navigate('/');
      } catch (error) {
        console.error('Login failed:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pb-24">
      {/* 內容區 - 可捲動 */}
      <div className="flex-1 p-4 pt-12">
        {/* 標題區 */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-[#EE5D50] rounded-full" />
          <h1 className="text-lg font-bold text-neutral-800">選擇頭貼</h1>
        </div>

        {/* 頭像選擇區 */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4 mb-8">
          <div className="grid grid-cols-3 gap-3">
            {AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                className={cn(
                  'relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200',
                  selectedId === avatar.id
                    ? 'border-[#EE5D50] shadow-md ring-2 ring-[#EE5D50]/20'
                    : 'border-neutral-100 hover:border-neutral-200',
                )}
                onClick={() => setSelectedId(avatar.id)}
              >
                <img
                  src={avatar.src}
                  alt={`頭像 ${avatar.id}`}
                  className="w-full h-full object-cover"
                />
                {selectedId === avatar.id && (
                  <div className="absolute top-1 right-1 w-6 h-6 bg-[#EE5D50] rounded-full flex items-center justify-center shadow-sm">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 名稱設定區 */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-[#EE5D50] rounded-full" />
            <h2 className="text-lg font-bold text-neutral-800">設定名稱</h2>
          </div>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="請輸入名稱"
            maxLength={20}
            className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-[#EE5D50] focus:ring-4 focus:ring-[#EE5D50]/10 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* 底部按鈕區 - 跟隨內容流動，若內容少則在底部，內容多則被推下去（但有外層 pb-24 確保不被 BottomNav 擋住） */}
      <div className="p-4 pt-0 mt-auto">
        <Button
          className="w-full bg-[#EE5D50] hover:bg-[#D94A3D] text-white h-12 text-base font-bold rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          onClick={handleConfirm}
          disabled={!selectedId || !displayName.trim() || isLoading}
        >
          {isLoading ? '處理中...' : '套用'}
        </Button>
      </div>
    </div>
  );
};

export default AvatarSelection;
