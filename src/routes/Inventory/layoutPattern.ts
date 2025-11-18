// src/data/layoutPattern.ts

export type LayoutPattern = {
  [key: string]: {
    w: number; // 幾欄
    h: number; // 幾行
  };
};

export const layoutPattern: LayoutPattern = {
  fruit: { w: 2, h: 1 },
  frozen: { w: 1, h: 2 },
  bake: { w: 1, h: 1 },
  milk: { w: 1, h: 1 },
  seafood: { w: 2, h: 1 },
  meat: { w: 1, h: 1 },
  others: { w: 1, h: 1 },
};
