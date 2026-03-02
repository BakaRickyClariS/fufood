# Settings Module（設定模組）

## 目錄
- [概要](#概要)
- [目錄結構](#目錄結構)
- [核心功能](#核心功能)
- [型別](#型別)
- [API 規格](#api-規格)
- [Hooks](#hooks)

---

## 概要
負責應用程式的各項設定功能，包括個人檔案編輯、飲食喜好設定、會員方案檢視、推播通知設定等。

---

## 目錄結構
```
settings/
├── api/
│   ├── index.ts          # API Hook 導出
│   └── queries.ts        # TanStack Query Mutations (useUpdateProfileMutation)
├── components/           # UI 元件
│   ├── AvatarEditor.tsx
│   ├── ChipGroup.tsx
│   ├── DietaryPreferenceTags.tsx
│   ├── LogoutSection.tsx
│   ├── OtherSettingsList.tsx
│   ├── ProfileSection.tsx
│   ├── QuickActions.tsx
│   ├── SelectableChip.tsx
│   └── SimpleHeader.tsx
├── constants/
│   └── dietaryOptions.ts # 飲食喜好選項常數
├── types/
│   └── settings.types.ts # 型別定義 (re-export from auth)
└── index.ts
```

---

## 核心功能
1. **編輯個人檔案** (`EditProfile`)
   - 修改姓名、電話、性別
   - 上傳/更改頭像
2. **編輯飲食喜好** (`EditDietaryPreference`)
   - 設定烹飪頻率、備餐時間、調味強度
   - 設定特殊飲食限制 (多選)
3. **快捷功能**
   - 會員方案檢視
   - 購買紀錄
   - 推播通知設定
4. **登出**

---

## 型別
主要型別定義於 `auth` 模組，`settings` 模組透過 `settings.types.ts` 進行引用與擴充。
- `UserProfile`: 使用者個人資料介面
- `DietaryPreference`: 飲食喜好結構
  - `CookingFrequency`
  - `PrepTime`
  - `SeasoningLevel`
  - `DietaryRestriction`

---

## API 規格
主要使用 `auth` 模組提供的 API：
- `PUT /api/v1/auth/update-profile`: 更新個人檔案與飲食喜好

### Hooks
- `useUpdateProfileMutation`: 封裝了 `updateProfile` API 呼叫，成功後會更新 `GET_USER_PROFILE` 的快取資料。
