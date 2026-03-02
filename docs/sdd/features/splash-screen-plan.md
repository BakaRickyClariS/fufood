# 載入畫面實作計畫 (純 React 方案)

## 專案背景

**fufood** 需要一個載入畫面，在首次訪問或 PWA 啟動時顯示。使用者提供了設計稿與三個圖片資源，要求使用**純 React 實作**，不修改 `index.html`。

## 設計資源

### 圖片資源
- **背景圖**：`src/assets/images/startup/bg.png` (326 KB)
  - 模糊的廚房/食物場景
  
- **角色圖**：`src/assets/images/startup/char.png` (864 KB)
  - 可愛的食物角色群（綠色花椰菜、白色冰箱、紅色番茄、黃色檸檬）
  
- **Logo 圖**：`src/assets/images/startup/logo.png` (5 KB)
  - "FOOD 冰箱庫存管理" 品牌 Logo

### 設計稿分析

![設計稿](file:///C:/Users/USER/.gemini/antigravity/brain/87bd6e6c-6477-4a47-bec7-1bb4a9f37113/uploaded_image_1764429626866.png)

**版面結構**：
- **背景層**：模糊的廚房場景（bg.png）
- **Logo 層**：中央偏上位置的品牌 Logo（logo.png）
- **角色層**：底部的食物角色群（char.png）
- **整體氛圍**：溫馨、可愛、與食物相關

**色彩分析**：
- 主背景：柔和的藍色天空 + 暖色調廚房
- Logo：白色文字，清晰可見
- 角色：鮮豔多彩，增添活力

---

## 技術架構

### 純 React 實作方案

**不修改 `index.html`**，所有邏輯在 React 層實現。

#### 優點
- ✅ 保持 `index.html` 簡潔
- ✅ 使用 React 生態系統（狀態管理、hooks、動畫）
- ✅ 易於維護與測試
- ✅ 完全動態控制

#### 權衡
- ⚠️ 顯示時機較晚（需等 React bundle 載入，約 0.5-1 秒）
- ⚠️ 首次載入會有短暫白屏（React 啟動前）

**解決方案**：
- 優化 bundle 大小
- PWA 環境下，Service Worker 會快取資源，第二次載入極快

---

## 組件設計

### SplashScreen 組件

**檔案**：`src/shared/components/SplashScreen.tsx`

**結構**：
```tsx
<div className="fixed inset-0 z-50">
  {/* 背景層 */}
  <img src={bg} className="absolute inset-0 w-full h-full object-cover" />
  
  {/* 內容層 */}
  <div className="relative h-full flex flex-col items-center justify-center">
    {/* Logo */}
    <img src={logo} className="w-48 mb-8 animate-fade-in" />
    
    {/* 角色 */}
    <img src={char} className="w-64 animate-slide-up" />
  </div>
</div>
```

**動畫設計**：
1. **背景**：靜態或極慢淡入
2. **Logo**：淡入 (fade-in)，延遲 0.2s
3. **角色**：從下滑入 (slide-up)，延遲 0.4s
4. **整體**：2 秒後淡出

---

## 實作方案

### 階段一：建立 SplashScreen 組件

**檔案**：`src/shared/components/SplashScreen.tsx`

```tsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import bgImage from '@/assets/images/startup/bg.png';
import charImage from '@/assets/images/startup/char.png';
import logoImage from '@/assets/images/startup/logo.png';

export const SplashScreen = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const charRef = useRef<HTMLImageElement>(null);
  
  useEffect(() => {
    // GSAP 時間軸動畫
    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' }
    });
    
    // 動畫序列
    tl.fromTo(
      logoRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.2 }
    )
    .fromTo(
      charRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8 },
      '-=0.3' // 與前一個動畫重疊 0.3 秒
    );
    
    return () => {
      tl.kill(); // 清理動畫
    };
  }, []);
  
  return (
    <div ref={containerRef} className="fixed inset-0 z-50 overflow-hidden">
      {/* 背景圖 */}
      <img 
        src={bgImage} 
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* 內容容器 */}
      <div className="relative h-full flex flex-col items-center justify-center px-6">
        {/* Logo */}
        <img 
          ref={logoRef}
          src={logoImage} 
          alt="fufood Logo"
          className="w-48 mb-8"
          style={{ opacity: 0 }}
        />
        
        {/* 角色群 */}
        <img 
          ref={charRef}
          src={charImage} 
          alt="Characters"
          className="w-64 max-w-[80%]"
          style={{ opacity: 0 }}
        />
      </div>
    </div>
  );
};
```

**GSAP 動畫說明**：
- 使用 `gsap.timeline()` 建立時間軸，方便編排動畫序列
- `fromTo()` 方法定義起始與結束狀態
- `defaults: { ease: 'power2.out' }` 設定統一的緩動函數
- `-=0.3` 讓角色動畫與 Logo 重疊，創造連貫感
- `tl.kill()` 確保組件卸載時清理動畫

---

### 階段二：整合到 App.tsx

**檔案**：`src/App.tsx`

**方案 A：使用狀態控制（推薦）**

```tsx
import { useState, useEffect } from 'react';
import { SplashScreen } from '@/shared/components/SplashScreen';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  
  useEffect(() => {
    // 最少顯示 2 秒
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <>
      {showSplash && <SplashScreen />}
      
      {/* 主應用（在背景載入） */}
      <Router>
        <Routes>
          {/* ... */}
        </Routes>
      </Router>
    </>
  );
}
```

**方案 B：GSAP 淡出動畫（推薦，更平滑）**

```tsx
import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { SplashScreen } from '@/shared/components/SplashScreen';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const splashRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // 2 秒後淡出
    const timer = setTimeout(() => {
      gsap.to(splashRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: () => {
          setShowSplash(false);
        }
      });
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <>
      {showSplash && (
        <div ref={splashRef}>
          <SplashScreen />
        </div>
      )}
      
      <Router>
        <Routes>
          {/* ... */}
        </Routes>
      </Router>
    </>
  );
}
```

---

### 階段三：資源優化（可選）

#### 3.1 圖片預載入

為了避免首次顯示時圖片未載入，可在 `main.tsx` 中預載入：

```tsx
// src/main.tsx
import bgImage from '@/assets/images/startup/bg.png';
import charImage from '@/assets/images/startup/char.png';
import logoImage from '@/assets/images/startup/logo.png';

// 預載入圖片
const preloadImages = [bgImage, charImage, logoImage];
preloadImages.forEach(src => {
  const img = new Image();
  img.src = src;
});

// 然後渲染 App
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

#### 3.2 圖片壓縮建議

**當前大小**：
- bg.png: 326 KB
- char.png: 864 KB ⚠️ **較大**
- logo.png: 5 KB ✅

**建議**：
- 將 `char.png` 壓縮至 < 200 KB（使用 TinyPNG 或類似工具）
- 或使用 WebP 格式（支援透明度且更小）

**Vite 自動壓縮**：
```typescript
// vite.config.ts
import imagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    imagemin({
      gifsicle: { optimizationLevel: 3 },
      mozjpeg: { quality: 80 },
      pngquant: { quality: [0.8, 0.9], speed: 4 },
      svgo: { plugins: [{ name: 'removeViewBox' }] },
    })
  ]
});
```

---

## PWA Splash Screen 設定（額外）

雖然主要使用 React 方案，但仍建議調整 PWA Manifest：

**檔案**：`vite.config.ts`

```typescript
manifest: {
  name: 'fufood 食物管家',
  short_name: 'fufood',
  theme_color: '#ec5b4a',
  background_color: '#ffffff',  // 或改為與設計稿背景相近的藍色
  display: 'standalone',
  orientation: 'portrait',
  icons: [
    // 確保有 512x512 圖示（PWA Splash Screen 會使用）
  ]
}
```

**效果**：
- PWA 從桌面啟動時，會先顯示系統原生 Splash Screen（1 秒）
- 接著顯示 React 的自訂 Splash Screen（2 秒）
- 雙層保護，確保良好體驗

---

## GSAP 進階動畫效果

### 1. 彈跳效果 (Bounce)

```tsx
useEffect(() => {
  const tl = gsap.timeline({
    defaults: { ease: 'back.out(1.7)' } // 彈跳緩動
  });
  
  tl.fromTo(
    logoRef.current,
    { opacity: 0, scale: 0.5 },
    { opacity: 1, scale: 1, duration: 0.8, delay: 0.2 }
  )
  .fromTo(
    charRef.current,
    { opacity: 0, y: 50 },
    { opacity: 1, y: 0, duration: 1, ease: 'bounce.out' },
    '-=0.4'
  );
}, []);
```

### 2. 搖擺效果 (Wobble) - 可愛風格

```tsx
useEffect(() => {
  const tl = gsap.timeline();
  
  // Logo 淡入後輕微搖擺
  tl.fromTo(
    logoRef.current,
    { opacity: 0, y: -20 },
    { opacity: 1, y: 0, duration: 0.6 }
  )
  .to(logoRef.current, {
    rotation: 5,
    duration: 0.3,
    yoyo: true,
    repeat: 3,
    ease: 'sine.inOut'
  })
  
  // 角色從下跳入
  .fromTo(
    charRef.current,
    { opacity: 0, y: 100 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'back.out(1.5)' },
    '-=0.6'
  );
}, []);
```

### 3. 循環呼吸動畫 (Pulse)

```tsx
useEffect(() => {
  const tl = gsap.timeline();
  
  // 初始動畫
  tl.fromTo(
    logoRef.current,
    { opacity: 0, y: -20 },
    { opacity: 1, y: 0, duration: 0.6, delay: 0.2 }
  )
  .fromTo(
    charRef.current,
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.8 },
    '-=0.3'
  );
  
  // Logo 持續脈動（等待載入時）
  gsap.to(logoRef.current, {
    scale: 1.05,
    duration: 1,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
    delay: 1
  });
}, []);
```

### 4. 視差效果 (Parallax)

針對背景、Logo、角色設定不同速度的移動：

```tsx
useEffect(() => {
  const tl = gsap.timeline();
  
  tl.fromTo(
    containerRef.current,
    { opacity: 0 },
    { opacity: 1, duration: 0.3 }
  )
  .fromTo(
    logoRef.current,
    { opacity: 0, y: -30 },
    { opacity: 1, y: 0, duration: 0.8 },
    0.2
  )
  .fromTo(
    charRef.current,
    { opacity: 0, y: 50 },
    { opacity: 1, y: 0, duration: 1 },
    0.4
  );
  
  // 滑鼠移動視差（可選）
  const handleMouseMove = (e: MouseEvent) => {
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    const offsetX = (clientX - centerX) / 50;
    const offsetY = (clientY - centerY) / 50;
    
    gsap.to(charRef.current, {
      x: offsetX,
      y: offsetY,
      duration: 0.5
    });
  };
  
  window.addEventListener('mousemove', handleMouseMove);
  
  return () => {
    tl.kill();
    window.removeEventListener('mousemove', handleMouseMove);
  };
}, []);
```

---

## 進階優化（可選）

### 1. 根據網路速度調整時長

```tsx
useEffect(() => {
  const connection = (navigator as any).connection;
  const effectiveType = connection?.effectiveType || '4g';
  
  // 慢速網路顯示久一點
  const duration = effectiveType.includes('2g') ? 3000 : 2000;
  
  const timer = setTimeout(() => {
    setShowSplash(false);
  }, duration);
  
  return () => clearTimeout(timer);
}, []);
```

### 2. GSAP 載入進度指示器

```tsx
export const SplashScreen = () => {
  const logoRef = useRef<HTMLImageElement>(null);
  const charRef = useRef<HTMLImageElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const tl = gsap.timeline();
    
    // 進度條動畫（0 -> 100%）
    tl.to(progressRef.current, {
      width: '100%',
      duration: 2,
      ease: 'power1.inOut'
    }, 0)
    
    // Logo 淡入
    .fromTo(
      logoRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6 },
      0.2
    )
    
    // 角色滑入
    .fromTo(
      charRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8 },
      0.5
    );
  }, []);
  
  return (
    <div className="...">
      {/* 背景、Logo、角色 */}
      
      {/* 進度條 */}
      <div className="absolute bottom-10 left-0 right-0 px-8">
        <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
          <div 
            ref={progressRef}
            className="h-full bg-white"
            style={{ width: '0%' }}
          />
        </div>
      </div>
    </div>
  );
};
```

### 3. 支援深色模式（若需要）

```tsx
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

