export const UnitTypeEnum = {
  // 基本
  個: '個',
  件: '件',
  包: '包',
  盒: '盒',
  箱: '箱',
  袋: '袋',
  條: '條',
  片: '片',

  // 飲品與容器
  杯: '杯',
  瓶: '瓶',
  罐: '罐',
  壺: '壺',
  桶: '桶',
  袋裝: '袋裝',

  // 重量
  公斤: '公斤',
  公克: '公克',
  毫克: '毫克',

  // 容量
  公升: '公升',
  毫升: '毫升',

  // 其他
  把: '把',
  塊: '塊',
  粒: '粒',
  顆: '顆',
} as const;

export type UnitType = (typeof UnitTypeEnum)[keyof typeof UnitTypeEnum];
