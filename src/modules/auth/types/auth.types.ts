export type User = {
  id: string;
  email: string;
  name?: string;
  avatar: string;
  createdAt: Date;
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
