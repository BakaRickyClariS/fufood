import { type FC, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import { getInviteCode } from '@/modules/groups/store/groupsSlice';
import { Button } from '@/shared/components/ui/button';
import { RefreshCw } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { QRCodeSVG } from 'qrcode.react';
import type { Group } from '../../types/group.types';

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

  // 鎖定背景滾動
  useEffect(() => {
    if (open) {
      // 鎖定背景滾動
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      // 解除鎖定
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    return () => {
      // 清理
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [open]);

  // Redux State
  const { inviteCode, isGeneratingCode } = useSelector(
    (state: RootState) => state.groups,
  );

  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 下滑關閉用
  const dragStartY = useRef<number | null>(null);
  const DRAG_THRESHOLD = 100;

  // GSAP 動畫
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

  // 載入 QR Code
  useEffect(() => {
    if (open && group?.id) {
      dispatch(getInviteCode(group.id));
    }
  }, [open, group, dispatch]);

  // 重新產生 QR Code
  const handleRefreshQR = useCallback(() => {
    if (group?.id) {
      dispatch(getInviteCode(group.id));
    }
  }, [group, dispatch]);

  // 建構 QR Code URL
  // 格式: https://api.fufood.jocelynh.me/oauth/line/init?invite={token}&ref=https://fufood.jocelynh.me/invite/{token}
  // OAuth 完成後會導向 /invite/{token}，由 InviteAcceptPage 處理加入流程並自動切換群組
  const token = inviteCode?.token || inviteCode?.code;
  const qrCodeUrl =
    token && group?.id
      ? `https://api.fufood.jocelynh.me/oauth/line/init?invite=${token}&ref=https://fufood.jocelynh.me/invite/${token}`
      : inviteCode?.inviteUrl || '';

  // 複製連結
  const handleCopyLink = () => {
    if (qrCodeUrl) {
      navigator.clipboard.writeText(qrCodeUrl).then(() => {
        alert('邀請連結已複製！');
      });
    }
  };

  // 下滑關閉 - Touch Events
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null || !modalRef.current) return;

    const deltaY = e.touches[0].clientY - dragStartY.current;
    if (deltaY > 0) {
      // 只處理向下滑動
      gsap.set(modalRef.current, { y: deltaY });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStartY.current === null || !modalRef.current) return;

    const deltaY = e.changedTouches[0].clientY - dragStartY.current;

    if (deltaY > DRAG_THRESHOLD) {
      // 超過閥值，關閉 Modal
      handleClose();
    } else {
      // 沒超過閥值，彈回原位
      gsap.to(modalRef.current, {
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    }

    dragStartY.current = null;
  };

  if (!open) return null;

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 z-110 flex items-end justify-center pointer-events-auto"
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
        className="relative w-full bg-neutral-50 max-w-layout-container mx-auto rounded-t-3xl overflow-hidden flex flex-col shadow-2xl"
        style={{ maxHeight: 'min(85vh, 600px)', touchAction: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 下滑提示條 */}
        <div className="flex justify-center py-3">
          <div className="w-10 h-1 bg-neutral-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 pb-4">
          <h2 className="text-xl font-bold text-neutral-900 text-center">
            邀請好友加入
          </h2>
        </div>

        {/* QR Code 區域 */}
        <div className="flex-1 overflow-y-auto w-full">
          <div className="flex flex-col items-center justify-center px-6 space-y-3 min-h-full">
            <p className="text-neutral-600 font-medium mt-4">
              掃描 QR Code 即可加入群組
            </p>

            <div className="bg-white p-4 rounded-3xl shadow-sm w-64 h-64 flex items-center justify-center shrink-0">
              {isGeneratingCode ? (
                <span className="text-neutral-400">生成中...</span>
              ) : qrCodeUrl ? (
                <QRCodeSVG
                  value={qrCodeUrl}
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              ) : (
                <div className="w-full h-full bg-neutral-100 rounded-xl" />
              )}
            </div>

            <p className="text-neutral-500 text-sm">24 小時內有效</p>

            {/* 重新產生按鈕 */}
            <button
              onClick={handleRefreshQR}
              disabled={isGeneratingCode}
              className="flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium disabled:opacity-50 pb-4"
            >
              <RefreshCw
                className={`w-4 h-4 ${isGeneratingCode ? 'animate-spin' : ''}`}
              />
              重新產生
            </button>
          </div>
        </div>

        {/* 底部按鈕 */}
        <div className="shrink-0 px-6 pb-8">
          <Button
            className="w-full h-14 bg-primary-400 hover:bg-primary-500 text-white text-lg font-bold rounded-xl shadow-sm"
            onClick={handleCopyLink}
          >
            分享邀請連結
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
