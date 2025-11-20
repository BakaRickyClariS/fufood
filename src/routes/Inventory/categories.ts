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
};

export const categories: CategoryItem[] = [
  {
    id: 'fruit',
    title: '蔬果類 (92)',
    value: 92,
    img: fruitImg,
    bgColor: 'bg-[#D8EBC5]',
  },
  {
    id: 'frozen',
    title: '冷凍調理類 (252)',
    value: 252,
    img: frozenImg,
    bgColor: 'bg-[#FFE895]',
  },
  {
    id: 'bake',
    title: '主食烘焙類 (49)',
    value: 49,
    img: bakeImg,
    bgColor: 'bg-[#FFD6E3]',
  },
  {
    id: 'milk',
    title: '乳製品飲料類 (3)',
    value: 3,
    img: milkImg,
    bgColor: 'bg-[#DDF0FF]',
  },
  {
    id: 'seafood',
    title: '冷凍海鮮類 (20)',
    value: 20,
    img: seafoodImg,
    bgColor: 'bg-[#FFC5A4]',
  },
  {
    id: 'meat',
    title: '肉品類 (8)',
    value: 8,
    img: meatImg,
    bgColor: 'bg-[#FFD4D4]',
  },
  {
    id: 'others',
    title: '其他 (6)',
    value: 6,
    img: otherImg,
    bgColor: 'bg-[#E2E2E2]',
  },
];
