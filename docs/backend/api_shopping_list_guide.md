# FuFood 購物清單 API 串接指南

> 共享購物清單管理與清單項目操作

---

## 目錄

1. [API 概述](#api-概述)
2. [購物清單管理](#購物清單管理)
   - [列出所有購物清單](#列出所有購物清單)
   - [取得單一購物清單](#取得單一購物清單)
   - [建立購物清單](#建立購物清單)
   - [編輯購物清單](#編輯購物清單)
   - [刪除購物清單](#刪除購物清單)
3. [購物清單項目管理](#購物清單項目管理)
   - [列出清單項目](#列出清單項目)
   - [新增清單項目](#新增清單項目)
   - [編輯清單項目](#編輯清單項目)
   - [刪除清單項目](#刪除清單項目)
4. [資料模型](#資料模型)
5. [單位類型列表](#單位類型列表)
6. [錯誤處理](#錯誤處理)
7. [前端串接範例](#前端串接範例)

---

## API 概述

所有購物清單 API 都需要認證，請在 Header 加入：

```http
Authorization: Bearer <your_jwt_token>
```

**主要端點**:
- 購物清單: `/api/v1/refrigerators/{refrigeratorId}/shopping_lists`
- 單一清單: `/api/v1/shopping_lists/{shoppingListId}`
- 清單項目: `/api/v1/shopping_lists/{shoppingListId}/items`
- 單一項目: `/api/v1/shopping_list_items/{itemId}`

---

## 購物清單管理

### 列出所有購物清單

取得指定冰箱的所有共享購物清單

```http
GET /api/v1/refrigerators/{refrigeratorId}/shopping_lists
```

**路徑參數**:

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `refrigeratorId` | uuid | ✅ | 冰箱 ID |

**回應範例** (`200`):

```json
{
  "data": [
    {
      "id": "019b5610-1a1b-748d-966b-c16cd0d74c16",
      "title": "週末採購",
      "coverPhotoPath": "/images/grocery.jpg",
      "startsAt": "2025-12-30T09:00:00Z",
      "enableNotifications": true,
      "refrigeratorId": "019b30a4-6072-7ba1-8074-753094405f5d",
      "createdAt": "2025-12-27T10:00:00Z",
      "updatedAt": "2025-12-27T10:00:00Z"
    }
  ]
}
```

**錯誤回應** (`404`): 找不到冰箱或您沒有權限

---

### 取得單一購物清單

```http
GET /api/v1/shopping_lists/{shoppingListId}
```

**路徑參數**:

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `shoppingListId` | uuid | ✅ | 購物清單 ID |

**回應範例** (`200`):

```json
{
  "data": {
    "id": "019b5610-1a1b-748d-966b-c16cd0d74c16",
    "title": "週末採購",
    "coverPhotoPath": "/images/grocery.jpg",
    "startsAt": "2025-12-30T09:00:00Z",
    "enableNotifications": true,
    "refrigeratorId": "019b30a4-6072-7ba1-8074-753094405f5d",
    "createdAt": "2025-12-27T10:00:00Z",
    "updatedAt": "2025-12-27T10:00:00Z",
    "items": [
      {
        "id": "019b5611-2222-748d-966b-c16cd0d74c17",
        "name": "牛奶",
        "quantity": 2,
        "unit": "瓶",
        "photoPath": null,
        "creatorId": "019af809-7225-7d3b-b8f4-770e2c740e68"
      }
    ]
  }
}
```

---

### 建立購物清單

在指定冰箱建立新的共享購物清單

```http
POST /api/v1/refrigerators/{refrigeratorId}/shopping_lists
```

**路徑參數**:

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `refrigeratorId` | uuid | ✅ | 冰箱 ID |

**請求 Body**:

```json
{
  "title": "週末採購",
  "coverPhotoPath": "/images/grocery.jpg",
  "startsAt": "2025-12-30T09:00:00Z",
  "enableNotifications": true
}
```

**參數說明**:

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `title` | string | ✅ | 清單標題 (最多 10 字) |
| `coverPhotoPath` | string | ❌ | 封面圖片路徑 |
| `startsAt` | datetime | ✅ | 預定採購日期時間 |
| `enableNotifications` | boolean | ❌ | 是否啟用通知 (預設 false) |

**回應範例** (`200`):

```json
{
  "data": {
    "id": "019b5610-1a1b-748d-966b-c16cd0d74c16",
    "title": "週末採購",
    "coverPhotoPath": "/images/grocery.jpg",
    "startsAt": "2025-12-30T09:00:00Z",
    "enableNotifications": true,
    "refrigeratorId": "019b30a4-6072-7ba1-8074-753094405f5d",
    "createdAt": "2025-12-27T10:00:00Z",
    "updatedAt": "2025-12-27T10:00:00Z"
  }
}
```

---

### 編輯購物清單

```http
PUT /api/v1/shopping_lists/{shoppingListId}
```

**路徑參數**:

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `shoppingListId` | uuid | ✅ | 購物清單 ID |

**請求 Body**:

```json
{
  "title": "家庭採購",
  "coverPhotoPath": "/images/family.jpg",
  "startsAt": "2025-12-31T10:00:00Z",
  "enableNotifications": false
}
```

**參數說明**:

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `title` | string | ✅ | 清單標題 (最多 10 字) |
| `coverPhotoPath` | string | ❌ | 封面圖片路徑 |
| `startsAt` | datetime | ✅ | 預定採購日期時間 |
| `enableNotifications` | boolean | ❌ | 是否啟用通知 |

**回應範例** (`200`):

```json
{
  "data": {
    "id": "019b5610-1a1b-748d-966b-c16cd0d74c16",
    "title": "家庭採購",
    "coverPhotoPath": "/images/family.jpg",
    "startsAt": "2025-12-31T10:00:00Z",
    "enableNotifications": false,
    "updatedAt": "2025-12-28T15:00:00Z"
  }
}
```

---

### 刪除購物清單

```http
DELETE /api/v1/shopping_lists/{shoppingListId}
```

**路徑參數**:

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `shoppingListId` | uuid | ✅ | 購物清單 ID |

**回應**: `200` 刪除成功

---

## 購物清單項目管理

### 列出清單項目

取得指定購物清單的所有項目

```http
GET /api/v1/shopping_lists/{shoppingListId}/items
```

**路徑參數**:

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `shoppingListId` | uuid | ✅ | 購物清單 ID |

**回應範例** (`200`):

```json
{
  "data": [
    {
      "id": "019b5611-2222-748d-966b-c16cd0d74c17",
      "name": "牛奶",
      "quantity": 2,
      "unit": "瓶",
      "photoPath": null,
      "creatorId": "019af809-7225-7d3b-b8f4-770e2c740e68",
      "shoppingListId": "019b5610-1a1b-748d-966b-c16cd0d74c16",
      "createdAt": "2025-12-27T10:30:00Z",
      "updatedAt": "2025-12-27T10:30:00Z"
    },
    {
      "id": "019b5611-3333-748d-966b-c16cd0d74c18",
      "name": "雞蛋",
      "quantity": 1,
      "unit": "盒",
      "photoPath": "/images/eggs.jpg",
      "creatorId": "019af809-7225-7d3b-b8f4-770e2c740e68",
      "shoppingListId": "019b5610-1a1b-748d-966b-c16cd0d74c16",
      "createdAt": "2025-12-27T10:35:00Z",
      "updatedAt": "2025-12-27T10:35:00Z"
    }
  ]
}
```

---

### 新增清單項目

在指定購物清單新增項目

```http
POST /api/v1/shopping_lists/{shoppingListId}/items
```

**路徑參數**:

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `shoppingListId` | uuid | ✅ | 購物清單 ID |

**請求 Body**:

```json
{
  "name": "牛奶",
  "quantity": 2,
  "unit": "瓶",
  "photoPath": null
}
```

**參數說明**:

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `name` | string | ✅ | 項目名稱 (最多 20 字) |
| `quantity` | decimal | ❌ | 數量 (預設 1) |
| `unit` | string | ❌ | 單位類型 (見 [單位類型列表](#單位類型列表)) |
| `photoPath` | string | ❌ | 項目圖片路徑 |

**回應範例** (`200`):

```json
{
  "data": {
    "id": "019b5611-2222-748d-966b-c16cd0d74c17",
    "name": "牛奶",
    "quantity": 2,
    "unit": "瓶",
    "photoPath": null,
    "creatorId": "019af809-7225-7d3b-b8f4-770e2c740e68",
    "shoppingListId": "019b5610-1a1b-748d-966b-c16cd0d74c16",
    "createdAt": "2025-12-27T10:30:00Z",
    "updatedAt": "2025-12-27T10:30:00Z"
  }
}
```

---

### 編輯清單項目

```http
PUT /api/v1/shopping_list_items/{itemId}/
```

**路徑參數**:

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `itemId` | uuid | ✅ | 項目 ID |

**請求 Body**:

```json
{
  "name": "全脂牛奶",
  "quantity": 3,
  "unit": "瓶",
  "photoPath": "/images/milk.jpg"
}
```

**參數說明**:

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `name` | string | ✅ | 項目名稱 (最多 20 字) |
| `quantity` | decimal | ❌ | 數量 (預設 1) |
| `unit` | string | ❌ | 單位類型 |
| `photoPath` | string | ❌ | 項目圖片路徑 |

**回應**: `200` 更新成功

---

### 刪除清單項目

```http
DELETE /api/v1/shopping_list_items/{itemId}/
```

**路徑參數**:

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `itemId` | uuid | ✅ | 項目 ID |

**回應**: `200` 刪除成功

---

## 資料模型

### ShoppingList (購物清單)

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | uuid | 清單 ID |
| `title` | string | 清單標題 (最多 10 字) |
| `coverPhotoPath` | string | 封面圖片路徑 (可為 null) |
| `startsAt` | datetime | 預定採購日期時間 |
| `enableNotifications` | boolean | 是否啟用通知 |
| `refrigeratorId` | uuid | 所屬冰箱 ID |
| `createdAt` | datetime | 建立時間 |
| `updatedAt` | datetime | 更新時間 |
| `items` | array | 清單項目列表 (在取得單一清單時包含) |

### ShoppingListItem (購物清單項目)

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | uuid | 項目 ID |
| `name` | string | 項目名稱 (最多 20 字) |
| `quantity` | decimal | 數量 |
| `unit` | string | 單位類型 |
| `photoPath` | string | 項目圖片路徑 (可為 null) |
| `creatorId` | uuid | 建立者 ID |
| `shoppingListId` | uuid | 所屬清單 ID |
| `createdAt` | datetime | 建立時間 |
| `updatedAt` | datetime | 更新時間 |

---

## 單位類型列表

### 基本單位

| 值 | 說明 |
|-----|------|
| `個` | 個 |
| `件` | 件 |
| `包` | 包 |
| `盒` | 盒 |
| `箱` | 箱 |
| `袋` | 袋 |
| `條` | 條 |
| `片` | 片 |

### 飲品與容器

| 值 | 說明 |
|-----|------|
| `杯` | 杯 |
| `瓶` | 瓶 |
| `罐` | 罐 |
| `壺` | 壺 |
| `桶` | 桶 |
| `袋裝` | 袋裝 |

### 重量

| 值 | 說明 |
|-----|------|
| `公斤` | 公斤 (kg) |
| `公克` | 公克 (g) |
| `毫克` | 毫克 (mg) |

### 容量

| 值 | 說明 |
|-----|------|
| `公升` | 公升 (L) |
| `毫升` | 毫升 (mL) |

### 其他

| 值 | 說明 |
|-----|------|
| `把` | 把 |
| `塊` | 塊 |
| `粒` | 粒 |
| `顆` | 顆 |

---

## 錯誤處理

### HTTP 狀態碼

| 狀態碼 | 說明 |
|--------|------|
| `200` | 成功 |
| `401` | 未授權，請先登入 |
| `404` | 找不到資源 / 沒有權限 |

### 常見錯誤情境

| 情境 | 狀態碼 | 說明 |
|------|--------|------|
| 冰箱不存在 | `404` | 找不到指定的冰箱 |
| 沒有冰箱權限 | `404` | 使用者不是該冰箱成員 |
| 購物清單不存在 | `404` | 找不到指定的購物清單 |
| 項目不存在 | `404` | 找不到指定的清單項目 |

---

## 前端串接範例

### 基礎 API 封裝

```javascript
const API_BASE = 'https://your-api-domain.com';

async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('找不到資源或沒有權限');
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || '請求失敗');
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}
```

### 購物清單 Service

```javascript
const ShoppingListService = {
  // 取得冰箱的所有購物清單
  async getAll(refrigeratorId) {
    const result = await apiRequest(
      `/api/v1/refrigerators/${refrigeratorId}/shopping_lists`
    );
    return result.data;
  },

  // 取得單一購物清單
  async getById(shoppingListId) {
    const result = await apiRequest(
      `/api/v1/shopping_lists/${shoppingListId}`
    );
    return result.data;
  },

  // 建立購物清單
  async create(refrigeratorId, data) {
    const result = await apiRequest(
      `/api/v1/refrigerators/${refrigeratorId}/shopping_lists`,
      {
        method: 'POST',
        body: data
      }
    );
    return result.data;
  },

  // 更新購物清單
  async update(shoppingListId, data) {
    const result = await apiRequest(
      `/api/v1/shopping_lists/${shoppingListId}`,
      {
        method: 'PUT',
        body: data
      }
    );
    return result.data;
  },

  // 刪除購物清單
  async delete(shoppingListId) {
    await apiRequest(
      `/api/v1/shopping_lists/${shoppingListId}`,
      { method: 'DELETE' }
    );
  }
};
```

### 購物清單項目 Service

```javascript
const ShoppingListItemService = {
  // 取得清單項目
  async getAll(shoppingListId) {
    const result = await apiRequest(
      `/api/v1/shopping_lists/${shoppingListId}/items`
    );
    return result.data;
  },

  // 新增項目
  async create(shoppingListId, data) {
    const result = await apiRequest(
      `/api/v1/shopping_lists/${shoppingListId}/items`,
      {
        method: 'POST',
        body: data
      }
    );
    return result.data;
  },

  // 更新項目
  async update(itemId, data) {
    await apiRequest(
      `/api/v1/shopping_list_items/${itemId}/`,
      {
        method: 'PUT',
        body: data
      }
    );
  },

  // 刪除項目
  async delete(itemId) {
    await apiRequest(
      `/api/v1/shopping_list_items/${itemId}/`,
      { method: 'DELETE' }
    );
  }
};
```

### React 使用範例

```jsx
import { useState, useEffect } from 'react';

// 單位選項
const UNIT_OPTIONS = [
  { group: '基本', options: ['個', '件', '包', '盒', '箱', '袋', '條', '片'] },
  { group: '飲品與容器', options: ['杯', '瓶', '罐', '壺', '桶', '袋裝'] },
  { group: '重量', options: ['公斤', '公克', '毫克'] },
  { group: '容量', options: ['公升', '毫升'] },
  { group: '其他', options: ['把', '塊', '粒', '顆'] }
];

function ShoppingListPage({ refrigeratorId }) {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLists();
  }, [refrigeratorId]);

  async function loadLists() {
    try {
      setLoading(true);
      const data = await ShoppingListService.getAll(refrigeratorId);
      setLists(data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateList() {
    const title = prompt('請輸入清單名稱 (最多 10 字)');
    if (!title) return;

    try {
      await ShoppingListService.create(refrigeratorId, {
        title,
        startsAt: new Date().toISOString(),
        enableNotifications: false
      });
      await loadLists();
      alert('建立成功！');
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <div>載入中...</div>;

  return (
    <div>
      <h1>購物清單</h1>
      <button onClick={handleCreateList}>新增清單</button>
      
      <ul>
        {lists.map(list => (
          <li key={list.id}>
            <a href={`/shopping-lists/${list.id}`}>
              {list.title}
            </a>
            <span>預定採購: {new Date(list.startsAt).toLocaleDateString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ShoppingListItemsPage({ shoppingListId }) {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, unit: '個' });

  useEffect(() => {
    loadItems();
  }, [shoppingListId]);

  async function loadItems() {
    const data = await ShoppingListItemService.getAll(shoppingListId);
    setItems(data);
  }

  async function handleAddItem(e) {
    e.preventDefault();
    if (!newItem.name.trim()) return;

    try {
      await ShoppingListItemService.create(shoppingListId, newItem);
      setNewItem({ name: '', quantity: 1, unit: '個' });
      await loadItems();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDeleteItem(itemId) {
    if (!confirm('確定要刪除此項目？')) return;
    
    try {
      await ShoppingListItemService.delete(itemId);
      await loadItems();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <h2>清單項目</h2>
      
      {/* 新增項目表單 */}
      <form onSubmit={handleAddItem}>
        <input
          type="text"
          placeholder="項目名稱"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          maxLength={20}
        />
        <input
          type="number"
          value={newItem.quantity}
          onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) })}
          min={0}
          step={0.1}
        />
        <select
          value={newItem.unit}
          onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
        >
          {UNIT_OPTIONS.map(group => (
            <optgroup key={group.group} label={group.group}>
              {group.options.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <button type="submit">新增</button>
      </form>

      {/* 項目列表 */}
      <ul>
        {items.map(item => (
          <li key={item.id}>
            {item.name} - {item.quantity} {item.unit}
            <button onClick={() => handleDeleteItem(item.id)}>刪除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 注意事項

1. **認證必要**：所有 API 都需要登入後才能使用
2. **權限檢查**：只有該冰箱的成員才能存取相關購物清單
3. **字數限制**：清單標題最多 10 字，項目名稱最多 20 字
4. **UUID 格式**：所有 ID 欄位皆為 UUID 格式
5. **時間格式**：所有時間欄位皆為 ISO 8601 格式 (例: `2025-12-31T00:00:00Z`)
6. **數量類型**：quantity 為 decimal 類型，支援小數
