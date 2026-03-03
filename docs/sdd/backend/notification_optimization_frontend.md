# FuFood 通知系統優化方案 - 前端實作規範

本文件基於專案內建 Skills (`react-ui-patterns`, `react-state-management`, `frontend-dev-guidelines`) 制定，確保通知系統的優化符合最高標準的現代 React 開發規範。

## 1. 架構與狀態管理 (State Management)

依據專案 `react-state-management` 與 `react-useeffect` 規範：

- **伺服器狀態 (Server State)**：嚴格使用 **TanStack Query (React Query)** 管理`/api/v2/notifications` 的列表獲取、輪詢 (Polling) 與背景靜默刷新。不應將 API 數據複製到 Local State (`useState`) 中。
- **全域 UI 狀態 (UI State)**：針對「通知抽屜 (Drawer) 的開關狀態」或「當前選中的通知 ID」，應使用 **Zustand** 或原生的 React Context 處理，避免 Props Drilling。

## 2. 元件切分與 UI 模式 (UI Patterns)

依據 `react-ui-patterns` 與 `clean-code` 原則，通知列表元件應具備高內聚力：

- `NotificationBell.tsx`: 僅負責顯示鈴鐺圖示與未讀紅點 (Badge)。依賴 React Query 的 `data.unreadCount`。
- `NotificationList.tsx`: 負責渲染虛擬滾動 (Virtual Scrolling) 列表與空狀態 (Empty State)。
- `NotificationItem.tsx`: 絕對無狀態 (Stateless) 的展示型元件，僅接收 `props.notification` 與 `props.onClick`。

### 2.1 UI 顯示矩陣與行為

| 種類 Enum       | 訊息範本 (由後端提供 Payload 渲染)             | 視覺呈現 (Icon / Color) | 點擊行為 (Deep Linking)         |
| :-------------- | :--------------------------------------------- | :---------------------- | :------------------------------ |
| `EXPIRY_URGENT` | 「{foodName}」將於 24 小時內過期，請儘速處理！ | ⚠️ Error (Red)          | `navigate('/inventory/detail')` |
| `STOCK_LOW`     | 庫存「{foodName}」過低，已加入購物清單。       | 🛒 Warning (Orange)     | `navigate('/shopping-lists')`   |
| `GROUP_INVITE`  | {actor} 邀請你加入他的冰箱群組。               | 👥 Info (Blue)          | 開啟加入確認 Modal              |

## 3. 即時通訊與副作用 (useEffect Best Practices)

依據 `react-useeffect` 規範，對於 Socket.io 的掛載：

- **切勿在 Component 內部直接 new Socket**。
- 應建立一個自定義 Hook `useNotificationSocket`。
- 在 `useEffect` 內部進行事件綁定，並**必定提供 cleanup function** 來 `off` 事件，防止記憶體洩漏 (Memory Leak)。

```typescript
// 遵循 Clean Code 的 Hook 範例
export const useNotificationSocket = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleNewNotification = (notification) => {
      // 樂觀更新 (Optimistic Update) 首頁未讀紅點
      queryClient.setQueryData(['notifications', 'summary'], (old) => ({
        ...old,
        unreadCount: old.unreadCount + 1,
      }));
      // 使列表失效，觸發背景背景重抓
      queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] });
    };

    socket.on('new_notification', handleNewNotification);
    return () => socket.off('new_notification', handleNewNotification); // Critical Cleanup
  }, [queryClient]);
};
```

## 4. 效能最佳化 (Vercel React Best Practices)

- **延遲載入 (Lazy Loading)**：通知列表與對應的抽屜 (Drawer) 元件應使用 `React.lazy` 動態載入，減少首屏載入時間 (Initial Bundle Size)。
- **批次處理 (Batching)**：「一鍵已讀」應使用 Mutation，並加上 `onError` 復原備用策略，達成流暢的 UX。
