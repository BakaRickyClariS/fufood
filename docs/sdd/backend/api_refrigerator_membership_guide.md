# 冰箱成員管理 API 串接指南

> RefrigeratorMembershipController：加入冰箱、退出冰箱、移除成員

---

## 目錄

1. [API 概述](#api-概述)
2. [透過邀請加入冰箱](#透過邀請加入冰箱)
3. [移除冰箱成員](#移除冰箱成員)
4. [退出冰箱群組](#退出冰箱群組)
5. [資料模型](#資料模型)
6. [錯誤處理](#錯誤處理)
7. [前端串接範例](#前端串接範例)
8. [完整使用流程](#完整使用流程)

---

## API 概述

本 Controller 管理冰箱群組的成員關係，包含：

- 使用邀請 Token 加入冰箱 (`POST /refrigerator_memberships`)
- 擁有者移除群內成員 (`DELETE /refrigerator/{id}/memberships/{memberId}`)
- 成員自行退出群組 (`DELETE /refrigerator/{id}/leave`)

所有 API 都需要認證，請在 Header 加入：

```http
Authorization: Bearer <your_jwt_token>
```

---

## 透過邀請加入冰箱

使用有效的邀請 Token 建立冰箱成員關係

```http
POST /api/v1/refrigerator_memberships
```

### 請求 Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### 請求 Body

```json
{
  "invitationToken": "abc123xyz789"
}
```

### 參數說明

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `invitationToken` | string | ✅ | 邀請 Token（從邀請連結取得） |

### 成功回應 (`200`)

```json
{
  "data": {
    "id": "019b30a4-6072-7ba1-8074-753094405f5d",
    "refrigeratorId": "019b30a4-6072-7ba1-8074-753094405f5d",
    "memberId": "019af809-7225-7d3b-b8f4-770e2c740e68",
    "createdAt": "2025-12-29T08:59:19Z",
    "updatedAt": "2025-12-29T08:59:19Z"
  }
}
```

### 回應欄位說明

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | uuid | 成員關係 ID |
| `refrigeratorId` | uuid | 加入的冰箱 ID |
| `memberId` | uuid | 成員的使用者 ID |
| `createdAt` | datetime | 加入時間 |
| `updatedAt` | datetime | 更新時間 |

### 錯誤回應 (`422`)

```json
{
  "message": "Invitation token is invalid or expired"
}
```

### 常見錯誤訊息

| 訊息 | 原因 |
|------|------|
| `Invitation token is invalid or expired` | Token 無效或已過期 |
| `您已經是該冰箱的成員` | 重複加入相同冰箱 |
| `該冰箱成員人數已達上限` | 超過冰箱人數限制 |

---

## 移除冰箱成員

> ⚠️ **權限限制**：只有冰箱擁有者可以移除成員

```http
DELETE /api/v1/refrigerator/{refrigeratorId}/memberships/{memberId}
```

### 路徑參數

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `refrigeratorId` | uuid | ✅ | 冰箱 ID |
| `memberId` | uuid | ✅ | 要移除的成員 ID |

### 請求 Headers

```http
Authorization: Bearer <jwt_token>
```

### 成功回應 (`204`)

無回應內容，代表成功移除成員

### 錯誤回應

**`403` Forbidden**

```http
HTTP/1.1 403 Forbidden
```

當您不是冰箱擁有者時會收到此回應

**`422` Unprocessable Entity**

```json
"You cannot remove yourself from a refrigerator you own."
```

擁有者不能透過此 API 移除自己

---

## 退出冰箱群組

群組內的成員可以自行退出群組

```http
DELETE /api/v1/refrigerator/{refrigeratorId}/leave
```

### 路徑參數

| 參數 | 類型 | 必填 | 說明 |
|------|------|------|------|
| `refrigeratorId` | uuid | ✅ | 要退出的冰箱 ID |

### 請求 Headers

```http
Authorization: Bearer <jwt_token>
```

### 成功回應 (`204`)

無回應內容，代表成功退出冰箱

### 錯誤回應 (`404`)

```http
HTTP/1.1 404 Not Found
```

當您不是該冰箱的成員時會收到此回應

---

## 資料模型

### RefrigeratorMembership (冰箱成員關係)

| 欄位 | 類型 | 說明 |
|------|------|------|
| `id` | uuid | 成員關係 ID |
| `refrigeratorId` | uuid | 冰箱 ID |
| `memberId` | uuid | 成員的使用者 ID |
| `createdAt` | datetime | 加入時間 |
| `updatedAt` | datetime | 更新時間 |

### RefrigeratorMembershipCreateRequest

```typescript
interface RefrigeratorMembershipCreateRequest {
  invitationToken: string;  // 必填，邀請 Token
}
```

---

## 錯誤處理

### HTTP 狀態碼

| 狀態碼 | 說明 |
|--------|------|
| `200` | 成功加入冰箱 |
| `204` | 成功移除/退出（無回應內容） |
| `403` | 權限不足（非擁有者無法移除成員） |
| `404` | 找不到冰箱或您不是成員 |
| `422` | 業務邏輯錯誤 |

### 錯誤處理建議

| 錯誤類型 | 前端處理建議 |
|----------|-------------|
| Token 無效或過期 | 提示使用者請邀請者重新產生連結 |
| 已是成員 | 直接導向該冰箱頁面 |
| 人數已達上限 | 提示冰箱已滿，無法加入 |
| 權限不足 | 隱藏非擁有者的移除按鈕 |
| 擁有者自我移除 | 提示需先轉移擁有權 |

---

## 前端串接範例

### 基礎 API 封裝

```javascript
const API_BASE = 'https://your-api-domain.com';

async function membershipApi(endpoint, options = {}) {
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
    if (response.status === 204) return null;
    
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      const error = await response.json();
      throw new Error(error.message || '請求失敗');
    }
    const text = await response.text();
    throw new Error(text || '請求失敗');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}
```

### MembershipService

```javascript
const MembershipService = {
  /**
   * 透過邀請 Token 加入冰箱
   * @param {string} invitationToken - 邀請 Token
   * @returns {Promise<Object>} 成員關係資料
   */
  async joinByInvitation(invitationToken) {
    const result = await membershipApi('/api/v1/refrigerator_memberships', {
      method: 'POST',
      body: { invitationToken }
    });
    return result.data;
  },

  /**
   * 移除冰箱成員（僅限擁有者）
   * @param {string} refrigeratorId - 冰箱 ID
   * @param {string} memberId - 要移除的成員 ID
   */
  async removeMember(refrigeratorId, memberId) {
    await membershipApi(
      `/api/v1/refrigerator/${refrigeratorId}/memberships/${memberId}`,
      { method: 'DELETE' }
    );
  },

  /**
   * 退出冰箱群組
   * @param {string} refrigeratorId - 要退出的冰箱 ID
   */
  async leaveRefrigerator(refrigeratorId) {
    await membershipApi(
      `/api/v1/refrigerator/${refrigeratorId}/leave`,
      { method: 'DELETE' }
    );
  }
};
```

### React 使用範例

#### 接受邀請加入冰箱

```jsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

function AcceptInvitationPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleAccept() {
    try {
      setLoading(true);
      setError(null);
      
      const membership = await MembershipService.joinByInvitation(token);
      
      alert('成功加入冰箱！');
      navigate(`/refrigerators/${membership.refrigeratorId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="accept-invitation">
      <h1>您被邀請加入冰箱</h1>
      
      {error && <div className="error">{error}</div>}
      
      <button 
        onClick={handleAccept} 
        disabled={loading}
      >
        {loading ? '加入中...' : '接受邀請'}
      </button>
    </div>
  );
}
```

#### 成員列表與管理

```jsx
import { useState } from 'react';

function MemberList({ refrigeratorId, members, isOwner, currentUserId, onUpdate }) {
  const [removing, setRemoving] = useState(null);

  async function handleRemove(memberId) {
    if (!confirm('確定要移除此成員？')) return;
    
    try {
      setRemoving(memberId);
      await MembershipService.removeMember(refrigeratorId, memberId);
      alert('成功移除成員');
      onUpdate();
    } catch (err) {
      alert(err.message);
    } finally {
      setRemoving(null);
    }
  }

  async function handleLeave() {
    if (!confirm('確定要退出此冰箱？')) return;
    
    try {
      await MembershipService.leaveRefrigerator(refrigeratorId);
      alert('已退出冰箱');
      window.location.href = '/refrigerators';
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="member-list">
      <h2>成員列表</h2>
      
      <ul>
        {members.map(member => (
          <li key={member.id}>
            <span>{member.name}</span>
            
            {/* 擁有者可以移除其他成員 */}
            {isOwner && member.id !== currentUserId && (
              <button 
                onClick={() => handleRemove(member.id)}
                disabled={removing === member.id}
              >
                {removing === member.id ? '移除中...' : '移除'}
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* 非擁有者可以退出 */}
      {!isOwner && (
        <button onClick={handleLeave} className="leave-btn">
          退出冰箱
        </button>
      )}
    </div>
  );
}
```

---

## 完整使用流程

```mermaid
flowchart TD
    subgraph 邀請流程
        A[擁有者產生邀請] --> B[POST /refrigerators/{id}/invitations]
        B --> C[取得 invitationToken]
        C --> D[分享連結給好友]
    end

    subgraph 加入流程
        D --> E[好友點擊連結]
        E --> F[GET /invitations/{token}]
        F --> G{Token 有效?}
        G -->|是| H[顯示邀請確認頁]
        G -->|否| I[顯示錯誤頁面]
        H --> J[POST /refrigerator_memberships]
        J --> K[成功加入冰箱]
    end

    subgraph 管理流程
        L[擁有者] --> M[DELETE /refrigerator/{id}/memberships/{memberId}]
        M --> N[成員被移除]
        
        O[一般成員] --> P[DELETE /refrigerator/{id}/leave]
        P --> Q[自行退出]
    end
```

### 流程說明

1. **邀請階段**
   - 冰箱擁有者呼叫邀請 API 取得 `invitationToken`
   - 將包含 Token 的連結分享給好友

2. **加入階段**
   - 被邀請者點擊連結，前端解析 Token
   - 呼叫驗證 API 確認邀請有效
   - 使用者確認後，呼叫 `POST /refrigerator_memberships` 正式加入

3. **管理階段**
   - 擁有者可透過 `DELETE /refrigerator/{id}/memberships/{memberId}` 移除成員
   - 一般成員可透過 `DELETE /refrigerator/{id}/leave` 自行退出

---

## 注意事項

> [!IMPORTANT]
> **登入要求**：所有成員管理 API 都需要 JWT Token，未登入使用者應先導向登入頁面

> [!WARNING]
> **擁有者限制**：擁有者無法透過移除成員 API 移除自己，若要退出需先轉移擁有權

> [!TIP]
> **UI 優化建議**：
> - 根據使用者角色（擁有者/成員）顯示不同按鈕
> - 擁有者不顯示「退出」按鈕，改顯示「轉移擁有權」
> - 非擁有者不顯示「移除成員」按鈕
