import { useMemo } from 'react';
import { useNotificationsQuery } from '../api/queries';

/**
 * 取得未讀通知數量
 *
 * @example
 * ```tsx
 * const { unreadCount, hasUnread } = useUnreadCount();
 *
 * {hasUnread && <Badge count={unreadCount} />}
 * ```
 */
export const useUnreadCount = () => {
  const { data, isLoading } = useNotificationsQuery();

  const unreadCount = useMemo(() => {
    if (!data?.items) return 0;
    return data.items.filter((n) => !n.isRead).length;
  }, [data?.items]);

  const hasUnread = unreadCount > 0;

  return {
    /** 未讀通知數量 */
    unreadCount,
    /** 是否有未讀通知 */
    hasUnread,
    /** 是否正在載入 */
    isLoading,
  };
};

export default useUnreadCount;
