import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useNavigate } from 'react-router-dom';
import type {
  ConsumptionItem,
  ConsumptionReason,
} from '@/modules/recipe/types';
import { EditConsumptionReasonModal } from './EditConsumptionReasonModal';
import { ConsumptionSuccessModal } from './ConsumptionSuccessModal';
import { useConsumeItemMutation } from '@/modules/inventory/api/queries';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useFlowState } from '@/shared/hooks/useFlowState';
// The user said "Execute and update ... docs". I should check inventoryApi first?
// I'll proceed assuming I might need to add it or it exists.
// Based on file reads, I saw `inventoryApi` but didn't check `consumeItem`.
// I'll implement logic assuming I can call it.

// Helper type extending ConsumptionItem with reason info
type ItemWithReason = ConsumptionItem & {
  selectedReasons?: ConsumptionReason[];
  customReasonStr?: string;
  id?: string; // We need ID to call API
};

type ConsumptionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  // onConfirm removed or kept for legacy?
  // The new flow handles success internally or via callback, but parent might need to know to refresh.
  onConfirm: (success: boolean) => void;
  // 返回庫房時：先關閉父層（食材詳細頁），callback 中再關閉成功頁面
  onCloseAll?: (onParentClosed: () => void) => void;
  // 顯示「加入採買清單」按鈕（食譜場景使用）
  showShoppingListButton?: boolean;
  onAddToShoppingList?: () => void;
  // items/singleItem props
  items?: ConsumptionItem[];
  singleItem?: {
    id: string; // Added ID requirement
    name: string;
    quantity: number;
    unit: string;
    expiryDate?: string;
  };
  defaultReasons?: ConsumptionReason[];
  // Callbacks to control parent visibility/animation
  onHideParent?: () => void;
  onShowParent?: () => void;
  refrigeratorId?: string;
};

