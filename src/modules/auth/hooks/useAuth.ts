import { useGetUserProfileQuery } from '../api/queries';
import { useSignOutMutation } from '../api/mutations';

export const useAuth = () => {
  const query = useGetUserProfileQuery();
  const signOut = useSignOutMutation();
  const user = query.data ?? null;

  return {
    user,
    isAuthenticated: !!user,
    // isLoading: 首次載入中（無快取資料）
    isLoading: query.isLoading,
    // isFetching: 任何請求進行中（包含背景刷新）
    isFetching: query.isFetching,
    // isInitialLoading: 真正需要顯示全屏 loading 的情況
    // 只有在首次載入且沒有任何資料時才為 true
    isInitialLoading: query.isLoading && !query.data,
    refetch: query.refetch,
    error: query.error,
    logout: signOut.mutateAsync,
  };
};
