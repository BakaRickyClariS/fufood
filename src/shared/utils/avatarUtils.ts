/**
 * 頭像工具函數
 * 提供統一的頭像取得邏輯，支援本地與遠端頭像
 */

import { AVATAR_MAP, DEFAULT_AVATAR } from '@/shared/constants/avatars';
import type { UserAvatarInfo } from '@/shared/types/avatar.types';

/**
 * 根據頭像 ID 取得本地頭像圖片 URL
 * 適用於 Mock API 使用本地頭像 ID 的情況
 * 
 * @param avatarId - 頭像 ID（字串或數字）
 * @returns 頭像圖片 URL，若找不到則回傳預設頭像
 */
export const getLocalAvatarById = (avatarId: string | number | undefined): string => {
  if (!avatarId) return DEFAULT_AVATAR;
  const id = String(avatarId);
  return AVATAR_MAP[id] || DEFAULT_AVATAR;
};

/**
 * 判斷是否為有效的遠端 URL
 */
const isValidRemoteUrl = (url: string | undefined): url is string => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://');
};

/**
 * 取得使用者頭像 URL
 * 
 * 優先順序：
 * 1. avatarUrl（真實 API 直接提供的完整 URL）
 * 2. pictureUrl（LINE 等第三方登入提供的 URL）
 * 3. avatar（本地頭像 ID，透過 AVATAR_MAP 轉換）
 * 4. 預設頭像
 * 
 * @param userInfo - 使用者頭像資訊
 * @returns 頭像圖片 URL
 * 
 * @example
 * // Mock API - 使用本地頭像 ID
 * getUserAvatarUrl({ avatar: '3' }) // 回傳 Avatar3 圖片
 * 
 * // 真實 API - 使用遠端 URL
 * getUserAvatarUrl({ avatarUrl: 'https://cdn.example.com/avatar.jpg' })
 * 
 * // LINE 登入 - 使用 LINE 頭像
 * getUserAvatarUrl({ pictureUrl: 'https://profile.line.me/...' })
 */
export const getUserAvatarUrl = (userInfo: UserAvatarInfo | null | undefined): string => {
  if (!userInfo) return DEFAULT_AVATAR;
  
  // 優先使用真實 API 提供的完整 URL
  if (isValidRemoteUrl(userInfo.avatarUrl)) {
    return userInfo.avatarUrl;
  }
  
  // 其次使用第三方登入提供的 URL
  if (isValidRemoteUrl(userInfo.pictureUrl)) {
    return userInfo.pictureUrl;
  }
  
  // 最後使用本地頭像 ID 轉換
  if (userInfo.avatar) {
    return getLocalAvatarById(userInfo.avatar);
  }
  
  return DEFAULT_AVATAR;
};

// 重新匯出常數供外部直接使用
export { AVATAR_OPTIONS, DEFAULT_AVATAR } from '@/shared/constants/avatars';
export type { UserAvatarInfo, AvatarOption, AvatarSource } from '@/shared/types/avatar.types';
