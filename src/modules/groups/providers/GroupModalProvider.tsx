import {
  useState,
  createContext,
  useContext,
  useEffect,
  type ReactNode,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setActiveRefrigeratorId,
  selectActiveRefrigeratorId,
} from '@/store/slices/refrigeratorSlice';
import type { Group } from '@/modules/groups/types/group.types';
import { HomeModal } from '@/modules/groups/components/modals/HomeModal';
import { GroupSettingsModal } from '@/modules/groups/components/modals/GroupSettingsModal';
import { CreateGroupModal } from '@/modules/groups/components/modals/CreateGroupModal';
import { EditGroupModal } from '@/modules/groups/components/modals/EditGroupModal';
import { MembersModal } from '@/modules/groups/components/modals/MembersModal';
import { InviteFriendModal } from '@/modules/groups/components/modals/InviteFriendModal';
import { useAuth } from '@/modules/auth';
import { getUserAvatarUrl } from '@/shared/utils/avatarUtils';
import { useGroups } from '@/modules/groups/hooks/useGroups';

type GroupModalContextType = {
  activeGroup: Group | undefined;
  switchGroup: (groupId: string) => void;
  openHome: () => void;
  openSettings: () => void;
  openCreate: () => void;
  openEdit: (group: Group) => void;
  openMembers: (group: Group) => void;
  openInvite: (group: Group) => void;
  closeAll: () => void;
  groups: Group[];
  createGroup: (form: any) => Promise<any>;
  updateGroup: (id: string, form: any) => Promise<any>;
  deleteGroup: (id: string) => Promise<void>;
  isGroupsLoading: boolean;
};

const GroupModalContext = createContext<GroupModalContextType | undefined>(
  undefined,
);

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

  const dispatch = useDispatch();
  // 優先使用 Redux 中的 ID，若無則從 localStorage 或預設 '1'
  const reduxActiveId = useSelector(selectActiveRefrigeratorId);

  // 這裡我們不再需要本地 activeGroupId state，直接依賴 Redux
  // 但為了避免重構過多，我們可以用一個衍生變數
  const activeGroupId =
    reduxActiveId || localStorage.getItem('activeRefrigeratorId') || '1';

  // 處理群組載入後的預設選取邏輯
  useEffect(() => {
    // 只有當群組資料載入完成且有群組時才執行
    if (!isLoading && groups.length > 0) {
      const currentId =
        reduxActiveId || localStorage.getItem('activeRefrigeratorId');
      const isValid = groups.some((g) => g.id === currentId);

      // 如果當前沒有選中 ID，或是選中的 ID 不在群組列表中（例如預設 '1' 或過期 ID）
      if (!currentId || !isValid) {
        // 自動選取第一個群組
        console.log(
          '🔄 [GroupModalProvider] 自動選取第一個群組:',
          groups[0].id,
        );
        dispatch(setActiveRefrigeratorId(groups[0].id));
      } else if (!reduxActiveId && currentId && isValid) {
        // 如果 Redux 中沒有，但在 LocalStorage 有且有效，同步到 Redux
        dispatch(setActiveRefrigeratorId(currentId));
      }
    }
  }, [groups, isLoading, reduxActiveId, dispatch]);

  const activeGroup = Array.isArray(groups)
    ? groups.find((g) => g.id === activeGroupId) || groups[0]
    : undefined;

  // Modal States
  const [isHomeModalOpen, setIsHomeModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Actions
  const switchGroup = (groupId: string) => {
    // Dispatch to Redux (Slice 會自動處理 localStorage)
    dispatch(setActiveRefrigeratorId(groupId));
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

  const openInvite = (group: Group) => {
    setSelectedGroup(group);
    setIsHomeModalOpen(false);
    setIsSettingsOpen(false);
    // Keep MembersModal open so it stays in background
    setIsInviteOpen(true);
  };

  const closeAll = () => {
    setIsHomeModalOpen(false);
    setIsSettingsOpen(false);
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setIsMembersOpen(false);
    setIsInviteOpen(false);
  };

  const handleBackToSettings = () => {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setIsMembersOpen(false);
    setIsInviteOpen(false);
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
        openInvite,
        closeAll,
        groups: Array.isArray(groups) ? groups : [],
        createGroup,
        updateGroup,
        deleteGroup,
        isGroupsLoading: isLoading,
      }}
    >
      {children}

      {/* Render Modals */}
      {activeGroup && (
        <HomeModal
          isOpen={isHomeModalOpen}
          onClose={() => setIsHomeModalOpen(false)}
          currentUser={{
            name: userName,
            avatar: userAvatar,
            role:
              activeGroup.members?.find((m) => m.id === user?.id)?.role ||
              'member',
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

      <InviteFriendModal
        open={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        group={selectedGroup}
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
