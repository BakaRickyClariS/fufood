import { useAuth } from '@/modules/auth/hooks/useAuth';

export const useAuthGuard = () => {
  const { user, isAuthenticated } = useAuth();
  return { isAuthenticated, user };
};
