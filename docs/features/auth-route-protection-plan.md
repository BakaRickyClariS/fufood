# 認證路由保護功能規劃

## 概述

此功能確保未登入的使用者無法存取受保護的頁面，系統會自動將其重定向到登入頁面 (`/auth/login`)。同時需考慮測試用的電子郵件登入（Mock）和正式的 LINE 登入兩種登入方式。

---

## 現有問題分析

### 目前狀態

根據 [index.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/index.tsx) 的分析：

1. **`ProtectedRoute` 元件已存在**，但僅包裝了首頁 (`/`)
2. **以下路由未受保護**：
   - `/dashboard` - 儀表板
   - `/inventory` - 庫存管理
   - `/inventory/category/:categoryId` - 分類頁面
   - `/profile` - 個人資料
   - `/notifications` - 通知設定
   - `/subscription` - 訂閱管理
   - Planning 相關路由
   - FoodScan 相關路由

3. **認證機制**：
   - 使用 `localStorage` 儲存 `auth_token`
   - `authService` 提供 token 管理和過期檢查
   - Mock 登入使用 `mockLogin()` 產生假 token

---

## 公開路由（無需認證）

以下路由應保持公開存取：

| 路徑                     | 用途            |
| ------------------------ | --------------- |
| `/auth/login`            | 登入頁面        |
| `/auth/sign-up`          | 註冊頁面        |
| `/auth/avatar-selection` | 頭像選擇頁面    |
| `/auth/line/callback`    | LINE OAuth 回調 |

---

## 受保護路由（需要認證）

所有非 `/auth/*` 路由都應受到保護：

| 路徑                              | 用途         |
| --------------------------------- | ------------ |
| `/`                               | 首頁/儀表板  |
| `/dashboard`                      | 儀表板       |
| `/inventory`                      | 庫存管理     |
| `/inventory/category/:categoryId` | 分類詳情     |
| `/profile`                        | 個人資料     |
| `/notifications`                  | 通知設定     |
| `/subscription`                   | 訂閱管理     |
| `/planning/*`                     | 計劃相關     |
| `/foodscan/*`                     | 食物掃描相關 |

---

## 認證方式說明

### 1. 電子郵件登入（測試用 Mock）

用於開發和測試環境，透過 `authService.mockLogin()` 實現：

```typescript
// 產生 mock token 和用戶資料
const mockToken: AuthToken = {
  accessToken: `mock_auth_${Date.now()}`,
  refreshToken: `mock_refresh_${Date.now()}`,
  expiresIn: 3600 * 24 * 7, // 7 天
};
```

**流程**：

1. 用戶在登入頁面選擇「電子郵件帳號登入」
2. 進入頭像選擇頁面選擇頭像和顯示名稱
3. 調用 `mockLogin()` 產生假 token 並儲存
4. 重定向到首頁

### 2. LINE 登入（正式環境）

透過 LINE OAuth 2.0 實現：

**流程**：

1. 用戶點擊「使用 LINE 登入」
2. 重定向到 LINE 授權頁面
3. 用戶授權後重定向到 `/auth/line/callback`
4. 後端驗證並回傳 token
5. 前端儲存 token 並重定向到首頁

---

## 提議的修改

### [MODIFY] [index.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/index.tsx)

將 `ProtectedRoute` 應用到所有需要保護的路由：

```diff
 export const router = createBrowserRouter([
   {
     path: '/',
     element: <MainLayout />,
     children: [
       {
         index: true,
         element: (
           <ProtectedRoute>
             <Dashboard />
           </ProtectedRoute>
         ),
       },
-      { path: 'dashboard', element: <Dashboard /> },
+      {
+        path: 'dashboard',
+        element: (
+          <ProtectedRoute>
+            <Dashboard />
+          </ProtectedRoute>
+        ),
+      },
       {
         path: 'auth',
         children: AuthRoutes, // 保持公開
       },
       {
         path: 'inventory',
         children: [
-          { index: true, element: <Inventory /> },
-          { path: 'category/:categoryId', element: <CategoryPage /> },
+          {
+            index: true,
+            element: (
+              <ProtectedRoute>
+                <Inventory />
+              </ProtectedRoute>
+            ),
+          },
+          {
+            path: 'category/:categoryId',
+            element: (
+              <ProtectedRoute>
+                <CategoryPage />
+              </ProtectedRoute>
+            ),
+          },
         ],
       },
-      ...PlanningRoutes,
-      ...FoodScanRoutes,
-      ...SettingsRoutes,
+      // 包裝 Planning、FoodScan、Settings 路由
     ],
   },
 ]);
```

### 改進 `ProtectedRoute` 元件

增強認證檢查邏輯，使用 `authService` 進行更完整的驗證：

```typescript
import { authService } from '@/modules/auth';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = authService.getToken();
  const isTokenExpired = authService.isTokenExpired();

  // 無 token 或 token 已過期
  if (!token || isTokenExpired) {
    // 清除過期的 token
    if (token && isTokenExpired) {
      authService.clearToken();
      authService.clearUser();
    }
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};
```

---

## 驗證計劃

### 自動化測試

目前專案無單元測試框架，建議以手動測試為主。

### 手動測試

#### 測試 1：未登入狀態重定向

1. 開啟瀏覽器開發者工具 → Application → Local Storage
2. 清除所有 `auth_token`、`user`、`tokenExpiry` 等相關資料
3. 直接存取以下 URL，確認皆重定向到 `/auth/login`：
   - `http://localhost:5173/`
   - `http://localhost:5173/dashboard`
   - `http://localhost:5173/inventory`
   - `http://localhost:5173/profile`
4. **預期結果**：所有受保護頁面都重定向到登入頁面

#### 測試 2：電子郵件 Mock 登入後可存取

1. 存取 `http://localhost:5173/auth/login`
2. 點擊「電子郵件帳號登入」
3. 選擇頭像並輸入顯示名稱，點擊確認
4. 確認登入成功後可存取：
   - 首頁 `/`
   - 庫存頁 `/inventory`
   - 個人資料 `/profile`
5. **預期結果**：登入後可正常存取所有受保護頁面

#### 測試 3：LINE 登入後可存取

1. 存取 `http://localhost:5173/auth/login`
2. 點擊「使用 LINE 登入」
3. 完成 LINE OAuth 授權流程
4. 確認登入成功後可存取受保護頁面
5. **預期結果**：LINE 登入後可正常存取所有受保護頁面

#### 測試 4：登出後重定向

1. 在已登入狀態下點擊登出
2. 嘗試存取受保護頁面
3. **預期結果**：重定向到登入頁面

---

## 使用者需審核事項

> [!IMPORTANT]
> 請確認以下事項：
>
> 1. 受保護路由清單是否正確？
> 2. 是否有其他需要保持公開的路由？
> 3. 是否需要在重定向時保存原始目的地，登入後自動跳轉回去？
