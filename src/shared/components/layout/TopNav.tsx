import { ChevronDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/auth';

// 頭像工具
import { getUserAvatarUrl, AVATAR_OPTIONS } from '@/shared/utils/avatarUtils';

// UI 組件
import { MemberAvatars } from '@/shared/components/ui/MemberAvatars';
import { MembershipBadge } from '@/shared/components/ui/MembershipBadge';
import { HomeModal } from '@/shared/components/layout/HomeModal';

// 資源
import EditGroupIcon from '@/assets/images/nav/edit-group.svg';

// Group Modals
import { GroupSettingsModal } from '@/modules/groups/components/modals/GroupSettingsModal';
import { CreateGroupModal } from '@/modules/groups/components/modals/CreateGroupModal';
import { EditGroupModal } from '@/modules/groups/components/modals/EditGroupModal';
import { MembersModal } from '@/modules/groups/components/modals/MembersModal';
import type { Group, GroupMember } from '@/modules/groups/types/group.types';

// Mock 成員資料
const mockGroupMembers: GroupMember[] = [
  { id: '1', name: 'Jocelyn', avatar: AVATAR_OPTIONS[0].src, role: 'owner' },
  { id: '2', name: 'Zoe', avatar: AVATAR_OPTIONS[1].src, role: 'organizer' },
  { id: '3', name: 'Ricky', avatar: AVATAR_OPTIONS[2].src, role: 'member' },
];

const TopNav = () => {
  const [selectedHome] = useState('My Home');
  const { user } = useAuth();
  const location = useLocation();

  // 判斷是否為 dashboard 路由
  const isDashboard = location.pathname === '/' || location.pathname === '/dashboard';

  // 使用頭像工具函數取得使用者頭像
  const userAvatar = getUserAvatarUrl(user);
  const userName = user?.displayName || user?.name || '使用者';

  // HomeModal 狀態
  const [isHomeModalOpen, setIsHomeModalOpen] = useState(false);

  // Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // 當前群組（暫時使用 mock 資料）
  const currentGroup: Group = {
    id: '1',
    name: 'My Home',
    admin: 'Jocelyn',
    members: mockGroupMembers,
    color: 'bg-red-100',
    characterColor: 'bg-red-400',
    plan: 'free',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Handlers
  const handleOpenCreate = () => {
    setIsSettingsOpen(false);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (group: Group) => {
    setSelectedGroup(group);
    setIsSettingsOpen(false);
    setIsEditOpen(true);
  };

  const handleOpenMembers = (group: Group) => {
    setSelectedGroup(group);
    setIsSettingsOpen(false);
    setIsHomeModalOpen(false);
    setIsMembersOpen(true);
  };

  const handleBackToSettings = () => {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setIsMembersOpen(false);
    setIsSettingsOpen(true);
  };

  return (
    <>
      <div className={`top-nav-wrapper sticky top-0 left-0 right-0 z-40 px-4 py-3 ${isDashboard ? 'body-dashboard-bg' : 'bg-white'}`}>
        <div className="flex items-center justify-between gap-2">
          {/* Left: Member Avatars + Home Selector */}
          <div className="flex items-center gap-2">
            <MemberAvatars members={currentGroup.members} maxDisplay={3} />

            <Button
              variant="ghost"
              className="flex items-center gap-1 text-base font-bold text-primary-700 p-2 bg-primary-100 rounded-full hover:bg-primary-200"
              onClick={() => setIsHomeModalOpen(true)}
            >
              {selectedHome}
              <ChevronDown className="w-5 h-5" />
            </Button>
          </div>

          {/* Right: Edit Group Icon + User Avatar */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-900 hover:bg-transparent"
              onClick={() => setIsSettingsOpen(true)}
            >
              <img src={EditGroupIcon} alt="編輯群組" className="w-6 h-6" />
            </Button>

            <div className="relative w-10 h-10">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-primary-300">
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              </div>
              <MembershipBadge tier={user?.membershipTier || 'premium'} size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* HomeModal */}
      <HomeModal
        isOpen={isHomeModalOpen}
        onClose={() => setIsHomeModalOpen(false)}
        currentUser={{
          name: userName,
          avatar: userAvatar,
          role: 'owner',
        }}
        members={currentGroup.members.map((m) => ({
          id: m.id,
          name: m.name,
          avatar: m.avatar,
          role: m.role,
        }))}
        onEditMembers={() => handleOpenMembers(currentGroup)}
      />

      {/* Group Modals */}
      <GroupSettingsModal
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenCreateModal={handleOpenCreate}
        onOpenEditModal={handleOpenEdit}
        onOpenMembersModal={handleOpenMembers}
      />

      <CreateGroupModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onBack={handleBackToSettings}
      />

      <EditGroupModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        group={selectedGroup}
        onBack={handleBackToSettings}
      />

      <MembersModal
        open={isMembersOpen}
        onClose={() => setIsMembersOpen(false)}
        group={selectedGroup}
        onBack={handleBackToSettings}
      />
    </>
  );
};

export default TopNav;
