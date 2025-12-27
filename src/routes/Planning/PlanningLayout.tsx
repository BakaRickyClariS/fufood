import { Outlet } from 'react-router-dom';
import { useSharedLists } from '@/modules/planning/hooks/useSharedLists';
import { SharedListsProvider } from '@/modules/planning/contexts/SharedListsContext';

export const PlanningLayout = () => {
  // 在 Layout 層級管理 SharedLists 狀態，避免路由切換時 refetch 導致閃爍
  const sharedListsState = useSharedLists();

  return (
    <SharedListsProvider value={sharedListsState}>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Outlet />
      </div>
    </SharedListsProvider>
  );
};
