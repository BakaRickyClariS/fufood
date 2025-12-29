import { type FC, useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import {
  searchFriends,
  getInviteCode,
} from '@/modules/groups/store/groupsSlice';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Search } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { QRCodeSVG } from 'qrcode.react';
import type { Group } from '../../types/group.types';
import TabsUnderline from '@/shared/components/ui/animated-tabs/TabsUnderline';

type InviteFriendModalProps = {
  open: boolean;
  onClose: () => void;
  group: Group | null;
};

export const InviteFriendModal: FC<InviteFriendModalProps> = ({
  open,
  onClose,
  group,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState<'search' | 'qr'>('search');
  const [searchQuery, setSearchQuery] = useState('');

  // Redux State
  const { searchResults, isSearching, inviteCode, isGeneratingCode } =
    useSelector((state: RootState) => state.groups);

  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const tabOptions = [
    { id: 'search', label: '搜尋成員' },
    { id: 'qr', label: '條碼邀請' },
  ];

  // Optimization: useGSAP
  const { contextSafe } = useGSAP(
    () => {
      if (open) {
        const tl = gsap.timeline();
        tl.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: 'power2.out' },
        );
        tl.fromTo(
          modalRef.current,
          { y: '100%', opacity: 0 },
          { y: '0%', opacity: 1, duration: 0.5, ease: 'back.out(1.2)' },
          '-=0.2',
        );
      }
    },
    { scope: containerRef, dependencies: [open] },
  );

  const handleClose = contextSafe(() => {
    const tl = gsap.timeline({
      onComplete: onClose,
    });
    tl.to(modalRef.current, {
      y: '100%',
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
    });
    tl.to(
      overlayRef.current,
      { opacity: 0, duration: 0.3, ease: 'power2.in' },
      '-=0.3',
    );
  });

  // Search Logic (Debounce)
  useEffect(() => {
    if (activeTab === 'search' && searchQuery) {
      const timer = setTimeout(() => {
        dispatch(searchFriends(searchQuery));
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, activeTab, dispatch]);

  // QR Logic
  useEffect(() => {
    if (open && activeTab === 'qr' && group?.id) {
      dispatch(getInviteCode(group.id));
    }
  }, [open, activeTab, group, dispatch]);

  // Copy Link Logic
  const handleCopyLink = () => {
    if (inviteCode?.inviteUrl) {
      navigator.clipboard.writeText(inviteCode.inviteUrl).then(() => {
        alert('邀請連結已複製！');
      });
    }
  };

  // Handle Invitation
  const handleInvite = (friendId: string) => {
    console.log(`Inviting friend ${friendId} to group ${group?.id}`);
    alert('已發送邀請！');
  };

  if (!open) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[60] flex items-end justify-center pointer-events-auto"
    >
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative w-full bg-stone-50 max-w-layout-container mx-auto rounded-t-3xl overflow-hidden flex flex-col h-[85vh] shadow-2xl"
      >
        {/* Header Tabs */}
        <div className="bg-white rounded-t-3xl border-b border-stone-100 flex-shrink-0 relative">
          <TabsUnderline
            tabs={tabOptions}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as 'search' | 'qr')}
            className="pt-6 px-6 !shadow-none justify-center gap-8"
            animated
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-stone-50 p-6">
          {activeTab === 'search' ? (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-stone-900">邀請好友</h2>

              {/* ID Input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-900">ID</label>
                <div className="relative">
                  <Input
                    placeholder="Add value"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 bg-white border-stone-200 rounded-xl pr-10 focus:ring-[#EE5D50] focus:border-[#EE5D50]"
                  />
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 text-stone-900" />
                </div>
                <p className="text-xs text-stone-500 flex items-center gap-1">
                  <span className="inline-block w-4 h-4 rounded-full border border-stone-400 text-center leading-3 text-[10px]">
                    i
                  </span>
                  填寫信箱或LINE ID
                </p>
              </div>

              {/* Search Results */}
              <div className="space-y-4">
                <p className="text-sm font-bold text-stone-500">搜尋結果</p>

                {isSearching ? (
                  <div className="text-center py-8 text-stone-400">
                    搜尋中...
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-0 divide-y divide-stone-200 border-t border-b border-stone-200 bg-white rounded-xl overflow-hidden">
                    {searchResults.map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center justify-between p-4"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={friend.avatar}
                            alt={friend.name}
                            className="w-10 h-10 rounded-full bg-stone-200 object-cover"
                          />
                          <span className="font-bold text-stone-700">
                            {friend.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <div className="text-center py-8 text-stone-400">
                    找不到使用者
                  </div>
                ) : null}
              </div>

              {/* Bottom Invite Button */}
              {searchResults.length > 0 && (
                <div className="pt-4">
                  <Button
                    className="w-full h-14 bg-[#EE5D50] hover:bg-[#D94A3D] text-white text-lg font-bold rounded-xl shadow-sm"
                    onClick={() => handleInvite(searchResults[0].id)}
                  >
                    邀請
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center space-y-8 pb-10">
              <h2 className="text-xl font-bold text-stone-900">
                掃描QRcode 即可加入
              </h2>

              <div className="bg-white p-4 rounded-3xl shadow-sm w-64 h-64 flex items-center justify-center">
                {isGeneratingCode ? (
                  <span className="text-stone-400">生成中...</span>
                ) : inviteCode?.inviteUrl ? (
                  <QRCodeSVG
                    value={inviteCode.inviteUrl}
                    size={200}
                    level="M"
                    includeMargin={true}
                  />
                ) : (
                  <div className="w-full h-full bg-stone-100 rounded-xl" />
                )}
              </div>

              <p className="text-stone-500 font-medium">24小時內有效</p>

              <Button
                className="w-full h-14 bg-[#EE5D50] hover:bg-[#D94A3D] text-white text-lg font-bold rounded-xl shadow-sm mt-auto"
                onClick={handleCopyLink}
              >
                分享邀請連結
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