<div className={isDark ? 'filter brightness-75' : ''}>
  <SplashScreen />
</div>
```

---

## 實作步驟

### 階段一：建立 SplashScreen 組件（15 分鐘）

1. [ ] 建立 `src/shared/components/SplashScreen.tsx`
2. [ ] 引入三個圖片資源
3. [ ] 實作基礎版面（背景 + Logo + 角色）
4. [ ] 加入動畫 CSS（fade-in、slide-up）

### 階段二：整合到 App.tsx（10 分鐘）

1. [ ] 修改 `src/App.tsx`
2. [ ] 加入 `showSplash` 狀態管理
3. [ ] 設定 2 秒後自動隱藏
4. [ ] 加入淡出動畫（可選）

### 階段三：測試與優化（15 分鐘）

1. [ ] 清除快取測試首次載入
2. [ ] 測試不同裝置尺寸
3. [ ] 檢查圖片載入速度
4. [ ] （可選）壓縮 char.png

---

## 驗證計畫

### 手動測試

#### 測試 1：Web 端首次載入

**步驟**：
1. 開啟瀏覽器開發者工具（F12）
2. Application > Storage > Clear site data
3. Network > Throttling 選擇「Fast 3G」
4. 重新整理頁面

**預期結果**：
- ✅ 頁面載入後顯示 SplashScreen
- ✅ 背景圖正確顯示（模糊廚房場景）
- ✅ Logo 在中央偏上，淡入動畫
- ✅ 角色群在底部，滑入動畫
- ✅ 2 秒後淡出並顯示主應用

#### 測試 2：動畫順序

**步驟**：
1. 清除快取
2. 仔細觀察動畫順序

**預期結果**：
- ✅ 背景先顯示
- ✅ Logo 延遲 0.2 秒淡入
- ✅ 角色延遲 0.4 秒滑入
- ✅ 動畫流暢，無卡頓

#### 測試 3：PWA 環境

**步驟**：
1. 安裝 PWA（Chrome > 安裝應用程式）
2. 關閉 PWA
3. 從桌面圖示啟動

**預期結果**：
- ✅ 先顯示系統 Splash Screen（約 1 秒）
- ✅ 接著顯示 React SplashScreen（2 秒）
- ✅ 過渡平滑

#### 測試 4：不同裝置尺寸

**步驟**：
1. 開啟開發者工具 > Device Toolbar（Ctrl+Shift+M）
2. 測試裝置：
   - iPhone 12 Pro (390x844)
   - iPad Pro (1024x1366)
   - Desktop (1920x1080)

**預期結果**：
- ✅ 所有尺寸下背景圖片正確顯示（無拉伸變形）
- ✅ Logo 與角色比例適當
- ✅ 內容置中，無溢出

#### 測試 5：圖片載入失敗情境

**步驟**：
1. Network > Offline 模式
2. 清除快取
3. 重新載入

**預期結果**：
- ✅ 圖片無法載入時顯示佔位符或純色背景
- ✅ 應用仍可正常啟動（不卡在 Splash Screen）

---

## 相關檔案

### 需新增
- `src/shared/components/SplashScreen.tsx` - 載入畫面組件

### 需修改
- `src/App.tsx` - 整合 SplashScreen
- `src/styles/index.css` - 加入動畫 CSS（或使用 Tailwind utilities）

### 設計資源（已存在）
- `src/assets/images/startup/bg.png` - 背景圖
- `src/assets/images/startup/char.png` - 角色圖
- `src/assets/images/startup/logo.png` - Logo 圖

---

## 注意事項

### 圖片資源

1. **檔案大小**：
   - `char.png` 較大（864 KB），建議壓縮
   - 可使用 TinyPNG 或轉為 WebP 格式

2. **載入策略**：
   - Vite 會自動處理圖片 import（hash 檔名、優化）
   - 可選擇預載入以避免首次顯示時空白

3. **響應式**：
   - 使用 `object-cover` 確保背景圖填滿螢幕
   - 角色與 Logo 使用 `max-w-[80%]` 避免過大

### 動畫效能

1. **使用 CSS 動畫**：
   - 比 JavaScript 動畫效能更好
   - GPU 加速（transform、opacity）

2. **避免過度複雜**：
   - 總動畫時長 < 2 秒
   - 使用 `ease-out` 緩動函數（更自然）

3. **動畫結束後移除元素**：
   - 確保 DOM 不會累積無用節點

### 可訪問性

1. **圖片 alt 文字**：
   ```tsx
   <img src={logoImage} alt="fufood 食物管家 Logo" />
   ```

2. **可跳過動畫**（針對有動畫偏好的使用者）：
   ```tsx
   const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   
   const duration = prefersReducedMotion ? 0 : 2000;
   ```

3. **載入狀態提示**：
   ```tsx
   <div role="status" aria-live="polite" aria-label="應用程式載入中">
     <SplashScreen />
   </div>
   ```

---

## 總結

**實作方案**：純 React 組件，整合設計稿資源

**核心優勢**：
- ✅ 不修改 `index.html`
- ✅ 完整使用設計稿資源
- ✅ 流暢的動畫效果
- ✅ 易於維護與擴展

**預估時間**：
- 基礎實作：30 分鐘
- 動畫優化：15 分鐘
- 測試調整：15 分鐘

**總計**：約 1 小時

**下一步**：
- 實作 `SplashScreen.tsx` 組件
- 整合到 `App.tsx`
- 測試與驗證
