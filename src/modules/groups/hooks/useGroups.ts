import { useState, useEffect } from 'react';
import { groupsApi } from '../api';
import type { Group, CreateGroupForm, UpdateGroupForm } from '../types/group.types';

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
      // TODO: 實作 API 呼叫
      // const data = await groupsApi.getAll();
      // 目前使用 Mock 資料
      // 模擬 API 延遲
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockGroups: Group[] = [
        {
          id: '1',
          name: 'My Home',
          admin: 'Jocelyn',
          members: [
            { id: '1', name: 'Jocelyn (你)', role: 'owner', avatar: 'bg-red-200' },
            { id: '2', name: 'Zoe', role: 'organizer', avatar: 'bg-orange-200' },
            { id: '3', name: 'Ricky', role: 'organizer', avatar: 'bg-amber-200' },
          ],
          color: 'bg-red-100',
          characterColor: 'bg-red-400',
          plan: 'free',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      setGroups(mockGroups);
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
      setGroups(prev => [...prev, newGroup]);
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
      setGroups(prev => prev.map(g => g.id === id ? updatedGroup : g));
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
      setGroups(prev => prev.filter(g => g.id !== id));
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
