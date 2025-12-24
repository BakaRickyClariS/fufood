import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  SharedListItem,
  SharedList,
  CreateSharedListInput,
} from '../types';
import { sharedListApi } from '../services/api/sharedListApi';

export const useSharedLists = (year?: number, month?: number) => {
  const [lists, setLists] = useState<SharedListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const fetchLists = useCallback(async () => {
    // 只有在首次載入時才顯示 loading 狀態，避免返回頁面時閃爍
    if (!hasLoadedRef.current) {
      setIsLoading(true);
    }
    setError(null);
    try {
      const data = await sharedListApi.getSharedLists(year, month);
      setLists(data);
      hasLoadedRef.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch lists');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [year, month]);

  const createList = async (input: CreateSharedListInput) => {
    setIsLoading(true);
    try {
      const newList = await sharedListApi.createSharedList(input);
      setLists((prev) => [newList, ...prev]);
      return newList;
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

  const fetchList = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await sharedListApi.getSharedListById(id);
      setList(data);
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
