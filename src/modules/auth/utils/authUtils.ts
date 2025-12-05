import { AUTH_TOKEN_KEY } from '../constants';

/**
 * 從 localStorage 取得認證 token
 * @returns token 字串，若不存在則回傳 null
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * 儲存認證 token 到 localStorage
 * @param token - 要儲存的 token 字串
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
};

/**
 * 從 localStorage 移除認證 token
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};
