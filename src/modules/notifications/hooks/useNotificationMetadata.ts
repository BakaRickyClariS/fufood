import { useSelector } from 'react-redux';
import { useAuth } from '@/modules/auth';
import { selectAllGroups } from '@/modules/groups/store/groupsSlice';

/**
 * 取得發送通知時所需的 metadata (群組名稱、操作者名稱、操作者 ID)
 *
 * @param groupId - 目標群組 ID
 * @returns { groupName, actorName, actorId } - 通知發送所需欄位
 *
 * @example
 * ```tsx
 * const { groupName, actorName, actorId } = useNotificationMetadata(groupId);
 *
 * await sendNotification({
 *   // ...
 *   groupName,
 *   actorName,
 *   actorId,
 *   group_name: groupName,
 *   actor_name: actorName,
 *   actor_id: actorId,
 * });
 * ```
 */
export const useNotificationMetadata = (groupId?: string) => {
  const { user } = useAuth();
  const groups = useSelector(selectAllGroups);

  // 取得群組名稱
  const currentGroup = groupId ? groups.find((g) => g.id === groupId) : null;

  // Debug log 以追蹤問題
  if (groupId && !currentGroup && groups.length > 0) {
    console.warn(
      `[useNotificationMetadata] 找不到 ID 為 "${groupId}" 的群組，可用群組:`,
      groups.map((g) => ({ id: g.id, name: g.name })),
    );
  }

  // 優先使用找到的群組名稱，fallback 到第一個群組，最後才是「我的群組」
  const groupName =
    currentGroup?.name ||
    (groups.length > 0 && !groupId ? groups[0]?.name : '我的群組');

  // 使用 Email 前綴作為 name 的備案
  const emailPrefix = user?.email ? user.email.split('@')[0] : '使用者';
  const actorName = user?.name || emailPrefix;
  const actorId = user?.id;

  return {
    groupName,
    actorName,
    actorId,
  };
};

export default useNotificationMetadata;
