import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ChevronLeft, ArrowLeft } from 'lucide-react';
import type {
  ConsumptionItem,
  ConsumptionReason,
} from '@/modules/recipe/types';
import { ConsumptionReasonSelect } from '@/shared/components/ui/ConsumptionReasonSelect';

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
  // Note: Parent must conditionally render this component for state to reset on reopen.
  const [editingItems, setEditingItems] = useState<ItemWithReason[]>(() =>
    items.map((item) => ({
      ...item,
      selectedReasons: item.reasons || [],
      customReasonStr: item.customReason || '',
    })),
  );

  // useEffect(() => {
  //   if (isOpen && modalRef.current) {
  //     console.log('EditModal: Animate In');
  //     // const tl = gsap.timeline();
  //     // tl.fromTo(
  //     //   modalRef.current,
  //     //   { x: '100%' },
  //     //   { x: '0%', duration: 0.4, ease: 'power3.out' },
  //     // );
  //   }
  // }, [isOpen]);

  const handleClose = () => {
    // if (modalRef.current) {
    //   gsap.to(modalRef.current, {
    //     x: '100%',
    //     duration: 0.3,
    //     ease: 'power3.in',
    //     onComplete: onClose,
    //   });
    // } else {
    onClose();
    // }
  };

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
    // Map internal state back to ConsumptionItem structure if needed
    // The parent expects ItemWithReason[] probably
    onConfirm(editingItems);
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[115] flex justify-end">
      {/* Overlay is handled by ConsumptionModal or transparent?
          Design says full page slide in. Usually covers everything.
          We can add a backdrop if we want.
      */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"
        onClick={handleClose}
      />

      <div
        ref={modalRef}
        className="relative w-full h-full bg-[#FAFAFA] shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-white px-5 py-4 flex items-center gap-3 border-b border-gray-100 shrink-0">
          <button
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="text-neutral-600" size={24} />
          </button>
          <h2 className="text-xl font-bold text-neutral-900">編輯消耗原因</h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          {/* Mascot */}
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 relative">
              <img
                src="/assets/consuming.png"
                alt="Consuming Mascot"
                className="w-full h-full object-contain drop-shadow-lg animate-bounce-slow"
              />
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
            {editingItems.map((item, index) => (
              <div key={index} className="space-y-3">
                {/* Item Info Card */}
                <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden group">
                  {/* Decorative stripe */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#EE5D50]"></div>

                  {/* Image Placeholder or Icon */}
                  <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center shrink-0 border border-gray-100">
                    <span className="text-2xl">🥬</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-neutral-900 truncate">
                      {item.ingredientName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1">
                      <span className="bg-gray-100 px-2 py-0.5 rounded text-neutral-600 font-medium">
                        {item.consumedQuantity} {item.unit}
                      </span>
                      {item.expiryDate && (
                        <span className="text-[#EE5D50] flex items-center gap-1 font-medium bg-red-50 px-2 py-0.5 rounded">
                          ⏳ {item.expiryDate} 到期
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reason Select */}
                <div className="pl-2">
                  <label className="text-sm font-bold text-neutral-700 mb-1.5 block flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#EE5D50]"></span>
                    選擇消耗原因
                  </label>
                  {/* Temporarily replaced with placeholder for debugging */}
                  <div className="p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 text-sm">
                    [Debug placeholder - Select disabled]
                  </div>
                  {/* <ConsumptionReasonSelect
                    value={item.selectedReasons || []}
                    onChange={(val) =>
                      handleUpdateItem(index, { selectedReasons: val })
                    }
                    customReason={item.customReasonStr || ''}
                    onCustomReasonChange={(val) =>
                      handleUpdateItem(index, { customReasonStr: val })
                    }
                  /> */}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100">
          <button
            onClick={handleSave}
            className="w-full bg-[#EE5D50] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all text-base"
          >
            儲存
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
