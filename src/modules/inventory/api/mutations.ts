import { useMutation } from '@tanstack/react-query';
import type { UUID } from '@/api/types';
import type { InventoryTransactionItemParams } from '@/modules/inventory/types';

export function createInventoryTransaction(_groupId: UUID) {
  // api/endpoints.ts no longer has TRANSACTIONS for v2
  return Promise.reject(new Error('Not implemented in v2'));
}

export function useCreateInventoryTransactionMutation() {
  return useMutation({
    mutationFn: createInventoryTransaction,
  });
}

export function commitInventoryTransaction(_transactionId: UUID) {
  return Promise.reject(new Error('Not implemented in v2'));
}

export function useCommitInventoryTransactionMutation() {
  return useMutation({
    mutationFn: commitInventoryTransaction,
  });
}

export interface CreateInventoryTransactionItemRequest {
  transactionId: UUID;
  params: InventoryTransactionItemParams;
}

export function createInventoryTransactionItem({
  transactionId: _transactionId,
  params: _params,
}: CreateInventoryTransactionItemRequest) {
  return Promise.reject(new Error('Not implemented in v2'));
}

export function useCreateInventoryTransactionItemMutation() {
  return useMutation({
    mutationFn: createInventoryTransactionItem,
  });
}
