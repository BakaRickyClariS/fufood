/**
 * API Endpoints Configuration
 */
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v2/auth/login',
    REGISTER: '/api/v2/auth/register',
    LOGOUT: '/api/v2/auth/logout',
    REFRESH: '/api/v2/auth/refresh',
    ME: '/api/v2/auth/me',
    CHECK: '/api/v2/auth/me', // Same as ME for check
    PROFILE: '/api/v2/profile',
    LINE_INIT: '/api/v2/auth/line/init',
    LINE_CALLBACK: '/api/v2/auth/line/callback',
  },
  GROUPS: {
    BASE: '/api/v2/groups',
    BY_ID: (id: string) => `/api/v2/groups/${id}`,
    MEMBERS: (groupId: string) => `/api/v2/groups/${groupId}/members`,
    MEMBER: (groupId: string, memberId: string) =>
      `/api/v2/groups/${groupId}/members/${memberId}`,
    LEAVE: (groupId: string) => `/api/v2/groups/${groupId}/leave`,
    INVITATIONS: '/api/v2/groups/invitations',
    INVITATION: (token: string) => `/api/v2/groups/invitations/${token}`,
    ACCEPT_INVITATION: (token: string) =>
      `/api/v2/groups/invitations/${token}/accept`,
    SEARCH_USERS: '/api/v2/users/search',
  },
  SHOPPING_LISTS: {
    GROUP_LISTS: (groupId: string) =>
      `/api/v2/groups/${groupId}/shopping-lists`,
    BY_ID: (id: string) => `/api/v2/shopping-lists/${id}`,
  },
  // V1 Legacy Endpoints
  RECIPES: {
    BASE: '/api/v1/recipes',
    BY_ID: (id: string) => `/api/v1/recipes/${id}`,
    RECOMMENDED: '/api/v1/recipes/recommended',
    FAVORITE: (id: string) => `/api/v1/recipes/${id}/favorite`,
    AI_GENERATE: '/api/v1/ai/recipe',
  },
  INVENTORY: {
    BASE: '/api/v1/inventory',
    BY_ID: (id: string) => `/api/v1/inventory/${id}`,
    GROUP_INVENTORY: (groupId: string) =>
      `/api/v1/refrigerators/${groupId}/inventory`, // Keeping 'refrigerators' for V1?
  },
  AI: {
    ANALYZE_IMAGE: '/ai/analyze-image',
    ANALYZE_MULTIPLE: '/ai/analyze-image/multiple',
  },
} as const;
