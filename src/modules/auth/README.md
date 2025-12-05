# Auth Module (使用者認證模組)

## 📋 目錄
- [概述](#概述)
- [目錄結構](#目錄結構)
- [核心功能](#核心功能)
- [型別定義 (Types)](#型別定義-types)
- [API 規格](#api-規格)
- [Hooks 詳解](#hooks-詳解)
- [Services 服務層](#services-服務層)
- [Redux Store](#redux-store)
- [環境變數設定](#環境變數設定)

---

## 概述

本模組負責處理使用者的**身份驗證**、**註冊**與**登入管理**。支援傳統帳號密碼登入及 LINE 第三方登入，並提供完整的 Token 管理與使用者狀態維護。

### 核心功能
1. **帳號密碼登入**: 使用 Email 與密碼進行身份驗證
2. **使用者註冊**: 新使用者註冊功能
3. **LINE 登入**: 整合 LINE Login OAuth 流程
4. **Token 管理**: JWT Token 存儲、驗證與更新
5. **使用者狀態**: 維護登入狀態與使用者資訊
6. **Mock 模式**: 支援離線開發與測試

---

## 目錄結構

\`\`\`
auth/
├── api/                  # API 層
│   ├── authApi.ts       # API 實作
│   ├── index.ts         # API 匯出
│   └── mock/
│       └── authMockData.ts  # Mock 資料
├── hooks/               # 自定義 Hooks
│   ├── index.ts
│   └── useAuth.ts       # 認證 Hook
├── services/            # 服務層
│   ├── authService.ts   # Token 管理服務
│   └── index.ts
├── store/               # Redux 狀態管理
│   └── authSlice.ts     # Auth Slice
├── types/               # TypeScript 型別
│   ├── api.types.ts     # API 型別
│   ├── auth.types.ts    # 認證型別
│   └── index.ts
└── index.ts             # 模組匯出
\`\`\`

---

## 型別定義 (Types)

### User (使用者資料)
```typescript
export type User = {
  id: string;
  email: string;
  name?: string;
  avatar: string;       // 頭像 URL 或顏色
  createdAt: Date;
};
```

### AuthToken (認證 Token)
```typescript
export type AuthToken = {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;    // Token 有效期 (秒)
};
```

### LoginCredentials (登入憑證)
```typescript
export type LoginCredentials = {
  email: string;
  password: string;
};
```

### RegisterData (註冊資料)
```typescript
export type RegisterData = {
  email: string;
  password: string;
  name?: string;
};
```

### AuthState (認證狀態)
```typescript
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

### AuthApi 介面

```typescript
export const authApi = {
  login: (data: LoginRequest) => Promise<LoginResponse>;
  register: (data: RegisterRequest) => Promise<RegisterResponse>;
  loginWithLINE: (data: LINELoginRequest) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<User>;
};
```

---

### 1. **login** - 使用者登入

#### 端點
\`\`\`
POST /api/auth/login
\`\`\`

#### 請求格式
```typescript
type LoginRequest = {
  email: string;
  password: string;
};
```

#### 請求範例
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 回應格式
```typescript
type LoginResponse = {
  user: User;
  token: AuthToken;
};
```

#### 回應範例
```json
{
  "user": {
    "id": "user-001",
    "email": "user@example.com",
    "name": "張三",
    "avatar": "bg-blue-200",
    "createdAt": "2025-12-01T10:00:00.000Z"
  },
  "token": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

#### Mock 行為
- `test@example.com` + `password` → 成功登入
- `fail@test.com` + 任何密碼 → 拋出錯誤
- 其他 email → 成功登入 (使用輸入的 email)

---

### 2. **register** - 使用者註冊

#### 端點
\`\`\`
POST /api/auth/register
\`\`\`

#### 請求格式
```typescript
type RegisterRequest = {
  email: string;
  password: string;
  name?: string;
  avatar?: string;
};
```

#### 請求範例
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "李四",
  "avatar": "bg-green-200"
}
```

#### 回應格式
```typescript
type RegisterResponse = {
  user: User;
  token: AuthToken;
};
```

#### 回應範例
```json
{
  "user": {
    "id": "user-002",
    "email": "newuser@example.com",
    "name": "李四",
    "avatar": "bg-green-200",
    "createdAt": "2025-12-01T11:00:00.000Z"
  },
  "token": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

---

### 3. **loginWithLINE** - LINE 登入

#### 端點
\`\`\`
POST /api/auth/line
\`\`\`

#### 請求格式
```typescript
type LINELoginRequest = {
  code: string;          // LINE OAuth 授權碼
  redirectUri: string;   // 回調 URI
};
```

#### 請求範例
```json
{
  "code": "AUTHORIZATION_CODE",
  "redirectUri": "https://example.com/callback"
}
```

#### 回應格式
```typescript
type LoginResponse = {
  user: User;
  token: AuthToken;
};
```

---

### 4. **logout** - 登出

#### 端點
\`\`\`
POST /api/auth/logout
\`\`\`

#### 請求格式
無請求 body

#### 回應格式
```typescript
void
```

---

### 5. **getCurrentUser** - 取得當前使用者

#### 端點
\`\`\`
GET /api/auth/me
\`\`\`

#### 請求格式
無請求 body，需要在 Header 攜帶 Token

#### 回應格式
```typescript
User
```

#### 回應範例
```json
{
  "id": "user-001",
  "email": "user@example.com",
  "name": "張三",
  "avatar": "bg-blue-200",
  "createdAt": "2025-12-01T10:00:00.000Z"
}
```

---

## Hooks 詳解

### `useAuth.ts`

```typescript
const useAuth = () => {
  return {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    login: (credentials: LoginCredentials) => Promise<LoginResponse>;
    register: (data: RegisterData) => Promise<RegisterResponse>;
    logout: () => Promise<void>;
  };
};
```

**功能**:
- 管理使用者登入狀態
- 自動檢查 Token 有效性
- 提供登入、註冊、登出方法
- 狀態管理: `user`, `isAuthenticated`, `isLoading`, `error`

**使用範例**:
```typescript
const { user, isAuthenticated, isLoading, login, logout } = useAuth();

// 登入
await login({ email: 'user@example.com', password: 'password' });

// 登出
await logout();

// 檢查登入狀態
if (isAuthenticated) {
  console.log('User is logged in:', user);
}
```

**初始化流程**:
1. 從 localStorage 讀取 Token
2. 檢查 Token 是否過期
3. 若有效，設定使用者狀態
4. 若無效，清除 Token 與使用者資料

---

## Services 服務層

### `authService.ts`

提供 Token 管理與存儲功能。

**主要方法**:

#### `login(credentials: LoginCredentials)`
- 呼叫 `authApi.login`
- 儲存 Token 與使用者資訊至 localStorage
- 回傳登入回應

#### `register(data: RegisterData)`
- 呼叫 `authApi.register`
- 儲存 Token 與使用者資訊
- 回傳註冊回應

#### `logout()`
- 呼叫 `authApi.logout`
- 清除 localStorage 中的 Token 與使用者資訊

#### `getToken(): string | null`
- 從 localStorage 讀取 Token

#### `getUser(): User | null`
- 從 localStorage 讀取使用者資訊

#### `isTokenExpired(): boolean`
- 檢查 Token 是否過期

#### `clearToken()`
- 清除 localStorage 中的 Token

#### `clearUser()`
- 清除 localStorage 中的使用者資訊

**LocalStorage Keys**:
- `auth_token`: 儲存 AccessToken
- `auth_user`: 儲存使用者資訊 (JSON)
- `token_expiry`: 儲存 Token 過期時間 (timestamp)

---

## Redux Store

### `authSlice.ts`

**State**:
```typescript
type AuthSliceState = {
  user: User | null;
  token: AuthToken | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};
```

**Actions**:
- `loginStart()`: 開始登入
- `loginSuccess(payload: { user, token })`: 登入成功
- `loginFailure(error: string)`: 登入失敗
- `logout()`: 登出
- `setUser(user: User)`: 更新使用者資訊

**使用範例**:
```typescript
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, logout } from '@/modules/auth/store/authSlice';

const dispatch = useDispatch();
const { user, isAuthenticated } = useSelector((state) => state.auth);

// 登入成功後更新 Redux
dispatch(loginSuccess({ user, token }));

// 登出
dispatch(logout());
```

---

## 環境變數設定

### 必要環境變數

```env
# Mock 模式 (開發用)
VITE_USE_MOCK_API=true

# LINE Login 設定 (若使用 LINE 登入)
VITE_LINE_CLIENT_ID=your_line_client_id
VITE_LINE_REDIRECT_URI=https://yourapp.com/callback
```

### 環境變數說明

| 變數名稱 | 說明 | 範例 |
|---------|------|------|
| `VITE_USE_MOCK_API` | 是否使用 Mock API | `true` / `false` |
| `VITE_LINE_CLIENT_ID` | LINE Login Channel ID | `1234567890` |
| `VITE_LINE_REDIRECT_URI` | LINE Login 回調 URI | `https://yourapp.com/callback` |

---

## Mock 資料

### MOCK_USERS
```typescript
export const MOCK_USERS: User[] = [
  {
    id: 'user-001',
    email: 'test@example.com',
    name: 'Test User',
    avatar: 'bg-blue-200',
    createdAt: new Date(),
  },
];
```

### MOCK_TOKEN
```typescript
export const MOCK_TOKEN: AuthToken = {
  accessToken: 'mock-access-token-12345',
  refreshToken: 'mock-refresh-token-67890',
  expiresIn: 3600, // 1 hour
};
```

---

## 測試建議

### 登入測試案例
| 測試案例 | Email | Password | 預期結果 |
|---------|-------|----------|---------|
| 成功登入 | `test@example.com` | `password` | 登入成功 |
| 失敗登入 | `fail@test.com` | 任何密碼 | 拋出錯誤 |
| 其他帳號 | 任何有效 email | 任何密碼 | 登入成功 (Mock) |

### Token 管理測試
- Token 儲存至 localStorage
- Token 過期自動清除
- 刷新頁面後恢復登入狀態

---

## 未來優化方向

- [ ] 實作 Refresh Token 自動更新機制
- [ ] 新增忘記密碼功能
- [ ] 新增 Email 驗證流程
- [ ] 支援更多第三方登入 (Google, Facebook)
- [ ] 新增兩步驟驗證 (2FA)
- [ ] 實作裝置管理功能
- [ ] 新增登入歷史記錄
