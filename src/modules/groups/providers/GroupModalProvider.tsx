import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  setActiveRefrigeratorId,
  selectActiveRefrigeratorId,
} from '@/store/slices/refrigeratorSlice';
// import { closeModal } from '@/modules/groups/store/groupModalSlice';
import type { Group } from '@/modules/groups/types/group.types';
// import { useAuth } from '@/modules/auth'; // Removed unused
import { useGroups } from '@/modules/groups/hooks/useGroups';
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
  isGroupsLoading: boolean;
};

const GroupModalContext = createContext<GroupModalContextType | undefined>(
  undefined,
);

type GroupModalProviderProps = {
  children: ReactNode;
};

export const GroupModalProvider = ({ children }: GroupModalProviderProps) => {
  const navigate = useNavigate();

  // State mgmt
  const { groups, createGroup, updateGroup, deleteGroup, isLoading } =
    useGroups();

  const dispatch = useDispatch<AppDispatch>();

  // Redux: 活動群組 ID
  const reduxActiveId = useSelector(selectActiveRefrigeratorId);
  const activeGroupId =
    reduxActiveId || localStorage.getItem('activeRefrigeratorId') || '1';

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

  // Actions - 首頁子路由策略
  const switchGroup = (groupId: string) => {
    dispatch(setActiveRefrigeratorId(groupId));
  };

  const openHome = () => {
    // 首頁子路由：groups-home
    navigate('/?modal=groups-home');
  };

  const openSettings = () => {
    // 首頁子路由：groups-list
    navigate('/?modal=groups-list');
  };

  const openCreate = () => {
    // 使用 Location State 觸發 Create Modal（在 groups-list 內）
    navigate('/?modal=groups-list', { state: { action: 'create' } });
  };

  const openEdit = (group: Group) => {
    navigate('/?modal=groups-list', {
      state: { action: 'edit', groupId: group.id },
    });
  };

  const openMembers = (group: Group) => {
    navigate(`/?modal=groups-members&id=${group.id}`);
  };

  const openInvite = (group: Group) => {
    navigate(`/?modal=groups-invite&id=${group.id}`);
  };

  const closeAll = () => {
    // 關閉時只清空 query params，不導航到其他路由
    navigate('/');
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
