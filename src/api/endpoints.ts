/**
 * API Endpoints Configuration
 *
 * 對應後端文件 docs/sdd/backend/api-routes.md
 * v1 認證：Cookie (session_token)
 * v2 認證：JWT Bearer Token
 *
 * 注意：已取消 X-User-Id 認證方式，統一使用 JWT 或 Cookie。
 */
export const ENDPOINTS = {
  // ============================================================
  // 🔐 Auth（v2）
  // ============================================================
  AUTH: {
    LOGIN: '/api/v2/auth/login',
    REGISTER: '/api/v2/auth/register',
    LOGOUT: '/api/v2/auth/logout',
    REFRESH: '/api/v2/auth/refresh',
    ME: '/api/v2/auth/me',
    LINE_INIT: '/api/v2/auth/line/init',
    LINE_CALLBACK: '/api/v2/auth/line/callback',
  },

  // ============================================================
  // 👤 Profile（v2）
  // ============================================================
  PROFILE: {
    BASE: '/api/v2/profile',
  },

  // ============================================================
  // 🧊 Inventory（v2）
  // ============================================================
  INVENTORY: {
    LIST: (groupId: string) => `/api/v2/groups/${groupId}/inventory`,
    BY_ID: (groupId: string, id: string) =>
      `/api/v2/groups/${groupId}/inventory/${id}`,
    CONSUME: (groupId: string, id: string) =>
      `/api/v2/groups/${groupId}/inventory/${id}/consume`,
    CATEGORIES: (groupId: string) =>
      `/api/v2/groups/${groupId}/inventory/categories`,
    SUMMARY: (groupId: string) => `/api/v2/groups/${groupId}/inventory/summary`,
    SETTINGS: (groupId: string) =>
      `/api/v2/groups/${groupId}/inventory/settings`,
  },

  // ============================================================
  // 🔔 Notifications（v2）
  // ============================================================
  NOTIFICATIONS: {
    LIST: '/api/v2/notifications',
    TOKEN: '/api/v2/notifications/token',
    SETTINGS: '/api/v2/notifications/settings',
    BATCH_READ: '/api/v2/notifications/batch-read',
    BATCH_DELETE: '/api/v2/notifications/batch-delete',
    SEND: '/api/v2/notifications/send', // 內部/管理員用
  },

  // ============================================================
  // 🍽️ Recipes（v2）
  // ============================================================
  RECIPES: {
    BASE: '/api/v2/recipes',
    BY_ID: (id: string) => `/api/v2/recipes/${id}`,
  },

  // ============================================================
  // 🤖 AI（v1/v2）
  // ============================================================
  AI: {
    RECIPE: '/api/v1/ai/recipe',
    RECIPE_STREAM: '/api/v1/ai/recipe/stream',
    RECIPE_SUGGESTIONS: '/api/v1/ai/recipe/suggestions',
    ANALYZE_IMAGE: '/api/v1/ai/analyze-image',
    ANALYZE_MULTIPLE: '/api/v1/ai/analyze-image/multiple',
    MEDIA_UPLOAD: '/api/v2/media/upload',
  },

  // ============================================================
  // 👥 Groups（v2）
  // ============================================================
  GROUPS: {
    BASE: '/api/v2/groups',
    BY_ID: (id: string) => `/api/v2/groups/${id}`,
    INVITATIONS: (id: string) => `/api/v2/groups/${id}/invitations`,
    JOIN: '/api/v2/groups/join',
    MEMBER: (id: string, memberId: string) =>
      `/api/v2/groups/${id}/members/${memberId}`,
    MEMBERS: (id: string) => `/api/v2/groups/${id}/members`,
    LEAVE: (id: string) => `/api/v2/groups/${id}/leave`,
    INVITATION_INFO: (token: string) => `/api/v2/invitations/${token}`,
  },

  // ============================================================
  // 🛒 Shopping Lists（v2）
  // ============================================================
  SHOPPING_LISTS: {
    GROUP_LISTS: (groupId: string) =>
      `/api/v2/groups/${groupId}/shopping-lists`,
    BY_ID: (id: string) => `/api/v2/shopping-lists/${id}`,
    ITEMS: (id: string) => `/api/v2/shopping-lists/${id}/items`,
    ITEM_BY_ID: (itemId: string) => `/api/v2/shopping-list-items/${itemId}`,
  },

  // ============================================================
  // 💳 Subscriptions（v2）
  // ============================================================
  SUBSCRIPTIONS: {
    BASE: '/api/v2/subscriptions',
  },
} as const;
