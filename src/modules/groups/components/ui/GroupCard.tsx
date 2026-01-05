import { useRef, type FC } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Check, ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type { Group } from '../../types/group.types';
import { useGroupModal } from '../../hooks/useGroupModal';
import { useAuth } from '@/modules/auth/hooks';
import { useTheme } from '@/shared/providers/ThemeProvider';
import { getThemeById, DEFAULT_THEME_ID } from '@/shared/constants/themes';

/** 顯示的頭像數量上限 */
const MAX_AVATARS_DISPLAY = 4;

type GroupCardProps = {
  group: Group;
  /** 是否為當前使用中的群組 */
  isActive?: boolean;
  /** 是否為已選中（但尚未套用）的群組 */
  isSelected?: boolean;
  /** 是否展開（顯示操作按鈕） */
  isExpanded?: boolean;
  /** 是否為刪除模式 */
  isDeleteMode?: boolean;
  /** 是否被勾選（刪除模式用） */
  isChecked?: boolean;
  /** 選擇群組回呼（不會立即切換，需點套用） */
  onSelect?: (groupId: string) => void;
  /** 勾選變更回呼（刪除模式用） */
  onCheckChange?: (groupId: string, checked: boolean) => void;
  /** 展開/收合回呼 */
  onToggleExpand?: (groupId: string) => void;
  onEditMembers?: (group: Group) => void;
  onEditGroup?: (group: Group) => void;
};

/**
 * 群組卡片組件
 * - 點擊卡片選取該群組，並自動展開
 * - 使用群組圖片作為視覺重點
 * - 支援刪除模式（右上角 checkbox）
 * - 當前群組顯示「目前群組」tag
 */
export const GroupCard: FC<GroupCardProps> = ({
  group,
  isActive = false,
  isSelected = false,
  isExpanded = false,
  isDeleteMode = false,
  isChecked = false,
  onSelect,
  onCheckChange,
  onToggleExpand,
  onEditMembers,
  onEditGroup,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const { switchGroup } = useGroupModal();
  const { user } = useAuth();
  const { currentTheme } = useTheme();

  // 判斷自己是否為 owner，若是則顯示自己的主題群組圖片
  const isOwner = group.ownerId === user?.id;
  const displayGroupImage = isOwner
    ? currentTheme.groupImage
    : getThemeById(DEFAULT_THEME_ID).groupImage;

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
        // 箭頭旋轉
        gsap.to(arrowRef.current, {
          rotation: 180,
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
        // 箭頭還原
        gsap.to(arrowRef.current, {
          rotation: 0,
          duration: 0.3,
          ease: 'power2.in',
        });
      }
    },
    { scope: cardRef, dependencies: [isExpanded, isActive] },
  );

  // Tag 動畫
  useGSAP(
    () => {
      if (isActive) {
        gsap.to(tagRef.current, {
          height: 'auto',
          marginTop: 0,
          marginBottom: '0.25rem', // mb-1
          opacity: 1,
          y: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      } else {
        gsap.to(tagRef.current, {
          height: 0,
          marginTop: 0,
          marginBottom: 0,
          opacity: 0,
          y: -10,
          duration: 0.3,
          ease: 'power2.in',
        });
      }
    },
    { scope: cardRef, dependencies: [isActive] },
  );

  const handleCardClick = () => {
    // 刪除模式時，點擊卡片切換勾選狀態
    if (isDeleteMode) {
      onCheckChange?.(group.id, !isChecked);
      return;
    }

    // 如果有 onSelect 回呼，使用選擇模式（不立即切換）
    if (onSelect) {
      onSelect(group.id);
    } else if (!isActive) {
      // 向下相容：無 onSelect 時保留原行為
      switchGroup(group.id);
    }
  };

  // 下拉區域點擊處理 - 只處理展開/收合
  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleteMode) return; // 刪除模式時不處理展開
    onToggleExpand?.(group.id);
  };

  // 處理 checkbox 點擊
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCheckChange?.(group.id, !isChecked);
  };

  // 決定邊框樣式
  const getBorderClass = () => {
    if (isDeleteMode) {
      return isChecked
        ? 'border-2 border-primary-400'
        : 'border-2 border-neutral-200';
    }
    if (isSelected) return 'card-gradient-border';
    return 'border-2 border-neutral-500';
  };

  return (
    <div
      ref={cardRef}
      onClick={handleCardClick}
      className={`relative overflow-visible bg-white rounded-2xl p-5 transition-all cursor-pointer ${getBorderClass()}`}
    >
      {/* 刪除模式 Checkbox */}
      {isDeleteMode && (
        <button
          onClick={handleCheckboxClick}
          className={`absolute top-4 right-4 w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all z-30 ${
            isChecked
              ? 'bg-primary-400 border-primary-400'
              : 'bg-white border-neutral-300'
          }`}
        >
          {isChecked && <Check className="w-4 h-4 text-white" />}
        </button>
      )}

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="flex flex-col gap-1">
          {/* 目前群組 Tag - 使用 GSAP 動畫 (刪除模式不顯示) */}
          <div ref={tagRef} className="overflow-hidden h-0 opacity-0">
            {!isDeleteMode && (
              <span className="inline-block bg-primary-400 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm mb-1">
                目前群組
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-primary-700">{group.name}</h3>
          <p className="text-sm text-stone-500 font-medium">
            管理員{' '}
            {group.members?.find((m) => m.id === group.ownerId)?.name ||
              group.admin ||
              'Unknown'}
          </p>
        </div>

        {/* 群組圖片 */}
        <div className="w-40 h-40 absolute -right-2 -top-2 mt-8">
          <img
            src={displayGroupImage}
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

      {/* 下拉觸發區塊 - 整個區塊都可以點擊 */}
      {!isDeleteMode ? (
        <button
          onClick={handleExpandClick}
          className="w-full flex justify-center py-2 cursor-pointer hover:bg-neutral-50 rounded-xl transition-colors"
        >
          <div
            ref={arrowRef}
            className={`flex items-center justify-center transition-colors ${
              isActive || isSelected ? 'text-primary-400' : 'text-neutral-400'
            }`}
          >
            <ChevronDown className="w-6 h-6" />
          </div>
        </button>
      ) : (
        /* 刪除模式下的佔位區塊，保持高度一致 */
        <div className="w-full py-2 h-[40px]"></div>
      )}

      {/* 操作按鈕 (隱藏內容) */}
      <div ref={contentRef} className="h-0 opacity-0 overflow-hidden">
        <div
          className="flex flex-col gap-3 pb-1 pt-2 cursor-default"
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
