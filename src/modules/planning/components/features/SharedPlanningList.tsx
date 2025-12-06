import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSharedListsContext } from '@/modules/planning/contexts/SharedListsContext';
import { SharedListCard } from '../ui/SharedListCard';
import { FloatingActionButton } from '@/shared/components/ui/FloatingActionButton';

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
  const { lists, isLoading } = useSharedListsContext();
  const navigate = useNavigate();

  const statusTextMap: Record<string, string> = {
    'in-progress': '進行中',
    'pending-purchase': '待採買',
    completed: '已完成',
  };

  // 依據 Tab 狀態與年月篩選清單
  const filteredLists = useMemo(
    () =>
      lists.filter((list) => {
        if (list.status !== statusFilter) return false;
        if (!year || !month) return true;
        if (!list.scheduledDate) return false;

        const date = new Date(list.scheduledDate);
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
            <SharedListCard key={list.id} list={list} />
          ))}
        </div>
      )}

      <FloatingActionButton onClick={() => navigate('/planning/list/create')} />
    </div>
  );
};
