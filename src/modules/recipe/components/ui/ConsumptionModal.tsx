import type { ConsumptionItem } from '@/modules/recipe/types';


type ConsumptionModalProps = {
  isOpen: boolean;
  onConfirm: (addToShoppingList: boolean) => void;
  onEdit: () => void;
  items: ConsumptionItem[];
};

export const ConsumptionModal = ({
  isOpen,
  onConfirm,
  onEdit,
  items,
}: ConsumptionModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm px-6">
      <div className="bg-white rounded-[20px] w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-5 flex justify-between items-center">
          <h3 className="font-bold text-xl text-gray-900 tracking-tight">消耗通知</h3>
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-[#EE5D50] text-sm font-medium hover:opacity-80 transition-opacity"
          >
            <span className="text-lg">✎</span>
            <span>加入消耗原因</span>
          </button>
        </div>

        <div className="px-5 pb-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#EE5D50] rounded-full"></div>
            <h4 className="font-bold text-gray-900">本次消耗</h4>
          </div>
          
          <div className="space-y-3 max-h-[50vh] overflow-y-auto">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-100/80 p-4 rounded-xl"
              >
                <div>
                  <div className="font-bold text-gray-900 mb-1 text-[15px]">
                    {item.ingredientName}
                  </div>
                  <div className="text-[#EE5D50] text-xs font-medium bg-[#EE5D50]/10 px-2 py-0.5 rounded inline-block">
                    2025/01/15 過期
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-gray-900 text-lg">{item.consumedQuantity}</span>
                  <span className="font-bold text-gray-900 text-sm">{item.unit}</span>
                  <button className="ml-2 text-gray-400 hover:text-gray-600">
                    <span className="sr-only">Expand</span>
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 space-y-3">
          <button
            onClick={() => onConfirm(true)}
            className="w-full py-3.5 bg-[#EE5D50] text-white rounded-xl font-bold text-[15px] hover:bg-[#E54D40] transition-colors shadow-lg shadow-orange-200"
          >
            已消耗，加入採買清單
          </button>
          <button
            onClick={() => onConfirm(false)}
            className="w-full py-3.5 bg-white border-2 border-gray-100 text-gray-900 rounded-xl font-bold text-[15px] hover:bg-gray-50 transition-colors"
          >
            僅消耗，暫不採買
          </button>
        </div>
      </div>
    </div>
  );
};
