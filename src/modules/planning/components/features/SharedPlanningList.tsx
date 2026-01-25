import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useSharedListsContext } from '@/modules/planning/contexts/SharedListsContext';
import { SharedListCard } from '../ui/SharedListCard';
import { FloatingActionButton } from '@/shared/components/ui/FloatingActionButton';
import { CreateSharedListDrawer } from './CreateSharedListDrawer';
import { TOAST_MESSAGES } from '@/constants/messages';
import type { SharedList } from '@/modules/planning/types';

import type { ConsumptionItem } from '@/modules/recipe/types';

type SharedPlanningListProps = {
  statusFilter: string; // 當前選擇的 Tab 對應狀態 Id
  year?: number;
  month?: number;
  /** 開啟清單詳細頁的回呼 */
  onOpenList?: (listId: string) => void;
  /** 開啟編輯清單的回呼 */
  onOpenEdit?: (listId: string) => void;
  /** 是否開啟建立清單 Drawer (外部控制) */
  isCreateOpen?: boolean;
  /** 建立清單時的初始項目 */
  initialCreateItems?: ConsumptionItem[];
  /** 預設清單標題 */
  defaultCreateTitle?: string;
  /** 關閉建立清單 Drawer 的回呼 */
  onCloseCreate?: () => void;
};

export const SharedPlanningList = ({
  statusFilter,
  year,
  month,
  onOpenList,
  onOpenEdit,
  isCreateOpen = false,
  initialCreateItems = [],
  defaultCreateTitle = '',
  onCloseCreate,
}: SharedPlanningListProps) => {
  const { lists, isLoading, deleteList } = useSharedListsContext();
  // 內部狀態仍保留，用於 FAB 點擊
  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);

  // 整合外部控制和內部狀態
  // 如果 isCreateOpen 為 true (外部控制模式)，則忽略內部狀態
  const showDrawer = isCreateOpen || internalDrawerOpen;

  const handleDrawerClose = () => {
    if (isCreateOpen && onCloseCreate) {
      onCloseCreate();
    } else {
      setInternalDrawerOpen(false);
    }
  };

  const statusTextMap: Record<string, string> = {
    'in-progress': '進行中',
    completed: '已完成',
  };

  // 依據 Tab 狀態與年月篩選清單
  const filteredLists = useMemo(
    () =>
      lists.filter((list) => {
        if (list.status !== statusFilter) return false;
        if (!year || !month) return true;
        if (!list.startsAt) return false;

        const date = new Date(list.startsAt);
        return date.getFullYear() === year && date.getMonth() + 1 === month;
      }),
    [lists, month, statusFilter, year],
  );

  // 處理卡片點擊 - 開啟詳細頁 Modal
  const handleCardClick = (list: SharedList) => {
    onOpenList?.(list.id);
  };

  // 處理編輯 - 開啟編輯 Modal
  const handleEdit = (list: SharedList) => {
    onOpenEdit?.(list.id);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-neutral-400">載入中...</div>;
  }

  return (
    <div className="relative pb-24">
      {filteredLists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
          <p>目前沒有符合「{statusTextMap[statusFilter] ?? '該狀態'}」的清單</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLists.map((list) => (
            <SharedListCard
              key={list.id}
              list={list}
              onClick={handleCardClick}
              onEdit={handleEdit}
              onDelete={async (listItem) => {
                if (
                  confirm(`確定要刪除「${listItem.title}」嗎？此動作無法復原。`)
                ) {
                  try {
                    await deleteList(listItem.id);
                    toast.success(TOAST_MESSAGES.SUCCESS.LIST_DELETED);
                  } catch {
                    toast.error(TOAST_MESSAGES.ERROR.DELETE_FAILED);
                  }
                }
              }}
            />
          ))}
        </div>
      )}

      {/* 浮動按鈕 */}
      <FloatingActionButton onClick={() => setInternalDrawerOpen(true)} />

      {/* 建立清單 Drawer */}
      <CreateSharedListDrawer
        isOpen={showDrawer}
        onClose={handleDrawerClose}
        initialItems={initialCreateItems}
        defaultTitle={defaultCreateTitle}
      />
    </div>
  );
};
