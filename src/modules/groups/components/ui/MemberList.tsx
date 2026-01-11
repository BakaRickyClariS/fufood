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
  // Remove wrapper styles (bg-white, shadow, border) as they are now in GroupMembers parent container
  // or implicitly handled by the items list design in HomeModal style
  <div className="flex flex-col">
    {members.map((member) => (
      <MemberItem
        key={member.id}
        member={member}
        onRemove={onRemoveMember}
        showDeleteButton={isDeleteMode && member.role !== 'owner'}
        isCurrentUser={
          currentUserName ? member.name === currentUserName : false
        }
      />
    ))}
  </div>
);
