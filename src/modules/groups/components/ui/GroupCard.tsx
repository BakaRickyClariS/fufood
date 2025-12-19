import { useRef, useEffect, type FC } from 'react';
import { Button } from '@/shared/components/ui/button';
import { ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import type { Group } from '../../types/group.types';
import { useGroupModal } from '../../hooks/useGroupModal';
import { useAuth } from '@/modules/auth/hooks';
import defaultAvatar from '@/assets/images/auth/Avatar-1.png';

/** 顯示的頭像數量上限 */
const MAX_AVATARS_DISPLAY = 4;

type GroupCardProps = {
  group: Group;
  isActive?: boolean;
  onEditMembers?: (group: Group) => void;
  onEditGroup?: (group: Group) => void;
};

/**
 * 群組卡片組件
 * - 點擊卡片選取該群組，並自動展開
 * - 使用群組圖片作為視覺重點
 */
export const GroupCard: FC<GroupCardProps> = ({
  group,
  isActive = false,
  onEditMembers,
  onEditGroup,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLButtonElement>(null);
  const { switchGroup } = useGroupModal();
  const { user } = useAuth();

  // 當 isActive 改變時，自動展開或收合
  useEffect(() => {
    if (isActive) {
      // 展開動畫
      gsap.to(contentRef.current, {
        height: 'auto',
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
      // 箭頭旋轉並淡出
      gsap.to(arrowRef.current, {
        rotation: 180,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    } else {
      // 收合動畫
      gsap.to(contentRef.current, {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
      });
      // 箭頭還原並淡入
      gsap.to(arrowRef.current, {
        rotation: 0,
        opacity: 1,
        duration: 0.3,
        ease: 'power2.in',
      });
    }
  }, [isActive]);

  const handleCardClick = () => {
    if (!isActive) {
      switchGroup(group.id);
    }
  };

  const handleArrowClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 避免觸發卡片點擊
    // 如果已經是 active，點擊箭頭可以收合 (但需求說自動下拉，如果想收合呢？暫時允許手動收合？)
    // 這裡箭頭主要作為指示，實際互動由 isActive 控制
    // 如果點擊箭頭但我不是 active，則設為 active
    if (!isActive) {
      switchGroup(group.id);
    } else {
      // 如果已展開，點箭頭無效或收合？根據設計稿通常點卡片展開
      // 為了簡單，箭頭只做為視覺或觸發 active
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative overflow-hidden bg-white rounded-[32px] p-5 transition-all cursor-pointer ${
        isActive ? 'card-gradient-border' : 'border-2 border-neutral-400'
      }`}
    >
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-bold text-primary-700">{group.name}</h3>
          <p className="text-sm text-stone-500 font-medium">
            管理員 {group.admin}
          </p>
        </div>

        {/* 群組圖片 */}
        <div className="w-40 h-40 absolute -right-2 -top-2">
          <img
            src={group.imageUrl || defaultAvatar}
            alt={group.name}
            className="w-full h-full object-contain drop-shadow-md"
          />
        </div>
      </div>

      {/* 成員區域 */}
      <div className="flex flex-col justify-center gap-2 mb-2 relative z-10">
        <span className="text-sm text-stone-500 font-medium">
          成員 ({group.members?.length ?? 0})
        </span>
        <div className="flex">
          {(group.members ?? []).slice(0, MAX_AVATARS_DISPLAY).map((member, index) => {
            const isCurrentUser = user?.id === member.id;
            return (
              <div
                key={member.id}
                className={`w-9 h-9 rounded-full border-2 overflow-hidden bg-gray-100 ${
                  isCurrentUser ? 'border-primary-400' : 'border-neutral-500'
                }`}
                style={{
                  marginLeft: index === 0 ? 0 : '-0.75rem',
                  zIndex: (group.members?.length ?? 0) - index,
                }}
              >
                <img
                  src={member.avatar || ''}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 下拉按鈕 */}
      <div className="flex justify-center">
        <button
          ref={arrowRef}
          onClick={handleArrowClick}
          className={`w-8 h-8 flex items-center justify-center transition-colors ${
            isActive ? 'text-[#EE5D50]' : 'text-stone-400'
          }`}
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      {/* 操作按鈕 (隱藏內容) */}
      <div ref={contentRef} className="h-0 opacity-0 overflow-hidden">
        <div
          className="flex flex-col gap-3 pb-1 cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            className="w-full bg-[#EE5D50] hover:bg-[#D94A3D] text-white h-12 rounded-xl text-base font-bold shadow-sm"
            onClick={() => onEditMembers?.(group)}
          >
            編輯成員
          </Button>
          <Button
            variant="outline"
            className="w-full border-stone-200 border-2 text-stone-700 h-12 rounded-xl text-base font-bold bg-white hover:bg-stone-50"
            onClick={() => onEditGroup?.(group)}
          >
            修改群組內容
          </Button>
        </div>
      </div>
    </div>
  );
};
