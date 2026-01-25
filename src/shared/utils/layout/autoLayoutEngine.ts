// src/data/autoLayoutEngine.ts

import { categories } from '@/modules/inventory/constants/categories';
import { layoutPatterns } from '@/shared/constants/layoutPatterns';
import type { LayoutType } from '@/modules/inventory/types/layoutTypes';

export function generateAutoLayout(layoutType: LayoutType = 'layout-a') {
  const COLUMN_COUNT = 2; // 兩欄
  const grid: string[][] = [];

  const ensureRow = (y: number) => {
    while (grid.length <= y) {
      grid.push(Array(COLUMN_COUNT).fill(''));
    }
  };

  const findPosition = (w: number, h: number) => {
    let y = 0;

    while (true) {
      ensureRow(y + h - 1);

      for (let x = 0; x < COLUMN_COUNT; x++) {
        if (x + w > COLUMN_COUNT) continue;

        let fits = true;

        for (let dy = 0; dy < h; dy++) {
          for (let dx = 0; dx < w; dx++) {
            if (grid[y + dy][x + dx] !== '') {
              fits = false;
              break;
            }
          }
          if (!fits) break;
        }

        if (fits) return { x, y };
      }

      y++;
    }
  };

  const fill = (x: number, y: number, w: number, h: number, id: string) => {
    for (let dy = 0; dy < h; dy++) {
      ensureRow(y + dy);
      for (let dx = 0; dx < w; dx++) {
        grid[y + dy][x + dx] = id;
      }
    }
  };

  const currentPattern = layoutPatterns[layoutType];

  categories.forEach((item) => {
    const pattern = currentPattern[item.id] || { w: 1, h: 1 }; // Default fallback
    const { w, h } = pattern;
    const pos = findPosition(w, h);
    fill(pos.x, pos.y, w, h, item.id);
  });

  return grid;
}
