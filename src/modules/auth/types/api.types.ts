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
  redirectUri: string;
};
