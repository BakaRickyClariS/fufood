import { useState } from 'react';
import { Tabs } from '@/shared/components/ui/animated-tabs';
import {
  NotificationItem,
  type NotificationType,
} from './components/NotificationItem';

// Tab 類型定義
type NotificationTabId = 'stock' | 'inspiration' | 'official';

const NOTIFICATION_TABS: { id: NotificationTabId; label: string }[] = [
  { id: 'stock', label: '食材管家' },
  { id: 'inspiration', label: '靈感生活' },
  { id: 'official', label: '官方公告' },
];

// Mock Data Types
type NotificationGroup = {
  date: string;
  items: {
    id: string;
    type: NotificationType;
    title: string;
    description: string;
  }[];
};

// Mock Data
const STOCK_DATA: NotificationGroup[] = [
  {
    date: '2026/01/05',
    items: [
      {
        id: '1',
        type: 'stock',
        title: 'AI 辨識完成！食材已入庫',
        description: '剛買的食材已安全進入庫房，快去看看庫房！',
      },
      {
        id: '2',
        type: 'stock',
        title: '最後救援！檸檬塔 今天到期',
        description:
          '就是今天！它是冰箱裡最需要被吃掉的，現在把它變成美味料理，放進肚子裡吧！',
      },
    ],
  },
  {
    date: '2026/01/04',
    items: [
      {
        id: '3',
        type: 'shared',
        title: '生烏龍麵 快沒了，該補貨囉！',
        description:
          '報告！庫存已低於安全水位，小隊已自動幫你加入「共享採買清單」，下班順路帶它回家吧！',
      },
    ],
  },
  {
    date: '2026/01/03',
    items: [
      {
        id: '4',
        type: 'stock',
        title: '搶救倒數！檸檬塔 快過期了',
        description:
          '冰箱小隊發現它只剩 2 天就要變垃圾了！別讓錢錢飛走，快點我看看「智慧食譜」怎麼變美味！',
      },
      {
        id: '5',
        type: 'stock',
        title: '阿福發現，白花椰菜 正在變老...',
        description:
          '蔬菜鮮度正在下降中！為了營養與口感，今天優先料理它們吧，守護你的零浪費生活！',
      },
    ],
  },
];

const INSPIRATION_DATA: NotificationGroup[] = [
  {
    date: '2026/01/05',
    items: [
      {
        id: 'i1',
        type: 'system', // Use system type but renders without tag effectively
        title: '今晚吃什麼？我有靈感！',
        description:
          '冰箱還有大陸A菜 和 生烏龍麵，試試這道「20分鐘快速上菜」吧，今晚就要吃得營養又輕鬆！',
      },
    ],
  },
  {
    date: '2026/01/03',
    items: [
      {
        id: 'i2',
        type: 'system',
        title: '週末清冰箱，釋放新空間！',
        description:
          '清掉舊食材，才能裝下週的新鮮！點我看還有哪些隱藏隊員需要被優先消耗。',
      },
    ],
  },
];

const OFFICIAL_DATA: NotificationGroup[] = [
  {
    date: '2026/01/05',
    items: [
      {
        id: 'o1',
        type: 'system',
        title: '服務維護通知',
        description:
          '為了提供更穩定的 100GB 雲端空間，我們將於 [日期/時間] 進行短暫維護，敬請見諒。',
      },
      {
        id: 'o2',
        type: 'system',
        title: '冰箱小隊進化了！新功能登場',
        description:
          '我們優化了 AI 辨識速度與介面體驗，快來更新 App，感受更流暢的智慧管理吧！',
      },
    ],
  },
  {
    date: '2026/01/03',
    items: [
      {
        id: 'o3',
        type: 'system',
        title: '給小隊員的驚喜更新',
        description:
          '發現新版本！修復了已知問題並加入更多可愛插畫，快去更新，讓管理冰箱變得更有趣。',
      },
    ],
  },
];

const NotificationsPage = () => {
  const [activeTab, setActiveTab] = useState<NotificationTabId>('stock');

  const renderGroupedList = (data: NotificationGroup[]) => {
    return (
      <div className="space-y-0">
        {data.map((group) => (
          <div key={group.date}>
            {/* Date Header */}
            <div className="bg-gray-100 px-4 py-2 text-sm font-bold text-gray-900 border-b border-gray-200">
              {group.date}
            </div>
            {/* Items */}
            {group.items.map((item) => (
              <NotificationItem
                key={item.id}
                {...item}
                onClick={() => console.log('Clicked notification:', item.id)}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-24 bg-white">
      {/* Tab Navigation header */}
      <div className="sticky top-0 z-30 bg-neutral-100 pt-6 pb-4 px-4">
        <Tabs
          variant="pill"
          tabs={NOTIFICATION_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* Tab Content */}
      <div className="bg-white">
        {activeTab === 'stock' && renderGroupedList(STOCK_DATA)}
        {activeTab === 'inspiration' && renderGroupedList(INSPIRATION_DATA)}
        {activeTab === 'official' && renderGroupedList(OFFICIAL_DATA)}
      </div>
    </div>
  );
};

export default NotificationsPage;
