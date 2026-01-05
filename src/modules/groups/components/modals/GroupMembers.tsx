import { useState, useRef, type FC } from 'react';
import { Button } from '@/shared/components/ui/button';
import { MemberList } from '../ui/MemberList';
import {
  GroupPageLayout,
  type GroupPageLayoutRef,
} from '../ui/GroupPageLayout';
import { useGroupMembers } from '../../hooks/useGroupMembers';
import { useGroupModal } from '../../providers/GroupModalProvider';
import { useAuth } from '@/modules/auth';
import { getUserAvatarUrl } from '@/shared/utils/avatarUtils';
import type { Group } from '../../types/group.types';
import defaultAvatar from '@/assets/images/auth/Avatar-1.png';

type GroupMembersProps = {
  open: boolean;
  onClose: () => void;
  group: Group | null;
  onBack?: () => void;
};

/**
 * 成員管理頁面
 * - 使用 GroupPageLayout 從右側滑入
 */
export const GroupMembers: FC<GroupMembersProps> = ({
  open,
  onClose,
  group,
  onBack,
}) => {
  const layoutRef = useRef<GroupPageLayoutRef>(null);
  const { user } = useAuth();
  const currentUserName = user?.displayName || user?.name || '';
  const currentUserAvatar = getUserAvatarUrl(user);

  const { openInvite } = useGroupModal();

  // Pass current user info to hook so it can inject user into members list
  const { members, isLoading, removeMember } = useGroupMembers(
    group?.id || '',
    user
      ? { id: user.id, name: currentUserName, avatar: currentUserAvatar }
      : undefined,
  );

  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
  };

  const handleLayoutClose = () => {
    if (onBack) {
      onBack();
    } else {
      onClose();
    }
  };

  if (!group) return null;

  // 底部邀請按鈕
  const footerContent = (
    <Button
      className="w-full bg-primary-500 hover:bg-primary-600 text-white h-14 text-lg font-bold rounded-xl shadow-sm"
      onClick={() => group && openInvite(group)}
    >
      邀請好友
    </Button>
  );

  return (
    <GroupPageLayout
      ref={layoutRef}
      isOpen={open}
      onClose={handleLayoutClose}
      title="編輯成員"
      className="px-4 py-6"
      footer={footerContent}
    >
      <div className="flex flex-col gap-6">
        {/* Group Info Card */}
        <div className="bg-white rounded-[32px] p-6 relative overflow-hidden shadow-sm border border-neutral-100 min-h-[160px]">
          <div className="relative z-10 w-[60%]">
            <div className="inline-flex items-center gap-1 bg-primary-100 px-2 py-1 rounded-md text-xs text-primary-500 font-bold mb-3 tracking-wide uppercase">
              <span>{group.plan === 'free' ? 'Free' : 'Premium'}</span>
            </div>
            <h2 className="text-2xl font-bold text-primary-500 mb-1">
              {group.name}
            </h2>
            <p className="text-sm text-neutral-500 font-medium">
              管理員 {group.admin}
            </p>
          </div>

          {/* Character Illustration */}
          <div className="absolute -right-4 -bottom-4 w-40 h-40">
            <img
              src={group.imageUrl || defaultAvatar}
              alt={group.name}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Members List Header */}
        <div className="flex items-center justify-between px-1">
          <span className="text-lg font-bold text-stone-800">
            成員 {members.length}
          </span>
          {user?.id === group.ownerId && (
            <button
              onClick={toggleDeleteMode}
              className={`text-sm font-bold transition-colors ${
                isDeleteMode
                  ? 'text-primary-600 hover:text-primary-700'
                  : 'text-primary-500 hover:text-primary-600'
              }`}
            >
              {isDeleteMode ? '完成' : '刪除成員'}
            </button>
          )}
        </div>

        {/* Members List */}
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <div className="text-center py-8 text-neutral-400">載入中...</div>
          ) : (
            <MemberList
              members={members}
              onRemoveMember={removeMember}
              isDeleteMode={isDeleteMode}
              currentUserName={currentUserName}
            />
          )}
        </div>
      </div>
    </GroupPageLayout>
  );
};
