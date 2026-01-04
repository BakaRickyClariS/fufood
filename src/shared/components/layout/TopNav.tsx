import { ChevronDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth';
import { useGroupModal } from '@/modules/groups/hooks/useGroupModal';
import { getUserAvatarUrl } from '@/shared/utils/avatarUtils';

// UI 組件
import { MembershipBadge } from '@/shared/components/ui/MembershipBadge';
import { MemberAvatars } from '@/shared/components/ui/MemberAvatars';
// 資源
import EditGroupIcon from '@/assets/images/nav/edit-group.svg';

const TopNav = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { openHome, openSettings, activeGroup } = useGroupModal();

  // 判斷是否為 dashboard 路由
  const isDashboard =
    location.pathname === '/' || location.pathname === '/dashboard';

  // 使用頭像工具函數取得使用者頭像
  const userAvatar = getUserAvatarUrl(user);
  const userName = user?.displayName || user?.name || '使用者';

  // 當前群組使用 Provider 中的 activeGroup
  const currentGroup = activeGroup;

  // 使用 activeGroup 的名稱，若無則預設 'My Home'
  const displayHomeName = activeGroup?.name || 'My Home';

  return (
    <div
      className={`top-nav-wrapper sticky top-0 left-0 right-0 z-40 px-4 py-3 ${isDashboard ? 'bg-primary-100' : 'bg-white'}`}
    >
      <div className="flex items-center justify-between max-w-layout-container mx-auto">
        {/* Left: Group Avatar & Selector */}
        {/* Left: Group Avatar & Selector */}
        <div className="flex items-center gap-2">
          {/* Linked Group Avatar Stack (Left) */}
          <div className="flex items-center cursor-pointer" onClick={openHome}>
            <MemberAvatars
              members={[
                // Ensure current user is first
                {
                  id: user?.id || 'current',
                  name: userName,
                  avatar: userAvatar,
                },
                // Filter out current user from group members to avoid duplicates
                ...(currentGroup?.members?.filter(
                  (m) => m.name !== userName && m.name !== user?.displayName,
                ) || []),
              ]}
              maxDisplay={3}
            />
          </div>

          <Button
            variant="ghost"
            className="flex items-center gap-1 text-base font-bold text-primary-700 p-2 bg-primary-100 rounded-full hover:bg-primary-200"
            onClick={openHome}
          >
            {displayHomeName}
            <ChevronDown className="w-5 h-5" />
          </Button>
        </div>

        {/* Right: Edit Group Icon + User Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Restore Group Button */}
          <Button
            variant="ghost"
            size="icon"
            className="text-neutral-900 hover:bg-transparent"
            onClick={openSettings}
          >
            <img src={EditGroupIcon} alt="編輯群組" className="w-6 h-6" />
          </Button>

          <div
            className="relative w-10 h-10 cursor-pointer"
            onClick={() => navigate('/settings')}
          >
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-primary-300">
              <img
                src={userAvatar}
                alt={userName}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Restore MembershipBadge */}
            <MembershipBadge
              tier={user?.membershipTier || 'premium'}
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNav;
