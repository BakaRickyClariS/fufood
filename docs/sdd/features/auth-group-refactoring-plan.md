# Auth 與 Group 模組重構規劃

## 目標

將 Auth 與 Group 功能進行模組化重構，實現關注點分離與元件化整理，並預先建立 API 層架構（使用假資料模擬），以便後端完成後可直接替換。

## 現況分析

### Auth 模組現況

**檔案位置**：`src/routes/Auth/`

**現有檔案**：
- `Login.tsx` - 登入頁面（簡單實作）
- `Register.tsx` - 註冊頁面（幾乎空白）
- `AvatarSelection.tsx` - 頭像選擇頁面（含假登入邏輯）
- `index.tsx` - 路由配置

**問題**：
1. 缺乏模組化結構（無 `modules/auth` 目錄）
2. 直接在頁面元件中處理業務邏輯（如 `localStorage`）
3. 無 API 層抽象
4. 缺少型別定義
5. 無可重用組件
6. 狀態管理分散

### Group 模組現況

**檔案位置**：`src/modules/groups/`

**現有結構**：
```
modules/groups/
├── components/
│   ├── modals/      (4 個 Modal 組件)
│   └── ui/          (3 個 UI 組件)
├── hooks/
│   ├── useGroups.ts
│   └── useGroupMembers.ts
└── types/
    └── group.types.ts
```

**優點**：
- 已有模組化結構
- 型別定義完整
- Hooks 抽象良好

**待改進**：
1. 缺少 API 層（目前 Mock 資料直接寫在 Hooks 中）
2. Hooks 中混雜了資料獲取與狀態管理
3. 無統一的 services 層

---

## 重構方案

### 統一模組結構

兩個模組皆採用以下標準結構：

```
src/modules/{auth|groups}/
├── api/              # API 層（假資料 + 真實 API 介面）
│   ├── mock/         # Mock 資料
│   ├── {module}Api.ts
│   └── index.ts
├── components/       # UI 組件
│   ├── forms/        # 表單組件
│   ├── modals/       # Modal 組件
│   └── ui/           # 通用 UI 組件
├── hooks/            # Custom Hooks
│   ├── use{Module}.ts
│   └── index.ts
├── services/         # 業務邏輯層
│   ├── {module}Service.ts
│   └── index.ts
├── types/            # TypeScript 型別
│   ├── {module}.types.ts
│   ├── api.types.ts
│   └── index.ts
├── utils/            # 工具函數（若有）
└── index.ts          # 統一匯出
```

---

## Auth 模組重構詳細規劃

### 1. 型別定義（`types/`）

#### `auth.types.ts`
```typescript
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
```

#### `api.types.ts`
```typescript
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
```

---

### 2. API 層（`api/`）

#### `api/mock/authMockData.ts`
```typescript
import type { User, AuthToken } from '../../types';

export const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'test@example.com',
    name: 'Jocelyn',
    avatar: 'bg-red-200',
    createdAt: new Date(),
  },
];

export const MOCK_TOKEN: AuthToken = {
  accessToken: 'mock-jwt-token-' + Date.now(),
  refreshToken: 'mock-refresh-token-' + Date.now(),
  expiresIn: 3600,
};
```

#### `api/authApi.ts`
```typescript
import type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RegisterResponse,
  LINELoginRequest 
} from '../types';
import { MOCK_USERS, MOCK_TOKEN } from './mock/authMockData';

// 環境變數控制是否使用 Mock
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

export const authApi = {
  /**
   * 使用者登入
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    if (USE_MOCK) {
      // Mock 實作
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // 模擬驗證
      if (data.email === 'test@example.com' && data.password === 'password') {
        return {
          user: MOCK_USERS[0],
          token: MOCK_TOKEN,
        };
      }
      throw new Error('帳號或密碼錯誤');
    }
    
    // TODO: 真實 API 呼叫
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error('登入失敗');
    return response.json();
  },

  /**
   * 使用者註冊
   */
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: data.email,
        name: data.name || '新使用者',
        avatar: data.avatar || 'bg-blue-200',
        createdAt: new Date(),
      };
      
      return {
        user: newUser,
        token: MOCK_TOKEN,
      };
    }
    
    // TODO: 真實 API 呼叫
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error('註冊失敗');
    return response.json();
  },

  /**
   * LINE 登入
   */
  loginWithLINE: async (data: LINELoginRequest): Promise<LoginResponse> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        user: MOCK_USERS[0],
        token: MOCK_TOKEN,
      };
    }
    
    // TODO: 真實 API 呼叫
    const response = await fetch('/api/auth/line', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) throw new Error('LINE 登入失敗');
    return response.json();
  },

  /**
   * 登出
   */
  logout: async (): Promise<void> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return;
    }
    
    // TODO: 真實 API 呼叫
    await fetch('/api/auth/logout', { method: 'POST' });
  },

  /**
   * 取得當前使用者資訊
   */
  getCurrentUser: async (): Promise<User> => {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return MOCK_USERS[0];
    }
    
    // TODO: 真實 API 呼叫
    const response = await fetch('/api/auth/me');
    if (!response.ok) throw new Error('無法取得使用者資訊');
    return response.json();
  },
};
```

