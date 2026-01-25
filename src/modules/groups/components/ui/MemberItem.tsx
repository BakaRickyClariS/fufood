import type { FC } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { GroupMember } from '../../types/group.types';

type MemberItemProps = {
  member: GroupMember;
  onRemove?: (memberId: string) => void;
  isOwner?: boolean; // 是否為擁有者 (顯示不同樣式或權限)
  showDeleteButton?: boolean;
  isCurrentUser?: boolean; // 是否為當前使用者
};

/**
 * 成員項目組件
 */
export const MemberItem: FC<MemberItemProps> = ({
  member,
  onRemove,
  showDeleteButton,
  isCurrentUser = false,
}) => (
  <div className="flex items-center justify-between py-4 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors px-4">
    <div className="flex items-center gap-4">
      {/* Avatar: w-14 h-14 (56px) */}
      <div className="w-14 h-14 rounded-full overflow-hidden border border-neutral-300 shrink-0">
        <img
          src={member.avatar || ''}
          alt={member.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col gap-1">
        {/* Name: 12px semibold */}
        <span className="text-xs font-semibold text-neutral-700">
          {member.name}
          {isCurrentUser && <span className="text-primary-400"> (你)</span>}
        </span>
        {/* Role: Owner Badge */}
        {member.role === 'owner' ? (
          <span className="text-[10px] text-white font-semibold bg-primary-400 px-2 py-1 rounded-full w-fit">
            擁有者
          </span>
        ) : (
          <span className="text-xs text-neutral-400 font-semibold">成員</span>
        )}
      </div>
    </div>

    {/* 只在 showDeleteButton 為 true 時顯示刪除按鈕 */}
    {showDeleteButton && onRemove && (
      <Button
        variant="ghost"
        size="icon"
        className="text-neutral-300 hover:text-[#EE5D50] hover:bg-red-50"
        onClick={() => onRemove(member.id)}
      >
        <Trash2 className="w-5 h-5" />
      </Button>
    )}
  </div>
);
