import type { FC } from 'react';
import { ChevronLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { GroupCard } from '../ui/GroupCard';
import { useGroupModal } from '../../hooks/useGroupModal'; // Import useGroupModal
import type { Group } from '../../types/group.types';

type GroupSettingsModalProps = {
  open: boolean;
  onClose: () => void;
  onOpenMembersModal?: (group: Group) => void;
  onOpenEditModal?: (group: Group) => void;
  onOpenCreateModal?: () => void;
};

/**
 * 群組設定 Modal（群組列表管理）
 */
export const GroupSettingsModal: FC<GroupSettingsModalProps> = ({
  open,
  onClose,
  onOpenMembersModal,
  onOpenEditModal,
  onOpenCreateModal,
}) => {
  const { groups, isGroupsLoading: isLoading, activeGroup } = useGroupModal();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-full h-[100dvh] p-0 gap-0 rounded-none border-0 sm:rounded-none !fixed !left-0 !top-0 !translate-x-0 !translate-y-0 !duration-300 data-[state=open]:!slide-in-from-left-full data-[state=closed]:!slide-out-to-left-full data-[state=closed]:!zoom-out-100 data-[state=open]:!zoom-in-100 data-[state=closed]:!slide-out-to-top-0 data-[state=open]:!slide-in-from-top-0 overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 px-4 py-3 bg-white flex flex-row items-center justify-center relative">
          <button
            onClick={onClose}
            className="absolute left-4 p-1 -ml-1 text-stone-600"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <DialogTitle className="text-lg font-bold text-stone-900">
            群組設定
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-6 min-h-0 bg-neutral-100">
          <div className="flex flex-col gap-6">
            {/* 建立群組按鈕 */}
            <Button
              className="w-full bg-[#EE5D50] hover:bg-[#D94A3D] text-white h-12 text-base rounded-xl shadow-sm"
              onClick={onOpenCreateModal}
            >
              建立群組
            </Button>

            {/* 群組列表 */}
            <div className="flex flex-col gap-4">
              <h2 className="text-sm text-stone-500 font-medium">群組</h2>

              {isLoading ? (
                <div className="text-center py-8 text-stone-400">載入中...</div>
              ) : groups.length === 0 ? (
                <div className="text-center py-8 text-stone-400">尚無群組</div>
              ) : (
                groups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    isActive={activeGroup?.id === group.id} // Highlight active group
                    onEditMembers={onOpenMembersModal}
                    onEditGroup={onOpenEditModal}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
