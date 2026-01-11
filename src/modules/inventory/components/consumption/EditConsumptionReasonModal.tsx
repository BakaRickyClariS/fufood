import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import consumingImage from '@/assets/images/recipe/consuming.webp';
import type {
  ConsumptionItem,
  ConsumptionReason,
} from '@/modules/recipe/types';
import { ConsumptionReasonSelect } from '@/shared/components/ui/ConsumptionReasonSelect';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

type ItemWithReason = ConsumptionItem & {
  selectedReasons: ConsumptionReason[];
  customReasonStr: string;
};

type EditConsumptionReasonModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (items: ItemWithReason[]) => void;
  items: ConsumptionItem[];
};

export const EditConsumptionReasonModal: React.FC<
  EditConsumptionReasonModalProps
> = ({ isOpen, onClose, onConfirm, items }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Initialize state on mount.
  const [editingItems, setEditingItems] = useState<ItemWithReason[]>(() =>
    items.map((item) => ({
      ...item,
      selectedReasons: item.reasons || [],
      customReasonStr: item.customReason || '',
    })),
  );

  // Replace useEffect with useGSAP
  useGSAP(
    () => {
      if (isOpen && modalRef.current) {
        gsap.fromTo(
          modalRef.current,
          { x: '100%' },
          { x: '0%', duration: 0.4, ease: 'power3.out' },
        );
      }
    },
    { dependencies: [isOpen] },
  );

  const { contextSafe } = useGSAP({ scope: modalRef });

  const handleClose = contextSafe(() => {
    gsap.to(modalRef.current, {
      x: '100%',
      duration: 0.3,
      ease: 'power3.in',
      onComplete: onClose,
    });
  });

  const handleUpdateItem = (
    index: number,
    updates: Partial<ItemWithReason>,
  ) => {
    setEditingItems((prev) => {
      const newItems = [...prev];
      newItems[index] = { ...newItems[index], ...updates };
      return newItems;
    });
  };

  const handleSave = () => {
    onConfirm(editingItems);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-150 flex justify-end pointer-events-none">
      <div
        ref={modalRef}
        className="w-full h-full bg-[#f6f6f6] pointer-events-auto flex flex-col"
      >
        {/* Header */}
        <div className="shrink-0 bg-white px-4 py-3 flex items-center justify-between shadow-sm z-10">
          <button onClick={handleClose} className="p-1 -ml-1">
            <ChevronLeft size={24} className="text-neutral-900" />
          </button>
          <h1 className="text-lg font-bold text-neutral-900 absolute left-1/2 -translate-x-1/2">
            編輯消耗原因
          </h1>
          <div className="w-8" />
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          {/* Hero Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-48 h-48">
              <img
                src={consumingImage}
                alt="Consuming Mascot"
                className="w-full h-full object-contain scale-130"
              />
            </div>
          </div>

          {/* List Content Container */}
          <div className="bg-white rounded-3xl p-5 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-5 bg-primary-500 rounded-full"></div>
              <h4 className="font-bold text-base text-neutral-900">
                食材消耗列表
              </h4>
            </div>

            <div className="space-y-4">
              {editingItems.map((item, index) => (
                <div key={index} className="bg-primary-50 rounded-xl p-4">
                  {/* Item Info Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-base text-neutral-900 mb-1">
                        {item.ingredientName}
                      </span>
                      {item.expiryDate ? (
                        <span className="text-primary-500 text-sm font-medium">
                          {new Date(item.expiryDate).toLocaleDateString('zh-TW', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                          })} 過期
                        </span>
                      ) : (
                        <span className="text-neutral-400 text-base">
                          無期限
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="font-bold text-base text-neutral-900">
                        {item.consumedQuantity}
                      </span>
                      <span className="text-base text-neutral-900 font-medium">
                        條
                      </span>
                    </div>
                  </div>

                  {/* Reason Select */}
                  <div className="w-full">
                    <ConsumptionReasonSelect
                      value={item.selectedReasons || []}
                      onChange={(val) =>
                        handleUpdateItem(index, { selectedReasons: val })
                      }
                      customReason={item.customReasonStr || ''}
                      onCustomReasonChange={(val) =>
                        handleUpdateItem(index, { customReasonStr: val })
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer - Fixed at bottom via flex layout */}
        <div className="shrink-0 p-5 bg-white border-t border-gray-100 z-20 pb-safe rounded-t-3xl shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <Button
            onClick={handleSave}
            className="w-full bg-primary-500 hover:bg-primary-500/90 text-white rounded-xl h-12 text-base font-bold shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
          >
            儲存
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
