/**
 * 通用 Toast / Modal 文案常數
 * 風格參考 notifications_ui_upgrade_spec.md
 */
export const TOAST_MESSAGES = {
  SUCCESS: {
    // Modal 標題
    SAVE: '搞定！任務完成～',
    DELETE: '已清除！空間更清爽了',
    STOCK_IN: 'AI 辨識完成！食材已入庫',
    CONSUME: '消耗成功！',
    ADD_FAVORITE: '收入囊中！已加入收藏',
    REMOVE_FAVORITE: '好的～已取消收藏',
    INVITE_SENT: '邀請已飛出去！',
    LIST_CREATED: '新清單誕生！',
    LIST_DELETED: '清單已刪除',
    // Description (if needed)
    STOCK_IN_DESC: '剛買的食材已安全進入庫房，快去看看庫房！',
  },
  ERROR: {
    GENERIC: '哎呀，出了點狀況…請稍後再試',
    LOAD_FAILED: '資料讀取失敗，請重新整理頁面',
    SAVE_FAILED: '儲存失敗，再試一次吧！',
    DELETE_FAILED: '刪除失敗，請稍後再試',
    CREATE_FAILED: '建立失敗，請稍後再試',
    UPDATE_FAILED: '更新失敗，請稍後再試',
    DEMO_RECIPE: '範例食譜無法加入收藏，試試正式生成的食譜吧！',
  },
  INFO: {
    COPIED: '已複製到剪貼簿！',
  },
} as const;

export type ToastMessageKey = keyof typeof TOAST_MESSAGES;
