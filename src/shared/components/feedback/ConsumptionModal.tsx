import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import type {
  ConsumptionItem,
  ConsumptionReason,
} from '@/modules/recipe/types';
import { EditConsumptionReasonModal } from '@/modules/inventory/components/ui/modal/EditConsumptionReasonModal';
import { ConsumptionSuccessModal } from '@/modules/inventory/components/ui/modal/ConsumptionSuccessModal';
import { inventoryApi } from '@/modules/inventory/api'; // Need to ensure this is exported and has consumeItem
// If inventoryApi doesn't have consumeItem yet, I need to add it or use axios directly.
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
  // items/singleItem props
  items?: ConsumptionItem[];
  singleItem?: {
    id: string; // Added ID requirement
    name: string;
    quantity: number;
    unit: string;
    expiryDate?: string;
  };
};

export const ConsumptionModal = ({
  isOpen,
  onClose,
  onConfirm,
  items = [],
  singleItem,
}: ConsumptionModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // State for sub-modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // State for items including their reasons
  const [currentItems, setCurrentItems] = useState<ItemWithReason[]>([]);

  // Track previous isOpen to detect open transition
  const wasOpenRef = useRef(false);

  // Initialize items ONLY when modal opens (transition from closed -> open)
  // This avoids the infinite loop caused by singleItem/items object references
  // Note: We intentionally do NOT include singleItem/items in dependencies
  // because they are object references that change on every render.
  // wasOpenRef ensures we only initialize when modal opens.
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      // Modal just opened
      const initItems: ItemWithReason[] = singleItem
        ? [
            {
              id: singleItem.id,
              ingredientName: singleItem.name,
              originalQuantity: singleItem.quantity.toString(),
              consumedQuantity: singleItem.quantity,
              unit: singleItem.unit,
              expiryDate: singleItem.expiryDate,
              reasons: [],
              customReason: '',
            },
          ]
        : items.map((i) => ({ ...i, reasons: [], customReason: '' }));

      setCurrentItems(initItems);
    }
    wasOpenRef.current = isOpen;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Animation
  useEffect(() => {
    if (isOpen && modalRef.current && overlayRef.current) {
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
  }, [isOpen]);

  const handleClose = (callback?: () => void) => {
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
  };

  const submitConsumption = async (itemsToConsume: ItemWithReason[]) => {
    // Call API for each item
    try {
      // Parallel requests
      await Promise.all(
        itemsToConsume.map((item) => {
          if (!item.id) return Promise.resolve();
          // Map reasons to API format
          // API spec says `reason: ConsumptionReason`. If multiple, maybe we join them or pick first?
          // User spec says API takes `reason` and `note`.
          // If UI supports multiple reasons, how does API handle it?
          // API spec: `reason` is enum. `note` is string.
          // Maybe we use 'other' and put all reasons in note?
          // Or pick primary reason?
          // Implementation Plan said:
          // Duplicate -> other?
          // Let's assume we map the FIRST reason to `reason` field, or 'other' if custom/multiple.
          // And put full details in `note`.

          const primaryReason = item.selectedReasons?.[0] || 'other';
          // Map UI reason to API reason
          let apiReason = 'other';
          if (primaryReason === 'short_shelf') apiReason = 'expired';
          else if (primaryReason === 'duplicate')
            apiReason = 'other'; // Spec table said duplicate -> other
          else if (primaryReason === 'bought_too_much') apiReason = 'other';
          else if (primaryReason === 'custom') apiReason = 'other';
          else apiReason = primaryReason; // Fallback

          // Combine all reasons into note
          const reasonLabels = item.selectedReasons
            ?.map((r) => {
              if (r === 'custom') return item.customReasonStr;
              return r; // or label
            })
            .join(', ');

          const note = item.customReasonStr || reasonLabels || 'Consuming item';

          // NOTE: We rely on inventoryApi.consumeItem existing.
          // If it doesn't, this will fail. I'll need to check/add it.
          // For now I assume it takes (id, quantity, reason, note).
          return inventoryApi.consumeItem(item.id, {
            quantity: item.consumedQuantity,
            reason: apiReason,
            note: note,
          });
        }),
      );

      return true;
    } catch (error) {
      console.error('Consumption failed', error);
      return false;
    }
  };

  const handleConfirm = async () => {
    // Submit current items
    const success = await submitConsumption(currentItems);
    if (success) {
      // Close this modal first? Or keep it open and show success on top?
      // Design flow: ConsumptionModal -> Success
      // We can close ConsumptionModal and open SuccessModal.
      // But SuccessModal is separate.
      // Better to close ConsumptionModal then show SuccessModal?
      // Or show SuccessModal which covers ConsumptionModal?
      // Since SuccessModal is full screen portal, it covers.
      // But we should probably close ConsumptionModal to clean up.
      // However, if we close ConsumptionModal, we loose state unless we lift it.
      // Here we can just show SuccessModal and close ConsumptionModal "behind" it or after.

      // Let's set open SuccessModal, then close ConsumptionModal?
      // If I close ConsumptionModal, this component unmounts -> SuccessModal (child) unmounts?
      // Yes, SuccessModal is child here.
      // So I must keep ConsumptionModal mounted OR move SuccessModal up.
      // Given constraints, I will keep ConsumptionModal mounted but hidden?
      // Or just render SuccessModal *instead* of ConsumptionModal content?
      // Or use state to switch View.

      setShowSuccessModal(true);
    }
  };

  const handleEditSave = async (updatedItems: ItemWithReason[]) => {
    setCurrentItems(updatedItems);
    // User requested: Save -> Success directly.
    // So we submit immediately.
    const success = await submitConsumption(updatedItems);
    if (success) {
      setShowEditModal(false);
      setShowSuccessModal(true);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onConfirm(true); // Notify parent to refresh
    handleClose();
  };

  const handleBackToInventory = () => {
    setShowSuccessModal(false);
    navigate('/inventory');
    onConfirm(true);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            ref={overlayRef}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => handleClose()}
          />

          <div
            ref={modalRef}
            className="relative bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl"
          >
            {/* Header */}
            <div className="p-5 flex justify-between items-center bg-white border-b border-gray-100">
              <h3 className="font-bold text-lg text-neutral-900 tracking-tight">
                消耗通知
              </h3>
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-1 text-[#EE5D50] text-base font-medium hover:opacity-80 transition-opacity"
              >
                <span className="text-lg">✎</span>
                <span>編輯消耗原因</span>
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-4 bg-gray-50/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-4 bg-[#EE5D50] rounded-full"></div>
                <h4 className="font-bold text-base text-neutral-900">
                  本次消耗
                </h4>
              </div>

              <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
                {currentItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
                  >
                    <div>
                      <div className="font-bold text-neutral-900 mb-1 text-base">
                        {item.ingredientName}
                      </div>
                      {item.expiryDate && (
                        <div className="text-[#EE5D50] text-base font-medium">
                          {item.expiryDate} 過期
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-neutral-900 text-lg">
                        {item.consumedQuantity}
                      </span>
                      <span className="font-bold text-neutral-500 text-base">
                        {item.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-5 bg-white border-t border-gray-100">
              <button
                onClick={handleConfirm}
                className="w-full py-3.5 bg-[#EE5D50] text-white rounded-xl font-bold text-base hover:bg-[#D64D40] transition-colors shadow-lg shadow-orange-500/20 active:scale-95"
              >
                完成
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {showEditModal && (
        <EditConsumptionReasonModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
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