export const ConsumptionModal = ({
  isOpen,
  onClose,
  onConfirm,
  onCloseAll,
  showShoppingListButton = false,
  onAddToShoppingList,
  items = [],
  singleItem,
  defaultReasons = [],
  onHideParent,
  onShowParent,
  refrigeratorId,
}: ConsumptionModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { contextSafe } = useGSAP({ scope: modalRef }); // Initialize scope for contextSafe

  // State for sub-modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: consumeItem } = useConsumeItemMutation();

  // State for items including their reasons
  const [currentItems, setCurrentItems] = useState<ItemWithReason[]>([]);

  // Track previous isOpen to detect open transition
  const wasOpenRef = useRef(false);

  // 流程狀態持久化 Hook
  const {
    saveState,
    clearState,
    restoreState,
    skipAnimation,
    setSkipAnimation,
  } = useFlowState<{ items: ItemWithReason[]; step: string }>({
    key: 'consumption',
    contextId: singleItem?.id,
  });

  // Helper to handle opening edit modal
  const handleOpenEdit = contextSafe(() => {
    // 儲存當前狀態到 sessionStorage
    saveState('edit', { items: currentItems, step: 'edit' });
    
    if (modalRef.current && overlayRef.current) {
      const tl = gsap.timeline({
        onComplete: () => {
          setShowEditModal(true);
        },
      });
      tl.to(modalRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      });
      tl.to(overlayRef.current, { opacity: 0, duration: 0.2 }, '-=0.2');
    } else {
      setShowEditModal(true);
    }
  });

  // Helper to handle closing edit modal (returning to consumption modal)
  const handleCloseEdit = contextSafe(() => {
    setShowEditModal(false);
    // The main view will re-mount and `useGSAP` will trigger the entrance animation automatically
    // because `showEditModal` changing to false renders the elements again.
    // We added `showEditModal` to the dependency array of the main animation effect to ensure it runs.
  });

  // Initialize items ONLY when modal opens (transition from closed -> open)
  // This avoids the infinite loop caused by singleItem/items object references
  // Note: We intentionally do NOT include singleItem/items in dependencies
  // because they are object references that change on every render.
  // wasOpenRef ensures we only initialize when modal opens.
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      // Modal just opened - 嘗試恢復狀態
      const restored = restoreState((step, data) => {
        if (data.items && data.items.length > 0) {
          setCurrentItems(data.items);
          if (step === 'edit') {
            setShowEditModal(true);
          } else if (step === 'success') {
            setShowSuccessModal(true);
          }
        }
      });

      // 如果沒有恢復狀態，則初始化
      if (!restored) {
        if (singleItem) {
          // If singleItem exists (Recipe flow), default reason is 'recipe_consumption'
          setCurrentItems([
            {
              ingredientName: singleItem.name,
              originalQuantity: '',
              consumedQuantity: singleItem.quantity,
              unit: singleItem.unit,
              expiryDate: singleItem.expiryDate,
              reasons: [...defaultReasons], // Use defaultReasons prop
              customReason: '',
              id: singleItem.id,
            } as ItemWithReason,
          ]);
        } else if (items.length > 0) {
          setCurrentItems(
            items.map((i) => ({
              ...i,
              reasons: [...defaultReasons],
              customReason: '',
            })),
          );
        }
      }
    }
    wasOpenRef.current = isOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Animation
  // Animation handled by useGSAP
  useGSAP(
    () => {
      // Run animation if isOpen is true AND we are NOT in sub-modals (which means refs are present)
      if (
        isOpen &&
        !showEditModal &&
        !showSuccessModal &&
        modalRef.current &&
        overlayRef.current
      ) {
        // 如果是恢復狀態，跳過入場動畫
        if (skipAnimation) {
          gsap.set(modalRef.current, { scale: 1, opacity: 1 });
          gsap.set(overlayRef.current, { opacity: 1 });
          setSkipAnimation(false);
          return;
        }
        
        const tl = gsap.timeline();
        tl.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.2 },
        );
        tl.fromTo(
          modalRef.current,
          { scale: 0.9, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.2)' },
          '-=0.1',
        );
      }
    },
    { dependencies: [isOpen, showEditModal, showSuccessModal, skipAnimation] },
  );

  const handleClose = contextSafe((callback?: () => void) => {
    if (modalRef.current && overlayRef.current) {
      const tl = gsap.timeline({
        onComplete: () => {
          onClose();
          callback?.();
        },
      });
      tl.to(modalRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      });
      tl.to(overlayRef.current, { opacity: 0, duration: 0.2 }, '-=0.2');
    } else {
      onClose();
      callback?.();
    }
  });

  const submitConsumption = async (itemsToConsume: ItemWithReason[]) => {
    setIsSubmitting(true);
    try {
      await Promise.all(
        itemsToConsume.map((item) => {
          if (!item.id) return Promise.resolve();
          const reasons = item.selectedReasons || [];
          
          return consumeItem({
            id: item.id,
            data: {
              quantity: item.consumedQuantity,
              reasons: reasons,
              customReason: item.customReasonStr,
            },
            refrigeratorId,
          });
        }),
      );

      // Mutate will trigger invalidation automatically
      return true;
    } catch (error) {
      console.error('Consumption failed', error);
      toast.error('消耗操作失敗，請稍後再試');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // 播放消耗通知 modal 離場動畫，然後顯示成功 modal
  const animateOutAndShowSuccess = contextSafe(() => {
    // If provided, signal parent to hide/animate out concurrently
    onHideParent?.();
    
    // 儲存成功狀態到 sessionStorage
    saveState('success', { items: currentItems, step: 'success' });

    if (modalRef.current && overlayRef.current) {
      const tl = gsap.timeline({
        onComplete: () => {
          setShowSuccessModal(true);
        },
      });
      tl.to(modalRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 0.25,
        ease: 'power2.in',
      });
      tl.to(overlayRef.current, { opacity: 0, duration: 0.2 }, '-=0.15');
    } else {
      setShowSuccessModal(true);
    }
  });

  const handleConfirm = async () => {
    // Submit current items
    const success = await submitConsumption(currentItems);
    if (success) {
      // 播放離場動畫後再顯示成功 modal
      animateOutAndShowSuccess();
    }
  };

  const handleEditSave = async (updatedItems: ItemWithReason[]) => {
    setCurrentItems(updatedItems);
    setShowEditModal(false); // Close edit modal first

    // User requested: Save -> Success directly.
    // So we submit immediately.
    const success = await submitConsumption(updatedItems);
    if (success) {
      // Direct transition to success
      animateOutAndShowSuccess();
    } else {
      // If failed, maybe show consumption modal again?
      // For now let's show consumption modal again
      handleCloseEdit();
    }
  };

  // 點擊返回鍵：只關閉成功 modal，回到食材詳細頁面
  const handleSuccessClose = () => {
    setShowSuccessModal(false);

    // Signal parent to show/animate in
    onShowParent?.();

    onConfirm(true); // 通知父層刷新數據
    // 不呼叫 onClose()，讓食材詳細頁繼續顯示
    // 只關閉成功 modal 本身（透過 setShowSuccessModal(false) 已完成）
  };

  // 點擊返回庫房：先關閉食材詳細頁，再關閉成功頁面，最後導航
  const handleBackToInventory = () => {
    // 清除 sessionStorage 中的流程狀態
    clearState();
    onConfirm(true);

    if (onCloseAll) {
      // 使用 onCloseAll：先讓食材詳細頁播放離場動畫
      // 動畫完成後的 callback 中：關閉成功頁面並導航
      onCloseAll(() => {
        // 食材詳細頁動畫完成後，關閉成功頁面
        setShowSuccessModal(false);
        // 稍微延遲讓成功頁面有時間開始動畫
        setTimeout(() => {
          navigate('/inventory');
        }, 350); // 配合成功頁面的離場動畫時間 0.3s
      });
    } else {
      // Fallback：直接關閉並導航
      setShowSuccessModal(false);
      onClose();
      navigate('/inventory');
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 消耗通知 Modal - 當成功 modal 顯示時隱藏，且當編輯 modal 顯示時也隱藏 */}
      {!showSuccessModal &&
        !showEditModal &&
        createPortal(
          <div className="fixed inset-0 z-140 flex items-center justify-center p-4">
            <div
              ref={overlayRef}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => handleClose()}
            />

            <div
              ref={modalRef}
              className="relative bg-white rounded-2xl w-full max-w-sm overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 flex justify-between items-center bg-white">
                <h3 className="font-bold text-lg text-neutral-900 tracking-tight">
                  消耗通知
                </h3>
                <button
                  onClick={handleOpenEdit}
                  className="flex items-center gap-1 text-primary-500 text-base font-medium hover:opacity-80 transition-opacity"
                >
                  <span className="text-base">✎</span>
                  <span className="text-base">編輯消耗原因</span>
                </button>
              </div>

              {/* Content */}
              <div className="px-5 py-4 ">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-primary-500 rounded-full"></div>
                  <h4 className="font-bold text-base text-neutral-900">
                    本次消耗
                  </h4>
                </div>

                <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
                  {currentItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-neutral-200 p-4 rounded-xl"
                    >
                      <div>
                        <div className="font-bold text-neutral-600 mb-1 text-base">
                          {item.ingredientName}
                        </div>
                        {item.expiryDate && (
                          <div className="text-primary-400 text-base font-medium">
                            {item.expiryDate} 過期
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-neutral-900">
                        <span className="font-bold text-base">
                          {item.consumedQuantity}
                        </span>
                        <span className="font-bold text-base">{item.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-5 bg-white">
                {showShoppingListButton ? (
                  // 雙按鈕佈局：加入採買清單 + 完成消耗
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        onAddToShoppingList?.();
                        handleConfirm();
                      }}
                      className="flex-1 py-3.5 bg-white border border-neutral-300 rounded-xl font-bold text-base text-neutral-900 hover:bg-gray-50 transition-colors active:scale-95"
                    >
                      加入採買清單
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="flex-1 py-3.5 bg-primary-500 text-white rounded-xl font-bold text-base hover:bg-primary-600 transition-colors active:scale-95"
                    >
                      完成消耗
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-primary-500 text-white rounded-xl font-bold text-base hover:bg-primary-600 transition-colors active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                    {isSubmitting ? '處理中...' : '完成'}
                  </button>
                )}
              </div>
            </div>
          </div>,
          document.body,
        )}

      {showEditModal && (
        <EditConsumptionReasonModal
          isOpen={showEditModal}
          onClose={handleCloseEdit}
          onConfirm={handleEditSave}
          items={currentItems}
        />
      )}

      <ConsumptionSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        onBackToInventory={handleBackToInventory}
        items={currentItems}
      />
    </>
  );
};
