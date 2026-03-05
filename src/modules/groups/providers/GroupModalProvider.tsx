import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  setActiveGroupId,
  selectActiveGroupId,
} from '@/store/slices/activeGroupSlice';
// import { closeModal } from '@/modules/groups/store/groupModalSlice';
import type { Group } from '@/modules/groups/types/group.types';
// import { useAuth } from '@/modules/auth'; // Removed unused
import { useGroups } from '@/modules/groups/hooks/useGroups';
import { identity } from '@/shared/utils/identity';
import type { AppDispatch } from '@/store';

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
  leaveGroup: (groupId: string) => Promise<void>;
  isGroupsLoading: boolean;
};

const GroupModalContext = createContext<GroupModalContextType | undefined>(
  undefined,
);

type GroupModalProviderProps = {
  children: ReactNode;
};

export const GroupModalProvider = ({ children }: GroupModalProviderProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State mgmt
  const {
    groups,
    createGroup,
    updateGroup,
    deleteGroup,
    leaveGroup,
    isLoading,
  } = useGroups();

  const dispatch = useDispatch<AppDispatch>();

  // Redux: 活動群組 ID
  const reduxActiveId = useSelector(selectActiveGroupId);
  const activeGroupId = reduxActiveId || identity.getCachedGroupId() || '1';

  // 處理群組載入後的預設選取邏輯
  useEffect(() => {
    if (!isLoading && groups.length > 0) {
      const currentId = reduxActiveId || identity.getCachedGroupId();
      const isValid = groups.some((g) => g.id === currentId);

      if (!currentId || !isValid) {
        console.log(
          '🔄 [GroupModalProvider] 自動選取第一個群組:',
          groups[0].id,
        );
        dispatch(setActiveGroupId(groups[0].id));
      } else if (!reduxActiveId && currentId && isValid) {
        dispatch(setActiveGroupId(currentId));
      }
    }
  }, [groups, isLoading, reduxActiveId, dispatch]);

  const activeGroup = Array.isArray(groups)
    ? groups.find((g) => g.id === activeGroupId) || groups[0]
    : undefined;

  // Actions - 使用 URL query params，保留當前路徑
  const switchGroup = (groupId: string) => {
    dispatch(setActiveGroupId(groupId));
  };

  const openHome = () => {
    const params = new URLSearchParams(searchParams);
    params.set('modal', 'groups-home');
    setSearchParams(params);
  };

  const openSettings = () => {
    const params = new URLSearchParams(searchParams);
    params.set('modal', 'groups-list');
    setSearchParams(params);
  };

  const openCreate = () => {
    const params = new URLSearchParams(searchParams);
    params.set('modal', 'groups-list');
    params.set('action', 'create');
    setSearchParams(params);
  };

  const openEdit = (group: Group) => {
    const params = new URLSearchParams(searchParams);
    params.set('modal', 'groups-list');
    params.set('action', 'edit');
    params.set('groupId', group.id);
    setSearchParams(params);
  };

  const openMembers = (group: Group) => {
    const params = new URLSearchParams(searchParams);
    params.set('modal', 'groups-members');
    params.set('id', group.id);
    setSearchParams(params);
  };

  const openInvite = (group: Group) => {
    const params = new URLSearchParams(searchParams);
    // Don't replace 'modal', just add 'action' to stack it
    params.set('action', 'invite');
    params.set('id', group.id);
    setSearchParams(params);
  };

  const closeAll = () => {
    // 關閉時只清空群組相關的 query params，保留其他參數
    const params = new URLSearchParams(searchParams);
    params.delete('modal');
    params.delete('action');
    params.delete('groupId');
    params.delete('id');
    setSearchParams(params);
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
        leaveGroup,
        isGroupsLoading: isLoading,
      }}
    >
      {children}
      {/* 移除所有 Modal 渲染，改由 Router 處理 */}
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
