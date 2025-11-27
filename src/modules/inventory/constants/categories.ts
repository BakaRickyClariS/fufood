// src/data/categories.ts

import fruitImg from '@/assets/images/inventory/fruit.png';
import frozenImg from '@/assets/images/inventory/frozen.png';
import bakeImg from '@/assets/images/inventory/bake.png';
import milkImg from '@/assets/images/inventory/milk.png';
import seafoodImg from '@/assets/images/inventory/seafood.png';
import meatImg from '@/assets/images/inventory/meat.png';
import otherImg from '@/assets/images/inventory/other.png';

export type CategoryItem = {
  id: string;
  title: string;
  value: number;
  img: string;
  bgColor: string;
  slogan: string;
  description: string[];
};

export const categories: CategoryItem[] = [
  {
    id: 'fruit',
    title: '蔬果類 (92)',
    value: 92,
    img: fruitImg,
    bgColor: 'bg-[#D8EBC5]',
    slogan: '新鮮採摘，即時掌握狀態',
    description: ['各種葉菜類、根莖類、', '瓜果類、新鮮菇類、水果'],
  },
  {
    id: 'frozen',
    title: '冷凍調理類 (252)',
    value: 252,
    img: frozenImg,
    bgColor: 'bg-[#FFE895]',
    slogan: '懶人救星，備品狀況一目瞭然',
    description: ['各種冷凍調理包、', '加熱即食餐、冷凍甜點'],
  },
  {
    id: 'bake',
    title: '主食烘焙類 (49)',
    value: 49,
    img: bakeImg,
    bgColor: 'bg-[#FFD6E3]',
    slogan: '麵飯糧倉，存貨輕鬆盤點',
    description: ['冷藏保存的米飯、麵條、', '麵包、堅果、乾貨'],
  },
  {
    id: 'milk',
    title: '乳製品飲料類 (3)',
    value: 3,
    img: milkImg,
    bgColor: 'bg-[#DDF0FF]',
    slogan: '乳品飲料類',
    description: [
      '各種蛋類、鮮奶、優格、奶油',
      '各式起司、果汁、茶飲',
      '飲、啤酒、氣泡水',
    ],
  },
  {
    id: 'seafood',
    title: '冷凍海鮮類 (20)',
    value: 20,
    img: seafoodImg,
    bgColor: 'bg-[#FFC5A4]',
    slogan: '大海珍味，鎖住鮮甜隨時上桌',
    description: ['各種魚肉、甲殼類、貝類、', '加工製品（魚漿、魚丸）'],
  },
  {
    id: 'meat',
    title: '肉品類 (8)',
    value: 8,
    img: meatImg,
    bgColor: 'bg-[#FFD4D4]',
    slogan: '優質蛋白，肉類管理不遺漏',
    description: ['各種豬肉類、牛肉類、', '雞肉類、加工肉品'],
  },
  {
    id: 'others',
    title: '其他 (6)',
    value: 6,
    img: otherImg,
    bgColor: 'bg-[#E2E2E2]',
    slogan: '風味秘寶，缺漏一鍵補齊',
    description: [
      '各種調味醬、果醬、乾燥海',
      '味/菇類/果乾、油品與堅',
      '果、醃製品',
    ],
  },
];
