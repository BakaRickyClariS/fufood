import { useMutation } from '@tanstack/react-query';
import { api } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
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
  return api.post<InventoryTransactionMutationResponse>(
    ENDPOINTS.INVENTORY.TRANSACTIONS.CREATE(refrigeratorId),
  );
}

export function useCreateInventoryTransactionMutation() {
  return useMutation({
    mutationFn: createInventoryTransaction,
  });
}

export function commitInventoryTransaction(transactionId: UUID) {
  return api.post<InventoryTransactionMutationResponse>(
    ENDPOINTS.INVENTORY.TRANSACTIONS.COMMIT(transactionId),
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
  return api.post<CreateInventoryTransactionItemResponse>(
    ENDPOINTS.INVENTORY.TRANSACTIONS.ITEMS(transactionId),
    params,
  );
}

export function useCreateInventoryTransactionItemMutation() {
  return useMutation({
    mutationFn: createInventoryTransactionItem,
  });
}
