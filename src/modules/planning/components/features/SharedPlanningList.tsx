import { useNavigate } from 'react-router-dom';
import { useSharedLists } from '@/modules/planning/hooks/useSharedLists';
import { SharedListCard } from '../ui/SharedListCard';
import { FloatingActionButton } from '@/shared/components/ui/FloatingActionButton';

type SharedPlanningListProps = {
  statusFilter: string; // 來自 Tab 的狀態 Id
  year?: number;
  month?: number;
};

export const SharedPlanningList = ({
  statusFilter,
  year,
  month,
}: SharedPlanningListProps) => {
  const { lists, isLoading } = useSharedLists(year, month);
  const navigate = useNavigate();

  // 根據 Tab 篩選清單
  const filteredLists = lists.filter((list) => list.status === statusFilter);

  if (isLoading) {
    return <div className="p-8 text-center text-neutral-400">載入中...</div>;
  }

  return (
    <div className="relative pb-24">
      {filteredLists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
          <p>
            目前沒有
            {statusFilter === 'in-progress'
              ? '進行中'
              : statusFilter === 'pending-purchase'
                ? '待採買'
                : '已完成'}
            的清單
          </p>
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
