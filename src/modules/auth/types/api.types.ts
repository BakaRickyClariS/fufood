import type { User, AuthToken } from './auth.types';

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: User;
  token: AuthToken;
};

export type RegisterRequest = {
  email: string;
  password: string;
  name?: string;
  avatar?: string;
};

export type RegisterResponse = {
  user: User;
  token: AuthToken;
};

export type LINELoginRequest = {
  code: string;
  state?: string;
};

export type LineLoginCallbackResponse = {
  user: User;
  token: AuthToken;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type RefreshTokenResponse = {
  accessToken: string;
  expiresIn: number;
};

export type UpdateProfileRequest = {
  name?: string;
  avatar?: string;
};
