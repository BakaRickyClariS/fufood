# Auth Module API Specification

**版本**: v1.0  
**文件用途**: 提供後端介接與確認路由/回應格式  
**涵蓋範圍**: Auth 模組（註冊、登入、Token、LINE 登入、個資更新）

---

## 1. 基本規範

### 1.1 認證
- Access Token 以 `Authorization: Bearer <access_token>` 攜帶（亦可搭配 `httpOnly` Cookie）。
- Refresh Token 建議以 `httpOnly`、`Secure`、`SameSite=Strict` Cookie 儲存。

### 1.2 Base URL
```
/api/v1
```

### 1.3 標準回應與錯誤格式
- 成功：`200/201/204`，依情境回應物件或空內容。
- 失敗：
```json
{
  "code": "ERROR_CODE",
  "message": "錯誤訊息",
  "details": {},
  "timestamp": "2025-12-08T10:00:00Z"
}
```

---

## 2. 資料模型

### 2.1 User
```typescript
type User = {
  id: string;
  email: string;
  name?: string;
  avatar: string;
  createdAt: string;
};
```

### 2.2 AuthToken
```typescript
type AuthToken = {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number; // seconds
};
```

---

## 3. Auth API

### 3.1 註冊
- **POST** `/auth/register`
- Body: `{ email, password, name?, avatar? }`
- 201 → `{ user: User, token: AuthToken }`

### 3.2 登入
- **POST** `/auth/login`
- Body: `{ email, password }`
- 200 → `{ user: User, token: AuthToken }`

### 3.3 登出
- **POST** `/auth/logout`
- 204 或 `{ success: true }`，同時清除 Cookie。

### 3.4 刷新 Token
- **POST** `/auth/refresh`
- Body: `{ refreshToken: string }`（亦可由 httpOnly Cookie 取得）
- 200 → `{ accessToken, expiresIn }`

### 3.5 取得目前使用者
- **GET** `/auth/me`
- 200 → `User`

### 3.6 檢查 Token
- **GET** `/auth/check`
- 204 或 `{ success: true }`（需攜帶 Access Token）

### 3.7 LINE 登入導向
- **GET** `/auth/line/login`
- 302 → LINE 授權頁 URL（或回傳 `{ url }`）

### 3.8 LINE 登入回呼
- **GET** `/auth/line/callback?code=...&state=...`
- 200 → `{ user, token }`

### 3.9 更新個人資料
- **PUT** `/auth/update-profile`
- Body: `{ name?, avatar? }`
- 200 → `User`

---

## 4. 錯誤碼示例
| code | 說明 |
| --- | --- |
| AUTH_001 | Email 已存在 |
| AUTH_002 | 認證失敗（帳密錯誤或 Token 無效） |
| AUTH_003 | Refresh Token 無效或過期 |

