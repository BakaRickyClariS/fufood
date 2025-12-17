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
export const MemberAvatars = ({
  members,
  maxDisplay = 3,
}: MemberAvatarsProps) => {
  if (!members || members.length === 0) {
    return null;
  }

  const displayedMembers = members.slice(0, maxDisplay);
  const remainingCount = members.length - maxDisplay;

  return (
    <div className="flex items-center pointer-events-none">
      {displayedMembers.map((member, index) => {
        const isLast = index === displayedMembers.length - 1;
        const showMoreIndicator = isLast && remainingCount > 0;

        return (
          <div
            key={member.id}
            className="relative"
            style={{
              marginLeft: index === 0 ? 0 : '-8px',
              zIndex: maxDisplay - index,
            }}
          >
            <div className="w-6 h-6 rounded-full overflow-hidden border-2 border-neutral-400 bg-white">
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
            {showMoreIndicator && (
              <div className="absolute -bottom-1 -right-1 flex items-center justify-center filter drop-shadow-sm">
                <MoreHorizontal className="w-3 h-3 text-stone-600 rounded-full" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
