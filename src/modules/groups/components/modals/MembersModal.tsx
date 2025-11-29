import type { FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { MemberList } from '../ui/MemberList';
import { useGroupMembers } from '../../hooks/useGroupMembers';
import type { Group } from '../../types/group.types';
import { ChevronLeft } from 'lucide-react';

type MembersModalProps = {
  open: boolean;
  onClose: () => void;
  group: Group | null;
  onBack?: () => void;
};

/**
 * 成員管理 Modal
 */
export const MembersModal: FC<MembersModalProps> = ({
  open,
  onClose,
  group,
  onBack,
}) => {
  const { members, isLoading, removeMember } = useGroupMembers(group?.id || '');

  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-full h-full p-0 rounded-none border-0 sm:rounded-none !fixed !left-0 !top-0 !translate-x-0 !translate-y-0 !duration-300 data-[state=open]:!slide-in-from-left-full data-[state=closed]:!slide-out-to-left-full data-[state=closed]:!zoom-out-100 data-[state=open]:!zoom-in-100 data-[state=closed]:!slide-out-to-top-0 data-[state=open]:!slide-in-from-top-0">
        <div className="flex flex-col h-full bg-stone-50">
          <DialogHeader className="flex-shrink-0 px-4 py-3 bg-white border-b border-stone-100 flex flex-row items-center justify-center relative">
            {onBack && (
              <button onClick={onBack} className="absolute left-4 p-1 -ml-1 text-stone-600">
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            <DialogTitle className="text-lg font-bold text-stone-900">編輯成員</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col">
            <div className="flex flex-col gap-6 flex-1">
              {/* Group Info Card */}
              <div className="bg-white rounded-3xl p-6 relative overflow-hidden shadow-sm border border-stone-100">
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1 bg-[#E8DCC6] px-2 py-1 rounded-md text-xs text-[#8B5E3C] font-medium mb-2">
                    <span>{group.plan === 'free' ? 'Free' : 'Premium'}</span>
                  </div>
                  <h2 className="text-xl font-bold text-[#EE5D50] mb-1">{group.name}</h2>
                  <p className="text-sm text-stone-500">管理員 {group.admin}</p>
                </div>
                
                {/* Character Illustration (Placeholder) */}
                <div className={`absolute right-[-20px] bottom-[-20px] w-40 h-40 ${group.characterColor} rounded-full opacity-80`} />
              </div>

              {/* Members List */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-stone-500 font-medium">成員 {members.length}</span>
                  <button className="text-xs text-[#EE5D50] font-medium">刪除成員</button>
                </div>

                {isLoading ? (
                  <div className="text-center py-8 text-stone-400">載入中...</div>
                ) : (
                  <MemberList 
                    members={members} 
                    onRemoveMember={removeMember}
                  />
                )}
              </div>
            </div>

            {/* Invite Button */}
            <div className="mt-6 pt-4">
              <Button 
                className="w-full bg-[#EE5D50] hover:bg-[#D94A3D] text-white h-12 text-base rounded-xl shadow-sm"
              >
                邀請好友
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
