/**
 * 會員等級型別
 */
export type MembershipTier = 'free' | 'premium' | 'vip';

export type User = {
  id: string;
  email?: string; // LINE 登入可能無 email
  name?: string;
  avatar: string;
  createdAt: Date;
  // LINE 專屬欄位
  lineId?: string;
  displayName?: string;
  pictureUrl?: string;
  // 會員等級
  membershipTier?: MembershipTier;
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
