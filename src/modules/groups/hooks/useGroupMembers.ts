import { useState, useEffect, useCallback, useRef } from 'react';
import { groupsApi } from '../api';
import type { GroupMember, InviteMemberForm } from '../types/group.types';

type CurrentUserInfo = {
  id?: string;
  name: string;
  avatar: string;
};

// Manage group members: fetch list, invite, remove, update role
export const useGroupMembers = (
  groupId: string,
  currentUser?: CurrentUserInfo,
) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Use ref to avoid infinite loop from object dependency
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  const fetchMembers = useCallback(async () => {
    if (!groupId) return;

    setIsLoading(true);
    try {
      const data = await groupsApi.getMembers(groupId);
      const user = currentUserRef.current;

      // Inject current user - replace first member with current user to maintain 3 members
      if (user && user.name) {
        const userAlreadyInList = data.some(
          (m) => m.name === user.name || m.id === user.id,
        );

        if (!userAlreadyInList && data.length > 0) {
          // Replace first member with current user (maintain 3 members)
          const currentUserMember: GroupMember = {
            id: user.id || 'current-user',
            name: user.name,
            avatar: user.avatar,
            role: 'owner', // Current user is owner
          };
          // Keep current user first, then rest of members (excluding first one)
          setMembers([currentUserMember, ...data.slice(1)]);
        } else {
          setMembers(data);
        }
      } else {
        setMembers(data);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [groupId]); // Only depend on groupId, use ref for currentUser

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
