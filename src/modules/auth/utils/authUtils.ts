/**
 * Auth 工具函式
 * 
 * 為保持向後相容，此模組保留原有的函式簽名，
 * 但內部使用統一的 identity 模組實作。
 * 
 * @deprecated 建議直接使用 '@/shared/utils/identity' 模組
 */

import { identity } from '@/shared/utils/identity';

/**
 * 從 localStorage 取得認證 token
 * @returns token 字串，若不存在則回傳 null
 * @deprecated 請使用 identity.getAuthToken()
 */
export const getAuthToken = (): string | null => {
  return identity.getAuthToken();
};

/**
 * 儲存認證 token 到 localStorage
 * @param token - 要儲存的 token 字串
 * @deprecated 請使用 identity.setAuthToken()
 */
export const setAuthToken = (token: string): void => {
  identity.setAuthToken(token);
};

/**
 * 從 localStorage 移除認證 token
 * @deprecated 請使用 identity.clearAuthToken()
 */
export const removeAuthToken = (): void => {
  identity.clearAuthToken();
};

