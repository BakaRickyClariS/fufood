import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/shared/components/ui/sheet';
import { COVER_IMAGES } from '@/modules/planning/constants/coverImages';

type CoverImagePickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedImage: string;
  onSelect: (image: string) => void;
};

export const CoverImagePicker = ({
  open,
  onOpenChange,
  selectedImage,
  onSelect,
}: CoverImagePickerProps) => {
  const [tempSelected, setTempSelected] = useState(selectedImage);

  const handleApply = () => {
    onSelect(tempSelected);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-xl px-4 pt-6 pb-8 overflow-y-auto">
        <SheetHeader className="mb-6 text-left">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-red-400 rounded-full" />
            <SheetTitle>選擇圖庫照片</SheetTitle>
          </div>
        </SheetHeader>
        
        <div className="grid grid-cols-3 gap-3 mb-20">
          {COVER_IMAGES.map((img, index) => {
            const isSelected = tempSelected === img;
            return (
              <div 
                key={index}
                onClick={() => setTempSelected(img)}
                className={cn(
                  "relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all",
                  isSelected ? "border-red-400" : "border-transparent"
                )}
              >
                <img src={img} alt={`Cover ${index}`} className="w-full h-full object-cover" />
                {isSelected && (
                  <div className="absolute top-2 left-2 w-6 h-6 bg-red-400 rounded-full flex items-center justify-center shadow-sm">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <SheetFooter className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
          <button
            onClick={handleApply}
            className="w-full py-3 bg-red-400 text-white rounded-xl font-medium active:scale-98 transition-transform"
          >
            套用
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
