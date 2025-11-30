import { useState, useEffect } from 'react';
import { groupsApi } from '../api';
import type {
  Group,
  CreateGroupForm,
  UpdateGroupForm,
} from '../types/group.types';

/**
 * 群組資料管理 Hook
 */
export const useGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchGroups = async () => {
    setIsLoading(true);
        try {
      const data = await groupsApi.getAll();
      setGroups(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const createGroup = async (form: CreateGroupForm) => {
    setIsLoading(true);
    try {
      const newGroup = await groupsApi.create(form);
      setGroups((prev) => [...prev, newGroup]);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateGroup = async (id: string, form: UpdateGroupForm) => {
    setIsLoading(true);
    try {
      const updatedGroup = await groupsApi.update(id, form);
      setGroups((prev) => prev.map((g) => (g.id === id ? updatedGroup : g)));
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGroup = async (id: string) => {
    setIsLoading(true);
    try {
      await groupsApi.delete(id);
      setGroups((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return {
    groups,
    isLoading,
    error,
    createGroup,
    updateGroup,
    deleteGroup,
    refetch: fetchGroups,
  };
};
