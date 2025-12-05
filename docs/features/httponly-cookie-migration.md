# HttpOnly Cookie 遷移規劃

## 概述

本文件規劃如何將目前基於 localStorage + Bearer Token 的認證架構，遷移至更安全的 HttpOnly Cookie 方案。

## 當前架構 (Phase 1)

### 認證流程

```
登入 → 後端回傳 JWT → 前端儲存到 localStorage → API 請求帶 Authorization header
```

### 技術細節

- **Token 儲存**：`localStorage` (`auth_token`, `refreshToken`, `tokenExpiry`)
- **API 認證**：`Authorization: Bearer {token}`
- **管理層**：`authUtils` + `authService`

### 優點
- ✅ 實作簡單
- ✅ 前端可完全控制 token
- ✅ 跨域請求容易處理

### 缺點
- ⚠️ 容易受 XSS 攻擊竊取 token
- ⚠️ 需手動管理 token 生命週期
- ⚠️ Refresh token 也暴露在前端

---

## 目標架構 (Phase 3)

### 認證流程

```
登入 → 後端設定 HttpOnly Cookie → 瀏覽器自動在每次請求帶上 Cookie
```

### 技術細節

- **Token 儲存**：HttpOnly Cookie (後端設定，前端無法存取)
- **API 認證**：自動帶 Cookie
- **管理層**：後端負責 session 管理

### 優點
- ✅ 防止 XSS 攻擊竊取 token
- ✅ 瀏覽器自動管理 Cookie
- ✅ 後端完全控制 token 生命週期
- ✅ Refresh token 更安全

### 缺點
- ⚠️ 需要處理 CORS 和 credentials
- ⚠️ 需要後端配合實作
- ⚠️ 跨域場景較複雜

---

## 遷移步驟

### Phase 1: 當前狀態（已完成）✅

**目標**：統一前端 token 管理

**變更**：
- [x] 建立 `authUtils` 封裝 token 操作
- [x] 重構 `authService` 使用 `authUtils`
- [x] `apiClient` 使用 `getAuthToken()` 讀取

**檔案**：
- [authUtils.ts](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/auth/utils/authUtils.ts)
- [authService.ts](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/auth/services/authService.ts)
- [apiClient.ts](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/lib/apiClient.ts)

---

### Phase 2: 混合模式（過渡期）

**目標**：支援兩種認證方式，平滑遷移

**實作策略**：
1. 後端同時支援 Bearer Token 和 Cookie
2. 前端優先使用 Cookie，回退到 localStorage
3. 逐步測試並遷移使用者

#### 2.1 後端調整

```javascript
// 後端同時設定 Cookie 和回傳 Token
app.post('/auth/login', async (req, res) => {
  const { user, token } = await loginUser(req.body);
  
  // 設定 HttpOnly Cookie
  res.cookie('auth_token', token.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  
  // 同時回傳 token（向下相容）
  res.json({ user, token });
});
```

```javascript
// 中介層同時檢查兩種認證方式
const authMiddleware = (req, res, next) => {
  // 優先檢查 Cookie
  let token = req.cookies.auth_token;
  
  // 回退到 Authorization header
  if (!token) {
    const authHeader = req.headers.authorization;
    token = authHeader?.replace('Bearer ', '');
  }
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // 驗證 token...
  next();
};
```

#### 2.2 前端調整

**apiClient.ts**：

```typescript
const config: RequestInit = {
  ...customConfig,
  credentials: 'include', // ✨ 新增：允許帶 Cookie
  headers: {
    ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    // 繼續帶 Authorization header（向下相容）
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  },
};
```

**authService.ts**：

```typescript
export const authService = {
  // 保持不變，繼續儲存 token（向下相容）
  saveToken: (token: AuthToken): void => {
    setAuthToken(token.accessToken);
    if (token.refreshToken) {
      localStorage.setItem('refreshToken', token.refreshToken);
    }
    localStorage.setItem('tokenExpiry', String(Date.now() + token.expiresIn * 1000));
  },
  
  // 其他方法保持不變
};
```

#### 2.3 測試重點

- [ ] 登入後確認 Cookie 已設定
- [ ] API 請求同時檢查 Cookie 和 Header
- [ ] 登出確認 Cookie 已清除
- [ ] 舊版前端（只用 Bearer Token）仍可正常運作

---

### Phase 3: 完全遷移至 HttpOnly Cookie

**目標**：移除 localStorage，完全依賴 Cookie

**前提條件**：
- ✅ 後端已完全支援 Cookie 認證
- ✅ 所有使用者已更新到新版前端
- ✅ 混合模式測試通過

