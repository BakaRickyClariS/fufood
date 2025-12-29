/**
 * refrigeratorId 取得工具
 *
 * 此模組為向後相容保留，內部委派給統一的 identity 模組。
 *
 * @deprecated 建議直接使用 '@/shared/utils/identity' 模組
 *
 * @example
 * import { identity } from '@/shared/utils/identity';
 * const refId = identity.getRefrigeratorId(urlGroupId, storeGroups);
 */

import { identity } from '@/shared/utils/identity';

/**
 * 取得 refrigeratorId
 *
 * @param urlGroupId - 從 URL 參數取得的 groupId
 * @param storeGroups - Redux store 中的 groups 陣列
 * @returns refrigeratorId 或 null
 * @deprecated 請使用 identity.getRefrigeratorId()
 */
export const getRefrigeratorId = (
  urlGroupId?: string,
  storeGroups?: { id: string }[],
): string | null => {
  return identity.getRefrigeratorId(urlGroupId, storeGroups);
};

/**
 * 儲存 refrigeratorId 到 localStorage
 * @deprecated 請使用 identity.setRefrigeratorId()
 */
export const saveRefrigeratorId = (id: string): void => {
  identity.setRefrigeratorId(id);
};

/**
 * 從 localStorage 取得快取的 refrigeratorId
 * @deprecated 請使用 identity.getCachedRefrigeratorId()
 */
export const getCachedRefrigeratorId = (): string | null => {
  return identity.getCachedRefrigeratorId();
};

/**
 * 清除 localStorage 中的 refrigeratorId 快取
 * @deprecated 請使用 identity.clearRefrigeratorId()
 */
export const clearRefrigeratorIdCache = (): void => {
  identity.clearRefrigeratorId();
};
