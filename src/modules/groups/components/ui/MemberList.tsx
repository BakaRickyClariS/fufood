import type { FC } from 'react';
import type { GroupMember } from '../../types/group.types';
import { MemberItem } from './MemberItem';

type MemberListProps = {
  members: GroupMember[];
  onRemoveMember?: (memberId: string) => void;
};

/**
 * 成員列表組件
 */
export const MemberList: FC<MemberListProps> = ({
  members,
  onRemoveMember,
}) => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-stone-100">
    {members.map((member) => (
      <MemberItem key={member.id} member={member} onRemove={onRemoveMember} />
    ))}
  </div>
);
