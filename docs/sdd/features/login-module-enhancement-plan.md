# 登入模組調整實施計畫

## 概述

本計畫旨在調整登入模組，保留現有 LINE 登入功能，新增電子郵件假登入流程，並改進頭像選擇和名稱設定功能。

### 核心功能需求

1. **LINE 登入**：維持現有功能不變
2. **電子郵件帳號假登入**：點擊後直接進入頭像選擇頁面
3. **頭像選擇**：使用 `src/assets/images/auth` 資料夾中的 9 張頭像圖片
4. **名稱設定**：預設名稱 "Ricky"，可自由修改
5. **佈局調整**：確保內容不被 BottomNav 遮擋（使用 padding 而非絕對定位）
6. **Hero 圖片輪播**：登入頁面上方新增自動輪播區域，使用 GSAP 動畫效果

### 設計參考

```carousel
![頭像選擇設計](file:///C:/Users/USER/.gemini/antigravity/brain/3d9d5942-6242-4cce-91ab-4b0e7993306e/uploaded_image_1765698802285.png)
<!-- slide -->
![登入頁面 Hero 設計](file:///C:/Users/USER/.gemini/antigravity/brain/3d9d5942-6242-4cce-91ab-4b0e7993306e/uploaded_image_1765699199786.png)
```

---

## 待確認事項

> [!IMPORTANT]
> **關於假登入資料儲存**
>
> 電子郵件假登入完成後，是否需要將頭像和名稱儲存到 localStorage？這樣使用者下次開啟 App 時可以保持登入狀態。

---

## 現有程式碼分析

### 現有檔案結構

```
src/routes/Auth/
├── Login.tsx              # 登入頁面（LINE + 電子郵件按鈕）
├── AvatarSelection.tsx    # 頭像選擇頁面（需要改造）
├── LineLoginCallback.tsx  # LINE 登入回調
├── Register.tsx           # 註冊頁面
└── index.tsx              # 路由出口

src/modules/auth/
├── api/                   # API 層
├── hooks/useAuth.ts       # 認證 hook
├── services/authService.ts # 認證服務
└── types/auth.types.ts    # 類型定義

src/assets/images/auth/
├── Avatar-1.png ~ Avatar-9.png  # 9 張頭像圖片
```

### BottomNav 高度資訊

- BottomNav 高度為 `h-20`（約 80px）
- 使用 `fixed bottom-0` 定位
- 建議內容底部 padding 至少 `pb-24`（96px）以避免遮擋

---

## 實施計畫

### 第一部分：類型定義擴展

#### [MODIFY] [auth.types.ts](file:///d:/Work/Course/HexSchool/fufood/src/modules/auth/types/auth.types.ts)

新增 MockUser 相關類型，支援假登入流程：

```diff
 export type User = {
   id: string;
   email?: string;
   name?: string;
   avatar: string;
   createdAt: Date;
   lineId?: string;
   displayName?: string;
   pictureUrl?: string;
 };

+// 假登入設定資料
+export type MockLoginData = {
+  avatarId: number;
+  displayName: string;
+};
```

---

### 第二部分：登入頁面 Hero 輪播

#### [MODIFY] [Login.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/Auth/Login.tsx)

在登入頁面新增 Hero 圖片輪播區域，使用 GSAP 動畫效果：

**主要變更：**

1. 新增 Hero 輪播區域，顯示在登入按鈕上方
2. 使用 `authHero.png` 圖片（暫時用同一張圖片模擬輪播）
3. GSAP 動畫效果：淡入淡出 + 輕微縮放
4. 自動輪播間隔 3 秒
5. 底部分頁指示器（三個點）
6. 標題和副標題文字

**輪播資料配置：**

```typescript
// 輪播配置（暫時使用同一張圖片）
const HERO_SLIDES = [
  {
    id: 1,
    image: authHeroImage,
    title: '快用 FuFood',
    subtitle: '來管理冰箱庫存吧！',
    caption: 'AI 智慧辨識入庫，\n你的隨身食材管家',
  },
  {
    id: 2,
    image: authHeroImage,
    title: '智慧食材管理',
    subtitle: '讓生活更輕鬆！',
    caption: '輕鬆追蹤過期日，\n減少食物浪費',
  },
  {
    id: 3,
    image: authHeroImage,
    title: '共享冰箱',
    subtitle: '與家人一起管理！',
    caption: '邀請家人加入群組，\n一起管理家中庫存',
  },
];
```

**GSAP 動畫邏輯：**

```typescript
// 自動輪播 effect
useEffect(() => {
  const interval = setInterval(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, 3000);
  return () => clearInterval(interval);
}, []);

// GSAP 動畫 effect
useLayoutEffect(() => {
  if (!slideRef.current) return;

  gsap.fromTo(
    slideRef.current,
    { opacity: 0, scale: 0.95 },
    { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' },
  );
}, [currentSlide]);
```

