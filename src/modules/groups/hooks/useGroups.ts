import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import {
  fetchGroups as fetchGroupsAction,
  createGroup as createGroupAction,
  updateGroup as updateGroupAction,
  deleteGroup as deleteGroupAction,
  selectAllGroups,
  selectGroupsLoading,
  selectGroupsError,
} from '../store/groupsSlice';
import type { CreateGroupForm, UpdateGroupForm } from '../types/group.types';

/**
 * 群組資料管理 Hook (Redux Version)
 *
 * 整合 Redux 全域狀態管理，確保所有群組資料的變更都能即時同步到所有組件。
 */
export const useGroups = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Select state from Redux
  const groups = useSelector((state: RootState) => selectAllGroups(state));
  const isLoading = useSelector((state: RootState) =>
    selectGroupsLoading(state),
  );
  const errorMsg = useSelector((state: RootState) => selectGroupsError(state));

  const fetchGroups = useCallback(() => {
    dispatch(fetchGroupsAction());
  }, [dispatch]);

  const createGroup = async (form: CreateGroupForm) => {
    try {
      const resultAction = await dispatch(createGroupAction(form));
      if (createGroupAction.fulfilled.match(resultAction)) {
        return resultAction.payload;
      } else {
        throw new Error(resultAction.payload as string);
      }
    } catch (err) {
      throw err;
    }
  };

  const updateGroup = async (id: string, form: UpdateGroupForm) => {
    try {
      const resultAction = await dispatch(
        updateGroupAction({ id, data: form }),
      );
      if (updateGroupAction.fulfilled.match(resultAction)) {
        return resultAction.payload;
      } else {
        throw new Error(resultAction.payload as string);
      }
    } catch (err) {
      throw err;
    }
  };

  const deleteGroup = async (id: string) => {
    try {
      const resultAction = await dispatch(deleteGroupAction(id));
      if (deleteGroupAction.fulfilled.match(resultAction)) {
        return;
      } else {
        throw new Error(resultAction.payload as string);
      }
    } catch (err) {
      throw err;
    }
  };

  // Initial fetch on mount
  // 注意：這會導致每個使用此 Hook 的組件都觸發一次 fetch
  // 但目前主要由 GroupModalProvider 使用，作為 Singleton 存在
  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return {
    groups,
    isLoading,
    error: errorMsg ? new Error(errorMsg) : null,
    createGroup,
    updateGroup,
    deleteGroup,
    refetch: fetchGroups,
  };
};
