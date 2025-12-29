import { useState, useEffect, useCallback, useRef } from 'react';
import { groupsApi, GroupsApiError } from '../api';
import type { GroupMember, InviteMemberForm } from '../types/group.types';

type CurrentUserInfo = {
  id?: string;
  name: string;
  avatar: string;
};

/**
 * 群組成員管理 Hook
 *
 * Console 輸出說明：
 * 🔵 開始 API 呼叫
 * 🟢 API 呼叫成功
 * 🔴 API 呼叫失敗
 * 🟡 使用 Mock 資料
 */
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
    if (!groupId) {
      console.warn('⚠️ [useGroupMembers] groupId 為空，跳過 API 呼叫');
      return;
    }

    console.group(`📋 [useGroupMembers] 取得群組成員 (groupId: ${groupId})`);
    setIsLoading(true);
    setError(null);

    try {
      const data = await groupsApi.getMembers(groupId);
      const user = currentUserRef.current;

      // 確保 data 是陣列
      const memberList = Array.isArray(data) ? data : [];
      let finalMembers = [...memberList];

      // 注入當前使用者（如果不在清單中）
      // 這通常發生在剛建立群組或後端 API 未回傳擁有者時
      if (user && user.name) {
        const userAlreadyInList = memberList.some(
          (m) => m.name === user.name || (m.id && user.id && m.id === user.id),
        );

        if (!userAlreadyInList) {
          const currentUserMember: GroupMember = {
            id: user.id || 'current-user',
            name: user.name,
            avatar: user.avatar,
            role: 'owner', // 假設當前使用者是擁有者（對於新群組通常是）
          };
          // 將當前使用者加入到列表最前方，且保留原始回傳的成員
          finalMembers = [currentUserMember, ...memberList];
          console.log(
            `ℹ️ [useGroupMembers] 當前使用者不在列表中，已自動注入 (${user.name})`,
          );
        }
      }

      setMembers(finalMembers);
      console.log(
        `✅ [useGroupMembers] 成功取得成員列表 (總數: ${finalMembers.length}, API回傳: ${memberList.length})`,
      );
      console.groupEnd();
    } catch (err) {
      if (err instanceof GroupsApiError) {
        console.error(
          `❌ 取得成員失敗: [${err.statusCode || 'N/A'}] ${err.message}`,
        );
      }
      setError(err as Error);
      console.groupEnd();
    } finally {
      setIsLoading(false);
    }
  }, [groupId]); // Only depend on groupId, use ref for currentUser

  const inviteMember = async (form: InviteMemberForm) => {
    console.group(`📋 [useGroupMembers] 邀請成員 (groupId: ${groupId})`);
    console.log('邀請資料:', form);
    setIsLoading(true);
    setError(null);

    try {
      await groupsApi.inviteMember(groupId, { email: form.email });
      console.log('✅ [useGroupMembers] 邀請成功，重新取得成員列表');
      await fetchMembers();
      console.groupEnd();
    } catch (err) {
      if (err instanceof GroupsApiError) {
        console.error(
          `❌ 邀請失敗: [${err.statusCode || 'N/A'}] ${err.message}`,
        );
      }
      setError(err as Error);
      console.groupEnd();
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeMember = async (memberId: string) => {
    console.group(
      `📋 [useGroupMembers] 移除成員 (groupId: ${groupId}, memberId: ${memberId})`,
    );
    setIsLoading(true);
    setError(null);

    try {
      await groupsApi.removeMember(groupId, memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
      console.log('✅ [useGroupMembers] 成員移除成功');
      console.groupEnd();
    } catch (err) {
      if (err instanceof GroupsApiError) {
        console.error(
          `❌ 移除失敗: [${err.statusCode || 'N/A'}] ${err.message}`,
        );
      }
      setError(err as Error);
      console.groupEnd();
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateMemberRole = async (
    memberId: string,
    role: GroupMember['role'],
  ) => {
    console.group(
      `📋 [useGroupMembers] 更新成員權限 (memberId: ${memberId}, role: ${role})`,
    );
    setIsLoading(true);
    setError(null);

    try {
      await groupsApi.updateMemberRole(groupId, memberId, role);
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role } : m)),
      );
      console.log('✅ [useGroupMembers] 權限更新成功');
      console.groupEnd();
    } catch (err) {
      if (err instanceof GroupsApiError) {
        console.error(
          `❌ 權限更新失敗: [${err.statusCode || 'N/A'}] ${err.message}`,
        );
      }
      setError(err as Error);
      console.groupEnd();
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
