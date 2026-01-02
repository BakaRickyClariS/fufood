import type { ISOTimestamp, UUID } from '@/api/types';

/**
 * 會員等級型別
 */
export type MembershipTier = 'free' | 'premium' | 'vip';

export type CookingFrequency = '1-2' | '3-4' | '5-7' | 'daily';

export type PrepTime = 'under15' | '15-30' | 'over30';

export type SeasoningLevel = 'light' | 'moderate' | 'spicy' | 'rich';

export type DietaryRestriction =
  | 'none'
  | 'vegan'
  | 'vegetarian'
  | 'omnivore'
  | 'seafood-allergy'
  | 'gluten-allergy'
  | 'dairy-egg-allergy'
  | 'nut-allergy';

export type DietaryPreference = {
  cookingFrequency: CookingFrequency;
  prepTime: PrepTime;
  seasoningLevel: SeasoningLevel;
  restrictions: DietaryRestriction[];
};

/**
 * 性別數值列舉（對應後端 API）
 * @see docs/backend/api_profile_guide.md
 */
export const Gender = {
  NotSpecified: 0,  // 不透露
  Female: 1,        // 女孩兒
  Male: 2,          // 男孩紙
  NonBinary: 3,     // 無性別
  Other: 4,         // 其他（可自訂）
} as const;

export type GenderValue = (typeof Gender)[keyof typeof Gender];

export type User = {
  id: UUID;
  email?: string; // LINE 登入可能無 email
  name?: string;
  avatar: string;
  phone?: string;
  gender?: GenderValue; // 0: 不透露, 1: 女, 2: 男, 3: 無性別, 4: 其他
  customGender?: string | null; // 當 gender 為 4 時的自訂說明
  createdAt: Date;
  updatedAt: Date;
  // LINE 專屬欄位
  lineId?: string;
  displayName?: string;
  pictureUrl?: string;
  // 會員等級
  membershipTier?: MembershipTier;
  // 飲食喜好
  dietaryPreference?: DietaryPreference;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterData = {
  email: string;
  password: string;
  name?: string;
};

export type AuthToken = {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
};

export type AuthState = {
  user: User | null;
  token: AuthToken | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

// 假登入設定資料
export type MockLoginData = {
  avatarId: number;
  displayName: string;
};

/**
 * Profile API 回傳格式
 * @see docs/backend/api_profile_guide.md
 */
export type ProfileData = {
  id: UUID;
  lineId: string;
  name: string;
  profilePictureUrl?: string | null;
  email?: string | null;
  preference?: string[] | null;  // 飲食偏好標籤
  avatar?: string;               // 自訂頭像
  gender: GenderValue;           // 性別數值（0-4）
  customGender?: string | null;  // 自訂性別文字（gender=4 時使用）
  subscriptionTier: number;      // 訂閱等級（0: Free）
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
};

export type ProfileResponse = {
  data: ProfileData;
};

/**
 * 更新個人資料請求格式（PUT /api/v1/profile/{userId}）
 * @see docs/backend/api_profile_guide.md
 */
export type UpdateProfilePayload = {
  name: string;                  // 必填，使用者名稱
  profilePictureUrl?: string;    // 選填，頭像 URL
  avatar?: string;               // 選填
  email?: string;                // 選填，電子郵件
  preference?: string[];         // 選填，飲食偏好標籤陣列
  gender?: GenderValue;          // 選填，性別數值
  customGender?: string | null;  // 選填，自訂性別（gender=4 時）
};
