# Auth 模組

## 概述

Auth 模組負責處理使用者的登入、註冊、登出等認證相關功能。採用分層架構設計，包含 API 層、Service 層、Hooks 層，並支援 Mock 資料與真實 API 的無縫切換。

## 目錄結構

```
src/modules/auth/
├── api/                    # API 層
│   ├── mock/              # Mock 資料
│   │   └── authMockData.ts
│   ├── authApi.ts         # API 實作
│   └── index.ts
├── hooks/                  # Custom Hooks
│   ├── useAuth.ts
│   └── index.ts
├── services/              # 業務邏輯層
│   ├── authService.ts
│   └── index.ts
├── types/                 # TypeScript 型別
│   ├── auth.types.ts
│   ├── api.types.ts
│   └── index.ts
└── index.ts               # 統一匯出
```

---

## API 端點

### 環境變數控制

所有 API 呼叫都透過環境變數 `VITE_USE_MOCK_API` 控制：
- `true` (預設)：使用 Mock 資料
- `false`：使用真實 API

### 1. 登入 (Login)

**端點**：`POST /api/auth/login`

**請求格式**：
```typescript
{
  email: string;      // 使用者信箱
  password: string;   // 使用者密碼
}
```

**回應格式**：
```typescript
{
  user: {
    id: string;
    email: string;
    name?: string;
    avatar: string;
    createdAt: Date;
  };
  token: {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;  // 秒數
  };
}
```

**狀態碼**：
- `200 OK`：登入成功
- `400 Bad Request`：請求格式錯誤
- `401 Unauthorized`：帳號或密碼錯誤
- `500 Internal Server Error`：伺服器錯誤

**Mock 行為**：
- Email 為 `test@example.com` 且 Password 為 `password`：成功
- Email 為 `fail@test.com`：回傳錯誤
- 其他任意組合：成功（使用提供的 email）

---

### 2. 註冊 (Register)

**端點**：`POST /api/auth/register`

**請求格式**：
```typescript
{
  email: string;
  password: string;
  name?: string;
  avatar?: string;    // 頭像顏色類別，如 'bg-red-200'
}
```

**回應格式**：
```typescript
{
  user: {
    id: string;
    email: string;
    name?: string;
    avatar: string;
    createdAt: Date;
  };
  token: {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
  };
}
```

**狀態碼**：
- `201 Created`：註冊成功
- `400 Bad Request`：請求格式錯誤
- `409 Conflict`：Email 已被使用
- `500 Internal Server Error`：伺服器錯誤

**Mock 行為**：
- 接受任何 email/password 組合
- 自動生成新的 User ID
- 延遲 1 秒模擬 API 呼叫

---

### 3. LINE 登入

**端點**：`POST /api/auth/line`

**請求格式**：
```typescript
{
  code: string;          // LINE OAuth code
  redirectUri: string;   // 回導網址
}
```

**回應格式**：
```typescript
{
  user: {
    id: string;
    email: string;
    name?: string;
    avatar: string;
    createdAt: Date;
  };
  token: {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
  };
}
```

**狀態碼**：
- `200 OK`：LINE 登入成功
- `400 Bad Request`：請求格式錯誤
- `401 Unauthorized`：LINE 驗證失敗
- `500 Internal Server Error`：伺服器錯誤

**Mock 行為**：
- 接受任何 code/redirectUri
- 回傳預設測試帳號

---

### 4. 登出 (Logout)

**端點**：`POST /api/auth/logout`

**請求格式**：無 (使用 Header 中的 Token)

**回應格式**：無內容

**狀態碼**：
- `204 No Content`：登出成功
- `401 Unauthorized`：未登入或 Token 無效
- `500 Internal Server Error`：伺服器錯誤

**Mock 行為**：
- 延遲 300ms
- 永遠成功

---

### 5. 取得當前使用者資訊

**端點**：`GET /api/auth/me`

**請求格式**：無 (使用 Header 中的 Token)

**回應格式**：
```typescript
{
  id: string;
  email: string;
  name?: string;
  avatar: string;
  createdAt: Date;
}
```

**狀態碼**：
- `200 OK`：取得成功
- `401 Unauthorized`：未登入或 Token 無效
- `500 Internal Server Error`：伺服器錯誤

**Mock 行為**：
- 回傳預設測試帳號資訊

---

## Service 層功能

`authService` 提供以下方法：

### Token 管理
- `saveToken(token: AuthToken)`：儲存 Token 到 localStorage
- `getToken()`：取得儲存的 Token
- `clearToken()`：清除 Token
- `isTokenExpired()`：檢查 Token 是否過期

### User 管理
- `saveUser(user: User)`：儲存使用者資料到 localStorage
- `getUser()`：取得儲存的使用者資料
- `clearUser()`：清除使用者資料

### 完整流程
- `login(credentials)`：執行完整登入流程 (API + 儲存)
- `register(data)`：執行完整註冊流程 (API + 儲存)
- `logout()`：執行完整登出流程 (API + 清除)

---

## Hooks 使用

### useAuth

```typescript
const {
  user,              // 當前使用者資料
  isAuthenticated,   // 是否已登入
  isLoading,         // 載入狀態
  error,             // 錯誤訊息
  login,             // 登入方法
  register,          // 註冊方法
  logout,            // 登出方法
} = useAuth();
```

**範例**：
```typescript
// 登入
try {
  await login({ email: 'user@example.com', password: 'password' });
  navigate('/');
} catch (error) {
  console.error('Login failed:', error);
}

// 登出
await logout();
navigate('/auth/login');
```

---

## 資料格式定義

### User
```typescript
type User = {
  id: string;
  email: string;
  name?: string;
  avatar: string;       // Tailwind 顏色類別
  createdAt: Date;
};
```

### AuthToken
```typescript
type AuthToken = {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;    // 有效期限（秒）
};
```

### LoginCredentials
```typescript
type LoginCredentials = {
  email: string;
  password: string;
};
```

### RegisterData
```typescript
type RegisterData = {
  email: string;
  password: string;
  name?: string;
};
```

---

## 錯誤處理

所有 API 錯誤都會拋出標準的 `Error` 物件：

```typescript
try {
  await authApi.login(credentials);
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message); // "帳號或密碼錯誤"
  }
}
```

---

## 切換真實 API

1. 修改 `.env`：
   ```env
   VITE_USE_MOCK_API=false
   VITE_API_BASE_URL=https://your-api.com/api
   ```

2. 確保後端 API 符合上述端點與資料格式

3. 重新啟動開發伺服器：
   ```bash
   npm run dev
   ```

---

## 注意事項

1. **Token 儲存**：目前使用 `localStorage`，生產環境建議使用 `httpOnly cookie`
2. **密碼傳輸**：確保生產環境使用 HTTPS
3. **Token 過期**：前端會自動檢查 Token 過期時間，過期後自動清除
4. **CORS**：後端需要設定允許前端網域的 CORS

---

## 測試帳號 (Mock)

```
Email: test@example.com
Password: password
```