**完整程式碼實作：**

```tsx
import {
  useEffect,
  useState,
  useCallback,
  useLayoutEffect,
  useRef,
} from 'react';
import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth, authService } from '@/modules/auth';
import gsap from 'gsap';

// 匯入 Hero 圖片
import authHeroImage from '@/assets/images/auth/authHero.png';

// 輪播配置（暫時使用同一張圖片）
const HERO_SLIDES = [
  {
    id: 1,
    image: authHeroImage,
    title: '快用 FuFood',
    subtitle: '來管理冰箱庫存吧！',
    caption: 'AI 智慧辨識入庫，\n你的隨身食材管家',
  },
  {
    id: 2,
    image: authHeroImage,
    title: '智慧食材管理',
    subtitle: '讓生活更輕鬆！',
    caption: '輕鬆追蹤過期日，\n減少食物浪費',
  },
  {
    id: 3,
    image: authHeroImage,
    title: '共享冰箱',
    subtitle: '與家人一起管理！',
    caption: '邀請家人加入群組，\n一起管理家中庫存',
  },
];

const Login = () => {
  const navigate = useNavigate();
  const { isLoading, error, getLineLoginUrl, refreshUser } = useAuth();
  const [lineLoginLoading, setLineLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideRef = useRef<HTMLDivElement>(null);

  // 自動輪播
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // GSAP 動畫
  useLayoutEffect(() => {
    if (!slideRef.current) return;

    gsap.fromTo(
      slideRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' },
    );
  }, [currentSlide]);

  const handleEmailLogin = async () => {
    navigate('/auth/avatar-selection');
  };

  // ... 其餘 LINE 登入邏輯保持不變 ...

  return (
    <div className="flex flex-col min-h-screen bg-white p-6 pb-24">
      {/* Hero 輪播區域 */}
      <div className="flex-1 flex flex-col justify-center">
        <div ref={slideRef} className="bg-neutral-100 rounded-3xl p-6 mb-6">
          {/* 標題文字 */}
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold text-neutral-800">
              {HERO_SLIDES[currentSlide].title}
            </h1>
            <h2 className="text-xl font-bold text-neutral-800">
              {HERO_SLIDES[currentSlide].subtitle}
            </h2>
          </div>

          {/* Hero 圖片 */}
          <div className="flex justify-center mb-4">
            <img
              src={HERO_SLIDES[currentSlide].image}
              alt="FuFood Hero"
              className="w-full max-w-[280px] h-auto object-contain"
            />
          </div>

          {/* 副標題文字 */}
          <div className="text-center">
            <p className="text-sm text-neutral-600 whitespace-pre-line">
              {HERO_SLIDES[currentSlide].caption}
            </p>
          </div>
        </div>

        {/* 分頁指示器 */}
        <div className="flex justify-center gap-2 mb-6">
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentSlide === index ? 'bg-neutral-800' : 'bg-neutral-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 登入按鈕區域 */}
      <div className="flex flex-col gap-4">
        {/* 錯誤訊息 */}
        {displayError && (
          <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">
            {displayError}
          </div>
        )}

        {/* LINE 登入按鈕 */}
        <Button
          className="w-full bg-[#EE5D50] hover:bg-[#D94A3D] text-white h-12 text-base rounded-xl shadow-sm"
          onClick={handleLineLogin}
          disabled={isLoading || lineLoginLoading}
        >
          {lineLoginLoading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              登入中...
            </span>
          ) : (
            '使用LINE應用程式登入'
          )}
        </Button>

        {/* 電子郵件登入按鈕 */}
        <Button
          variant="outline"
          className="w-full border-stone-200 text-stone-700 h-12 text-base rounded-xl hover:bg-stone-50"
          onClick={handleEmailLogin}
          disabled={isLoading || lineLoginLoading}
        >
          使用電子郵件帳號登入
        </Button>

        {/* 忘記密碼 */}
        <div className="flex justify-center mt-2">
          <button className="text-sm text-stone-800 font-medium hover:underline">
            忘記密碼？
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
```

---

### 第三部分：頭像選擇頁面改造

#### [MODIFY] [AvatarSelection.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/Auth/AvatarSelection.tsx)

重新設計頭像選擇頁面，符合 UI 設計稿：

**主要變更：**

1. 使用實際頭像圖片（Avatar-1.png ~ Avatar-9.png）
2. 新增名稱輸入欄位，預設值為 "Ricky"
3. 選中狀態顯示紅色外框和勾選圖示
4. 白色卡片容器設計，帶有左側橙色標題裝飾
5. 底部新增 `pb-24` 確保不被 BottomNav 遮擋
6. 使用 `套用` 按鈕文字