---

### 3. Services 層（`services/`）

#### `services/authService.ts`
```typescript
import { authApi } from '../api';
import type { LoginCredentials, RegisterData, User, AuthToken } from '../types';

/**
 * Auth Service - 處理認證相關業務邏輯
 */
export const authService = {
  /**
   * 儲存 Token 到 localStorage
   */
  saveToken: (token: AuthToken): void => {
    localStorage.setItem('accessToken', token.accessToken);
    if (token.refreshToken) {
      localStorage.setItem('refreshToken', token.refreshToken);
    }
    localStorage.setItem('tokenExpiry', String(Date.now() + token.expiresIn * 1000));
  },

  /**
   * 取得儲存的 Token
   */
  getToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },

  /**
   * 清除 Token
   */
  clearToken: (): void => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiry');
  },

  /**
   * 檢查 Token 是否過期
   */
  isTokenExpired: (): boolean => {
    const expiry = localStorage.getItem('tokenExpiry');
    if (!expiry) return true;
    return Date.now() > Number(expiry);
  },

  /**
   * 儲存使用者資料
   */
  saveUser: (user: User): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  /**
   * 取得儲存的使用者資料
   */
  getUser: (): User | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * 清除使用者資料
   */
  clearUser: (): void => {
    localStorage.removeItem('user');
  },

  /**
   * 執行登入流程
   */
  login: async (credentials: LoginCredentials) => {
    const response = await authApi.login(credentials);
    authService.saveToken(response.token);
    authService.saveUser(response.user);
    return response;
  },

  /**
   * 執行註冊流程
   */
  register: async (data: RegisterData) => {
    const response = await authApi.register(data);
    authService.saveToken(response.token);
    authService.saveUser(response.user);
    return response;
  },

  /**
   * 執行登出流程
   */
  logout: async () => {
    await authApi.logout();
    authService.clearToken();
    authService.clearUser();
  },
};
```

---

### 4. Hooks（`hooks/`）

#### `hooks/useAuth.ts`
```typescript
import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services';
import { authApi } from '../api';
import type { User, LoginCredentials, RegisterData } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 檢查登入狀態
  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getToken();
      const savedUser = authService.getUser();

      if (token && !authService.isTokenExpired()) {
        setUser(savedUser);
      } else {
        authService.clearToken();
        authService.clearUser();
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : '登入失敗';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authService.register(data);
      setUser(response.user);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : '註冊失敗';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
  };
};
```

---

## Group 模組重構詳細規劃

### 1. API 層新增（`api/`）

#### `api/mock/groupsMockData.ts`
```typescript
import type { Group, GroupMember } from '../../types';

export const MOCK_MEMBERS: GroupMember[] = [
  { id: '1', name: 'Jocelyn (你)', role: 'owner', avatar: 'bg-red-200' },
  { id: '2', name: 'Zoe', role: 'organizer', avatar: 'bg-orange-200' },
  { id: '3', name: 'Ricky', role: 'organizer', avatar: 'bg-amber-200' },
];

export const MOCK_GROUPS: Group[] = [
  {
    id: '1',
    name: 'My Home',
    admin: 'Jocelyn',
    members: MOCK_MEMBERS,
    color: 'bg-red-100',
    characterColor: 'bg-red-400',
    plan: 'free',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  // ... 其他 Mock 群組
];
```