#### 3.1 前端變更

**authService.ts**：

```typescript
import { authApi } from '../api';
import type { LoginCredentials, RegisterData, User } from '../types';

export const authService = {
  // ❌ 移除 token 相關方法
  // saveToken, getToken, clearToken, getRefreshToken, isTokenExpired
  
  // ✅ 只保留 user 管理
  saveUser: (user: User): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  clearUser: (): void => {
    localStorage.removeItem('user');
  },

  // 登入：只儲存 user
  login: async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    authService.saveUser(response.user);
    return response;
  },

  // 註冊：只儲存 user
  register: async (data: RegisterData) => {
    const response = await authApi.register(data);
    authService.saveUser(response.user);
    return response;
  },

  // 登出：呼叫後端清除 Cookie
  logout: async () => {
    await authApi.logout(); // 後端會清除 Cookie
    authService.clearUser();
  },
};
```

**apiClient.ts**：

```typescript
import { apiClient } from '@/lib/apiClient';

class ApiClient {
  // ...
  
  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers, body, ...customConfig } = options;

    const url = new URL(`${this.baseUrl}${endpoint}`, window.location.origin);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    // ❌ 移除 token 讀取
    // const token = getAuthToken();

    const config: RequestInit = {
      ...customConfig,
      credentials: 'include', // ✨ 自動帶 Cookie
      headers: {
        ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        // ❌ 移除手動加 Authorization header
        ...(headers && !(body instanceof FormData) ? headers : 
            headers && body instanceof FormData ? 
              Object.fromEntries(
                Object.entries(headers).filter(([key]) => key.toLowerCase() !== 'content-type')
              ) : {}),
      },
    };

    // ... 其余不變
  }
}
```

**API 型別調整**：

```typescript
// auth.types.ts

// ❌ 移除 AuthToken type
// export type AuthToken = {
//   accessToken: string;
//   refreshToken?: string;
//   expiresIn: number;
// };

// LoginResponse 不再回傳 token
export type LoginResponse = {
  user: User;
  // ❌ token: AuthToken; // 移除
};

export type RegisterResponse = {
  user: User;
  // ❌ token: AuthToken; // 移除
};
```

#### 3.2 後端變更

**登入 API**：

```javascript
app.post('/auth/login', async (req, res) => {
  const { user, token } = await loginUser(req.body);
  
  // 設定 HttpOnly Cookie
  res.cookie('auth_token', token.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  
  // Refresh Token 也用 Cookie
  res.cookie('refresh_token', token.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: '/auth/refresh' // 只在 refresh 端點可用
  });
  
  // ❌ 不再回傳 token
  res.json({ user });
});
```

**登出 API**：

```javascript
app.post('/auth/logout', async (req, res) => {
  // 清除 Cookies
  res.clearCookie('auth_token');
  res.clearCookie('refresh_token');
  
  res.json({ success: true });
});
```

**認證中介層（只檢查 Cookie）**：

```javascript
const authMiddleware = (req, res, next) => {
  const token = req.cookies.auth_token;
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // 驗證 token...
  next();
};
```

**Token Refresh**：

```javascript
app.post('/auth/refresh', async (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token' });
  }
  
  // 驗證並產生新 token
  const newToken = await refreshAccessToken(refreshToken);
  
  // 更新 Cookie
  res.cookie('auth_token', newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  
  res.json({ success: true });
});
```

#### 3.3 需要移除的檔案

- ❌ `src/modules/auth/utils/authUtils.ts` (token 管理不再需要)
- ❌ `src/modules/auth/constants.ts` (AUTH_TOKEN_KEY 不再需要)

#### 3.4 需要修改的檔案

- ✅ `src/modules/auth/services/authService.ts`
- ✅ `src/lib/apiClient.ts`
- ✅ `src/modules/auth/types/auth.types.ts`
- ✅ `src/modules/auth/api/authApi.ts` (調整回傳型別)

---

## LINE 登入整合

### 當前流程 (localStorage)

```
1. 點擊 LINE 登入
2. 導向 LINE 授權頁
3. LINE 重導回 /callback?code=xxx
4. 前端呼叫 /auth/line/callback，後端回傳 { user, token }
5. 前端儲存 token 到 localStorage
```

### 目標流程 (HttpOnly Cookie)

```
1. 點擊 LINE 登入
2. 導向 LINE 授權頁
3. LINE 重導回後端 /auth/line/callback?code=xxx
4. 後端處理 LINE 登入，設定 HttpOnly Cookie
5. 後端重導回前端 /login/success
6. 前端只需呼叫 /auth/me 取得使用者資料
```

