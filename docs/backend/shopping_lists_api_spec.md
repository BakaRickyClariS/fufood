# Shopping Lists Module API Specification

**版本**: v1.0  
**涵蓋範圍**: 購物清單 CRUD、購買完成、貼文牆（posts/like）

---

## 1. 基本規範
- Base URL: `/api/v1`
- 需帶 Access Token
- 標準回應與錯誤同 `auth_api_spec.md`

---

## 2. 資料模型

### 2.1 ShoppingList
```typescript
type ShoppingList = {
  id: string;
  name: string;
  scheduledDate?: string;
  status?: 'in-progress' | 'pending-purchase' | 'completed';
  items: ShoppingListItem[];
  createdAt: string;
  updatedAt?: string;
};
```

### 2.2 ShoppingListItem
```typescript
type ShoppingListItem = {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  checked?: boolean;
};
```

### 2.3 SharedListPost
```typescript
type SharedListPost = {
  id: string;
  listId: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  images: string[];
  items: ShoppingListItem[];
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
};
```

---

## 3. Shopping Lists API

### 3.1 取得清單列表
- **GET** `/shopping-lists`
- Query: `year?`, `month?`
- 200 → `ShoppingList[]`

### 3.2 建立清單
- **POST** `/shopping-lists`
- Body: `{ name, items?, scheduledDate? }`
- 201 → `ShoppingList`

### 3.3 取得清單詳情
- **GET** `/shopping-lists/{id}`
- 200 → `ShoppingList`

### 3.4 更新清單
- **PUT** `/shopping-lists/{id}`
- Body: `Partial<ShoppingList>`（含 items）
- 200 → `ShoppingList`

### 3.5 刪除清單
- **DELETE** `/shopping-lists/{id}`
- 204 或 `{ success: true }`

### 3.6 標記購買完成
- **POST** `/shopping-lists/{id}/purchase`
- 200 → `{ success: true }`（可附上更新庫存結果）

---

## 4. 貼文牆 API（已實作）

### 4.1 取得貼文列表
- **GET** `/shopping-lists/{id}/posts`
- 200 → `SharedListPost[]`

### 4.2 建立貼文
- **POST** `/shopping-lists/{id}/posts`
- Body: `{ content, images?, items? }`
- 201 → `SharedListPost`

### 4.3 貼文按讚切換
- **POST** `/posts/{postId}/like`
- Body: `{ listId }`
- 200 → `SharedListPost`（更新後的狀態）

### 4.4 留言（規劃中）
- **POST** `/posts/{postId}/comments`
- Body: `{ content }`
- 201 → `{ id, content, author, createdAt }`
