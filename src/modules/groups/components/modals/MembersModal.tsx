import { useState, type FC } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { MemberList } from '../ui/MemberList';
import { useGroupMembers } from '../../hooks/useGroupMembers';
import { useAuth } from '@/modules/auth';
import { getUserAvatarUrl } from '@/shared/utils/avatarUtils';
import type { Group } from '../../types/group.types';

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
  const { user } = useAuth();
  const currentUserName = user?.displayName || user?.name || '';
  const currentUserAvatar = getUserAvatarUrl(user);

  // Pass current user info to hook so it can inject user into members list
  const { members, isLoading, removeMember } = useGroupMembers(
    group?.id || '',
    user
      ? { id: user.id, name: currentUserName, avatar: currentUserAvatar }
      : undefined,
  );

  const [isDeleteMode, setIsDeleteMode] = useState(false);

  const toggleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
  };

  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-full h-[100dvh] p-0 rounded-none border-0 sm:rounded-none !fixed !left-0 !top-0 !translate-x-0 !translate-y-0 !duration-300 data-[state=open]:!slide-in-from-left-full data-[state=closed]:!slide-out-to-left-full data-[state=closed]:!zoom-out-100 data-[state=open]:!zoom-in-100 data-[state=closed]:!slide-out-to-top-0 data-[state=open]:!slide-in-from-top-0">
        <div className="flex flex-col h-full bg-stone-50">
          <DialogHeader className="flex-shrink-0 px-4 py-3 bg-white border-b border-stone-100 flex flex-row items-center justify-center relative">
            {onBack && (
              <button
                onClick={onBack}
                className="absolute left-4 p-1 -ml-1 text-stone-600 hover:text-stone-900"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            <DialogTitle className="text-lg font-bold text-stone-900">
              編輯成員
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col">
            <div className="flex flex-col gap-6 flex-1">
              {/* Group Info Card */}
              <div className="bg-white rounded-[32px] p-6 relative overflow-hidden shadow-sm border border-stone-100 min-h-[160px]">
                <div className="relative z-10 w-[60%]">
                  <div className="inline-flex items-center gap-1 bg-[#E8DCC6] px-2 py-1 rounded-md text-xs text-[#8B5E3C] font-bold mb-3 tracking-wide uppercase">
                    <span>{group.plan === 'free' ? 'Free' : 'Premium'}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#EE5D50] mb-1">
                    {group.name}
                  </h2>
                  <p className="text-sm text-stone-500 font-medium">
                    管理員 {group.admin}
                  </p>
                </div>

                {/* Character Illustration */}
                <div className="absolute -right-4 -bottom-4 w-40 h-40">
                  <img
                    src={group.imageUrl || '/src/assets/images/auth/Avatar-1.png'}
                    alt={group.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Members List Header */}
              <div className="flex items-center justify-between px-1">
                <span className="text-lg font-bold text-stone-800">
                  成員 {members.length}
                </span>
                <button
                  onClick={toggleDeleteMode}
                  className={`text-sm font-bold transition-colors ${
                    isDeleteMode
                      ? 'text-primary-600 hover:text-primary-700'
                      : 'text-[#EE5D50] hover:text-[#D94A3D]'
                  }`}
                >
                  {isDeleteMode ? '完成' : '刪除成員'}
                </button>
              </div>

              {/* Members List */}
              <div className="flex flex-col gap-4">
                {isLoading ? (
                  <div className="text-center py-8 text-stone-400">
                    載入中...
                  </div>
                ) : (
                  <MemberList
                    members={members}
                    onRemoveMember={removeMember}
                    isDeleteMode={isDeleteMode}
                    currentUserName={currentUserName}
                  />
                )}
              </div>
            </div>

            {/* Invite Button */}
            <div className="mt-6 pt-4">
              <Button className="w-full bg-[#EE5D50] hover:bg-[#D94A3D] text-white h-14 text-lg font-bold rounded-xl shadow-sm">
                邀請好友
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
