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
  UpdateInventorySettingsRequest,
} from '../types';

// Query Keys
export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (params?: GetInventoryRequest) =>
    [...inventoryKeys.lists(), params] as const,
  details: () => [...inventoryKeys.all, 'detail'] as const,
  detail: (id: string, groupId?: string) =>
    [...inventoryKeys.details(), id, groupId] as const,
  summary: (groupId?: string) =>
    [...inventoryKeys.all, 'summary', groupId] as const,
  categories: (groupId?: string) =>
    [...inventoryKeys.all, 'categories', groupId] as const,
  settings: (groupId?: string) =>
    [...inventoryKeys.all, 'settings', groupId] as const,
};

/**
 * 取得庫存列表
 */
export const useInventoryQuery = (params?: GetInventoryRequest) => {
  return useQuery({
    queryKey: inventoryKeys.list(params),
    queryFn: () => inventoryApi.getInventory(params),
    enabled: !!params?.groupId, // 確保有 ID 才查詢
    staleTime: 1000 * 60 * 5, // 5 分鐘
  });
};

/**
 * 取得單一食材詳情
 */
export const useInventoryItemQuery = (id: string, groupId?: string) => {
  return useQuery({
    queryKey: inventoryKeys.detail(id, groupId),
    queryFn: () => inventoryApi.getItem(id, groupId),
    enabled: !!id && !!groupId, // 確保有 ID 才查詢
  });
};

/**
 * 取得庫存摘要
 */
export const useInventorySummaryQuery = (groupId?: string) => {
  return useQuery({
    queryKey: inventoryKeys.summary(groupId),
    queryFn: () => inventoryApi.getSummary(groupId),
    enabled: !!groupId, // 確保有 ID 才查詢
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * 取得類別列表
 */
export const useInventoryCategoriesQuery = (groupId?: string) => {
  return useQuery({
    queryKey: inventoryKeys.categories(groupId),
    queryFn: () => inventoryApi.getCategories(groupId),
    enabled: !!groupId, // 確保有 ID 才查詢
    staleTime: 1000 * 60 * 30, // 30 分鐘（類別不常變動）
  });
};

/**
 * 取得庫存設定
 */
export const useInventorySettingsQuery = (groupId?: string) => {
  return useQuery({
    queryKey: inventoryKeys.settings(groupId),
    queryFn: () => inventoryApi.getSettings(groupId),
    enabled: !!groupId, // 確保有 ID 才查詢
  });
};

/**
 * 新增食材 Mutation
 */
export const useAddInventoryItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddFoodItemRequest) =>
      inventoryApi.addItem(data, data.groupId),
    onSuccess: (_, variables) => {
      // 使庫存列表和摘要失效，觸發重新取得
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.summary(variables.groupId),
      });
    },
  });
};

/**
 * 更新食材 Mutation
 */
export const useUpdateInventoryItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
      groupId,
    }: {
      id: string;
      data: UpdateFoodItemRequest;
      groupId?: string;
    }) => inventoryApi.updateItem(id, data, groupId),
    onSuccess: (_, variables) => {
      // 使特定食材和列表失效
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.detail(variables.id, variables.groupId),
      });
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
    mutationFn: ({ id, groupId }: { id: string; groupId?: string }) =>
      inventoryApi.deleteItem(id, groupId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.summary(variables.groupId),
      });
    },
  });
};

/**
 * 批次刪除食材 Mutation
 */
export const useBatchDeleteInventoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, groupId }: { ids: string[]; groupId?: string }) =>
      inventoryApi.batchDelete({ ids }, groupId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.summary(variables.groupId),
      });
    },
  });
};

/**
 * 更新庫存設定 Mutation
 */
export const useUpdateInventorySettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      groupId,
    }: {
      data: UpdateInventorySettingsRequest;
      groupId?: string;
    }) => inventoryApi.updateSettings(data, groupId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.settings(variables.groupId),
      });
    },
  });
};

/**
 * 消耗食材 Mutation
 */
export const useConsumeItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
      groupId,
    }: {
      id: string;
      data: { quantity: number; reasons: string[]; customReason?: string };
      groupId?: string;
    }) => inventoryApi.consumeItem(id, data, groupId),
    onSuccess: (_, variables) => {
      // 使特定食材和列表失效
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.detail(variables.id, variables.groupId),
      });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.summary(variables.groupId),
      });
    },
  });
};
