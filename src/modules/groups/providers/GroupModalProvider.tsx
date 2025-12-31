import {
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
import {
  openModal,
  closeModal,
  selectModalStep,
  selectTargetGroupId,
} from '@/modules/groups/store/groupModalSlice';
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
import type { AppDispatch, RootState } from '@/store';

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

  const dispatch = useDispatch<AppDispatch>();
  
  // Redux: 活動群組 ID
  const reduxActiveId = useSelector(selectActiveRefrigeratorId);
  const activeGroupId =
    reduxActiveId || localStorage.getItem('activeRefrigeratorId') || '1';

  // Redux: Modal 狀態
  const modalStep = useSelector((state: RootState) => selectModalStep(state));
  const targetGroupId = useSelector((state: RootState) => selectTargetGroupId(state));

  // 處理群組載入後的預設選取邏輯
  useEffect(() => {
    if (!isLoading && groups.length > 0) {
      const currentId =
        reduxActiveId || localStorage.getItem('activeRefrigeratorId');
      const isValid = groups.some((g) => g.id === currentId);

      if (!currentId || !isValid) {
        console.log(
          '🔄 [GroupModalProvider] 自動選取第一個群組:',
          groups[0].id,
        );
        dispatch(setActiveRefrigeratorId(groups[0].id));
      } else if (!reduxActiveId && currentId && isValid) {
        dispatch(setActiveRefrigeratorId(currentId));
      }
    }
  }, [groups, isLoading, reduxActiveId, dispatch]);

  const activeGroup = Array.isArray(groups)
    ? groups.find((g) => g.id === activeGroupId) || groups[0]
    : undefined;

  // 根據 targetGroupId 找到選中的群組
  const selectedGroup = targetGroupId
    ? groups.find((g) => g.id === targetGroupId) || null
    : null;

  // Actions
  const switchGroup = (groupId: string) => {
    dispatch(setActiveRefrigeratorId(groupId));
  };

  const openHome = () => {
    dispatch(openModal({ step: 'home' }));
  };

  const openSettings = () => {
    dispatch(openModal({ step: 'settings' }));
  };

  const openCreate = () => {
    dispatch(openModal({ step: 'create' }));
  };

  const openEdit = (group: Group) => {
    dispatch(openModal({ step: 'edit', targetGroupId: group.id }));
  };

  const openMembers = (group: Group) => {
    dispatch(openModal({ step: 'members', targetGroupId: group.id }));
  };

  const openInvite = (group: Group) => {
    dispatch(openModal({ step: 'invite', targetGroupId: group.id }));
  };

  const closeAll = () => {
    dispatch(closeModal());
  };

  const handleBackToSettings = () => {
    dispatch(openModal({ step: 'settings' }));
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
          isOpen={modalStep === 'home'}
          onClose={closeAll}
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
        open={modalStep === 'settings'}
        onClose={closeAll}
        onOpenCreateModal={openCreate}
        onOpenEditModal={openEdit}
        onOpenMembersModal={openMembers}
      />

      <CreateGroupModal
        open={modalStep === 'create'}
        onClose={closeAll}
        onBack={handleBackToSettings}
      />

      <EditGroupModal
        open={modalStep === 'edit'}
        onClose={closeAll}
        group={selectedGroup}
        onBack={handleBackToSettings}
      />

      <MembersModal
        open={modalStep === 'members'}
        onClose={closeAll}
        group={selectedGroup}
        onBack={handleBackToSettings}
      />

      <InviteFriendModal
        open={modalStep === 'invite'}
        onClose={closeAll}
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