### 實作調整

**後端**：

```javascript
app.get('/auth/line/callback', async (req, res) => {
  const { code } = req.query;
  
  // 1. 用 code 換 LINE token
  const lineToken = await exchangeLineCode(code);
  
  // 2. 取得 LINE 使用者資料
  const lineProfile = await getLineProfile(lineToken);
  
  // 3. 建立或找到使用者
  const user = await findOrCreateUser(lineProfile);
  
  // 4. 建立 JWT
  const jwt = signJWT({ userId: user.id });
  
  // 5. ✨ 設定 HttpOnly Cookie
  res.cookie('auth_token', jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', // LINE 重導需要 'lax'
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  
  // 6. 重導回前端
  res.redirect(`${process.env.FRONTEND_URL}/login/success`);
});
```

**前端**：

```typescript
// LoginSuccessPage.tsx
useEffect(() => {
  const loadUser = async () => {
    try {
      // Cookie 已自動設定，直接取得使用者資料
      const user = await authApi.getCurrentUser();
      authService.saveUser(user);
      navigate('/');
    } catch (error) {
      navigate('/login');
    }
  };
  
  loadUser();
}, []);
```

---

## CORS 設定

### 開發環境

```javascript
// 後端 CORS 設定
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true, // ✨ 允許帶 Cookie
}));
```

### 生產環境

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

---

## 安全性考量

### SameSite 屬性

| 值 | 說明 | 使用場景 |
|----|------|---------|
| `Strict` | 最嚴格，跨站完全不帶 Cookie | 一般 API 請求 |
| `Lax` | 中等，允許 GET 跨站導航帶 Cookie | LINE 登入重導 |
| `None` | 最寬鬆，需搭配 Secure（HTTPS） | 跨域場景 |

### Secure 屬性

- **開發環境**：`secure: false` (HTTP)
- **生產環境**：`secure: true` (HTTPS)

### CSRF 防護

使用 HttpOnly Cookie 時，建議搭配 CSRF Token：

```javascript
// 後端產生 CSRF Token
app.get('/auth/csrf', (req, res) => {
  const csrfToken = generateCSRFToken();
  res.cookie('csrf_token', csrfToken, {
    httpOnly: false, // 前端需要讀取
    sameSite: 'strict',
  });
  res.json({ csrfToken });
});

// 驗證 CSRF Token
app.post('/auth/login', csrfMiddleware, async (req, res) => {
  // ...
});
```

---

## 測試清單

### Phase 2 測試

- [ ] 登入後確認 localStorage 和 Cookie 都有設定
- [ ] API 請求同時帶 Cookie 和 Authorization header
- [ ] 後端同時驗證兩種認證方式
- [ ] 舊版前端仍可正常運作

### Phase 3 測試

- [ ] 登入後確認只有 Cookie，localStorage 無 token
- [ ] API 請求只帶 Cookie
- [ ] 登出確認 Cookie 已清除
- [ ] Token 過期後自動 refresh
- [ ] LINE 登入流程正常
- [ ] 跨域請求正常（CORS）
- [ ] CSRF 攻擊防護

---

## 回滾計畫

如果 Phase 3 出現問題，可以快速回滾到 Phase 2：

1. 恢復 `authUtils.ts` 和 `constants.ts`
2. 恢復 `authService.ts` 的 token 管理方法
3. 恢復 `apiClient.ts` 的 Authorization header 邏輯
4. 後端繼續支援 Bearer Token 認證

---

## 預估時程

| 階段 | 工作內容 | 預估時間 | 狀態 |
|------|---------|---------|------|
| Phase 1 | 統一前端 token 管理 | 0.5 天 | ✅ 完成 |
| Phase 2 | 後端支援雙模式 | 1-2 天 | ⏳ 待開始 |
| Phase 2 | 前端調整 credentials | 0.5 天 | ⏳ 待開始 |
| Phase 2 | 測試與驗證 | 1 天 | ⏳ 待開始 |
| Phase 3 | 前端移除 localStorage | 1 天 | ⏳ 待開始 |
| Phase 3 | 後端移除 Bearer Token | 0.5 天 | ⏳ 待開始 |
| Phase 3 | 完整測試 | 1-2 天 | ⏳ 待開始 |

**總計**：約 5-7 天

---

## 參考資源

- [OWASP - Cookie Security](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [MDN - HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [SameSite Cookie 說明](https://web.dev/samesite-cookies-explained/)
