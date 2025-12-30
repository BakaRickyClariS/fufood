import type { InventoryApi } from './inventoryApi';
import { createMockInventoryApi } from './mock/inventoryMockApi';
import { createInventoryApi } from './inventoryApiImpl';
import { getInventoryBackend } from '../config';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';
const INVENTORY_BACKEND = getInventoryBackend();

// 根據配置選擇 API 實作
// 1. 若 USE_MOCK=true，使用 Mock API
// 2. 若 INVENTORY_BACKEND='main'，未來可切換至主後端（目前僅有 Transaction API）
// 3. 預設使用 AI 後端
export const inventoryApi: InventoryApi = USE_MOCK
  ? createMockInventoryApi()
  : createInventoryApi();

// Log current backend for debugging
if (import.meta.env.DEV) {
  console.info(
    `[Inventory] Backend: ${USE_MOCK ? 'mock' : INVENTORY_BACKEND}`,
  );
}

export * from './inventoryApi';
export * from './queries';

// 主後端 Transaction API (PR #84)
// 使用 backendApi，與 AI 後端的 CRUD API 獨立運作
export * from './mutations';
