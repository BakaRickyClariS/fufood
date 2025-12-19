import { useState, createContext, useContext, type ReactNode } from 'react';
import type { Group } from '@/modules/groups/types/group.types';
import { HomeModal } from '@/modules/groups/components/modals/HomeModal';
import { GroupSettingsModal } from '@/modules/groups/components/modals/GroupSettingsModal';
import { CreateGroupModal } from '@/modules/groups/components/modals/CreateGroupModal';
import { EditGroupModal } from '@/modules/groups/components/modals/EditGroupModal';
import { MembersModal } from '@/modules/groups/components/modals/MembersModal';
import { useAuth } from '@/modules/auth';
import { getUserAvatarUrl } from '@/shared/utils/avatarUtils';
import { useGroups } from '@/modules/groups/hooks/useGroups';

// Context 型別定義
type GroupModalContextType = {
  activeGroup: Group;
  switchGroup: (groupId: string) => void;
  openHome: () => void;
  openSettings: () => void;
  openCreate: () => void;
  openEdit: (group: Group) => void;
  openMembers: (group: Group) => void;
  closeAll: () => void;
  groups: Group[];
  createGroup: (form: any) => Promise<void>;
  updateGroup: (id: string, form: any) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
  isGroupsLoading: boolean;
};

const GroupModalContext = createContext<GroupModalContextType | undefined>(
  undefined,
);

// Provider Props
type GroupModalProviderProps = {
  children: ReactNode;
};

export const GroupModalProvider = ({ children }: GroupModalProviderProps) => {
  const { user } = useAuth();
  const userAvatar = getUserAvatarUrl(user);
  const userName = user?.displayName || user?.name || '使用者';

  // State mgmt
  const { groups, createGroup, updateGroup, deleteGroup, isLoading } =
    useGroups();

  // Active Group State (Global)
  // 實際專案中這可能來自 URL 或全域 Store，這裡在 Provider 內部管理以實現連動
  const [activeGroupId, setActiveGroupId] = useState<string>('1'); // Default to first group

  // Find active group from mock data (or props if provided)
  // 這裡暫時依賴 mockGroups，實際應從 API 或 props 的 groups 列表中查找
  // 為了讓 TopNav 和 HomeModal 連動，我們需要這個狀態
  // 由於 groups 列表可能在外部，我們這裡先假設只能從 mockGroups 找，
  // 或者透過 props 傳入所有 groups (但這會太複雜)。
  // 簡單解法：這裡 import mockGroups 來查找 (僅供演示連動)
  // 在真實實作中，應該有一個 useGroups hook 即使在 Provider 內也能取得資料
  // useGroups hook has initial data from mockGroups, so this works.
  // When createGroup adds a group, 'groups' updates, and activeGroup is re-calculated if ID matches.
  // Actually, wait. 'groups' is initially empty in useGroups? No, I updated it to fetch mockGroups.
  // So 'groups' will be populated.
  const activeGroup = groups.find((g) => g.id === activeGroupId) || groups[0];

  // Modal States
  const [isHomeModalOpen, setIsHomeModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Actions
  const switchGroup = (groupId: string) => {
    setActiveGroupId(groupId);
  };

  const openHome = () => setIsHomeModalOpen(true);

  const openSettings = () => {
    setIsHomeModalOpen(false);
    setIsSettingsOpen(true);
  };

  const openCreate = () => {
    setIsSettingsOpen(false);
    setIsCreateOpen(true);
  };

  const openEdit = (group: Group) => {
    setSelectedGroup(group);
    setIsSettingsOpen(false);
    setIsEditOpen(true);
  };

  const openMembers = (group: Group) => {
    setSelectedGroup(group);
    setIsSettingsOpen(false);
    setIsHomeModalOpen(false);
    setIsMembersOpen(true);
  };

  const closeAll = () => {
    setIsHomeModalOpen(false);
    setIsSettingsOpen(false);
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setIsMembersOpen(false);
  };

  const handleBackToSettings = () => {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setIsMembersOpen(false);
    setIsSettingsOpen(true);
  };

  return (
    <GroupModalContext.Provider
      value={{
        activeGroup,
        switchGroup,
        openHome,
        openSettings,
        openCreate,
        openEdit,
        openMembers,
        closeAll,
        groups,
        createGroup,
        updateGroup,
        deleteGroup,
        isGroupsLoading: isLoading,
      }}
    >
      {children}

      {/* Render Modals */}
      {/* HomeModal 顯示 Active Group 的內容 */}
      {activeGroup && (
        <HomeModal
          isOpen={isHomeModalOpen}
          onClose={() => setIsHomeModalOpen(false)}
          currentUser={{
            name: userName,
            avatar: userAvatar,
            role:
              activeGroup.members?.find((m) => m.id === user?.id)?.role ||
              'member', // 暫時寫死
          }}
          members={activeGroup.members || []}
          onEditMembers={() => openMembers(activeGroup)}
        />
      )}

      <GroupSettingsModal
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenCreateModal={openCreate}
        onOpenEditModal={openEdit}
        onOpenMembersModal={openMembers}
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
    </GroupModalContext.Provider>
  );
};

// Hook
export const useGroupModal = () => {
  const context = useContext(GroupModalContext);
  if (context === undefined) {
    throw new Error('useGroupModal must be used within a GroupModalProvider');
  }
  return context;
};