**UI 設計要點：**

- 標題「選擇頭貼」左側帶橘色裝飾線
- 3x3 格子佈局顯示頭像
- 選中狀態：紅色外框 + 右上角紅色勾選圓圈
- 底部固定「套用」按鈕（珊瑚紅色）
- 整體使用白色背景圓角卡片

**完整程式碼實作：**

```tsx
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/shared/utils/styleUtils';
import { useAuth } from '@/modules/auth';
import { Check } from 'lucide-react';

// 匯入頭像圖片
import Avatar1 from '@/assets/images/auth/Avatar-1.png';
import Avatar2 from '@/assets/images/auth/Avatar-2.png';
import Avatar3 from '@/assets/images/auth/Avatar-3.png';
import Avatar4 from '@/assets/images/auth/Avatar-4.png';
import Avatar5 from '@/assets/images/auth/Avatar-5.png';
import Avatar6 from '@/assets/images/auth/Avatar-6.png';
import Avatar7 from '@/assets/images/auth/Avatar-7.png';
import Avatar8 from '@/assets/images/auth/Avatar-8.png';
import Avatar9 from '@/assets/images/auth/Avatar-9.png';

const AVATARS = [
  { id: 1, src: Avatar1 },
  { id: 2, src: Avatar2 },
  { id: 3, src: Avatar3 },
  { id: 4, src: Avatar4 },
  { id: 5, src: Avatar5 },
  { id: 6, src: Avatar6 },
  { id: 7, src: Avatar7 },
  { id: 8, src: Avatar8 },
  { id: 9, src: Avatar9 },
];

const AvatarSelection = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [displayName, setDisplayName] = useState('Ricky');

  const handleConfirm = async () => {
    if (selectedId && displayName.trim()) {
      try {
        // 使用 Mock 登入
        await login({ email: 'test@example.com', password: 'password' });
        navigate('/');
      } catch (error) {
        console.error('Login failed:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pb-24">
      {/* 內容區 */}
      <div className="flex-1 p-4">
        {/* 標題區 - 帶左側橘色裝飾線 */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-[#EE5D50] rounded-full" />
          <h1 className="text-lg font-bold text-neutral-800">選擇頭貼</h1>
        </div>

        {/* 頭像選擇區 - 白色卡片 */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-4">
          <div className="grid grid-cols-3 gap-3">
            {AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                className={cn(
                  'relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200',
                  selectedId === avatar.id
                    ? 'border-[#EE5D50] shadow-md'
                    : 'border-neutral-100 hover:border-neutral-200',
                )}
                onClick={() => setSelectedId(avatar.id)}
              >
                <img
                  src={avatar.src}
                  alt={`頭像 ${avatar.id}`}
                  className="w-full h-full object-cover"
                />
                {/* 選中標記 */}
                {selectedId === avatar.id && (
                  <div className="absolute top-1 right-1 w-6 h-6 bg-[#EE5D50] rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 名稱設定區 */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-[#EE5D50] rounded-full" />
            <h2 className="text-lg font-bold text-neutral-800">設定名稱</h2>
          </div>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="請輸入名稱"
            maxLength={20}
            className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-[#EE5D50] focus:ring-1 focus:ring-[#EE5D50] transition-colors"
          />
        </div>
      </div>

      {/* 底部按鈕區 - Fixed 但使用 padding 預留空間 */}
      <div
        className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-neutral-100"
        style={{ marginBottom: '80px' }}
      >
        <Button
          className="w-full bg-[#EE5D50] hover:bg-[#D94A3D] text-white h-12 text-base font-bold rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleConfirm}
          disabled={!selectedId || !displayName.trim() || isLoading}
        >
          {isLoading ? '處理中...' : '套用'}
        </Button>
      </div>
    </div>
  );
};

export default AvatarSelection;
```

---

### 第四部分：authService 擴展

#### [MODIFY] [authService.ts](file:///d:/Work/Course/HexSchool/fufood/src/modules/auth/services/authService.ts)

新增假登入方法，支援電子郵件假登入流程：

```diff
+  /**
+   * 執行假登入流程（電子郵件帳號）
+   */
+  mockLogin: (avatarId: number, displayName: string): { user: User; token: AuthToken } => {
+    const mockToken: AuthToken = {
+      accessToken: `mock_auth_${Date.now()}`,
+      refreshToken: `mock_refresh_${Date.now()}`,
+      expiresIn: 3600 * 24 * 7, // 7 天
+    };
+
+    const user: User = {
+      id: `mock_user_${Date.now()}`,
+      email: 'mock@example.com',
+      name: displayName,
+      displayName: displayName,
+      avatar: `/src/assets/images/auth/Avatar-${avatarId}.png`,
+      createdAt: new Date(),
+    };
+
+    authService.saveToken(mockToken);
+    authService.saveUser(user);
+
+    return { user, token: mockToken };
+  },
```

