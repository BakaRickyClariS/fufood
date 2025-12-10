# Auth Module（使用者認證）

## 目錄
- [概要](#概要)
- [目錄結構](#目錄結構)
- [核心功能](#核心功能)
- [型別](#型別)
- [API 規格](#api-規格)
- [Hooks](#hooks)
- [Services](#services)
- [Redux Store](#redux-store)
- [環境變數](#環境變數)
- [Mock 資料](#mock-資料)

---

## 概要
負責使用者註冊、登入、登出、Token 管理、LINE OAuth，以及輕量驗證 `/auth/check`。提供 Mock 模式以便本地開發。

### 核心功能
1. 帳密登入與註冊
2. LINE Login OAuth
3. Access/Refresh Token 管理與更新
4. 輕量心跳驗證 `/auth/check`
5. 取用目前使用者 `/auth/me`

---

## 目錄結構
```
auth/
├── api/                 # API 層
│   ├── authApi.ts       # API 定義
│   └── index.ts
├── mock/
│   └── authMockData.ts  # Mock 資料
├── hooks/
│   ├── useAuth.ts       # 認證 Hook
│   └── index.ts
├── services/
│   ├── authService.ts   # Token / User 封裝
│   └── index.ts
├── store/
│   └── authSlice.ts     # Redux Slice
├── types/
│   ├── api.types.ts
│   ├── auth.types.ts
│   └── index.ts
└── index.ts
```

---

## 型別

```typescript
export type User = {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  createdAt: string;
};

export type AuthToken = {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number; // 秒
};

export type AuthState = {
  user: User | null;
  token: AuthToken | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};
```

---

## API 規格

### 路由（對應 API_REFERENCE_V2 #1-#9）
- `POST /api/v1/auth/register`：註冊
- `POST /api/v1/auth/login`：登入
- `POST /api/v1/auth/logout`：登出（清除 Cookie/Session）
- `POST /api/v1/auth/refresh`：用 refresh token 換 access token
- `GET /api/v1/auth/me`：取得登入者資訊（401 視為未登入）
- `GET /api/v1/auth/check`：輕量驗證 Token（回 204/200 或 401）
- `GET /api/v1/auth/line/login` / `GET /api/v1/auth/line/callback`：LINE OAuth
- `PUT /api/v1/auth/update-profile`：更新個人資料

### AuthApi 介面
```typescript
export const authApi = {
  login: (data: LoginRequest) => Promise<LoginResponse>;
  register: (data: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  refresh: (refreshToken: string) => Promise<{ accessToken: string; expiresIn: number }>;
  getCurrentUser: () => Promise<User>;
  check: () => Promise<void>; // 204/401
  loginWithLINE: (data: LINELoginRequest) => Promise<LoginResponse>;
  updateProfile: (data: UpdateProfileRequest) => Promise<User>;
};
```

---

## Hooks

### `useAuth.ts`
```typescript
const useAuth = () => {
  return {
    user: User | null,
    isAuthenticated: boolean,
    isLoading: boolean,
    error: string | null,
    login: (credentials: LoginRequest) => Promise<LoginResponse>,
    register: (data: RegisterRequest) => Promise<RegisterResponse>,
    logout: () => Promise<void>,
    refresh: () => Promise<void>,
    check: () => Promise<boolean>, // true 表示 200/204
  };
};
```
**功能**：管理登入/註冊/登出、Token 驗證、狀態與錯誤。

---

## Services

### `authService.ts`
- 封裝 Token/User 的存取（localStorage）
- 處理 login/register/logout/refresh/check/updateProfile
- 將 `check` 作為輕量心跳，失敗時清理本地 Token

---

## Redux Store
- `authSlice.ts` 管理 `user`, `token`, `isAuthenticated`, `isLoading`, `error`
- Actions: `loginStart/loginSuccess/loginFailure`, `logout`, `setUser`

---

## 環境變數
| 變數 | 說明 | 範例 |
| --- | --- | --- |
| `VITE_USE_MOCK_API` | 是否使用 Mock API | `true` / `false` |
| `VITE_API_BASE_URL` | API 基底 | `http://localhost:3000/api/v1` |
| `VITE_LINE_CLIENT_ID` | LINE Login Channel ID | `1234567890` |
| `VITE_LINE_REDIRECT_URI` | LINE Login Callback URL | `http://localhost:5173/login/callback` |

---

## Mock 資料
- `authMockData.ts`：提供測試用使用者與 Token。

--- 

**備註**：`/auth/check` 保留為輕量驗證，不回傳使用者資訊；`/auth/me` 則回傳完整使用者資料。
