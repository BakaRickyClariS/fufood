import type { MembershipTier } from '@/modules/auth/types';
import FreeBadge from '@/assets/images/settings/brown.png';
import ProBadge from '@/assets/images/settings/silver.png';

type MembershipBadgeProps = {
  tier: MembershipTier;
  size?: 'sm' | 'md';
};

/**
 * 會員等級徽章組件
 * - 根據會員等級顯示對應圖示
 * - 絕對定位於大頭貼左下角
 *
 * 對應後端 API subscriptionTier:
 * - 0: free（基礎入門）→ brown.png
 * - 1: pro（專業家庭）→ silver.png
 */
export const MembershipBadge = ({
  tier,
  size = 'sm',
}: MembershipBadgeProps) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
  };

  // 根據會員等級取得對應圖示
  const badgeImage = tier === 'pro' ? ProBadge : FreeBadge;

  return (
    <div className={`absolute bottom-1 -left-1.5 ${sizeClasses[size]}`}>
      <img
        src={badgeImage}
        alt={`${tier === 'pro' ? 'Pro專業' : 'Free基礎'} 會員`}
        className="w-full h-full object-contain scale-180"
      />
    </div>
  );
};