---

### 第五部分：useAuth Hook 擴展

#### [MODIFY] [useAuth.ts](file:///d:/Work/Course/HexSchool/fufood/src/modules/auth/hooks/useAuth.ts)

新增 mockLogin 方法：

```diff
+  /**
+   * 假登入（電子郵件帳號）
+   */
+  const mockLogin = useCallback((avatarId: number, displayName: string) => {
+    setIsLoading(true);
+    setError(null);
+    try {
+      const response = authService.mockLogin(avatarId, displayName);
+      setUser(response.user);
+      return response;
+    } catch (err) {
+      const message = err instanceof Error ? err.message : '假登入失敗';
+      setError(message);
+      throw err;
+    } finally {
+      setIsLoading(false);
+    }
+  }, []);

   return {
     user,
     isAuthenticated: !!user,
     isLoading,
     error,
     login,
+    mockLogin,
     register,
     logout,
     getLineLoginUrl,
     refreshUser,
   };
```

---

## 驗證計畫

### 手動測試

#### 測試 1：Hero 輪播功能

1. 執行 `npm run dev` 啟動開發伺服器
2. 在瀏覽器開啟 `http://localhost:5173/auth/login`
3. 確認 Hero 輪播區域正確顯示圖片和文字
4. 等待 3 秒，確認輪播自動切換到下一張
5. 確認 GSAP 動畫效果（淡入淡出 + 輕微縮放）正常運作
6. 點擊底部分頁指示器的不同點，確認可手動切換
7. 確認當前活躍的指示器點樣式不同（深色）

#### 測試 2：電子郵件假登入流程

1. 在登入頁面點擊「使用電子郵件帳號登入」按鈕
2. 確認跳轉到頭像選擇頁面 (`/auth/avatar-selection`)
3. 確認頁面顯示 9 張頭像圖片
4. 點擊任一頭像，確認出現紅色外框和勾選圖示
5. 確認名稱輸入欄位預設值為 "Ricky"
6. 修改名稱為其他值
7. 點擊「套用」按鈕
8. 確認跳轉到首頁 (`/`)
9. 確認 localStorage 中有 user 資料

#### 測試 3：LINE 登入功能維持正常

1. 在登入頁面點擊「使用LINE應用程式登入」按鈕
2. 確認 popup 視窗正常開啟
3. 確認 LINE 授權流程正常運作

#### 測試 4：頭像選擇頁面佈局

1. 在頭像選擇頁面
2. 捲動頁面確認內容不被 BottomNav 遮擋
3. 確認「套用」按鈕定位在 BottomNav 上方且完整可見
4. 使用開發者工具檢查元素，確認沒有使用 `position: absolute` 進行主要內容定位

#### 測試 5：名稱編輯功能

1. 在頭像選擇頁面
2. 清空名稱輸入欄位
3. 確認「套用」按鈕變為 disabled 狀態
4. 輸入新名稱
5. 確認「套用」按鈕恢復可點擊狀態

---

## 影響範圍

### 修改的檔案

| 檔案                                       | 變更類型 | 說明                               |
| ------------------------------------------ | -------- | ---------------------------------- |
| `src/routes/Auth/Login.tsx`                | 重構     | 新增 Hero 輪播區域和 GSAP 動畫     |
| `src/routes/Auth/AvatarSelection.tsx`      | 重構     | 重新設計頭像選擇頁面，使用實際圖片 |
| `src/modules/auth/types/auth.types.ts`     | 擴展     | 新增 MockLoginData 類型            |
| `src/modules/auth/services/authService.ts` | 擴展     | 新增 mockLogin 方法                |
| `src/modules/auth/hooks/useAuth.ts`        | 擴展     | 新增 mockLogin hook 方法           |

### 不受影響的功能

- LINE 登入流程
- 現有頁面路由
- 其他模組功能

---

## 預估工作量

| 項目                     | 預估時間        |
| ------------------------ | --------------- |
| 類型定義擴展             | 5 分鐘          |
| Login.tsx Hero 輪播實作  | 25 分鐘         |
| authService 擴展         | 10 分鐘         |
| useAuth Hook 擴展        | 5 分鐘          |
| AvatarSelection 頁面重構 | 30 分鐘         |
| 手動測試與調整           | 20 分鐘         |
| **合計**                 | **約 1.5 小時** |
