import type { FC } from 'react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { ChevronLeft, Check } from 'lucide-react';
import { useGroupModal } from '../../hooks/useGroupModal';


// Check available images in source
import joImg from '@/assets/images/group/jo.png';
import koImg from '@/assets/images/group/ko.png';
import zoImg from '@/assets/images/group/zo.png';

const AVAILABLE_GROUP_IMAGES = [
  { id: 'jo', src: joImg, alt: 'Jo Group' },
  { id: 'ko', src: koImg, alt: 'Ko Group' },
  { id: 'zo', src: zoImg, alt: 'Zo Group' },
];

type CreateGroupModalProps = {
  open: boolean;
  onClose: () => void;
  onBack?: () => void;
};

/**
 * 建立群組 Modal
 */
export const CreateGroupModal: FC<CreateGroupModalProps> = ({
  open,
  onClose,
  onBack,
}) => {
  const { createGroup, switchGroup, isGroupsLoading: isLoading } = useGroupModal();

  const [name, setName] = useState('');
  const [selectedImage, setSelectedImage] = useState(
    AVAILABLE_GROUP_IMAGES[0].src,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const newGroup = await createGroup({
        name,
      });

      if (newGroup && newGroup.id) {
        switchGroup(newGroup.id);
      }
    } catch (error) {
      console.error('Failed to create group:', error);
    }

    // Reset form
    setName('');
    setSelectedImage(AVAILABLE_GROUP_IMAGES[0].src);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-none w-full h-full p-0 rounded-none border-0 sm:rounded-none !fixed !left-0 !top-0 !translate-x-0 !translate-y-0 !duration-300 data-[state=open]:!slide-in-from-left-full data-[state=closed]:!slide-out-to-left-full data-[state=closed]:!zoom-out-100 data-[state=open]:!zoom-in-100 data-[state=closed]:!slide-out-to-top-0 data-[state=open]:!slide-in-from-top-0">
        <div className="flex flex-col h-full bg-stone-50">
          <DialogHeader className="flex-shrink-0 px-4 py-3 bg-white border-b border-stone-100 flex flex-row items-center justify-center relative">
            {onBack && (
              <button
                onClick={onBack}
                className="absolute left-4 p-1 -ml-1 text-stone-600"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            <DialogTitle className="text-lg font-bold text-stone-900">
              建立新群組
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="groupName"
                  className="text-sm font-medium text-stone-700"
                >
                  群組名稱
                </label>
                <Input
                  id="groupName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="輸入群組名稱"
                  className="h-12 rounded-xl"
                  required
                />
              </div>

              {/* 群組圖片選擇 */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-stone-700">
                  選擇群組圖片
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {AVAILABLE_GROUP_IMAGES.map((img) => (
                    <button
                      key={img.id}
                      type="button"
                      className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                        selectedImage === img.src
                          ? 'border-[#EE5D50] ring-2 ring-[#EE5D50]/20'
                          : 'border-transparent hover:border-stone-200'
                      }`}
                      onClick={() => setSelectedImage(img.src)}
                    >
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="w-full h-full object-contain p-2"
                      />
                      {selectedImage === img.src && (
                        <div className="absolute top-1 right-1 bg-[#EE5D50] text-white rounded-full p-0.5">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-4">
                <Button
                  type="submit"
                  disabled={isLoading || !name.trim()}
                  className="w-full bg-[#EE5D50] hover:bg-[#D94A3D] text-white h-12 text-base rounded-xl shadow-sm"
                >
                  {isLoading ? '建立中...' : '建立群組'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
