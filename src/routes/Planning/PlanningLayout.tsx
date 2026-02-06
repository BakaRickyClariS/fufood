import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useSharedLists } from '@/modules/planning/hooks/useSharedLists';
import { SharedListsProvider } from '@/modules/planning/contexts/SharedListsContext';
import { selectAllGroups } from '@/modules/groups/store/groupsSlice';
import { selectActiveRefrigeratorId } from '@/store/slices/refrigeratorSlice';

export const PlanningLayout = () => {
  // 從 Redux 取得群組列表
  const groups = useSelector(selectAllGroups);

  // 從 Redux 取得當前選中的冰箱 ID
  const activeRefrigeratorId = useSelector(selectActiveRefrigeratorId);

  // 以 Redux 的 activeId 為主，若無則 fallback 到第一個 group (或空字串)
  const currentRefrigeratorId =
    activeRefrigeratorId || (groups.length > 0 ? groups[0].id : '');

  // 在 Layout 層級管理 SharedLists 狀態，避免路由切換時 refetch 導致閃爍
  const sharedListsState = useSharedLists(currentRefrigeratorId);

  return (
    <SharedListsProvider value={sharedListsState}>
      <div className="min-h-screen bg-neutral-50">
        <Outlet />
      </div>
    </SharedListsProvider>
  );
};
