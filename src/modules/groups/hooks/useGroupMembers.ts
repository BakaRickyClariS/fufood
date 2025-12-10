import { useState, useEffect, useCallback } from 'react';
import { groupsApi } from '../api';
import type { GroupMember, InviteMemberForm } from '../types/group.types';

// Manage group members: fetch list, invite, remove, update role
export const useGroupMembers = (groupId: string) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchMembers = useCallback(async () => {
    if (!groupId) return;

    setIsLoading(true);
    try {
      const data = await groupsApi.getMembers(groupId);
      setMembers(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  const inviteMember = async (form: InviteMemberForm) => {
    setIsLoading(true);
    try {
      await groupsApi.inviteMember(groupId, { email: form.email });
      await fetchMembers();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeMember = async (memberId: string) => {
    setIsLoading(true);
    try {
      await groupsApi.removeMember(groupId, memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateMemberRole = async (
    memberId: string,
    role: GroupMember['role'],
  ) => {
    // Placeholder until backend role update is available
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role } : m)),
      );
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    isLoading,
    error,
    inviteMember,
    removeMember,
    updateMemberRole,
    refetch: fetchMembers,
  };
};
