import type { LayoutType } from '@/modules/inventory/types/layoutTypes';

export type LayoutPattern = {
  [key: string]: {
    w: number; // 幾欄 (1 or 2)
    h: number; // 幾行 (1 or 2)
  };
};

/**
 * 定義三種版型的具體佈局參數
 * w: 寬度 (occupies w columns)
 * h: 高度 (occupies h rows)
 * Grid 系統預設為 2 欄
 */
export const layoutPatterns: Record<LayoutType, LayoutPattern> = {
  // 版型一 (原始預設，複雜混合)
  'layout-a': {
    fruit: { w: 2, h: 1 },
    frozen: { w: 1, h: 2 },
    bake: { w: 1, h: 1 },
    milk: { w: 1, h: 1 },
    seafood: { w: 2, h: 1 },
    meat: { w: 1, h: 1 },
    others: { w: 1, h: 1 },
  },

  // 版型二 (平衡混合 - 更多 1x1, 減少 2x1)
  'layout-b': {
    fruit: { w: 1, h: 1 },
    frozen: { w: 1, h: 2 },
    bake: { w: 1, h: 2 },
    milk: { w: 1, h: 1 },
    seafood: { w: 1, h: 1 }, // 變更
    meat: { w: 1, h: 1 },
    others: { w: 2, h: 1 }, // 特殊強調其他
  },

  // 版型三 (視覺重點 - 強調冷凍與肉類)
  'layout-c': {
    fruit: { w: 1, h: 2 },
    frozen: { w: 1, h: 1 }, // 橫向強調
    bake: { w: 1, h: 1 },
    milk: { w: 2, h: 1 }, // 橫向強調
    seafood: { w: 1, h: 1 },
    meat: { w: 1, h: 2 }, // 直向強調
    others: { w: 1, h: 1 },
  },
};
