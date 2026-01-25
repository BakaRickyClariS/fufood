import type { User, AuthToken } from '../../types';

export const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'test@example.com',
    name: 'Jocelyn',
    avatar: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const MOCK_TOKEN: AuthToken = {
  accessToken: `mock-jwt-token-${Date.now()}`,
  refreshToken: `mock-refresh-token-${Date.now()}`,
  expiresIn: 3600,
};
