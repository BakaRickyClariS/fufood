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
  <div className="flex items-center justify-between p-4 border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full overflow-hidden border border-stone-100 bg-gray-100 shrink-0">
        <img
          src={member.avatar || ''}
          alt={member.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col">
        <span className="text-base font-bold text-stone-800">
          {member.name}
          {isCurrentUser && ' (我)'}
        </span>
        <span className="text-xs text-stone-400 font-medium">
          {member.role === 'owner'
            ? '擁有者'
            : member.role === 'organizer'
              ? '組織者'
              : '成員'}
        </span>
      </div>
    </div>

    {/* 只在 showDeleteButton 為 true 時顯示刪除按鈕 */}
    {showDeleteButton && onRemove && (
      <Button
        variant="ghost"
        size="icon"
        className="text-stone-300 hover:text-[#EE5D50] hover:bg-red-50"
        onClick={() => onRemove(member.id)}
      >
        <Trash2 className="w-5 h-5" />
      </Button>
    )}
  </div>
);
