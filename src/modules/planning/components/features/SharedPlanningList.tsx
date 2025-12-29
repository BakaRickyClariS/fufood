import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useSharedListsContext } from '@/modules/planning/contexts/SharedListsContext';
import { SharedListCard } from '../ui/SharedListCard';
import { FloatingActionButton } from '@/shared/components/ui/FloatingActionButton';
import { CreateSharedListDrawer } from './CreateSharedListDrawer';

type SharedPlanningListProps = {
  statusFilter: string; // 當前選擇的 Tab 對應狀態 Id
  year?: number;
  month?: number;
};

export const SharedPlanningList = ({
  statusFilter,
  year,
  month,
}: SharedPlanningListProps) => {
  const { lists, isLoading, deleteList } = useSharedListsContext();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
              onEdit={(listItem) => {
                // TODO: 實作編輯功能，導航到編輯頁面或開啟編輯 Modal
                navigate(`/planning/list/${listItem.id}/edit`);
              }}
              onDelete={async (listItem) => {
                if (
                  confirm(`確定要刪除「${listItem.title}」嗎？此動作無法復原。`)
                ) {
                  try {
                    await deleteList(listItem.id);
                    toast.success('清單已刪除');
                  } catch {
                    toast.error('刪除失敗，請稍後再試');
                  }
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Drawer 取代原本的路由導航 */}
      <FloatingActionButton onClick={() => setIsDrawerOpen(true)} />
      <CreateSharedListDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};
