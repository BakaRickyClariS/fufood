import { useRef, type FC } from 'react';
import { Button } from '@/shared/components/ui/button';
import { ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type { Group } from '../../types/group.types';
import { useGroupModal } from '../../hooks/useGroupModal';
import { useAuth } from '@/modules/auth/hooks';
import defaultAvatar from '@/assets/images/auth/Avatar-1.png';

/** 顯示的頭像數量上限 */
const MAX_AVATARS_DISPLAY = 4;

type GroupCardProps = {
  group: Group;
  isActive?: boolean;
  /** 是否為已選中（但尚未套用）的群組 */
  isSelected?: boolean;
  /** 是否展開（顯示操作按鈕） */
  isExpanded?: boolean;
  /** 選擇群組回呼（不會立即切換，需點套用） */
  onSelect?: (groupId: string) => void;
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
  isSelected = false,
  isExpanded = false,
  onSelect,
  onEditMembers,
  onEditGroup,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLButtonElement>(null);
  const { switchGroup } = useGroupModal();
  const { user } = useAuth();

  // 使用 useGSAP 管理動畫生命週期
  useGSAP(
    () => {
      if (isExpanded) {
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
    },
    { scope: cardRef, dependencies: [isExpanded] },
  );

  const handleCardClick = () => {
    // 如果有 onSelect 回呼，使用選擇模式（不立即切換）
    if (onSelect) {
      onSelect(group.id);
    } else if (!isActive) {
      // 向下相容：無 onSelect 時保留原行為
      switchGroup(group.id);
    }
  };

  const handleArrowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) {
      onSelect(group.id);
    } else if (!isActive) {
      switchGroup(group.id);
    }
  };

  // 決定邊框樣式：已選中（isSelected）或當前活動群組（isActive）
  const getBorderClass = () => {
    if (isSelected) return 'card-gradient-border ring-2 ring-primary-300';
    if (isActive) return 'card-gradient-border';
    return 'border-2 border-neutral-400';
  };

  return (
    <div
      ref={cardRef}
      onClick={handleCardClick}
      className={`relative overflow-hidden bg-white rounded-[32px] p-5 transition-all cursor-pointer ${getBorderClass()}`}
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
        <span className="text-sm text-neutral-500 font-medium">
          成員 ({group.members?.length ?? 0})
        </span>
        <div className="flex">
          {(group.members ?? [])
            .slice(0, MAX_AVATARS_DISPLAY)
            .map((member, index) => {
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
            isActive ? 'text-primary-400' : 'text-neutral-400'
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
            className="w-full bg-primary-400 hover:bg-primary-500 text-white h-12 rounded-xl text-base font-bold shadow-sm"
            onClick={() => onEditMembers?.(group)}
          >
            編輯成員
          </Button>
          <Button
            variant="outline"
            className="w-full border-neutral-200 border-2 text-neutral-700 h-12 rounded-xl text-base font-bold bg-white hover:bg-neutral-50"
            onClick={() => onEditGroup?.(group)}
          >
            修改群組內容
          </Button>
        </div>
      </div>
    </div>
  );
};
