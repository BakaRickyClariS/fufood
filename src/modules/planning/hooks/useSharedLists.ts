import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import type {
  SharedList,
  CreateSharedListInput,
  SharedListStatus,
} from '../types';
import { sharedListApi } from '../services/api/sharedListApi';
import { selectAllGroups } from '@/modules/groups/store/groupsSlice';
import { useAuth } from '@/modules/auth';

export const useSharedLists = (
  refrigeratorId: string,
  year?: number,
  month?: number,
) => {
  const [lists, setLists] = useState<SharedList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);
  const groups = useSelector(selectAllGroups);
  const { user } = useAuth();

  // Status 計算邏輯
  const computeStatus = (startsAt: string): SharedListStatus => {
    const startDate = new Date(startsAt);
    // 設定為當天 23:59:59
    startDate.setHours(23, 59, 59, 999);

    const now = new Date();

    // 只有當現在時間超過 startsAt 當天結束時（即隔天）才標記為已完成
    return now.getTime() > startDate.getTime() ? 'completed' : 'in-progress';
  };

  const fetchLists = useCallback(async () => {
    if (!refrigeratorId) return;

    // 只有在首次載入時才顯示 loading 狀態，避免返回頁面時閃爍
    if (!hasLoadedRef.current) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const data = await sharedListApi.getSharedLists(refrigeratorId);

      // 前端加工 Status
      const processedLists = data.map((list) => ({
        ...list,
        status: computeStatus(list.startsAt),
      }));

      // 如果有年月篩選，在此過濾 (或者後端有支援的話改用後端參數，目前 API 看起來只列出所有)
      let filtered = processedLists;
      if (year && month) {
        filtered = processedLists.filter((list) => {
          const date = new Date(list.startsAt);
          return date.getFullYear() === year && date.getMonth() + 1 === month;
        });
      }

      setLists(filtered);
      hasLoadedRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch lists');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [refrigeratorId, year, month]);

  const createList = async (input: CreateSharedListInput) => {
    if (!refrigeratorId) throw new Error('No refrigerator ID provided');
    setIsLoading(true);
    try {
      const newList = await sharedListApi.createSharedList(
        refrigeratorId,
        input,
      );
      const processedList = {
        ...newList,
        status: computeStatus(newList.startsAt),
      };

      // 發送通知給群組成員
      try {
        // 取得群組名稱和使用者名稱
        const currentGroup = groups.find((g) => g.id === refrigeratorId);
        const groupName = currentGroup?.name || '我的冰箱';
        const actorName = user?.displayName || user?.email || '使用者';

        const { notificationsApiImpl } = await import(
          '@/modules/notifications/api/notificationsApiImpl'
        );
        await notificationsApiImpl.sendNotification({
          groupId: refrigeratorId,
          title: `採購清單「${input.title}」已建立`,
          body: '快來看看需要買什麼，一起規劃下次的購物行程吧！',
          type: 'shopping',
          subType: 'list', // 新增 subType
          groupName,
          actorName,
          group_name: groupName,
          actor_name: actorName,
          action: {
            type: 'shopping-list',
            payload: {
              refrigeratorId: refrigeratorId,
              listId: newList.id,
            },
          },
        });
      } catch (notifyError) {
        console.warn('通知發送失敗:', notifyError);
      }

      setLists((prev) => [processedList, ...prev]);
      return processedList;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create list';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteList = async (id: string) => {
    // Optimistic update: 立即從 UI 移除
    const previousLists = lists;
    setLists((prev) => prev.filter((list) => list.id !== id));

    try {
      await sharedListApi.deleteSharedList(id);
    } catch (err) {
      // 失敗時回滾：恢復之前的狀態
      setLists(previousLists);
      const msg = err instanceof Error ? err.message : 'Failed to delete list';
      setError(msg);
      throw new Error(msg);
    }
  };

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  return {
    lists,
    isLoading,
    error,
    refetch: fetchLists,
    createList,
    deleteList,
  };
};

export const useSharedListDetail = (id: string | undefined) => {
  const [list, setList] = useState<SharedList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status 計算邏輯（與 useSharedLists 一致）
  const computeStatus = (startsAt: string): SharedListStatus => {
    const startDate = new Date(startsAt);
    // 設定為當天 23:59:59
    startDate.setHours(23, 59, 59, 999);

    const now = new Date();

    // 只有當現在時間超過 startsAt 當天結束時（即隔天）才標記為已完成
    return now.getTime() > startDate.getTime() ? 'completed' : 'in-progress';
  };

  const fetchList = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await sharedListApi.getSharedListById(id);
      // 前端加工 Status（與 useSharedLists 一致）
      const processedList = {
        ...data,
        status: computeStatus(data.startsAt),
      };
      setList(processedList);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch list details',
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return { list, isLoading, error, refetch: fetchList };
};
