# 前端新手教學手動觸發實作規劃書

## 目標描述

在「設定」頁面新增「體驗新手教學」按鈕，讓使用者可以隨時手動重新啟動導覽流程。

## 建議更動

### [Store 層]

#### [修改] [useTourStore.ts](file:///d:/Work/Course/HexSchool/fufood/src/store/useTourStore.ts)

- 新增 `restartTour` 動作，將狀態重置並啟用：
  ```typescript
  restartTour: () => set({ isActive: true, currentStep: 'CREATE_GROUP' });
  ```

### [組件層]

#### [修改] [OtherSettingsList.tsx](file:///d:/Work/Course/HexSchool/fufood/src/modules/settings/components/OtherSettingsList.tsx)

- 在 `items` 陣列中新增「體驗新手教學」項目。
- 設定 key 為 `restart-tour`。

### [頁面層]

#### [修改] [SettingsPage.tsx](file:///d:/Work/Course/HexSchool/fufood/src/routes/Settings/SettingsPage.tsx)

- 在 `handleNavigate` 函式中加入判斷：
  ```typescript
  if (key === 'restart-tour') {
    const { restartTour } = useTourStore.getState();
    restartTour();
    navigate('/');
    return;
  }
  ```
- **開發測試優化**：在 `import.meta.env.DEV` 區塊新增一個快速切換教學狀態的按鈕。

## 驗證計畫

### 手動驗證

1. 進入設定頁 -> 其他。
2. 點擊「體驗新手教學」。
3. 確認頁面導航至首頁且 `react-joyride` 導覽正確開啟。
