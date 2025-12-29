import type { FC } from 'react';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { ChevronLeft } from 'lucide-react';
import { useGroupModal } from '../../hooks/useGroupModal';
import type { Group } from '../../types/group.types';

type EditGroupModalProps = {
  open: boolean;
  onClose: () => void;
  group: Group | null;
  onBack?: () => void;
};

/**
 * 編輯群組 Modal
 */
export const EditGroupModal: FC<EditGroupModalProps> = ({
  open,
  onClose,
  group,
  onBack,
}) => {
  const {
    updateGroup,
    deleteGroup,
    isGroupsLoading: isLoading,
  } = useGroupModal();
  const [name, setName] = useState('');
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);

  useEffect(() => {
    if (group) {
      setName(group.name);
    }
  }, [group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group || !name.trim()) return;

    await updateGroup(group.id, {
      name,
    });

    onClose();
  };

  const handleDelete = async () => {
    if (!group) return;
    await deleteGroup(group.id);
    onClose();
  };

  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-full h-full p-0 rounded-none border-0 sm:rounded-none !fixed !left-0 !top-0 !translate-x-0 !translate-y-0 !duration-300 data-[state=open]:!slide-in-from-left-full data-[state=closed]:!slide-out-to-left-full data-[state=closed]:!zoom-out-100 data-[state=open]:!zoom-in-100 data-[state=closed]:!slide-out-to-top-0 data-[state=open]:!slide-in-from-top-0">
        <div className="flex flex-col h-full bg-stone-50">
          <DialogHeader className="flex-shrink-0 px-4 py-3 bg-white border-b border-stone-100 flex flex-row items-center justify-center relative">
            <button
              onClick={() => {
                if (isDeleteConfirm) setIsDeleteConfirm(false);
                else if (onBack) onBack();
                else onClose();
              }}
              className="absolute left-4 p-1 -ml-1 text-stone-600"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <DialogTitle className="text-lg font-bold text-stone-900">
              {isDeleteConfirm ? '刪除群組' : '修改群組內容'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            {isDeleteConfirm ? (
              <div className="flex flex-col gap-6 items-center justify-center h-full pb-20">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-4xl mb-2">
                  ⚠️
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-stone-900">
                    確定要刪除此群組嗎？
                  </h3>
                  <p className="text-stone-500">
                    一旦刪除，所有成員將被移除，且無法復原此動作。
                  </p>
                </div>

                <div className="w-full mt-auto flex flex-col gap-3">
                  <Button
                    type="button"
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="w-full bg-red-500 hover:bg-red-600 text-white h-12 text-base rounded-xl shadow-sm"
                  >
                    {isLoading ? '刪除中...' : '確認刪除'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDeleteConfirm(false)}
                    className="w-full border-stone-200 text-stone-600 hover:bg-stone-50 h-12 text-base rounded-xl"
                  >
                    取消
                  </Button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-6 h-full"
              >
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="editGroupName"
                    className="text-sm font-medium text-stone-700"
                  >
                    群組名稱
                  </label>
                  <Input
                    id="editGroupName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="輸入群組名稱"
                    className="h-12 rounded-xl"
                    required
                  />
                </div>

                <div className="mt-auto pt-4 flex flex-col gap-3">
                  <Button
                    type="submit"
                    disabled={isLoading || !name.trim()}
                    className="w-full bg-[#EE5D50] hover:bg-[#D94A3D] text-white h-12 text-base rounded-xl shadow-sm"
                  >
                    {isLoading ? '儲存中...' : '儲存變更'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDeleteConfirm(true)}
                    className="w-full border-red-200 text-red-500 hover:bg-red-50 h-12 text-base rounded-xl"
                  >
                    刪除群組
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
