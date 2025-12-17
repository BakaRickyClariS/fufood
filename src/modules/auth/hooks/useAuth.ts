import { useGetUserProfileQuery } from '../api/queries';
import { useSignOutMutation } from '../api/mutations';

export const useAuth = () => {
  const query = useGetUserProfileQuery();
  const signOut = useSignOutMutation();
  const user = query.data ?? null;

  return {
    user,
    isAuthenticated: !!user,
    isLoading: query.isLoading,
    refetch: query.refetch,
    error: query.error,
    logout: signOut.mutateAsync,
  };
};
