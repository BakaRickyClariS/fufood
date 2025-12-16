import type { GroupMember } from '@/modules/groups/types/group.types';
import { MoreHorizontal } from 'lucide-react';

type MemberAvatarsProps = {
  members: Pick<GroupMember, 'id' | 'name' | 'avatar'>[];
  maxDisplay?: number;
};

/**
 * 成員大頭貼群組顯示組件
 * - 最多顯示 maxDisplay 個成員大頭貼
 * - 超過則用「...」點點圖示表示
 * - 若成員不滿則空白（不顯示佔位符）
 */
export const MemberAvatars = ({ members, maxDisplay = 3 }: MemberAvatarsProps) => {
  if (!members || members.length === 0) {
    return null;
  }

  const displayedMembers = members.slice(0, maxDisplay);
  const remainingCount = members.length - maxDisplay;

  return (
    <div className="flex items-center">
      {displayedMembers.map((member, index) => (
        <div
          key={member.id}
          className="w-6 h-6 rounded-full overflow-hidden border-2 border-neutral-400 bg-white"
          style={{
            marginLeft: index === 0 ? 0 : '-8px',
            zIndex: maxDisplay - index,
          }}
        >
          {member.avatar ? (
            <img
              src={member.avatar}
              alt={member.name}
              className="w-full h-full object-cover scale-150 translate-y-1"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-700 text-sm font-medium">
              {member.name?.charAt(0) || '?'}
            </div>
          )}
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className="w-10 h-10 rounded-full border-2 border-white bg-neutral-100 flex items-center justify-center"
          style={{
            marginLeft: '-8px',
            zIndex: 0,
          }}
        >
          <MoreHorizontal className="w-5 h-5 text-neutral-500" />
        </div>
      )}
    </div>
  );
};
