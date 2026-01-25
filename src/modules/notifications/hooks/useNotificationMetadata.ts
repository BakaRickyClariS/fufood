import { useSelector } from 'react-redux';
import { useAuth } from '@/modules/auth';
import { selectAllGroups } from '@/modules/groups/store/groupsSlice';

/**
 * 取得發送通知時所需的 metadata (群組名稱、操作者名稱、操作者 ID)
 *
 * @param refrigeratorId - 目標冰箱/群組 ID
 * @returns { groupName, actorName, actorId } - 通知發送所需欄位
 *
 * @example
 * ```tsx
 * const { groupName, actorName, actorId } = useNotificationMetadata(refrigeratorId);
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
export const useNotificationMetadata = (refrigeratorId?: string) => {
  const { user } = useAuth();
  const groups = useSelector(selectAllGroups);

  // 取得群組名稱
  const currentGroup = refrigeratorId
    ? groups.find((g) => g.id === refrigeratorId)
    : null;

  // Debug log 以追蹤問題
  if (refrigeratorId && !currentGroup && groups.length > 0) {
    console.warn(
      `[useNotificationMetadata] 找不到 ID 為 "${refrigeratorId}" 的群組，可用群組:`,
      groups.map((g) => ({ id: g.id, name: g.name })),
    );
  }

  // 優先使用找到的群組名稱，fallback 到第一個群組，最後才是「我的冰箱」
  const groupName =
    currentGroup?.name ||
    (groups.length > 0 && !refrigeratorId ? groups[0]?.name : '我的冰箱');

  // 使用 Email 前綴作為 displayName 的備案
  const emailPrefix = user?.email ? user.email.split('@')[0] : '使用者';
  const actorName = user?.displayName || user?.name || emailPrefix;
  const actorId = user?.id;

  return {
    groupName,
    actorName,
    actorId,
  };
};

export default useNotificationMetadata;
