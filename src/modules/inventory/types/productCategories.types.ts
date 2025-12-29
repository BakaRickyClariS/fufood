export const ProductCategory = {
  None: 0,
  Dairy: 1 << 0,
  Vegetable: 1 << 1,
  Fruit: 1 << 2,
  Meat: 1 << 3,
  Seafood: 1 << 4,
  Frozen: 1 << 5,
  Beverage: 1 << 6,
  Snack: 1 << 7,
  Prepared: 1 << 8,
  Condiment: 1 << 9,
} as const;
export type ProductCategory =
  (typeof ProductCategory)[keyof typeof ProductCategory];

export const ProductCategoryDisplayNames: Record<ProductCategory, string> = {
  [ProductCategory.None]: '其他',
  [ProductCategory.Dairy]: '乳製品',
  [ProductCategory.Vegetable]: '蔬菜類',
  [ProductCategory.Fruit]: '水果類',
  [ProductCategory.Meat]: '肉品類',
  [ProductCategory.Seafood]: '海鮮類',
  [ProductCategory.Frozen]: '冷凍食品',
  [ProductCategory.Beverage]: '乳品飲料類',
  [ProductCategory.Snack]: '點心類',
  [ProductCategory.Prepared]: '熟食類',
  [ProductCategory.Condiment]: '乾貨醬料類',
};

export const ProductCategoryApiNames: Record<ProductCategory, string> = {
  [ProductCategory.None]: 'None',
  [ProductCategory.Dairy]: 'Dairy',
  [ProductCategory.Vegetable]: 'Vegetable',
  [ProductCategory.Fruit]: 'Fruit',
  [ProductCategory.Meat]: 'Meat',
  [ProductCategory.Seafood]: 'Seafood',
  [ProductCategory.Frozen]: 'Frozen',
  [ProductCategory.Beverage]: 'Beverage',
  [ProductCategory.Snack]: 'Snack',
  [ProductCategory.Prepared]: 'Prepared',
  [ProductCategory.Condiment]: 'Condiment',
};

// 3 => ["乳製品", "蔬菜類"]
export function categoryToDisplayNames(value: ProductCategory): string[] {
  if (value === ProductCategory.None) {
    return [ProductCategoryDisplayNames[ProductCategory.None]];
  }
  const names = [];
  for (const flag of Object.values(ProductCategory)) {
    if (flag !== 0 && (value & flag) === flag) {
      names.push(ProductCategoryDisplayNames[flag]);
    }
  }
  return names;
}

// "Frozen,Beverage" => 32 | 64 => 96
export function apiNamesToEnum(value: string): ProductCategory {
  const segments = value.split(',');
  let sum: ProductCategory = 0;
  for (const segment of segments) {
    for (const flag of Object.values(ProductCategory)) {
      if (segment === ProductCategoryApiNames[flag]) {
        sum |= flag;
      }
    }
  }
  return sum;
}

export const ProductCategoryOptions = Object.values(ProductCategory).map(
  (v) => {
    return {
      label: ProductCategoryDisplayNames[v],
      value: ProductCategoryApiNames[v],
    };
  },
);
