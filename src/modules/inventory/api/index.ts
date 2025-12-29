import type { InventoryApi } from './inventoryApi';
import { createMockInventoryApi } from './mock/inventoryMockApi';
import { createInventoryApi } from './inventoryApiImpl';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

export const inventoryApi: InventoryApi = USE_MOCK
  ? createMockInventoryApi()
  : createInventoryApi();

export * from './inventoryApi';
export * from './queries';

