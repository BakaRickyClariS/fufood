import { useState } from 'react';
import OverviewPanel from '@/modules/inventory/components/layout/OverviewPanel';
import CommonItemsPanel from '@/modules/inventory/components/layout/CommonItemsPanel';
import ExpiredRecordsPanel from '@/modules/inventory/components/layout/ExpiredRecordsPanel';
import SettingsPanel from '@/modules/inventory/components/layout/SettingsPanel';
import { Tabs, type Tab } from '@/shared/components/ui/animated-tabs';

type MainTabId = 'overview' | 'settings';
type SubTabId = 'all' | 'common' | 'expired';

const TabsSection = () => {
  const [mainTab, setMainTab] = useState<MainTabId>('overview');
  const [subTab, setSubTab] = useState<SubTabId>('all');

  const mainTabs: Tab<MainTabId>[] = [
    { id: 'overview', label: '庫存總覽' },
    { id: 'settings', label: '管理設定' },
  ];

  const subTabs: Tab<SubTabId>[] = [
    { id: 'all', label: '總覽' },
    { id: 'common', label: '常用項目' },
    { id: 'expired', label: '過期紀錄' },
  ];

  return (
    <section
      className={mainTab === 'settings' ? 'bg-neutral-100 min-h-screen' : ''}
    >
      <div className="max-w-layout-container mx-auto">
        {/* 主 Tabs */}
        <Tabs
          variant="underline"
          tabs={mainTabs}
          activeTab={mainTab}
          onTabChange={setMainTab}
          animated
        />
        <div className="mx-4">
          {mainTab === 'overview' && (
            <>
              <Tabs
                variant="pill"
                tabs={subTabs}
                activeTab={subTab}
                onTabChange={setSubTab}
                animated
                className="mt-8 mb-6"
              />
              {subTab === 'all' && <OverviewPanel />}
              {subTab === 'common' && <CommonItemsPanel />}
              {subTab === 'expired' && <ExpiredRecordsPanel />}
            </>
          )}
          {mainTab === 'settings' && <SettingsPanel />}
        </div>
      </div>
    </section>
  );
};

export default TabsSection;
