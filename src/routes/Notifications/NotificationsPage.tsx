import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs } from '@/shared/components/ui/animated-tabs';
import {
  NotificationItem,
  EditMenu,
  EditActionBar,
} from '@/modules/notifications/components';
import {
  useNotificationsByCategoryQuery,
  useMarkAsReadMutation,
  useDeleteNotificationsMutation,
  useMarkAsReadBatchMutation,
} from '@/modules/notifications/api';
import { useEditMode } from '@/modules/notifications/hooks';
import type {
  NotificationCategory,
  NotificationMessage,
  NotificationGroup,
} from '@/modules/notifications/types';
import FoodDetailModal from '@/modules/inventory/components/ui/modal/FoodDetailModal';
import { RecipeDetailModal } from '@/modules/recipe/components/ui/RecipeDetailModal';
import { useInventoryItemQuery } from '@/modules/inventory/api';
import { useRecipeQuery } from '@/modules/recipe/api/queries';
import type { RecipeListItem } from '@/modules/recipe/types';

// Tab 類型定義
type NotificationTabId = NotificationCategory;

const NOTIFICATION_TABS: { id: NotificationTabId; label: string }[] = [
  { id: 'stock', label: '食材管家' },
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

  // Modal 狀態
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [openRecipeId, setOpenRecipeId] = useState<string | null>(null);

  // 使用 API 取得通知 (Production Mode)
  const { data, isLoading } = useNotificationsByCategoryQuery(activeTab);

  const markAsRead = useMarkAsReadMutation();
  const deleteBatch = useDeleteNotificationsMutation();
  const markAsReadBatch = useMarkAsReadBatchMutation();

  // 取得 Modal 資料
  const { data: itemData, refetch: refetchItem } = useInventoryItemQuery(
    openItemId || '',
  );
  const { data: recipeData } = useRecipeQuery(openRecipeId || '');

  // 編輯模式狀態
  const {
    isEditMode,
    selectedIds,
    enterEditMode,
    exitEditMode,
    toggleSelect,
    selectAll,
    clearSelection,
  } = useEditMode();

  // 當切換 Tab 時退出編輯模式
  useMemo(() => {
    exitEditMode();
  }, [activeTab, exitEditMode]);

  // 將通知按日期分組
  const groupedData = useMemo(() => {
    if (!data?.data.items) return [];
    return groupNotificationsByDate(data.data.items);
  }, [data?.data.items]);

  // 處理通知點擊
  const handleNotificationClick = (notification: NotificationMessage) => {
    // 編輯模式時，處理選取邏輯（由 NotificationItem 的 onToggleSelect 處理）
    if (isEditMode) return;

    // 標記已讀
    if (!notification.isRead) {
      markAsRead.mutate({ id: notification.id, isRead: true });
    }

    // 根據 action.type 開啟 Modal 或跳轉
    const actionType = notification.action?.type;
    const actionPayload = notification.action?.payload;

    switch (actionType) {
      case 'inventory':
        if (actionPayload?.itemId) {
          setOpenItemId(actionPayload.itemId);
        } else {
          navigate('/inventory');
        }
        break;

      case 'recipe':
        if (actionPayload?.recipeId) {
          setOpenRecipeId(actionPayload.recipeId);
        } else {
          navigate('/planning?tab=recipes');
        }
        break;

      case 'shopping-list':
        if (actionPayload?.listId) {
          navigate('/planning?tab=shopping', {
            state: { openListId: actionPayload.listId },
          });
        } else {
          navigate('/planning?tab=shopping');
        }
        break;

      case 'detail':
      default:
        navigate(`/notifications/${notification.id}`);
        break;
    }
  };

  // 處理全選
  const handleSelectAll = () => {
    if (!data?.data.items) return;
    const allIds = data.data.items.map((item) => item.id);
    enterEditMode();
    selectAll(allIds);
  };

  // 處理進入選取模式
  const handleEnterSelectionMode = () => {
    enterEditMode();
    clearSelection();
  };

  // 處理批次刪除
  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;

    deleteBatch.mutate(Array.from(selectedIds), {
      onSuccess: () => {
        clearSelection();
      },
    });
  };

  // 處理批次已讀
  const handleMarkSelectedAsRead = () => {
    if (selectedIds.size === 0) return;

    markAsReadBatch.mutate(
      { ids: Array.from(selectedIds), isRead: true },
      {
        onSuccess: () => {
          clearSelection();
        },
      },
    );
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
      <div className="space-y-0 pb-20">
        {groups.map((group, groupIndex) => (
          <div key={group.date}>
            {/* Date Header */}
            <div className="bg-gray-100 px-4 py-2 text-sm font-bold text-gray-900 border-b border-gray-200 flex justify-between items-center h-10">
              <span>{group.date}</span>

              {/* 第一個群組顯示編輯操作區 */}
              {groupIndex === 0 &&
                groups.length > 0 &&
                (isEditMode ? (
                  <button
                    onClick={exitEditMode}
                    className="text-sm font-bold text-gray-500 hover:text-gray-900 px-2 py-1"
                  >
                    取消
                  </button>
                ) : (
                  <EditMenu
                    onSelectMode={handleEnterSelectionMode}
                    onSelectAll={handleSelectAll}
                  />
                ))}
            </div>

            {/* Items */}
            {group.items.map((item) => (
              <NotificationItem
                key={item.id}
                id={item.id}
                type={item.type}
                subType={item.subType} // Pass subType
                title={item.title}
                message={item.message}
                groupName={item.groupName} // Pass groupName
                actorName={item.actorName} // Pass actorName
                isRead={item.isRead}
                onClick={() => handleNotificationClick(item)}
                category={activeTab}
                isEditMode={isEditMode}
                isSelected={selectedIds.has(item.id)}
                onToggleSelect={() => toggleSelect(item.id)}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-24 bg-neutral-100">
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
      <div className="">{renderGroupedList(groupedData)}</div>

      {/* Edit Action Bar */}
      {isEditMode && (
        <EditActionBar
          selectedCount={selectedIds.size}
          onDelete={handleDeleteSelected}
          onMarkAsRead={handleMarkSelectedAsRead}
        />
      )}

      {/* Inline Modals */}
      {openItemId && itemData?.data?.item && (
        <FoodDetailModal
          item={itemData.data.item}
          isOpen={true}
          onClose={() => setOpenItemId(null)}
          onItemUpdate={refetchItem}
          isCompleted={itemData.data.item.quantity <= 0}
        />
      )}

      {/* Recipe Modal: 
          如果 recipeData 存在，則使用它來建立合法的 RecipeListItem 傳遞給 Modal
          雖然 RecipeDetailModal 內部會再次 fetch 詳細資料 (透過 ID)，但這裡傳 ID 進去即可觸發。
          或者如果 RecipeDetailModal 支援傳入完整 recipe，則更佳。
          目前 RecipeDetailModal 接受 RecipeListItem。
      */}
      {openRecipeId && recipeData && (
        <RecipeDetailModal
          recipe={
            {
              id: recipeData.id,
              name: recipeData.name,
              imageUrl: recipeData.imageUrl,
              category: recipeData.category,
              cookTime: recipeData.cookTime,
              servings: recipeData.servings,
              difficulty: recipeData.difficulty, // Ensure Recipe['difficulty'] and RecipeListItem['difficulty'] are compatible
              isFavorite: recipeData.isFavorite,
            } as RecipeListItem
          }
          isOpen={true}
          onClose={() => setOpenRecipeId(null)}
        />
      )}
    </div>
  );
};

export default NotificationsPage;
