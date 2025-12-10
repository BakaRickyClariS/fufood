import layoutADefault from '@/assets/images/inventory/layout-a-default.svg';
import layoutAActive from '@/assets/images/inventory/layout-a-active.svg';
import layoutBDefault from '@/assets/images/inventory/layout-b-default.svg';
import layoutBActive from '@/assets/images/inventory/layout-b-active.svg';
import layoutCDefault from '@/assets/images/inventory/layout-c-default.svg';
import layoutCActive from '@/assets/images/inventory/layout-c-active.svg';

export type LayoutType = 'layout-a' | 'layout-b' | 'layout-c';

export type LayoutConfig = {
  id: LayoutType;
  name: string;
  description?: string;
  imageDefault: string;
  imageActive: string;
};

export const LAYOUT_CONFIGS: LayoutConfig[] = [
  {
    id: 'layout-a',
    name: '版型一',
    description: '複雜混合佈局（預設）',
    imageDefault: layoutADefault,
    imageActive: layoutAActive,
  },
  {
    id: 'layout-b',
    name: '版型二',
    description: '平衡混合佈局',
    imageDefault: layoutBDefault,
    imageActive: layoutBActive,
  },
  {
    id: 'layout-c',
    name: '版型三',
    description: '重點強調佈局',
    imageDefault: layoutCDefault,
    imageActive: layoutCActive,
  },
];
