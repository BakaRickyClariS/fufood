import type { MembershipTier } from '@/modules/auth/types';
import PremiumBadge from '@/assets/images/nav/Premium-membership-card.png';

type MembershipBadgeProps = {
  tier: MembershipTier;
  size?: 'sm' | 'md';
};

/**
 * 會員等級徽章組件
 * - 根據會員等級顯示對應圖示
 * - 絕對定位於大頭貼左下角
 */
export const MembershipBadge = ({ tier, size = 'sm' }: MembershipBadgeProps) => {
  // 目前只有 premium 等級有對應圖示，其他等級暫不顯示
  // 後續可依需求添加其他等級的圖示
  if (tier === 'free') {
    return null;
  }

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
  };

  // 根據會員等級取得對應圖示
  const getBadgeImage = () => {
    switch (tier) {
      case 'premium':
      case 'vip':
        return PremiumBadge;
      default:
        return null;
    }
  };

  const badgeImage = getBadgeImage();
  if (!badgeImage) return null;

  return (
    <div className={`absolute -bottom-0.5 -left-0.5 ${sizeClasses[size]}`}>
      <img
        src={badgeImage}
        alt={`${tier} 會員`}
        className="w-full h-full object-contain"
      />
    </div>
  );
};
