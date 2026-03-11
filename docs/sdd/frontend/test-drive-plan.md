# 前端體驗流程實作規劃書 (Test Drive Flow - Frontend Plan)

## 1. 導覽狀態管理架構

採用 `Zustand` 搭配 `persist` middleware，確保持續記錄使用者的跨頁面流程進度。

### 狀態設計 (`src/stores/useTourStore.ts`)

```typescript
type TourStep =
  | 'LOGIN'
  | 'CREATE_GROUP'
  | 'PROFILE'
  | 'AI_SCAN'
  | 'INVENTORY_WARNING'
  | 'RECIPE_SYNC'
  | 'COMPLETED';

interface TourState {
  isActive: boolean;
  currentStep: TourStep;
  startTour: () => void;
  setStep: (step: TourStep) => void;
  finishTour: () => void;
}
```

## 2. 核心導覽元件 (Tour Provider)

引入 `react-joyride` 作為核心 UI 導覽氣泡庫，封裝成 `<AppTourProvider />` 掛載於 App 根目錄，並透過 `currentStep` 派發對應的 Steps。

### Steps 配置範例

- **CREATE_GROUP**:
  - `target: '.tour-step-create-group'` -> 「點擊這裡建立群組：fufu home」
- **AI_SCAN**:
  - `target: '.tour-step-camera-btn'` -> 「點擊相機，體驗 AI 辨識食材」
- **INVENTORY_WARNING**:
  - `target: '.tour-step-expire-item'` -> 「注意即期品的顏色變化！」
  - `target: '.tour-step-ai-recipe'` -> 「✨ 尋找專屬食譜靈感」

## 3. 各階段實作細節與攔截點

### 階段一：登入與建立家庭群組 (Home & Group Pages)

- **攔截點**：監聽建立群組 API (`useCreateGroupMutation`) 的 `onSuccess`。
- **動作**：成功後自動呼叫 `setStep('PROFILE')`。

### 階段二：個人頁與會員中心 (Profile Page)

- **攔截點**：監聽註冊/更新基本資料的 `onSuccess`。
- **動作**：導引至相機。成功後 `setStep('AI_SCAN')`。

### 階段三：體驗 AI 智慧掃描入庫 (Camera/Scanner Page)

- **攔截點**：監聽 AI 辨識並確認入庫的 API (`useAddInventoryMutation`) 的 `onSuccess`。
- **動作**：自動跳轉 `/inventory` 並 `setStep('INVENTORY_WARNING')`。

### 階段四：庫存警報與靈感救援 (Inventory Page)

- **UI 綁定**：確保假資料（即將過期項目）的 DOM 綁定 `.tour-step-expire-item`。
- **攔截點**：使用者點擊「尋找食譜」進入食譜頁。
- **動作**：`setStep('RECIPE_SYNC')`

### 階段五：採買同步與即時通知 (Recipe & Shopping List)

- **攔截點**：點擊「加入待買清單」成功後。
- **動作**：提示可前往「規劃中心」查看與「通知頁」檢查，接著呼叫 `finishTour()` 且打後端 API 完成進度。

## 4. 防呆與重置機制

- 提供使用者「跳過導覽 (Skip)」按鈕，點擊後直接打 API 結案導覽。
- 路由保護：導覽進行中，如果不小心跳離頁面，依賴 `useTourStore` 可在重整後回到該步驟。
