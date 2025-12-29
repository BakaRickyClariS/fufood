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
export type ISOTimestamp = string;
export type UUID = string;

export type User = {
  id: UUID;
  email?: string; // LINE 登入可能無 email
  name?: string;
  avatar: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
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

// Profile API 回傳格式
export type ProfileData = {
  id: UUID;
  lineId: string;
  name: string;
  profilePictureUrl: string;
  // 後端可能也需要回傳這些欄位，假設已支援
  phone?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  dietaryPreference?: DietaryPreference;
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
};

export type ProfileResponse = {
  data: ProfileData;
};
