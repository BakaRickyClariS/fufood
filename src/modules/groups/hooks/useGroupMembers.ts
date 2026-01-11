import { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { groupsApi, GroupsApiError } from '../api';
import { selectAllGroups } from '../store/groupsSlice';
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

  // 取得群組資訊以獲取群組名稱
  const allGroups = useSelector(selectAllGroups);
  const currentGroup = allGroups.find((g) => g.id === groupId);
  const groupName = currentGroup?.name || '我的冰箱';
  const actorName = currentUser?.name || '使用者';
  const actorId = currentUser?.id;

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

      // 發送通知給群組成員（新成員加入）
      try {
        const memberIds = members.map((m) => m.id).filter(Boolean) as string[];
        if (memberIds.length > 0) {
          const { notificationsApiImpl } = await import(
            '@/modules/notifications/api/notificationsApiImpl'
          );
          await notificationsApiImpl.sendNotification({
            userIds: memberIds,
            title: '新成員加入',
            body: `${form.email} 已被邀請加入群組`,
            type: 'group',
            subType: 'member',
            group_name: groupName,
            actor_name: actorName,
            actor_id: actorId,
            action: {
              type: 'detail',
              payload: { refrigeratorId: groupId },
            },
          });
          console.log('📢 [useGroupMembers] 已發送成員加入通知');
        }
      } catch (notifyError) {
        console.warn('通知發送失敗 (不影響主流程):', notifyError);
      }

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

    // 取得成員名稱供通知使用
    const memberToRemove = members.find((m) => m.id === memberId);
    const memberName = memberToRemove?.name || '成員';

    try {
      await groupsApi.removeMember(groupId, memberId);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));

      // 發送推播通知給剩餘成員
      try {
        // 取得剩餘成員 ID（排除被移除的成員）
        const remainingMemberIds = members
          .filter((m) => m.id !== memberId)
          .map((m) => m.id)
          .filter(Boolean) as string[];

        if (remainingMemberIds.length > 0) {
          const { notificationsApiImpl } = await import(
            '@/modules/notifications/api/notificationsApiImpl'
          );
          await notificationsApiImpl.sendNotification({
            userIds: remainingMemberIds,
            title: '群組成員變動',
            body: `${memberName} 已離開群組`,
            type: 'group',
            subType: 'member',
            group_name: groupName,
            actor_name: actorName,
            actor_id: actorId,
            action: {
              type: 'detail',
              payload: { refrigeratorId: groupId },
            },
          });
          console.log('📢 [useGroupMembers] 已發送成員離開通知');
        }
      } catch (notifyError) {
        console.warn('通知發送失敗 (不影響主流程):', notifyError);
      }

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
