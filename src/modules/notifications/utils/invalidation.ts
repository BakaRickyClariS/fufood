import { QueryClient } from '@tanstack/react-query';
import { inventoryKeys } from '@/modules/inventory/api/queries';
import { notificationKeys } from '@/modules/notifications/api/queries';
// 假設其他 keys 已經定義，若無則使用字串
// import { recipeKeys } from '@/modules/recipe/api/queries';

/**
 * 根據通知類型刷新對應的 TanStack Query 快取
 *
 * @param queryClient QueryClient 實例
 * @param notificationData 通知的 data payload
 */
export const invalidateQueriesByNotification = async (
  queryClient: QueryClient,
  notificationData: any,
) => {
  const { type, subType } = notificationData || {};

  if (!type) return;

  console.log(
    `[Notification Refresh] 收到通知 type=${type}, subType=${subType}，開始刷新資料...`,
  );

  const keysToInvalidate: any[][] = [];

  // 1. 總是刷新通知列表
  keysToInvalidate.push([...notificationKeys.lists()]);

  // 2. 根據類型決定要刷新的業務資料
  switch (type) {
    case 'inventory':
      // 庫存變動：刷新庫存列表
      keysToInvalidate.push([...inventoryKeys.all]);
      break;

    case 'group':
      // 群組變動：刷新群組列表 (假設 key 為 ['groups'])
      keysToInvalidate.push(['groups']);
      // 刷新當前冰箱 (假設 key 為 ['activeRefrigerator'])
      keysToInvalidate.push(['activeRefrigerator']);
      break;

    case 'recipe':
      // 食譜變動：刷新食譜列表 (假設 key 為 ['recipes'])
      keysToInvalidate.push(['recipes']);
      break;

    case 'shopping_list':
      // 購物清單變動：刷新購物清單 (假設 key 為 ['shoppingLists'])
      keysToInvalidate.push(['shoppingLists']);
      break;

    default:
      break;
  }

  // 執行刷新
  await Promise.all(
    keysToInvalidate.map((key) =>
      queryClient.invalidateQueries({ queryKey: key }),
    ),
  );

  console.log(
    `[Notification Refresh] 已刷新 ${keysToInvalidate.length} 組 Queries`,
  );
};
