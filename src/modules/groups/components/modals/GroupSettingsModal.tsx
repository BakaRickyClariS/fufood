import { type FC, useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { GroupCard } from '../ui/GroupCard';
import { useGroupModal } from '../../hooks/useGroupModal';
import type { Group } from '../../types/group.types';
import { toast } from 'sonner';

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
  const { groups, isGroupsLoading: isLoading, activeGroup, switchGroup } = useGroupModal();
  
  // 暫存選中的群組 ID（尚未套用）
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  
  // 判斷是否為當前群組（套用按鈕要 disabled）
  const isCurrentGroup = selectedGroupId === activeGroup?.id || (!selectedGroupId && true);
  
  // 監聽 modal 關閉時重置選擇狀態
  useEffect(() => {
    if (!open) {
      setSelectedGroupId(null);
    }
  }, [open]);
  
  // 處理套用
  const handleApply = () => {
    if (!selectedGroupId || selectedGroupId === activeGroup?.id) return;
    
    switchGroup(selectedGroupId);
    toast.success('已切換群組');
    setSelectedGroupId(null);
    
    // 1.5 秒後自動關閉設定畫面
    setTimeout(() => {
      onClose();
    }, 1500);
  };
  
  // 處理選擇群組
  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-full h-dvh p-0 gap-0 rounded-none border-0 sm:rounded-none fixed! left-0! top-0! translate-x-0! translate-y-0! duration-300! data-[state=open]:slide-in-from-left-full! data-[state=closed]:slide-out-to-left-full! data-[state=closed]:zoom-out-100! data-[state=open]:zoom-in-100! data-[state=closed]:slide-out-to-top-0! data-[state=open]:slide-in-from-top-0! overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0 px-4 py-3 bg-white flex flex-row items-center justify-center relative">
          <button
            onClick={onClose}
            className="absolute left-4 p-1 -ml-1 text-neutral-600"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <DialogTitle className="text-lg font-bold text-neutral-900">
            群組設定
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-6 min-h-0 bg-neutral-100 pb-24">
          <div className="flex flex-col gap-6">
            {/* 建立群組按鈕 */}
            <Button
              className="w-full bg-primary-400 hover:bg-primary-500 text-white h-12 text-base rounded-xl shadow-sm"
              onClick={onOpenCreateModal}
            >
              建立群組
            </Button>

            {/* 群組列表 */}
            <div className="flex flex-col gap-4">
              <h2 className="text-sm text-neutral-500 font-medium">群組</h2>

              {isLoading ? (
                <div className="text-center py-8 text-neutral-400">載入中...</div>
              ) : !Array.isArray(groups) || groups.length === 0 ? (
                <div className="text-center py-8 text-neutral-400">尚無群組</div>
              ) : (
                groups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    isActive={activeGroup?.id === group.id}
                    isSelected={selectedGroupId === group.id}
                    isExpanded={selectedGroupId ? selectedGroupId === group.id : activeGroup?.id === group.id}
                    onSelect={handleSelectGroup}
                    onEditMembers={onOpenMembersModal}
                    onEditGroup={onOpenEditModal}
                  />
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* 底部固定套用按鈕 */}
        <div className="shrink-0 px-4 py-4 bg-white rounded-t-2xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] relative -mt-4 z-20">
          <Button
            className="w-full bg-primary-400 hover:bg-primary-500 text-white h-12 text-lg font-bold rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleApply}
            disabled={isCurrentGroup}
          >
            套用
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
