import type { MembershipTier } from '@/modules/auth/types/auth.types';

/**
 * 會員方案群組數量限制
 */
export const GROUP_LIMITS: Record<MembershipTier, number> = {
  free: 3,
  premium: 5,
  vip: 10, // 預留
};

/**
 * 取得特定會員等級的群組數量上限
 * @param tier 會員等級
 * @returns 群組數量上限
 */
export const getGroupLimit = (tier?: MembershipTier): number => {
  // 預設為 free
  const currentTier = tier || 'free';
  return GROUP_LIMITS[currentTier] ?? GROUP_LIMITS.free;
};
