# FuFood 冰箱群組 API 串接指南

> 冰箱群組管理、成員協作與邀請機制

---

## 目錄

1. [API 概述](#api-概述)
2. [列出所有冰箱群組](#列出所有冰箱群組)
3. [建立新冰箱](#建立新冰箱)
4. [取得單一冰箱資訊](#取得單一冰箱資訊)
5. [修改冰箱名稱](#修改冰箱名稱)
6. [刪除冰箱](#刪除冰箱)
7. [邀請與加入機制](#邀請與加入機制)
8. [退出與移除成員](#退出與移除成員)
9. [資料模型](#資料模型)
10. [錯誤處理](#錯誤處理)
11. [前端串接範例](#前端串接範例)

---

## API 概述

所有冰箱群組 API 都需要認證，請在 Header 加入：

```http
Authorization: Bearer <your_jwt_token>
```

**Base URL**: `/api/v1/refrigerators`

---

## 列出所有冰箱群組

取得目前使用者加入的所有冰箱群組（包含自己建立的）

```http
GET /api/v1/refrigerators
```

**回應範例** (`200`):

```json
{
  "data": [
    {
      "id": "019b30a4-6072-7ba1-8074-753094405f5d",
      "name": "我的冰箱",
      "colour": "blue",
      "qrCode": "ABC12345",
      "isDefault": true,
      "createdById": "019af809-7225-7d3b-b8f4-770e2c740e68"
    },
    {
      "id": "019b30a5-1234-7ba1-8074-753094405f6e",
      "name": "辦公室冰箱",
      "colour": "green",
      "qrCode": "XYZ98765",
      "isDefault": false,
      "createdById": "019af809-8888-7d3b-b8f4-770e2c740e99"
    }
  ]
}
```

**錯誤回應** (`401`):

```json
{
  "message": "未授權，請先登入"
}
```

---

## 建立新冰箱

建立新的冰箱群組，建立者自動成為擁有者與成員

```http
POST /api/v1/refrigerators
```

**請求 Body**:

```json
{
  "name": "家庭冰箱",
  "colour": "green"
}
```

**參數說明**:

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `name` | string | ✅ | 冰箱名稱 (1~10 字) |
| `colour` | string | ❌ | 冰箱顏色 |

**回應範例** (`201`):

```json
{
  "data": {
    "id": "019b30a4-6072-7ba1-8074-753094405f5d",
    "name": "家庭冰箱",
    "colour": "green",
    "qrCode": "XYZ98765",
    "isDefault": false
  }
}
```

**錯誤回應** (`400`):

```json
{
  "message": "名稱長度必須介於 1~10 個字"
}
```

---

## 取得單一冰箱資訊

```http
GET /api/v1/refrigerators/{id}
```

**路徑參數**:

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `id` | uuid | ✅ | 冰箱 ID |

**回應範例** (`200`):

```json
{
  "data": {
    "id": "019b30a4-6072-7ba1-8074-753094405f5d",
    "name": "我的冰箱",
    "colour": "blue",
    "qrCode": "ABC12345",
    "isDefault": true,
    "createdById": "019af809-7225-7d3b-b8f4-770e2c740e68",
    "createdAt": "2025-12-07T08:59:19Z",
    "updatedAt": "2025-12-07T08:59:19Z"
  }
}
```

**錯誤回應** (`404`):

```json
{
  "message": "找不到該冰箱或您沒有權限查看"
}
```

---

## 修改冰箱名稱

> ⚠️ **限制**：每 24 小時只能修改一次

```http
PUT /api/v1/refrigerators/{id}
```

**路徑參數**:

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `id` | uuid | ✅ | 冰箱 ID |

**請求 Body**:

```json
{
  "name": "新冰箱名稱"
}
```

**參數說明**:

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `name` | string | ✅ | 新冰箱名稱 (1~10 字) |

**回應範例** (`200`):

```json
{
  "data": {
    "id": "019b30a4-6072-7ba1-8074-753094405f5d",
    "name": "新冰箱名稱",
    "colour": "blue",
    "qrCode": "ABC12345",
    "isDefault": true
  }
}
```

**錯誤回應** (`400`):

```json
{
  "message": "修改群組名稱每 24 小時限一次"
}
```

---

## 刪除冰箱

> ⚠️ **限制**：預設冰箱不可刪除

```http
DELETE /api/v1/refrigerators/{id}
```

**路徑參數**:

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `id` | uuid | ✅ | 冰箱 ID |

**回應**: `204` 成功刪除（無回應內容）

**錯誤回應** (`400`):

```json
{
  "message": "預設冰箱不可刪除"
}
```

---

## 邀請與加入機制

### 取得冰箱邀請 QR Code

```http
GET /api/v1/refrigerators/{id}/qrcode
```

**路徑參數**:

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `id` | uuid | ✅ | 冰箱 ID |

**回應範例** (`200`):

```json
{
  "data": "ABC12345"
}
```

**錯誤回應** (`404`):

```json
{
  "message": "找不到該冰箱或您不是成員"
}
```

---

### 透過 QR Code 加入冰箱

> ⚠️ **人數限制**：Free 版 3 人，Pro 版 5 人

```http
POST /api/v1/refrigerators/join
```

**請求 Body**:

```json
{
  "qrCode": "ABC12345"
}
```

**參數說明**:

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `qrCode` | string | ✅ | 冰箱邀請碼 |

**回應範例** (`200`):

```json
{
  "message": "成功加入冰箱"
}
```

**錯誤回應** (`400`):

```json
{
  "message": "該冰箱成員人數已達上限"
}
```

---

## 退出與移除成員

### 退出冰箱群組

> ⚠️ **注意**：
> - 擁有者退出時必須指定新擁有者
> - 預設冰箱擁有者不可退出

```http
POST /api/v1/refrigerators/{id}/leave
```

**路徑參數**:

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `id` | uuid | ✅ | 冰箱 ID |

**請求 Body (一般成員)**:

```json
{}
```

**請求 Body (擁有者轉移)**:

```json
{
  "newOwnerId": "019af809-7225-7d3b-b8f4-770e2c740e68"
}
```

**參數說明**:

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `newOwnerId` | uuid | ❌ | 新擁有者 ID（擁有者退出時必填） |

**回應範例** (`200`):

```json
{
  "message": "成功退出冰箱"
}
```

**錯誤回應** (`400`):

```json
{
  "message": "預設冰箱的擁有者不可移除自己"
}
```

---

### 移除冰箱成員

> ⚠️ **權限**：只有擁有者可以移除其他成員

```http
DELETE /api/v1/refrigerators/{id}/members/{memberId}
```

**路徑參數**:

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `id` | uuid | ✅ | 冰箱 ID |
| `memberId` | uuid | ✅ | 要移除的成員 ID |

**回應範例** (`200`):

```json
{
  "message": "成功移除成員"
}
```

**錯誤回應** (`400`):

```json
{
  "message": "只有擁有者可以移除成員"
}
```

---

## 資料模型

### Refrigerator (冰箱)

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | uuid | 冰箱 ID |
| `name` | string | 冰箱名稱 (1~10 字) |
| `colour` | string | 冰箱顏色 |
| `qrCode` | string | 邀請碼 (8 位英數字) |
| `isDefault` | boolean | 是否為預設冰箱 |
| `createdById` | uuid | 建立者 ID |
| `createdAt` | datetime | 建立時間 |
| `updatedAt` | datetime | 更新時間 |

### 請求模型

#### RefrigeratorCreateRequest

```typescript
interface RefrigeratorCreateRequest {
  name: string;     // 必填，1~10 字
  colour?: string;  // 選填
}
```

#### RefrigeratorUpdateRequest

```typescript
interface RefrigeratorUpdateRequest {
  name: string;  // 必填，1~10 字
}
```

#### RefrigeratorJoinRequest

```typescript
interface RefrigeratorJoinRequest {
  qrCode: string;  // 必填
}
```

#### RefrigeratorLeaveRequest

```typescript
interface RefrigeratorLeaveRequest {
  newOwnerId?: string;  // 擁有者退出時必填
}
```

---

## 錯誤處理

### HTTP 狀態碼

| 狀態碼 | 說明 |
|--------|------|
| `200` | 成功 |
| `201` | 建立成功 |
| `204` | 成功（無回應內容） |
| `400` | 請求參數錯誤 / 業務邏輯錯誤 |
| `401` | 未授權，請先登入 |
| `404` | 找不到資源 / 沒有權限 |

### 冰箱群組常見錯誤

| 訊息 | 原因 | 處理建議 |
|------|------|----------|
| `名稱長度必須介於 1~10 個字` | 名稱驗證失敗 | 檢查名稱長度 |
| `修改群組名稱每 24 小時限一次` | 修改頻率限制 | 提示使用者稍後再試 |
| `預設冰箱不可刪除` | 嘗試刪除預設冰箱 | 隱藏預設冰箱的刪除按鈕 |
| `該冰箱成員人數已達上限` | 超過人數限制 | 提示升級或移除成員 |
| `只有擁有者可以移除成員` | 權限不足 | 隱藏非擁有者的移除按鈕 |
| `預設冰箱的擁有者不可移除自己` | 預設冰箱限制 | 提示使用者此為預設冰箱 |

---

## 前端串接範例

### 基礎 API 呼叫封裝

```javascript
const API_BASE = 'https://your-api-domain.com';

async function refrigeratorApi(endpoint, options = {}) {
  const token = localStorage.getItem('access_token');
  
  const response = await fetch(`${API_BASE}/api/v1/refrigerators${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || '請求失敗');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
```

### 冰箱群組 Service

```javascript
const RefrigeratorService = {
  // 取得所有冰箱
  async getAll() {
    const result = await refrigeratorApi('');
    return result.data;
  },

  // 取得單一冰箱
  async getById(id) {
    const result = await refrigeratorApi(`/${id}`);
    return result.data;
  },

  // 建立新冰箱
  async create(name, colour) {
    const result = await refrigeratorApi('', {
      method: 'POST',
      body: { name, colour }
    });
    return result.data;
  },

  // 修改冰箱名稱
  async updateName(id, name) {
    const result = await refrigeratorApi(`/${id}`, {
      method: 'PUT',
      body: { name }
    });
    return result.data;
  },

  // 刪除冰箱
  async delete(id) {
    await refrigeratorApi(`/${id}`, {
      method: 'DELETE'
    });
  },

  // 取得 QR Code
  async getQrCode(id) {
    const result = await refrigeratorApi(`/${id}/qrcode`);
    return result.data;
  },

  // 加入冰箱
  async join(qrCode) {
    const result = await refrigeratorApi('/join', {
      method: 'POST',
      body: { qrCode }
    });
    return result.message;
  },

  // 退出冰箱
  async leave(id, newOwnerId = null) {
    const body = newOwnerId ? { newOwnerId } : {};
    const result = await refrigeratorApi(`/${id}/leave`, {
      method: 'POST',
      body
    });
    return result.message;
  },

  // 移除成員
  async removeMember(fridgeId, memberId) {
    const result = await refrigeratorApi(`/${fridgeId}/members/${memberId}`, {
      method: 'DELETE'
    });
    return result.message;
  }
};
```

### React 使用範例

```jsx
import { useState, useEffect } from 'react';

function RefrigeratorList() {
  const [refrigerators, setRefrigerators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRefrigerators();
  }, []);

  async function loadRefrigerators() {
    try {
      setLoading(true);
      const data = await RefrigeratorService.getAll();
      setRefrigerators(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    const name = prompt('請輸入冰箱名稱 (1~10 字)');
    if (!name) return;

    try {
      await RefrigeratorService.create(name, 'blue');
      await loadRefrigerators();
      alert('建立成功！');
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id, isDefault) {
    if (isDefault) {
      alert('預設冰箱不可刪除');
      return;
    }

    if (!confirm('確定要刪除此冰箱？')) return;

    try {
      await RefrigeratorService.delete(id);
      await loadRefrigerators();
      alert('刪除成功！');
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) return <div>載入中...</div>;
  if (error) return <div>錯誤: {error}</div>;

  return (
    <div>
      <h1>我的冰箱</h1>
      <button onClick={handleCreate}>新增冰箱</button>
      
      <ul>
        {refrigerators.map(fridge => (
          <li key={fridge.id}>
            {fridge.name}
            {fridge.isDefault && ' (預設)'}
            <button onClick={() => handleDelete(fridge.id, fridge.isDefault)}>
              刪除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 注意事項

1. **預設冰箱**：每個使用者註冊時會自動建立一個預設冰箱，此冰箱不可刪除
2. **名稱限制**：冰箱名稱長度為 1~10 個字
3. **修改限制**：冰箱名稱每 24 小時只能修改一次
4. **人數限制**：Free 版最多 3 人，Pro 版最多 5 人
5. **擁有者權限**：只有擁有者可以移除其他成員
6. **UUID 格式**：所有 ID 欄位皆為 UUID 格式
