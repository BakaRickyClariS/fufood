import { useQuery } from '@tanstack/react-query';

export const LINE_API_BASE =
  import.meta.env.VITE_LINE_API_BASE_URL || 'https://api.fufood.jocelynh.me';

export type UUID = string;

export interface User {
  id: UUID;
}

export interface GetUserProfileResult {
  data: User | null;
}

export async function getUserProfile(): Promise<GetUserProfileResult> {
  const response = await fetch(`${LINE_API_BASE}/api/v1/profile`, {
    credentials: 'include',
  });

  if (response.status === 401) {
    return { data: null };
  }

  if (!response.ok) {
    throw new Error(`API 錯誤: ${response.status}`);
  }

  return response.json();
}

export function useGetUserProfileQuery() {
  return useQuery({
    queryFn: getUserProfile,
    queryKey: ['GET_USER_PROFILE'],
  });
}
