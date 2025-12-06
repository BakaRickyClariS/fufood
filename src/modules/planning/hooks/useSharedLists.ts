import { useState, useEffect, useCallback } from 'react';
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

  const fetchLists = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await sharedListApi.getSharedLists(year, month);
      setLists(data);
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

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  return {
    lists,
    isLoading,
    error,
    refetch: fetchLists,
    createList,
  };
};

export const useSharedListDetail = (id: string | undefined) => {
  const [list, setList] = useState<SharedList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
