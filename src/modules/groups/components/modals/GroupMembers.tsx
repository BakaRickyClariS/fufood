import ProBadge from '@/assets/images/settings/silver.png';
import FreeBadge from '@/assets/images/settings/brown.png';

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
      className="w-full bg-primary-500 hover:bg-primary-600 text-white h-14 text-[16px] font-semibold rounded-xl shadow-sm"
      onClick={() => group && openInvite(group)}
    >
      邀請好友
    </Button>
  );

  // 決定徽章圖片 (根據使用者訂閱等級)
  // Mock login: user.membershipTier defaults to 'pro' if not set in some mocks, check auth types
  const tier = user?.membershipTier || 'free';
  const badgeImage = tier === 'pro' ? ProBadge : FreeBadge;
  const badgeText = tier === 'pro' ? 'Pro' : 'Free';
  const badgeBg = tier === 'pro' ? 'bg-neutral-100' : 'bg-[#F4EBE6]'; // Pro銀色配灰白, Free褐色配淡褐
  const badgeTextColor = tier === 'pro' ? 'text-neutral-500' : 'text-[#8B5E3C]';

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
        <div className="p-6 relative overflow-hidden min-h-[160px]">
          {/* Text Content Area - Removed z-10 so it stays at base level */}
          <div className="relative w-[60%]">
            {/* Custom Subscription Badge */}
            {/* Custom Subscription Badge */}
            <div className="flex flex-row items-center mb-3">
              <div className="w-12 h-12 relative z-10">
                <img
                  src={badgeImage}
                  alt={badgeText}
                  className="w-full h-full object-contain"
                />
              </div>
              <div
                className={`inline-flex items-center ${badgeBg} px-3 py-1 rounded-r-md -ml-6 pl-4 relative z-0`}
              >
                <span className={`text-xs font-bold ${badgeTextColor}`}>
                  {badgeText}
                </span>
              </div>
            </div>

            {/* Group Name: 20px Bold */}
            <h2 className="text-[20px] font-bold text-primary-900 mb-1 relative z-0">
              {group.name}
            </h2>
            {/* Admin: 14px Normal */}
            <p className="text-[14px] font-normal text-neutral-500 relative z-0">
              管理員{' '}
              {members.find((m) => m.id === group.ownerId)?.name || '未知'}
            </p>
          </div>

          {/* Character Illustration - z-10 to stay above text */}
          <div className="absolute right-0 bottom-0 w-40 h-40 z-10 pointer-events-none">
            <img
              src={group.imageUrl || defaultAvatar}
              alt={group.name}
              className="w-full h-full object-contain scale-150"
            />
          </div>
        </div>

        {/* Member List Container (White Card style similar to HomeModal's containing div) */}
        <div className="bg-white rounded-[24px] px-2 py-2 shadow-sm border border-neutral-100">
          {/* Members List Header */}
          <div className="flex items-center justify-between px-4 py-2">
            {/* Header: 16px Semibold */}
            <span className="text-[16px] font-semibold text-neutral-800">
              成員 {members.length}
            </span>
            {user?.id === group.ownerId && (
              <button
                onClick={toggleDeleteMode}
                className={`text-[16px] font-semibold transition-colors ${
                  isDeleteMode
                    ? 'text-primary-600 hover:text-primary-700'
                    : 'text-[#EE5D50] hover:text-red-600'
                }`}
              >
                {isDeleteMode ? '完成' : '刪除成員'}
              </button>
            )}
          </div>

          {/* Members List */}
          <div className="flex flex-col">
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
      </div>
    </GroupPageLayout>
  );
};
