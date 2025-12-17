import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LINE_API_BASE } from './queries';

export function signOut() {
  return fetch(LINE_API_BASE + '/api/v1/session', {
    method: 'DELETE',
    credentials: 'include',
  });
}

export function useSignOutMutation() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: signOut,
    onSuccess() {
      client.invalidateQueries({
        queryKey: ['GET_USER_PROFILE'],
      });
    },
  });
}