#### `api/groupsApi.ts`
查看完整範例程式碼，包含所有 CRUD API 方法（create, read, update, delete, members 管理）。

---

## 環境變數設定

新增 `.env` 檔案：

```env
# API 模式設定
VITE_USE_MOCK_API=true    # true: 使用 Mock 資料, false: 使用真實 API

# API Base URL (真實 API 使用)
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## 實作步驟

### 階段一：Auth 模組重構

1. [ ] 建立 `src/modules/auth` 目錄結構
2. [ ] 實作型別定義 (`types/`)
3. [ ] 實作 Mock 資料 (`api/mock/`)
4. [ ] 實作 API 層 (`api/authApi.ts`)
5. [ ] 實作 Services 層 (`services/authService.ts`)
6. [ ] 實作 Hooks (`hooks/useAuth.ts`)
7. [ ] 重構 Login 頁面使用新架構
8. [ ] 重構 Register 頁面使用新架構
9. [ ] 重構 AvatarSelection 頁面使用新架構
10. [ ] 測試假登入/註冊流程

### 階段二：Group 模組重構

1. [ ] 建立 `api/` 目錄
2. [ ] 實作 Mock 資料 (`api/mock/`)
3. [ ] 實作 API 層 (`api/groupsApi.ts`)
4. [ ] 重構 `useGroups` Hook
5. [ ] 重構 `useGroupMembers` Hook
6. [ ] 更新所有 Modal 組件使用新架構
7. [ ] 測試群組 CRUD 與成員管理流程

### 階段三：整合與測試

1. [ ] 確保 Mock 模式正常運作
2. [ ] 撰寫 API 介接文件（供後端參考）
3. [ ] 準備 API 切換機制（環境變數）
4. [ ] 端對端測試

---

## API 介接文件（供後端參考）

### Auth API

| 端點 | 方法 | 描述 | Request Body | Response |
|------|------|------|--------------|----------|
| `/api/auth/login` | POST | 使用者登入 | `{ email, password }` | `{ user, token }` |
| `/api/auth/register` | POST | 使用者註冊 | `{ email, password, name?, avatar? }` | `{ user, token }` |
| `/api/auth/line` | POST | LINE 登入 | `{ code, redirectUri }` | `{ user, token }` |
| `/api/auth/logout` | POST | 登出 | - | - |
| `/api/auth/me` | GET | 取得當前使用者 | - | `User` |

### Groups API

| 端點 | 方法 | 描述 | Request Body | Response |
|------|------|------|--------------|----------|
| `/api/groups` | GET | 取得所有群組 | - | `Group[]` |
| `/api/groups` | POST | 建立群組 | `CreateGroupForm` | `Group` |
| `/api/groups/:id` | PUT | 更新群組 | `UpdateGroupForm` | `Group` |
| `/api/groups/:id` | DELETE | 刪除群組 | - | - |
| `/api/groups/:id/members` | GET | 取得成員列表 | - | `GroupMember[]` |
| `/api/groups/:id/members` | POST | 邀請成員 | `InviteMemberForm` | - |
| `/api/groups/:id/members/:memberId` | DELETE | 移除成員 | - | - |
| `/api/groups/:id/members/:memberId` | PATCH | 更新成員權限 | `{ role }` | - |

---

## 驗證計劃

### 功能測試

**Auth 模組**：
- [ ] Mock 登入流程
- [ ] Mock 註冊流程
- [ ] Token 儲存與讀取
- [ ] 登出清除狀態
- [ ] 頭像選擇整合

**Group 模組**：
- [ ] 群組列表顯示
- [ ] 建立群組
- [ ] 編輯群組
- [ ] 刪除群組
- [ ] 成員列表顯示
- [ ] 邀請成員
- [ ] 移除成員

### 切換測試

- [ ] 環境變數 `VITE_USE_MOCK_API=true` 時使用 Mock
- [ ] 環境變數 `VITE_USE_MOCK_API=false` 時準備好真實 API 呼叫

---

## 未來優化

1. **全域狀態管理**：考慮引入 Zustand 或 Redux Toolkit
2. **請求攔截器**：統一處理 Token、錯誤處理
3. **快取機制**：使用 React Query 管理伺服器狀態
4. **權限控制**：基於使用者角色的路由守衛
5. **錯誤邊界**：全域錯誤處理組件
