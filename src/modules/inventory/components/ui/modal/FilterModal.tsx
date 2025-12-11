import React, { useEffect, useRef, useState } from 'react';
import { X, Info, Check } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import gsap from 'gsap';

type FilterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onApply: (status: string[], attribute: string[]) => void;
};

const statusOptions = ['即將到期', '低庫存', '已過期', '有庫存'];
const attributeOptions = ['葉菜類', '瓜果類', '菇菌類', '根莖類'];

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedAttribute, setSelectedAttribute] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      const tl = gsap.timeline();

      // Animate overlay
      tl.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' },
      );

      // Animate modal (slide up)
      tl.fromTo(
        modalRef.current,
        { y: '100%', opacity: 0 },
        { y: '0%', opacity: 1, duration: 0.5, ease: 'back.out(1.2)' },
        '-=0.2',
      );
    }
  }, [isOpen]);

  const handleClose = () => {
    const tl = gsap.timeline({
      onComplete: onClose,
    });

    // Animate modal (slide down)
    tl.to(modalRef.current, {
      y: '100%',
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
    });

    // Animate overlay
    tl.to(
      overlayRef.current,
      { opacity: 0, duration: 0.3, ease: 'power2.in' },
      '-=0.3',
    );
  };

  const handleClear = () => {
    setSelectedStatus([]);
    setSelectedAttribute([]);
  };

  const handleApply = () => {
    onApply(selectedStatus, selectedAttribute);
    handleClose();
  };
  
  const toggleStatus = (status: string) => {
    setSelectedStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };

  const toggleAttribute = (attr: string) => {
    setSelectedAttribute(prev => 
      prev.includes(attr) 
        ? prev.filter(a => a !== attr) 
        : [...prev, attr]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative w-full bg-white max-w-layout-container mx-auto rounded-t-3xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={handleClose}
            className="p-2 -ml-2 text-neutral-500 hover:text-neutral-900"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-bold text-neutral-900 absolute left-1/2 -translate-x-1/2">
            篩選
          </h2>
          <button
            onClick={handleClear}
            className="text-[#EE5D50] text-sm font-medium hover:text-[#D94A3D]"
          >
            清除篩選
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8 overflow-y-auto pb-48"> {/* Increased padding to avoid overlap with taller footer */}
          {/* Status Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-neutral-900">狀態篩選</h3>
              <Info className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="flex flex-wrap gap-3">
              {statusOptions.map((status) => {
                const isSelected = selectedStatus.includes(status);
                return (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1
                      ${
                        isSelected
                          ? 'bg-[#EE5D50] text-white shadow-md shadow-orange-100'
                          : 'bg-gray-100 text-neutral-500 hover:bg-gray-200'
                      }
                    `}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {status}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Attribute Filter */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-neutral-900">屬性篩選</h3>
            <div className="flex flex-wrap gap-3">
              {attributeOptions.map((attr) => {
                const isSelected = selectedAttribute.includes(attr);
                return (
                  <button
                    key={attr}
                    onClick={() => toggleAttribute(attr)}
                    className={`
                      px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1
                      ${
                        isSelected
                          ? 'bg-[#EE5D50] text-white shadow-md shadow-orange-100'
                          : 'bg-gray-100 text-neutral-500 hover:bg-gray-200'
                      }
                    `}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {attr}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-24 bg-white border-t border-gray-100">
          <Button
            className="w-full bg-[#EE5D50] hover:bg-[#D94A3D] text-white rounded-xl h-12 text-base font-medium shadow-orange-200"
            onClick={handleApply}
          >
            套用
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;
