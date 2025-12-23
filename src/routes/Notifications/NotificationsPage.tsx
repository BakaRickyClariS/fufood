import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs } from '@/shared/components/ui/animated-tabs';
import { NotificationItem } from '@/modules/notifications/components';
import {
  useNotificationsByCategoryQuery,
  useMarkAsReadMutation,
} from '@/modules/notifications/api';
import type {
  NotificationCategory,
  NotificationMessage,
  NotificationGroup,
} from '@/modules/notifications/types';

// Tab 類型定義
type NotificationTabId = NotificationCategory;

const NOTIFICATION_TABS: { id: NotificationTabId; label: string }[] = [
  { id: 'stock', label: '食材管家' },
  { id: 'inspiration', label: '靈感生活' },
  { id: 'official', label: '官方公告' },
];

// 將通知按日期分組
const groupNotificationsByDate = (
  items: NotificationMessage[],
): NotificationGroup[] => {
  const grouped = items.reduce(
    (acc, item) => {
      const date = new Date(item.createdAt)
        .toLocaleDateString('zh-TW', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
        .replace(/\//g, '/');

      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    },
    {} as Record<string, NotificationMessage[]>,
  );

  return Object.entries(grouped)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .map(([date, items]) => ({ date, items }));
};

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<NotificationTabId>('stock');

  // 使用 API 取得通知
  const { data, isLoading } = useNotificationsByCategoryQuery(activeTab);
  const markAsRead = useMarkAsReadMutation();

  // 將通知按日期分組
  const groupedData = useMemo(() => {
    if (!data?.data.items) return [];
    return groupNotificationsByDate(data.data.items);
  }, [data?.data.items]);

  // 處理通知點擊
  const handleNotificationClick = (notification: NotificationMessage) => {
    // 標記已讀
    if (!notification.isRead) {
      markAsRead.mutate({ id: notification.id, isRead: true });
    }

    // 根據 actionType 跳轉
    switch (notification.actionType) {
      case 'inventory':
        if (notification.actionPayload?.itemId) {
          navigate(`/inventory/${notification.actionPayload.itemId}`);
        }
        break;
      case 'shopping-list':
        if (notification.actionPayload?.listId) {
          navigate(
            `/planning?tab=shopping&id=${notification.actionPayload.listId}`,
          );
        }
        break;
      case 'recipe':
        if (notification.actionPayload?.recipeId) {
          navigate(`/recipes/${notification.actionPayload.recipeId}`);
        }
        break;
      case 'detail':
      default:
        navigate(`/notifications/${notification.id}`);
        break;
    }
  };

  const renderGroupedList = (groups: NotificationGroup[]) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      );
    }

    if (groups.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <p>目前沒有通知</p>
        </div>
      );
    }

    return (
      <div className="space-y-0">
        {groups.map((group) => (
          <div key={group.date}>
            {/* Date Header */}
            <div className="bg-gray-100 px-4 py-2 text-sm font-bold text-gray-900 border-b border-gray-200">
              {group.date}
            </div>
            {/* Items */}
            {group.items.map((item) => (
              <NotificationItem
                key={item.id}
                id={item.id}
                type={item.type}
                title={item.title}
                description={item.description}
                isRead={item.isRead}
                onClick={() => handleNotificationClick(item)}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-24 bg-white">
      {/* Tab Navigation header */}
      <div className="sticky top-0 z-30 bg-neutral-100 pt-6 pb-4 px-4">
        <Tabs
          variant="pill"
          tabs={NOTIFICATION_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Tab Content */}
      <div className="bg-white">{renderGroupedList(groupedData)}</div>
    </div>
  );
};

export default NotificationsPage;
