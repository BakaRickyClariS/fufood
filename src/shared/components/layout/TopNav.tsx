import { ChevronDown, HousePlus, ShieldCheck } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { useState } from 'react';
import zoeImg from '@/assets/images/inventory/members-zo.png';

// Group Modals
import { GroupSettingsModal } from '@/modules/groups/components/modals/GroupSettingsModal';
import { CreateGroupModal } from '@/modules/groups/components/modals/CreateGroupModal';
import { EditGroupModal } from '@/modules/groups/components/modals/EditGroupModal';
import { MembersModal } from '@/modules/groups/components/modals/MembersModal';
import type { Group } from '@/modules/groups/types/group.types';

const TopNav = () => {
  const [selectedHome] = useState('My Home');

  // Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Handlers
  const handleOpenCreate = () => {
    setIsSettingsOpen(false);
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (group: Group) => {
    setSelectedGroup(group);
    setIsSettingsOpen(false);
    setIsEditOpen(true);
  };

  const handleOpenMembers = (group: Group) => {
    setSelectedGroup(group);
    setIsSettingsOpen(false);
    setIsMembersOpen(true);
  };

  const handleBackToSettings = () => {
    setIsCreateOpen(false);
    setIsEditOpen(false);
    setIsMembersOpen(false);
    setIsSettingsOpen(true);
  };

  return (
    <>
      <div className="top-nav-wrapper sticky top-0 left-0 right-0 bg-white z-40 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Free Badge + Home Selector */}
          <div className="flex items-center gap-3">
            {/* Free Badge */}
            <div className="flex items-center gap-1 bg-[#C48B6B] text-white px-2 py-1 rounded-md shadow-sm">
              <ShieldCheck className="w-4 h-4 text-white" />
              <span className="text-xs font-bold">Free</span>
            </div>

            {/* Home Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1 text-xl font-bold text-neutral-900 px-0 hover:bg-transparent"
                >
                  {selectedHome}
                  <ChevronDown className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-64 p-4 rounded-2xl"
              >
                {/* Current User Info */}
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-stone-100">
                  <div className="w-10 h-10 rounded-full bg-red-200" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-stone-800">
                      Jocelyn (你)
                    </span>
                    <span className="text-xs text-stone-400">擁有者</span>
                  </div>
                </div>

                {/* Other Members */}
                <div className="flex flex-col gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-200" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-stone-800">
                        Zoe
                      </span>
                      <span className="text-xs text-stone-400">組織者</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-200" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-stone-800">
                        Ricky
                      </span>
                      <span className="text-xs text-stone-400">組織者</span>
                    </div>
                  </div>
                </div>

                {/* Edit Button */}
                <Button
                  className="w-full bg-[#EE5D50] hover:bg-[#D94A3D] text-white h-10 rounded-xl text-sm"
                  onClick={() => {
                    // 這裡我們需要傳入當前群組，目前先用 mock
                    // 實際應從 useGroups 獲取當前選中的群組
                    handleOpenMembers({
                      id: '1',
                      name: 'My Home',
                      admin: 'Jocelyn',
                      members: [], // 這裡不需要完整成員列表，因為 Modal 會自己抓
                      color: 'bg-red-100',
                      characterColor: 'bg-red-400',
                      plan: 'free',
                      createdAt: new Date(),
                      updatedAt: new Date(),
                    });
                  }}
                >
                  編輯成員
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right: Home Icon + User Avatar */}
          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="text-neutral-900 hover:bg-transparent"
              onClick={() => setIsSettingsOpen(true)}
            >
              <HousePlus className="w-6 h-6" />
            </Button>

            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
              <img
                src={zoeImg}
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <GroupSettingsModal
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenCreateModal={handleOpenCreate}
        onOpenEditModal={handleOpenEdit}
        onOpenMembersModal={handleOpenMembers}
      />

      <CreateGroupModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onBack={handleBackToSettings}
      />

      <EditGroupModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        group={selectedGroup}
        onBack={handleBackToSettings}
      />

      <MembersModal
        open={isMembersOpen}
        onClose={() => setIsMembersOpen(false)}
        group={selectedGroup}
        onBack={handleBackToSettings}
      />
    </>
  );
};

export default TopNav;
