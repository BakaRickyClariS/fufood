/**
 * Inventory TanStack Query Hooks
 *
 * 提供庫存模組的快取和狀態管理
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from './index';
import type {
  GetInventoryRequest,
  AddFoodItemRequest,
  UpdateFoodItemRequest,
} from '../types';

// Query Keys
export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (params?: GetInventoryRequest) => [...inventoryKeys.lists(), params] as const,
  details: () => [...inventoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...inventoryKeys.details(), id] as const,
  summary: () => [...inventoryKeys.all, 'summary'] as const,
  categories: () => [...inventoryKeys.all, 'categories'] as const,
  settings: () => [...inventoryKeys.all, 'settings'] as const,
};

/**
 * 取得庫存列表
 */
export const useInventoryQuery = (params?: GetInventoryRequest) => {
  return useQuery({
    queryKey: inventoryKeys.list(params),
    queryFn: () => inventoryApi.getInventory(params),
    staleTime: 1000 * 60 * 5, // 5 分鐘
  });
};

/**
 * 取得單一食材詳情
 */
export const useInventoryItemQuery = (id: string) => {
  return useQuery({
    queryKey: inventoryKeys.detail(id),
    queryFn: () => inventoryApi.getItem(id),
    enabled: !!id,
  });
};

/**
 * 取得庫存摘要
 */
export const useInventorySummaryQuery = () => {
  return useQuery({
    queryKey: inventoryKeys.summary(),
    queryFn: () => inventoryApi.getSummary(),
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * 取得類別列表
 */
export const useInventoryCategoriesQuery = () => {
  return useQuery({
    queryKey: inventoryKeys.categories(),
    queryFn: () => inventoryApi.getCategories(),
    staleTime: 1000 * 60 * 30, // 30 分鐘（類別不常變動）
  });
};

/**
 * 取得庫存設定
 */
export const useInventorySettingsQuery = () => {
  return useQuery({
    queryKey: inventoryKeys.settings(),
    queryFn: () => inventoryApi.getSettings(),
  });
};

/**
 * 新增食材 Mutation
 */
export const useAddInventoryItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddFoodItemRequest) => inventoryApi.addItem(data),
    onSuccess: () => {
      // 使庫存列表和摘要失效，觸發重新取得
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.summary() });
    },
  });
};

/**
 * 更新食材 Mutation
 */
export const useUpdateInventoryItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFoodItemRequest }) =>
      inventoryApi.updateItem(id, data),
    onSuccess: (_, variables) => {
      // 使特定食材和列表失效
      queryClient.invalidateQueries({ queryKey: inventoryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
    },
  });
};

/**
 * 刪除食材 Mutation
 */
export const useDeleteInventoryItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inventoryApi.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.summary() });
    },
  });
};

/**
 * 更新庫存設定 Mutation
 */
export const useUpdateInventorySettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inventoryApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.settings() });
    },
  });
};
