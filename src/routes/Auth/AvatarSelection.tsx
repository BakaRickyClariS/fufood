import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/shared/utils/styleUtils';
import { useQueryClient } from '@tanstack/react-query';
import { Check } from 'lucide-react';

// 頭像常數
import { AVATAR_OPTIONS } from '@/shared/utils/avatarUtils';

// Mock Auth Service（已移除）

import { authApi, authService } from '@/modules/auth';

/**
 * 頭像選擇頁面
 *
 * 在使用者首次註冊後，引導使用者完成名稱與頭像設定
 */
const AvatarSelection = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [name, setName] = useState('Ricky');
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (selectedId && name.trim()) {
      try {
        setIsLoading(true);

        // 使用真實 API 更新個人資料
        await authApi.updateProfile({ 
          name: name.trim(), 
          avatar: String(selectedId) 
        });

        // 取回最新資料以確保快取一致
        const updatedUser = await authApi.getCurrentUser();
        
        // 更新本地儲存與 TanStack Query 快取
        authService.saveUser(updatedUser);
        queryClient.setQueryData(['GET_USER_PROFILE'], updatedUser);

        navigate('/');
      } catch (error) {
        console.error('Update profile failed:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col pt-8">
      <div className="flex flex-col px-4">
        {/* 標題區 */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-primary-400" />
          <h1 className="text-lg font-bold text-neutral-800">選擇頭貼</h1>
        </div>

        {/* 頭像選擇區 */}
        <div className="bg-white border-neutral-100 mb-8">
          <div className="grid grid-cols-3 gap-2">
            {AVATAR_OPTIONS.map((avatar) => (
              <button
                key={avatar.id}
                className={cn(
                  'relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200',
                  selectedId === avatar.id
                    ? 'border-primary-500 ring-2 ring-primary-500'
                    : 'border-neutral-100 hover:border-neutral-200',
                )}
                onClick={() => setSelectedId(avatar.id)}
              >
                <img
                  src={avatar.src}
                  alt={`頭像 ${avatar.id}`}
                  className="w-full h-full object-cover scale-130 translate-y-3"
                />
                {selectedId === avatar.id && (
                  <div className="absolute top-1 left-1 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-sm">
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="請輸入名稱"
            maxLength={20}
            className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-[#EE5D50] focus:ring-4 focus:ring-[#EE5D50]/10 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* 底部按鈕區 */}
      <div className="p-4 mt-2">
        <Button
          className="w-full bg-[#EE5D50] hover:bg-[#D94A3D] text-white h-12 text-base font-bold rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          onClick={handleConfirm}
          disabled={!selectedId || !name.trim() || isLoading}
        >
          {isLoading ? '處理中...' : '套用'}
        </Button>
      </div>
    </div>
  );
};

export default AvatarSelection;
