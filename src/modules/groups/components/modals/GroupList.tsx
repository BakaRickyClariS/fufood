import { type FC, useState, useEffect, useRef } from 'react';
import { Trash2, Plus } from 'lucide-react';
import { Dialog, DialogContent } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { GroupCard } from '../ui/GroupCard';
import {
  GroupPageLayout,
  type GroupPageLayoutRef,
} from '../ui/GroupPageLayout';
import { useGroupModal } from '../../hooks/useGroupModal';
import type { Group } from '../../types/group.types';
import { toast } from 'sonner';

type GroupListProps = {
  open: boolean;
  onClose: () => void;
  onOpenMembersModal?: (group: Group) => void;
  onOpenEditModal?: (group: Group) => void;
  onOpenCreateModal?: () => void;
};

/**
 * 群組列表管理頁面
 * - 使用 GroupPageLayout 從右側滑入
 */
export const GroupList: FC<GroupListProps> = ({
  open,
  onClose,
  onOpenMembersModal,
  onOpenEditModal,
  onOpenCreateModal,
}) => {
  const layoutRef = useRef<GroupPageLayoutRef>(null);
  const {
    groups,
    isGroupsLoading: isLoading,
    activeGroup,
    switchGroup,
    deleteGroup,
  } = useGroupModal();

  // 暫存選中的群組 ID（尚未套用）
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  // 展開的群組 ID
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  // 刪除模式狀態
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [checkedGroupIds, setCheckedGroupIds] = useState<Set<string>>(
    new Set(),
  );

  // 刪除確認 Modal 狀態
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 判斷是否為當前群組（套用按鈕要 disabled）
  const isCurrentGroup =
    selectedGroupId === activeGroup?.id || (!selectedGroupId && true);

  // 監聽 modal 開啟/關閉時重置狀態
  useEffect(() => {
    if (open) {
      if (activeGroup) {
        setSelectedGroupId(activeGroup.id);
      }
    } else {
      setSelectedGroupId(null);
      setExpandedGroupId(null);
      setIsDeleteMode(false);
      setIsDeleting(false);
      setCheckedGroupIds(new Set());
      setShowDeleteConfirm(false);
    }
  }, [open, activeGroup]);

  // 處理套用
  const handleApply = () => {
    if (!selectedGroupId || selectedGroupId === activeGroup?.id) return;

    switchGroup(selectedGroupId);
    toast.success('已切換群組');
    setSelectedGroupId(null);

    // 0.5 秒後自動關閉設定畫面
    setTimeout(() => {
      layoutRef.current?.close();
    }, 500);
  };

  // 處理選擇群組
  const handleSelectGroup = (groupId: string) => {
    if (isDeleteMode) return;
    setSelectedGroupId(groupId);
  };

  // 處理展開/收合
  const handleToggleExpand = (groupId: string) => {
    setExpandedGroupId((prev) => (prev === groupId ? null : groupId));
  };

  // 處理勾選變更
  const handleCheckChange = (groupId: string, checked: boolean) => {
    setCheckedGroupIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(groupId);
      } else {
        newSet.delete(groupId);
      }
      return newSet;
    });
  };

  // 切換刪除模式
  const toggleDeleteMode = () => {
    setIsDeleteMode((prev) => !prev);
    setCheckedGroupIds(new Set());
    setExpandedGroupId(null);
  };

  // 處理刪除按鈕點擊
  const handleDeleteClick = () => {
    if (checkedGroupIds.size === 0) return;
    setShowDeleteConfirm(true);
  };

  // 確認刪除
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      // 逐一刪除選中的群組
      const promises = Array.from(checkedGroupIds).map((id) => deleteGroup(id));
      await Promise.all(promises);

      toast.success(`已刪除 ${checkedGroupIds.size} 個群組`);
      setShowDeleteConfirm(false);
      setCheckedGroupIds(new Set());
      setIsDeleteMode(false);

      // 如果刪除了當前群組，需要切換到其他群組
      if (activeGroup && checkedGroupIds.has(activeGroup.id)) {
        const remainingGroups =
          groups?.filter((g) => !checkedGroupIds.has(g.id)) || [];
        if (remainingGroups.length > 0) {
          switchGroup(remainingGroups[0].id);
        }
      }
    } catch (error) {
      console.error('刪除群組失敗:', error);
      toast.error('刪除群組失敗');
    } finally {
      setIsDeleting(false);
    }
  };

  // 取得選中的群組名稱（用於確認彈窗）
  const getCheckedGroupNames = () => {
    const checkedGroups =
      groups?.filter((g) => checkedGroupIds.has(g.id)) || [];
    return checkedGroups.map((g) => g.name).join('、');
  };

  // 底部按鈕
  const footerContent = isDeleteMode ? (
    <Button
      className="w-full bg-primary-400 hover:bg-primary-500 text-white h-12 text-lg font-bold rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleDeleteClick}
      disabled={checkedGroupIds.size === 0}
    >
      刪除
    </Button>
  ) : (
    <Button
      className="w-full bg-primary-400 hover:bg-primary-500 text-white h-12 text-lg font-bold rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleApply}
      disabled={isCurrentGroup}
    >
      套用
    </Button>
  );

  return (
    <>
      <GroupPageLayout
        ref={layoutRef}
        isOpen={open}
        onClose={onClose}
        title="群組設定"
        className="px-4 py-6 pb-24"
        footer={footerContent}
      >
        <div className="flex flex-col">
          {/* 建立群組按鈕 - 設計稿樣式 */}
          <button
            onClick={onOpenCreateModal}
            className="w-full h-14 rounded-lg border-2 mb-6 border-neutral-300 bg-white flex items-center justify-center gap-2 text-neutral-600 font-semibold hover:bg-neutral-50 hover:border-neutral-400 transition-colors"
          >
            <Plus className="w-5 h-5" />
            建立群組
          </button>

          {/* 群組列表標題與刪除按鈕 */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base text-neutral-600 font-semibold">群組</h2>
            <button
              onClick={toggleDeleteMode}
              className={`flex items-center gap-1 text-base font-semibold transition-colors ${
                isDeleteMode
                  ? 'text-primary-500'
                  : 'text-primary-400 hover:text-primary-500'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              刪除群組
            </button>
          </div>

          {/* 群組列表 */}
          <div className="flex flex-col gap-6">
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
                  isExpanded={!isDeleteMode && expandedGroupId === group.id}
                  isDeleteMode={isDeleteMode}
                  isChecked={checkedGroupIds.has(group.id)}
                  onSelect={handleSelectGroup}
                  onCheckChange={handleCheckChange}
                  onToggleExpand={handleToggleExpand}
                  onEditMembers={onOpenMembersModal}
                  onEditGroup={onOpenEditModal}
                />
              ))
            )}
          </div>
        </div>
      </GroupPageLayout>

      {/* 刪除確認 Modal */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-[320px] rounded-2xl p-6 gap-0">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-xl font-bold text-neutral-800 mb-2">
              確認刪除
            </h2>
            <p className="text-neutral-600">「{getCheckedGroupNames()}」</p>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl border-neutral-200 text-neutral-700 font-semibold"
              onClick={() => setShowDeleteConfirm(false)}
            >
              取消
            </Button>
            <Button
              className="flex-1 h-12 rounded-xl bg-primary-400 hover:bg-primary-500 text-white font-semibold"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? '刪除中...' : '確認'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
