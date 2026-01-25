# Modal URL 路由系統架構

> 本文件記錄 FuFood 專案中使用 URL Query Params 控制 Modal 開關狀態的統一架構。

## 設計原則

1. **URL 驅動**: Modal 狀態反映在 URL 中，支援分享和書籤
2. **保持路徑**: 開關 Modal 只修改 query params，不改變當前路徑
3. **瀏覽器歷史**: 支援返回/前進按鈕正確操作
4. **全局渲染**: 透過 Provider 在 `MainLayout` 統一渲染，避免重複

---

## Provider 架構

```
ThemeProvider
  └── GroupModalProvider
        └── AIModalProvider
              └── RecipeModalProvider
                    └── App Content
                    └── GlobalGroupModals
                    └── AIQueryModal (Provider 內渲染)
                    └── RecipeDetailModal (Provider 內渲染)
```

---

## URL 結構總覽

| 模組          | URL Query Param     | 範例                                   |
| ------------- | ------------------- | -------------------------------------- |
| **Groups**    | `modal=groups-list` | `/?modal=groups-list`                  |
| **Groups**    | `modal=groups-home` | `/inventory?modal=groups-home`         |
| **AI**        | `modal=ai-query`    | `/planning?tab=recipes&modal=ai-query` |
| **Recipe**    | `recipe={id}`       | `/planning?tab=recipes&recipe=abc123`  |
| **Inventory** | `category={type}`   | `/inventory?category=frozen`           |
| **Inventory** | `item={id}`         | `/inventory?category=frozen&item=xyz`  |
| **Planning**  | `list={id}`         | `/planning?tab=planning&list=abc`      |
| **Settings**  | `modal={type}`      | `/settings?modal=subscription`         |

---

## 已實現的全局 Modal

### 1. GroupModalProvider

**檔案**: `src/modules/groups/providers/GroupModalProvider.tsx`

**控制的 Modal**:

- `HomeModal` - 群組首頁
- `GroupList` - 群組列表
- `GroupMembers` - 成員列表
- `GroupForm` - 新增/編輯群組
- `InviteFriendModal` - 邀請成員

**使用方式**:

```tsx
const { openSettings, openHome, closeAll } = useGroupModal();
openSettings(); // URL: ?modal=groups-list
```

---

### 2. AIModalProvider

**檔案**: `src/modules/ai/providers/AIModalProvider.tsx`

**控制的 Modal**:

- `AIQueryModal` - AI 食譜查詢

**使用方式**:

```tsx
const { openAIModal, closeAIModal } = useAIModal();
openAIModal({ initialQuery: '推薦食譜' }); // URL: ?modal=ai-query
```

**使用元件**:
| 元件 | 位置 |
|------|------|
| `AiRecommendCard` | Dashboard |
| `AISearchCard` | Planning 食譜 Tab |

---

### 3. RecipeModalProvider

**檔案**: `src/modules/recipe/providers/RecipeModalProvider.tsx`

**控制的 Modal**:

- `RecipeDetailModal` - 食譜詳情

**使用方式**:

```tsx
const { openRecipeModal, closeRecipeModal } = useRecipeModal();
openRecipeModal(recipe); // URL: ?recipe={recipeId}
```

**使用元件**:
| 元件 | 位置 |
|------|------|
| `RecipeSection` | Dashboard |
| `RecipeList` | Planning 食譜 Tab |

---

## 頁面級 Modal 控制

這些 Modal 在特定頁面內由該頁面的元件控制，使用 `useSearchParams`：

### Inventory 模組

**控制檔案**: `src/modules/inventory/components/layout/TabsSection.tsx`

| Modal             | Query Param       | 觸發元件                                                   |
| ----------------- | ----------------- | ---------------------------------------------------------- |
| `CategoryModal`   | `category={type}` | `OverviewPanel`                                            |
| `FoodDetailModal` | `item={id}`       | `CategoryModal`, `CommonItemsPanel`, `ExpiredRecordsPanel` |

---

### Planning 模組

**控制檔案**: `src/routes/Planning/PlanningHome.tsx`

| Modal             | Query Param           | 觸發元件             |
| ----------------- | --------------------- | -------------------- |
| `ListDetailModal` | `list={id}`           | `SharedPlanningList` |
| `ListEditModal`   | `list={id}&edit=true` | `ListDetailModal`    |
| `CreateListModal` | `create=true`         | FAB 按鈕             |

---

## 巢狀 Modal（尚未改造）

以下 Modal 在其他 Modal 內部使用，控制邏輯較複雜：

### 消耗相關

| Modal                        | 父層 Modal                               | 說明         |
| ---------------------------- | ---------------------------------------- | ------------ |
| `ConsumptionModal`           | `FoodDetailModal`, `RecipeDetailContent` | 消耗確認     |
| `ConsumptionSuccessModal`    | `ConsumptionModal`                       | 消耗成功     |
| `EditConsumptionReasonModal` | `ConsumptionModal`                       | 編輯消耗原因 |

> ⚠️ 這些 Modal 因為是巢狀結構，需要特殊處理才能改用 URL 控制。

---

## 實作指南

### 新增全局 Modal

1. 建立 Provider 檔案（參考 `AIModalProvider.tsx`）
2. 在 `MainLayout.tsx` 包裝 Provider
3. 更新使用元件，改用 hook

### 新增頁面級 Modal

1. 在頁面元件使用 `useSearchParams`
2. 透過 `setSearchParams` 控制開關
3. 傳遞 callback props 給子元件

---

## 相關檔案

| 檔案                                                   | 說明            |
| ------------------------------------------------------ | --------------- |
| `src/shared/components/layout/MainLayout.tsx`          | Provider 整合   |
| `src/modules/groups/providers/GroupModalProvider.tsx`  | 群組 Modal 控制 |
| `src/modules/groups/components/GlobalGroupModals.tsx`  | 群組 Modal 渲染 |
| `src/modules/ai/providers/AIModalProvider.tsx`         | AI Modal 控制   |
| `src/modules/recipe/providers/RecipeModalProvider.tsx` | 食譜 Modal 控制 |
