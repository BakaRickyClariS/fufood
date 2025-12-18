import type { FC } from 'react';
import type { GroupMember } from '../../types/group.types';
import { MemberItem } from './MemberItem';

type MemberListProps = {
  members: GroupMember[];
  onRemoveMember?: (memberId: string) => void;
  isDeleteMode?: boolean;
  currentUserName?: string; // 當前使用者名稱，用於標記 (我)
};

/**
 * 成員列表組件
 */
export const MemberList: FC<MemberListProps> = ({
  members,
  onRemoveMember,
  isDeleteMode = false,
  currentUserName,
}) => (
  <div className="bg-white rounded-[24px] overflow-hidden shadow-sm border border-stone-100">
    {members.map((member) => (
      <MemberItem
        key={member.id}
        member={member}
        onRemove={onRemoveMember}
        showDeleteButton={isDeleteMode && member.role !== 'owner'} // 只有非 owner 且在刪除模式下才顯示
        isCurrentUser={
          currentUserName ? member.name === currentUserName : false
        }
      />
    ))}
  </div>
);
