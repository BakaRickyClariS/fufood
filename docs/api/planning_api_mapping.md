# Planning Module API Mapping

**版本**: v1.0  
**最後更新**: 2025-12-28  
**關聯模組**: `src/modules/planning`

---

## 概述

本文件記錄 Planning 模組前端與後端 API 的對應關係，包含實作狀態與前端呼叫位置。

---

## API 對應表

### Shopping Lists (購物清單)

| # | API Path | Method | 前端實作位置 | 狀態 |
|---|----------|--------|-------------|------|
| 1 | `/api/v1/shopping-lists` | GET | `sharedListApi.getSharedLists()` | ✅ |
| 2 | `/api/v1/shopping-lists` | POST | `sharedListApi.createSharedList()` | ✅ |
| 3 | `/api/v1/shopping-lists/{id}` | GET | `sharedListApi.getSharedListById()` | ✅ |
| 4 | `/api/v1/shopping-lists/{id}` | PATCH | — | 🔜 待實作 |
| 5 | `/api/v1/shopping-lists/{id}` | DELETE | `sharedListApi.deleteSharedList()` | ✅ |

### Posts (貼文)

| # | API Path | Method | 前端實作位置 | 狀態 |
|---|----------|--------|-------------|------|
| 6 | `/api/v1/shopping-lists/{id}/posts` | GET | `sharedListApi.getPosts()` | ✅ |
| 7 | `/api/v1/shopping-lists/{id}/posts` | POST | `sharedListApi.createPost()` | ✅ |
| 8 | `/api/v1/posts/{postId}` | PUT | `sharedListApi.updatePost()` | ✅ |
| 9 | `/api/v1/posts/{postId}` | DELETE | `sharedListApi.deletePost()` | ✅ |

---

## 前端 Hook 與 API 對應

| Hook | 呼叫的 API | 說明 |
|------|-----------|------|
| `useSharedLists` | #1, #2, #5 | 清單列表 CRUD |
| `useSharedListDetail` | #3 | 單一清單詳情 |
| `usePosts` | #6, #7, #8, #9 | 貼文 CRUD |

---

## 待實作項目

1. **清單編輯 (PATCH #4)**: 需實作 `sharedListApi.updateSharedList()` 並在 `useSharedLists` 新增 `updateList()` 方法
2. **清單狀態變更**: 透過 PATCH API 將狀態從 `in-progress` 變更為 `completed`

---

## 相關文件

- [後端 API 規格](file:///d:/User/Ricky/HexSchool/finalProject/fufood/docs/backend/shopping_lists_api_spec.md)
- [模組 README](file:///d:/User/Ricky/HexSchool/finalProject/fufood/src/modules/planning/README.md)
