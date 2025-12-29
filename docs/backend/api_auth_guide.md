# FuFood 認證 API 串接指南

> LINE OAuth 登入與 Token 認證機制

---

## 目錄

1. [認證流程概述](#認證流程概述)
2. [LINE OAuth 登入](#line-oauth-登入)
3. [Token 使用方式](#token-使用方式)
4. [登出](#登出)
5. [取得使用者資料](#取得使用者資料)
6. [資料模型](#資料模型)
7. [錯誤處理](#錯誤處理)
8. [前端串接範例](#前端串接範例)

---

## 認證流程概述

```mermaid
sequenceDiagram
    participant 前端
    participant 後端
    participant LINE

    前端->>後端: GET /oauth/line/init
    後端->>LINE: 重新導向至 LINE 登入頁面
    LINE-->>使用者: 顯示登入畫面
    使用者-->>LINE: 授權登入
    LINE->>後端: GET /oauth/line/callback?code=xxx&state=xxx
    後端->>前端: 設定 Cookie / 回傳 Token
    前端->>後端: API 請求 (帶 Authorization Header)
```

---

## LINE OAuth 登入

### 初始化 LINE 登入

產生 state 並導向 LINE 登入頁面

```http
GET /oauth/line/init
```

**回應**: `302` 重新導向至 LINE 登入頁面

**前端使用方式**:
```javascript
// 方式一：直接導向
window.location.href = 'https://your-api-domain.com/oauth/line/init';

// 方式二：開新視窗
window.open('https://your-api-domain.com/oauth/line/init', '_blank');
```

---

### LINE 登入回調

處理 LINE 登入成功後的回調（由後端自動處理）

```http
GET /oauth/line/callback
```

**查詢參數**:

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `code` | string | ✅ | LINE 授權碼 |
| `state` | string | ✅ | 驗證用 state |

**回應**:

| 狀態碼 | 說明 |
|--------|------|
| `200` | 登入成功 |
| `400` | State 驗證失敗 |

---

## Token 使用方式

登入成功後，所有需要認證的 API 請求都需要在 Header 加入 JWT Token：

```http
Authorization: Bearer <your_jwt_token>
```

### Header 範例

```http
GET /api/v1/profile HTTP/1.1
Host: your-api-domain.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## 登出

撤銷 Access Token 並清除 Cookie

```http
DELETE /api/v1/session
```

**回應**: `204` 登出成功

**前端處理**:
```javascript
async function logout() {
  await fetch('/api/v1/session', {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  // 清除本地儲存的 token
  localStorage.removeItem('access_token');
  
  // 導向登入頁面
  window.location.href = '/login';
}
```

---

## 取得使用者資料

```http
GET /api/v1/profile
```

**回應範例** (`200`):

```json
{
  "data": {
    "id": "019af809-7225-7d3b-b8f4-770e2c740e68",
    "lineId": "U78d1bb86f8410a52d375306295c06503",
    "name": "王小明",
    "profilePictureUrl": "https://profile.line.me/...",
    "subscriptionType": "Free",
    "createdAt": "2025-12-07T08:59:19Z"
  }
}
```

**錯誤回應** (`401`):

```json
{
  "message": "未授權，請先登入"
}
```

---

## 資料模型

### User (使用者)

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | uuid | 使用者 ID |
| `lineId` | string | LINE 使用者 ID |
| `name` | string | 使用者名稱 |
| `profilePictureUrl` | uri | 頭像網址 |
| `subscriptionType` | enum | 訂閱類型 (`Free` / `Pro`) |
| `createdAt` | datetime | 建立時間 |

### 訂閱類型差異

| 功能 | Free | Pro |
|------|------|-----|
| 冰箱成員上限 | 3 人 | 5 人 |

---

## 錯誤處理

### HTTP 狀態碼

| 狀態碼 | 說明 |
|--------|------|
| `200` | 成功 |
| `204` | 成功（無回應內容） |
| `302` | 重新導向 |
| `400` | 請求參數錯誤 / State 驗證失敗 |
| `401` | 未授權，請先登入 |

### 常見錯誤訊息

| 訊息 | 說明 | 處理方式 |
|------|------|----------|
| `未授權，請先登入` | Token 無效或過期 | 重新導向至登入頁面 |
| `State 驗證失敗` | OAuth state 不符 | 重新發起登入流程 |

---

## 前端串接範例

### 完整認證流程

```javascript
const API_BASE = 'https://your-api-domain.com';

// 發起登入
function login() {
  window.location.href = `${API_BASE}/oauth/line/init`;
}

// 取得使用者資料（驗證登入狀態）
async function getProfile() {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE}/api/v1/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      // Token 過期，清除並導向登入
      localStorage.removeItem('access_token');
      return null;
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('取得使用者資料失敗:', error);
    return null;
  }
}

// 登出
async function logout() {
  const token = localStorage.getItem('access_token');
  
  try {
    await fetch(`${API_BASE}/api/v1/session`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('登出失敗:', error);
  } finally {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  }
}

// 檢查登入狀態
async function checkAuth() {
  const user = await getProfile();
  
  if (!user) {
    // 未登入，導向登入頁面
    login();
    return false;
  }
  
  return true;
}
```

### React Hook 範例

```javascript
import { useState, useEffect, createContext, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout: async () => {
      await logout();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

---

## 注意事項

1. **Token 儲存**：建議使用 `localStorage` 或 `httpOnly Cookie` 儲存 Token
2. **Token 過期處理**：收到 `401` 回應時，應清除 Token 並重新導向登入
3. **跨域請求**：確認後端已設定正確的 CORS 政策
