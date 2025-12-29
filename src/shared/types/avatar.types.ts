/**
 * 頭像相關型別定義
 */

/**
 * 頭像選項型別（用於選擇器）
 */
export type AvatarOption = {
  id: number;
  src: string;
};

/**
 * 頭像來源型別
 * - 'local': 本地預設頭像（使用 avatarId）
 * - 'remote': 遠端頭像 URL（API 或第三方登入提供）
 */
export type AvatarSource = 'local' | 'remote';

/**
 * 使用者頭像資訊（通用型別，用於工具函數參數）
 */
export type UserAvatarInfo = {
  /** 遠端頭像 URL（LINE 或其他第三方登入提供） */
  pictureUrl?: string;
  /** 本地頭像 ID（數字或字串） */
  avatar?: string | number;
  /** 頭像完整 URL（真實 API 可能直接提供） */
  avatarUrl?: string;
};
