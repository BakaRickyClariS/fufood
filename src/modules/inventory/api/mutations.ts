import { useMutation } from '@tanstack/react-query';
import { backendApi } from '@/api/client';
import type { UUID } from '@/api/types';
import type {
  InventoryTransaction,
  InventoryTransactionItem,
  InventoryTransactionItemParams,
} from '@/modules/inventory/types';

interface InventoryTransactionMutationResponse {
  data: InventoryTransaction;
}

export function createInventoryTransaction(refrigeratorId: UUID) {
  return backendApi.post<InventoryTransactionMutationResponse>(
    `/api/v1/refrigerators/${refrigeratorId}/inventory_transactions`,
  );
}

export function useCreateInventoryTransactionMutation() {
  return useMutation({
    mutationFn: createInventoryTransaction,
  });
}

export function commitInventoryTransaction(transactionId: UUID) {
  return backendApi.post<InventoryTransactionMutationResponse>(
    `/api/v1/inventory_transactions/${transactionId}/commit`,
  );
}

export function useCommitInventoryTransactionMutation() {
  return useMutation({
    mutationFn: commitInventoryTransaction,
  });
}

export interface CreateInventoryTransactionItemResponse {
  data: InventoryTransactionItem;
}

export interface CreateInventoryTransactionItemRequest {
  transactionId: UUID;
  params: InventoryTransactionItemParams;
}

export function createInventoryTransactionItem({
  transactionId,
  params,
}: CreateInventoryTransactionItemRequest) {
  return backendApi.post<CreateInventoryTransactionItemResponse>(
    `/api/v1/inventory_transactions/${transactionId}/items`,
    { body: params },
  );
}

export function useCreateInventoryTransactionItemMutation() {
  return useMutation({
    mutationFn: createInventoryTransactionItem,
  });
}
