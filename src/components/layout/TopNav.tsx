'use client';

import { Bell, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function TopNav() {
  return (
    <div className="sticky top-0 left-0 right-0 bg-pink-100 dark:bg-slate-800 border-b md:hidden z-40 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* 左：選單按鈕 */}
        <Button variant="ghost" size="icon">
          <Menu className="w-5 h-5" />
        </Button>

        {/* 中：標題 */}
        <h1 className="text-lg font-semibold flex-1 text-center">My Home</h1>

        {/* 右：通知和使用者選單 */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>個人資料</DropdownMenuItem>
              <DropdownMenuItem>設定</DropdownMenuItem>
              <DropdownMenuItem>登出</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
