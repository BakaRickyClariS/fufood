// src/data/autoLayoutEngine.ts

import { categories } from '@/features/inventory/constants/categories';
import { layoutPattern } from '@/shared/constants/layoutPattern';

export function generateAutoLayout() {
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

  categories.forEach((item) => {
    const { w, h } = layoutPattern[item.id];
    const pos = findPosition(w, h);
    fill(pos.x, pos.y, w, h, item.id);
  });

  return grid;
}
