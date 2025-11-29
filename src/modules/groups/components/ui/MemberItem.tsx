import type { FC } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import type { GroupMember } from '../../types/group.types';

type MemberItemProps = {
  member: GroupMember;
  onRemove?: (memberId: string) => void;
  isOwner?: boolean; // 是否為擁有者 (顯示不同樣式或權限)
};

/**
 * 成員項目組件
 */
export const MemberItem: FC<MemberItemProps> = ({ member, onRemove }) => (
  <div className="flex items-center justify-between p-4 border-b border-stone-100 last:border-0">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-full ${member.avatar}`} />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-stone-800">
          {member.name}
        </span>
        <span className="text-xs text-stone-400">
          {member.role === 'owner'
            ? '擁有者'
            : member.role === 'organizer'
              ? '組織者'
              : '成員'}
        </span>
      </div>
    </div>

    {onRemove && (
      <Button
        variant="ghost"
        size="icon"
        className="text-stone-300 hover:text-red-500 hover:bg-red-50"
        onClick={() => onRemove(member.id)}
      >
        <Trash2 className="w-5 h-5" />
      </Button>
    )}
  </div>
);
