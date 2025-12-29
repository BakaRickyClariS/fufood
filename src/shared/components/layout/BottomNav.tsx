'use client';

import * as React from 'react';
import { Home, Grid2x2Plus, Refrigerator, Bell, ScanLine } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/nav-tabs';
import { useNavigate, useLocation } from 'react-router-dom';

export type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  isFab?: boolean;
};

const defaultNavItems: NavItem[] = [
  { id: 'home', label: '首頁', icon: <Home className="w-5 h-5" />, href: '/' },
  {
    id: 'planning',
    label: '規劃',
    icon: <Grid2x2Plus className="w-5 h-5" />,
    href: '/planning',
  },
  {
    id: 'foodinput',
    label: '',
    icon: <ScanLine className="w-6 h-6" />,
    href: '/upload',
    isFab: true,
  },
  {
    id: 'inventory',
    label: '庫存',
    icon: <Refrigerator className="w-5 h-5" />,
    href: '/inventory',
  },
  {
    id: 'notifications',
    label: '通知',
    icon: <Bell className="w-5 h-5" />,
    href: '/notifications',
  },
];

// import { useCameraControl } from '@/modules/food-scan/contexts/CameraContext'; // Removed
// import { useCameraControl } from '@/modules/food-scan/contexts/CameraContext'; // Removed

const MobileBottomNav = ({
  items = defaultNavItems,
}: {
  items?: NavItem[];
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  // const cameraControl = useCameraControl(); // Removed Context usage

  const activeTab = React.useMemo(() => {
    // 1. 嘗試完全匹配
    const exactMatch = items.find((i) => i.href === location.pathname);
    if (exactMatch) return exactMatch.id;

    // 2. 嘗試前綴匹配 (排除根路徑 '/')
    // 例如: /inventory/category/123 應該匹配 /inventory
    const prefixMatch = items.find(
      (i) => i.href !== '/' && location.pathname.startsWith(i.href),
    );
    if (prefixMatch) return prefixMatch.id;

    // 3. 如果是已知的其他路由 (如 settings)，返回空字串 (無選中狀態)
    const knownOtherPaths = ['/settings', '/recipe', '/auth'];
    const isOtherPath = knownOtherPaths.some(p => location.pathname.startsWith(p));
    if (isOtherPath) return '';

    // 4. 默認回傳第一個 (通常是首頁)
    return items[0].id;
  }, [location.pathname, items]);

  return (
    <div className="bottom-nav-wrapper fixed bottom-0 left-0 right-0 z-40">
      {/* 外層容器：陰影 + 圓角只在上方 + 裁切 */}
      <div className="rounded-t-3xl overflow-hidden shadow-[0_-1px_12px_rgba(0,0,0,0.25)]">
        <div className="bg-white dark:bg-slate-950">
          <Tabs
            value={activeTab}
            onValueChange={(value) => {
              const item = items.find((i) => i.id === value);
              if (item) navigate(item.href);
            }}
            className="w-full"
          >
            <TabsList
              className="w-full grid gap-0 rounded-none h-20 bg-white dark:bg-slate-950"
              style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}
            >
              {items.map((item) => {
                // FAB 按鈕跳過，在下面單獨渲染
                if (item.isFab) {
                  return (
                    <TabsTrigger
                      key={item.id}
                      value={item.id}
                      className="py-2 px-2 relative"
                      disabled
                    >
                      {/* 佔位符，防止位移 */}
                    </TabsTrigger>
                  );
                }

                const isActive = activeTab === item.id;

                return (
                  <TabsTrigger
                    key={item.id}
                    value={item.id}
                    className="py-2 px-2 relative"
                  >
                    {/* 普通導航項 - Icon 和文字分開樣式 */}
                    <div className="flex flex-col gap-1 items-center justify-center w-full">
                      {/* Icon - Active 時有背景 */}
                      <div
                        className={`
                          flex items-center justify-center w-full rounded-xl p-2 transition-all duration-200
                          ${
                            isActive
                              ? 'bg-primary-100 dark:bg-primary-900 text-primary-500 dark:text-primary-200'
                              : 'bg-transparent text-gray-600 dark:text-gray-400'
                          }
                        `}
                      >
                        {item.icon}
                      </div>

                      {/* 文字 - 只改顏色，沒有背景 */}
                      {item.label && (
                        <span
                          className={`
                            text-xs font-medium transition-colors duration-200
                            ${
                              isActive
                                ? 'text-primary-500 dark:text-primary-200'
                                : 'text-gray-600 dark:text-gray-400'
                            }
                          `}
                        >
                          {item.label}
                        </span>
                      )}
                    </div>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* FAB 按鈕：絕對位置，不受 overflow-hidden 影響 */}
      {(() => {
        const fabItem = items.find((i) => i.isFab);
        if (!fabItem) return null;

        return (
          <button
            onClick={() => {
              navigate(fabItem.href);
            }}
            className="
              absolute
              left-1/2
              transform
              -translate-x-1/2
              -top-2
              w-20
              h-20
              rounded-full
              bg-[radial-gradient(circle_at_30%_30%,#f58274,#ec5b4a)]
              hover:bg-[radial-gradient(circle_at_30%_30%,#f67d6c,#e04c3b)]
              flex
              items-center
              justify-center
              text-black
              border-4
              border-primary-200
              transition-all
              duration-200
              active:scale-95
              z-50
            "
          >
            {fabItem.icon}
          </button>
        );
      })()}
    </div>
  );
};

export default MobileBottomNav;
