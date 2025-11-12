'use client';

import * as React from 'react';
import { Home, Plus, Settings } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate, useLocation } from 'react-router-dom';

export type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
};

const defaultNavItems: NavItem[] = [
  { id: 'home', label: '首頁', icon: <Home className="w-5 h-5" />, href: '/' },
  {
    id: 'add',
    label: '新增',
    icon: <Plus className="w-5 h-5" />,
    href: '/add',
  },
  {
    id: 'settings',
    label: '設定',
    icon: <Settings className="w-5 h-5" />,
    href: '/settings',
  },
];

export default function BottomNav({
  items = defaultNavItems,
}: {
  items?: NavItem[];
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = React.useMemo(
    () => items.find((i) => i.href === location.pathname)?.id || items[0].id,
    [location.pathname, items],
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-white dark:bg-slate-950 md:hidden z-50">
      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          const item = items.find((i) => i.id === value);
          if (item) navigate(item.href);
        }}
        className="w-full"
      >
        <TabsList
          className="w-full grid gap-0 rounded-none h-16"
          style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}
        >
          {items.map((item) => (
            <TabsTrigger
              key={item.id}
              value={item.id}
              className="flex flex-col gap-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600"
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
