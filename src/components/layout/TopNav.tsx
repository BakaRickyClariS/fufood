'use client';

import { Bell, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';

export default function TopNav() {
  const [selectedHome, setSelectedHome] = useState('My Home');
  // const [userLevel, setUserLevel] = useState('PRO'); // 可改為 FREE, PREMIUM 等

  const homeOptions = [
    { label: 'My Home', value: 'My Home' },
    { label: 'JJ Home', value: 'JJ Home' },
    { label: 'Ricky Home', value: 'Ricky Home' },
  ];

  return (
    <div className="sticky top-0 left-0 right-0  dark:bg-slate-800 z-40 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        {/* 左側：會籍等級標籤 */}
        <div className="flex-shrink-0">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
            {/* {userLevel} */}PRO
          </span>
        </div>

        {/* 中間：標題 + 下拉選單 */}
        <div className="flex-1 flex items-center justify-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-1 text-lg font-semibold px-2"
              >
                {selectedHome}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="w-48">
              {homeOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSelectedHome(option.label)}
                  className={
                    selectedHome === option.label
                      ? 'bg-gray-100 dark:bg-gray-700'
                      : ''
                  }
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem className="border-t mt-2 pt-2 text-blue-600">
                + 新增群組
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 右側：通知 + 用戶 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  R
                </div>
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
