import type { InventoryApi } from './inventoryApi';
import { createMockInventoryApi } from './mock/inventoryMockApi';
import { createRealInventoryApi } from './inventoryRealApi';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

export const inventoryApi: InventoryApi = USE_MOCK 
  ? createMockInventoryApi() 
  : createRealInventoryApi();

export * from './inventoryApi';
