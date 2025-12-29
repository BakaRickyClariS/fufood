import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSharedLists } from '@/modules/planning/hooks/useSharedLists';
import { SharedListsProvider } from '@/modules/planning/contexts/SharedListsContext';
import { selectAllGroups } from '@/modules/groups/store/groupsSlice';

export const PlanningLayout = () => {
  // 從 Redux 取得群組列表
  const groups = useSelector(selectAllGroups);

  // 暫略：直接選取第一個 Group 作為 Refrigerator ID
  // 理想上應該要有 UI 讓使用者切換不同的冰箱/群組
  const currentRefrigeratorId = groups.length > 0 ? groups[0].id : '';

  // 在 Layout 層級管理 SharedLists 狀態，避免路由切換時 refetch 導致閃爍
  const sharedListsState = useSharedLists(currentRefrigeratorId);

  return (
    <SharedListsProvider value={sharedListsState}>
      <div className="min-h-screen bg-gray-50 pb-20">
        <Outlet />
      </div>
    </SharedListsProvider>
  );
};
