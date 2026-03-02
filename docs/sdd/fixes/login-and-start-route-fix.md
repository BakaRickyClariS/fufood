# 修復登入流程與移除 Start 路由

## 問題分析

### 1. Start 路由問題
- **現狀**：`/start` 路由僅用於載入畫面，不應作為必要路由
- **問題**：ProtectedRoute 在未登入時導向 `/start` 而非 `/auth/login`
- **影響**：未登入使用者會看到載入畫面而非登入頁面

### 2. 登入流程問題
根據程式碼分析，發現兩個登入入口：
1. **LINE 登入**（`Login.tsx`）：
   - 呼叫 `login({ email: 'test@example.com', password: 'password' })`
   - 執行後 `navigate('/')`
   
2. **Email 登入**（經 `AvatarSelection.tsx`）：
   - 先導向頭像選擇頁面
   - 選擇頭像後呼叫 `login()`
   - 執行後 `navigate('/')`

**潛在問題**：
- `navigate('/')` 立即執行，但 `login()` 是異步操作
- ProtectedRoute 檢查 `localStorage.getItem('token')`，但 `authService.saveToken()` 可能尚未完成
- 可能導致導向到 `/` 後又被 ProtectedRoute 彈回 `/start`

### 3. Token 檢查邏輯
**問題發現**：
```typescript
// routes/index.tsx
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');  // 檢查 'token'
  if (!token) {
    return <Navigate to="/start" replace />;
  }
  return <>{children}</>;
};
```

但 `authService.saveToken()` 儲存的是：
```typescript
localStorage.setItem('accessToken', token.accessToken);  // 存成 'accessToken'
```

**Key 不一致！** ProtectedRoute 檢查的是 `token`，但實際儲存的是 `accessToken`。

---

## 解決方案

### 變更 1：移除 Start 路由

**檔案**：`src/routes/index.tsx`
- 移除 `StartPage` import
- 移除 `{ path: 'start', element: <StartPage /> }`
- 刪除 `src/routes/Start/` 目錄

### 變更 2：修正 ProtectedRoute

**檔案**：`src/routes/index.tsx`

**問題**：
1. localStorage key 不一致（檢查 `token`，實際存 `accessToken`）
2. 未登入導向錯誤路由（`/start` 應改為 `/auth/login`）

**修正**：
```typescript
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('accessToken');  // 改為 accessToken
  if (!token) {
    return <Navigate to="/auth/login" replace />;   // 改為 /auth/login
  }
  return <>{children}</>;
};
```

### 變更 3：統一 Mock 登入資料

**目標**：使用一致的測試帳號資料

**檔案**：`src/modules/auth/api/mock/authMockData.ts`

**現有 Mock 資料**：
```typescript
export const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'test@example.com',
    name: 'Jocelyn',
    avatar: 'bg-red-200',
    createdAt: new Date(),
  },
];
```

**確認**：所有登入入口都使用 `test@example.com` / `password` 組合（已一致）

### 變更 4：新增登入成功後的 Token 驗證

**問題**：目前 `navigate('/')` 緊接在 `await login()` 之後執行，但未確認 token 是否真的已儲存

**建議**：Login 與 AvatarSelection 已使用 `await`，理論上 token 應已儲存。若仍有問題，可加入延遲或直接檢查 token。

**可選強化**（視需要）：
```typescript
await login({ email: 'test@example.com', password: 'password' });
// 確認 token 已存在
if (localStorage.getItem('accessToken')) {
  navigate('/');
} else {
  console.error('Token not saved');
}
```

---

## 實作步驟

### 階段一：修正 ProtectedRoute（關鍵）

1. [ ] 修改 `src/routes/index.tsx`：
   - 變更 localStorage key：`token` → `accessToken`
   - 變更導向路由：`/start` → `/auth/login`

### 階段二：移除 Start 路由

1. [ ] 修改 `src/routes/index.tsx`：
   - 移除 `import StartPage`
   - 移除 `{ path: 'start', element: <StartPage /> }`

2. [ ] 刪除目錄：
   - `src/routes/Start/`

### 階段三：驗證與測試

1. [ ] 清除瀏覽器 localStorage
2. [ ] 測試登入流程：
   - LINE 登入 → 應成功進入 Dashboard
   - Email 登入 → 頭像選擇 → 應成功進入 Dashboard
3. [ ] 測試 ProtectedRoute：
   - 未登入訪問 `/` → 應導向 `/auth/login`
   - 登入後訪問 `/` → 應正常顯示 Dashboard

---

## 驗證計劃

### 自動化驗證（瀏覽器測試）

**測試步驟**：
1. 開啟 `http://localhost:5173`
2. 確認未登入時導向 `/auth/login`（非 `/start`）
3. 點擊「使用LINE應用程式登入」
4. 等待登入完成
5. 確認成功導向 `/` 並顯示 Dashboard
6. 確認 localStorage 中存在 `accessToken`

**預期結果**：
- ✅ 未登入時導向 `/auth/login`
- ✅ 登入後成功進入 Dashboard
- ✅ localStorage 包含 `accessToken`
- ✅ `/start` 路由不存在（404）

### 手動驗證

**步驟一：檢查未登入導向**
1. 開啟瀏覽器開發者工具（F12）
2. Application > Storage > Local Storage > 清除所有
3. 訪問 `http://localhost:5173/`
4. 確認自動導向 `/auth/login`

**步驟二：測試 LINE 登入**
1. 點擊「使用LINE應用程式登入」
2. 等待 1 秒（Mock API 延遲）
3. 確認導向 `/` 並顯示 Dashboard 內容

**步驟三：測試 Email 登入**
1. 重新開啟 `/auth/login`
2. 點擊「使用電子郵件帳號登入」
3. 導向頭像選擇頁面
4. 選擇任一頭像並點擊「確認」
5. 確認導向 `/` 並顯示 Dashboard

**步驟四：驗證 Token**
1. 開啟開發者工具 > Application > Local Storage
2. 確認存在 `accessToken` key（非 `token`）
3. 重新整理頁面，確認仍停留在 Dashboard

---

## 潛在風險

1. **ProtectedRoute 渲染時機**：
   - 風險：修改後 ProtectedRoute 可能在 token 儲存前就執行檢查
   - 緩解：`await login()` 確保同步執行

2. **其他頁面可能使用 Start 路由**：
   - 風險：刪除後其他地方可能有 `navigate('/start')` 呼叫
   - 緩解：執行全域搜尋確認

3. **現有使用者的 localStorage**：
   - 風險：已登入使用者仍有舊的 `token` key
   - 緩解：建議使用者清除 localStorage 或同時檢查兩個 key

---

## 相關檔案

- `src/routes/index.tsx` - 路由定義與 ProtectedRoute
- `src/routes/Start/index.tsx` - 待刪除
- `src/routes/Auth/Login.tsx` - LINE 登入邏輯
- `src/routes/Auth/AvatarSelection.tsx` - Email 登入邏輯
- `src/modules/auth/services/authService.ts` - Token 儲存邏輯
- `src/modules/auth/hooks/useAuth.ts` - 登入 Hook

---

## 注意事項

1. **Token Key 統一**：確保所有地方都使用 `accessToken` 作為 localStorage key
2. **Mock 資料一致性**：目前已統一使用 `test@example.com` / `password`
3. **導向邏輯**：確保 `await login()` 完成後才執行 `navigate()`
4. **清除舊資料**：建議開發者清除 localStorage 以測試全新流程
