import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { groupsApi, GroupsApiError } from '../api';
import { updateGroupMembers } from '../store/groupsSlice';
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
  const dispatch = useDispatch();

  // Use ref to avoid infinite loop from object dependency
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  const fetchMembers = useCallback(async () => {
    if (!groupId) {
      // 這是正常情況（例如 Modal 尚未開啟時），不需要警告
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
      if (user && user.name) {
        const userIdToMatch = String(user.id);
        const userIndex = memberList.findIndex(
          (m) =>
            m.name === user.name ||
            (m.id && userIdToMatch && String(m.id) === userIdToMatch),
        );

        if (userIndex !== -1) {
          // 當前使用者已在名單中，更新頭像資訊
          finalMembers[userIndex] = {
            ...finalMembers[userIndex],
            avatar:
              finalMembers[userIndex].profilePictureUrl ||
              user.avatar ||
              finalMembers[userIndex].avatar,
          };
          console.log(`✅ [useGroupMembers] 成功識別當前使用者 (${user.name})`);
        } else {
          // 只有在成員列表為空，或真的找不到自己時才注入
          const currentUserMember: GroupMember = {
            id: user.id || '1',
            name: user.name,
            avatar: user.avatar,
            role: 'owner',
          };
          finalMembers = [currentUserMember, ...memberList];
          console.log(
            `ℹ️ [useGroupMembers] 當前使用者不在列表中，已主動注入 (${user.name})`,
          );
        }
      }

      setMembers(finalMembers);
      // 同步到 Redux 全域狀態，確保 GroupList 等組件也能看到最新成員數
      dispatch(updateGroupMembers({ groupId, members: finalMembers }));
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

      // 通知由後端在 API 完成時自動觸發，前端不再手動發送

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

      // 通知由後端在 API 完成時自動觸發，前端不再手動發送

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
