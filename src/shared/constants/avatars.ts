/**
 * 頭像資源常數
 * 統一管理所有頭像圖片的匯入
 */

// 匯入所有預設頭像圖片
import Avatar1 from '@/assets/images/auth/Avatar-1.png';
import Avatar2 from '@/assets/images/auth/Avatar-2.png';
import Avatar3 from '@/assets/images/auth/Avatar-3.png';
import Avatar4 from '@/assets/images/auth/Avatar-4.png';
import Avatar5 from '@/assets/images/auth/Avatar-5.png';
import Avatar6 from '@/assets/images/auth/Avatar-6.png';
import Avatar7 from '@/assets/images/auth/Avatar-7.png';
import Avatar8 from '@/assets/images/auth/Avatar-8.png';
import Avatar9 from '@/assets/images/auth/Avatar-9.png';
import DefaultAvatarImg from '@/assets/images/inventory/members-zo.png';

/**
 * 頭像 ID 對應圖片對照表（用於本地頭像 ID 轉換）
 */
export const AVATAR_MAP: Record<string, string> = {
  '1': Avatar1,
  '2': Avatar2,
  '3': Avatar3,
  '4': Avatar4,
  '5': Avatar5,
  '6': Avatar6,
  '7': Avatar7,
  '8': Avatar8,
  '9': Avatar9,
};

/**
 * 頭像選項列表（用於 UI 選擇器）
 */
export const AVATAR_OPTIONS = [
  { id: 1, src: Avatar1 },
  { id: 2, src: Avatar2 },
  { id: 3, src: Avatar3 },
  { id: 4, src: Avatar4 },
  { id: 5, src: Avatar5 },
  { id: 6, src: Avatar6 },
  { id: 7, src: Avatar7 },
  { id: 8, src: Avatar8 },
  { id: 9, src: Avatar9 },
] as const;

/**
 * 預設頭像
 */
export const DEFAULT_AVATAR = DefaultAvatarImg;
