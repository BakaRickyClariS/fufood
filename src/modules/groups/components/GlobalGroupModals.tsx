import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/modules/auth';
import { useGroupModal } from '@/modules/groups/providers/GroupModalProvider';
import { getUserAvatarUrl } from '@/shared/utils/avatarUtils';
import type { Group } from '@/modules/groups/types/group.types';

// Group Modals
import { GroupList } from '@/modules/groups/components/modals/GroupList';
import { GroupMembers } from '@/modules/groups/components/modals/GroupMembers';
import { GroupForm } from '@/modules/groups/components/modals/GroupForm';
import { InviteFriendModal } from '@/modules/groups/components/modals/InviteFriendModal';
import { HomeModal } from '@/modules/groups/components/modals/HomeModal';

/**
 * 全局群組 Modal 渲染元件
 * 在任何頁面都能根據 URL query params 顯示群組相關的 Modal
 */
export const GlobalGroupModals = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Group Modal Context
  const { activeGroup, groups } = useGroupModal();

  const displayName = user?.name || user?.displayName || 'Guest';
  const userAvatar = getUserAvatarUrl(user);

  // === Group Modal 狀態 ===
  const modal = searchParams.get('modal');
  const targetId = searchParams.get('id');
  const actionParam = searchParams.get('action');
  const groupIdParam = searchParams.get('groupId');

  // 本地 State 控制 Create/Edit Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [targetEditGroup, setTargetEditGroup] = useState<Group | null>(null);

  // 處理 action query param
  useEffect(() => {
    if (actionParam === 'create') {
      setCreateOpen(true);
      // 清除 action param
      const params = new URLSearchParams(searchParams);
      params.delete('action');
      setSearchParams(params, { replace: true });
    } else if (actionParam === 'edit' && groupIdParam) {
      const group = groups.find((g) => g.id === groupIdParam);
      if (group) {
        setTargetEditGroup(group);
        setEditOpen(true);
        // 清除 action 和 groupId params
        const params = new URLSearchParams(searchParams);
        params.delete('action');
        params.delete('groupId');
        setSearchParams(params, { replace: true });
      }
    }
  }, [actionParam, groupIdParam, groups, searchParams, setSearchParams]);

  // 根據 ID 尋找群組 (用於 members, invite)
  const targetGroup = targetId
    ? groups.find((g) => g.id === targetId) || null
    : null;

  // Modal 關閉 handlers - 只清除群組相關的 params，保留其他
  const handleCloseModal = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('modal');
    params.delete('action');
    params.delete('groupId');
    params.delete('id');
    setSearchParams(params);
  };

  // 專門給 Invite Modal 用的關閉 (只移除 action)
  const handleCloseInvite = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('action');
    // 如果是從 invite action 開啟的，這裡只移除 action
    // 如果原本有 id，保留 id (因為底下的 GroupMembers 可能需要)
    setSearchParams(params);
  };

  const handleBackToList = () => {
    const params = new URLSearchParams(searchParams);
    params.set('modal', 'groups-list');
    params.delete('id');
    setSearchParams(params);
  };

  const handleOpenCreate = () => {
    setCreateOpen(true);
  };

  const handleOpenEdit = (group: Group) => {
    setTargetEditGroup(group);
    setEditOpen(true);
  };

  const handleOpenMembers = (group: Group) => {
    const params = new URLSearchParams(searchParams);
    params.set('modal', 'groups-members');
    params.set('id', group.id);
    setSearchParams(params);
  };

  // 只有當有群組相關的 modal 時才渲染
  const hasGroupModal =
    modal?.startsWith('groups-') ||
    createOpen ||
    editOpen ||
    actionParam === 'invite';

  if (!hasGroupModal) return null;

  return (
    <>
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

      {/* 邀請好友 - action=invite OR modal=groups-invite (舊相容) */}
      <InviteFriendModal
        open={modal === 'groups-invite' || actionParam === 'invite'}
        onClose={
          actionParam === 'invite' ? handleCloseInvite : handleCloseModal
        }
        group={targetGroup || activeGroup || null}
      />
    </>
  );
};
