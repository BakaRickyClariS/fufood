import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/modules/auth';
import { useGroups } from '@/modules/groups/hooks/useGroups';
import { useGroupModal } from '@/modules/groups/providers/GroupModalProvider';
import {
  selectActiveRefrigeratorId,
  setActiveRefrigeratorId,
} from '@/store/slices/refrigeratorSlice';
import { useTheme } from '@/shared/providers/ThemeProvider';
import { ThemeSelectionSheet } from '@/shared/components/modals/ThemeSelectionSheet';
import InventorySection from '@/modules/dashboard/components/InventorySection';
import RecipeSection from '@/modules/dashboard/components/RecipeSection';
import { getUserAvatarUrl } from '@/shared/utils/avatarUtils';
import type { Group } from '@/modules/groups/types/group.types';

// Group Modals
import { GroupList } from '@/modules/groups/components/modals/GroupList';
import { GroupMembers } from '@/modules/groups/components/modals/GroupMembers';
import { GroupForm } from '@/modules/groups/components/modals/GroupForm';
import { InviteFriendModal } from '@/modules/groups/components/modals/InviteFriendModal';
import { HomeModal } from '@/modules/groups/components/modals/HomeModal';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Group Modal Context
  const { activeGroup, groups } = useGroupModal();

  // 主題系統
  const { currentTheme, shouldShowThemeModal, setTheme, dismissThemeModal } =
    useTheme();

  // 使用 useGroups 確保群組資料被載入
  const { groups: allGroups } = useGroups();
  const activeRefrigeratorId = useSelector(selectActiveRefrigeratorId);

  // 自動初始化 activeRefrigeratorId
  useEffect(() => {
    if (allGroups && allGroups.length > 0 && !activeRefrigeratorId) {
      const defaultId = allGroups[0].id;
      console.log(
        '[Dashboard] Auto-selecting default refrigerator:',
        defaultId,
      );
      dispatch(setActiveRefrigeratorId(defaultId));
    }
  }, [allGroups, activeRefrigeratorId, dispatch]);

  const displayName = user?.name || user?.displayName || 'Guest';
  const userAvatar = getUserAvatarUrl(user);

  // === Group Modal 狀態 ===
  const modal = searchParams.get('modal');
  const targetId = searchParams.get('id');

  // 本地 State 控制 Create/Edit Modal（不改變 URL）
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [targetEditGroup, setTargetEditGroup] = useState<Group | null>(null);

  // 處理來自 Provider 的 Location State (Deep Linking)
  useEffect(() => {
    if (location.state) {
      const { action, groupId } = location.state as any;
      if (action === 'create') {
        setCreateOpen(true);
        navigate(location.pathname + location.search, {
          replace: true,
          state: {},
        });
      } else if (action === 'edit' && groupId) {
        const group = groups.find((g) => g.id === groupId);
        if (group) {
          setTargetEditGroup(group);
          setEditOpen(true);
          navigate(location.pathname + location.search, {
            replace: true,
            state: {},
          });
        }
      }
    }
  }, [location.state, groups, navigate, location.pathname, location.search]);

  // 根據 ID 尋找群組 (用於 members, invite)
  const targetGroup = targetId
    ? groups.find((g) => g.id === targetId) || null
    : null;

  // Modal 關閉 handlers
  const handleCloseModal = () => {
    setSearchParams({});
  };

  const handleBackToList = () => {
    setSearchParams({ modal: 'groups-list' });
  };

  const handleOpenCreate = () => {
    setCreateOpen(true);
  };

  const handleOpenEdit = (group: Group) => {
    setTargetEditGroup(group);
    setEditOpen(true);
  };

  const handleOpenMembers = (group: Group) => {
    setSearchParams({ modal: 'groups-members', id: group.id });
  };

  return (
    <>
      {/* 首次登入主題選擇 Sheet */}
      <ThemeSelectionSheet
        isOpen={shouldShowThemeModal}
        onClose={async () => {
          await setTheme(1);
          dismissThemeModal();
        }}
        onConfirm={async (themeId, _userName) => {
          await setTheme(themeId);
        }}
        isFirstLogin={true}
        defaultUserName={displayName !== 'Guest' ? displayName : ''}
      />

      {/* Hero 區塊 */}
      <section>
        <div className="flex justify-center px-4 w-full">
          <div className="flex flex-row justify-center max-w-layout-container w-full">
            <div className="flex flex-col max-w-[150px] mr-[-100px] mt-14 w-full z-10">
              <h1 className="text-xl/7 font-bold text-neutral-600 mb-5">
                早安,{displayName}!
              </h1>
              <p className="text-sm text-neutral-600 py-1 px-3 bg-white rounded-b-xl rounded-tl-xl whitespace-nowrap">
                歡迎回到冰箱小隊～
              </p>
            </div>

            <img
              className="max-w-[300px] w-full h-auto object-cover translate-x-6 mt-3"
              src={currentTheme.homeBanner}
              alt="Illustration of a person looking into a fridge"
            />
          </div>
        </div>
      </section>

      {/* 庫存卡片區塊 */}
      <InventorySection />
      {/* 推薦食譜區塊 */}
      <RecipeSection />

      {/* ===== Group Modals (首頁子路由) ===== */}

      {/* HomeModal - groups-home */}
      {activeGroup && (
        <HomeModal
          isOpen={modal === 'groups-home'}
          onClose={handleCloseModal}
          currentUser={{
            name: displayName,
            avatar: userAvatar,
            role:
              activeGroup.members?.find((m) => m.id === user?.id)?.role ||
              'member',
          }}
          members={activeGroup.members || []}
          onEditMembers={() => handleOpenMembers(activeGroup)}
        />
      )}

      {/* 群組列表 - groups-list */}
      <GroupList
        open={modal === 'groups-list' || createOpen || editOpen}
        onClose={handleCloseModal}
        onOpenCreateModal={handleOpenCreate}
        onOpenEditModal={handleOpenEdit}
        onOpenMembersModal={handleOpenMembers}
      />

      {/* 成員列表 - groups-members */}
      <GroupMembers
        open={modal === 'groups-members'}
        onClose={handleCloseModal}
        group={targetGroup || activeGroup || null}
        onBack={handleBackToList}
      />

      {/* 建立群組 - State 驅動 */}
      <GroupForm
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        group={null}
        mode="create"
        onBack={() => setCreateOpen(false)}
      />

      {/* 編輯群組 - State 驅動 */}
      <GroupForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        group={targetEditGroup}
        mode="edit"
        onBack={() => setEditOpen(false)}
      />

      {/* 邀請好友 - groups-invite */}
      <InviteFriendModal
        open={modal === 'groups-invite'}
        onClose={handleCloseModal}
        group={targetGroup || activeGroup || null}
      />
    </>
  );
};

export default Dashboard;
