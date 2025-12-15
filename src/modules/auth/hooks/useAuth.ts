import { useGetUserProfileQuery } from '../api/queries';

export const useAuth = () => {
  const query = useGetUserProfileQuery();
  const user = query.data?.data;

  return {
    user,
    isAuthenticated: !!user,
    isLoading: query.isLoading,
    refetch: query.refetch,
    error: query.error,
  };
};
