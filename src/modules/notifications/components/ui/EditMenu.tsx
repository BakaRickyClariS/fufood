/**
 * 編輯選單元件
 *
 * 提供「選取」和「全選」功能
 */
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

interface EditMenuProps {
  onSelectMode: () => void;
  onSelectAll: () => void;
}

export const EditMenu = ({ onSelectMode, onSelectAll }: EditMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-3 bg-white hover:bg-white text-gray-900 font-bold rounded-lg shadow-sm border border-transparent hover:border-gray-200 transition-all text-sm"
        >
          編輯
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32 p-1">
        <DropdownMenuItem
          onClick={onSelectMode}
          className="cursor-pointer font-bold justify-center py-2 text-gray-700 bg-gray-100/50 mb-1 rounded-md"
        >
          選取
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onSelectAll}
          className="cursor-pointer font-bold justify-center py-2 text-gray-700"
        >
          全選
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
